# ASHE — Month-by-Month Execution Plan

Companion to [ROADMAP.md](ROADMAP.md). The roadmap sets phases, tracks, gates, and metrics; this document schedules them **month by month**. It inherits the roadmap's posture (open-core; grant/standards-funded; de-facto-standard north star) and its tracks (**A** Standard · **B** Implementation · **C** Adoption · **D** Sustainability · **E** Org/Governance).

**Anchor:** M01 = 2026-07. Months run M01…M60 (five years). **Granularity decreases with distance, honestly:** Year 1 (M01–M12) is planned at task level; Years 2–5 (M13–M60) at monthly-milestone level — far-out monthly task lists are fiction, and naming them as milestones is the disciplined alternative. Each annual exit gate re-plans the following year to task level.

**Gate legend:** 🟢 entry/exit gate · 🔺 discrete go/no-go (layer spike) · ★ keystone milestone.

---

## Year 1 — *Freeze v1; plant the standard* (M01–M12, 2026-07 → 2027-06)

> Year-1 theme: a frozen, implementable spec v1.0; a Layer-1 reference implementation a second party can independently re-implement; the standardization motion formally begun. **Entry 🟢:** inception exit gate passed (E2E lease→mediate→audit works; spec skeleton; ≥1 grant submitted; governance vehicle chosen).

### M01 — 2026-07 · *Spec extraction begins*
- **A:** Stand up `SPEC.md` skeleton; extract the normative surface from VISION/ADRs into numbered sections (capability grammar, lease lifecycle, intent, audit record, wire contract). Land Element specs 01–03 (done) into the normative spec by reference.
- **B:** Consolidate `conformance/src/protocol/` into a published `ashe-core` package boundary (public API: `Issuer`, `CapabilitySet`, `LeaseAuthority`, `Mediator`, `AuditLog`, `IntentContext`).
- **C:** Finalize the design-partner shortlist (3–5); send the one-page integration pitch.
- **D:** Submit grant applications #1–#2 (NLnet/NGI Zero; an AI-safety funder). Open the governance-vehicle decision memo.
- **E:** Confirm core team (protocol editor + 1 engineer). Set the public RFC process (how spec changes are proposed/disposed).

### M02 — 2026-08 · *Revocation lifecycle (the named gap)*
- **B:** Implement the lease **revocation lifecycle** (Element 02 §3.3): short-TTL + epoch bump + targeted revocation list; fast-path validation stays callout-free. Add revocation unit tests.
- **A:** `SPEC.md` §lease complete, including the bounded-staleness disclosure (revocation-vs-speed trade, ADR-015).
- **C:** First design-partner technical call; capture their integration constraints.
- **D:** Governance-vehicle decision **made** (default: host under an existing foundation). Draft the governance charter + IP policy.

### M03 — 2026-09 · *Identity + wire contract drafted*  🟢 (Q1 review)
- **B:** Element 04 (Identity/Principal) — OIDC token → principal → `CapabilitySet` binding (ADR-002); actor authentication at lease issuance.
- **A:** `SPEC.md` §identity + §wire (Protobuf canonical message shapes for capability/lease/audit; JSON/TOON projections per ADR-012/006).
- **C:** Second design partner signed (LOI/informal).
- **E:** Publish governance charter draft for comment.
- **Gate 🟢:** Q1 review — spec skeleton complete through identity+wire; revocation shipped; ≥1 grant decision pending or in.

### M04 — 2026-10 · *Validation graph scaffold*
- **B:** Element 05 — standalone validation-graph engine scaffold (ADR-008/010): node interface, short-circuit eval, default deterministic + tiny-ONNX evaluator stub. Wire it as the Tier-C `evaluate_boundary` (Element 03 §3.2).
- **A:** `SPEC.md` §validation-graph (informative: the engine; normative: the decision contract).
- **C:** Design partner #1 starts an integration spike against `ashe-core`.

### M05 — 2026-11 · *Intent reconciliation + tier scoring*
- **B:** Harden Element 07 (intent reconciliation) into the boundary evaluator; Element 06 — move tier classification from static registry toward a scored model (anomaly score input).
- **A:** `SPEC.md` §intent + §tier complete. **`SPEC.md` v0.9 feature-complete.**
- **C:** Partner spike #1 produces feedback → spec errata queue.

### M06 — 2026-12 · *Public RFC opens*  ★
- **A:** ★ **Open the 8-week public RFC period on `SPEC.md` v0.9** (GitHub-based). Publish the conformance-suite v1 spec (weightlessness gate + a functional gate: lease/scope/audit/intent correctness).
- **B:** `ashe-core` passes the weightlessness gate *and* the new functional gate in CI.
- **D:** Grant #1 decision expected; if no, submit #3–#4. Half-year funding review.
- **E:** Mid-year org review; bring on fractional devrel.

### M07 — 2027-01 · *RFC intake*
- **A:** RFC comment intake + public disposition log (accept/reject/defer with rationale — the ADR discipline applied to spec comments).
- **B:** `ashe workspace init` MVP begins (Element 12 / ADR-017): wall-up-first; DevContainer adapter as first isolation substrate.
- **C:** Recruit a *second-implementation* steward — the Y2 keystone needs a running start (could be a community port or a partner).

### M08 — 2027-02 · *RFC closes; freeze prep*
- **A:** RFC period closes; integrate accepted changes; produce the v1.0 release candidate. Cut the change-control process (semver, no silent breaking changes).
- **B:** `ashe workspace init` MVP usable end-to-end (init → sealed perimeter → standing capabilities → audited actions).
- **C:** Quickstart "hello, capability lease" (≤15 min) drafted.

### M09 — 2027-03 · *Spec v1.0 FREEZE*  ★🟢 (Q3 review)
- **A:** ★ **Freeze `SPEC.md` v1.0** (Floor). v1.0 commits the protocol *shape* that admits Layers 2–4 without rewrite (ADR-014). Tag the conformance suite to v1.0.
- **B:** `ashe-core` v1.0 tagged; conformant against the frozen spec.
- **Gate 🟢:** Q3 review — spec frozen, ref impl conformant, change control live.

### M10 — 2027-04 · *First external E2E*  ★
- **C:** ★ A partner runs an agent through `ashe-core` end-to-end in a non-production setting (the Y1 adoption proof). Publish the integration guide + quickstart.
- **B:** Layer-2 design spike: scope the Node.js `fs`/`child_process`/`http` hooks (no implementation yet — design only, to de-risk Y2).
- **A:** Submit the **Internet-Draft (IETF)** or **W3C Community Group** report (Stretch).

### M11 — 2027-05 · *Standardization motion*
- **A:** Socialize the I-D/CG; seek a second independent reviewer of the spec; begin building the case for a working group (needs demonstrated multi-vendor interest).
- **C:** First conference talk delivered or accepted; open the community forum.
- **D:** Confirm Y2 funding (grant secured or foundation host committed).

### M12 — 2027-06 · *Year-1 exit*  🟢
- **Gate 🟢 (Y1 exit):** Spec v1.0 frozen ✓; `ashe-core` passes both conformance gates in CI ✓; ≥1 external E2E run ✓ (Target); ≥1 grant or foundation host ✓ (Target). **If funding gate fails → trigger §15 contingency (lower-burn track).**
- **Metrics check:** 2 design partners; 1 integration spike; spec v1.0; 1 grant/host; 50+ stars, 5+ external contributors.
- **Re-plan:** expand Year 2 to task level for the M13 start.

---

## Year 2 — *Running code, independently* (M13–M24, 2027-07 → 2028-06)

> Theme: cross the **multiple-independent-implementations** bar; Layer-2 mediation via the Node.js SDK; the first interop event. **Entry 🟢:** Y1 exit passed.

| Month | Primary milestone | Track | Marker |
|---|---|---|---|
| M13 (2027-07) | Layer-2 Node hooks begin: `fs` interception routed through ASHE for ASHE-aware processes | B | |
| M14 (2027-08) | Conformance suite v1.0 released as the authoritative interop bar (W/H/N/R + functional + Layer-2 profile) | A | ★ |
| M15 (2027-09) | `child_process` + `http` hooks; honest claim moves to "all SDK code is mediated" · Q-review | B | 🟢 |
| M16 (2027-10) | Second-implementation steward reaches first passing conformance run | C | ★ keystone-in-progress |
| M17 (2027-11) | Tier-2 evaluators (LLM-backed where the graph calls for it; tiny-ONNX default elsewhere) | B | |
| M18 (2027-12) | Continuum open-core split lands: Apache-2.0 core vs first commercial surface (managed audit + hosted broker) · half-year funding review | B/D | |
| M19 (2028-01) | First interop event (hackathon-style): implementations test against each other + the suite | A | ★ (Target) |
| M20 (2028-02) | Spec v1.1 — errata/clarifications from independent implementers (the highest-value feedback) | A | |
| M21 (2028-03) | First site operators publish `.well-known/ashe` (Element 13 / ADR-018) · Q-review | C | 🟢 |
| M22 (2028-04) | TSC seated with ≥1 non-Phor seat; no-single-org-majority rule in force | E | 🟢 |
| M23 (2028-05) | Continuum first paying design partner (Target); 18-month forward runway secured | D | |
| M24 (2028-06) | **Y2 exit 🟢:** ≥2 independent conformant impls ★; Layer-2 shipped; open-core split + ($ or grant); TSC seated | all | 🟢★ |

> **Y2 is the hinge year.** The keystone metric — *the second independent conformant implementation* — is the line between "a well-documented project" and "a real standard." If M16/M24 slip, re-examine the adoption thesis (ROADMAP §15 R2) before proceeding.

---

## Year 3 — *Multi-language, multi-deployment, compliance-credible* (M25–M36, 2028-07 → 2029-06)

> Theme: the protocol is real in four languages; enterprises can map it to compliance frameworks; the standards-track motion matures. **Entry 🟢:** Y2 exit (esp. ≥2 conformant impls).

| Month | Primary milestone | Track | Marker |
|---|---|---|---|
| M25 (2028-07) | Python SDK begins (LangChain/AutoGen/CrewAI userbase) | B | |
| M26 (2028-08) | Python SDK passes conformance; Rust SDK begins (path to Layer 3) | B | |
| M27 (2028-09) | Compliance mappings published: SOC 2 / ISO 27001 / HIPAA + FedRAMP-readiness narrative · Q-review | A | 🟢 |
| M28 (2028-10) | Rust SDK passes conformance; Go SDK begins (cloud-native) | B | |
| M29 (2028-11) | Validation-graph maturation: standalone engine hardened; intent-vs-action node production-grade | B | |
| M30 (2028-12) | Go SDK passes conformance → **4-language conformant matrix (TS/Python/Rust/Go)** · half-year funding review | B | ★ |
| M31 (2029-01) | Pursue WG charter (IETF/W3C) — *or* document the de-facto-path pivot if a formal WG isn't reachable | A | 🔺 (Stretch) |
| M32 (2029-02) | Spec v2.0 — Layer-2 lessons + multi-language results; defines the Layer-3 profile ahead of impl | A | |
| M33 (2029-03) | First regulated-industry pilot (fintech/health/gov) live on Continuum enterprise · Q-review | C | 🟢 |
| M34 (2029-04) | **Layer-3 spike** (gVisor/Firecracker/eBPF feasibility vs the spec) | B | 🔺 go/no-go |
| M35 (2029-05) | Cross-org capability-federation pilot (one org's tokens accepted by another under policy) | C | |
| M36 (2029-06) | **Y3 exit 🟢:** 4-lang SDKs; compliance mappings; regulated pilot; Layer-3 spike decision; WG charter or de-facto pivot | all | 🟢 |

---

## Year 4 — *Adversarial-grade enforcement; production at scale* (M37–M48, 2029-07 → 2030-06)

> Theme: Layer-3 runtime mediation in production — the first point ASHE bounds the blast radius of *uncooperative* code, not just cooperating code. **Entry 🟢:** Y3 exit; Layer-3 spike = "go."

| Month | Primary milestone | Track | Marker |
|---|---|---|---|
| M37 (2029-07) | Layer-3 mediation build begins: eBPF (Linux) syscall mediation | B | |
| M38 (2029-08) | Sandbox integration (gVisor / Firecracker) for controlled processes | B | |
| M39 (2029-09) | Layer-3 conformance profile finalized + added to the suite (syscall mediation, blast-radius bounding) · Q-review | A | 🟢 |
| M40 (2029-10) | Continuum production hardening: HA broker, revocation at scale | B/D | |
| M41 (2029-11) | WEIGHTLESS budget validated under real load (ADR-015 benchmark publication) | A | ★ |
| M42 (2029-12) | Layer-3 GA; honest claim: "syscalls from controlled processes go through ASHE; blast radius bounded by capability set" · half-year review | B | ★ |
| M43 (2030-01) | Independent security review commissioned | A | |
| M44 (2030-02) | Interop event #2/#3; cross-implementation Layer-2 interop demonstrated publicly | A | |
| M45 (2030-03) | 3–5 enterprise production deployments at Layer-2/3 · Q-review | C | 🟢 |
| M46 (2030-04) | **Layer-4 research** (TPM/TEE attestation feasibility) | B | 🔺 go/no-go |
| M47 (2030-05) | Independent security review **published**; remediations landed | A | ★ |
| M48 (2030-06) | **Y4 exit 🟢:** Layer-3 GA + 3+ prod deployments; security review published; ≥50% sustainability from revenue | all | 🟢 |

---

## Year 5 — *De facto standard; hardware-rooted pilots* (M49–M60, 2030-07 → 2031-06)

> Theme: ASHE is the protocol people reach for when an agent needs bounded authority — ratified or de-facto — with hardware-anchored enforcement available for the highest stakes. **Entry 🟢:** Y4 exit.

| Month | Primary milestone | Track | Marker |
|---|---|---|---|
| M49 (2030-07) | Layer-4 hardware-rooted pilot begins (TPM/TEE; hardware-verified capability tokens) | B | |
| M50 (2030-08) | Conformance certification program operational (3rd parties certify "ASHE-conformant, Layer N") | A | ★ |
| M51 (2030-09) | Layer-4 pilot demonstrated for a highest-stakes deployment · Q-review | B | 🟢 |
| M52 (2030-10) | Spec v3.0 — the mature multi-layer standard | A | ★ |
| M53 (2030-11) | Broaden cross-vendor adoption: multiple agent vendors + frameworks shipping ASHE | C | |
| M54 (2030-12) | Self-sustaining funding confirmed; no single funder >~25% (capture guardrail) · half-year review | D | 🟢 |
| M55 (2031-01) | Ratification submission matured (RFC / W3C Recommendation track) — or de-facto criteria audit | A | 🔺 (Stretch / north star) |
| M56 (2031-02) | ASHE appears in enterprise procurement / agent-security RFPs as an expected capability | C | ★ (Stretch) |
| M57 (2031-03) | Continuum offers full enforcement spectrum (Layers 1→4); flagship-not-sole conformant impl · Q-review | B | 🟢 |
| M58 (2031-04) | External contributor community larger than the funded team (the "escaped its origin" marker) | E | ★ |
| M59 (2031-05) | Final ratification push / de-facto-status documentation | A | |
| M60 (2031-06) | **Y5 exit 🟢 ("have we won?"):** ≥5 impls (3 in prod ≥L2); ratified or de-facto; Layer-4 pilot; self-sustaining | all | 🟢★ |

---

## How to use this document

- **Operate from the current year only.** Years 2–5 are milestone-level on purpose; each annual exit gate (🟢) re-plans the next 12 months to task level, against reality.
- **Gates are real stops.** A 🟢 that fails does not roll forward silently — it triggers the matching ROADMAP §14 gate action (extend, pivot to de-facto path, or trigger the funding contingency).
- **The two numbers that matter most:** the *second independent conformant implementation* (M16→M24) and *self-sustaining-with-neutrality* (M54). Standard-ness and survival, respectively. If either is red, it outranks everything else that month.
- **Slippage is expected and logged, not hidden** — consistent with the corpus's honesty discipline (ADR-014/015). Calendar dates are planning anchors; the *sequence* and the *gates* are the commitment.
