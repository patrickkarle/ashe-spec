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
    examples/structural-reference-adapter.ts  # illustrative correctly-applied SUT
  tests/
    group-w-what.test.ts                  # object-capability primitive
    group-h-how.test.ts                   # structural mechanism
    group-n-when.test.ts                  # at construction
    group-r-where.test.ts                 # concentrated scope
```

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

# With no adapter configured, every group SKIPS (the suite makes no claim about a
# SUT that has not been wired in):
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
