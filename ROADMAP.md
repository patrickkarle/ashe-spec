# ASHE — Long-Range Roadmap (Inception → Year 5)

> *Open standard, grant- and sponsorship-funded, built to become the de facto cross-vendor capability-broker protocol for the agent era. Continuum (the commercial reference implementation) exists to sustain and accelerate adoption — not the other way around.*

---

## 0. How to read this document

This is the program-level operating plan for ASHE from inception through a five-year horizon. It is **granular by design** — quarter-level deliverables, explicit go/no-go gates, metrics with targets, a funding plan, an org plan, and a risk register.

**Posture (decided 2026-06):**

| Axis | Decision | Consequence for this plan |
|---|---|---|
| **Business model** | Open-core — ASHE is Apache-2.0; Phor monetizes Continuum (managed broker, enterprise enforcement, compliance packs) atop it | Commercial milestones are *subordinate* to adoption milestones; Continuum revenue is a sustainability input, not the north star |
| **Funding** | Grant / standards-body funded | Burn is capital-efficient; hiring is lean and standards/eng-weighted; milestones gate on grant cycles and ratification, not on a VC growth curve |
| **North star (Y5)** | De facto cross-vendor standard | When adoption and revenue trade off, adoption wins. Ubiquity, independent implementations, and ratification are the primary scoreboard |

**Epistemic discipline.** Per [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md), every forward target here is a **planning target**, not a commitment, and is graded:

- **(Floor)** — high-confidence, within our control (e.g., "publish spec v1.0").
- **(Target)** — plausible with normal execution and funding (e.g., "3 independent conformant implementations").
- **(Stretch)** — requires external alignment we don't control (e.g., "IETF WG charter adopted").

**Calendar anchor.** Program Year 1 (Y1) begins **2026 H2** (inception, now). Years run on program quarters: Y1Q1 = 2026 Q3 … Y5Q4 = 2031 Q2. Quarters are planning units; calendar slippage is expected and gated, not fatal.

**Relationship to the corpus.** This roadmap *operationalizes* decisions already made: the four-layer enforcement trajectory ([ADR-014](decisions/ADR-014-phased-enforcement-model.md)), deployment profiles ([ADR-009](decisions/ADR-009-deployment-profiles.md)), validation methodology ([ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md)), the conformance gate ([ADR-020](decisions/ADR-020-weightlessness-proper-application-conformance.md)), the tri-surface architecture (agent/dev/web — [ADR-014](decisions/ADR-014-phased-enforcement-model.md)/[ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md)/[ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)), and the first-slice cohesion sequence ([ADR-005](decisions/ADR-005-first-slice-cohesion.md)). It does not introduce new architecture; it schedules the existing one and adds the standardization, funding, governance, and org tracks the ADRs presuppose but do not specify.

---

## 1. Strategy — why standardization-first

The thesis of the whole effort (from [MANIFESTO.md](MANIFESTO.md) / [VISION.md](VISION.md)): **capability mediation between agents and software should be a public cross-vendor protocol, not a single-vendor advantage.** A standard wins by being adopted, and a protocol standard specifically wins by clearing three hurdles in order:

1. **Credible specification** — a spec precise enough that two parties who never talked can interoperate. (We are here, at v0.x.)
2. **Multiple independent implementations** — the IETF "rough consensus and running code" bar; the single strongest signal that a spec is real and not vendor fiction.
3. **Neutral governance + adoption flywheel** — no single vendor controls it; agent vendors and site operators adopt it because *other* agent vendors and site operators have.

The grant/standards funding posture is chosen *because* it serves hurdle 3: a protocol owned by a VC-backed company racing to revenue is structurally suspected of capture (the [CASE-FOR-NOW §1.8.1](CASE-FOR-NOW.md) "motivated rejection" problem). A protocol stewarded by a neutral foundation, funded by grants and sponsorship, with an open-core commercial implementation among several, is the configuration that has historically won standards races (TCP/IP, HTTP, TLS, OAuth, Let's Encrypt/ACME).

**Continuum's role.** Continuum is the reference implementation and the proving ground. It is open-core: the protocol and a conformant core are Apache-2.0; enterprise enforcement (managed broker, Layer 3/4 operations, compliance evidence packs, support/SLA) is commercial. Continuum funds the foundation's sustainability and gives the spec a flagship adopter — but the plan deliberately *invites and resources competing implementations*, because hurdle 2 cannot be met by Continuum alone.

**The flywheel we are building:**

```
   grants + sponsorship
            │
            ▼
   credible spec + conformance suite ──► independent implementations
            ▲                                      │
            │                                      ▼
   neutral governance  ◄──── adoption (agent vendors + site operators)
            │                                      │
            └────────── ratification ◄─────────────┘
                              │
                              ▼
                 de facto standard (Y5 north star)
```

---

## 2. The three tracks

Everything below is organized into three parallel tracks plus two enabling tracks. Each year section reports deliverables per track.

| Track | Owns | Win condition |
|---|---|---|
| **A. Standard** | The specification, the conformance suite, governance, the standards-body relationship, interop | ASHE is a ratified or de-facto cross-vendor standard with neutral governance |
| **B. Implementation** | The reference implementation (Continuum core, Apache-2.0), the SDKs, the four-layer enforcement trajectory | A conformant, production-grade reference impl exists at each enforcement layer on schedule |
| **C. Adoption** | Design partners, agent-vendor integrations, site-operator `.well-known/ashe` deployments, devrel, ecosystem | Independent parties ship ASHE in production because it's worth it to them |
| **D. Sustainability** (enabling) | Grants, sponsorship, the foundation, Continuum open-core revenue | The effort is funded through Y5 without compromising neutrality |
| **E. Org & Governance** (enabling) | People, hiring, IP/patent posture, decision process | A lean team and a capture-resistant governance structure |

---

## 3. Phase model — version ↔ enforcement layer ↔ year

Anchored to [ADR-014](decisions/ADR-014-phased-enforcement-model.md)'s committed trajectory. **Each layer transition is its own discrete project with an explicit go-ahead gate** (ADR-014 implementation note) — the plan never commits a later layer's work as a precondition for an earlier layer's value.

| Program year | ASHE version | Enforcement layer reached | Honest claim ceiling (ADR-014) | Standard-track milestone |
|---|---|---|---|---|
| **Inception (Y0/Y1Q1)** | v0 (done) | Layer 1 token issuance + scope-check; conformance scaffold ([ADR-020](decisions/ADR-020-weightlessness-proper-application-conformance.md)) green | "ASHE exists in code form" — not a security claim | Spec v0.x published; conformance gate v0 runnable |
| **Year 1** | v1 | Layer 1 fully active; cooperating IPC gated; intent reconciliation evaluators | "Cooperating traffic is gated; bypassing the IPC layer bypasses ASHE" | Spec v1.0 frozen; Internet-Draft / W3C CG submitted *(Stretch)* |
| **Year 2** | v2 | Layer 2 via Node.js SDK adapters; tier-2 evaluators | "All code using the ASHE SDK is mediated" | Conformance suite v1; first interop event; ≥3 independent impls *(Target)* |
| **Year 3** | v3 | Layer 2 across Python/Rust/Go SDKs; broadened evaluators | (as v2, multi-language) | WG charter / standards-track adoption *(Stretch)*; compliance mappings |
| **Year 4** | v4–v5 | Layer 3 runtime mediation (gVisor/Firecracker/eBPF) | "Syscalls from controlled processes go through ASHE; blast radius bounded by capability set" | Standards-track maturation; Layer-3 conformance profile |
| **Year 5** | v6 (pilot) | Layer 4 hardware-rooted (TPM/TEE attestation) pilots | "Mediation is hardware-anchored; capability boundaries cryptographically enforced" | De facto / ratified standard; multi-vendor production at scale |

---

## 4. Inception — Now (Y0 → Y1Q1, 2026 H2)

**Theme:** *Turn a credible set of documents into a credible, runnable protocol with a conformance bar.*

**Where we actually are (baseline, verified):**

- Spec corpus published v0.x: MANIFESTO, VISION, CASE-FOR-NOW, WEIGHTLESS, ADRs 001–020.
- The conformance gate is **real and runnable**: [ADR-020](decisions/ADR-020-weightlessness-proper-application-conformance.md) + the `conformance/` suite (adapter contract, language-neutral manifest, four W/H/N/R test groups, CI green).
- The reference protocol primitives exist in embryo: object-capability core (unforgeable capabilities, attenuate-only sets), structural mediation, tamper-evident audit, lease issuance, intent reconciliation — all unit-tested.

**Inception deliverables (this is the work in flight):**

| Track | Deliverable | Grade |
|---|---|---|
| A | ADR-020 conformance gate + runnable suite; CI on every PR | Floor (done) |
| A | `SPEC.md` skeleton — extract the normative wire contract from VISION/ADRs into a single citable spec document with section numbering | Floor |
| B | Reference protocol primitives → a coherent `ashe-core` package (capability, lease, mediation, audit, intent) with a public API surface | Floor |
| B | Lease **revocation lifecycle** + the slow-path/fast-path split (the one honest gap WEIGHTLESS.md names) | Floor |
| C | Design-partner shortlist (3–5 agent vendors or agent-framework maintainers) + a one-page integration pitch | Target |
| D | Grant prospect list + first two applications drafted (see §11) | Floor |
| E | Choose the governance vehicle (new foundation vs. hosted under an existing one) — decision memo | Floor |

**Inception exit gate (must pass to declare Y1 open):**
- Spec skeleton exists and the conformance suite tests against it.
- `ashe-core` issues a lease, mediates a routine action at literal-zero, mediates a Tier-C action through the explicit boundary, and writes a verifiable audit record — end to end.
- At least one grant application submitted.
- Governance-vehicle decision made.

---

## 5. Year 1 (2026 Q3 – 2027 Q2) — *Freeze v1; plant the standard*

**Theme:** *A frozen, implementable spec v1.0; a Layer-1 reference implementation that a second party can independently re-implement; the standardization motion formally begun.*

**Entry gate:** inception exit gate passed.

### Workstreams

**Track A — Standard**
- Y1Q1: `SPEC.md` v0.9 — complete normative surface: capability grammar, lease lifecycle, intent declaration, audit record format, the wire contract (Protobuf canonical + JSON/TOON projections per [ADR-012](decisions/ADR-012-wire-format-grpc-protobuf-with-projections.md)/[ADR-006](decisions/ADR-006-toon-dual-projection.md)), and the four conformance profiles tied to [ADR-014](decisions/ADR-014-phased-enforcement-model.md) layers.
- Y1Q2: Public RFC period on v0.9 (GitHub-based, 8 weeks); intake and disposition of comments.
- Y1Q3: **Spec v1.0 freeze** *(Floor)* — semantic-versioned, change-controlled. v1.0 commits the protocol *shape* that lets Layers 2–4 be added without rewrite (ADR-014).
- Y1Q4: Submit an **Internet-Draft (IETF)** or **W3C Community Group** report *(Stretch — depends on external uptake)*; publish the conformance suite v1 spec (the weightlessness gate plus a *functional* gate: lease, scope, audit, intent correctness).

**Track B — Implementation (v1, Layer 1 fully active)**
- Y1Q1: `ashe-core` (TypeScript) — production-shaped: lease issuance/validation/revocation, the interception-chain mediation point ([ADR-007](decisions/ADR-007-interception-chain-pattern.md)), the validation graph engine scaffold ([ADR-008](decisions/ADR-008-validation-graph-tiny-onnx.md)/[ADR-010](decisions/ADR-010-standalone-graph-engine.md)).
- Y1Q2: Cooperating IPC gating — the ASHE broker gates cooperating traffic; bypassing the IPC layer bypasses ASHE (the honest v1 claim).
- Y1Q3: Intent-reconciliation evaluators (tier-1, deterministic + tiny-ONNX default per ADR-008).
- Y1Q4: `ashe workspace init` MVP ([ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md)) — the dev-side surface, wall-up-first; DevContainer adapter as first isolation substrate.

**Track C — Adoption**
- Y1Q2: 2 design partners signed (LOI / informal) — ideally one agent-framework maintainer and one site operator.
- Y1Q3: First external integration spike — a partner runs an agent through `ashe-core` in a non-production setting.
- Y1Q4: Publish an integration guide + a 15-minute "hello, capability lease" quickstart; first conference talk submitted.

**Track D — Sustainability**
- Y1Q1–Q2: Submit 3–4 grant applications (§11). Target close: ≥1 grant by Y1Q4 *(Target)*.
- Y1Q3: Stand up the governance vehicle (foundation or hosted project); publish the governance charter and IP policy.

**Track E — Org**
- Hire/retain: protocol editor (could be PK), 1 reference-impl engineer, fractional devrel. Keep ≤3 FTE-equivalent. (See §12.)

**Exit gate (Y1 → Y2):**
- Spec v1.0 frozen and change-controlled. *(Floor)*
- `ashe-core` passes both conformance gates (weightlessness + functional) in CI. *(Floor)*
- ≥1 external party has run ASHE end-to-end. *(Target)*
- ≥1 grant secured **or** a foundation host committed. *(Target — if neither, trigger the funding-contingency in §15)*

**Y1 metric targets:** 2 design partners; 1 independent integration spike; spec v1.0; 1 grant or host; GitHub: 50+ stars, 5+ external contributors (Target).

---

## 6. Year 2 (2027 Q3 – 2028 Q2) — *Running code, independently*

**Theme:** *Cross the "multiple independent implementations" bar; Layer-2 mediation via the Node.js SDK; the first interop event.*

**Entry gate:** Y1 exit gate passed.

### Workstreams

**Track A — Standard**
- Conformance suite **v1.0 released** as the authoritative interop bar (expands [ADR-020](decisions/ADR-020-weightlessness-proper-application-conformance.md)'s W/H/N/R groups with functional + Layer-2 profiles).
- **First interop event** (IETF-hackathon-style or a hosted ASHE interop) — implementations test against each other and the suite *(Target)*.
- Spec v1.1 — errata + clarifications surfaced by independent implementers (the single most valuable spec feedback there is).

**Track B — Implementation (v2, Layer 2 via Node.js)**
- Node.js runtime hooks: route `fs`, `child_process`, `http` through ASHE for ASHE-aware processes ([ADR-014](decisions/ADR-014-phased-enforcement-model.md) v2 note). Honest claim moves to "all code using the ASHE SDK is mediated."
- Tier-2 evaluators (LLM-backed where the validation graph calls for it; default-to-tiny-ONNX otherwise).
- Continuum **open-core split** lands: Apache-2.0 core vs. the first commercial surface (managed audit + hosted broker) — see Track D.

**Track C — Adoption**
- **≥3 independent conformant implementations** in progress, ≥2 passing the suite *(Target — the keystone Y2 outcome)*. At least one must be non-Continuum (a partner's, a community impl, or a second-language port stewarded separately).
- 5+ agent-vendor or framework integrations (Target); first site operators publish `.well-known/ashe` ([ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)).
- Devrel: docs site, reference quickstarts in 2 languages, an ASHE community forum.

**Track D — Sustainability**
- Continuum commercial v1: managed broker + hosted tamper-evident audit (the `audit.ts` hash-chain productized) + SLA support. First paying design partner *(Target)*.
- Second grant cycle / renew sponsorship; aim for 18-month forward runway.

**Track E — Org**
- Grow to ~4–6 FTE-equiv: +1 conformance/interop engineer, +1 ecosystem/partnerships, +fractional standards counsel. Establish a Technical Steering Committee (TSC) with ≥1 non-Phor seat.

**Exit gate (Y2 → Y3):**
- ≥2 independent implementations pass conformance suite v1. *(Target — if not met, this is the critical risk; see §15 "adoption chicken-and-egg")*
- Layer-2 Node SDK shipped and conformant. *(Floor)*
- Continuum open-core split shipped; ≥1 paying customer **or** a renewed grant. *(Target)*
- TSC seated with external representation. *(Floor)*

**Y2 metric targets:** 3 impls (2 conformant); 5 integrations; 3 `.well-known/ashe` deployments; first revenue or grant renewal; 250+ stars, 20+ contributors.

---

## 7. Year 3 (2028 Q3 – 2029 Q2) — *Multi-language, multi-deployment, compliance-credible*

**Theme:** *The protocol is real in four languages; enterprises can map it to their compliance frameworks; the standards-track motion matures.*

**Entry gate:** Y2 exit gate passed (especially ≥2 conformant impls).

### Workstreams

**Track A — Standard**
- Pursue a **working-group charter** (IETF WG or W3C WG) *(Stretch — gated on demonstrated multi-vendor interest)*; if a formal WG isn't reachable, consolidate the **de-facto** path: a stable spec + dominant conformance suite + plural implementations.
- Spec v2.0 — incorporates Layer-2 lessons and the multi-language conformance results; defines the Layer-3 profile ahead of implementation.
- Publish **compliance mappings**: ASHE audit + capability discipline → SOC 2, ISO 27001, HIPAA, and a FedRAMP-readiness narrative (per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) consequences).

**Track B — Implementation (v3, Layer 2 across languages)**
- SDKs: **Python** (LangChain/AutoGen/CrewAI userbase), **Rust** (path to Layer 3, per ADR-014 priority), **Go** (cloud-native). Each passes conformance.
- Validation-graph maturation ([ADR-008](decisions/ADR-008-validation-graph-tiny-onnx.md)/[ADR-010](decisions/ADR-010-standalone-graph-engine.md)): standalone engine, composable evaluators, the intent-vs-action reconciliation node hardened.
- Begin **Layer-3 spike** (discrete project, own gate): gVisor/Firecracker/eBPF feasibility against the spec.

**Track C — Adoption**
- 15+ integrations; 25+ `.well-known/ashe` deployments (Target); first regulated-industry pilot (fintech/health/gov) on Continuum enterprise.
- Cross-org capability federation pilot (one org's capability tokens accepted by another under policy) — the [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) "what becomes possible" item.

**Track D — Sustainability**
- Continuum enterprise: compliance evidence packs, role-template libraries, Layer-2 managed enforcement. Revenue covers a growing share of foundation sustainability (Target: ≥30%).
- Sustained sponsorship program (corporate members of the foundation).

**Track E — Org**
- ~7–10 FTE-equiv. Per-language maintainer model (some community, some funded). Formal contribution governance (RFC process, maintainer guidelines, CoC).

**Exit gate (Y3 → Y4):**
- 4-language conformant SDK matrix (TS/Python/Rust/Go). *(Target)*
- Compliance mappings published; ≥1 regulated pilot live. *(Target)*
- Layer-3 spike produces a go/no-go decision with evidence. *(Floor — the decision is the deliverable, not necessarily "go")*
- Standards-track motion: WG charter *(Stretch)* **or** an explicit, documented de-facto-path pivot. *(Floor)*

**Y3 metric targets:** 4 SDKs; 15 integrations; 25 site deployments; ≥30% sustainability from revenue; 750+ stars, 50+ contributors.

---

## 8. Year 4 (2029 Q3 – 2030 Q2) — *Adversarial-grade enforcement; production at scale*

**Theme:** *Layer 3 runtime mediation in production — the first point at which ASHE bounds the blast radius of uncooperative code, not just cooperating code.*

**Entry gate:** Y3 exit gate passed; Layer-3 spike = "go."

### Workstreams

**Track A — Standard**
- Layer-3 **conformance profile** finalized and added to the suite (syscall-mediation correctness, blast-radius bounding tests).
- Spec v2.x maturation toward standards-track stability; independent security review / formal-ish analysis of the core protocol commissioned and published.
- Interop event #2/#3; cross-implementation Layer-2 interop demonstrated publicly.

**Track B — Implementation (v4–v5, Layer 3)**
- Layer-3 runtime mediation shipped: eBPF (Linux), sandbox integration (gVisor/Firecracker). Honest claim: "syscalls from controlled processes go through ASHE; vulnerability impact bounded to the capability set."
- Continuum production hardening: HA broker, performance at scale (validate the WEIGHTLESS budget under real load per [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md)), revocation at scale.
- Begin **Layer-4 research** (TPM/TEE attestation, signed capability tokens) — discrete, own gate.

**Track C — Adoption**
- Enterprise production deployments (Target: 5–10 organizations running ASHE Layer-2/3 in production).
- A frontier or major agent vendor ships an ASHE integration in a shipping product *(Stretch — a tipping-point signal)*.
- 50+ `.well-known/ashe` site deployments; an ASHE-aware tool ecosystem (editors, CI, deploy tools per ADR-017 adapter priorities).

**Track D — Sustainability**
- Continuum revenue covers ≥50% of sustainability (Target); diversified grants/sponsorship cover the neutral-governance remainder.
- Endowment-style runway: ≥24 months forward funding secured.

**Track E — Org**
- ~10–15 FTE-equiv. Security engineering capacity for Layer-3. Foundation operations formalized (membership dues, events, conformance certification program).

**Exit gate (Y4 → Y5):**
- Layer-3 shipped and conformant; ≥3 production deployments at Layer-2/3. *(Target)*
- Independent security review published. *(Floor)*
- Sustainability ≥50% non-grant-dependent **or** multi-year grant secured. *(Target)*

**Y4 metric targets:** Layer-3 GA; 5–10 production orgs; published security review; 50+ site deployments; ≥50% revenue sustainability; 1500+ stars.

---

## 9. Year 5 (2030 Q3 – 2031 Q2) — *De facto standard; hardware-rooted pilots*

**Theme:** *ASHE is the protocol people reach for when an agent needs bounded authority — ratified or de-facto — with hardware-anchored enforcement available for the highest-stakes deployments.*

**Entry gate:** Y4 exit gate passed.

### Workstreams

**Track A — Standard**
- **Ratification or documented de-facto status** *(Stretch / north star)*: either a published RFC / W3C Recommendation, or the demonstrable de-facto position — stable spec, dominant conformance suite, 5+ independent implementations, broad production adoption, neutral governance.
- Spec v3.0 — the mature, multi-layer standard. Conformance certification program operational (third parties can certify "ASHE-conformant, Layer N").

**Track B — Implementation (v6 pilot, Layer 4)**
- Layer-4 hardware-rooted pilots: TPM/TEE attestation, hardware-verified capability tokens, for the highest-stakes deployments. Honest claim: "mediation hardware-anchored; capability boundaries cryptographically enforced; trust base = hardware root + protocol implementation."
- Continuum: full enforcement-layer spectrum (1→4) offered; the flagship but not sole conformant implementation.

**Track C — Adoption**
- Cross-vendor ubiquity: multiple agent vendors, multiple frameworks, a meaningful fraction of agent-facing site operators publishing `.well-known/ashe`.
- ASHE referenced in enterprise procurement / agent-security RFPs as an expected capability *(Stretch — the strongest adoption signal there is)*.

**Track D — Sustainability**
- Self-sustaining: Continuum revenue + foundation membership + targeted grants cover operations with multi-year runway. Neutrality preserved (no single funder >~25% — a capture guardrail).

**Track E — Org**
- ~15–20 FTE-equiv across foundation + Continuum, with a healthy external maintainer/contributor community larger than the funded team — the real marker of a standard that has escaped its origin.

**Exit gate (Y5 — "have we won?"):**
- ≥5 independent implementations, ≥3 in production at Layer-2+. *(Target)*
- Ratification achieved **or** de-facto criteria objectively met. *(Stretch — north star)*
- Layer-4 pilot demonstrated. *(Target)*
- Self-sustaining funding with neutrality guardrails intact. *(Target)*

**Y5 metric targets:** 5+ impls; ratified/de-facto; Layer-4 pilot; self-sustaining; contributor community > funded team.

---

## 10. Governance & IP

- **License:** ASHE spec + `ashe-core` under **Apache 2.0** (patent grant included — the anti-ambush posture already in [NOTICE](NOTICE)/[LICENSE](LICENSE)).
- **Vehicle:** decide at inception between (a) a new lightweight foundation and (b) hosting under an existing neutral home (Linux Foundation / OpenSSF / Joint Development Foundation for the spec). Default lean: **host under an existing foundation** (faster neutrality credibility, lower ops burden) and graduate to a dedicated entity only if scale demands. *(Floor decision at inception.)*
- **Decision process:** documented RFC/ADR process (the existing ADR discipline extends into governance). A Technical Steering Committee seated by Y2 with mandatory non-Phor representation; a hard rule that **no single organization holds a TSC majority**.
- **Trademark:** "ASHE" and the conformance mark held by the neutral entity, licensed for conformant use — the standard lever for keeping "ASHE-compatible" honest.
- **Capture resistance:** funding-concentration cap (no funder >~25% of operating budget by Y5); open meeting minutes; public conformance results.

---

## 11. Funding plan (grant + sponsorship + open-core)

**Why this is fundable.** ASHE sits at the intersection of (a) AI safety / agent containment — the [CASE-FOR-NOW](CASE-FOR-NOW.md) weaponization narrative — and (b) open internet/security infrastructure. Both have established philanthropic and public funders.

| Source class | Specific prospects | Fit | Stage |
|---|---|---|---|
| Open-internet / security infra | Sloan Foundation, Open Technology Fund, NLnet (NGI Zero), Mozilla | "Public-good protocol + running code" is exactly their pattern | Y0–Y2 |
| AI-safety philanthropy | Open Philanthropy, Survival & Flourishing Fund, Longview, AI-safety-oriented funders | Structural agent-containment / bounded-outcomes thesis | Y0–Y3 |
| Public research | NSF (SaTC / cyberinfrastructure), EU Horizon / NGI, national cyber agencies | Standards + reference impl + conformance | Y1–Y4 |
| Foundation hosting / sponsorship | Linux Foundation, OpenSSF corporate members | Neutral home + corporate sponsorship dues | Y1–Y5 |
| Open-core revenue (Continuum) | Enterprise managed broker, compliance packs, support | Sustainability, subordinate to adoption | Y2–Y5 |

**Funding trajectory (planning, not commitment):** Y0–Y1 seed grant(s) to fund spec freeze + reference impl; Y2 foundation hosting + first revenue; Y3–Y4 diversified grants + growing revenue (→≥50% by Y4); Y5 self-sustaining with the <25%-per-funder neutrality cap.

**Contingency:** if no grant and no host by end of Y1, fall back to a lower-burn track — PK + 1 engineer, slower layer trajectory, Continuum revenue prioritized earlier for survival — without abandoning the open spec (see §15).

---

## 12. Org & hiring plan (lean, standards/eng-weighted)

| Phase | FTE-equiv | Roles added |
|---|---|---|
| Inception | 1–2 | Protocol editor (PK), 1 reference-impl engineer (fractional ok) |
| Y1 | ~3 | +1 reference-impl engineer, +fractional devrel |
| Y2 | ~4–6 | +conformance/interop engineer, +ecosystem/partnerships, +fractional standards counsel; seat the TSC |
| Y3 | ~7–10 | per-language maintainers (mix funded/community), +compliance specialist |
| Y4 | ~10–15 | +security engineering (Layer 3), +foundation ops |
| Y5 | ~15–20 | steady-state foundation + Continuum split; external contributors > funded team |

Principle: **fund the conformance suite, the spec, and devrel before funding breadth of features.** A standard is won by interop and adoption capacity, not by feature count.

---

## 13. Metrics & KPIs

Adoption-weighted, because adoption is the north star. Reported quarterly.

| KPI | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| Independent implementations (any pass conformance) | 1 (ref) | 3 (2 conformant) | 4+ | 5+ | 5+ (3 in prod) |
| Enforcement layer (reference impl) | 1 | 2 | 2 (4 langs) | 3 | 4 (pilot) |
| Agent-vendor / framework integrations | 1 | 5 | 15 | 30 | broad |
| `.well-known/ashe` site deployments | 0 | 3 | 25 | 50+ | meaningful fraction |
| Enterprise production orgs | 0 | 0–1 | 1 (pilot) | 5–10 | scale |
| Sustainability from revenue | 0% | first $ | ≥30% | ≥50% | self-sustaining |
| Spec status | v1.0 | v1.1 | v2.0 | v2.x | v3.0 ratified/de-facto |
| Community (contributors) | 5 | 20 | 50 | 100+ | > funded team |

**The single most important metric is the second independent conformant implementation (Y2).** Everything before it is preparation; everything after it is a real standard. If one number is red, it's that one.

---

## 14. Gate summary (go/no-go decision points)

| Gate | When | Pass condition | If failed |
|---|---|---|---|
| Inception exit | Y1Q1 | E2E lease→mediate→audit works; spec skeleton; 1 grant submitted; governance vehicle chosen | Extend inception; do not open Y1 |
| Y1 exit | Y1Q4 | Spec v1.0 frozen; ref impl passes both gates; 1 external E2E run; grant or host | Trigger funding contingency (§15) |
| Y2 exit | Y2Q4 | ≥2 conformant impls; Layer-2 shipped; open-core split + ($ or grant); TSC seated | **Critical** — re-examine adoption thesis (§15) |
| Layer-3 spike | Y3 | Feasibility evidence → explicit go/no-go | If no-go, hold at Layer 2; standard can still win |
| Y3 exit | Y3Q4 | 4-lang SDKs; compliance mappings; regulated pilot; WG charter or de-facto pivot | Pivot to de-facto path |
| Layer-4 research | Y4 | Attestation feasibility → go/no-go | If no-go, Layer 3 is the ceiling; acceptable |
| Y4 exit | Y4Q4 | Layer-3 GA; 3+ prod deployments; security review; ≥50% sustainability | Slow Layer-4; consolidate |
| Y5 "won?" | Y5Q4 | 5+ impls; ratified/de-facto; Layer-4 pilot; self-sustaining | Iterate; the standard race is long |

---

## 15. Risk register

| # | Risk | Likelihood × Impact | Mitigation |
|---|---|---|---|
| R1 | **Competing standard captures the layer** — MCP extends into capability mediation, or a frontier vendor ships proprietary agent-authorization first | High × High | Position ASHE as *composing above* MCP/auth.md (already the stated posture, [README](README.md)); move fast to the conformance bar; recruit the very vendors who'd otherwise build proprietary; neutral governance as the differentiator they can't match |
| R2 | **Adoption chicken-and-egg** — no second implementation because no adoption, no adoption because no second implementation | High × High | Fund/steward the second implementation directly (Y2 keystone); make the SDK + conformance suite so good that re-implementing is cheap; design-partner LOIs early |
| R3 | **Funding shortfall** — grants don't land, sustainability lags | Medium × High | Diversified prospect list (§11); Y1 contingency (lower-burn, revenue-earlier); never let runway drop below the next gate |
| R4 | **Governance-capture suspicion** — perceived as a Phor land-grab, killing neutral adoption | Medium × High | Neutral foundation host early; non-Phor TSC majority guardrail; funder-concentration cap; open everything (minutes, conformance, decisions) |
| R5 | **Layer-3 complexity** — runtime mediation proves harder/slower than planned | Medium × Medium | It's a discrete gated project (ADR-014); the standard can win at Layer 2; Layer 3 is value-add, not a precondition |
| R6 | **Key-person concentration** (PK) | Medium × High | Document everything (this corpus already does); seat a TSC; grow maintainers; the ADR discipline is the bus-factor insurance |
| R7 | **Overclaim / credibility loss** — a layer's claims get conflated, hostile readers pounce | Medium × High | ADR-014/015 honesty discipline is mandatory; per-layer claim ceilings; published evidence grades; commissioned security review (Y4) |
| R8 | **Spec churn** — v1 freezes the wrong shape, forcing a rewrite | Low × High | v1.0 commits only the *shape* that admits Layers 2–4 without rewrite (ADR-014); independent implementers stress the spec early (Y2 interop) |

---

## 16. Sequencing logic (why this order)

1. **Spec freeze before SDK breadth** — you cannot ask a second party to implement a moving target. v1.0 freeze (Y1) gates the independent-implementation push (Y2).
2. **Conformance suite before adoption push** — adoption without a conformance bar produces incompatible forks, which kills a standard. The suite (started at inception via ADR-020) is the spine.
3. **Layer 1 → 2 → 3 → 4, never skipped** — ADR-014's explicit rejection of "jump to Layer 3." Each layer validates the protocol shape at lower cost before the next layer's investment.
4. **Standardization motion after running code, not before** — IETF/W3C bodies adopt rough consensus *and running code*; submitting a draft (Y1Q4) only after the reference impl and conformance suite exist is what makes it credible rather than vaporware.
5. **Revenue subordinate to adoption** — open-core commercial surfaces (Y2+) are timed to *fund* the adoption flywheel, never to fence it.

---

## 17. What success and failure look like at Year 5

**Success:** an agent vendor adding capability mediation reaches for ASHE the way a web service reaches for TLS — because it's the neutral, well-specified, multiply-implemented, conformance-tested standard, with hardware-anchored enforcement available when the stakes demand it. Continuum is a healthy commercial implementation among several. The foundation is self-sustaining and uncaptured.

**Acceptable partial win:** ASHE is the de-facto standard in a meaningful niche (e.g., agentic dev workflows via the sealed-workspace surface) even if not universal; Layer 3 is the production ceiling; the spec and conformance suite are the reference others build against.

**Failure modes to detect early:** the second implementation never appears (R2 — detect by end of Y2); a proprietary competitor reaches ubiquity first (R1 — detect by Y2–Y3 adoption curves); funding forces abandonment of neutrality (R3/R4 — detect at each funding gate). Each has a named mitigation and gate above; none is allowed to arrive as a surprise.

---

*This roadmap is itself change-controlled. It is reviewed at every annual exit gate and revised against reality — slippage is expected and managed, not hidden. The north star does not move: **a public, neutral, multiply-implemented capability-broker standard for the agent era.***
