# ASHE — Changelog

Reverse-chronological record of architectural decisions and significant artifact changes for the ASHE protocol specification.

---

## [2026-05-31] **conformance/ — CI workflow + nascent reference protocol primitives**

Two follow-ons to the executable conformance suite.

**GitHub Actions** ([`.github/workflows/conformance.yml`](.github/workflows/conformance.yml)) — the repo's first CI, scoped via `paths:` to `conformance/**` so the doc-only surface is untouched. Runs `npm ci → typecheck → test:example` on Node 20: the weightlessness gate (ADR-020) now has a green check on every PR that touches it.

**`conformance/src/protocol/`** — the example adapter is no longer a toy; it delegates to a real, in-memory **reference implementation** of ASHE's object-capability core, the embryonic Continuum-style impl the suite wraps:

- **`capability.ts`** — *unforgeable* capabilities (the mint token is module-private; `new Capability(...)` from outside throws) and `CapabilitySet` whose only derivation is `attenuate()`. There is no `grant`/`union`: authority amplification is **unconstructable**, not merely checked — the object-capability primitive (VISION §1, ADR-003) made structural.
- **`actor.ts`** — principals holding a set and nothing ambient; `spawn()` attenuates, so a sub-actor exceeding its parent cannot be built (cascade attenuation, ADR-017).
- **`lease.ts`** — boundary-amortized standing authority with a TTL (WEIGHTLESS amortization; ADR-017 standing capabilities).
- **`tier.ts`** — routine (A/B) vs the deliberate-weight Tier-C boundary.
- **`mediation.ts`** — the interception point (ADR-007) applied structurally: routine held actions pass through with no boundary step and byte-identical payload; an unheld capability is `UNNAMEABLE`, never `DENIED`.

14 protocol unit tests + 11 conformance assertions; `npm run test:example` → **25/25 green**, `tsc --noEmit` clean. `npm test` (no adapter) runs the 14 units and skips the 11 conformance groups. The protocol module is the seed of the reference implementation the ADRs describe; subsequent work grows it (intent declaration, audit, the validation graph).

---

## [2026-05-31] **conformance/ — executable weightlessness-gate suite (ADR-020)**

First runnable arm of the spec. Turns ADR-020's four conformance groups into an executable scaffold under [`conformance/`](conformance/) — the spec repo's first code.

- **Adapter contract** (`src/adapter.ts`): the seam an implementation-under-test implements; four method blocks map one-to-one to the four facets (what/how/when/where). The suite touches no implementation directly.
- **Language-neutral manifest** (`src/manifest.ts`): the 11 tests (W1–W3, H1–H3, N1–N2, R1–R3) as typed data, keyed by id so non-TypeScript implementations report comparable results across the four ADR-014 layers.
- **Four test files** (`tests/group-{w,h,n,r}-*.test.ts`): real assertions, not empty stubs. Sharpest checks — W1 fails a SUT that returns **DENIED** for an unauthorized action (it was nameable, hence evaluated); N2 fails a SUT where disabling ASHE leaves a guarded action **reachable** (a removable front gate, not the system's shape); R2 fails a SUT that gates the routine 98% like the Tier C 2%.
- **Graded, not binary**: Group H records `literal-zero` (structural, Layer 3/4) vs `amortized-small` (procedural, Layer 1, disclosed) per ADR-015 — a Layer-1 implementation passes honestly rather than by over-claiming.
- **Self-verifying**: an illustrative correctly-applied adapter (`src/examples/structural-reference-adapter.ts`) makes `npm run test:example` green (11/11); with no adapter configured the suite skips all groups (it makes no claim about an unwired SUT).

**Stack**: TypeScript + vitest (the ADR-011/017 P0 reference stack). `node_modules` git-ignored; lockfile committed. **Status**: v0.1 scaffold; the weightlessness gate is the first of the conformance commitments in ADR-001/015/017.

---

## [2026-05-30] **ADR-020 — weightlessness is conformant only under proper application**

Promotes the "proper application — the resolving discipline" principle from a WEIGHTLESS.md design note to a **binding conformance gate**. "Weightless" becomes a falsifiable four-part predicate, not an adjective.

**The gate**: an ASHE implementation MAY claim the four hard invariants (no delay / no bandwidth / no data alteration / no interference) on the steady-state path **only if** it satisfies all four facets of proper application, conjunctively:

- **What** — authority modeled as object-capability (*held or absent*); an unauthorized action MUST be *unnameable*, not checked-and-denied.
- **How** — the routine-path boundary MUST be **structural** (the substrate's own mechanism per [ADR-014](decisions/ADR-014-phased-enforcement-model.md) Layer 2/3/4), not a procedural check ASHE runs as an added step.
- **When** — the boundary MUST be established **at construction** (wall-up-first, `ashe workspace init` as step 1 per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md)), not bolted on as a front gate.
- **Where** — literal-zero applied to the ~98% routine path; deliberate weight concentrated at the ~2% Tier C boundary. Uniform enforcement fails this facet.

**What it forbids**: claiming "weightless" for a fast-but-real per-action check (a fast check is still a check), a permission-flag/identity model, a retrofitted gate, or uniform enforcement of the routine path.

**Layer-1 caveat**: cooperating-SDK implementations are not disqualified — they MUST disclose, per [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md) evidence grades, that no-delay/no-bandwidth are **amortized-small (Layer 1)** rather than **literal-zero (Layer 3/4 structural property)**. The gate distinguishes *honest amortized-small* from *false literal-zero*.

**Conformance suite**: four test groups (W/H/N/R, one per facet), conjunctive — all four MUST pass. Group W tests unnameability + zero-ambient-authority; Group H tests no-added-step + byte-identity + layer-disclosure; Group N tests construction-order + no-front-gate (disabling ASHE must make guarded actions *unreachable*, not *ungated-but-reachable*); Group R tests path-classification + no-uniform-enforcement + friction-frequency. Results are graded per invariant (literal-zero vs amortized-small-disclosed), never binary-by-assertion.

**Status**: Accepted. `Builds on` ADR-007, ADR-009, ADR-014, ADR-015, ADR-017. No ADR superseded. INDEX.md and WEIGHTLESS.md cross-reference it.

---

## [2026-05-30] **WEIGHTLESS.md — the weightlessness design principle**

New companion artifact consolidating ASHE's "frictionless by mandate / TLS for the agent layer" promise into a single named engineering property and budget.

**Core principle**: weightlessness is the *placement* of cost, not its absence — *pay once at an amortizable boundary (handshake, intent declaration, lease issuance); make the steady-state per-action path a local check with no network callout, no model token, and no human prompt.* The same handshake-vs-symmetric-crypto split TLS uses, generalized from bytes to actions.

**What it adds**:

1. **Axes-of-weight table** — names every axis a protocol layer can be *felt* on (latency, wire/token, cognitive, footprint, model-layer, adoption) and maps each to the existing ASHE mechanism that drives it toward zero, with ADR anchors.

2. **Hot-path budget** — promotes the [ADR-007](decisions/ADR-007-interception-chain-pattern.md) locally-validated capability token from "v1 optimization" to the steady-state default; separates the rare slow path (Tier C, broker callout) from the routine fast path (in-process validation, sub-millisecond).

3. **Evidence grades** — weightlessness claims tiered Floor/Target/Stretch per [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md); only the <5 ms p99 interceptor bound and the arXiv 2511.23281 structured-over-HTML result are Floor-grade.

4. **Honest limits** — the Tier C friction floor, cold-start boundary cost, the revocation-vs-token-speed trade, and audit-write cost are named as irreducible; weightlessness is *over a session*, not *over a single isolated call*.

5. **Conformance budget** — a checkable per-property budget table; the one-line test: a routine action costs no round-trip, no token, no human attention — and the audit record still exists.

6. **The four hard invariants** — strict statement of weightlessness as absolutes: *no delay, no added bandwidth, no data alteration, no interference.* No-data-alteration is Floor-contractual ([ADR-007](decisions/ADR-007-interception-chain-pattern.md): idempotent, no dispatch-state mutation — pass/deny, never rewrite); no-interference-with-surfaces is Floor-constructional ([ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md) additive + [ADR-009](decisions/ADR-009-deployment-profiles.md) graceful degradation). The honest tension is named: *active enforcement is interference by definition* — literal-zero holds only for pre-authorized actions and structurally-bounded denials, with remaining enforcement weight concentrated at the rare Tier C boundary where interference is the intended function.

7. **Structural vs procedural mediation** — the path to literal zero on delay/bandwidth is making the capability boundary *structural* (object-capability: an unforgeable reference you were never handed is an absence, not a denied check) rather than *procedural* (a check that runs). True-zero is a Layer 3/4 property per [ADR-014](decisions/ADR-014-phased-enforcement-model.md) — where the boundary stops being a step on the path and becomes part of the system's shape, enforced by the substrate's existing mechanism (type system / OS capability / hardware root) at no added cost.

8. **Proper application — the resolving discipline** — weightlessness is not a mechanism you install; it is the default state of a system whose authority boundaries were applied correctly, forfeited the instant they are applied incorrectly. "Properly apply" is four facets of one discipline, all required together: the object-capability primitive (*what*), structurally (*how*), at construction (*when*), on the dominant path (*where*). Drop any one and weight reappears. The point: proper application *removes* the work rather than accelerating it — a fast check is still a check, still weight; weightless means there is no check at all on the path that matters.

**Status**: Companion design note (v0.x), consistent with the existing artifact bundle. No ADR superseded; cross-references [ADR-007](decisions/ADR-007-interception-chain-pattern.md), [ADR-009](decisions/ADR-009-deployment-profiles.md), [ADR-012](decisions/ADR-012-wire-format-grpc-protobuf-with-projections.md), [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md), [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md).

---

## [2026-05-28] **ADR-019 v0.2 — phor-scoped governance refinement**

ADR-019 amended to v0.2 incorporating phor-scoped governance frame as a load-bearing architectural layer that mediates occupant authority.

**What's tightened in v0.2**:

1. **Phor-scoped governance** — Phor is named explicitly as a *governance cell with local constitutional authority*, not a task node or prompt wrapper. The governance stack (Construct law → ASHE protocol → occupant lease → phor-scoped governance → phoreme directives → node-level subagent insertion → provider/model/tool execution → result envelope → phor acceptance → canonical host state) is documented as the canonical authority chain.

2. **Phoremes as local execution law** — Phoremes carry executable governance directives (role, procedure, validation, constraints, gates, acceptance criteria, escalation rules), not just prompt fragments.

3. **Execution classes vs orchestration substrates** — Dynamic Workflows are named as orchestration substrate, NOT a fourth execution class. A workflow-spawned subagent is an agent-worker (or occupant, if explicitly leased) — the workflow is the mechanism, not the identity. Three execution classes remain: provider-call / agent-worker / occupant.

4. **Attenuated-delegation invariant** — Subagents spawned by an occupant do NOT inherit occupant authority by default. They receive attenuated, phor-scoped authority. ADR-019 lists 10 explicit authority invariants.

5. **Schema sketch** — Informative JSON shape for phor execution binding, occupant-only fields, and phor governance contract. Prevents accidental promotion of every worker into an occupant.

6. **Vocabulary terms** — execution presence, phor-scoped governance, node-level subagent insertion, occupant-executor, attenuated delegation, result envelope, resident lease, orchestration substrate. Standardized for consistent use across protocol + reference implementations.

7. **Current implementation boundary** — Explicit current-vs-target distinction. The reference implementation has worker-dispatch primitives and occupancy design intent; full occupant-executor governance remains target architecture.

8. **What-to-avoid table** — 6 overclaims explicitly listed with corrected phrasing.

**Status**: Remains `Proposed` pending working-code validation per ADR-015 methodology.

**Authorship**: Patrick Karle clarification, 2026-05-28.

---

## [2026-05-28] **Public spec repo published (v0.x)**

**What**: Initial public publication of the ASHE protocol specification. Repository structure: MANIFESTO + VISION + CASE-FOR-NOW (the load-bearing narrative artifacts) + 18 ADRs (the architectural decision discipline trail) + this changelog. Published under Apache 2.0 with explicit patent grant.

**Status at publication**:

- 18 ADRs land: 17 at `Accepted` status (ADRs 001-015, 017, 018); 1 at `Proposed` status (ADR-019) pending working-code validation
- ADR-016 (provenance requirements + capability-grounded content) is forthcoming
- ADR-020/021 (vulnerability advisory propagation + CVE-to-capability-scope mapping) are queued for future work
- Reference implementation exists within Continuum (Phor's integrated environment for agentic composition); details available upon engagement
- Conformance suite + benchmark publication committed per [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md) — to be published within 12 months of v1 reference implementation completion

**Intent**: Plant the architectural commitments publicly while inviting substantive critique, conformance discussion, and implementation proposals. Per [CASE-FOR-NOW §1.8.1](CASE-FOR-NOW.md), legitimate critique (technical, governance, evidence concerns) is explicitly welcomed and strengthens the protocol.

---

## [2026-05-27] **ADR-019 (Proposed)** — Three-execution-class distinction (provider-call / agent-worker / occupant)

Protocol-tier ADR naming three agent execution classes as an architectural commitment. Class membership determined by properties (identity / presence / workspace authority / view authority / event bus / mailbox / spawn rights / audit / lifecycle) — not by vendor.

- **provider-call**: stateless API invocation; minimal session-scoped lease
- **agent-worker**: bounded task executor; task-scoped lease with TTL
- **occupant**: stateful resident; standing lease per role per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) templates

Intent (per [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)) is orthogonal to execution class; ASHE handshake carries both.

Status remains `Proposed` pending: working-code validation in the reference implementation; [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) role-template amendment to add `ai-agent (occupant)` and `ai-agent (worker)` templates; conformance-suite per-class probes per [ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md).

The `occupant.spawn` discipline addresses the "shadow-spawn" problem (SDK Agent-tool spawning being invisible to surrounding governance layers) by making spawn observable + leased + audited at the protocol layer.

---

## [2026-05-27] **Phase G Turn 2** — Bounded-outcomes-vs-censored-behavior commitment + compound-benefit case + rejection-motivation analysis

Vision-tier moral-strategic crystallization landing across [CASE-FOR-NOW](CASE-FOR-NOW.md) (§1.7-§1.8), [MANIFESTO](MANIFESTO.md) (new bounded-outcomes commitment section + new "What ASHE is NOT" entry), and [VISION](VISION.md) (§0 metaphor extension + §1 non-invasive-non-limiting principle).

**Structural inversion locked**: safeguards live *outside* the model in a non-invasive, non-limiting protocol layer that bounds outcomes without censoring behavior. The model thinks, plans, and explores freely; the lease determines outcomes; **bounded outcomes ≠ censored behavior**.

**Three commitments named**: non-invasive (doesn't modify the model), frictionless (per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) Commitment 2), non-model-capability-limiting (preserves full reasoning capacity).

**Moral-strategic argument**: ASHE-or-equivalent is the precondition for responsible release of full-capability models. The current "withhold-and-lobotomize" equilibrium is stable only if safeguards must live inside the model. With protocol-layer safeguards available, withholding becomes the less responsible choice.

**Compound benefit case**: ASHE's value spans 10 dimensions (token economy, compute, energy, serving cost, vulnerability containment, patch-window containment, frictionlessness, responsible release, cross-vendor coordination, tri-surface continuity) that compound mathematically rather than add. Wire-economics example: ~5× × 1.3× × 1.4× × 5× × 1.5× × 15× ≈ 1,000× theoretical / 50-100× realistic vs ~29× naive sum.

**Rejection-motivation taxonomy** in [CASE §1.8.1](CASE-FOR-NOW.md): explicit distinction between motivated rejection (capability hoarding / regulatory capture / vendor lock-in / status-quo defense) and legitimate critique (technical / governance / evidence concerns). Legitimate critique strengthens the protocol.

---

## [2026-05-27] **Phase G Turn 1** — Glasswing-one-month operational refresh + CVD funnel quantification + Glasswing-ASHE complete-defender-stack framing

[CASE-FOR-NOW §1](CASE-FOR-NOW.md) restructured from single-section to six-subsection structure (§1.1-§1.6) incorporating operational data from Anthropic's one-month Glasswing update and the quantitative disclosure-funnel data from the Anthropic Frontier Red Team CVD post.

**Bottleneck-shift framing locked** via Anthropic verbatim: *"Progress on software security used to be limited by how quickly we could find new vulnerabilities. Now it's limited by how quickly we can verify, disclose, and patch the large numbers of vulnerabilities found by AI."*

**CVD funnel quantified**: 23,019 candidate vulnerabilities → 1,900 triaged (8.3% pass rate) → 1,726 true-positive → 1,596 disclosed → 97 patched (6.1% remediation rate). Anthropic verbatim: *"the process of independent human triage and review is the rate limiting step."*

**Complete-defender-stack framing locked**: Glasswing (discovery) + ASHE (containment during the structurally permanent lag window between discovery and deployment) = complete stack. The discovery side is being solved. The patching/deployment side is humans-rate-limited. Containment is the only stage that can scale to AI-discovery rate.

---

## [2026-05-27] **Phase F** — Keystone metaphor + Excel-with-Claude concrete exemplar + OAuth-as-delegated-identity adoption pitch

[VISION §0](VISION.md) and [MANIFESTO](MANIFESTO.md) opener landed the keystone metaphor (harness / driver / regulations — capabilities as traffic rules issued by governance layer external to both driver and vehicle).

[CASE-FOR-NOW §2.8](CASE-FOR-NOW.md) landed the Excel-with-Claude concrete exemplar showing the mundane-embedded-agent risk class + the 5-step adoption sequence for application-vendor scenarios.

---

## [2026-05-26] **Phase E-broad+scope** — Tri-surface architecture + predecessor-lineage frame + ADR-018 (`.well-known/ashe`) + ADR-017 prior-art refinement

Tri-surface architectural shape clarified: agent-side enforcement ([ADR-014](decisions/ADR-014-phased-enforcement-model.md)) + dev-side sealed workspaces ([ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md)) + web-side `.well-known/ashe` handshakes ([ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)).

Predecessor-lineage frame landed in [CASE-FOR-NOW §7.4](CASE-FOR-NOW.md): ASHE shares architectural lineage with capability-based security systems (KeyKOS, EROS, seL4, Capsicum, Genode, App Sandbox, gVisor, Firecracker) but proposes a different thing (cross-vendor protocol layer, not a single-system implementation).

[ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) acknowledges Anthropic's Claude Code dev container as feature precedent for the sealed-workspace pattern at the level of isolated environment with managed settings. The protocol-standardization vision (cross-vendor default, four-layer enforcement trajectory, capability protocol layer above the isolation substrate) is ASHE's distinct contribution.

---

## [2026-05-26] **Phase D** — Landscape-honest reframing (composition with MCP/auth.md/commercial platforms, not displacement)

Comprehensive reframing of [CASE-FOR-NOW §7](CASE-FOR-NOW.md) from "no public capability broker exists" to "next-layer protocol composing above the existing ecosystem." Acknowledges:

- MCP (Anthropic, Linux Foundation 2025) as foundational tool-discovery layer
- auth.md (WorkOS, May 2026) as agent-identity layer
- 8 commercial agent-auth platforms (Stytch, Auth0/Okta, Composio, Nango, Arcade, TrueFoundry, Cloudflare Agents SDK, plus extended)
- Claude Code's sophisticated permission system (6 modes, Tool(specifier) rules, sandboxed Bash, sandbox runtime, hooks, auto-mode classifier, managed settings, dev container with iptables firewall) as feature precedent within vendor scope — protocol-standardization vision is ASHE's distinct contribution

ASHE positioned as composition above these layers, addressing specific gaps the foundational layer collectively does not cover (capability mediation as protocol-tier cross-vendor standard with bounded outcomes, frictionlessness mandate, and tri-surface continuity).

---

## Earlier ADRs

ADRs 001-015 landed across earlier design phases. See [decisions/INDEX.md](decisions/INDEX.md) for the complete ADR registry with statuses and dates.

Highlights:

- **[ADR-001](decisions/ADR-001-tiered-conformance.md)** — Tiered conformance discipline
- **[ADR-002](decisions/ADR-002-oidc-identity.md)** — OIDC identity delegation
- **[ADR-003](decisions/ADR-003-invariant-language.md)** — Invariant language / capability descriptor grammar
- **[ADR-006](decisions/ADR-006-toon-dual-projection.md)** — TOON dual projection for context efficiency
- **[ADR-008](decisions/ADR-008-validation-graph-tiny-onnx.md)** — Validation graph with tiny-ONNX-first evaluators
- **[ADR-012](decisions/ADR-012-wire-format-grpc-protobuf-with-projections.md)** — Wire format: gRPC/Protobuf binary canonical + JSON projection + TOON projection
- **[ADR-013](decisions/ADR-013-multi-service-architecture.md)** — Multi-service architecture (SessionService / BlueprintService / OperatorService / BuildService / AuditService)
- **[ADR-014](decisions/ADR-014-phased-enforcement-model.md)** — Phased enforcement model (Layer 1 cooperating-SDK → Layer 2 runtime-hook → Layer 3 OS-level mediation → Layer 4 hardware-rooted)
- **[ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md)** — Validation methodology + tiered claims discipline (Floor / Target / Stretch with evidence grades)
- **[ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md)** — Sealed-workspace foundational dev pattern with mandatory frictionlessness principle

---

## Note on this changelog

This changelog records architectural decisions and significant artifact changes. Internal implementation breadcrumbs (specific file paths, internal class names, internal test counts, internal backup references, dev-team handoff notes) are intentionally omitted — these belong in the reference implementation's internal commit history, not in the public spec repo. The architectural decisions, rationale, and commitments are what's portable across implementations.
