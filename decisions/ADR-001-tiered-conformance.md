# ADR-001: Tiered Conformance with Full-Tier Reference Implementation

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-22 |
| Decider | PK + Claude |
| Touches | Protocol, paradigm |

## Context

ASHE is intended as a universal protocol. Implementing the full protocol — handshake, session, blueprint with 15 layers, invariant language, recipes, history query, agent context store, conformance test suite — is substantial work. If conformance is all-or-nothing, the adoption bar is high enough that many candidate implementers will not start. If conformance is too loose (everyone declares conformance with minimal effort), the standard becomes meaningless.

We also need to commit ourselves: does Continuum (the first reference implementation) implement the full protocol from day 1, or does it ship a minimum subset and grow?

## Decision

**Tiered conformance.** Six named tiers:

1. **Core** (required for any conformance claim) — handshake, session, grant enforcement, affordance catalog with JSON Schema, error vocabulary, audit log
2. **+Continuity** — session resume, blueprint ETag caching, agent context store
3. **+Recipes** — recipe schema, recipe library, recipe execution semantics
4. **+History** — history query API
5. **+Invariants** — CEL guard language, invariant declarations on affordances
6. **+StateMachines** — state-machine notation, transition graphs with guards

Implementations declare which tiers they support in the WELCOME response. Agents adjust expectations accordingly. A conformance claim might read: "ASHE-1.0 Core + Continuity + Invariants" — meaning the system supports those three tiers but not Recipes, History, or StateMachines.

**Continuum (this reference implementation) implements the full tier always.** No partial conformance for the canonical implementation. This sets the high-water mark and gives the spec a complete worked example.

## Consequences

**Positive:**

- Adoption is graduated; implementers pick depth matching their resources
- The standard is verifiable (when paired with the conformance test suite — see ADR-005)
- Continuum sets a clear bar for "what full conformance looks like"
- Adopters can grow into higher tiers over time without re-architecting

**Negative:**

- The spec has to accommodate partial conformance — every feature must declare which tier it belongs to and what happens when an interacting party lacks that tier
- More test surface (one test suite per tier)
- "Conformance" becomes a multi-dimensional claim instead of a binary one — slightly more cognitive load

**Forecloses:**

- Pure all-or-nothing conformance (would be simpler but raises adoption bar too high)

## Alternatives Considered

**All-or-nothing conformance.** Rejected — adoption bar too high for many candidate systems; would have the standard succeed at zero substantive implementations beyond Continuum.

**Continuum implements minimum subset, grows over time.** Rejected — PK explicitly directed "implementation full at all times." This serves three purposes: (1) demonstrates full conformance is achievable; (2) gives the spec a complete worked example; (3) provides a canonical implementation other implementers can read for clarification when spec is ambiguous.

**Continuum implements above-spec features as preview/experimental.** Considered — Continuum may innovate beyond the spec, but those features SHOULD NOT count toward conformance; they're substrate-specific. Spec extension mechanism (extensionLayers in blueprint root manifest) is the formal path for this.

## References

- `PARADIGM-v0.md` §8 (Tiered Conformance)
- `PROTOCOL-SPEC-v0.5.md` §4 (Conformance model)
- `PROTOCOL-SPEC-v0.5.md` Part XIII (Conformance test suite)
