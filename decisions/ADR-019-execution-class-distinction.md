# ADR-019: Execution-class distinction — provider-call / agent-worker / occupant

| Field | Value |
|-------|-------|
| Status | **Proposed** (pending working-code validation via reference implementation) |
| Date | 2026-05-27 |
| Decider | Patrick Karle (Phor) |
| Touches | protocol (primary — defines the agent-execution-class taxonomy as a protocol-tier distinction); reference-arch (per-class capability lease shape) |
| Cited by | Reference implementation design (Continuum-internal); [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) forthcoming amendment to add role templates per class |
| Builds on | [ADR-003](ADR-003-invariant-language.md) (invariant language / descriptor grammar — leases per class use the same grammar); [ADR-013](ADR-013-multi-service-architecture.md) (multi-service architecture — SessionService / OperatorService back lease lifecycle); [ADR-014](ADR-014-phased-enforcement-model.md) (phased enforcement model — per-class trust assumptions track the four layers); [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) (sealed-workspace + frictionlessness + role templates — ADR-019 proposes adding two new templates) |
| Tracks toward | `Accepted` status pending working-code validation in the reference implementation |

## Context

The pattern of agent execution across the current production landscape exhibits **three distinct execution classes** that are not currently named in any protocol-tier ADR. Without explicit naming, the architectural difference between these classes tends to flatten into a single `dispatchAgent()` abstraction that hides material differences in authority, lifecycle, and capability shape. Past architectural failures in agent-runtime design have often traced to this flattening trap — treating stateless OpenAI API calls and stateful Claude Code workspace sessions under one dispatch interface produces authority bleed, lifecycle confusion, and audit gaps.

### Current state observation from the reference implementation

The canonical observational pattern from the reference implementation (Continuum), summarized as the load-bearing current-state framing:

> *"The reference implementation currently executes its primary agent (Claude) through bounded SDK dispatches inside composition runs, with role-based SDK tool bundles and idempotent ASHE-style IPC wrappers. Provider metadata and ASHE enforcement primitives exist as tested components but are not yet the active execution substrate for provider-call, agent-worker, and occupant as first-class runtime classes."*

This pattern describes the current state precisely. Three observations matter for ADR-019:

1. **The current dispatch implementation is worker-shaped** — bounded SDK call per composition node, non-persistent session, role-tool bundles (per role definitions such as IMPLEMENTER / REVIEWER / VALIDATOR), scoped to one composition dispatch. **Agent-worker is the de facto current class** even though it has not been named as such.
2. **Provider-call exists only as metadata** — descriptive of multiple providers (claude-code, openai, gemini, deepseek, kimi, qwen, nim) but not integrated into the active composition execution path.
3. **Occupant does not yet exist** in the active execution path. The reference implementation design proposes its v0 introduction, with the primary agent admittee (Claude) as the first occupant-class instance.

### The shadow-spawn observation

A related observation from the same source: the current IMPLEMENTER-class SDK agent typically has the Claude SDK `Agent` tool available, which means a model dispatched as IMPLEMENTER can spawn subagents at the SDK / tool layer. These spawned subagents are **invisible to the surrounding governance layer** — no occupant registration, no lease, no audit, no host-side lineage tracking. This is "shadow spawn" — the runtime already spawns; the governance layer just doesn't see it.

ADR-019's `occupant.spawn` discipline (per the per-class capability lease shape below) addresses this by making spawn observable + leased + audited at the protocol layer.

### Why this distinction must be protocol-tier

The execution-class distinction is not a single-implementation choice. Different agent runtimes across the ecosystem (Claude Code, OpenAI Codex, Cursor, Devin, Replit Agents, OpenAI-compatible API providers, etc.) all face the same architectural question: *what authority does this agent hold, what state does it carry, what lifecycle does it follow, what audit obligations apply?* The answer depends on the execution class, which is independent of the vendor.

A cross-vendor capability-broker protocol (ASHE) must name the execution-class distinction explicitly so that:

- Cross-vendor agent admission ceremonies are interoperable
- Capability lease shape per class is consistent across implementations
- Audit-trail shape per class is comparable across deployments
- Conformance criteria per class are checkable per [ADR-015](ADR-015-validation-methodology-and-tiered-claims.md) methodology

Without protocol-tier naming, each implementation independently invents the distinction (or flattens it), producing the N×M reconciliation problem ASHE was structurally designed to prevent.

## Decision (Proposed)

**ASHE names three agent execution classes as a protocol-tier distinction.** Class membership is determined by which properties an admitted agent holds, not by the agent's vendor or model.

### The three classes

| Class | Definition | Capability lease shape |
|-------|------------|------------------------|
| **provider-call** | Stateless API invocation. Agent receives a normalized prompt/request, returns a normalized response, leaves. No persistent state, no workspace presence, no spawn rights, no mailbox. | Minimal session-scoped lease (or no lease, if implementation chooses): identity assertion + capability assertion for the single call. Audit per call. |
| **agent-worker** | Bounded task executor. Agent receives a bounded task with tool access, executes it within scope, returns results, terminates. State exists for the duration of the task; not persistent across tasks. No workspace presence beyond task scope; no spawn rights by default; bounded mailbox if any. | Bounded task lease: `workspace.read` (scoped paths); `workspace.patch` (proposal-only by default); `test.run`; bounded `command.execute` (allowlist); time-bounded TTL. Audit per action. |
| **occupant** | Stateful resident. Agent admitted as first-class participant in a workspace or runtime session with persistent identity, lease, presence, mailbox, and spawn rights. Lifecycle survives multiple tasks; lease refresh required at TTL boundaries. | Standing lease per role: per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) role templates (developer, reviewer, ci-runner, deploy-operator, ai-agent-default, ai-agent-constrained, occupant, etc.). May include `occupant.spawn` (cascade with attenuation), full `workspace.read`/`patch`/`apply` (per scope), `command.execute`, `mailbox.send`/`receive`, `audit.read` (own-session). Standing capabilities + risk-tiered automation per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) Commitment 2. |

### Per-class properties

Class membership is determined by the *combination of properties* an admitted agent holds:

| Property | provider-call | agent-worker | occupant |
|----------|:-:|:-:|:-:|
| Identity | per-call | per-task | persistent (session-scoped) |
| Presence (visible to other admitted agents) | no | task-scoped | yes (registry-tracked) |
| Workspace authority | no | bounded (per task lease) | per role lease |
| View authority (host state, occupant presence, logs) | no | task-scoped | per role lease |
| Event bus subscription | no | task-scoped | per role lease |
| Mailbox | no | bounded if any | yes (send + receive) |
| Spawn rights | no | no (by default) | per role lease (with attenuation) |
| Audit trail | per call | per action within task | per action with session lineage |
| Lifecycle | per call | per task | join → operate → refresh → revoke / yield / complete |

These properties define the class structurally. An agent with persistent identity + presence + mailbox + spawn rights is an occupant regardless of its vendor. An agent that receives a bounded prompt and returns a response without holding any of these is a provider-call regardless of its vendor.

### Intent declaration is orthogonal

The intent surfaces from [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md) (`user-directed` / `task-directed` / `autonomous-cascade`) describe *what the agent is doing*. The execution class describes *what authority the agent holds*. The dimensions are orthogonal:

| Intent ↓ / Class → | provider-call | agent-worker | occupant |
|---|---|---|---|
| **user-directed** | Human → OpenAI inference | Human → bounded reviewer worker | Human → Claude Code occupant editing live |
| **task-directed** | Subagent → Gemini classification | Reviewer worker → PR lint | Claude Code occupant → autonomous refactor in scoped workspace |
| **autonomous-cascade** | (rare; no spawn capacity) | Worker fan-out | Occupant spawning child occupants with attenuated leases |

Both dimensions matter; ASHE handshake (per [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md)) carries both.

## Per-class current state in the reference implementation

Per the observational pattern (2026-05-27), each class has a different integration status today:

| Class | Current reference-implementation state | What v0 implementation work delivers |
|-------|------------------------|---------------------------------------|
| **provider-call** | Exists as descriptive metadata only (cataloging 7 providers: claude-code, openai, gemini, deepseek, kimi, qwen, nim); not integrated into active composition execution path | v0 may or may not surface as a third execution path (depends on dispatch-pool extension scope); if not landed, v1 addition under same lease-discipline framing |
| **agent-worker** | **De facto current class**. The primary dispatch implementation is worker-shaped: bounded SDK call per composition node, non-persistent session, role-tool bundles (per role definitions such as IMPLEMENTER tools = Read/Edit/Write/Bash/Grep/Glob/Agent; REVIEWER tools = Read/Grep/Glob; VALIDATOR tools = Read/Grep), scoped to one composition dispatch. **Critical caveat**: current dispatch uses permissive SDK environment configuration — the safety boundary today is the configured SDK environment + role tool list, **NOT ASHE mediation**. | v0 brings this de facto class under explicit lease discipline: bounded task lease replaces SDK-environment-only safety; capability checks gate operations through the protocol-layer enforcer; audit captures actions per the protocol-layer audit logger |
| **occupant** | **Does not exist** in the active execution path today. Reference-implementation design proposes the v0 introduction. | v0 introduces occupant as a first-class concept with admission ceremonies (codeveloper + runtime-user roles), standing lease per role per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md), frictionlessness mechanisms per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) Commitment 2 |

Kernel reference implementation primitives are tested as standalone components but **NOT YET wired into the active dispatch execution path** in the reference deployment. Wiring them is part of v0 work, not a precondition. Until that wiring lands, none of the three classes have ASHE-mediated lease enforcement on the active dispatch path — they have it only in their test suites.

## Relationship to existing ADRs

| ADR | Relationship to ADR-019 |
|-----|------------------------|
| [ADR-003](ADR-003-invariant-language.md) | Lease per class uses the ADR-003 capability descriptor grammar. The descriptor format does not differ across classes; what differs is which descriptors are bundled into the lease per class. |
| [ADR-013](ADR-013-multi-service-architecture.md) | SessionService backs lease lifecycle for all three classes. OperatorService handles capability checks per class. AuditService captures per-class audit trails with per-class field shapes. BuildService primarily serves occupants (codeveloper subclass); agent-workers may consume BuildService outputs; provider-calls typically do not interact with BuildService. |
| [ADR-014](ADR-014-phased-enforcement-model.md) | Per-class trust assumptions track the four enforcement layers. At Layer 1 (cooperating SDK), all three classes depend on the SDK to honor the lease. At Layer 2+ (runtime hook), agent-worker leases gain runtime enforcement; occupant leases also. At Layer 3+ (OS-level mediation), all classes gain syscall-level enforcement. At Layer 4 (hardware-rooted), capability boundaries are cryptographically enforced. |
| [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) | **ADR-017 will require an amendment** to add the role templates implied by ADR-019: `ai-agent (occupant)` and `ai-agent (worker)` as named templates alongside the existing developer / reviewer / ci-runner / deploy-operator / ai-agent-default / ai-agent-constrained templates. ADR-019's status remains `Proposed` until that amendment + the working-code validation in the reference implementation both land. |
| [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md) | ADR-018's intent surfaces (`user-directed` / `task-directed` / `autonomous-cascade`) are orthogonal to ADR-019's execution classes. The `.well-known/ashe` handshake carries identity + intent; the server-side maps identity → role → capability template per ADR-019 class. |

## Trust assumptions

| Per [ADR-014](ADR-014-phased-enforcement-model.md) enforcement layer | provider-call | agent-worker | occupant |
|------------------------------|---|---|---|
| **Layer 1 cooperating-SDK** | Lease enforcement depends on the SDK honoring lease scope. Trust the SDK. | Same. | Same. |
| **Layer 2 runtime-hook** | Runtime intercepts unauthorized operations; agent-worker / occupant gain runtime enforcement. provider-call typically does not have a runtime to hook (it's a network call from elsewhere). | Runtime-hook enforces lease scope. | Runtime-hook enforces lease scope; `occupant.spawn` enforced. |
| **Layer 3 OS-level mediation** | Less applicable to provider-call (no local runtime). | Syscall-level enforcement holds against adversarial code. | Syscall-level enforcement holds against adversarial code. |
| **Layer 4 hardware-rooted** | Possibly applicable if provider-call result delivery uses signed responses. | Cryptographic enforcement of capability boundaries. | Cryptographic enforcement of capability boundaries. |

Current reference-implementation state: the IPC gateway hook design that would wire the protocol-layer enforcer into the active dispatch path is currently in transitional status (a previous design was superseded; current hook-installation state needs verification before v0 references it). Until the hook is installed, ALL classes operate at *pre-Layer-1 state* on the active dispatch path — the gate is not invoked. This is an architectural anti-position; v0 work brings the active path to Layer 1 cooperating-SDK state by wiring the gate.

## Consequences

**What becomes easier**:

- **Clear architectural distinction**: agents are admitted with explicit class membership; no flattened `dispatchAgent()` abstraction hiding authority differences
- **Correct provider adapter shape**: provider-call adapters are stateless input/output; agent-worker adapters are task-scoped; occupant adapters are session-scoped with mailbox + spawn integration
- **Honest gap accounting**: each class has explicit current-state per implementation; conformance suite per [ADR-015](ADR-015-validation-methodology-and-tiered-claims.md) can verify per-class behavior independently
- **Shadow-spawn captured**: `occupant.spawn` at the protocol layer makes SDK-Agent-tool spawning observable + leased + audited (closing today's invisibility gap)
- **Cross-vendor interoperability**: any vendor's agent can be admitted to any of the three classes if it supports the class's required properties; no vendor-specific class membership

**What becomes harder**:

- **Explicit ceremony per integration**: each agent integration requires a class decision + lease design rather than "just dispatch it"
- **More design work per occupant slot**: occupant-class agents require role-template selection + lease-scope definition + admission-ceremony plumbing
- **Class-membership disputes**: edge cases (e.g., "is a long-lived bounded worker an agent-worker or a constrained occupant?") need explicit resolution; ADR-019 names the distinguishing properties to guide such disputes

**What becomes possible**:

- **Occupancy runtime as first-class subsystem**: per the reference implementation design; modules like `occupant-registry`, `occupant-mailbox`, `occupant-spawn-controller`, `occupant-workspace-broker` become discoverable architectural concepts
- **Worker-class lease discipline**: bringing existing dispatch behavior under explicit lease replaces today's permissive-SDK-environment posture with capability-mediated dispatch
- **Provider-call standardization**: when v1 lands provider-call as an integrated execution path, the lease shape is already defined; vendor adapters can be written against a stable interface
- **Cascade discipline**: `occupant.spawn` with attenuation makes multi-agent compositions analyzable + revocable + auditable per lineage

**What becomes impossible** (intentionally):

- **Flat `dispatchAgent()` abstraction that hides class differences**: ADR-019 rejects this explicitly
- **Authority inheritance by vendor**: an agent is privileged because the reference implementation grants it an occupant lease, NOT because of vendor identity. Any vendor's agents can be admitted as occupants under the same machinery if their runtimes support it.
- **Implicit spawn**: cascade is structural; spawn invocations require explicit lease + lineage capture; no shadow-spawn

## Alternatives Considered

**1. Flat `dispatchAgent()` abstraction (status quo at most agent-runtime designs).** Rejected because:
- Hides material differences in authority, lifecycle, state
- Has caused real architectural failures in production (authority bleed between stateless calls and stateful workspace sessions)
- Cannot scale to cross-vendor coordination

**2. Two-class binary (occupant / non-occupant).** Rejected because:
- Collapses provider-call and agent-worker into one bucket despite their different lifecycle + state shapes
- Hides the agent-worker class that currently dominates production execution (the reference dispatch implementation in the reference deployment; equivalent worker-shaped runtimes elsewhere)
- Makes the agent-worker class invisible at the protocol layer even though it's the most-deployed class in 2026

**3. More than three classes (e.g., add "scheduled-job" or "supervised-residence" classes).** Deferred. Possible v1 extension if specific deployment patterns surface the need. v0 commits to three; additional classes can be added under the same lease-discipline framing without revising ADR-019.

**4. Class membership determined by vendor rather than by properties.** Rejected because:
- Vendor identity is not the right axis for authority distinction; properties are
- Creates vendor lock-in incentives (frontier-lab agents get occupant rights by default; smaller-vendor agents do not)
- Violates the delegate-don't-reimplement layering posture (vendor identity is handled by the identity layer via OIDC/auth.md/WorkOS; ASHE delegates that)

**5. Class membership determined by intent.** Rejected because:
- Intent and class are orthogonal dimensions (per the table in the Decision section); collapsing them loses information
- Same intent can be served by different classes (e.g., user-directed intent can map to any of provider-call / agent-worker / occupant)

**6. Defer the distinction until working-code validation is complete.** Partially accepted: this ADR is `Proposed` status precisely to honor the working-code-first discipline. The distinction is documented now while synthesis is fresh; status migration to `Accepted` waits for reference-implementation validation.

## Validation commitment

ADR-019's status remains **Proposed** until the following criteria are met:

1. **Working-code validation**: the reference implementation lands the three-class pattern and validates it as workable
2. **[ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) amendment**: role templates per ADR-019 class (`ai-agent (occupant)`, `ai-agent (worker)`) are added to ADR-017's role-template table
3. **Conformance evidence**: per [ADR-015](ADR-015-validation-methodology-and-tiered-claims.md) validation methodology, conformance suite probes verify per-class behavior in at least one implementation

If working-code validation reveals the three-class pattern is wrong (e.g., the distinction is better drawn at a different boundary; or class membership properties need revision; or an additional class is required), ADR-019 will be revised or superseded before migration to `Accepted`. The `Proposed` status is honest acknowledgment that the architectural pattern has been synthesized but not yet proven at scale.

## Related decisions

- [ADR-003](ADR-003-invariant-language.md) — Capability descriptor grammar (lease per class uses this grammar)
- [ADR-013](ADR-013-multi-service-architecture.md) — Multi-service architecture (SessionService backs lease lifecycle)
- [ADR-014](ADR-014-phased-enforcement-model.md) — Phased enforcement (per-class trust assumptions track the layers)
- [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) — Sealed-workspace + frictionlessness + role templates (ADR-019 requires amendment to ADR-017's role-template table)
- [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md) — `.well-known/ashe` web-side interaction-point convention (intent surfaces orthogonal to execution classes)
- ADR-020 (forthcoming) — Vulnerability advisory propagation + emergency lease attenuation (per-class attenuation behavior will be specified per class)

## Forward pointers

- **Reference implementation** (Continuum-internal) — Tier 5 reference implementation design that validates ADR-019 in working code; details available upon engagement
- **ADR-017 amendment** (forthcoming) — adds `ai-agent (occupant)` and `ai-agent (worker)` role templates to the existing role-template table
- **Conformance suite per-class probes** (per ADR-015 forthcoming benchmark publication) — verifies per-class behavior in at least one implementation

---

**ADR-019 (Proposed) names the three execution-class distinction (provider-call / agent-worker / occupant) as a protocol-tier architectural commitment. Class membership is determined by properties, not by vendor. The reference implementation has agent-worker as its de facto class via the primary dispatch implementation, with provider-call existing only as descriptive metadata and occupant designed but not yet implemented. v0 implementation work brings all three classes into explicit lease-discipline framing; status migrates to `Accepted` upon working-code validation per ADR-015 methodology.**
