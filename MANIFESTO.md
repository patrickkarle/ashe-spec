# ASHE — Manifesto

> *The universal driving regulations + licensing system for the agent age. Portable. Omni-present. Strictly additive.*

---

## What ASHE is, in one paragraph

**Every software is a harness** — a defined operational envelope with controls, capabilities, and limits the application designer chose to expose. **Agents are drivers** — entities that operate the harness to accomplish work. **ASHE is the universal driving regulations + licensing system for the agent age**: portable so an agent licensed once can drive any compliant software, omni-present so the same governance applies wherever the agent goes, structurally separated so applications own what's drivable while ASHE owns what's permitted.

The harness *is* the application. Microsoft owns Excel; Adobe owns Photoshop; Figma owns the design canvas; Anthropic owns Claude Code. ASHE doesn't replace any of those — it provides the universal vocabulary for the driver's license + traffic laws + audit trail + insurance layer that lets agents safely operate any of them, with the same governance everywhere. Identity is delegated to existing primitives (OAuth, OIDC, [auth.md](https://workos.com/blog/auth-md)); capability mediation, intent declaration, audit trail, frictionlessness discipline, phased enforcement, and cross-vendor consistency are what ASHE adds above.

Concretely: if you're using Claude-in-Excel today, OAuth-via-your-Anthropic-account already handles identity. What's missing — no logging, no memory, no audit trail, no shadow backup, no diffing UX, no intent anchoring, coarse 3-mode auth — is exactly what ASHE adds above the OAuth layer. Microsoft doesn't replace anything; ASHE is the layer that makes the existing arrangement *safe*. The same pattern generalizes to every application with embedded agents: same delegation of identity, same addition of capability layer, same audit shape, same cross-vendor consistency. (See [CASE-FOR-NOW.md §2.8](CASE-FOR-NOW.md#28-mundane-embedded-agent-risk--the-excel-with-claude-exemplar) for the Excel-with-Claude concrete walkthrough.)

What follows is the precise technical execution of that paragraph.

---

## The problem, named in present tense

AI coding agent permission models in mid-2026 vary substantially in sophistication. **Claude Code (Anthropic)** has built a notably sophisticated capability-mediation system: 6 permission modes, `Tool(specifier)` rule syntax with wildcards + allow/ask/deny precedence, compound-command awareness, OS-level sandboxing via Seatbelt/bubblewrap (the sandboxed Bash tool), whole-process isolation via the sandbox runtime, PreToolUse hooks for runtime evaluation, an auto-mode LLM safety classifier, managed-settings hierarchy with enterprise policy enforcement, and a reference dev container with iptables firewall + persistent volumes + non-root user enforcement. **This is much closer to capability mediation than most readers realize, and is in many respects already a working implementation of the patterns ASHE proposes to standardize.** Other tools — Codex (OpenAI, 4-mode system), Cursor, Devin, Windsurf, GitHub Copilot Agent Mode, Replit Agents — generally implement simpler vendor-specific models. **There is no cross-vendor standard any of them conforms to.** A developer using multiple tools, or an organization governing multi-tool deployment, faces N×M reconciliation: each tool's permission model is unique; each tool's audit format is unique; each tool's sandbox approach is vendor-specific.

The foundational layer of agent-protocol standardization **does exist** as of mid-2026: Model Context Protocol (Anthropic, Nov 2024; 97M monthly SDK downloads; Linux Foundation governance since Dec 2025), auth.md for agent registration (WorkOS, May 2026), OAuth 2.1 + PKCE + RFC 9728 + RFC 8707 as the MCP-spec required auth primitive, and eight commercial platforms (WorkOS, Stytch, Auth0/Okta, Composio, Nango, Arcade, TrueFoundry, Cloudflare Agents SDK) covering the auth + tool-execution slice. **What is missing is the next-layer protocol above this foundation** — the layer that adds intent declaration as primitive, provenance-by-construction, validation-graph evaluator pipeline, phased enforcement trajectory toward runtime mediation, BuildService for code-change proposals, sealed-workspace pattern, frictionless capability mediation, and wire-format efficiency at agentic-web scale.

At that scale, the cost matters: AI agents fetching HTML pages designed for humans waste tokens and runtime at a ratio of roughly 2-5× over structured alternatives ([arXiv 2511.23281](https://arxiv.org/abs/2511.23281), controlled study, Steiner-Peeters-Bizer, WWW '26). Cloudflare reports AI bot traffic at **32% of their network** with cache-defeating access patterns. Wikimedia suffered a **+50% bandwidth surge** from bulk LLM scraping and was forced to block bots entirely. AI search referrals reached 0.9% of total web visits in March 2026 (5× year-over-year; projected 3-5% by end-2027). At 5% of internet traffic processed as agent context, the token volume reaches ~75 quintillion tokens per month — 7,500,000× the entire GPT-4 training corpus per month. Wire-format inefficiency at this scale is energy-grid-relevant.

Anthropic's Project Glasswing (May 2026) publicly established the security trajectory: frontier AI now finds zero-day vulnerabilities at expert-human level, and these capabilities **will proliferate**. The defender stack needs both offensive-side capability (find vulnerabilities before adversaries — Glasswing's domain) AND containment-side capability (bound the impact of vulnerabilities that get exploited — currently unstandardized at the protocol layer).

ASHE addresses the next-layer standardization gap: capability mediation as a structural protocol primitive above MCP and auth.md, with intent declaration + provenance + validation-graph + phased enforcement + sealed-workspace + frictionless UX. It composes with the foundational layer; it doesn't replace it.

---

## What ASHE is

**A next-layer capability-broker protocol** that composes above MCP (agent-tool standard), auth.md (agent registration standard), and the commercial agent-auth platforms. ASHE adds the layer that those collectively don't cover: sealed software exposing operations through declared capabilities; agents obtaining capability tokens authorizing specific actions with bounded scope and time; every capability exercise audited; intent declared as protocol primitive; provenance-by-construction for hallucination-actionability bounding; multi-tier evaluator pipeline; phased enforcement trajectory toward runtime mediation.

**Pull up the wall, then develop inside.** The sealed-workspace pattern (ADR-017) is the foundational development-lifecycle application: `ashe workspace init` becomes step 1 of any new project, the same way `git init` is today. Inside the wall, developers and agents operate normally — frictionless via standing capabilities + risk-tiered automation + cached approvals + inferred intent. The wall mediates at boundaries: production deploys, secret access, capability escalation, irreversible destruction. The architectural analogy is **TLS for the agent layer** — invisible most of the time; explicit only at risk boundaries.

**Built on 50 years of capability-based security research, recombined into something distinct.** KeyKOS (1980s), EROS / CapROS (1990s-2000s), seL4 (2009, formally verified microkernel), Capsicum (FreeBSD), Genode, Apple's App Sandbox, OpenBSD pledge/unveil, eBPF + LSMs, gVisor / Firecracker — all of these implement capability discipline at narrower scopes. ASHE inherits the lineage and composes above it. The relationship is **shared parts, different thing**: same primitives as predecessors, different integration with specific intent (cross-vendor capability broker for agent-mediated action) and specific scope (tri-surface — agent-side per [ADR-014](decisions/ADR-014-phased-enforcement-model.md), dev-side per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md), web-side per [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)). ASHE generalizes the pattern to **the cross-system protocol layer** that the existing ecosystem (MCP, auth.md, commercial platforms) does not yet provide.

**The deepest property: vulnerabilities decouple from impact.** Even fully compromised code can only do what its held capabilities permit. A zero-day in a JPEG parser gives the attacker JPEG parser capabilities — not your SSH keys, not your databases. Damage is bounded by capability scope, not by codebase scope.

**Adopted via a dual-surface model.** Sites add `/.well-known/ashe` (per [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)) alongside their existing HTML; agents discover ASHE availability and prefer it; humans continue using the HTML site. The handshake at `.well-known/ashe` adapts its representation to declared agent intent (user-directed / task-directed / autonomous-cascade), delivering wire-economy end-to-end. ALPN multiplexing serves both protocols on port 443. Risk-free adoption; never forces migration; coexistence indefinite.

**Composes with the existing ecosystem.** Consumes MCP tool catalogs as one capability-catalog source; consumes auth.md credentials (ID-JAG / OTP-claimed) as session-establishment input; composes with WorkOS FGA / Arcade / Auth0 as authorization backends; runs on Cloudflare Workers + Agents SDK as edge deployment; uses Composio / Nango integration catalogs as tool wiring underneath; routes through TrueFoundry Gateway in multi-server deployments. ASHE is the **next-layer standardization** these platforms can interoperate through, not a replacement for any of them.

---

## The bounded-outcomes commitment

ASHE is **non-invasive** at the model layer, **frictionless** at the user layer, and **non-model-capability-limiting** at the cognitive layer. The combined commitment is load-bearing for what ASHE makes possible.

**Non-invasive**: ASHE does not modify the model. No RLHF cooperation required, no training-time constraints, no context-window pollution. The protocol operates external to the model at the dispatch / lease / audit boundary.

**Frictionless**: Per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) Commitment 2 (mandatory). Standing capabilities + risk-tiered automation + cached approvals + inferred intent eliminate per-action approval friction. Architectural analogy: TLS for the agent layer — invisible most of the time; explicit only at risk boundaries.

**Non-model-capability-limiting**: The model retains full reasoning, planning, exploration, creativity. The capability lease determines outcomes; the lease does not determine cognition. **Bounded outcomes ≠ censored behavior.** This is the structural alternative to current internal-self-limitation safety paradigms.

The moral-strategic implication: **ASHE-or-equivalent is the precondition for responsible release of full-capability models**. The current "withhold-and-lobotomize" equilibrium — where safety lives inside the model via training-time constraints — is a stable equilibrium only if safeguards must live inside the model. If safeguards can live in a non-invasive non-limiting protocol layer, the withholding posture becomes the less responsible choice. Withholding has costs (capability hoarding, asymmetric defender disadvantage, beneficial creative uses blocked indiscriminately along with malign uses) that the protocol-layer-safeguards path does not impose.

ASHE provides the protocol layer that makes capable-model release safe-by-bounded-outcomes. Full moral-strategic case in [CASE-FOR-NOW.md §1.7](CASE-FOR-NOW.md#17-bounded-outcomes-vs-censored-behavior--the-structural-inversion); compound-benefit + rejection-motivation analysis in [§1.8](CASE-FOR-NOW.md#18-the-compound-benefit-case--the-politics-of-rejection).

---

## What ASHE is NOT

- **Not a replacement for MCP.** MCP is the de facto agent-tool-discovery standard (Anthropic Nov 2024; Linux Foundation Dec 2025; 97M monthly SDK downloads). ASHE composes above MCP as the next-layer capability-mediation protocol. ASHE can expose MCP-style tool catalogs underneath its capability layer; doesn't displace MCP.
- **Not a replacement for auth.md.** auth.md (WorkOS, May 2026) standardizes agent registration via ID-JAG or OTP-claimed flows. ASHE consumes auth.md output as session-establishment input. Complementary.
- **Not a replacement for the commercial agent-auth platforms.** WorkOS, Stytch (Twilio), Auth0/Okta, Composio, Nango, Arcade, TrueFoundry, Cloudflare Agents SDK each cover slices of auth + tool execution + integration. ASHE composes above them as the next-layer protocol; they remain valid authorization backends, integration catalogs, or deployment infrastructure underneath ASHE.
- **Not a replacement for OAuth / IAM.** Identity grants the right to request capabilities; ASHE manages capability lifecycle. Complementary.
- **Not a replacement for HTTP.** HTTP serves human-browser interaction indefinitely. ASHE serves agent-mediated interaction. Both persist.
- **Not a development environment replacement.** Sealed-workspace pattern composes with DevContainers, GitHub Codespaces, Replit, GitPod, NixOS, Docker BuildKit, gVisor/Firecracker as isolation substrates. ASHE adds the capability-mediation protocol layer.
- **Not a sandbox runtime.** ASHE *decides* whether code needs sandboxing; gVisor/Firecracker *execute* in sandboxes.
- **Not per-action approval friction.** Capability mediation MUST NOT mean per-operation user prompts. Standing capabilities + risk-tiered automation + cached approvals + inferred intent deliver frictionless UX. ASHE is invisible most of the time (Tier A routine operations, ~90% of work); explicit only at risk boundaries (Tier C high-stakes operations, ~2%). The architectural analogy is TLS for the agent layer.
- **Not omniscient.** ASHE cannot detect arbitrary in-memory state changes (physics forbids it). What ASHE delivers is **bounded blast radius** — the impact of any vulnerability is limited to what its compromised component was authorized to do. Containment, not prevention.
- **Not a hallucination fix at the model layer.** Hallucinations happen inside models; ASHE bounds the *actionability* of hallucinated content via provenance-by-construction + capability-mediated dispatch + intent-vs-output reconciliation. Composes with in-model approaches (RAG, factuality grounding, reasoning models).
- **Not a security panacea.** Real limits, honestly named: capabilities cannot prevent collusion among multiple authorized parties; cannot stop perfectly-baseline-mimicking attacks; cannot eliminate the trust regress (which terminates somewhere — at hardware roots in the strongest deployment).
- **Not specific to AI.** Universal intent declaration applies symmetrically to humans, AI agents, services, kernel-internal callers. The protocol doesn't special-case actor type.
- **Not the first standardization motion in the agent-protocol space.** That was MCP. ASHE is the next-layer protocol above MCP + auth.md + commercial platforms, addressing specific gaps the foundational layer collectively does not cover. The honest pitch is composition, not displacement.
- **Not a model-capability limiter.** ASHE bounds *outcomes* via the protocol layer; it does not censor *cognition* or limit *reasoning* at the model layer. The model thinks, plans, explores, and produces freely; the capability lease determines what actually happens in the world. Structural alternative to current internal-self-limitation safety paradigms. See the bounded-outcomes commitment above and [CASE-FOR-NOW.md §1.7](CASE-FOR-NOW.md#17-bounded-outcomes-vs-censored-behavior--the-structural-inversion) for the full moral-strategic case.

---

## What ASHE delivers — by evidence grade

Per ASHE's tiered-claim discipline ([ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md)):

| Tier                                       | Claim                                                                                                                                                                                   | Source                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Floor (empirically validated)**          | Structured alternatives achieve 2-5× token efficiency and 5× runtime efficiency over HTML on identical agent tasks                                                                      | [arXiv 2511.23281](https://arxiv.org/abs/2511.23281) (controlled study, 2025)  |
| **Target (design-grounded)**               | ASHE's wire-level optimizations (Protobuf binary + HTTP/3 + persistent connections + intent-declared transactions) target 10-30× token efficiency and 10-20× runtime efficiency vs HTML | Mechanism-by-mechanism analysis; subject to validation via published benchmark |
| **Stretch (deployment-pattern-dependent)** | Cascade-agent configuration (frontier model for intent + synthesis; cheap model for structured-protocol execution) compounds to 20-50× per-task cost reduction at retail model pricing  | Multi-party economic analysis; favorable conditions required                   |

**Validation commitment**: ASHE v1 publishes controlled-benchmark results replicating the arXiv 2511.23281 methodology against the ASHE reference implementation within 12 months of v1 reference implementation completion. No claim is exempt from measurement.

---

## Why this matters — multi-party simultaneous benefit

ASHE adoption benefits every party in the agent ecosystem at the same time. This is rare; it's also what makes standardization succeed via incentive alignment rather than committee coordination:

| Party                                                            | Benefit                                                                                                                                                        |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontier-model labs** (Anthropic, OpenAI, Google)              | Frees frontier capacity for genuinely hard problems; reduces serving cost; reduces rate-limit pressure; makes agent products more economically viable at scale |
| **Compute providers** (AWS, Azure, GCP)                          | Better GPU utilization (smaller models = better packing); less hot-resource contention; new market for nano-model inference                                    |
| **Agent operators** (Cursor, Anthropic apps, third-party agents) | 10-20× lower per-task cost; faster response; ability to run many more agents on same budget                                                                    |
| **Site operators**                                               | 10-30× lower bandwidth + render cost for agent traffic; capability-based monetization opportunity; better fraud detection                                      |
| **End users**                                                    | Faster responses; privacy via capability-scoped agent delegation (not "agent runs under your full credentials"); higher reliability                            |
| **Energy / sustainability**                                      | Substantial GPU-second reduction at population scale = real measurable energy savings                                                                          |
| **Regulators / compliance**                                      | Auditable agent interactions; structured capability-exercise records; bounded blast radius for incident response                                               |

Same architectural decision; six independent constituencies benefiting; alignment by structure not by persuasion.

---

## Why now

Two signals converge on the present moment:

**Glasswing (Anthropic, May 2026)**: Frontier AI vulnerability discovery is here. Capabilities will diffuse. Defender advantage must be built pre-emptively. The strategic posture Anthropic + 11 industry partners just publicly committed to is the same posture ASHE positioned correctly completes: Glasswing reduces *vulnerability count*; ASHE reduces *vulnerability consequences*. Two layers of the same defender stack.

**Chrome-Gemini integration and parallel browser-AI integration (rolling out now)**: Agent-mediated browsing is becoming the default user experience by vendor decision, not opt-in. Within 5-10 years, the majority of web traffic is agent-mediated. The protocol of the next-generation web is being decided right now; either it's a vendor-specific patchwork that fragments, or it's a credible open standard that unifies.

Standards established BEFORE the catastrophe define the response. Standards proposed AFTER fight for attention amid panic and vendor-capture attempts. The historical pattern — HTTPS, TLS, OAuth, HTTP/2 — consistently rewards being-first-with-credibility. ASHE's window is open and time-bounded; the work has to ship on a timeline matching the demand-window the industry has just publicly opened.

---

## How ASHE adopts in practice

**Phase 1 (year 1-2 from credible standard release)**: 10-100 sites. Strategic adopters — API-first SaaS, agent vendors' own products, hosting platforms signaling agent-readiness. They invest in adoption for strategic competitive position and to validate the standard.

**Phase 2 (year 2-3)**: 1,000-10,000 sites. E-commerce, mid-size SaaS, content publishers seeing measurable agent traffic. They adopt because the cost economics are now demonstrated.

**Phase 3 (year 3-5)**: 100,000-1M sites. Framework defaults — Next.js, Django, Rails, Spring all ship ASHE adapters. New sites get ASHE by default.

**Phase 4 (year 5+)**: 10M+ sites. Hosting platforms (Cloudflare, Vercel, WordPress, Shopify) provide ASHE for all hosted sites. Long-tail accessible. The agentic web is the web.

Each phase has its conformance tier:

- **ASHE-Lite**: minimum viable surface; bootstrap-cheap; intermediaries provide for free
- **ASHE-Standard**: full operator-mode services; audit; intent declaration
- **ASHE-Full**: + build-mode services; tier-2 LLM evaluators; sandbox infrastructure

Sites adopt at the tier matching their investment willingness and agent-traffic value.

---

## Phased enforcement model

ASHE's enforcement is structured into four discrete layers, each strictly stronger ([ADR-014](decisions/ADR-014-phased-enforcement-model.md)). The protocol design accommodates all four; implementations progress as needed:

| Layer                    | Mechanism                               | What ASHE can credibly claim at this layer                            |
| ------------------------ | --------------------------------------- | --------------------------------------------------------------------- |
| 1. Cooperating SDK       | Apps voluntarily use ASHE-API           | "Cooperating IPC traffic is gated"                                    |
| 2. Language-runtime hook | Runtime routes operations through ASHE  | "All code in the hooked runtime is mediated"                          |
| 3. OS-level mediation    | All syscalls mediated (eBPF, sandboxes) | "Vulnerability blast-radius structurally bounded to capability scope" |
| 4. Hardware-rooted       | TPM / TEE cryptographic verification    | "Capability boundaries cryptographically enforced"                    |

v1 ships Layer 1. v2-v3 add Layer 2. v4-v5 explore Layer 3. v6+ explores Layer 4. **Each claim is bounded by which layer is deployed.** No layer-mixing in marketing language; every claim states its enforcement layer.

---

## Open governance commitments

To pre-empt capture concerns:

- **License**: Apache 2.0 (with explicit patent grant) — for the protocol specification, reference implementation, conformance suite, all tooling
- **Governance**: open contribution model; foundation/sponsorship neutrality; no vendor lock-in for the canonical reference
- **Naming**: "ASHE" is the protocol working name through v0.x; wire-level identifiers are neutral (`agent-protocol.v0`, `application/agent-protocol+json`) from day one; public name decided at v1.0 standardization with adopter input
- **Multiple reference implementations explicitly invited** from day one — Continuum's TypeScript implementation is the first; Rust, Python, Go, Java/Kotlin implementations welcomed and supported
- **Conformance is verifiable**: the conformance suite is open; any implementation can certify against it
- **Standards-body engagement** is welcomed but not required; the work proceeds via open-source-first, standards-body-secondary

Full details in [GOVERNANCE.md](GOVERNANCE.md) (forthcoming).

---

## The invitation

ASHE is being developed openly. The artifact bundle is in active iteration (see [VISION.md](VISION.md) for the technical-strategic statement; [decisions/INDEX.md](decisions/INDEX.md) for the decision records; companion artifacts forthcoming). A reference implementation exists within Continuum (Phor's integrated environment for agentic composition); details available upon engagement.

We invite:

- **Implementors** in any language to begin reference-impl work from the canonical `.proto` files (once published)
- **Site operators** to evaluate ASHE-Lite as a complement to their existing HTML surface
- **Agent operators** to provide feedback on the protocol from the perspective of consumers
- **Security researchers** to attack the design — every refutation strengthens it
- **Standards-body participants** to engage if/when ASHE reaches standardization-readiness
- **Critics** to provide informed criticism; defensive scaffolding ([REFUTATIONS.md](REFUTATIONS.md), forthcoming) explicitly invites this

The work is conducted under the principle that **honest evidence-graded claims survive scrutiny that aspirational claims don't**. Every public statement is bounded by what's measured, designed, or conditionally projected. Limits are named. Trust regress is acknowledged. The benchmark publication is a commitment, not a future-tense aspiration.

---

## A note on intellectual honesty

ASHE has been developed through iterative dialogue between PK (Patrick Karle) and Claude (Anthropic) over multiple sessions in early 2026. The dialogue has been adversarial in the productive sense: ideas have been stress-tested, overclaims corrected, framings refined, refutations anticipated and answered. The work has scars from challenge.

This is not "AI-generated content." It is human-AI collaborative work where the human direction has been substantive — naming the scope expansions, identifying the blind spots, demanding evidence grades, insisting on intellectual honesty, killing convenient framings that didn't survive scrutiny. The reverse is also true: many of the architectural insights, citations, and structural commitments came from the AI side of the collaboration.

The provenance is documented; the work product stands on its own technical merit. Slop attacks — "this is AI noise" — collapse against the work itself: specific architectural commitments, named heritage, evidence-graded claims, honest limits, validation commitments. Slop doesn't have these properties; principled work does.

---

## What happens next

The complete artifact bundle (see [VISION.md §12 forward pointers](VISION.md#12-forward-pointers-companion-artifacts)) is being landed in sequence. Public release combines:

1. The artifact bundle (vision, manifesto, prior-art map, threat model, governance, etc.)
2. The reference implementation (Continuum's TypeScript implementation of ASHE v1)
3. The canonical `.proto` files
4. The benchmark report (validates wire-efficiency claims against the arXiv 2511.23281 methodology)
5. The conformance suite

Until all five components are coherent, the work is internal. The public release is the gate.

---

**ASHE is the protocol for the agentic web that the industry has been building piecemeal in vendor silos. It is the cross-system capability broker that capability-based security research has been pointing toward for 50 years. It is the defensive layer that completes the defender stack Glasswing announced. It is the standardization that converts demonstrated 2-5× structured-alternative efficiency into the 99% of the web where alternatives don't currently exist.**

**The work is open. Contribute. Implement. Adopt. Critique. The standardization window is shorter than it looks.**

---

*ASHE — Affordances, State, Hypermedia, Environment — working name through v0.x.*
*Patrick Karle and Claude (Anthropic), 2026.*
*Apache 2.0. Open governance. Multi-implementation. Evidence-graded claims. Honest limits.*
