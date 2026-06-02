# ASHE — Element Design Specifications

This directory drills every architectural element of ASHE down to the engineering level. Each element is defined across four facets:

1. **Technology** — what actually implements it, *per enforcement layer* ([ADR-014](../decisions/ADR-014-phased-enforcement-model.md) Layer 1→4). The same element is realized differently as enforcement deepens.
2. **Application** — where it appears in the system, what depends on it, the use cases it serves.
3. **Algorithm** — the precise procedures, the invariants they preserve, complexity, and the security properties they buy.
4. **Pseudocode** — concrete, implementable pseudocode, kept consistent with the running reference primitives in [`conformance/src/protocol/`](../conformance/src/protocol/).

These specs are the engineering expansion of the corpus. They are normative where they restate an ADR commitment and *informative* (reference-implementation guidance) where they describe one concrete realization. Where running code already exists, the spec is grounded in it and the doc says so.

---

## Element catalog

Grouped by subsystem. **Status**: ✅ running code in `conformance/src/protocol/` · 🟡 partial · ⬜ spec-only so far.

### A. Core trust primitives
| # | Element | ADRs | Status |
|---|---|---|---|
| [01](01-capability.md) | **Capability** — the unforgeable reference; `CapabilitySet`; attenuation | [003](../decisions/ADR-003-invariant-language.md), VISION §1 | ✅ |
| [02](02-lease.md) | **Lease** — boundary-amortized authority; issuance / validation / **revocation** | [017](../decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md), WEIGHTLESS | ✅ (issue) 🟡 (revoke) |
| [03](03-mediation.md) | **Mediation** — the interception chain; routine-path pass-through vs Tier-C boundary | [007](../decisions/ADR-007-interception-chain-pattern.md) | ✅ |
| 04 | **Identity & Principal** — OIDC / DID-compatible claims; actor binding | [002](../decisions/ADR-002-oidc-identity.md) | ⬜ |

### B. Decision subsystem
| # | Element | ADRs | Status |
|---|---|---|---|
| 05 | **Validation graph & evaluators** — default-to-tiny-ONNX; standalone engine | [008](../decisions/ADR-008-validation-graph-tiny-onnx.md), [010](../decisions/ADR-010-standalone-graph-engine.md) | ⬜ |
| 06 | **Tier classification & risk scoring** — A/B routine, C boundary; anomaly score | [017](../decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) | ✅ (static) 🟡 (scored) |
| 07 | **Intent declaration & reconciliation** — declare-once, auto-validate | VISION §6, [017](../decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) | ✅ |

### C. Provenance
| # | Element | ADRs | Status |
|---|---|---|---|
| 08 | **Audit log** — tamper-evident hash chain; append-only | [013](../decisions/ADR-013-multi-service-architecture.md) | ✅ |
| 09 | **Provenance & capability-grounded content** — per-action provenance | ADR-016 (forthcoming) | ⬜ |

### D. Wire & tokens
| # | Element | ADRs | Status |
|---|---|---|---|
| 10 | **Wire format** — Protobuf canonical + JSON / TOON projections | [012](../decisions/ADR-012-wire-format-grpc-protobuf-with-projections.md), [006](../decisions/ADR-006-toon-dual-projection.md) | ⬜ |
| 11 | **Capability token** — serialized, signed, hardware-verifiable (Layer 4) | [012](../decisions/ADR-012-wire-format-grpc-protobuf-with-projections.md), [014](../decisions/ADR-014-phased-enforcement-model.md) | ⬜ |

### E. Tri-surface
| # | Element | ADRs | Status |
|---|---|---|---|
| 12 | **Sealed workspace** (dev-side) — `ashe workspace init`; wall-up-first | [017](../decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) | ⬜ |
| 13 | **`.well-known/ashe`** (web-side) — discovery + handshake | [018](../decisions/ADR-018-well-known-ashe-web-side-interaction-point.md) | ⬜ |
| 14 | **Agent-side enforcement** — the phased-layer mechanism | [014](../decisions/ADR-014-phased-enforcement-model.md) | 🟡 |

### F. Enforcement substrate (cross-cutting technology)
| # | Element | ADRs | Status |
|---|---|---|---|
| 15 | **Layer 1 — cooperating SDK** | [014](../decisions/ADR-014-phased-enforcement-model.md) | ✅ |
| 16 | **Layer 2 — runtime hook** (Node `fs`/`child_process`/`http`) | [014](../decisions/ADR-014-phased-enforcement-model.md) | ⬜ |
| 17 | **Layer 3 — OS mediation** (eBPF / gVisor / Firecracker) | [014](../decisions/ADR-014-phased-enforcement-model.md) | ⬜ |
| 18 | **Layer 4 — hardware root** (TPM / TEE attestation) | [014](../decisions/ADR-014-phased-enforcement-model.md) | ⬜ |

### G. Services & deployment
| # | Element | ADRs | Status |
|---|---|---|---|
| 19 | **Multi-service architecture** — Session / Blueprint / Operator / Build / Audit | [013](../decisions/ADR-013-multi-service-architecture.md) | ⬜ |
| 20 | **Deployment profiles** — ASHE-core → ASHE-full; graceful degradation | [009](../decisions/ADR-009-deployment-profiles.md) | ⬜ |

---

## Drill order (why this sequence)

The trust spine first — **01 Capability → 02 Lease → 03 Mediation** — because every other element depends on them: there is no audit without something to audit, no wire format without a capability to serialize, no enforcement layer without a decision to enforce. These three also have running, tested code, so the specs are grounded rather than speculative. From there: the decision subsystem (05–07), provenance (08–09), wire/tokens (10–11), the tri-surface (12–14), and the enforcement substrate (15–18), finishing with services/deployment (19–20).

## The four-facet template

```markdown
# Element NN: <Name>

| Field | Value |
| Status | ✅/🟡/⬜ | Layers | which of 1–4 it applies to |
| ADRs | … | Reference code | path if it exists |

## 1. Technology      — substrate per layer; data structures; dependencies
## 2. Application     — consumers; use cases; where it sits in a request
## 3. Algorithm       — procedures; invariants; complexity; security properties
## 4. Pseudocode      — concrete, implementable
## 5. Conformance     — which ADR-020 group / suite test exercises it
## 6. Failure modes   — what it cannot do; degradation behavior
```
