# ADR-007: Interception-chain pattern as kernel-wide extension model

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-23 |
| Decider | PK + Claude |
| Touches | reference-arch |

## Context

ASHE needs to gate IPC traffic before dispatch — every request crossing the IPC boundary should be subject to ASHE's permission check. The question is *how the gateway calls into ASHE*. Three coupling shapes were on the table:

1. **Hardcoded call** — gateway directly invokes `kernel.asheManagerDM.permissionEnforcer.check(...)` at the dispatch point. Simple but tightly couples gateway to ASHE.
2. **Generic interception capability** — gateway exposes a "pre-dispatch interceptor" slot that any registered service can fill. ASHE is the first consumer but not the only possible one.
3. **Capability tokens** — ASHE issues signed tokens at handshake; gateway validates cryptographically per-request without a per-request callout. Faster but harder to revoke; v1 optimization, not v0 design.

A separate but related question: how does ASHE *itself* compose its evaluators internally? That question is covered by ADR-008, but the answer turned out to be the same shape — a chain/graph of registered consumers behind a uniform contract.

The architectural opportunity: if the gateway-to-ASHE coupling uses the same pattern as ASHE's internal evaluator composition, the kernel gains a single, consistent extension model. Future consumers (e.g., audit-only inspectors, governance DMs, runtime observability hooks) plug in the same way.

## Decision

**The IPC gateway exposes a generic pre-dispatch interception capability with a uniform contract.** ASHE is the first consumer; the gateway has no special knowledge of ASHE beyond the contract. The same registered-consumers-of-a-typed-contract pattern is used for ASHE's internal evaluator composition (ADR-008), establishing it as the kernel's standard extension model.

The contract for any interception consumer:

```
interceptor.check({
  session, service, operation, params, requestId, idempotencyKey?
}) → Promise<{ allowed: boolean, error?: ErrorEnvelope }>
```

Obligations the gateway depends on: <5ms p99 latency; deterministic; idempotent (no dispatch-state mutation); async-safe; throwable but contained.

**v0 implementation acknowledges a deliberate shortcut**: the gateway hardcodes the interceptor reference to `kernel.asheManagerDM.permissionEnforcer` because v0 has exactly one consumer. The full registered-chain abstraction is deferred to v1 when a second consumer exists. The contract and structural shape are forward-compatible with the chain abstraction; the call site change is a small refactor when the second consumer materializes.

Documented in the reference implementation's internal design notes (details available upon engagement).

## Consequences

**What becomes easier**:

- Adding future kernel-side consumers (audit, governance, observability) — they implement the same contract and register without modifying the gateway
- Reasoning about the gateway — the interception capability is a single, documented seam
- Replacing ASHE with an alternative implementation — anything satisfying the contract works
- Symmetric mental model with ASHE-internal evaluator composition — one pattern, two layers

**What becomes harder**:

- v0 carries a known structural debt (hardcoded single consumer) — must be refactored to a registered chain when a second consumer arrives
- Naming/discovery of who-can-register is informal in v0 — formalized when the chain abstraction lands

**What becomes possible**:

- Future kernel extension model: ANY new cross-cutting concern (rate-limiting, debugging, metrics injection, traffic-shaping) plugs in as a registered pre-dispatch interceptor
- Composable security policy: multiple interceptors can fire in sequence, each veto-capable, decision aggregated by the gateway

**What becomes impossible** (intentionally):

- Per-request gateway-internal logic that only ASHE could provide — keeping ASHE behind the contract means the gateway cannot grow ASHE-specific code paths

## Alternatives Considered

**1. Hardcoded call to ASHE.** Simpler v0; immediately removed the abstraction overhead. Rejected because: (a) other consumers exist on the roadmap (audit, observability); (b) hardcoding makes the gateway depend on ASHE's specific API shape, requiring gateway edits whenever ASHE evolves; (c) violates the kernel's "domain managers are pluggable" philosophy at the gateway layer.

**2. Full middleware framework from day 1.** Build complete chain abstraction (ordered registration, mutation, conditional routing, etc.) before any consumer exists. Rejected because: (a) over-engineering for the v0 single-consumer reality; (b) hard to design correctly without real second consumer to validate; (c) violates Continuum's "build the next slice, not the next mile" discipline.

**3. Capability tokens.** ASHE issues per-session signed tokens encoding allowed operations; gateway validates cryptographically without per-request callout. Rejected as v0 design because: (a) revocation complexity (5-second propagation requirement clashes with token lifetime); (b) token sizes grow with scope complexity; (c) less context-aware (can't make decisions based on current state). Worth revisiting as v1 optimization for the hot path while keeping the interception chain for slow-path / sensitive operations.

**4. Aspect-oriented weaving at DM-registration time.** ASHE wraps DMs at boot, intercepting method calls per-DM. Rejected because: (a) couples ASHE to every DM's surface; (b) breaks if DMs are dynamically registered; (c) doesn't address in-process bypass — DM-to-DM calls would still skip ASHE.

**5. Bus + veto.** All IPC becomes events on a message bus; ASHE subscribes as a veto-capable observer. Rejected because: (a) bus overhead unjustified for synchronous dispatch; (b) "veto" semantics on asynchronous bus subscribers are race-prone; (c) Continuum doesn't currently have a kernel-wide event bus and building one for this is disproportionate.

## Related decisions

- ADR-008 — Validation graph with default-to-tiny-ONNX evaluators (symmetric application of the same pattern to ASHE's internal composition)
- Forward: v1 refactor to registered-interceptor-chain abstraction when second consumer arrives (not yet ADR'd)
