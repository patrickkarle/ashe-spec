# ADR-011: TypeScript / OpenAPI naming convention for ASHE

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-24 |
| Decider | PK + Claude |
| Touches | protocol, reference-arch |

## Context

ASHE's identifiers (wire-format field names, error codes, scope tokens, file paths, type names, etc.) had been chosen ad-hoc during v0 development. The defaults landed on JavaScript ecosystem conventions (camelCase JSON fields, SCREAMING_SNAKE error codes, kebab-case file paths) because the implementation language is Node.js/TypeScript.

For ASHE to be a credible *universal* protocol, the naming convention needs to be deliberate — picked for reasons, not inherited by accident. Two candidate families were considered:

- **TypeScript / OpenAPI-flavored** (current de facto): camelCase JSON, SCREAMING_SNAKE errors, kebab-case paths. Matches modern REST API ecosystem (Stripe, GitHub, Twilio, OpenAI, Anthropic).
- **Protobuf / gRPC** (formal cross-language IDL): snake_case canonical wire, per-language generated client mapping. Industry standard for binary cross-language protocols.

The Protobuf path was considered seriously and rejected (see Alternatives). The TypeScript path was selected on grounds of zero-breaking-change against v0, alignment with the JSON API ecosystem ASHE deploys into, congruence with Continuum's existing NAMING-CONVENTION.md, and OpenAPI tooling maturity for codegen.

This ADR locks the convention. Subsequent specs, ADRs, requirements, and implementation MUST adhere.

## Decision

**ASHE adopts TypeScript / OpenAPI-flavored naming conventions across all surfaces.** The complete binding spec:

| Surface | Convention | Example |
|---|---|---|
| JSON object fields (wire) | camelCase | `requestId`, `idempotencyKey`, `correlationId`, `evaluatorResult` |
| Error codes | SCREAMING_SNAKE | `PERMISSION_DENIED`, `RATE_LIMITED`, `VALIDATION_ERROR`, `UNRESOLVED_DEFER` |
| Enum values | SCREAMING_SNAKE | `READ`, `WRITE`, `EXECUTE`, `ADMIN`, `UNKNOWN` |
| Scope tokens | dotted-kebab-case | `construct.composition.run`, `kernel.read`, `database.write` |
| Event topics | colon-namespaced kebab-case | `gate:decision`, `audit:emitted`, `session:revoked` |
| File paths (JS/TS implementation) | kebab-case | `ashe-manager-dm.js`, `evaluator-graph.schema.json` |
| Type/class names | PascalCase | `EvaluatorResult`, `GraphExecutor`, `PermissionEnforcer` |
| Function/method names | camelCase | `evaluate()`, `checkPermission()`, `loadEvaluatorRegistry()` |
| Variable names | camelCase | `currentSession`, `evaluatorRegistry` |
| Constants | SCREAMING_SNAKE | `MAX_AUDIT_QUEUE`, `DEFAULT_DEFER_THRESHOLD` |
| Boolean prefixes | is / has / can / should | `isInitialized`, `hasScope`, `canEscalate`, `shouldDefer` |
| Schema field names (JSON Schema) | camelCase | matches wire format |
| Service IDs (DM identifiers) | kebab-case (domain-only) | `ashe`, `database`, `monitoring` |

**Non-JS implementor mapping**: implementations in other languages (Rust, Python, Go, Java, etc.) MUST consume the canonical camelCase wire format but MAY map field names to their idiomatic conventions internally via standard serialization mechanisms (serde rename, Pydantic alias, Jackson naming strategy, etc.). The wire is canonical; impl identifiers are idiomatic to host language.

## Consequences

**What becomes easier**:

- No breaking changes to v0 — existing 207 tests, PROTOCOL-SPEC-v0.5, all v0 affordance descriptors, all v0 envelope shapes continue to work
- OpenAPI tooling support — codegen for 30+ client languages from camelCase OpenAPI spec is mature
- Idiomatic for JS/TS ecosystem agents — Anthropic SDK, OpenAI SDK, every modern REST client speaks camelCase JSON
- Congruent with Continuum's existing NAMING-CONVENTION.md — no within-codebase naming split
- Reviewing identifier choices in new code becomes mechanical (apply this table)

**What becomes harder**:

- Non-JS implementors must explicitly configure their JSON serializer to handle camelCase (small one-time setup, not ongoing friction)
- Cross-language adoption is slightly less "ergonomic-out-of-the-box" than gRPC/Protobuf — there's no automatic codegen, implementors write or generate their own clients from the OpenAPI spec
- Wire format identity is implicitly "JSON-API-flavored" — projects requiring rigid IDL discipline (e.g., regulated industries with strict schema enforcement contracts) may find this less compelling than Protobuf

**What becomes possible**:

- Direct adoption by any JSON-API client without translation layer
- OpenAPI 3.x specification of ASHE can be generated/curated; standard tooling consumes it
- Schema validation via ajv (JSON Schema draft-2020-12) stays as the validation mechanism (REQ-E-001 et al.)

**What becomes impossible** (intentionally):

- snake_case JSON fields on the wire — non-conformant per this ADR
- Inconsistent naming across docs/code/spec/wire — every surface has one canonical convention

## Alternatives Considered

**1. Protobuf / gRPC (snake_case canonical, language-mapped).** Rejected because:
- Breaking change for all of v0 — 207 tests, 9 subsystems, full spec all rewrite
- ADR-006 (TOON dual-projection) becomes architecturally questionable — TOON's value proposition assumes verbose JSON wire; Protobuf binary is already token-efficient, making TOON a debug-only feature
- gRPC transport assumes HTTP/2 over TCP; Continuum's named-pipe IPC requires either custom grpc-over-named-pipe transport (significant engineering) or transport migration to TCP-localhost (loses named-pipe security semantics)
- ASHE-internal DM-to-DM calls would gain HTTP/2 framing overhead vs. current in-process method calls
- Build complexity: protoc + plugins + generated code management adds toolchain dependency Continuum doesn't currently carry
- Rejection is conditional — Protobuf/gRPC remains the right choice IF future requirements demand it (regulated industries, strict cross-language contracts at scale, streaming RPCs). Revisitable via a future ADR if those requirements materialize.

**2. Rust-flavored (snake_case + strict typing throughout).** Rejected because:
- Same breaking-change scope as Protobuf without Protobuf's cross-language tooling benefit
- snake_case JSON is uncommon in the JSON API ecosystem (notable exception: Ruby/Rails APIs); creates friction for JS-ecosystem agents
- Rust's typing rigor is valuable in implementation but doesn't transfer to a JSON wire format
- Continuum's host language is JS/TS, not Rust; would create a within-codebase naming split

**3. Keep ad-hoc (no formal convention).** Rejected because:
- Implicit conventions decay; new contributors invent local conventions; entropy accumulates
- Cross-language implementors have no canonical reference to map from
- Review burden grows without a single source of truth

## Related decisions

- ADR-006 — TOON dual-projection (compatible with this ADR; TOON projects from canonical camelCase JSON)
- ADR-004 — Naming policy (working name "ASHE"; wire-level identifiers neutral). This ADR supplements ADR-004 by specifying the formal convention for those wire-level identifiers.
- REQUIREMENTS-v1.md — naming-disclaimer can be updated to reference this ADR as the locked convention
- Future revisit trigger: if cross-language adoption demands codegen-first IDL discipline at scale, revisit Protobuf/gRPC in a new ADR
