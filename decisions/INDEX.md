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
| **008** | [Validation graph with default-to-tiny-ONNX evaluators](ADR-008-validation-graph-tiny-onnx.md) | Accepted (forward trajectory); §1 engine-reuse aspect SUPERSEDED by ADR-010 | 2026-05-23 | Reference arch, protocol |
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
| **020** | [Weightlessness is conformant only under proper application](ADR-020-weightlessness-proper-application-conformance.md) | Accepted | 2026-05-30 | Protocol, reference arch, paradigm |

---

## ADRs by layer

| Layer | ADRs |
|-------|------|
| **Paradigm** (conceptual) | 001, 004, 006 |
| **Protocol** (wire spec) | 001, 002, 003, 004, 006, 008, 009 |
| **Reference architecture** (Continuum-specific) | 002, 005, 007, 008, 009 |
| **Process** (how we work) | 005 |

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
