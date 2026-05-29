# ADR-012: Wire format — gRPC/Protobuf canonical + JSON and TOON projections

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-25 |
| Decider | PK + Claude |
| Touches | protocol (primary), reference-arch (secondary) |
| Supersedes | None directly; amends ADR-011 to clarify Protobuf-JSON-mapping compatibility |
| Cited by | All forthcoming Tier 1 + Tier 4 artifacts |

## Context

ASHE's wire format identity has evolved through multiple iterations during the May 2026 conversation arc, with three distinct positions surfacing:

1. **TypeScript/OpenAPI-flavored JSON** (ADR-011) — chosen for compatibility with v0 implementation and broad JSON-API ecosystem
2. **Protobuf/gRPC consideration** — surfaced during cross-language discussion; initially rejected for v0 implementation but acknowledged as architecturally appropriate for cross-language adoption
3. **Multi-projection approach** — recognition that binary (Protobuf), text (JSON), and agent-context (TOON) projections serve distinct purposes and need not be exclusive

Three forces converged to drive this ADR:

**Force 1: Wire economics at agentic-web scale.** Empirical research (arXiv 2511.23281) demonstrates structured alternatives achieve 2-5x token efficiency and 5x runtime efficiency vs HTML on identical agent tasks. ASHE's design optimizations beyond JSON-flavored alternatives — binary serialization, HTTP/3 transport, persistent connections, intent-declared transactions — target a substantially higher reduction (20-50x compound estimated; subject to benchmark validation). The wire format choice is what enables or forecloses the upper bounds of this efficiency.

**Force 2: Cross-language adoption requires IDL discipline.** Protobuf is the only mature IDL with codegen for 30+ languages. JSON-with-conventions requires every implementor to hand-map; .proto-with-codegen produces idiomatic clients automatically. For ASHE to be a universal protocol (not a JS-ecosystem protocol with "other languages welcome"), the IDL discipline is required.

**Force 3: Multiple projection contexts have different optimization criteria.**
- Wire transit: binary efficiency dominates → Protobuf binary wins
- Debug / human-readable output: text legibility dominates → JSON projection wins
- LLM context windows: token efficiency dominates → TOON projection wins
- Streaming long operations: protocol-native streaming dominates → gRPC server-streaming wins

A single wire format cannot optimize for all four. A canonical IDL with multiple projections can.

## Decision

**ASHE's canonical wire format is Protobuf 3 binary serialization over gRPC over HTTP/3 (QUIC).** The protocol exposes auxiliary projections for use cases where binary is not appropriate:

| Layer | Choice | Use case |
|-------|--------|----------|
| **Canonical IDL** | Protobuf 3 `.proto` files | Single source of truth for all operations, messages, errors, capabilities; codegen target for cross-language clients |
| **Primary wire format** | gRPC binary over HTTP/3 (QUIC); gRPC over HTTP/2 fallback for environments without HTTP/3 support | Default for all production agent-server interaction; lowest bandwidth, lowest latency, native streaming support |
| **Auxiliary projection — JSON** | Protobuf JSON Mapping (canonical Google spec) producing lowerCamelCase fields | Debug output; REST gateway projection (via grpc-gateway-style auto-generation); human-readable interaction; consumers without Protobuf tooling |
| **Auxiliary projection — TOON** | TOON projection from canonical JSON form (per existing `lib/toon-projector.js`) | LLM agent context windows where token efficiency matters; archival storage; human-readable text optimized for agent consumption |
| **Discovery** | `/.well-known/ashe` returning service catalog as JSON | Bootstrap; well-known URI per RFC 8615 pattern; agents discover ASHE availability without prior knowledge |

**Naming convention compatibility (amends ADR-011)**: ADR-011 specified TypeScript/OpenAPI-flavored naming for JSON wire fields (camelCase). This remains correct *for the JSON projection*. Canonical Protobuf .proto files use snake_case per Protobuf convention; the Protobuf JSON Mapping spec produces lowerCamelCase from snake_case proto fields by default, which IS the ADR-011 convention. Both ADRs are simultaneously correct; the apparent tension dissolves because they apply to different surfaces.

**Tiered claim discipline (supports ADR-015)**: ASHE's wire economics claims are tiered by evidence grade:
- **Floor** (empirically validated by arXiv 2511.23281): 2-5x token efficiency over HTML
- **Target** (design-grounded with specific optimization mechanisms): 10-30x improvement; subject to benchmark validation
- **Stretch** (deployment-pattern-dependent): 50-100x; requires favorable patterns (long sessions, streaming, cascade-agent configuration)

ASHE v1 commits to publishing controlled-study results matching the arXiv 2511.23281 methodology against the ASHE reference implementation within 12 months of reference implementation availability (formalized in ADR-015 — forthcoming).

## Consequences

**What becomes easier**:

- Cross-language adoption — implementors in Rust, C++, Java, Kotlin, Python, Go, Swift, etc., get codegen-produced typed clients from the canonical .proto files; no hand-mapping required
- Wire efficiency at scale — binary serialization, persistent multiplexed connections, native streaming all enable the projected 20-50x efficiency improvements
- Coexistence with existing HTTP infrastructure — gRPC over HTTP/3 uses standard ports (443) via ALPN negotiation; CDNs, load balancers, NAT traversal all work
- TOON value preserved (per ADR-006) — TOON remains the agent-context text projection where token efficiency matters; not displaced by binary wire
- JSON ecosystem compatibility maintained — every operation has a JSON projection; sites can use ASHE without Protobuf tooling if they accept the wire-efficiency cost
- Conformance verification — gRPC reflection, grpc_cli, ghz, evans all provide mature tooling for protocol-level testing

**What becomes harder**:

- Build pipeline complexity — `protoc` + plugins + generated code management add toolchain dependency Continuum doesn't currently carry (manageable; one-time setup)
- Two-naming-convention discipline — .proto uses snake_case, JSON projection uses camelCase, application code uses its host language convention. Documentation must make this clear
- Implementors must understand the wire/IDL/projection separation — protocol education burden, partially offset by codegen reducing the need to understand wire format directly

**What becomes possible**:

- ASHE as universal protocol layer — codegen for 30+ languages produces typed clients automatically; the "100x cheaper than HTML scraping" pitch becomes real
- Intelligence cascade pattern (per ADR-013, forthcoming) — structured protocol with high reliability enables economic substitution of cheaper models for execution while frontier models handle reasoning
- Streaming-first agent interactions — long-running evaluations stream progress; not poll-based
- Capability tokens as cryptographically-signed Protobuf messages — first-class protocol objects, unforgeable, bounded-lifetime, composable
- Multi-projection format selector (per existing PROTOCOL-SPEC §47) extends to include binary alongside json/toon/both

**What becomes impossible** (intentionally):

- Snake_case JSON fields on the JSON projection (camelCase per Protobuf JSON Mapping default + ADR-011)
- Pure-binary-only operation without text fallback (every operation MUST have JSON projection available for debug/human-readable cases)
- Hidden non-determinism in serialization — Protobuf binary is deterministic; JSON projection is deterministic; TOON projection is deterministic per ADR-006

## Alternatives Considered

**1. Continue with JSON-over-HTTP as canonical (ADR-011 as-is, no Protobuf).** Rejected because:
- Forecloses the 10-30x wire efficiency target (achievable only with binary + persistent connections + streaming)
- Cross-language adoption requires hand-mapping per language; codegen is much weaker for JSON Schema than for Protobuf
- Streaming, multiplexing, header compression all weaker than gRPC equivalents
- Honest assessment: JSON-over-HTTP was the right choice for ASHE v0 prototype work; it is not the right choice for the agentic-web-scale endgame

**2. Pure Protobuf binary only (no JSON projection).** Rejected because:
- Debugging becomes substantially harder; protocol designers and operators benefit from human-readable form
- Sites without Protobuf tooling cannot adopt; raises the entry barrier disproportionately
- REST gateway projection (grpc-gateway-style) provides JSON access cheaply; no reason to forbid it
- Loses the "any HTTP client can interact in fallback mode" property

**3. Cap'n Proto or FlatBuffers instead of Protobuf.** Rejected because:
- Smaller community, less codegen language coverage
- Marginal binary-efficiency wins over Protobuf are not large enough to justify ecosystem cost
- Protobuf is the de-facto standard; choosing an alternative imposes integration burden on every implementor

**4. JSON-RPC instead of gRPC.** Rejected because:
- No streaming support comparable to gRPC's server/client/bidirectional streaming
- No structured service definitions; methods are stringly-typed
- Weaker codegen story across languages
- Worse for the intelligence-cascade pattern (less reliable for small-model execution)

**5. Custom binary protocol designed specifically for ASHE.** Rejected because:
- Inventing transport-level infrastructure is a massive investment with no comparative advantage
- HTTP/3 + gRPC infrastructure is mature, deployed at scale, has middleware support, NAT-traversal, security audit
- The protocol's value is in capability semantics; transport efficiency is a solved problem to be leveraged, not reinvented

**6. WebSocket + JSON for streaming, REST + JSON for unary.** Rejected because:
- Two-protocol design is more complex than gRPC's unified streaming + unary model
- Worse efficiency than gRPC + Protobuf
- Lacks the structured service definitions Protobuf provides
- Reasonable as a fallback in environments without gRPC support, but not as primary

## Related decisions

- ADR-006 — TOON dual-projection (compatible; TOON is the agent-context text projection, not the canonical wire)
- ADR-007 — Interception-chain pattern at IPC seam (compatible; ASHE remains the interceptor regardless of wire format)
- ADR-008 — Validation graph with default-to-tiny-ONNX evaluators (compatible; evaluator-graph composition is wire-format-independent)
- ADR-009 — Deployment profiles (compatible; profiles describe which evaluator tiers ship; wire format is uniform across all profiles)
- ADR-010 — Standalone graph engine for ASHE (compatible; engine ownership is internal to ASHE; wire format is external)
- ADR-011 — TypeScript/OpenAPI naming convention (compatible; ADR-011 specifies JSON-projection naming; this ADR specifies canonical IDL; both true simultaneously)
- ADR-013 — Multi-service architecture (forthcoming; .proto file defines multiple services that share this wire format)
- ADR-014 — "ASHE as door" enforcement model (forthcoming; enforcement layers are wire-format-independent at the protocol level)
- ADR-015 — Validation methodology and tiered claim discipline (forthcoming; commits to benchmark publication validating the wire efficiency claims)

## Implementation notes

For Continuum's reference implementation:

- Add `@grpc/grpc-js` dependency (mature, pure-JavaScript gRPC, no native bindings, Apache 2.0)
- Add `protoc` + `ts-proto` or equivalent for TypeScript code generation from .proto
- Add HTTP/3 transport support (Node.js has experimental support; production via `@fails-components/webtransport` or transport proxy initially)
- .proto files live at `infrastructure/protocols/ashe/schemas/*.proto`
- JSON Schema projections auto-generated from .proto for legacy consumers
- TOON projection continues via existing `lib/toon-projector.js` (no change needed)

For implementations in other languages, codegen produces idiomatic clients from the same .proto files.

The wire format choice is now locked; the schemas + service definitions are the next layer to specify (ADR-013 and subsequent technical-spec artifacts).
