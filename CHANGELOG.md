# ASHE — Changelog

Reverse-chronological record of architectural decisions and significant artifact changes for the ASHE protocol specification.

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
