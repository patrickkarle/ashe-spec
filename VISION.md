# ASHE — Vision

| Field               | Value                                                                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status              | v1.0-draft (foundational artifact; iteration expected through public-readiness gate)                                                                                                                                                                                |
| Date                | 2026-05-25                                                                                                                                                                                                                                                          |
| Authority           | PK + Claude collaboration, May 2026                                                                                                                                                                                                                                 |
| Scope               | Technical-strategic vision for ASHE protocol and reference implementation                                                                                                                                                                                           |
| Audience            | Technical readers evaluating ASHE as a protocol / standardization / reference implementation candidate                                                                                                                                                              |
| Companion artifacts | MANIFESTO (public-facing); CASE-FOR-NOW (urgency); PRIOR-ART (adjacent work); REFUTATIONS (defensive scaffolding); GOVERNANCE (open-license commitments); CONFORMANCE (verification); ADOPTION-PATHWAY (deployment model); BENCHMARK-PLAN (measurement methodology) |

---

## Why this document exists

ASHE has been developed over multiple sessions through iterative dialogue between PK and Claude. Through that dialogue, the project's scope has expanded from "kernel permission gate for AI agents" to "capability-broker protocol for the agentic web." This document captures the matured technical-strategic vision in a form structured for external evaluation.

The document is rigorous about evidence grades (per ADR-015): every empirical claim is tagged as **floor** (empirically validated, source cited), **target** (design-grounded, mechanism named), or **stretch** (deployment-pattern-dependent, conditions stated). Aspirational claims without evidence-grade tags are forbidden.

The document is honest about limits (per the three adversarial-challenge results from the conversation arc): vulnerabilities cannot be prevented (only contained); authorized-malicious actions cannot be fully prevented (only bounded and detected); the trust regress terminates at hardware roots (not earlier).

The document is committed to validation (per ADR-015): the wire-efficiency claims are subject to controlled-benchmark publication within 12 months of v1 reference implementation completion.

---

## 0. What ASHE is, in one paragraph

Every piece of software defines a set of operations and decides which of them it exposes to an AI agent. ASHE determines, for each operation an agent attempts — whether the agent runs embedded inside that software or reaches it remotely over an API, MCP, or a similar interface — whether the agent is permitted to perform it. The software owns which operations exist and which it makes available; ASHE does not change that. Identity — which person the agent acts for — is delegated to an existing token such as OAuth or OIDC. Authority — which operations the agent may perform — comes from a separate capability token (the capability lease) that names a fixed set of operations with bounded scope and lifetime; performing one requires a cryptographic key derived from that token for that exact operation, and an operation the token does not grant produces no valid key, so the agent cannot perform it. For each attempted operation ASHE also requires the agent to declare what it is trying to accomplish, records what the agent did so any party can independently verify it, performs routine operations without asking, and requires explicit approval only for consequential ones (production deploys, secret access, capability escalation, irreversible destruction). ASHE adds this authority, intent, audit, and approval layer above the identity tokens — OAuth, OIDC — that already exist; it replaces none of it.

The protocol spans three surfaces, each foundationally specified: agent-side capability mediation with progressively stronger enforcement ([ADR-014](decisions/ADR-014-phased-enforcement-model.md)); the sealed-workspace development pattern ([ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md)); and the `.well-known/ashe` web-side discovery convention ([ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)). It distinguishes execution classes — occupant, agent-worker, provider-call — each authorized separately under the same protocol, and it adapts its response to the agent's declared intent (user-directed, task-directed, autonomous-cascade). The conformance suite and governance verify implementations against the specification ([ADR-015](decisions/ADR-015-validation-methodology-and-tiered-claims.md)); the audit trail and provenance record which agent performed which operation, for post-hoc verification and liability.

**Bounded outcomes, not bounded cognition.** ASHE bounds what an agent actually does — which operations execute, with what scope — without restricting what the model may reason about, plan, or produce. The model thinks, plans, and explores freely; the capability lease determines what happens in the world. **Bounded outcomes ≠ censored behavior.** This is the essential property that distinguishes ASHE's external outcome-bounding from safety paradigms that constrain the model internally. (See [CASE-FOR-NOW.md §1.7](CASE-FOR-NOW.md#17-bounded-outcomes-vs-censored-behavior--the-structural-inversion) for the full moral-strategic case; §1 below states the architectural commitment that operationalizes the distinction.)

The sections that follow are the precise technical execution. This section states what that execution is, in one paragraph.

---

## 1. The capability-broker thesis

**ASHE is a capability-broker protocol — not a permission system.** The distinction is architectural and consequential.

| Aspect                      | Permission system (status quo)              | Capability broker (ASHE)                                                                          |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| What is granted             | "You may perform operation X"               | "You hold capability X with scope Y until time Z"                                                 |
| Where granted               | Centrally checked at gate                   | Issued as a token; verified per use; revocable                                                    |
| Failure mode if compromised | Attacker gets the user's permissions        | Attacker gets the process's capabilities (which may be far less than the user's identity implies) |
| Composition                 | Permissions are flat; OR/AND policies       | Capabilities compose; capability A + capability B grants compound action                          |
| Revocation                  | Update central policy; gate reflects        | Capability is invalidated; existing holders denied at use                                         |
| Audit                       | "User U did X"                              | "Capability C held by process P was exercised to do X" — finer-grained                            |
| Ambient authority           | Often present (root, sudo, kernel mode)     | Eliminated by construction — nothing has authority it wasn't given                                |
| Zero-day resilience         | Vulnerability + valid identity = compromise | Vulnerability bounded by held capabilities — non-exploitable beyond capability scope              |

This descends from a 50-year research lineage: KeyKOS (1980s), EROS / CapROS (1990s-2000s), seL4 (2009 onward; formally verified), Genode, Capsicum, Apple's App Sandbox, Windows AppContainer, OpenBSD pledge/unveil, gVisor / Firecracker. ASHE generalizes the pattern that all of these implement at narrower scopes to the **cross-system protocol layer**: capabilities issued, verified, revoked across system boundaries via standard wire format.

The deepest security property that follows: **vulnerabilities decouple from impact**. Even fully compromised processes can only do what their held capabilities permit. A zero-day in a JPEG parser gives the attacker JPEG parser capabilities — not your SSH keys, not your databases, not your network connections. Damage is bounded by capability scope, not by codebase scope.

This is achievable in stages (see §5 on phased enforcement). v1 cooperating-tier ASHE doesn't deliver it for adversarial code; v4+ runtime-mediated ASHE does. The architecture composes across all four enforcement layers.

**The software defines the operations; ASHE governs their use.** ASHE governs the operations *within and across* software, not the software itself. Microsoft owns Excel; Adobe owns Photoshop; Figma owns the canvas; Anthropic owns Claude Code. Each of these vendors defines which operations an agent can invoke — the cells, the layers, the design objects, the tools. ASHE provides the cross-vendor governance layer — capability descriptors, intent declaration, audit trail, lease lifecycle, cross-vendor consistency — that determines whether an agent may perform each of those operations. This is the protocol-vs-implementation separation: the protocol defines what is permitted; the implementation defines which operations exist. (See [CASE-FOR-NOW.md §2.8](CASE-FOR-NOW.md#28-mundane-embedded-agent-risk--the-excel-with-claude-exemplar) for the concrete Excel-with-Claude exemplar demonstrating this separation in production-realistic terms.)

**ASHE is non-invasive and non-limiting at the model layer.** The protocol operates external to the model; it does not modify model weights, training, or context-window content. It does not require RLHF cooperation. It does not limit what the model can reason about, plan, explore, or produce. The model retains full cognitive capability; the protocol layer determines what actually happens in the world via capability lease enforcement. **Bounded outcomes ≠ censored behavior** — this distinction is the structural alternative to current internal-self-limitation safety paradigms (RLHF, constitutional training, refusal layers, training-time capability removal), which restrict benign creativity along with malign output. The moral-strategic implication: ASHE-or-equivalent is the precondition for responsible release of full-capability models — the current equilibrium, in which the most capable models are withheld and the released ones are constrained by training-time limits on what they will do, is stable only if safeguards must be enforced inside the model; with protocol-layer safeguards available, withholding becomes the less responsible choice. Full moral-strategic case in [CASE-FOR-NOW.md §1.7](CASE-FOR-NOW.md#17-bounded-outcomes-vs-censored-behavior--the-structural-inversion); compound-benefit + rejection-motivation analysis in [§1.8](CASE-FOR-NOW.md#18-the-compound-benefit-case--the-politics-of-rejection).

### Positioning relative to the existing agent-protocol ecosystem

ASHE is **not the first standardization motion in this space.** As of mid-2026 the foundational layer exists: Model Context Protocol (Anthropic, Nov 2024; 97M monthly SDK downloads by late 2025; donated to Linux Foundation Dec 2025) is the de facto agent-tool-discovery standard; auth.md (WorkOS, May 2026) standardizes agent registration; OAuth 2.1 + PKCE + RFC 9728 + RFC 8707 are required for spec-compliant MCP servers; eight commercial platforms (WorkOS, Stytch, Auth0/Okta, Composio, Nango, Arcade, TrueFoundry, Cloudflare Workers+Agents SDK) cover the auth + tool-execution layer. **Anthropic's Claude Code itself implements substantial capability-mediation primitives** within its own vendor scope — 6 permission modes, `Tool(specifier)` rule syntax, sandboxed Bash tool + sandbox runtime providing OS-level Layer 3 enforcement, PreToolUse hooks, auto-mode LLM safety classifier, managed-settings hierarchy, reference dev container with iptables firewall. These are the strongest single set of capability-mediation *primitives* any major vendor has shipped, and they validate the architectural patterns ASHE proposes to standardize. Other tools (Codex, Cursor, Devin, Copilot Agent, etc.) implement weaker vendor-specific versions.

**The architectural framing as cross-vendor capability-broker protocol — with the four-layer enforcement progression, the tri-surface coherence, the no-per-action-prompts commitment, and the protocol-standardization vision — is not what Anthropic publicly proposes.** That framing is ASHE's distinct contribution. The relationship is the shared-parts/different-thing pattern that has worked historically across protocol design (TCP/IP, HTTP, OAuth, TLS): each successful protocol composed inherited primitives into a new integration with specific intent and scope that its predecessors did not address. (See `CASE-FOR-NOW.md` §7.4 for the full predecessor-lineage table and the layering-posture view.)

**ASHE is a tri-surface protocol system** spanning three structurally distinct surfaces, each foundationally specified:

| Surface | What it does | Foundational ADR |
|---------|--------------|------------------|
| **Agent-side** | SDK + runtime hook + OS-level mediation + hardware-rooted enforcement that brokers capability use by the agent process | [ADR-014](decisions/ADR-014-phased-enforcement-model.md) (four-layer phased enforcement) |
| **Dev-side** | Sealed-workspace pattern as foundational dev-lifecycle convention; `ashe workspace init` as step 1 of any project (analogous to `git init`) | [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) (sealed-workspace foundational dev pattern) |
| **Web-side** | `.well-known/ashe` website discovery convention with handshake delivering capability surface adapted to declared agent intent (user-directed / task-directed / autonomous-cascade) | [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md) (`.well-known/ashe` web-side interaction-point convention) |

Together these three surfaces realize ASHE's full architectural shape. Each is independently adoptable; together they deliver the full capability-broker protocol.

**ASHE's architectural posture is delegate-don't-reimplement.** Protocols that succeed historically (TCP/IP, HTTP, OAuth, TLS) have clean "what I do / what I delegate" boundaries. ASHE makes the same commitment explicit — the protocol does specific things at specific layers and explicitly delegates to existing primitives at every other layer:

| Layer | What ASHE delegates to | What ASHE owns |
|-------|------------------------|----------------|
| **Identity** | OIDC / auth.md / WorkOS / Auth0 / commercial agent-auth platforms | — (delegated entirely) |
| **Isolation substrate** | Containers (Docker / podman) / sandboxes (gVisor / Seatbelt / bubblewrap) / microVMs (Firecracker) / dev containers | — (delegated; [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) provides the adapter interface) |
| **Tool exposure** | MCP | — (delegated; ASHE consumes MCP catalogs as capability-catalog input) |
| **OS-level enforcement** | gVisor / Firecracker / Seatbelt / bubblewrap (Layer 3 per [ADR-014](decisions/ADR-014-phased-enforcement-model.md)); seL4-class verified microkernels (Layer 4) | — (delegated to OS / hypervisor / verified microkernel) |
| **Web-side discovery convention** | RFC 5785 `.well-known/` URI suffix | `.well-known/ashe` specific endpoint per [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md) |
| **Capability descriptor format** | — | ✅ ASHE-defined ([ADR-003](decisions/ADR-003-invariant-language.md)) |
| **Capability broker protocol** | — | ✅ ASHE-defined (multi-service architecture per [ADR-013](decisions/ADR-013-multi-service-architecture.md)) |
| **Capability-grant lifecycle** | — | ✅ ASHE-defined (issue / attenuate / audit / revoke) |
| **Wire format with projections** | — | ✅ ASHE-defined ([ADR-012](decisions/ADR-012-wire-format-grpc-protobuf-with-projections.md)) |
| **Cross-vendor protocol standardization** | — | ✅ ASHE-defined (the protocol-layer commitment) |
| **No-per-action-prompts principle** | — | ✅ ASHE-defined (mandatory architectural commitment per [ADR-017](decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md)) |
| **Phased enforcement progression** | — | ✅ ASHE-defined (Layer 1 → 4 per [ADR-014](decisions/ADR-014-phased-enforcement-model.md)) |
| **Surface-representation by declared intent** | — | ✅ ASHE-defined (novel contribution per [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)) |
| **Tri-surface architectural integration** | — | ✅ ASHE-defined (this section + agent-side + dev-side + web-side ADRs above) |

**ASHE is the next-layer protocol above this established foundation.** It composes with MCP (consumes MCP tool catalogs as one capability-catalog source), composes with auth.md (consumes ID-JAG / OTP-claimed credentials as session-establishment input), composes with the commercial platforms (uses their authorization backends as integration substrate). The honest framing: ASHE rides the wave of MCP/auth.md/commercial-platform success rather than competing for it. Adoption is **strictly additive** — adopters keep their existing investments and add ASHE as the layer above.

---

## 2. The threat taxonomy and ASHE's honest leverage profile

The three classes of threats ASHE addresses, in honest order of frequency:

| Threat class                 | Frequency            | Cost per incident                                            | ASHE's leverage                                                                                                                                                                                                                          |
| ---------------------------- | -------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Accidental leak**          | Very common          | High (data exposure, credential leaks, public cloud buckets) | **Strong** — capability scoping catches "you don't have read access to that"; intent reconciliation catches "you said you were doing X but this would expose Y"; pattern-based detection (credentials in commits, public access changes) |
| **Accidental stupid action** | Very common          | Variable (typo to catastrophe)                               | **Strong** — intent reconciliation catches `rm -rf /` when intent was `rm -rf ./build`; reversibility-first design; multi-stage confirmation for destructive scope                                                                       |
| **Intentional destruction**  | Rare (statistically) | Highest (deliberate attacker is competent)                   | **Moderate** — bound blast radius; force fraudulent declaration as evidence; enable forensics; full prevention impossible                                                                                                                |

**The honest pitch is accident-reduction-first, malicious-prevention-second.** Most expensive incidents in real orgs are accidents, not malicious insiders. ASHE addresses both, but with different efficacy. Selling ASHE as "preventing malicious actors" misrepresents its strongest property; selling it as "dramatically reducing the rate at which competent good-faith people accidentally cause expensive damage" is honest AND matches the cost line that actually dominates real org budgets.

**The taxonomy applies symmetrically to humans and AI agents.** Agents can do crazy stupid things, cause leaks, be corrupted (weaponized LLMs, adversarial fine-tunes, poisoned model hubs), be tricked (prompt injection — confused deputy class), and engage in specification gaming. The defenses (capability minimization, intent declaration, intent-vs-action reconciliation, multi-party approval for high-stakes, audit with reputation) work identically across actor types. The AI agent case is *not* fundamentally different from the human insider case — both manifest as authorized parties doing harmful things in pursuit of approved-seeming goals.

**Universal intent declaration** is the structural mechanism (see §6). Every capability request — human or AI — declares purpose; ASHE evaluators check whether subsequent actions match. The declaration is the anchor; the action is the variable; mismatch is detectable. Required declaration also forces malicious actors to commit fraud as part of the attack chain (declare false intent), which becomes evidence in subsequent investigation.

### Honest limits, explicitly named

- ✗ ASHE cannot detect arbitrary in-memory state changes (physics)
- ✗ ASHE cannot prevent attacks within an authorized capability set (definition)
- ✗ ASHE cannot make vulnerabilities disappear (impossible)
- ✗ ASHE cannot prevent collusion among multiple authorized parties
- ✗ ASHE cannot stop perfectly-baseline-mimicking attacks
- ✗ ASHE cannot eliminate the trust regress — must terminate somewhere

### What ASHE CAN credibly claim

- ✓ Bound the impact of any vulnerability to the compromised component's capability set (with sufficient mediation depth per §5)
- ✓ Detect attempts to exceed granted capabilities (regardless of how the attempt arose)
- ✓ Audit every capability exercise for post-hoc forensics (when mediation captures the boundary)
- ✓ Decouple "code correctness" from "system safety" (capability discipline replaces codebase auditing as primary defense)
- ✓ Scale to arbitrary codebase size because security analysis scales with capability vocabulary, not codebase lines

---

## 3. Wire economics — what ASHE targets at scale

Per ADR-012 (canonical wire format = gRPC/Protobuf binary; JSON projection for compatibility; TOON projection for agent context) and per the tiered-claim discipline of ADR-015:

### Floor (empirically validated, source cited)

The arXiv 2511.23281 controlled study tested four e-commerce sites simultaneously exposed via HTML, MCP, RAG, and NLWeb with identical agent tasks across multiple frontier LLMs. Result: structured alternatives achieved **2-5x token efficiency and 5x runtime efficiency** vs HTML on identical workloads.

> Source: arXiv 2511.23281 (2025); F1 rose from 0.67 (HTML) to 0.75-0.77 (structured); tokens fell from ~241k to 47-140k per task; runtime fell from 291s to 50-62s per task.

Cloudflare data: AI bot traffic is **32%** of their network traffic; access patterns systematically defeat CDN caches (70-100% unique-URL ratios; redundant looping); concrete real-world incident: Wikimedia **+50% bandwidth surge** from bulk LLM scraping forced blocking.

### Target (design-grounded; mechanism named)

ASHE's wire-level optimizations beyond what current JSON-flavored alternatives implement:

| Optimization                                                   | Approximate independent gain                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------ |
| Binary serialization (Protobuf) vs JSON                        | 5-10x payload size reduction                                 |
| HTTP/3 + 0-RTT vs HTTP/1.1 or HTTP/2 per-request               | 20-50% latency reduction                                     |
| Persistent multiplexed connections vs per-request handshake    | Eliminates ~50-200ms TLS overhead per request                |
| Capability tokens vs cookies/headers                           | Eliminates ~200-500 bytes/request of repeated metadata       |
| Streaming server-push vs polling                               | Eliminates polling waste (10-100x for event-heavy workflows) |
| Intent-declared multi-step transactions vs round-trip-per-step | Collapses N requests to 1 (N typically 2-10 for agent tasks) |
| TOON projection for agent context vs JSON in context           | Additional 40-50% context token reduction                    |

Composed, the target is **10-30x improvement vs HTML** on identical workloads — subject to validation via the benchmark per ADR-015.

### Stretch (deployment-pattern-dependent)

With favorable usage patterns — long persistent sessions, heavy streaming, cascade-agent configuration (frontier model handles intent + synthesis; cheaper "mule" model handles structured-protocol execution) — **50-100x improvement** is plausible. Specific conditions must be present; these are not default-expected.

### The cascade-agent economics (model-tier substitution)

A separate efficiency dimension that compounds with wire economics:

Today's pattern: agents use frontier models throughout because the variance of HTML interaction (semantic ambiguity, dynamic content, retry recovery) makes cheap-model execution unreliable enough that monolithic-frontier wins economically despite higher per-token cost.

ASHE's structured protocol changes the variance profile: capability calls are predictable, responses are typed, success patterns are stable. Cheap models execute structured calls *reliably*. The economic case for the cascade pattern — frontier for intent + synthesis bookends; cheap for execution middle — becomes obvious.

Per-task economic comparison for a representative "get US government economic data" task (design-grounded projection; awaiting benchmark validation):

| Cost dimension                 | HTML pattern (today) | ASHE + cascade pattern | Reduction   |
| ------------------------------ | -------------------- | ---------------------- | ----------- |
| Frontier model input tokens    | ~80K                 | ~5K                    | ~16x        |
| Wall-clock time                | 30-60s               | 5-15s                  | ~3-6x       |
| GPU-seconds frontier           | 25-40s               | 1-3s                   | ~10-25x     |
| Rate-limit pressure (frontier) | high                 | minimal                | substantial |
| Cost at retail model pricing   | ~$2.50-4.00          | ~$0.15-0.40            | ~10-20x     |

These are **target-tier** projections (mechanism: structured protocol enables reliable cheap-model execution, which enables economic cascade). Floor: not directly measured (the cited arXiv study tested monolithic agents only). Validation: explicit in ADR-015 benchmark commitment.

---

## 4. Sealed software and the agentic-web endgame

The architectural property that follows from capability mediation + the progression toward agent-mediated web traffic:

### Sealed software (architectural frame)

Software exposing ASHE becomes a *sealed* unit:

| Property                   | What it means                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Defined external interface | All interaction goes through declared capabilities                                  |
| Opaque internals           | External parties can't read/modify state except through approved capabilities       |
| Authenticated callers      | Every interaction has identified caller                                             |
| Authorized operations      | Caller must hold capability for the action                                          |
| Auditable interaction      | Every interaction recorded; reconstructable                                         |
| Tamper-evident             | Modifications detectable via cryptographic signing + audit chain                    |
| Composable                 | Sealed software interacts with other sealed software via respective ASHE interfaces |

This is the same conceptual move that iOS apps (App Sandbox), browser tabs (Same-Origin), containers (cgroups + namespaces), WASM (memory isolation), and smart contracts (blockchain immutability) made at narrower scopes. ASHE generalizes the pattern to arbitrary software via protocol mediation.

### Sealed workspaces (development-lifecycle frame)

> **Per ADR-017 (forthcoming): sealed workspace as foundational development pattern.**

The sealed-software architectural frame extends to **the act of creation itself**. Today's development workflow is filesystem-first: clone repo, open editor, edit files, run tests, push commit. The security/audit/capability properties are bolted on later as policies, code review, or after-the-fact compliance. The current state of AI coding tools (Codex 4-mode, Claude Code, Claude Desktop, Cursor) is mode-based directory scoping — coarse, bypassable, and treats "Full Access" as the only way to grant cross-workspace operations. (See `CASE-FOR-NOW.md` §7.3 for the concrete tri-modal analysis.)

ASHE proposes a different default: **the boundary is established first; development happens inside it.**

| Today's pattern (filesystem-first) | Sealed-workspace pattern (capability-first) |
|---|---|
| `git clone repo` → files on filesystem | `ashe workspace init repo` → sealed perimeter established |
| Open file in editor → direct filesystem read | ASHE-aware editor requests `code.read` capability with file scope; standing capability silently approves for in-scope files |
| Edit file → direct filesystem write | `code.write` capability with scope + intent declaration; audit trail per edit; standing capability for in-scope files |
| Run tests → spawn subprocess | `test.run` capability; subprocess runs in capability-scoped sandbox |
| Commit + push → direct git invocation | `vcs.commit` + `vcs.push` capabilities; per-action audit; multi-party approval for protected branches |
| Deploy to prod → SSH + shell commands | `deploy.production` capability; explicit intent declaration; multi-party approval; reversibility-first |
| Agent assists → agent has user's full OS access | Agent gets capability tokens scoped to declared task; can't escape workspace; can't access unrelated files |
| Build dependencies → arbitrary network access | `network.fetch` capability scoped to declared package registry; supply-chain compromise contained |

**No per-action prompts is central.** Capability mediation MUST NOT impose per-action approval prompts. The mechanisms that remove per-action prompts while delivering fine-grained mediation:

- **Standing capabilities** — routine operations (in-scope reads, in-scope writes, test runs, build invocations) pre-granted at session/role level; no per-action prompt
- **Intent declaration ONCE, actions auto-validated** — declare "working on auth refactor today"; subsequent in-scope operations silently approved
- **Risk-tiered automation**: Tier A (routine, ~90% of operations) auto-approved silently; Tier B (medium, ~8%) auto-approved with audit; Tier C (high-stakes, ~2%) explicit approval required
- **Anomaly-triggered approval** — gates fire only when behavior diverges from baseline; standing capability holds otherwise
- **Cached approvals per session** — approved once, holds for session lifetime
- **Capability inheritance through cascades** — agent spawning sub-agents inherits attenuated capabilities; no fresh approval per child
- **Inferred intent** — when action patterns are unambiguous, no declaration required

The right user/developer experience: ASHE-sealed-workspace feels like normal development with capability mediation running invisibly underneath. Approval prompts are rare and reserved for high-stakes operations (production deploys, secret access, capability escalation, irreversible destruction). The per-operation mediation runs underneath without user interaction for routine operations; the user is unaware of it.

**Heritage**: the pattern descends from real prior work — DevContainers (VSCode), GitHub Codespaces, Replit, GitPod, NixOS pure builds, Docker BuildKit, hermetic builds (Bazel), Capsicum/Capability Sets, App Sandbox+Entitlements, gVisor/Firecracker. ASHE-sealed-workspace is the **cross-tool standardization layer** above these isolation primitives. Each predecessor solves a specific isolation problem; ASHE provides the universal protocol for capability-mediated workspace access.

**Composition, not replacement**: sealed-workspace doesn't require replacing DevContainers, Codespaces, GitPod, gVisor, Docker. It uses them as the isolation substrate and adds the capability protocol above. Adopters keep their existing tooling investments; they add ASHE as the capability-mediation layer.

**Concrete blast-radius reduction for the AI-agent case**: today, an AI coding agent runs with the user's full OS permissions. A prompt-injection attack (Mexico extradition case from `CASE-FOR-NOW.md` §2.2) inherits everything the user can do. In a sealed workspace, the agent receives capability tokens scoped to the declared task — `code.read` on specific files, `test.run` with specific runners, no `network.fetch` outside declared registries, no `production.deploy` capability without explicit multi-party approval. The compromised-agent blast radius collapses from "everything the user can do" to "this task's specific capability set."

The pattern: **establish the boundary, then develop inside it.** ASHE-init becomes step 1 of any new project in the same way `git init` is today.

### The agentic web (deployment frame)

The progression PK has named: every web action eventually mediated by agent. Chrome-Gemini integration is the first shipped instance; Edge-Copilot and Safari + Apple Intelligence are the same pattern; AI assistants (Claude, ChatGPT) are a parallel path. The transition is **already underway** — agent-mediated web traffic is growing from ~5-15% today toward ~50-80% within 5-10 years.

In this progression, ASHE is the protocol of the agent-mediated web layer, at the position HTTP holds for human browsing:

- The **dual-surface model**: `amazon.com` (human-readable HTML, indefinitely) coexists with `amazon.ashe` (agent-readable structured protocol via gRPC + ALPN multiplexing on the same port 443)
- The **well-known URL discovery**: `https://example.com/.well-known/ashe` (per [ADR-018](decisions/ADR-018-well-known-ashe-web-side-interaction-point.md)) returns the service catalog with handshake delivering capability surface adapted to declared agent intent (user-directed / task-directed / autonomous-cascade); agents bootstrap without prior knowledge
- The **conformance tiers** (per ADR-009): ASHE-Lite (minimum viable surface) / ASHE-Standard / ASHE-Full enable phased adoption
- The **intermediary leverage**: CDN-style providers (Cloudflare, Vercel, etc.) provide ASHE adapters to long-tail sites; ~50-100 hosting platforms eventually serve millions of sites

The economic forcing function is multi-party: agent operators save on token costs; sites save on rendering and bandwidth; users get privacy and dignity (capability-scoped agent delegation instead of "agent runs under your full credentials"); compute providers get better GPU utilization; frontier-model labs free capacity for genuinely cognitive work. When multiple parties have simultaneous independent motivation to adopt the same standard, standardization succeeds via incentive alignment rather than committee coordination.

---

## 5. Phased enforcement model

Per ADR-014, ASHE delivers progressively stronger enforcement through four layers; each strictly stronger; ASHE's architecture composes across all four:

| Layer                        | Mechanism                                                               | What ASHE claims at this layer                                                                             |
| ---------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **1. Cooperating SDK**       | Apps voluntarily use ASHE-API; clients import ASHE library              | "Cooperating IPC traffic is gated; SDK consumers get capability mediation"                                 |
| **2. Language-runtime hook** | Runtime routes operations through ASHE; ASHE-aware standard libraries   | "All code in the hooked runtime is mediated, regardless of whether it intentionally adopted ASHE"          |
| **3. OS-level mediation**    | All syscalls mediated via eBPF / LSMs / sandboxes (gVisor, Firecracker) | "Every observable action is mediated; vulnerability blast-radius structurally bounded to capability scope" |
| **4. Hardware-rooted**       | TPM / TEE / SGX-style cryptographic verification                        | "Capability boundaries are cryptographically enforced; protected against compromised OS"                   |

Enforcement-layer progression:

- v1 (current scope) → Layer 1
- v2-v3 → Layer 2 (Node.js SDK; eventually Rust, Python, Go)
- v4-v5 → Layer 3 (gVisor / Firecracker / eBPF integration)
- v6+ → Layer 4 (hardware attestation)

Each layer transition is a discrete project with explicit go-ahead. v1 doesn't commit to v4+; it commits to the protocol shape that allows v4+ to be added without rewrite.

---

## 6. Universal intent declaration

Per the symmetric application of intent declaration to human and AI actors:

**Every capability request declares purpose.** ASHE evaluators check whether subsequent actions match the declaration. This is required of all parties — human, AI agent, automated service, kernel-internal — at the protocol layer.

The friction profile is **inversely correlated with organizational maturity**:

| Org size                  | Intent UX                                | Friction                                                                     |
| ------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| Solo dev                  | Free-form intent + standing capabilities | Friction = minimal until AI agents are involved                              |
| Small startup (2-5)       | Free-form + light templates              | Real friction; partially offset by AI-agent safety value                     |
| Mid-size team (10-50)     | Project-scoped intent menus              | Manageable; aligned with project boundaries                                  |
| Mid-enterprise (100-1000) | Role-based intent menu                   | Low; intent declaration faster than IT-bottleneck provisioning               |
| Enterprise (1000+)        | Role-driven + assigned-task picker       | **Negative friction** — intent declaration faster than current IAM workflows |

ASHE's deployment profiles (per ADR-009) match intent-UX to org maturity. Same protocol surface; different UX overlay. Adoption scales naturally as orgs grow.

The structural property: **agents declaring intent is structurally easier than humans declaring intent** (no social-norm barrier), AND it works for both. ASHE doesn't require special-casing human vs AI — both go through the same capability-request protocol with the same intent-declaration field.

---

## 7. The intelligence cascade (economic frame)

Per the corrected framing (cheap models *can* parse HTML but with lower reliability; ASHE's structured protocol changes the variance profile to make cheap-model execution reliable enough that cascade economics dominate):

Agent task execution structurally splits:

```
User intent ("get me Q3 GDP data with YoY context")
    ↓
[FRONTIER MODEL — bookend 1]
    Decompose intent, plan capability requests
    Tokens: ~5K (expensive)
    ↓
[CHEAP MODEL — execution middle]
    Execute structured ASHE capability calls
    No HTML parsing; predictable success patterns
    Tokens: ~25K (cheap; ~10-20x less per-token cost)
    ↓
[CODE — wire-level operations]
    gRPC framing, Protobuf serialization
    Tokens: 0
    ↓
[CHEAP MODEL — aggregation]
    Format results for frontier consumption
    Tokens: ~5K (cheap)
    ↓
[FRONTIER MODEL — bookend 2]
    Reason about results; synthesize for user
    Tokens: ~3K (expensive)
```

**Frontier-model touch at the bookends only.** 80-90% of operational work runs on cheaper models that reliably handle structured calls. Compounded with wire economics, per-task agent cost reduces ~10-20x at the model layer + ~10-30x at the wire layer; net ~20-50x improvement.

Multi-party benefit (rare alignment):

- Frontier-model labs: freed capacity for genuinely hard problems
- Compute providers: better GPU utilization
- Agent operators: 10-20x lower per-task cost
- Site operators: 10-30x lower bandwidth + render cost
- End users: faster responses, privacy via capability-scoped agent delegation
- Energy / sustainability: substantial GPU-second reduction at population scale

---

## 8. Adoption pathway

Per ADR-009 deployment profiles + the agentic-web progression:

### Phased adoption (years from credible standard release)

| Phase                      | Timeline | Sites adopting                                                                     | Total              |
| -------------------------- | -------- | ---------------------------------------------------------------------------------- | ------------------ |
| **1 — First movers**       | Year 1-2 | API-first SaaS; agent vendors' own products; strategic early adopters              | 10-100 sites       |
| **2 — Strategic adopters** | Year 2-3 | E-commerce; mid-size SaaS; content publishers seeing measurable agent traffic      | 1,000-10,000 sites |
| **3 — Mainstream**         | Year 3-5 | Framework defaults (Next.js, Django, Rails ship ASHE adapters)                     | 100K-1M sites      |
| **4 — Long tail**          | Year 5+  | Hosting platforms (Cloudflare, Vercel, WordPress.com) provide for all hosted sites | 10M+ sites         |

### Conformance tiers (per-site adoption discipline)

| Tier              | Required                                                        | Optional               |
| ----------------- | --------------------------------------------------------------- | ---------------------- |
| **ASHE-Lite**     | SessionService + BlueprintService + 3-5 OperatorService methods | None                   |
| **ASHE-Standard** | + AuditService basic + full OperatorService                     | TOON projection        |
| **ASHE-Full**     | + BuildService + tier-2 LLM evaluators                          | Sandbox infrastructure |

Sites adopt at the tier matching their investment willingness and agent-traffic value. Intermediaries provide ASHE-Lite to long-tail sites at near-zero marginal cost.

The dual-surface model is **strictly additive**: adding ASHE to a site never breaks existing HTML behavior. ALPN multiplexing serves both protocols on port 443. Risk-free adoption; reversible if needed; coexistence indefinite.

---

## 9. The pre-catastrophe standardization period

Per the Glasswing-defined moment (Anthropic + 11 major industry partners publicly established that frontier AI finds zero-days at scale; capabilities will "proliferate"; defensive capability must be built in advance):

The catastrophe trigger is now publicly named. ASHE positioned correctly is the **complementary defensive layer** to Glasswing:

- **Glasswing**: offensive-side posture — find vulnerabilities before adversaries; reduce vulnerability count
- **ASHE**: containment posture — bound the impact of vulnerabilities that get exploited; reduce vulnerability *consequences*

The two layers compose; either alone is partial; both together is defense-in-depth.

The standardization period is open and time-limited. Standards established BEFORE the catastrophe define the response; standards proposed AFTER compete for attention amid vendor-fragmented capture attempts. The historical pattern (TLS, OAuth, HTTP/2) consistently rewards being-first-with-credibility.

ASHE done seriously requires producing the artifact bundle (this VISION, plus MANIFESTO, CASE-FOR-NOW, PRIOR-ART, REFUTATIONS, GOVERNANCE, CONFORMANCE, ADOPTION-PATHWAY, BENCHMARK-PLAN) on a timeline matching the demand opened by Glasswing. Months, not years.

---

## 10. What ASHE is NOT

> **Updated 2026-05-26**: the ecosystem-acknowledgment entries (MCP, auth.md, commercial platforms) reflect the honest landscape positioning per §1 and `CASE-FOR-NOW.md` §7.

Explicit non-claims, to pre-empt overclaim attacks:

- **Not a replacement for OAuth / IAM** — capability brokers and identity providers are complementary; identity grants the right to *request* capabilities; ASHE manages capability lifecycle
- **Not a replacement for HTTP** — HTTP coexists with ASHE indefinitely for human-browser interaction; ASHE serves agent-mediated interaction; the dual-surface model is permanent
- **Not a replacement for MCP** — MCP is the de facto agent-tool-discovery standard (Anthropic Nov 2024; Linux Foundation Dec 2025; 97M monthly SDK downloads); ASHE composes above MCP as the next-layer capability-mediation protocol. ASHE can expose MCP-style tool catalogs underneath its capability layer; doesn't displace MCP
- **Not a replacement for auth.md** — auth.md (WorkOS, May 2026) standardizes agent registration via ID-JAG or OTP-claimed flows; ASHE consumes auth.md output (credentials, identity tokens) as session-establishment input to its capability-mediation layer. Complementary, not competitive
- **Not a replacement for the commercial agent-auth platforms** — WorkOS, Stytch (Twilio), Auth0/Okta, Composio, Nango, Arcade, TrueFoundry, Cloudflare Agents SDK each cover slices of auth + tool execution + integration. ASHE composes above them as the next-layer protocol; they remain valid authorization backends, integration catalogs, deployment platforms, or gateway infrastructure underneath ASHE
- **Not a development environment replacement** — sealed-workspace pattern composes with DevContainers, GitHub Codespaces, Replit, GitPod, NixOS, Docker BuildKit, gVisor/Firecracker as isolation substrates. ASHE adds the capability-mediation protocol layer; doesn't replace the isolation primitives
- **Not a sandbox runtime** — ASHE *decides* whether code should be sandboxed; gVisor/Firecracker/nsjail *execute* in sandboxes
- **Not a syscall mediator at v1** — runtime syscall mediation is v4+ enforcement-layer work
- **Not per-action approval friction** — capability mediation MUST NOT mean per-operation user prompts; standing capabilities + risk-tiered automation + cached approvals + inferred intent remove per-action prompts (no user interaction for routine operations; explicit approval only at risk boundaries). See §4 sealed-workspace subsection for the mechanisms.
- **Not omniscient** — see §2 honest limits
- **Not a security panacea** — bounded protection; honest claims; trust regress acknowledged
- **Not "AI-specific"** — universal intent declaration applies symmetrically to humans, AI agents, services, kernel-internal callers

---

## 11. Validation commitment

Per ADR-015:

- ASHE v1 ships with controlled-benchmark publication replicating arXiv 2511.23281 methodology against ASHE reference implementation within 12 months of v1 completion
- Floor / target / stretch claims are tiered with explicit evidence grades throughout all public artifacts
- Honest reporting if measurements fall short of targets — artifact gets updated; measurement is not disputed
- Conformance suite + reference implementation are shipped together; not separable

---

## 12. Forward pointers (companion artifacts)

This VISION is the central technical-strategic statement. The complete artifact bundle:

| Artifact                 | Status                           | Purpose                                                                |
| ------------------------ | -------------------------------- | ---------------------------------------------------------------------- |
| `VISION.md` (this file)  | First draft, this date           | Technical-strategic vision                                             |
| `MANIFESTO.md`           | Forthcoming                      | Public-facing "why this exists" opener                                 |
| `CASE-FOR-NOW.md`        | Forthcoming                      | Glasswing-anchored urgency argument                                    |
| `PRIOR-ART.md`           | Forthcoming                      | Map of adjacent work (MCP, NLWeb, OCAP, seL4, etc.)                    |
| `THREAT-MODEL.md`        | Forthcoming                      | Formal threat taxonomy + leverage profile + limits                     |
| `ADOPTION-PATHWAY.md`    | Forthcoming                      | Dual-surface; conformance tiers; intermediary leverage; phased rollout |
| `USE-CASES.md`           | Forthcoming                      | Concrete scenarios                                                     |
| `BENCHMARK-PLAN.md`      | Forthcoming                      | Measurement methodology                                                |
| `REFUTATIONS.md`         | Forthcoming                      | Defensive scaffolding for sophisticated attacks                        |
| `FAQ.md`                 | Forthcoming                      | Quick-reference for lazy attacks                                       |
| `GOVERNANCE.md`          | Forthcoming                      | Apache 2.0 + open governance commitments                               |
| `CONFORMANCE.md`         | Forthcoming                      | Verification methodology                                               |
| `PROTOCOL-SPEC-v0.6.md`  | Forthcoming                      | IDL-grounded technical specification                                   |
| `schemas/*.proto`        | Forthcoming                      | Canonical service + message definitions                                |
| `decisions/ADR-NNN-*.md` | ADR-001 through ADR-015 complete | Decision records (immutable; supersession via new ADRs)                |

This VISION lands first because every subsequent artifact references it. The artifact bundle is the public-readiness gate; ASHE is not publicly released until all artifacts are coherent and the benchmark has shipped.

---

**END OF VISION v1.0-draft**

Iteration expected through public-readiness gate. Substantive content is locked; presentation refinement and additional citations may evolve. Successor versions (v1.1+) supersede this with explicit version + supersession notes.
