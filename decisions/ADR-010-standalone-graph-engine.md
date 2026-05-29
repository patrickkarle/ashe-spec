# ADR-010: Standalone graph engine for ASHE evaluator composition

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-23 |
| Decider | PK + Claude |
| Touches | reference-arch |
| Supersedes | ADR-008 §1 (engine-reuse aspect only; all other ADR-008 commitments remain in force) |

## Context

ADR-008 §1 committed to reusing Continuum's existing `phor-graph-scheduler` (the engine that walks Construct compositions) for ASHE's evaluator-graph execution. The reasoning was architectural cohesion — one graph engine, many uses; avoid bespoke infrastructure.

This premise was incorrect. `phor-graph-scheduler` is implemented inside the Construct domain manager's subsystem tree and is not exposed as a reusable kernel-level utility. ASHE cannot import it without either (a) creating a cross-DM dependency that violates the kernel's DM-isolation principle, or (b) extracting it into a shared library — a substantial refactor of Construct that is out of scope for ASHE's v1 work.

The forcing function: ASHE v1 needs an executable graph engine. The two paths are:

1. Refactor `phor-graph-scheduler` out of Construct into a shared kernel utility location as a shared utility, then both Construct and ASHE depend on it
2. Implement a standalone graph engine inside ASHE's own subsystem tree, with ASHE owning its execution surface end-to-end

Option (1) widens v1 scope significantly: it requires understanding Construct's coupling to the scheduler, designing the extraction without breaking Construct, validating the refactor doesn't regress Construct tests, and aligning the abstraction with what ASHE needs (which may differ from Construct's needs). All before ASHE can begin its own work.

Option (2) keeps v1 scope tight and preserves ASHE's self-contained property — ASHE's behavior is fully described by code inside `ashe-subsystems/`, not by code spread across DMs.

## Decision

**ASHE v1 implements its own standalone graph engine in an ASHE-internal subsystem location (per the reference implementation). ASHE MUST NOT depend on Construct's `phor-graph-scheduler` or any other graph engine outside the ASHE subsystem tree.**

The ASHE graph engine MAY take *design inspiration* from `phor-graph-scheduler` (proven patterns for directed-graph execution, conditional routing, parallel fan-out) but MUST be a separate implementation that ASHE owns and tests.

The engine MUST satisfy all execution requirements declared in REQUIREMENTS-v1.md (conditional routing, optional parallel fan-out, topology validation, deterministic execution, audit trace capture) — but the implementation is ASHE's responsibility, not a borrowed one.

If at a future date a kernel-level graph utility emerges (e.g., Construct's scheduler is refactored into a shared kernel utility location), ASHE MAY migrate to it as a separate decision. ADR-010 commits ASHE to *not depending on cross-DM internals*, not to *never sharing utilities that become kernel-level*.

## Consequences

**What becomes easier**:

- ASHE remains self-contained — its behavior is fully described by code under `ashe-subsystems/`
- v1 scope stays tight — no Construct refactor blocking ASHE work
- ASHE's engine can be optimized specifically for evaluator-graph patterns (small graphs, conditional routing dominant, predictable node types) without compromising for Construct's different patterns (large compositions, dynamic structure)
- ASHE's test suite is independent — no Construct dependency to bring up before testing
- Independent versioning — ASHE engine can evolve without coordinating with Construct

**What becomes harder**:

- Two graph engines in the kernel — `phor-graph-scheduler` (Construct) and ASHE's standalone engine. This is architectural duplication; the long-term direction may favor consolidation via kernel-level extraction
- ASHE engine is new code requiring its own correctness validation — Construct's engine is battle-tested; ASHE's must earn that trust
- Patterns proven in `phor-graph-scheduler` need to be re-validated in ASHE's implementation rather than assumed-correct from reuse

**What becomes possible**:

- ASHE-specific engine optimizations (interception-chain shortcuts, evaluator-result caching by request hash, etc.) that wouldn't fit a generic shared utility
- ASHE can deploy in contexts where Construct is not present (e.g., kernel profiles that exclude Construct DM) — the engine ships with ASHE
- Future kernel-level extraction (if/when both engines mature and converge on common patterns) becomes a clean, evidence-driven decision rather than a speculative one

**What becomes impossible** (intentionally):

- Cross-DM dependency from ASHE on Construct internals — preserves DM isolation
- Hidden coupling where ASHE's behavior depends on Construct's scheduler version

## Alternatives Considered

**1. Refactor `phor-graph-scheduler` out of Construct into a shared kernel utility location.** Rejected for v1 scope: significant Construct refactor required first, blocking ASHE work; risk of regressing Construct in pursuit of an abstraction that may not fit both consumers cleanly. Reasonable to revisit as a future decision once both engines have matured and patterns have converged in evidence.

**2. Import Construct's scheduler as a cross-DM dependency without refactoring.** Rejected: violates DM-isolation; creates fragile coupling (Construct refactors break ASHE); audit/debug becomes cross-DM ("which subsystem of which DM produced this behavior?").

**3. Use an off-the-shelf graph library (e.g., npm packages).** Rejected: adds external dependency to a security-critical kernel component; verification burden (third-party code in the gate path); kernel A+ prefers in-tree implementations for core utilities.

**4. Implement evaluator composition as a flat sequential chain (no graph engine).** Rejected: forecloses conditional routing, parallel evaluation, path-dependent decisions — all of which ADR-008 establishes as architectural commitments and which REQUIREMENTS-v1.md REQ-G-004/005 enforce. Without these, the graph-as-composition decision is hollow.

## Related decisions

- ADR-008 — Validation graph with default-to-tiny-ONNX evaluators (this ADR amends §1 only; ADR-008's other commitments stand)
- REQUIREMENTS-v1.md REQ-G-001 (standalone engine required), REQ-G-002 (graph definition format), REQ-G-004 (conditional routing), REQ-G-005 (parallel fan-out)
- ARCHITECTURE.md §17.2 (revised to reflect standalone engine per this ADR)
- Future: if `phor-graph-scheduler` is ever extracted as a shared kernel graph-engine utility, a follow-on ADR may revisit ASHE's engine choice
