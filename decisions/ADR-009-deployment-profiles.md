# ADR-009: ASHE deployment profiles

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-23 |
| Decider | PK + Claude |
| Touches | reference-arch (primary), protocol (profile awareness ensures cross-impl agent portability) |

## Context

ASHE is designed for the full deployment spectrum:

- **Embedded** contexts (IoT, edge, mobile) — KB-scale binaries, no GPU, no internet
- **CI/CD gates** — short-lived, fast startup, minimal memory
- **Workstation development** — local LLMs acceptable; GB-scale OK
- **Production hosts running untrusted code** — sandbox infrastructure mandatory; multi-GB OK
- **Cloud-native deployments** — accepts API dependency for LLM intelligence

A single distribution shape cannot satisfy all of these. ASHE-with-LLM is overkill for an IoT gate; ASHE-rules-only is undersized for evaluating untrusted code. Forcing one shape on all consumers either bloats the embedded use case or starves the production-host use case.

The protocol surface, however, must be **uniform across all profiles**. An agent should not need to know which profile its target kernel runs — the request/response shapes are identical; only the *quality of decisions* differs.

This is the same architectural pattern as Linux distributions (minimal / desktop / server / specialized): one kernel API, many distribution profiles, picked at deployment time per environment.

## Decision

**ASHE ships in profiles, each combining a subset of the capability tiers from ADR-008. All profiles share the same protocol surface; they differ in which evaluators are registered.**

| Profile | Tiers included | Approx. size | Primary use case |
|---------|---------------|--------------|------------------|
| **ASHE-core** | Tier 0 (rules + JSON Schema + scope grammar) | <50 MB | Embedded, edge, CI/CD gates, IoT — minimal contexts |
| **ASHE-classify** | Tiers 0 + 1 (rules + tiny ONNX classifiers) | ~250–500 MB | Most kernel deployments; low-latency requirement |
| **ASHE-eval** | Tiers 0 + 1 + 2 (+ local small LLM) | ~3 GB | Workstations, development environments, security-sensitive contexts |
| **ASHE-full** | Tiers 0 + 1 + 2 + sandbox infrastructure | ~5–10 GB | Production hosts running untrusted code |
| **ASHE-thin** | Tiers 0 + 1 + cloud-LLM client (no local LLM) | ~250 MB | When cloud API is acceptable; LLM-as-a-service deployments |

**Graceful degradation is part of the contract**: if an evaluator tier is not registered (because the profile doesn't include it), the graph routes around the missing node. Unresolved decisions default to deny (or escalate to next-higher available tier, depending on policy). ASHE never *fails* because a tier is missing — it just makes more conservative decisions.

**Agents are profile-agnostic** at the protocol layer. Request shapes, response shapes, error codes, ETag semantics, idempotency rules — all identical. An agent's code does not need to know whether its target kernel runs ASHE-core or ASHE-full.

**Profile selection is a deployment-time decision**, made by whoever installs/configures the kernel. It is not negotiated per-session; it is not advertised in the blueprint (though it may be inferred from which evaluator tiers ran for a given decision, visible in audit records).

## Consequences

**What becomes easier**:

- Embedded deployment — ASHE-core is small enough to fit anywhere that the kernel itself fits
- Production hardening — ASHE-full bundles sandbox infrastructure as a coherent package
- CI/CD integration — ASHE-classify or ASHE-thin runs fast enough for per-commit policy gates
- Cloud-native deployments — ASHE-thin doesn't carry GB-scale model weights; the LLM is somebody else's service
- Privacy-sensitive deployments — ASHE-eval keeps inference fully on-device

**What becomes harder**:

- Distribution complexity — multiple build targets / packages to maintain
- Documentation — every feature must specify which profile(s) include it
- Capability assumption checks — agents that depend on tier-2 reasoning must handle deployments where tier-2 isn't present (mitigation: graceful-degradation policy — they get conservative denials rather than errors)

**What becomes possible**:

- ASHE as a *universal* protocol that adapts to context, rather than a single shape
- Deployment paths from minimal to full without code changes — upgrade ASHE-core → ASHE-classify → ASHE-eval over time as the deployment matures
- Cross-org portability — Organization A runs ASHE-core, Organization B runs ASHE-full; the same agent talks to both

**What becomes impossible** (intentionally):

- Hidden capability requirements at the protocol layer — agents cannot demand "give me tier-2 intelligence" because the protocol exposes capability tiers neither at handshake nor per-request; capability is a server-side property
- Single-distribution monoculture — there is no "the" ASHE binary; there are profiles, picked per deployment

## Alternatives Considered

**1. One-size-fits-all distribution.** Ship ASHE-full to everyone; smaller deployments waste the unused tiers. Rejected because: (a) GB-scale binary disqualifies embedded; (b) cold-start time disqualifies CI gates; (c) wastes memory + disk on the 80% of deployments that don't need tier 2+.

**2. Build-time stripping (conditional compilation).** One source tree, conditionally compile to omit unused tiers. Rejected because: (a) build complexity; (b) conditional-compilation tooling differs by language; (c) profiles need to be installable, not built — operations teams pick a profile, not compile flags.

**3. Runtime feature flags.** One binary, runtime config enables/disables tiers. Rejected because: (a) doesn't address binary-size concern (embedded still bloated); (b) runtime-disabled code is dead weight; (c) attack surface includes disabled code paths.

**4. Cloud-only ASHE (no local profiles).** Always defer to a cloud ASHE service. Rejected because: (a) network dependency disqualifies offline use cases; (b) privacy/compliance disqualifies sensitive deployments; (c) latency budget too tight for hot-path decisions.

**5. Local-only ASHE (no cloud profile).** Never offer cloud LLM integration. Rejected because: (a) some deployments are happy to accept cloud dependency for richer reasoning; (b) cloud LLM is the corpus-collection mechanism for training future tier-2 models; (c) limits ASHE's value in deployments that want best-available intelligence without managing local inference.

**6. Profile-aware protocol (agents negotiate capabilities).** Profile capabilities are exposed in handshake; agents adapt requests to match available tiers. Rejected because: (a) breaks agent portability — agents now have profile-specific code paths; (b) creates pressure to lock down what each profile guarantees, reducing operator flexibility; (c) exposes server-side architecture details across the trust boundary unnecessarily.

## Related decisions

- ADR-008 — Validation graph with default-to-tiny-ONNX evaluators (defines the tiers this ADR composes into profiles)
- ADR-001 — Tiered conformance with full-tier reference implementation (the conformance tiers and deployment tiers are orthogonal but use compatible language; care needed to avoid confusion in docs)
- Forward: per-profile conformance suites (deferred; each profile's behavior must be verifiable against the protocol)
