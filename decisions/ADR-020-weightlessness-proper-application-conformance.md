# ADR-020: Weightlessness is conformant only under proper application

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-30 |
| Decider | PK + Claude |
| Touches | protocol (primary — defines a conformance gate on the weightlessness claim), reference-arch, paradigm |
| Cited by | WEIGHTLESS.md ("Proper application — the resolving discipline") |
| Builds on | ADR-007 (interception-chain — idempotent, no dispatch-state mutation), ADR-009 (deployment profiles — graceful degradation), ADR-014 (phased enforcement — the Layer 1→4 trajectory along which structural application deepens), ADR-015 (validation methodology — evidence grades for performance claims), ADR-017 (sealed workspace — wall-up-first, `ashe workspace init` as step 1; the frictionlessness mandate) |

## Context

[WEIGHTLESS.md](../WEIGHTLESS.md) names ASHE's central UX promise — "invisible most of the time, explicit only at risk boundaries" — as a single engineering property and states it strictly as **four hard invariants** on the steady-state path: no delay, no bandwidth, no data alteration, no interference. Two (no data alteration, no interference) are already floors — contractual via ADR-007 and constructional via ADR-009/ADR-018. The other two (no delay, no bandwidth) are presented as *targets* reachable only as the enforcement layer deepens toward structural mediation.

The document also names the honest tension: **active enforcement is interference by definition** — the instant ASHE blocks an action it has interfered, and if it blocks synchronously it has delayed. Literal-zero is therefore not claimable for *every* action; it is claimable for pre-authorized actions (the decision was made at issuance, before the action existed) and structurally-bounded denials (the action was never expressible). Weightlessness is the discipline of making those two categories cover the ~98% routine path while deliberately concentrating weight at the ~2% Tier C boundary where interference is the intended function.

What the corpus has *not* until now stated normatively is the **failure mode**: weightlessness is not a mechanism an implementation installs and thereby acquires. It is the default state of a system whose authority boundaries were applied correctly, and it is **forfeited the instant they are applied incorrectly**. A misapplied ASHE is not a lighter middleware — it is just middleware. The property holds or it does not, depending entirely on *how* the boundary was applied. Concretely, the same four invariants collapse under four distinct misapplications:

| Misapplication | Why weight reappears |
|---|---|
| Wrong primitive — permission flags checked against an identity instead of object-capability held-or-absent authority | A lookup runs on every action; an "unauthorized" action is still *nameable*, so it must be evaluated rather than being structurally absent |
| Procedural instead of structural — a check ASHE executes per action instead of the substrate's own mechanism being the boundary | A step sits on the hot path forever; it can be made fast but never literally zero |
| Bolted on instead of built in — a gate placed in front of an already-built system instead of the system being shaped around the boundary at construction | The gate is a check that always runs; nothing was made structurally absent |
| Uniform scope instead of concentrated — the ~98% routine path enforced the same way as the ~2% Tier C boundary | Every routine action becomes a gated action; the amortization that makes weight invisible never happens |

Without a normative gate, an implementation could optimize a per-action check until it is sub-millisecond and claim "weightless." That claim is false in the strict sense the document defines: **a fast check is still a check, still non-zero, still weight.** Weightlessness is not achieved by accelerating the work; it is achieved by applying the boundary such that there is no work on the path that matters. The corpus needs to say so as a conformance requirement, not only as prose.

## Decision

**An ASHE implementation MAY claim the weightlessness property — the four hard invariants of [WEIGHTLESS.md](../WEIGHTLESS.md) on the steady-state path — only if it satisfies all four facets of proper application. The four facets are one indivisible discipline: drop any one and the claim is non-conformant.**

### The four facets (all required, conjunctively)

| Facet | Normative requirement |
|---|---|
| **What — the primitive** | Authority MUST be modeled as an object-capability: *held or absent*, with zero ambient authority. An action the actor is not authorized to take MUST be *unnameable* (no reference to invoke), not *checked-and-denied* (a flag evaluated at action time). |
| **How — the mechanism** | The routine-path boundary MUST be **structural** — the substrate's own existing mechanism (type system at Layer 2, OS capability / MMU at Layer 3, hardware root at Layer 4, per [ADR-014](ADR-014-phased-enforcement-model.md)) — not a **procedural** check ASHE executes as an added step on the path. At Layer 1 (cooperating SDK), where mediation is necessarily procedural, the implementation MUST disclose that no-delay/no-bandwidth are amortized-small rather than literal-zero (see Layer-1 caveat below). |
| **When — the moment** | The boundary MUST be established **at construction**, not bolted on after the fact. Per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md), the wall goes up first and development happens inside it (`ashe workspace init` as step 1, the way `git init` is today). A gate placed in front of an already-built system does not satisfy this facet. |
| **Where — the scope** | Literal-zero MUST be applied to the dominant routine path (the ~98%, Tier A/B), with deliberate weight concentrated at the ~2% Tier C boundary (production deploys, secret access, capability escalation, irreversible destruction) where interference is the intended function. Uniform enforcement that treats the 98% like the 2% does not satisfy this facet. |

The four compose into a single test: **apply the object-capability primitive (what), structurally (how), at construction (when), to the dominant path (where) — and the four invariants hold for free, because the substrate already does the work and the decision was made before the action existed.** Miss any one facet and weight reappears in the corresponding column of the Context table above.

### What the gate forbids

The following claims are **non-conformant** and MUST NOT be made:

- Claiming "weightless" on the basis of an optimized per-action check (a fast check is still a check; this fails the *how* facet).
- Claiming "weightless" for a permission-flag / identity-lookup model (fails the *what* facet — the action remains nameable and must be evaluated).
- Claiming "weightless" for a gate retrofitted in front of an existing system (fails the *when* facet).
- Claiming "weightless" while enforcing the routine path identically to the Tier C boundary (fails the *where* facet).
- Claiming literal-zero (no delay / no bandwidth) at Layer 1 cooperating-SDK enforcement without disclosing that those two invariants are amortized-small, not zero, at that layer (see caveat).

### Layer-1 caveat — honest disclosure, not disqualification

A Layer 1 (cooperating SDK) implementation cannot make the routine-path boundary fully structural — mediation there is procedural and pays a small, sub-millisecond, amortized cost (WEIGHTLESS §1). Such an implementation is **not** thereby barred from the weightlessness *trajectory*; it MUST simply disclose, per [ADR-015](ADR-015-validation-methodology-and-tiered-claims.md) evidence-grade discipline, that no-delay and no-bandwidth are **amortized-small (Layer 1)** rather than **literal-zero (Layer 3/4 structural property)**. The two already-floored invariants (no data alteration via ADR-007, no interference via ADR-009/ADR-018) hold at every layer. The distinction this ADR enforces is between *honest amortized-small under partial structural application* and *false literal-zero claimed for a procedural check*.

## Consequences

**What becomes easier:**

- **The weightlessness claim becomes falsifiable.** "Weightless" stops being a marketing adjective and becomes a four-part conformance predicate that a suite can test (see below). A reviewer can reject a claim by pointing at the failing facet.
- **The middleware failure mode is named and gated.** The most likely way an implementation degenerates — building a fast per-action check and calling it weightless — is now explicitly non-conformant, so it surfaces in conformance review rather than shipping.
- **Layer-1 honesty is structural.** Implementations on the cooperating-SDK layer get a sanctioned, non-disqualifying way to describe their cost (amortized-small, disclosed) instead of either over-claiming or being excluded.

**What becomes harder:**

- **Retrofit claims.** An adopter who bolts ASHE onto an existing system as a front gate cannot claim weightlessness without satisfying the *when* facet — which for legacy systems means the ADR-017 migration path (`ashe workspace import` → role mapping → progressive Layer-2+ engagement), not a one-line wrapper.
- **Single-layer marketing.** A vendor cannot advertise literal-zero on the strength of a benchmarked-fast Layer-1 check; the evidence-grade disclosure is mandatory.

**What becomes possible:**

- **Conformance-graded weightlessness claims.** Combined with ADR-014's layer model and ADR-015's evidence grades, a deployment can state precisely *which* invariants are literal-zero (structural, Layer 3/4) versus amortized-small (procedural, Layer 1), per facet — a graded, defensible claim rather than a binary boast.

**What becomes impossible (intentionally):**

- Claiming weightlessness for any of the four misapplications in the Context table.
- Treating weightlessness as a feature to install rather than a property of correct application — the ADR makes "proper application" the precondition, not an optimization applied afterward.

## Alternatives Considered

**1. Leave "proper application" as prose in WEIGHTLESS.md (design-note principle only).** Rejected. Prose describes the discipline but does not bind a conformance suite; the most common degeneration (fast-check-called-weightless) needs a normative gate to be rejectable, not just discouraged. PK explicitly approved promotion to an ADR.

**2. Make weightlessness a single-lever requirement (pick the strongest facet — structural mechanism — and require only that).** Rejected. The facets are not substitutes; each closes a distinct leak (wrong primitive → lookup; procedural → path step; late → gate; uniform → per-action check). Requiring only *how* would admit a structurally-mediated system that still checks the 98% like the 2% (fails *where*) or that was bolted on (fails *when*). The conjunction is the point.

**3. Disqualify Layer 1 from any weightlessness claim (reserve the term for Layer 3/4 structural enforcement only).** Rejected as too strict and at odds with ADR-014's phased trajectory. Layer 1 is the on-ramp; barring it from the vocabulary entirely would push honest implementers toward over-claiming rather than disclosing. The chosen path — amortized-small with mandatory disclosure — keeps Layer 1 on the trajectory while preventing false literal-zero.

**4. Fold this into ADR-017's frictionlessness commitment rather than a new ADR.** Rejected. ADR-017's frictionlessness mandate governs the *cognitive/friction* axis (no per-action approval prompts) for the sealed-workspace dev pattern; this ADR governs the *whole* weightlessness claim (all four invariants, all axes) across every surface, and defines a conformance gate on the term itself. Different scope; ADR-017 is a `Builds on`, not a container.

## Related decisions

- ADR-007 — Interception-chain pattern. Supplies the **no data alteration** floor (idempotent, no dispatch-state mutation); the *how* facet's procedural-at-Layer-1 mediation rides the interception chain.
- ADR-009 — Deployment profiles. Supplies the **no interference** floor (graceful degradation never fails the host).
- ADR-014 — Phased enforcement model. Defines the Layer 1→4 trajectory along which the *how* facet moves from procedural (amortized-small) to structural (literal-zero); this ADR's Layer-1 caveat is grounded here.
- ADR-015 — Validation methodology and tiered claims. The evidence-grade discipline this ADR invokes for the mandatory amortized-small-vs-literal-zero disclosure.
- ADR-017 — Sealed workspace. Supplies the *when* facet (wall-up-first, `ashe workspace init` as step 1) and the migration path for retrofit; its frictionlessness mandate is the cognitive-axis instance of this ADR's general gate.

## Conformance suite for the weightlessness gate

A claim of weightlessness is verified by four test groups, one per facet (per [ADR-015](ADR-015-validation-methodology-and-tiered-claims.md) methodology). **All four groups MUST pass for the claim to be conformant** — they are conjunctive, mirroring the facets. Each group also records the layer at which the property holds, so the result is graded (literal-zero at Layer 3/4 vs amortized-small-disclosed at Layer 1), never binary-by-assertion.

**Group W (what — object-capability primitive):**

- **Unnameability test** — an actor lacking a capability MUST have no reference by which to invoke the guarded action; the test confirms the action is *absent from the actor's surface*, not present-and-rejected. A model that returns a denial decision for the unauthorized action *fails* this group (denial implies the action was nameable and evaluated).
- **Zero-ambient-authority test** — enumerate every authority reachable by a freshly-constructed actor; it MUST equal exactly the explicitly-granted set, with no implicit/ambient authority recoverable via path traversal, absolute paths, subprocess, or reflection.
- **Attenuation test** — a sub-actor's reachable authority MUST be a subset of the granting actor's (composes with ADR-017 cascade attenuation).

**Group H (how — structural mechanism):**

- **No-added-step test** — on the routine (Tier A/B) path, instrument the call site and confirm a passing action reaches its handler with **no ASHE-executed evaluation step interposed** at the claimed structural layer. The boundary MUST be the substrate's own mechanism (type system / OS capability / MMU / hardware root per [ADR-014](ADR-014-phased-enforcement-model.md)).
- **Byte-identity test** — a passing routine action MUST arrive at its handler byte-identical to the unmediated baseline (composes with the ADR-007 no-data-alteration floor); confirms no rewrite/transform on the path.
- **Layer-disclosure test** — if mediation on the routine path is procedural (Layer 1), the implementation MUST emit the amortized-small (not literal-zero) disclosure for no-delay/no-bandwidth. A literal-zero claim with a procedural routine-path check *fails* this group.

**Group N (when — at construction):**

- **Construction-order test** — confirm the perimeter is established *before* workspace contents are reachable: `ashe workspace init` (or equivalent) runs as step 1, and there is no window in which contents are accessible outside the exposed capability surface (composes with ADR-017 Commitment 1).
- **No-front-gate test** — confirm the boundary is the system's *shape*, not a gate in front of an already-built system: removing the ASHE component MUST make the guarded actions *unreachable* (structural), not *ungated-but-reachable* (bolted-on). A configuration where disabling ASHE restores direct access *fails* this group.

**Group R (where — concentrated scope):**

- **Path-classification test** — confirm the implementation classifies actions into the routine path (~98%, Tier A/B) and the Tier C boundary (~2%), and that the two are enforced *differently*: literal-zero/structural on the former, deliberate weight on the latter.
- **No-uniform-enforcement test** — confirm a routine Tier A action incurs no round-trip, no added token, and no human prompt, while a representative Tier C action (production deploy / secret access / escalation / irreversible destruction) does invoke the explicit boundary. An implementation that gates the 98% the same way as the 2% *fails* this group.
- **Friction-frequency test** — over a representative workload, explicit-prompt frequency on the routine path MUST stay below the defined threshold (shares the ADR-017 Commitment 2 frictionlessness measurement).

**Grading and disclosure**: the suite reports, per invariant and per facet, whether the property holds as **literal-zero (structural, Layer 3/4)** or **amortized-small (procedural, Layer 1, disclosed)**, per ADR-015 evidence grades. The two already-floored invariants — no data alteration (ADR-007) and no interference (ADR-009/ADR-018) — are asserted at every layer and re-checked here as regression guards (byte-identity in Group H; degradation-never-fails as a host-liveness check).

---

**ADR-020 makes "weightless" a conformance predicate, not an adjective. An implementation may claim the four hard invariants only under proper application: the object-capability primitive (what), applied structurally (how), at construction (when), on the dominant path (where) — all four, conjunctively. Proper application *removes* the work; it does not accelerate it. A fast check is still a check, still weight; weightless means there is no check at all on the path that matters.**
