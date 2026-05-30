# ASHE — Weightlessness

> *Pay once at the boundary; amortize to zero across the steady state. Weight that is felt is weight in the wrong place.*

---

## What "weightless" means here

ASHE's central UX promise — stated as a mandate in [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) and invoked as the "TLS for the agent layer" analogy throughout [MANIFESTO.md](MANIFESTO.md) and [VISION.md](VISION.md) — is that capability mediation must be **invisible most of the time and explicit only at risk boundaries.** This document names that promise as a single engineering property and specifies how an implementation delivers it.

**Weightless ≠ free.** ASHE does real work: it issues leases, validates capabilities, declares intent, writes audit records, projects wire formats. Weightlessness is not the absence of that work — it is the *placement* of that work. The design principle:

> **Move every cost to an amortizable boundary (handshake, intent declaration, lease issuance) and make the steady-state per-action path a local check with no network callout, no model token, and no human prompt.**

This is the same move TLS makes: an expensive asymmetric handshake once per connection, then cheap symmetric operations per byte. Nobody approves every packet on an encrypted connection; the mediation happens; the user is unaware. ASHE generalizes that split from bytes to *actions*. The "weight" of mediation is paid at session establishment and amortized across the hundreds-to-thousands of actions the session subsequently performs. At `N` actions per lease, per-action overhead trends to `boundary_cost / N` → effectively zero as `N` grows.

---

## The axes of weight

"Weight" is not one thing. An honest weightlessness claim has to name every axis on which a protocol layer can be *felt* and drive each one to its floor. Each axis already has a mechanism in the ASHE corpus; this document is the place they are collected and budgeted.

| Axis of weight | Where it would be felt | Mechanism that drives it toward zero | Anchor |
|---|---|---|---|
| **Latency** | Per-action delay on the hot path | Capability tokens validated locally per-use; network callout reserved for the slow path (sensitive ops, revocation-critical) | [ADR-007](decisions/ADR-007-interception-chain-pattern.md) (interceptor budget; token alt.) |
| **Wire / token** | Bytes and context tokens per request | Protobuf binary + HTTP/3 0-RTT + persistent multiplexed connections + tokens replacing repeated headers + TOON context projection | [ADR-012](decisions/ADR-012-wire-format-grpc-protobuf-with-projections.md), [ADR-006](decisions/ADR-006-toon-dual-projection.md), [VISION §3](VISION.md) |
| **Cognitive / friction** | Approval prompts, decisions demanded of the human | Standing capabilities + intent-declared-once + risk-tiered automation + cached approvals + inferred intent | [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) (frictionlessness, mandatory) |
| **Footprint / deployment** | Binary size, memory, cold start, ops burden | Deployment profiles (ASHE-core <50 MB) + graceful degradation + intermediary-served ASHE-Lite | [ADR-009](decisions/ADR-009-deployment-profiles.md), [VISION §8](VISION.md) |
| **Model-layer** | Weights, training, context-window pollution | Non-invasive by construction — protocol operates external to the model; no RLHF, no context injection | [MANIFESTO](MANIFESTO.md) (bounded-outcomes commitment) |
| **Adoption** | Migration risk, breakage, forced rewrites | Strictly additive; ALPN multiplex on 443; HTML coexists indefinitely; never breaks the existing surface | [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md), [VISION §4](VISION.md) |

The thesis of this document: **weightlessness is achieved when every row's steady-state cost is paid at a boundary, not per action.** The sections below take each row in turn.

---

## The four hard invariants

Amortized-small is not zero. The strict statement of weightlessness — the bar an ASHE deployment must clear on the steady-state path — is four invariants stated as absolutes:

| Invariant | Meaning | Status |
|---|---|---|
| **No delay** | Zero added latency on the routine action path | Target — via pre-authorization / structural boundary (below) |
| **No bandwidth** | Zero added bytes on the wire for a routine action | Target — held capability carries the grant; nothing re-sent |
| **No data alteration** | ASHE never transforms a payload or mutates application state — it is *pass/deny*, never *rewrite* | **Floor (contractual)** — [ADR-007](decisions/ADR-007-interception-chain-pattern.md) mandates idempotent, no dispatch-state mutation |
| **No interference** | ASHE does not perturb the application's normal operation or the human surface | **Floor (constructional)** — additive dual-surface ([ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)); graceful degradation never *fails* the system ([ADR-009](decisions/ADR-009-deployment-profiles.md)) |

Two of the four are already guaranteed, not aspired to. **No data alteration** is contractual: the interceptor contract is idempotent with no dispatch-state mutation — ASHE decides, it does not rewrite, so a passing action arrives at its handler byte-identical to an unmediated one. **No interference with existing surfaces** is constructional: ASHE rides alongside the HTML/human surface via ALPN on port 443 and never touches it, and a thin profile that lacks a tier degrades to a more conservative decision rather than erroring — it cannot take the host down.

The other two — **no delay, no bandwidth** — are where the real engineering lives, and they expose a tension that must be named honestly.

### The honest tension: enforcement *is* interference

**Active enforcement is interference by definition.** The instant ASHE *blocks* an action it has interfered, and if it blocks synchronously it has also delayed. You cannot simultaneously have "veto this specific action in-band" and "zero delay / zero interference on that same action" — it is a contradiction, not an engineering gap. So literal-zero is not claimable for *every* action. It is claimable, precisely, for two categories — and weightlessness is the discipline of making those two categories cover ~98% of all actions:

1. **Pre-authorized actions.** The capability is already held (issued at the boundary). At action time there is *nothing to check* — the decision was made before the action existed — so there is no step to add latency and no byte to send. The weight was paid at issuance and amortized away.
2. **Structurally-bounded denials.** The action was never *expressible*. (Next section.)

The enforcement weight that genuinely remains is concentrated at the rare Tier C boundary (~2% — production deploys, secret access, escalation, irreversible destruction), where interference is the *intended function* and a few milliseconds against a deploy is invisible. Weightlessness is honest about *which* actions are truly zero and *where* the weight is deliberately spent — it does not pretend enforcement is free where enforcement is the point.

### Structural, not procedural — the path to literal zero

A **procedural** check is a step that *runs*: it can be made tiny, local, amortized — but never literally zero, because something executes on the path. A **structural** boundary is part of the system's *shape*: an unforgeable reference you were never handed is not a "denied check," it is an *absence*.

This is the object-capability property at the root of ASHE's 50-year lineage ([VISION §1](VISION.md)): *ambient authority is eliminated by construction — nothing has authority it was not given.* A JPEG parser that does not hold the SSH-key capability pays **no runtime check** to be denied SSH keys — it structurally has no way to *name* them. The substrate already enforces this as its normal operation — the type system at Layer 2, the OS capability/MMU at Layer 3, the hardware root at Layer 4 ([ADR-014](decisions/ADR-014-phased-enforcement-model.md)) — so ASHE adds **no step to the path**:

- **no delay** — there is no check to run; the boundary is the substrate's existing mechanism
- **no bandwidth** — there is no message to send; the reference is held or it is absent
- **no data alteration** — there is nothing in the path to alter
- **no interference** — the action proceeds exactly as written, or was never expressible to begin with

The cost was paid twice, both off the hot path: once at **issuance** (a boundary event) and once at **construction** (the system shaped so authority is held-or-absent). This is why the four invariants are *reachable* rather than wishful — but only as the enforcement layer deepens. At Layer 1 (cooperating SDK) mediation is procedural and pays a small, sub-millisecond, amortized cost (§1); literal zero on delay and bandwidth is a **Layer 3/4 property**, where the boundary stops being a step and becomes part of the shape. The trajectory toward true-zero is the [ADR-014](decisions/ADR-014-phased-enforcement-model.md) trajectory.

---

## Proper application — the resolving discipline

Weightlessness is difficult to *resolve* because it is not a mechanism you install — it is **the default state of a system whose authority boundaries were applied correctly, and it is forfeited the instant they are applied incorrectly.** A misapplied ASHE is not a lighter middleware; it is just middleware. The property holds, or it doesn't, depending entirely on how it is applied. This is a binding conformance gate, not advice: [ADR-020](decisions/ADR-020-weightlessness-proper-application-conformance.md) makes "weightless" a four-part predicate an implementation may claim *only* under proper application. "Properly apply" is four facets of one discipline — all four required together; drop any one and the property collapses:

| Facet | Proper application (weightless) | Improper application (collapses to middleware) |
|---|---|---|
| **What** — the primitive | Object-capability: authority is *held or absent*; zero ambient authority anywhere. An unauthorized action is an unnameable one. | Permission flags checked against an identity — a lookup that always runs. |
| **How** — the mechanism | Structural: the boundary is the substrate's existing mechanism (type system / OS capability / hardware root). No step added to the path. | Procedural: a check ASHE executes per action — non-zero latency and bytes, forever. |
| **When** — the moment | At construction: wall up first, develop inside ([ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md), `ashe workspace init` as step 1, like `git init`). The system is *shaped* around the boundary. | Bolted on after the fact as a gate in front of an already-built system — always a check that runs. |
| **Where** — the scope | True-zero applied to the ~98% routine path; deliberate weight concentrated at the ~2% Tier C boundary where interference is the intended function. | The 98% checked the same way as the 2% — uniform enforcement turns every routine action into a gated one. |

The four are not alternatives; they compose into a single test. **Apply the object-capability primitive (what), structurally (how), at construction (when), to the dominant path (where) — and the four invariants hold for free, because the substrate already does the work and the decision was made before the action existed.** Miss any one facet and weight reappears: the wrong primitive forces a lookup, procedural application forces a path step, late application forces a gate, uniform scope forces a check on every routine action.

This is why "weightless" is hard. It is not achieved by optimizing a check until it is fast — a fast check is still a check, still non-zero, still weight. It is achieved by applying the boundary such that **there is no check at all** on the path that matters. Proper application removes the work; it does not accelerate it.

---

## 1. Latency — the hot-path budget

The interception contract in [ADR-007](decisions/ADR-007-interception-chain-pattern.md) already fixes the hard number: any pre-dispatch interceptor must meet **<5ms p99 latency, deterministic, idempotent, no dispatch-state mutation.** That is the ceiling. Weightlessness is about getting the *typical* case far below it.

Two paths, deliberately separated:

- **Slow path (rare, sensitive).** A full callout to the broker — fresh evaluation, current state, revocation-aware. Used for Tier C operations (~2% of actions per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md)): production deploys, secret access, capability escalation, irreversible destruction. Here weight is *acceptable* because the action is rare and high-stakes; a few milliseconds of broker round-trip is invisible against a deploy.
- **Fast path (routine, ~90%+).** A locally verifiable capability token (the [ADR-007](decisions/ADR-007-interception-chain-pattern.md) alternative-3 mechanism, promoted from "v1 optimization" to the steady-state default) carries the grant. The interceptor validates the token's signature and scope *in-process* — no broker callout, no network, no I/O. This is sub-millisecond and the dominant case.

The amortization: token issuance (the asymmetric-crypto-equivalent cost) happens once at lease establishment; token validation (the symmetric-crypto-equivalent cost) happens per action. Routine work never touches the broker. The honest tension named in [ADR-007](decisions/ADR-007-interception-chain-pattern.md) — tokens trade revocation latency for hot-path speed — is resolved by keeping revocation-critical operations on the slow path and bounding token TTL so a stale token's blast radius is time-bounded. **Weightless on the routine path; deliberately weighted on the dangerous path.**

---

## 2. Wire and token weight

At agentic-web scale the byte budget *is* an energy budget ([VISION §3](VISION.md): ~75 quintillion tokens/month at 5% agent-mediated traffic). The mechanisms compose multiplicatively, and each is a boundary cost rather than a per-action cost:

| Mechanism | What it removes from the per-action path | Grade |
|---|---|---|
| Protobuf binary vs JSON | 5–10× payload size | Target |
| HTTP/3 + 0-RTT | TLS+TCP handshake latency on reconnect | Target |
| Persistent multiplexed connections | ~50–200 ms TLS setup *per request* | Target |
| Capability token vs cookies/headers | ~200–500 bytes of repeated metadata *per request* | Target |
| Intent-declared multi-step transactions | Collapses N round-trips to 1 | Target |
| TOON projection for agent context | Additional 40–50% context-token reduction | Target |

The connection itself is the boundary: established once, the per-request marginal cost is a framed binary message over an already-open stream. The empirical floor for *structured-over-HTML* (2–5× token, 5× runtime) is established by [arXiv 2511.23281](https://arxiv.org/abs/2511.23281); ASHE's incremental wire optimizations above that are target-grade and gated on the [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md) benchmark. No claim here is exempt from measurement.

---

## 3. Cognitive weight — the friction floor

This is the axis users actually *feel*, and the one [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) makes a non-negotiable architectural commitment: **capability mediation MUST NOT mean per-operation prompts.** The mechanisms are all forms of paying the decision once and reusing it:

- **Standing capabilities** — routine operations pre-granted at session/role level; the decision was made at lease setup, not at action time.
- **Intent declared once, actions auto-validated** — "working on the auth refactor today" is the boundary cost; every in-scope action after it is silently validated against that declaration.
- **Risk-tiered automation** — Tier A (~90%) silent, Tier B (~8%) auto-approved with audit, Tier C (~2%) explicit. Only the last tier spends human attention.
- **Cached approvals + capability inheritance through cascades** — approved once, holds for the session; sub-agents inherit attenuated capabilities without fresh approval.
- **Inferred intent** — when action patterns are unambiguous, no declaration is required at all.

The result is the TLS feel: the developer experiences normal work with mediation running invisibly underneath, and a prompt appears only at a genuine risk boundary. The friction floor is not zero — it is *the rate of Tier C events*, which is irreducible by design (see Limits).

---

## 4. Footprint, model-layer, and adoption weight

Three axes that are weightless by *construction* rather than by amortization:

- **Footprint.** [ADR-009](decisions/ADR-009-deployment-profiles.md) ships ASHE in profiles sharing one protocol surface; ASHE-core fits in <50 MB for embedded/edge/CI gates, and graceful degradation means a thin profile never *fails* for lack of a tier — it makes more conservative decisions. The long tail pays nothing: intermediaries (CDN-class providers) serve ASHE-Lite to hosted sites at near-zero marginal cost ([VISION §8](VISION.md)). An adopter never carries weight a richer deployment would carry.
- **Model-layer.** ASHE is non-invasive by definition: no weight changes, no training-time constraints, no context-window pollution, no RLHF cooperation required. The model carries zero ASHE weight because the protocol lives entirely external to it at the dispatch/lease/audit boundary. This is the load-bearing **bounded-outcomes ≠ censored-behavior** property — the model's cognition is untouched.
- **Adoption.** Strictly additive ([ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)): `.well-known/ashe` sits alongside existing HTML, ALPN multiplexes both protocols on port 443, and the human surface is never disturbed. Adoption weight is near-zero because there is nothing to migrate and nothing that can break.

---

## Evidence grades

Per [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md), weightlessness claims carry explicit grades:

| Claim | Grade | Basis |
|---|---|---|
| Hot-path interceptor overhead is bounded at <5 ms p99 | **Floor (design-contractual)** | [ADR-007](decisions/ADR-007-interception-chain-pattern.md) interceptor obligation; conformance-checkable |
| Structured alternatives beat HTML by 2–5× token / 5× runtime | **Floor (empirical)** | [arXiv 2511.23281](https://arxiv.org/abs/2511.23281) controlled study |
| Local token validation drives typical hot-path overhead sub-millisecond | **Target** | Mechanism named ([ADR-007](decisions/ADR-007-interception-chain-pattern.md) alt. 3); subject to benchmark |
| ASHE's incremental wire optimizations reach 10–30× vs HTML | **Target** | Mechanism-by-mechanism; gated on [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md) benchmark |
| ~90% of actions traverse the silent fast path | **Target** | Risk-tier distribution per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md); deployment-dependent |
| Cascade + persistent-session patterns compound to 20–50× per-task | **Stretch** | Favorable-condition economics ([VISION §7](VISION.md)) |

---

## Honest limits — where weight is irreducible

Weightlessness is bounded protection, not a free lunch. The places weight cannot go to zero, named plainly:

- **The Tier C boundary is the friction floor.** Production deploys, secret access, capability escalation, and irreversible destruction *should* cost a deliberate human decision. Driving this to zero would defeat the purpose. Weightlessness means making this rare (~2%), not absent.
- **Cold start is a real boundary cost.** The first action in a session pays the handshake — lease establishment, intent declaration, connection setup. Amortization works only when `N` is large; a one-shot, single-action agent sees the boundary cost undiluted. ASHE is weightless *over a session*, not *over a single isolated call*.
- **Revocation trades against token speed.** The fast path's locally-validated tokens are exactly what makes near-instant revocation hard. The resolution (slow-path for revocation-critical ops + bounded TTL) caps the staleness window; it does not eliminate the tension. This is an honest [ADR-007](decisions/ADR-007-interception-chain-pattern.md) trade-off, not a solved problem.
- **Audit is weight that must not be amortized away.** Every capability exercise is recorded ([VISION §4](VISION.md)). Audit write cost is real and is deliberately *not* dropped on the fast path — it is made cheap (append-only, async, off the critical path) but never skipped. Forensic reconstructability is load-bearing; its cost is accepted.

---

## What weightlessness asks of an implementation

A conformant implementation claiming weightlessness commits to a budget, checkable against the conformance suite ([ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md)):

| Property | Budget | Verified by |
|---|---|---|
| Routine fast-path action | No broker callout; in-process token validation | Trace shows zero network I/O on Tier A path |
| Interceptor p99 | <5 ms ([ADR-007](decisions/ADR-007-interception-chain-pattern.md)) | Load test under representative mix |
| Human prompts | Only on Tier C; standing capability holds otherwise | Prompt count ≈ Tier C event count |
| Per-request wire overhead | Framed binary on a persistent stream; no per-request handshake | Wire capture |
| Embedded footprint | ASHE-core <50 MB ([ADR-009](decisions/ADR-009-deployment-profiles.md)) | Binary size measurement |
| Model footprint | Zero weight/context changes | Construction (external to model) |

**The one-line test of weightlessness:** in steady state, a routine agent action should cost no network round-trip, no model token, and no human attention — and the audit record should still exist. If any of those three are spent on a Tier A action, weight has leaked into the wrong place.

---

*ASHE — weightlessness is the placement of cost, not its absence. Pay at the boundary; run free in the steady state.*
*Companion to [MANIFESTO.md](MANIFESTO.md), [VISION.md](VISION.md). Evidence-graded per [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md). Honest limits named.*
