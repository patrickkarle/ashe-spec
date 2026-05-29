# ADR-003: Invariant Language — JSON Schema + CEL + ASHE State-Machine Notation

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-22 |
| Decider | PK + Claude |
| Touches | Protocol |

## Context

Axiom A3 (Integrity) requires that system invariants be exposed to agents as binding constraints in a machine-readable language, AND that the kernel structurally reject operations that would violate declared invariants. This requires a language that is:

- Expressive enough to capture shape constraints, stateless predicates, and behavior-over-time constraints
- LLM-friendly (agents must be able to reason about invariants)
- Runtime-cheap (evaluator must run at op-dispatch time without measurable latency cost)
- Implementable in any language (this is a universal protocol)

## Decision

**Three layers, each addressed with the lightest sufficient tool:**

| Layer | Language | Purpose |
|-------|----------|---------|
| **Shapes** | JSON Schema (draft-2020-12) | Validate request and response payload structure |
| **Stateless predicates** | CEL (Common Expression Language) | Guards on affordances; field-level invariants |
| **Behavior over time** | ASHE state-machine notation (defined in spec) | Legal state transitions; constraints across time |

Composition example:

```jsonc
{
  "id": "INV-001",
  "name": "composition-run-mutual-exclusion",
  "states": ["idle", "compiling", "ready", "running", "completed", "failed"],
  "initial": "idle",
  "transitions": [
    { "from":"ready",   "to":"running",   "trigger":"construct.composition.run",
      "guard":"dispatch.ready == true" },
    { "from":"running", "to":"completed", "trigger":"run-success" }
  ],
  "constraints": [
    { "expr":"count(compositions where state == 'running') <= 1",
      "lang":"cel",
      "violationCode":"INVARIANT_VIOLATION_CONCURRENT_RUNS" }
  ]
}
```

Conformance tiers fall out naturally:

- **Core tier**: JSON Schema only (shape validation)
- **+Invariants tier**: CEL guards on affordances
- **+StateMachines tier**: full transition graphs with constraints

## Consequences

**Positive:**

- LLM reasoning works well across all three — CEL is JS-like, JSON Schema is ubiquitous, state machines are visual/natural
- Implementation cost graded — Core tier is essentially free (JSON Schema everywhere); each higher tier adds discrete cost
- Compositional — complex invariants build from simpler pieces
- Runtime-cheap — CEL evaluates in microseconds; state-machine transitions are table lookups
- **Verifiable at design time AND runtime** — agents reason; kernel enforces at op-dispatch time
- Standards-stack that already won (Kubernetes uses JSON Schema + CEL for CRDs + admission control; statecharts have strong tooling lineage)

**Negative:**

- Three languages instead of one — slightly higher cognitive load for spec readers
- We commit to CEL specifically — locks out alternatives like JSON Logic, JEXL, etc.
- State-machine notation becomes part of the spec — implementer cost is non-zero (~1 page of definition + a state-machine evaluator)
- Doesn't natively express eventual-consistency invariants ("within 5 seconds of X, Y will be true") — would need a `temporal` extension or punt to TLA+ design-time only

**Forecloses:**

- Distributed-system invariants beyond local state (Paxos-level) — referenced as design-time companion only, not baked into the runtime invariant language
- Probabilistic invariants (SLA-style) — explicitly an SLA-layer concern; ASHE invariants are deterministic

## Alternatives Considered

**TLA+ as the runtime language.** Rejected — alien syntax, weak LLM tooling, implementation cost very high (need TLA+ parser/evaluator in every implementation), optimized for design-time not runtime. Spec references TLA+ as a design-time companion only.

**CEL alone (no state machines).** Rejected — CEL is decidable + terminating but lacks temporal operators; can't express "compositionRun transitions runStatus from {running, failed, completed} — never back to idle without intermediate."

**Bespoke "ASHE Invariant Language" (AIL).** Rejected — reinventing languages is a forever job; no ecosystem; standardization risk. State-machine notation is a small bespoke addition (~1 page) — not a whole new language.

**Datalog.** Rejected — rich rule reasoning but less popular in protocol-style use; tooling less mature than CEL; LLMs less fluent in Datalog than CEL.

**OPA/Rego.** Considered — strong policy language. CEL chosen for lighter weight (Rego brings a runtime). Future extension could allow Rego as alternative predicate language for adopters who already use OPA.

## References

- `PARADIGM-v0.md` §4.1 (A3 — Integrity)
- `PROTOCOL-SPEC-v0.5.md` Part IX (Invariant Language)
- `PROTOCOL-SPEC-v0.5.md` §52-55 (JSON Schema profile, CEL profile, state-machine notation, evaluation semantics)
