# ASHE Architecture Decision Records — Index

Architecture Decision Records (ADRs) capture significant architectural decisions, their context, the options considered, the chosen path, and the ramifications. Each ADR is immutable once accepted. Subsequent revisions create new ADRs that supersede prior ones (with explicit "supersedes" / "superseded by" cross-references).

Pattern: Michael Nygard's ADR template.

---

## Status legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Decision is current and binding |
| **Superseded** | Decision was binding but is replaced by a later ADR (cross-referenced) |
| **Deprecated** | Decision is no longer recommended but not yet replaced |
| **Rejected** | Considered and rejected (preserved for audit) |

---

## Umbrella architecture documents

Architecture documents that span multiple ADRs. ADRs derive from these and inherit their invariants.

| # | Title | Status | Date | Derives ADRs |
|---|-------|--------|------|--------------|
| **A1** | [Receipt Trust Stack — Architecture v0](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md) | **Draft** | 2026-05-31 | 021 (narrowed), 022-028 (layer derivations), 029 (governance), 030 (PTR meta-registry), 031+ (concrete class + predicate entries, planned) |
| **A2** | [ASHE-OpenShell Integration Architecture v0](ASHE-OPENSHELL-INTEGRATION-ARCHITECTURE-v0.md) | **Draft** (non-normative; companion to ADR-037; external-facing positioning) | 2026-06-03 | ADR-037 (formal integration ADR); future Pattern E hardware attestation alignment |
| **A3** | [ASHE Layer Systems Explainer v0](ASHE-LAYER-SYSTEMS-EXPLAINER-v0.md) | **Draft** (cross-cutting two-axis architecture explainer; non-normative) | 2026-06-03 | Two layer systems (Trust Stack 6 layers + Enforcement Progression 4+asymptotic) cross-reference for all derived ADRs |
| **E1** | [Permission Model Exploration v0](PERMISSION-MODEL-EXPLORATION-v0.md) | **Exploration** (pre-ADR alignment artifact; not normative) | 2026-06-02 | Precedes ADRs 032 (Verifier Policy), 033 (Grant Exercise Predicate), 035 (Grant Structure & Lifecycle) |
| **T1** | [ASHE Threat Model v0](THREAT-MODEL-v0.md) | **Draft** (comprehensive threat-modeling; 4 actor categories × 3 lifecycle phases) | 2026-06-03 | Citable by adopter due-diligence, AI safety research, compliance documentation |
| **G1** | [Tier Progression Guide v0](TIER-PROGRESSION-GUIDE-v0.md) | **Draft** (adopter-facing tier selection + progression roadmap) | 2026-06-03 | Adopter onboarding; tier-to-regulatory-framework mapping |
| **D1** | [Deeper Layers Explainer v0](DEEPER-LAYERS-EXPLAINER-v0.md) | **Draft** (substantive Trust Stack Layers 4-5-6 content) | 2026-06-03 | Regulated-industry adoption; high-assurance deployments; long-term trust persistence |
| **P1** | [Platform Neutrality Explainer v0](PLATFORM-NEUTRALITY-EXPLAINER-v0.md) | **Draft** (cross-platform composition; verifier-as-enforcement-point) | 2026-06-03 | Heterogeneous infrastructure adopters; non-NVIDIA deployments; downstream applications |
| **H1** | [Hardware Substrate Catalog v0](HARDWARE-SUBSTRATE-CATALOG-v0.md) | **Draft** (CCR class entries spanning TPM2/SGX/TDX/SEV-SNP/CCA/Nitro/Caliptra/BlueField/HSM/etc.) | 2026-06-03 | Enforcement Layer 4 substrate selection; multi-substrate composition |
| **C1** | [Conformance Triplet Architecture v0](CONFORMANCE-TRIPLET-ARCHITECTURE-v0.md) | **Draft** (cross-cutting explainer for protocol's core building block: contract + receipt + verifier) | 2026-06-04 | Foundational; cited by RECEIPT-ENVELOPE, VERIFIER-ALGORITHM |
| **C2** | [Class Registry Pattern v0](CLASS-REGISTRY-PATTERN-v0.md) | **Draft** (meta-pattern across HACR/SACR/WCR/ACR/CCR/PTR/GTR) | 2026-06-04 | Governance structure underlying every class registry |
| **C3** | [Receipt Envelope Architecture v0](RECEIPT-ENVELOPE-ARCHITECTURE-v0.md) | **Draft** (v0.7 envelope; predicate block; per-layer canonicalization scopes) | 2026-06-04 | Adapter implementers; verifier authors |
| **C4** | [Verifier Algorithm v0](VERIFIER-ALGORITHM-v0.md) | **Draft** (normative 9-step verification algorithm with full failure code reference) | 2026-06-04 | Verifier implementers; downstream consumers |
| **R1** | [Regulatory Framework Mapping v0](REGULATORY-FRAMEWORK-MAPPING-v0.md) | **Draft** (35+ regulatory frameworks mapped to ASHE deployment configurations) | 2026-06-04 | Compliance officers; procurement evaluators; auditors |
| **K1** | [Cryptographic Agility v0](CRYPTOGRAPHIC-AGILITY-v0.md) | **Draft** (primitive evolution; class deprecation; re-attestation; PQ transition) | 2026-06-04 | Cryptographers; post-quantum transition planners |
| **L1** | [Grant Lifecycle Architecture v0](GRANT-LIFECYCLE-ARCHITECTURE-v0.md) | **Draft** (5-state lifecycle: Issued/Attenuated/Exercised/Revoked/Expired) | 2026-06-04 | Authorization architects; verifier authors |
| **F1** | [Federation Governance v0](FEDERATION-GOVERNANCE-v0.md) | **Draft** (Layer 6 operational governance; monitor independence; curator continuity) | 2026-06-04 | Federation operators; sovereign curators |
| **S1** | [Sustainment Architecture v0](SUSTAINMENT-ARCHITECTURE-v0.md) | **Draft** (multi-decade concerns: receipt persistence, cryptographic decay, hardware transitions) | 2026-06-04 | Critical-infrastructure adopters; archival systems |
| **SG1** | [Sigstore Multi-Layer Integration v0](SIGSTORE-MULTI-LAYER-INTEGRATION-v0.md) | **Draft** (Sigstore composition across Layers 2/3/5 + bridge predicate) | 2026-06-04 | Sigstore-ecosystem adopters; supply chain attestation |
| **OS1** | [OpenShell Integration Guide v0](OPENSHELL-INTEGRATION-GUIDE-v0.md) | **Draft** (adopter-facing how-to for ADR-037 Patterns A-F) | 2026-06-04 | OpenShell adopters integrating ASHE |
| **AI1** | [AI Safety Implications v0](AI-SAFETY-IMPLICATIONS-v0.md) | **Draft** (substantive engagement for AI safety researchers + frontier labs) | 2026-06-04 | AI safety researchers; alignment teams; policy researchers |
| **MP1** | [Multi-Party Governance v0](MULTI-PARTY-GOVERNANCE-v0.md) | **Draft** (preparation for ADR-039; closes multi-insider collusion residual gap) | 2026-06-04 | High-assurance adopters; sovereign deployments |
| **GP1** | [In-Scope Adversarial Action Gap v0](IN-SCOPE-ADVERSARIAL-GAP-v0.md) | **Draft** (deep analysis of hardest residual gap; mitigation strategies) | 2026-06-04 | Threat modelers; AI safety researchers; high-assurance adopters |
| **IG1** | [Continuum Integration Graph v0](CONTINUUM-INTEGRATION-GRAPH-v0.md) | **Draft** (every ASHE node mapped to Session 0/1/2; existing DM integration; drift detection) | 2026-06-04 | Implementation engineers; kernel architects; pre-implementation reference |
| **RM1** | [Implementation Roadmap v0](IMPLEMENTATION-ROADMAP-v0.md) | **Draft** (10 phases + v1.0 lock gates; ~103 hour effort estimate; risk register) | 2026-06-04 | Implementation engineers; project planners |

---

## ADRs by number

| # | Title | Status | Date | Touches |
|---|-------|--------|------|---------|
| **001** | [Tiered conformance with full-tier reference impl](ADR-001-tiered-conformance.md) | Accepted | 2026-05-22 | Protocol, paradigm |
| **002** | [Identity: OIDC with DID-compatible claim shapes](ADR-002-oidc-identity.md) | Accepted | 2026-05-22 | Protocol, reference arch |
| **003** | [Invariant language: JSON Schema + CEL + ASHE state-machine notation](ADR-003-invariant-language.md) | Accepted | 2026-05-22 | Protocol |
| **004** | [Naming policy: ASHE working name + neutral wire identifiers](ADR-004-naming-policy.md) | Accepted | 2026-05-22 | Protocol, paradigm |
| **005** | [First-slice cohesion: Vision + Spec DRAFT + Continuum full impl + Spec v1.0 + Conformance suite](ADR-005-first-slice-cohesion.md) | Accepted | 2026-05-22 | Process, reference arch |
| **006** | [TOON dual-projection as paradigm-level design](ADR-006-toon-dual-projection.md) | Accepted | 2026-05-22 | Paradigm, protocol |
| **007** | [Interception-chain pattern as kernel-wide extension model](ADR-007-interception-chain-pattern.md) | Accepted | 2026-05-23 | Reference arch |
| **008** | [Validation graph with default-to-tiny-ONNX evaluators](ADR-008-validation-graph-tiny-onnx.md) | Accepted (forward progression); §1 engine-reuse aspect SUPERSEDED by ADR-010 | 2026-05-23 | Reference arch, protocol |
| **009** | [ASHE deployment profiles](ADR-009-deployment-profiles.md) | Accepted | 2026-05-23 | Reference arch, protocol |
| **010** | [Standalone graph engine for ASHE evaluator composition](ADR-010-standalone-graph-engine.md) | Accepted | 2026-05-23 | Reference arch |
| **011** | [TypeScript / OpenAPI naming convention](ADR-011-typescript-openapi-naming-convention.md) | Accepted; amended by ADR-012 to clarify Protobuf-JSON-mapping compatibility | 2026-05-24 | Protocol, reference arch |
| **012** | [Wire format — gRPC/Protobuf canonical + JSON and TOON projections](ADR-012-wire-format-grpc-protobuf-with-projections.md) | Accepted | 2026-05-25 | Protocol, reference arch |
| **013** | [Multi-service architecture — Session/Blueprint/Operator/Build/Audit](ADR-013-multi-service-architecture.md) | Accepted | 2026-05-25 | Protocol, reference arch |
| **014** | ["ASHE as door" — phased enforcement model](ADR-014-phased-enforcement-model.md) | Accepted | 2026-05-25 | Reference arch, protocol |
| **015** | [Validation methodology — benchmark-first; tiered claims with evidence grades](ADR-015-validation-methodology-and-tiered-claims.md) | Accepted | 2026-05-25 | Process, reference arch |
| **017** | [Sealed workspace as foundational development pattern](ADR-017-sealed-workspace-foundational-dev-pattern.md) | Accepted | 2026-05-26 | Reference arch, protocol |
| **018** | [`.well-known/ashe` web-side interaction-point convention](ADR-018-well-known-ashe-web-side-interaction-point.md) | Accepted | 2026-05-27 | Protocol, reference arch |
| **019** | [Execution-class distinction — provider-call / agent-worker / occupant](ADR-019-execution-class-distinction.md) | **Proposed** (pending working-code validation via CONSTRUCT-CLAUDE-OCCUPANCY-DESIGN-v0) | 2026-05-27 | Protocol, reference arch |
| **020** | [Conformance triplet — contract + receipt + verifier as protocol architecture](ADR-020-conformance-triplet.md) | Accepted | 2026-05-30 | Protocol, paradigm, process |
| **021** | [Receipt signing — Layer 2 Identity (weightless internal-signing)](ADR-021-receipt-signing.md) | **Accepted** (narrowed 2026-05-31 to Layer 2 only; derives from [A1](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md)) | 2026-05-31 | Protocol, receipt format, verifier (Layer 2) |
| **022** | [Receipt signing — Layer 1 Integrity Base (JCS + content hash + history chain)](ADR-022-integrity-base.md) | **Drafted** (derives from [A1](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md)) | 2026-05-31 | Protocol, receipt format (Layer 1) |
| **023** | [Layer 3 Witness — WPI + OpenTimestamps](ADR-023-witness-provider-interface.md) | **Drafted** (derives from [A1](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md)) | 2026-06-01 | Protocol, receipt format (Layer 3) |
| **024** | [Witness Class Registry — governance, addition, deprecation](ADR-024-witness-class-registry.md) | **Drafted** (derives from [A1](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md)) | 2026-06-01 | Protocol infrastructure, governance |
| **025** | [Cross-Domain Transfer markers + surrogate-receipt linking](ADR-025-cross-domain-transfer.md) | **Drafted** (derives from [A1](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md) §7) | 2026-06-01 | Protocol, classified-system accommodation |
| **026** | [Layer 4 Anchors — types + Anchor Provider Interface](ADR-026-anchor-types.md) | **Drafted** (derives from [A1](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md)) | 2026-06-01 | Protocol, receipt format (Layer 4) |
| **027** | [Layer 5 Compliance — co-signature types + Compliance Provider Interface](ADR-027-compliance-cosignatures.md) | **Drafted** (derives from [A1](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md)) | 2026-06-01 | Protocol, receipt format (Layer 5) |
| **028** | [Layer 6 Federation — public ASHE registry + governance](ADR-028-federation.md) | **Provisionally Accepted** (derives from [A1](RECEIPT-TRUST-STACK-ARCHITECTURE-v0.md); constrained by ADR-029) | 2026-06-01 | Protocol infrastructure, federation |
| **029** | [Trust Governance Model — protocol curates vocabulary, verifier curates trust](ADR-029-trust-governance-model.md) | **Accepted** (essential governance; constrains all future class-registry ADRs) | 2026-06-01 | Protocol governance, all class registries, verifier semantics, deployment topology |
| **030** | [Predicate Type Registry (PTR) — typed receipt claims](ADR-030-predicate-type-registry.md) | **Accepted** (meta-registry; mandatory `predicateType` field; ASHE shifts from "conformance receipt protocol" to "verifiable claims protocol") | 2026-06-02 | Protocol, receipt envelope (v0.6→v0.7), verifier semantics, claim semantics |
| **031** | [Sigstore Rekor as Layer 3 WCR entry — `sigstore-rekor/v1`](ADR-031-sigstore-rekor-layer-3-wcr-entry.md) | **Accepted** (first concrete WCR class entry under ADR-029 governance; complementary to OpenTimestamps) | 2026-06-02 | WCR registry, Layer 3 verifier behavior, receipt envelope (Layer 3 witnesses entry shape) |
| **032** | [Verifier Policy Schema — declarative trust-posture for ASHE verifiers](ADR-032-verifier-policy-schema.md) | **Accepted** (concretizes ADR-029 §29.4; portable, signable, attestable policy documents) | 2026-06-02 | Verifier semantics, deployment-context configuration, receipt verification surface |
| **033** | [Grant Exercise Predicate — `ashe.io/grant-exercise/v1`](ADR-033-grant-exercise-predicate.md) | **Accepted** (first concrete predicate type under ADR-030 PTR; ASHE's most distinctive use case) | 2026-06-02 | PTR entry, verifier predicate-evaluation semantics, receipt body schema (permission protocol surface) |
| **034** | [DPU Attestation Predicate — `ashe.io/execution-attestation/v1`](ADR-034-dpu-attestation-predicate.md) | **Accepted** (closes Path C from 2026-06-01 DPU discussion; hardware-rooted execution attestation as predicate type) | 2026-06-02 | PTR entry, CCR class dispatch (Caliptra/BlueField/Nitro/TDX/SEV-SNP/TPM2), verifier execution-attestation semantics |
| **035** | [Grant Structure & Lifecycle — `ashe.io/grant/v1`](ADR-035-grant-structure-and-lifecycle.md) | **Accepted** (grant document schema; companion to ADR-033; completes the permission protocol surface) | 2026-06-02 | Grant document schema, lifecycle (issuance/attenuation/exercise/revocation), Grant Type Registry (GTR) |
| **036** | [Ecosystem-Bridge Predicates — in-toto/SLSA/SPDX/CycloneDX/OpenVEX/Sigstore](ADR-036-ecosystem-bridge-predicates.md) | **Accepted** (locks ASHE-as-envelope positioning; six initial bridge predicates) | 2026-06-02 | PTR bridge entries, verifier delegation to vendored upstream validators |
| **037** | [NVIDIA OpenShell Integration — ASHE as natural protocol partner](ADR-037-nvidia-openshell-integration.md) | **Accepted** (canonical reference runtime partner; six integration patterns locked) | 2026-06-03 | PTR (OpenShell event bridge predicate), GTR (OpenShell policy grant type), verifier policy (OpenShell-aware fields), external positioning |
| **038** | [Signature Algorithm Class Registry (SACR)](ADR-038-signature-algorithm-class-registry.md) | **Accepted** (Layer 2 signature primitive registry; admits Ed25519/Ed448/ECDSA/ML-DSA/SLH-DSA/hybrid) | 2026-06-04 | Layer 2 identity, verifier policy, post-quantum migration |
| **039** | [Multi-Party Governance](ADR-039-multi-party-governance.md) | **Accepted** (normative multi-party requirements; closes multi-insider collusion gap) | 2026-06-04 | Verifier policy, Layer 5 multi-sig, federation governance, governance monitor predicates |

---

## ADRs by layer

| Layer | ADRs |
|-------|------|
| **Paradigm** (conceptual) | 001, 004, 006, 020 |
| **Protocol** (wire spec) | 001, 002, 003, 004, 006, 008, 009, 020, 021, 022, 023, 026, 027 |
| **Reference architecture** (Continuum-specific) | 002, 005, 007, 008, 009, 021 |
| **Process** (how we work) | 005, 020 |
| **Governance** (protocol curation, registries) | **029** (essential), **030** (PTR meta-registry), 024, 028 |
| **Trust Stack — Layer 1 Integrity** | 022 |
| **Trust Stack — Layer 2 Identity** | 021 |
| **Trust Stack — Layer 3 Witness** | 023, 024, **031** (Sigstore Rekor class entry) |
| **Trust Stack — Layer 4 Anchor** | 026 |
| **Trust Stack — Layer 5 Compliance** | 027 |
| **Trust Stack — Layer 6 Federation** | 028 |
| **Trust Stack — Classified accommodation** | 025 |

---

## How to add an ADR

1. Choose next number (NNN), zero-padded to 3 digits
2. Create `ADR-NNN-kebab-case-title.md` in this directory
3. Use the template structure: **Status / Context / Decision / Consequences / Alternatives Considered**
4. Update this INDEX.md with the new row (both tables)
5. If the new ADR supersedes a prior one, mark the prior one **Superseded** in the table and update its file's status header

## Template

```markdown
# ADR-NNN: Title

| Field | Value |
|-------|-------|
| Status | Proposed | Accepted | Superseded by ADR-NNN | Deprecated | Rejected |
| Date | YYYY-MM-DD |
| Decider | (who) |
| Touches | (paradigm | protocol | reference-arch | process) |

## Context

What forces are at play? What problem are we solving? What's the state of the world before this decision?

## Decision

What did we decide? State it crisply.

## Consequences

What follows from this decision — what becomes easier, what becomes harder, what becomes impossible, what becomes possible.

## Alternatives Considered

What other options were on the table, and why were they not chosen.
```
