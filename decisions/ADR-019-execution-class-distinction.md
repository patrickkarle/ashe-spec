# ADR-019: Execution-class distinction — provider-call / agent-worker / occupant (under phor-scoped governance)

| Field | Value |
|-------|-------|
| Status | **Proposed** — v0.2 phor-scoped governance refinement (2026-05-28) — pending working-code validation via reference implementation |
| Date | 2026-05-27 (v0.1); 2026-05-28 (v0.2 phor-scoped governance refinement) |
| Decider | Patrick Karle (Phor) |
| Touches | protocol (primary — defines the agent-execution-class taxonomy and the phor-scoped governance frame as protocol-tier distinctions); reference-arch (per-class capability lease shape; phor-scoped governance cell; phoreme directives) |
| Cited by | Reference implementation design (Continuum-internal); [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) forthcoming amendment to add role templates per class |
| Builds on | [ADR-003](ADR-003-invariant-language.md), [ADR-013](ADR-013-multi-service-architecture.md), [ADR-014](ADR-014-phased-enforcement-model.md), [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) |
| Tracks toward | `Accepted` status pending working-code validation + ADR-017 role-template amendment + ADR-015 conformance evidence |

## v0.2 refinement summary

The v0.1 publication of this ADR (2026-05-27) named three execution classes (provider-call / agent-worker / occupant) but did not adequately specify:

1. The **phor-scoped governance** layer that mediates occupant authority
2. The distinction between **execution classes and orchestration substrates** (Dynamic Workflows are NOT a fourth execution class)
3. The **attenuated-delegation invariant** for node-level subagent insertion
4. The role of **phoremes as local execution law** (not prompt fragments)
5. The clear **current-vs-target architectural boundary**

v0.2 tightens the framing. The three classes remain. What v0.2 adds is the governance structure within which those classes operate.

## Context

The pattern of agent execution across the current production landscape exhibits **three distinct execution classes** that are not currently named in any protocol-tier ADR. Without explicit naming, the architectural difference between these classes tends to flatten into a single `dispatchAgent()` abstraction that hides material differences in authority, lifecycle, and capability shape.

### Current state observation from the reference implementation

> *"The reference implementation currently executes its primary agent (Claude) through bounded SDK dispatches inside composition runs, with role-based SDK tool bundles and idempotent ASHE-style IPC wrappers. Provider metadata and ASHE enforcement primitives exist as tested components but are not yet the active execution substrate for provider-call, agent-worker, and occupant as first-class runtime classes."*

### The stronger Construct-native model (v0.2)

The target architecture is not merely "Claude Code can call tools" or "Dynamic Workflows can spawn many subagents." The stronger model is:

> **Claude Code can be installed as a resident builder/executor occupant inside the reference implementation, and its work is mediated through phor-scoped governance.**

This is the conceptual boundary ADR-019 v0.2 preserves.

### Why this distinction must be protocol-tier

The execution-class distinction is not a single-implementation choice. Different agent runtimes across the ecosystem (Claude Code, OpenAI Codex, Cursor, Devin, Replit Agents, OpenAI-compatible API providers, etc.) all face the same architectural question: *what authority does this agent hold, what state does it carry, what lifecycle does it follow, what audit obligations apply?* A cross-vendor capability-broker protocol (ASHE) must name the execution-class distinction explicitly so cross-vendor admission ceremonies, capability lease shape, audit-trail shape, and conformance criteria are interoperable.

## Decision (Proposed, v0.2)

**ASHE names three agent execution classes as a protocol-tier distinction**, where class membership is determined by which properties an admitted agent holds (not by vendor or model). **Execution classes are mediated through phor-scoped governance.** **Dynamic Workflows and similar orchestration constructs are substrates that realize agent-worker executions, not a fourth execution class.**

### The three classes

| Class | Definition | Capability lease shape |
|-------|------------|------------------------|
| **provider-call** | Stateless API invocation. No resident identity, no mailbox, no lease, no workspace presence. One request/response. | Minimal session-scoped lease (or no lease): identity assertion + capability assertion for the single call. Audit per call. |
| **agent-worker** | Bounded executor for a specific task. May have scoped tools. Has lifecycle, lineage, result envelope. Does not persist as a resident unless explicitly leased. | Bounded task lease: `workspace.read` (scoped paths); `workspace.patch` (proposal-only by default); `test.run`; bounded `command.execute` (allowlist); time-bounded TTL. Audit per action. |
| **occupant** | Resident Construct/reference-impl participant. Has identity, lease/session, mailbox or message surface, workspace presence, spawn rights, and audit lineage. Can coordinate subordinate execution under ASHE authority. | Standing lease per role: per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) role templates. May include `occupant.spawn` (cascade with attenuation), full `workspace.read`/`patch`/`apply` (per scope), `command.execute`, `mailbox.send`/`receive`, `audit.read` (own-session). Standing capabilities + risk-tiered automation per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) Commitment 2. |

The important point: **Claude Code as occupant-executor ≠ external provider call ≠ one-off worker.** It is a resident builder/executor with reference-implementation-recognized presence. That resident occupant may use Claude Code capabilities, including subagents and Dynamic Workflows, but identity and authority remain governed by ASHE.

### Per-class properties

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

## Phor-scoped governance (v0.2)

A phor should not be treated as only a task node or prompt wrapper. **A phor is a governance cell with local constitutional authority** over a bounded unit of work.

A phor defines the local authority frame for execution:

```
phor
  ├─ purpose / semantic work unit
  ├─ allowed execution class
  ├─ authority scope
  ├─ role constraints
  ├─ phoreme directives
  ├─ gates / acceptance criteria
  ├─ result channel
  ├─ permitted subagent insertion
  └─ lineage / audit requirements
```

### Phoremes as local execution law

Phoremes are not merely prompt fragments. Within a phor, phoremes function as **executable governance directives**. A phoreme may define:

- system prompts
- task directives
- role definitions
- constraints
- checks
- gate predicates
- output formats
- acceptance criteria
- escalation rules
- allowed tool surfaces
- delegation rules

### The governance stack

Authority flows through a structured chain of attenuation:

```
Construct law
  → ASHE protocol
    → occupant lease
      → phor-scoped governance
        → phoreme directives
          → node-level subagent insertion
            → provider/model/tool execution
              → result envelope
                → phor acceptance
                  → canonical Construct state
```

Each arrow is a delegation, and each delegation attenuates authority. Nothing inherits the parent's authority by default. Every level adds a governing layer that bounds what the next level may do.

## Node-level subagent insertion (v0.2)

A Claude Code occupant may be allowed to insert subordinate subagents into the phor's node structure. **That does not mean every spawned subagent is an occupant.**

Most inserted subagents are bounded **agent-workers**:

```
Claude Code occupant
  └─ governs work through phor
      ├─ inserts worker A into node/phoreme context
      ├─ inserts worker B into edge/gate review context
      ├─ inserts worker C into artifact validation context
      └─ receives normalized result envelopes
```

A node-level subagent becomes an occupant **only if ASHE grants explicit resident status** — lease, mailbox, workspace presence, audit subject, spawn rights.

The invariant is:

> Subagents spawned by an occupant do not inherit occupant authority by default. They receive attenuated, phor-scoped authority.

## Execution classes vs orchestration substrates (v0.2)

This is the critical distinction v0.2 makes explicit:

| Concept | What it is | Examples |
|---|---|---|
| **Execution class** | The kind of agent presence (identity / lifecycle / authority shape) | provider-call, agent-worker, occupant |
| **Orchestration substrate** | The mechanism that creates / coordinates execution presences | conversation turn, composition runner, Claude Code Dynamic Workflow, future native scheduler |

**Claude Code Dynamic Workflows** matter because they provide a substrate for large-scale subagent orchestration. Per public documentation, Dynamic Workflows are:

- JavaScript orchestration scripts running in background
- Intermediate state in script variables
- Resumable within the same Claude Code session
- No direct filesystem/shell access from the script itself
- Spawned agents perform tool calls
- Up to 1,000 total agents per run
- Up to 16 concurrent agents

**ASHE does not treat Dynamic Workflows as a fourth execution class.** The correct mapping:

```
Dynamic Workflow script         = orchestration substrate
Workflow-spawned subagent       = agent-worker by default
Workflow run                    = scheduler/run container
Workflow result                 = normalized result envelope
Workflow-spawned subagent with
explicit lease/mailbox/presence = occupant
```

The key sentence:

> Dynamic Workflows do not add a fourth agent class. They provide a scalable orchestration substrate for creating many bounded agent-worker executions. A workflow-spawned subagent becomes an occupant only if ASHE grants it resident identity, lease, mailbox, and workspace presence.

## "One agent per phor" — precise wording (v0.2)

The intent that *every phor governs execution* is strong, but the phrase can overclaim if interpreted literally.

**Do not say**:

- Every phor has a full agent.
- Every phor has an occupant.
- Every workflow subagent is resident in the host system.
- 1,000 workflow agents means 1,000 concurrent occupants.

**Say**:

- Every phor may govern execution presences.
- A phor may bind to a provider-call, agent-worker, occupant, or workflow-backed worker group.
- A Claude Code occupant may insert bounded subagents into the phor's node structure under attenuated, phor-scoped authority.

This preserves the architectural intent without collapsing all execution into occupants.

## Intent declaration is orthogonal

The intent surfaces from [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md) (`user-directed` / `task-directed` / `autonomous-cascade`) describe *what the agent is doing*. The execution class describes *what authority the agent holds*. The dimensions are orthogonal:

| Intent ↓ / Class → | provider-call | agent-worker | occupant |
|---|---|---|---|
| **user-directed** | Human → OpenAI inference | Human → bounded reviewer worker | Human → Claude Code occupant editing live |
| **task-directed** | Subagent → Gemini classification | Reviewer worker → PR lint | Claude Code occupant → autonomous refactor in scoped workspace |
| **autonomous-cascade** | (rare; no spawn capacity) | Worker fan-out | Occupant spawning child occupants with attenuated leases |

Both dimensions matter; ASHE handshake (per [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md)) carries both.

## Authority invariants (v0.2)

ADR-019 v0.2 states these as architectural invariants:

1. A **provider-call** has no resident identity unless wrapped by another execution presence.
2. An **agent-worker** is bounded to a task, result envelope, scope, and lifecycle.
3. An **occupant** is the only class with resident identity, mailbox, lease renewal, workspace presence, and durable spawn authority.
4. A Claude Code occupant may spawn or insert subagents only through **explicit ASHE-granted spawn rights**.
5. **Spawned subagents do not inherit full parent authority.**
6. **Delegated authority is attenuated by the governing phor and phoremes.**
7. Phoremes can define local directives, constraints, gates, and output obligations.
8. **Canonical Construct/host state changes require phor/governance acceptance**, not merely subagent output.
9. **Dynamic Workflows are orchestration substrate, not host identity.**
10. **A workflow-spawned worker becomes an occupant only through explicit ASHE resident lease.**

## Schema sketch (v0.2 informative)

A phor execution binding can be described conceptually as:

```json
{
  "phorId": "phor:investigate-api-auth",
  "executionBinding": {
    "executionId": "exec:...",
    "class": "agent-worker",
    "orchestration": "dynamic-workflow",
    "provider": "claude-code",
    "model": "opus-4.8",
    "authorityScope": [
      "workspace.read",
      "grep",
      "test.run"
    ],
    "lineage": {
      "compositionRunId": "run:...",
      "parentOccupantId": "occupant:builder",
      "parentPhorId": "phor:..."
    },
    "spawnPolicy": {
      "maySpawn": true,
      "inheritance": "attenuated",
      "maxDepth": 1,
      "maxWorkersTotal": 1000,
      "maxWorkersConcurrent": 16
    },
    "resultChannel": "construct.result-envelope.v1",
    "acceptance": {
      "governedBy": "phor",
      "gates": ["review", "validate", "publish"]
    }
  }
}
```

Occupant-only fields are explicit:

```json
{
  "occupant": {
    "occupantId": "occupant:builder",
    "leaseId": "lease:...",
    "mailbox": "mailbox:...",
    "presence": "workspace-resident",
    "leaseRenewal": true,
    "spawnRights": ["agent-worker.spawn"],
    "auditSubject": "subject:..."
  }
}
```

This shape prevents accidental promotion of every worker into an occupant.

A governing phor can declare its constitutional authority:

```json
{
  "phorId": "phor:build-auth-migration",
  "governance": {
    "residentExecutor": "occupant:claude-code-builder",
    "mayInsertNodes": true,
    "maySpawnSubagents": true,
    "spawnPolicy": "attenuated",
    "maxSpawnDepth": 2,
    "maxConcurrentWorkers": 16,
    "maxTotalWorkers": 1000,
    "requiredReviewPhoremes": ["review", "validate", "summarize"],
    "resultContract": "construct.result-envelope.v1"
  }
}
```

This is not merely dispatch config. It is **local constitutional authority** for what that phor's resident executor may do.

## Vocabulary (v0.2)

Use these terms consistently across the protocol and reference implementations:

| Term | Definition |
|---|---|
| **execution presence** | Any execution bound to a phor. Class is provider-call, agent-worker, or occupant. |
| **phor-scoped governance** | Local authority frame defined by a phor and its phoremes. |
| **node-level subagent insertion** | Act of inserting a bounded worker into a phor / node / phoreme context. |
| **occupant-executor** | Resident Claude Code (or equivalent) agent with host identity and authority to coordinate work. |
| **attenuated delegation** | Child subagents receive narrower authority than the parent occupant unless explicitly granted otherwise. |
| **result envelope** | Normalized result returned from provider-call, worker, or occupant execution. |
| **resident lease** | ASHE grant that turns an execution presence into an occupant. |
| **orchestration substrate** | The mechanism that creates / coordinates execution presences (conversation turn, composition runner, Dynamic Workflow, future native scheduler). |

## Per-class current state in the reference implementation

Per the observational pattern (2026-05-27), each class has a different integration status today:

| Class | Current state | What v0 implementation work delivers |
|-------|---------------|---------------------------------------|
| **provider-call** | Exists as descriptive metadata only (cataloging 7 providers); not integrated into active execution path | v0 may or may not surface as a third execution path; if not landed, v1 addition under same lease-discipline framing |
| **agent-worker** | **De facto current class**. The primary dispatch implementation is worker-shaped: bounded SDK call per composition node, non-persistent session, role-tool bundles (per role definitions such as IMPLEMENTER / REVIEWER / VALIDATOR). **Critical caveat**: current dispatch uses permissive SDK environment configuration — the safety boundary today is the configured SDK environment + role tool list, **NOT ASHE mediation**. | v0 brings this de facto class under explicit lease discipline: bounded task lease replaces SDK-environment-only safety; capability checks gate operations through the protocol-layer enforcer; audit captures actions per the protocol-layer audit logger |
| **occupant** | **Does not exist** in the active execution path today. Reference-implementation design proposes the v0 introduction. | v0 introduces occupant as a first-class concept with admission ceremonies, standing lease per role per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md), no-per-action-prompt mechanisms per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) Commitment 2 |

Kernel reference implementation primitives are tested as standalone components but **NOT YET wired into the active dispatch execution path** in the reference deployment.

## Current implementation boundary (v0.2)

Keep current-vs-target distinction clear.

### Current observed state of the reference implementation

- Composition runner executes phor graphs
- Dispatch pool dispatches bounded Claude workers
- Agent dispatch calls Claude Code SDK
- Agent definitions provide IMPLEMENTER / REVIEWER / VALIDATOR tool bundles
- Provider metadata stores descriptive provider information
- ASHE primitives exist and tests pass as standalone components

### What the current implementation does NOT yet fully provide

- Durable occupant runtime
- Occupant mailbox
- Resident lease lifecycle in active dispatch path
- Construct/host-owned node-level subagent insertion records
- ASHE-mediated spawn attenuation in active Claude Code SDK calls
- Dynamic Workflow integration as a host-side scheduler substrate

ADR-019 therefore describes **target architecture crystallizing an emerging distinction**, not already-implemented behavior. The status remains `Proposed` until working-code validation closes this gap.

## Relationship to existing ADRs

| ADR | Relationship to ADR-019 |
|-----|------------------------|
| [ADR-003](ADR-003-invariant-language.md) | Lease per class uses the ADR-003 capability descriptor grammar. The descriptor format does not differ across classes; what differs is which descriptors are bundled into the lease per class — and (v0.2) which descriptors are bundled into the phor-scoped governance frame. |
| [ADR-013](ADR-013-multi-service-architecture.md) | SessionService backs lease lifecycle for all three classes. OperatorService handles capability checks per class. AuditService captures per-class audit trails with per-class field shapes (v0.2: including phor-scoped lineage records). |
| [ADR-014](ADR-014-phased-enforcement-model.md) | Per-class trust assumptions track the four enforcement layers. Phor-scoped governance is most defensible at Layer 2+ (runtime hook). |
| [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) | **ADR-017 will require an amendment** to add the role templates implied by ADR-019: `ai-agent (occupant)` and `ai-agent (worker)` as named templates. |
| [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md) | ADR-018's intent surfaces are orthogonal to ADR-019's execution classes. The `.well-known/ashe` handshake carries identity + intent; the server-side maps identity → role → capability template per ADR-019 class. |

## Trust assumptions

| Per [ADR-014](ADR-014-phased-enforcement-model.md) enforcement layer | provider-call | agent-worker | occupant |
|------------------------------|---|---|---|
| **Layer 1 cooperating-SDK** | Lease enforcement depends on the SDK honoring lease scope. Trust the SDK. | Same. | Same. Phor governance gates depend on cooperating runtime. |
| **Layer 2 runtime-hook** | Runtime intercepts unauthorized operations; agent-worker / occupant gain runtime enforcement. provider-call typically does not have a runtime to hook. | Runtime-hook enforces lease scope. | Runtime-hook enforces lease scope + occupant.spawn attenuation + phor-scoped governance gates. |
| **Layer 3 OS-level mediation** | Less applicable to provider-call. | Syscall-level enforcement holds against adversarial code. | Syscall-level enforcement holds against adversarial code. |
| **Layer 4 hardware-rooted** | Possibly applicable if provider-call result delivery uses signed responses. | Cryptographic enforcement of capability boundaries. | Cryptographic enforcement of capability boundaries. |

## Consequences

**What becomes easier**:

- Clear architectural distinction between execution classes and orchestration substrates
- Correct provider adapter shape per class
- Honest gap accounting (each class has explicit current-state per implementation)
- Shadow-spawn captured (occupant.spawn at the protocol layer makes SDK-Agent-tool spawning observable + leased + audited)
- Cross-vendor interoperability (any vendor's agent can be admitted to any of the three classes if it supports the required properties)
- **Phor-scoped governance discipline** (v0.2) — bounded local authority frames prevent unbounded recursive full-trust agent spawning

**What becomes harder**:

- Explicit ceremony per integration (class decision + lease design + phor governance contract)
- More design work per occupant slot (role-template selection + lease-scope definition + admission-ceremony plumbing + phor governance contract)
- Class-membership disputes (edge cases need explicit resolution; ADR-019 names the distinguishing properties to guide such disputes)

**What becomes possible**:

- Occupancy runtime as first-class subsystem
- Worker-class lease discipline (replaces permissive-SDK-environment posture with capability-mediated dispatch)
- Provider-call standardization
- Cascade discipline (occupant.spawn with attenuation makes multi-agent compositions analyzable + revocable + auditable per lineage)
- **Phor-as-governance-cell pattern** (v0.2) — local constitutional authority frames composed within a global ASHE protocol

**What becomes impossible** (intentionally):

- Flat `dispatchAgent()` abstraction that hides class differences
- Authority inheritance by vendor — privilege flows from explicit lease grant, not vendor identity
- Implicit spawn — cascade is structural; spawn invocations require explicit lease + lineage capture
- **Unbounded recursive full-trust agent spawning** (v0.2) — phor-scoped governance + attenuated delegation explicitly prevent this

## Alternatives Considered

**1. Flat `dispatchAgent()` abstraction.** Rejected — hides material differences in authority, lifecycle, state.

**2. Two-class binary (occupant / non-occupant).** Rejected — collapses provider-call and agent-worker; hides the agent-worker class that currently dominates production execution.

**3. Four-class taxonomy adding "workflow-agent" or similar.** Rejected (v0.2) — Dynamic Workflows are orchestration substrate, not an execution class. A workflow-spawned subagent is an agent-worker (or occupant, if explicitly leased) — the workflow is the mechanism, not the identity.

**4. Vendor-determined class membership.** Rejected — vendor identity is not the right axis for authority distinction; properties are.

**5. Intent-determined class membership.** Rejected — intent and class are orthogonal dimensions; collapsing them loses information.

**6. Phor as task node only (not governance cell).** Rejected (v0.2) — without explicit phor-scoped governance, occupant authority can recurse unboundedly into spawned subagents, defeating the bounded-blast-radius property.

**7. Phoremes as prompt fragments only.** Rejected (v0.2) — phoremes need to encode role, procedure, validation, constraints, acceptance criteria, escalation rules as executable governance directives. Treating them as mere prompts forecloses the local-execution-law model.

**8. Defer the distinction until working-code validation is complete.** Partially accepted — this ADR is `Proposed` precisely to honor the working-code-first discipline.

## What to avoid in implementation framing

Per v0.2 clarification, do not make these claims about the architecture:

| Avoid | Use instead |
|---|---|
| "Dynamic Workflows are occupants" | "Dynamic Workflows can realize large agent-worker swarms" |
| "Every phor has an occupant" | "Every phor may govern execution presences" |
| "Claude Code subagents inherit the parent occupant's authority" | "Subagent authority is attenuated by phor-scoped governance" |
| "1,000 workflow agents means 1,000 concurrent host residents" | "Workflow-spawned workers are agent-workers; resident status requires explicit ASHE lease" |
| "Current implementation already provides full occupant-executor governance" | "Current implementation has worker-dispatch primitives and occupancy design intent; full occupant governance remains target architecture" |
| "Provider metadata means provider-call execution is fully integrated" | "Provider metadata is descriptive; provider-call as an integrated execution path is v0/v1 implementation work" |

## Validation commitment

ADR-019's status remains **Proposed** until the following criteria are met:

1. **Working-code validation**: the reference implementation lands the three-class pattern (with phor-scoped governance per v0.2) and validates it as workable
2. **[ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) amendment**: role templates per ADR-019 class are added to ADR-017's role-template table
3. **Conformance evidence**: per [ADR-015](ADR-015-validation-methodology-and-tiered-claims.md) validation methodology, conformance suite probes verify per-class behavior + phor-scoped governance attenuation in at least one implementation

If working-code validation reveals the three-class pattern (or the phor-scoped governance model) is wrong, ADR-019 will be revised or superseded before migration to `Accepted`.

## Related decisions

- [ADR-003](ADR-003-invariant-language.md) — Capability descriptor grammar (lease per class uses this grammar)
- [ADR-013](ADR-013-multi-service-architecture.md) — Multi-service architecture
- [ADR-014](ADR-014-phased-enforcement-model.md) — Phased enforcement
- [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) — Sealed-workspace + no-per-action-prompt mechanisms + role templates (ADR-019 requires amendment to ADR-017's role-template table)
- [ADR-018](ADR-018-well-known-ashe-web-side-interaction-point.md) — `.well-known/ashe` web-side interaction-point convention (intent surfaces orthogonal to execution classes)
- ADR-020 (forthcoming) — Vulnerability advisory propagation + emergency lease attenuation (per-class attenuation behavior will be specified per class + per phor-scoped governance frame)

## Forward pointers

- **Reference implementation** (Continuum-internal) — Tier 5 reference implementation design that validates ADR-019 v0.2 in working code; details available upon engagement
- **ADR-017 amendment** (forthcoming) — adds `ai-agent (occupant)` and `ai-agent (worker)` role templates to the existing role-template table
- **Conformance suite per-class + per-phor-governance probes** (per ADR-015 forthcoming benchmark publication) — verifies per-class behavior + phor-scoped governance attenuation in at least one implementation

---

## v0.2 bottom line

> Claude Code may be installed as an occupant-executor inside a reference implementation. That occupant acts through phor-scoped governance. The phor and its phoremes define local execution law. The occupant may insert node-level subagents. Those subagents are bounded agent-workers unless explicitly leased as occupants. Dynamic Workflows are a scalable substrate for those workers, not the identity model. ASHE is the authority boundary that keeps this from becoming unbounded recursive full-trust agent spawning.

**ADR-019 v0.2 (Proposed) names the three execution-class distinction (provider-call / agent-worker / occupant) as a protocol-tier architectural commitment + the phor-scoped governance frame that mediates occupant authority + the distinction between execution classes and orchestration substrates. Class membership is determined by properties, not by vendor. Phor governance is local constitutional authority. Phoremes are local execution law. Subagent authority is attenuated by phor-scoped governance. Status migrates to `Accepted` upon working-code validation per ADR-015 methodology.**
