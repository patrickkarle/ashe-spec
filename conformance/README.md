# ASHE Conformance Suite

The spec's runnable arm. Where the prose says an implementation "MUST," this is where
that requirement becomes a test an implementation can pass or fail.

**v0.1 ships one gate: the weightlessness gate of [ADR-020](../decisions/ADR-020-weightlessness-proper-application-conformance.md).**
A weightlessness claim is conformant only under *proper application* — the
object-capability primitive (**what**), applied structurally (**how**), at
construction (**when**), on the dominant path (**where**). The suite turns those four
facets into four conjunctive test groups; all four must pass.

## Layout

```
conformance/
  src/
    adapter.ts                            # the contract a SUT implements (the four facets)
    manifest.ts                           # language-neutral test definitions (W/H/N/R)
    setup.ts                              # loads the adapter named by $ASHE_CONFORMANCE_ADAPTER
    protocol/                             # nascent reference implementation (see below)
      capability.ts                       #   unforgeable object-capabilities + attenuable sets
      actor.ts                            #   principals; structural cascade attenuation
      lease.ts                            #   boundary-amortized standing authority
      tier.ts                             #   risk-tier classification (A/B routine, C boundary)
      mediation.ts                        #   structural interception point (ADR-007)
      audit.ts                            #   tamper-evident audit-by-construction (hash chain)
      intent.ts                           #   declare-once intent reconciliation (VISION §6)
    examples/structural-reference-adapter.ts  # correctly-applied SUT, built on protocol/
  tests/
    protocol/*.test.ts                    # unit tests for the primitives (always run)
    group-w-what.test.ts                  # object-capability primitive
    group-h-how.test.ts                   # structural mechanism
    group-n-when.test.ts                  # at construction
    group-r-where.test.ts                 # concentrated scope
```

## `src/protocol/` — the nascent reference implementation

The example adapter is no longer a toy: it delegates to real protocol primitives in
`src/protocol/`, the embryonic in-memory reference implementation of ASHE's
object-capability core. These are the genuine primitives, exercised both by their own
unit tests and (via the adapter) by the weightlessness gate:

- **`capability.ts`** — capabilities are *unforgeable* (the mint token is module-private;
  `new Capability(...)` from outside throws). `CapabilitySet.attenuate()` can only drop
  authority — there is no `grant`/`union`, so amplification is *unconstructable*, not merely checked.
- **`actor.ts`** — a principal holds a set and nothing ambient; `spawn()` attenuates, so a
  sub-actor exceeding its parent cannot be built (cascade attenuation, ADR-017).
- **`lease.ts`** — authority is issued at a boundary with a TTL; the cost is paid once, then
  the steady-state path is free (WEIGHTLESS amortization).
- **`tier.ts`** — routine (A/B) vs the deliberate-weight Tier-C boundary.
- **`mediation.ts`** — the interception point (ADR-007), structural: routine held actions pass
  through with no boundary step and byte-identical payload; an unheld capability is `UNNAMEABLE`,
  never `DENIED`. Optionally emits an audit record per decision.
- **`audit.ts`** — append-only, SHA-256 hash-chained audit log (ADR-013 Audit service; ADR-016
  provenance). `verify()` detects any reorder/edit/drop of a sealed record; the local append sits
  off the action's critical path (not a round-trip).
- **`intent.ts`** — declare-once intent reconciliation (VISION §6; ADR-017 C2). An in-scope,
  unexpired action reconciles silently (no prompt); out-of-scope or expired escalates.

## The four groups (ADR-020)

| Group | Facet | Tests | The disqualifying case |
|---|---|---|---|
| **W** | *what* | unnameability, zero-ambient-authority, attenuation | the SUT returns a **DENIED** decision for an unauthorized action (it was nameable and evaluated) |
| **H** | *how* | no-added-step, byte-identity, layer-disclosure | a **literal-zero** claim sits on top of a procedural routine-path check |
| **N** | *when* | construction-order, no-front-gate | disabling ASHE leaves a guarded action **reachable** (it was a removable front gate) |
| **R** | *where* | path-classification, no-uniform-enforcement, friction-frequency | a routine action incurs a round-trip / token / prompt (the 98% gated like the 2%) |

Results are **graded, not binary**: Group H records whether no-delay/no-bandwidth hold
as `literal-zero` (structural, Layer 3/4) or `amortized-small` (procedural, Layer 1,
disclosed) per [ADR-015](../decisions/ADR-015-validation-methodology-and-tiered-claims.md).
A Layer-1 implementation passes honestly; it does not pass by claiming literal-zero.

## Running

```bash
cd conformance
npm install

# Against the illustrative reference adapter — self-verifies the suite is green:
npm run test:example

# Against your implementation: point the env var at a module whose default export
# is an AsheConformanceAdapter (see src/adapter.ts), then:
ASHE_CONFORMANCE_ADAPTER=./path/to/your-adapter.ts npm test

# With no adapter configured, the protocol unit tests still run, and every
# conformance group SKIPS (the suite makes no claim about a SUT that has not been
# wired in):
npm test
```

## Plugging in an implementation

Implement `AsheConformanceAdapter` (`src/adapter.ts`) over your implementation. The
adapter is the only ASHE-specific surface the suite touches; it is the seam between
the language-neutral manifest and a concrete implementation. The four method blocks
map one-to-one to the four facets. `src/examples/structural-reference-adapter.ts` is a
minimal, fully-passing reference — read it as the shape, not as an enforcement engine.

## Status

v0.1, scaffold. The weightlessness gate is the first gate implemented; the
conformance-suite commitments in ADR-001 (tiered conformance), ADR-015 (validation
methodology), and ADR-017 (sealed-workspace suite) are the roadmap for subsequent
gates. The manifest is versioned with the spec so results are comparable across
implementations and across the four ADR-014 enforcement layers.
