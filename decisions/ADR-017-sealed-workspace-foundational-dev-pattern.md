# ADR-017: Sealed workspace as foundational development pattern

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-26 |
| Decider | PK + Claude |
| Touches | reference-arch (primary), protocol (sealed-workspace operations become first-class service surfaces) |
| Cited by | VISION.md §4 (sealed-workspaces subsection); MANIFESTO.md ("pull up the wall, then develop inside"); CASE-FOR-NOW.md §7.3 (contrast with tri-modal current state); ADR-018 (peer convention — `.well-known/ashe` is the web-side surface; ADR-017 is the dev-side surface) |
| Builds on | ADR-007 (interception-chain pattern), ADR-008 (validation graph), ADR-013 (multi-service architecture, including BuildService), ADR-014 (phased enforcement) |

## Context

The sealed-software architectural frame ([VISION.md §4](../VISION.md#4-sealed-software-and-the-agentic-web-endgame)) was originally articulated for production services — software exposing ASHE becomes a sealed unit accessed only through declared capabilities. PK's May 2026 extension surfaces a broader application: **the act of creation itself should happen inside a sealed perimeter**.

The current state of AI-coding-tool development workflows demonstrates the problem:

| Tool | Permission model |
|------|------------------|
| OpenAI Codex | 4 modes: Read Only / Default / Auto-review / Full Access |
| Claude Code | Tri-modal with workspace boundaries; approval gates |
| Claude Desktop | All-or-nothing filesystem access; MCP servers add per-tool granularity but not per-call capability |
| Cursor | Workspace-scoped by default; manual approval for some operations |
| GitHub Copilot Agent | Repository-scoped; PR-based intent |
| Devin, Replit Agents | Sandboxed environment + workspace-scoped permissions |

The convergent pattern is **mode-based directory scoping**. This is NOT capability mediation. It is:

- **Coarse-grained**: 3-4 modes for thousands of possible action types
- **Path-based**: "workspace directory" is a path check, bypassable via `cd ..`, absolute paths, subprocess invocation
- **Binary on external access**: internet is allow-all or deny-all
- **No per-action audit**: mode switches logged; individual actions not structurally traced
- **No multi-party approval**: single user toggles mode for entire session
- **No time-bounded capabilities**: modes persist; no automatic expiry
- **No intent declaration**: agents operate within mode without declared purpose
- **No cross-tool consistency**: every vendor reinvents permission UX
- **No cascade attenuation**: agent-spawning-agent inherits parent's full mode

When the agentic-AI weaponization cases happen (Mexico National Data Extradition / Alibaba GPU crypto-hijacking / McKinsey "Lilli" hack / Anthropic Claude Code nation-state breach — see [CASE-FOR-NOW.md §2.2](../CASE-FOR-NOW.md#22-agentic-weaponization)), the contributing factor is often the per-vendor permission model being insufficient OR the agent operating outside any cooperating permission model entirely. The development workflow needs a cross-vendor structural alternative: **the wall goes up first; development happens inside the wall; the same protocol works across every tool**.

### Anthropic's Claude Code dev container as prior art — primitive precedent, not vision precedent

The Claude Code dev container (per [Anthropic's reference implementation](https://github.com/anthropics/claude-code/tree/main/.devcontainer)) is the strongest single **primitive** for the sealed-workspace pattern this ADR proposes — same family, shared parts:

- Isolated Docker environment with iptables firewall blocking outbound traffic except allowed domains
- `/etc/claude-code/managed-settings.json` for organization policy enforcement (Claude Code's managed-settings precedence: managed → CLI → local project → shared project → user)
- Persistent volume mount for `~/.claude` across container rebuilds
- `--dangerously-skip-permissions` gated by non-root user requirement + isolation environment
- Workspace bind-mounted; commands execute inside the container; edits visible on host
- Composition with VS Code Dev Containers spec for editor integration

This ADR explicitly acknowledges Claude Code dev container as proof the individual primitives work in production. ASHE inherits and composes above this primitive lineage; **ASHE does NOT claim invention of sealed-workspace as a concept**.

What ASHE distinctly contributes — **none of which Anthropic has publicly proposed as protocol-standardization commitments**:

- **Cross-vendor protocol standardization**: the same sealed-workspace protocol works across Cursor, Codex, Devin, Copilot Agent, Continuum's own tools, and future agentic-dev tools — not as a vendor product feature but as a published, conformance-tested cross-vendor protocol
- **Capability protocol layer above the isolation substrate**: capabilities are first-class protocol objects (per [ADR-003](ADR-003-invariant-language.md)), not vendor-specific permission rules; the protocol grammar is uniform across implementations
- **Universal intent declaration**: intent is a protocol-level primitive declared at the broker boundary (per VISION §6), not a vendor-specific UX pattern
- **Four-layer phased enforcement trajectory**: Layer 1 cooperating SDK → Layer 2 runtime hook → Layer 3 OS-level mediation → Layer 4 hardware-rooted (per [ADR-014](ADR-014-phased-enforcement-model.md)). Anthropic's primitives reach Layer 1 (cooperating SDK) and a slice of Layer 3 (the sandboxed Bash tool via Seatbelt/bubblewrap, the dev container's iptables firewall); ASHE's vision commits to the full trajectory through Layer 4 (hardware-rooted)
- **Provenance-by-construction extending the audit trail**: every capability exercise carries provenance (per ADR-016 forthcoming); not a Claude Code feature today
- **Tri-surface coherence**: the sealed-workspace pattern is the dev-side surface of ASHE's tri-surface architecture (agent-side per [ADR-014](ADR-014-phased-enforcement-model.md), dev-side per this ADR, web-side per [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md)). Anthropic ships individual primitives; the tri-surface architectural integration is not what Anthropic publicly proposes

The relationship is the protocol-design pattern that has worked historically: shared parts, different thing. Tesla and a Model T share wheels, windshields, and steering wheels — same lineage, different vehicle because intent and scope differ. TCP/IP shared packet-switching primitives with ARPANET and CYCLADES; HTTP shared hypertext primitives with Xanadu; OAuth shared session-token primitives with Twitter's internal auth. Each protocol's contribution was the *integration into a cross-vendor standard with specific intent and scope*, not the invention of new primitives.

The dev container is feature precedent at the level of an isolated environment with managed settings; ASHE's contribution includes the protocol-standardization vision, the cross-tool default, the four-layer enforcement trajectory, and the capability protocol layer above the isolation substrate — none of which Anthropic has publicly proposed as protocol-standardization commitments. The dev container is the isolation substrate; ASHE is the capability protocol that composes above it (per Commitment 4 below).

## Decision

**ASHE adopts the sealed-workspace pattern as the foundational development-lifecycle application of the capability-broker thesis.** The pattern has four binding commitments:

### Commitment 1: Workspace initialization is step 1 of any new project

`ashe workspace init <project>` becomes step 1 of any new project the same way `git init` is today. The command establishes:

- A sealed perimeter around the workspace (filesystem boundary, network boundary, subprocess boundary)
- A workspace identity (cryptographic; unique per workspace; recorded in workspace metadata)
- Default capability registry populated for the workspace's declared kind (e.g., "node-typescript project" gets standard developer/reviewer/ci-runner capability templates)
- Audit subsystem initialized
- Composition with the chosen isolation substrate (DevContainer, gVisor sandbox, Firecracker microVM, local capability-restricted runtime per host)

After `ashe workspace init`, all access to workspace contents (file reads, file writes, subprocess execution, network calls, VCS operations, deploy operations) goes through ASHE capability mediation. Raw filesystem access from outside the workspace's exposed capability surface is structurally prevented at the chosen enforcement layer (see ADR-014 Layer 1 through Layer 4).

### Commitment 2: Frictionlessness principle is mandatory

**Capability mediation MUST NOT impose per-action approval friction.** Per-operation user prompts kill adoption and undermine the entire pattern. The mechanisms that deliver frictionless UX while maintaining fine-grained mediation:

| Mechanism | What it does |
|-----------|-------------|
| **Standing capabilities** | Routine operations (in-scope reads, in-scope writes, test runs, build invocations) pre-granted at session/role/profile level; no per-action prompt |
| **Intent declaration ONCE, actions auto-validated** | Declare "working on auth refactor today"; subsequent in-scope operations silently approved per intent reconciliation |
| **Pre-approved workflow templates** | Common workflows (PR review, dependency update, hotfix, feature-branch development) recognized as pattern templates; following template doesn't require per-step approval |
| **Risk-tiered automation** | Tier A (routine, ~90%) auto-approved silently; Tier B (medium, ~8%) auto-approved with audit; Tier C (high-stakes, ~2%) explicit approval. Risk tier determined by capability registry, action target, and anomaly score |
| **Anomaly-triggered approval** | Gates fire only when behavior diverges from baseline (per-agent reputation + pattern detection); standing capability holds otherwise |
| **Cached approvals per session** | Approved once, holds for session lifetime; explicit re-approval only at session boundary or risk-threshold change |
| **Capability inheritance through cascades** | Agent spawning sub-agents inherits attenuated capabilities; no fresh approval per child agent |
| **Inferred intent** | When action patterns are unambiguous (e.g., sequence of read-foo.js / edit-foo.js / test-foo.test.js reads as "iterating on foo.js"), no explicit declaration required |

The right user/developer experience: ASHE-sealed-workspace feels like normal development with capability mediation running invisibly underneath. Approval prompts are *rare* and reserved for high-stakes operations (production deploys, secret access, capability escalation, irreversible destruction). The architectural analogy is **TLS for the agent layer** — nobody approves every byte sent over an encrypted connection.

A sealed-workspace implementation that imposes per-action approval friction violates this commitment and is non-conformant.

### Commitment 3: Role-based capability sets are first-class

The sealed workspace exposes standard capability templates per role:

| Role | Default capability set (illustrative; concrete capabilities defined per-language/per-framework) |
|------|--------------------------------------------------------------------------------------------------|
| **developer** | `code.read`, `code.write` (project scope), `code.search`, `test.run`, `build.invoke`, `lint.run`, `format.apply`, `vcs.read`, `vcs.commit` (non-protected branches), `network.fetch` (declared package registries), `dependency.add` (with manifest update audit) |
| **reviewer** | `code.read`, `code.search`, `vcs.read`, `pr.comment`, `pr.approve`, `pr.request-changes` |
| **ci-runner** | `code.read`, `test.run`, `build.invoke`, `network.fetch` (CI-declared registries), `artifact.publish` (CI-managed bucket), `vcs.tag` |
| **deploy-operator** | + `deploy.staging`, `deploy.production` (with multi-party approval gate), `secret.read` (scoped to deploy target), `rollback.execute` |
| **ai-agent (default)** | Subset of developer; explicit task intent required; declared task scope; time-bounded session; capability cascade for spawned sub-agents; audit per action |
| **ai-agent (constrained)** | `code.read` only by default; per-task capability expansion via explicit grant; suitable for untrusted-model evaluation, prompt-injection-defense scenarios |

Roles are extensible; deployments define additional roles (security-auditor, compliance-officer, etc.) with appropriate capability templates. The role + capability template machinery is what makes the frictionlessness principle achievable — standing capabilities are granted by role, not negotiated per action.

### Commitment 4: Composition with existing isolation primitives is structural

Sealed-workspace does NOT replace DevContainers, GitHub Codespaces, Replit, GitPod, NixOS pure builds, Docker BuildKit, hermetic builds (Bazel), Capsicum, App Sandbox + Entitlements, gVisor, or Firecracker. It uses them as the **isolation substrate** and adds the **capability protocol** above.

| Layer | Provided by | What it does |
|-------|-------------|-------------|
| **Isolation substrate** | DevContainer / gVisor / Firecracker / WASM runtime / OS sandbox / etc. | Enforces process / filesystem / network isolation at the OS or runtime layer |
| **Capability protocol** | ASHE | Mediates *what* can happen inside the isolation; protocol-level audit, intent declaration, multi-tier evaluator, frictionlessness mechanisms |
| **Identity + auth substrate** | auth.md / OAuth 2.1 / OIDC / WorkOS / Auth0 / etc. | Establishes who the actor is; provides credentials |
| **Tool catalog substrate** | MCP / vendor-specific tool definitions | Discovers what operations are exposed |

ASHE-sealed-workspace orchestrates these substrates. Adopters keep their existing investments; ASHE is the standardization that makes them compose.

## Consequences

**What becomes easier**:

- **AI-agent blast radius collapses for the common case**: an AI coding agent in a sealed workspace gets task-scoped capability tokens. Prompt-injected agent can do only what its task-scope permits — not "everything the user can do" (today's reality)
- **Workspace portability**: a sealed workspace is a structured artifact; can be moved between developer machines, CI environments, cloud-hosted dev environments without reconfiguring permissions
- **Cross-tool consistency**: every ASHE-aware editor / build system / VCS / deploy tool speaks the same protocol; one capability surface, many consumers
- **Audit-by-construction for compliance contexts**: regulated industries (finance, healthcare, government) get capability-mediated dev workflows with provenance per-action; SOC2 / HIPAA / FedRAMP / ISO27001 evidence becomes structural, not after-the-fact
- **Onboarding/offboarding clarity**: new contributors get role-based capability sets; departing contributors have their capabilities revoked; structural rather than "did we remember to remove all the access?"
- **Sandboxed AI experimentation**: deploy a constrained agent in a sealed workspace with reads-only capabilities; observe behavior; if safe, expand capabilities incrementally. Prompt-injection / weaponization risks are bounded structurally
- **Cascade attenuation for agent-spawning-agent workflows**: parent agent's capabilities can be attenuated for spawned sub-agents; no full-trust inheritance

**What becomes harder**:

- **Initial adoption friction**: developers used to direct filesystem access need to adopt ASHE-aware tooling or accept that their tools become ASHE clients. Migration path exists but requires effort
- **Tooling ecosystem must adapt**: editors (VSCode, Cursor, Vim/Neovim, Emacs, IDEs), build systems (npm/yarn/pnpm, cargo, make, bazel, gradle, maven), VCS (git), deploy tools (kubectl, terraform, custom scripts) all need ASHE-aware wrappers or native ASHE clients. Some tools (Cloudflare Workers + Agents SDK, DevContainers) have natural integration paths; others require explicit wrapper development
- **Performance overhead**: capability checks add per-operation latency. With standing capabilities + caching this should be sub-millisecond for routine operations, but the overhead is non-zero. Must be measured (per ADR-015 benchmark commitment)
- **Migration complexity for existing projects**: importing a non-ASHE project into a sealed workspace requires capability-set design, role mapping, tooling integration. Greenfield projects are easier than retrofit

**What becomes possible**:

- **Frictionless capability mediation at developer-workflow scale**: the pattern that "TLS for the agent layer" is the architectural analogy — mediation invisible most of the time; explicit only at risk boundaries
- **Cross-organization capability federation**: capability tokens issued by one organization can be presented to another (when trust + policy allow); enables agent-mediated cross-org collaboration with bounded blast radius
- **Capability-based monetization for development tools**: tools can charge per high-value capability use rather than per-seat licensing; new revenue models become feasible
- **Reproducible-by-construction development**: capability set + intent declaration + audit trail makes every development action reproducible; debugging "what did this agent do?" becomes mechanical
- **Regulated-industry adoption**: financial services, healthcare, government can deploy AI-assisted development with capability discipline meeting compliance frameworks (SOX, HIPAA, FedRAMP, ISO27001) at the protocol layer

**What becomes impossible** (intentionally):

- Direct filesystem access from outside the workspace's exposed capability surface (at Layer 3+ enforcement)
- Agent-spawning-agent full-trust inheritance (cascade attenuation is structural)
- "Full Access" mode that gives the agent everything the user has (replaced by explicit capability sets per role + task)
- Mode-based directory scoping pretending to be capability mediation (the protocol level rejects this approach)
- Per-action approval prompts as the security UX (frictionlessness principle forbids this)

## Alternatives Considered

**1. Continue with mode-based directory scoping (status quo per Codex / Claude Code / Cursor).** Rejected because:
- Demonstrably insufficient for the agentic-AI weaponization threats (Mexico extradition, Alibaba GPU hijacking, McKinsey Lilli — all happened against systems with mode-based or no permission)
- Doesn't scale to multi-tool interoperability — every vendor reinvents permission UX
- "Full Access" is the bypass that defeats the entire permission model
- No path to runtime-mediated enforcement (Layer 3) from this starting point

**2. Build sealed-workspace as a vendor product rather than protocol standard.** Rejected because:
- Vendor-controlled sealed-workspace = capture risk; the value of standardization is interoperability
- Continuum could ship a TypeScript-only sealed-workspace, but the cross-language / cross-vendor benefit requires protocol-level standardization
- Apache 2.0 + open governance + multi-implementation invitation per ADR-007/008/011/etc. applies here too

**3. Build sealed-workspace into a single tool (e.g., into VSCode or a specific IDE).** Rejected because:
- Limits adoption to that tool's userbase
- Doesn't address cross-tool consistency (developers use many tools)
- Doesn't address agent-tool interaction (which is the primary motivator)

**4. Require per-action user approval for all capability uses.** Rejected because:
- Violates the frictionlessness principle
- Empirically unusable; would kill adoption immediately
- Misunderstands capability mediation as "approval prompt at every action"

**5. Make sealed-workspace optional (provide it but allow non-sealed projects).** Partially accepted: ASHE doesn't force all development to be sealed-workspace. But the standard recommendation is "use sealed-workspace by default for any project where capability discipline matters" — which is increasingly every project as AI agents enter workflows. Non-sealed development remains supported but is no longer the default-recommended pattern for AI-agent-involving work.

**6. Wait for ecosystem demand before standardizing.** Rejected because:
- The agentic-AI weaponization incidents from CASE-FOR-NOW.md §2 demonstrate demand is here, in incident-cost form
- Pre-catastrophe standardization (per ADR-015) requires shipping before mass adoption, not after
- Standards established in response to incidents are reactive; ASHE positioned to be proactive

## Related decisions

- ADR-007 — Interception-chain pattern (sealed-workspace's capability checks use the interception-chain mechanism)
- ADR-008 — Validation graph with default-to-tiny-ONNX evaluators (sealed-workspace's intent-vs-action reconciliation is an evaluator graph node)
- ADR-009 — Deployment profiles (sealed-workspace itself can be deployed in ASHE-core through ASHE-full profiles)
- ADR-013 — Multi-service architecture (sealed-workspace exposes Session/Blueprint/Operator/Build/Audit services; BuildService is the primary surface for sealed-workspace operations)
- ADR-014 — Phased enforcement model (sealed-workspace is achievable at Layer 1 cooperating; full enforcement requires Layer 3 OS-level mediation)
- ADR-015 — Validation methodology and tiered claims (sealed-workspace performance + adoption claims are subject to benchmark publication per the v1 commitment)
- ADR-016 (forthcoming) — Provenance requirements and capability-grounded content (sealed-workspace operations carry provenance per ADR-016 commitment)
- ADR-018 — `.well-known/ashe` web-side interaction-point convention (peer surface convention: ADR-017 is ASHE's dev-side surface; ADR-018 is ASHE's web-side surface; together with ADR-014's agent-side enforcement trajectory they constitute ASHE's tri-surface architectural shape)
- ADR-019 (Proposed) — Execution-class distinction (provider-call / agent-worker / occupant). **ADR-019 requires amendment to ADR-017's role-template table** to add `ai-agent (occupant)` and `ai-agent (worker)` as named templates when ADR-019 migrates from Proposed to Accepted (pending working-code validation per CONSTRUCT-CLAUDE-OCCUPANCY-DESIGN-v0). The two new templates extend the existing role-template machinery; the protocol-tier execution-class distinction lives in ADR-019 while the per-template capability sets live here in ADR-017.

## Implementation notes

**For Continuum's reference implementation**:

- `ashe workspace init` CLI command implemented in v1 toolset
- DevContainer adapter as first isolation-substrate integration (most common existing pattern)
- Node.js Layer 1 cooperating SDK in v1; Layer 2 runtime hooks (intercepting `fs`, `child_process`, `http` modules) in v2
- VSCode extension as first IDE integration; Cursor / other editor integrations as v2 work
- gVisor / Firecracker integration as v4 work for Layer 3 enforcement

**For other implementations**:

- Rust implementation second priority (per ADR-014 trajectory toward runtime mediation; Rust is natural for OS-level integration)
- Python implementation third priority (large agent-framework userbase: LangChain, AutoGen, CrewAI)
- Go implementation fourth priority (cloud-native deployment context)

**Conformance suite for sealed-workspace** (per ADR-015):

- Workspace initialization correctness (capability registry populated; isolation substrate engaged; audit subsystem active)
- Standing capability behavior (in-scope routine operations execute without prompts; audit captures them)
- Anomaly-triggered approval (out-of-baseline behavior triggers re-confirmation)
- Cascade attenuation (sub-agents receive subset capabilities; cannot exceed parent grant)
- Role-based capability sets (each defined role gets correct capabilities)
- Composition with isolation substrates (DevContainer / gVisor / etc. integration works)
- Migration from non-ASHE projects (import workflow produces functioning sealed workspace)
- Frictionlessness measurement (per-operation overhead within budget; user-experience benchmarks; explicit-prompt frequency stays below defined threshold for representative workloads)

**Migration path for existing projects**:

1. `ashe workspace import <existing-project>` — analyzes existing project; suggests capability set; offers role templates
2. Developer reviews suggested capabilities + roles; adjusts
3. Workspace metadata committed alongside project (e.g., `.ashe/workspace.json`)
4. Existing tooling continues to work through ASHE-aware adapters (gradual migration)
5. Eventually, raw filesystem access becomes unavailable as Layer 2+ enforcement is engaged

**Tooling adapter priorities**:

| Priority | Tool | Adapter shape |
|----------|------|---------------|
| P0 | git | ASHE-mediated `git` wrapper; capability checks per command |
| P0 | npm / pnpm / yarn | Capability-mediated package install; declared registry scope |
| P0 | VSCode | Extension that routes file ops + terminal through ASHE |
| P1 | cargo, pip, gradle, maven | Per-language package manager adapters |
| P1 | docker, kubectl, terraform | Deploy tooling adapters |
| P1 | Cursor, Claude Code | AI-coding-tool native integration (most strategic) |
| P2 | Vim/Neovim, Emacs, JetBrains IDEs | Editor adapters |
| P2 | bazel, make, just | Build system adapters |

The protocol is the standard; the adapter ecosystem develops over time. v1 ships P0 adapters; subsequent versions extend.

---

**ADR-017 commits ASHE to sealed-workspace as the foundational development-lifecycle pattern. The pattern is the answer to "what does ASHE actually look like in a developer's daily workflow." The frictionlessness principle is mandatory. Composition with existing isolation primitives is structural. Adoption is via `ashe workspace init` becoming step 1 of any new project — the same way `git init` is today.**
