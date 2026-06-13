# ADR-018: `.well-known/ashe` website interaction-point convention (web-side surface)

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-27 |
| Decider | PK + Claude |
| Touches | protocol (primary — defines the web-side surface convention); reference-arch (handshake handling, surface-spec delivery, intent-adapted projection) |
| Cited by | VISION.md §1 (tri-surface ecosystem-acknowledgment) + §4 (agentic-web subsection); MANIFESTO.md (`.well-known/ashe` dual-surface adoption); CASE-FOR-NOW.md §7 (predecessor-lineage table — discovery-endpoint row) |
| Builds on | ADR-006 (TOON dual-projection — token-reductive surface delivery); ADR-012 (wire format projections); ADR-013 (multi-service architecture — SessionService / BlueprintService back dynamic handshake); ADR-017 (sealed-workspace foundational dev pattern — dev-side peer convention) |
| Composes with | RFC 5785 (`.well-known/` URI suffix registry); HATEOAS heritage (discovery + state-transfer + self-description); MCP (tool-catalog ingestion source); auth.md (identity-layer beneath) |

## Context

ASHE's vision commits to capability mediation as a cross-vendor protocol. Three structural surfaces realize that protocol in deployed practice:

| Surface | What it does | Foundational ADR |
|---------|--------------|------------------|
| **Agent-side** | SDK + runtime hook + OS-level mediation + hardware-rooted enforcement that brokers capability use by the agent process | ADR-014 (four-layer phased enforcement) |
| **Dev-side** | Sealed-workspace pattern as foundational dev-lifecycle convention; `ashe workspace init` as step 1 of any project (analogous to `git init`) | ADR-017 (sealed-workspace foundational dev pattern) |
| **Web-side** | Website-hosted endpoint convention that arriving agents discover at interaction time; delivers capability surface, handshake target, and intent-optimized representations | **THIS ADR** |

The agent-side and dev-side conventions have been articulated as binding architectural commitments. The web-side surface — *how does a website declare ASHE availability and deliver its capability surface to arriving agents?* — has been implicit in HATEOAS heritage (warehouse blueprints) and referenced in MANIFESTO.md (`.well-known/ashe` dual-surface adoption), but has not been formalized as a peer-class structural commitment with naming convention, handshake protocol, and intent-adapted surface delivery.

Without this formalization:

- Website operators have no concrete deliverable shape to opt in to ASHE
- Agents have no canonical discovery path; out-of-band knowledge required for every site
- The wire-economy commitment from [ADR-012](ADR-012-wire-format-grpc-protobuf-with-projections.md) cannot extend to the web-side surface
- The tri-surface scope of ASHE remains structurally unstated

### Prior art in the discovery-endpoint lineage

The pattern of *server-hosted, machine-readable, opt-in discovery endpoints* has a deep history:

| Convention | Year | Purpose | Why it propagated |
|------------|------|---------|-------------------|
| `robots.txt` | 1994 | Crawler directives | Small, server-controlled, machine-readable, opt-in convention |
| `sitemap.xml` | 2005 | URL discovery for crawlers | Standardized format; reduced crawler load via structured discovery |
| `.well-known/` URI suffix (RFC 5785) | 2010 | Registered location for site-wide metadata | Single registry; multiple specialized endpoints (`/openid-configuration`, `/security.txt`, `/host-meta`, `/acme-challenge`, etc.) |
| `.well-known/openid-configuration` | 2014 | OpenID provider discovery | Eliminated out-of-band config for OIDC clients; one-fetch discovery |
| `.well-known/security.txt` (RFC 9116) | 2022 | Security contact disclosure | Trivial to add; immediately useful; propagated via utility |

`.well-known/ashe` fits this lineage exactly: a small, server-controlled, machine-readable, opt-in convention that lets agents discover server-side ASHE availability without out-of-band knowledge. ASHE inherits the lineage's adoption-by-utility pattern.

### What no predecessor adapts: surface representation by declared intent

`.well-known/openid-configuration` returns the same JSON regardless of caller. `robots.txt` returns the same directives regardless of crawler. None of the predecessor `.well-known/` endpoints optimize their representation for the *type of consumer*.

ASHE introduces this. The same `.well-known/ashe` endpoint delivers different representations depending on what the arriving agent declares about its intent:

- **User-directed intent** (agent is fielding a real-time human request): rich, exploration-friendly capability description; full affordance descriptors; human-readable error metadata; canonical JSON projection
- **Task-directed intent** (agent is in autonomous task execution): minimal, structured-protocol surface optimized for direct action; TOON projection by default per [ADR-006](ADR-006-toon-dual-projection.md); affordance descriptors stripped to operational minimum
- **Autonomous-cascade intent** (agent spawning sub-agents through capability attenuation): explicit capability-attenuation surface; cascade-policy disclosure; structured child-agent capability templates

The wire-economy commitment from [ADR-012](ADR-012-wire-format-grpc-protobuf-with-projections.md) thereby extends end-to-end: the website's web-side surface itself optimizes for token reduction when the calling intent permits it. This is the novel contribution `.well-known/ashe` makes to the discovery-endpoint lineage.

## Decision

**ASHE adopts `.well-known/ashe` as the web-side discovery endpoint convention, with handshake protocol delivering an intent-adapted capability surface at interaction time.** The convention has four binding commitments.

### Commitment 1: `.well-known/ashe` is the canonical discovery path

Websites that opt in to ASHE host their capability-broker entry point at `https://example.com/.well-known/ashe/` (per RFC 5785). The path is:

- **Canonical**: agents always look here first; out-of-band knowledge not required
- **Composable**: coexists with all other `.well-known/` endpoints (no conflict)
- **Opt-in**: absence of the endpoint means the site does not participate in ASHE; agents fall back to HTML or vendor-specific surfaces
- **Discovery-stable**: the path is normative for v1+; changes require an ADR superseding this one

Shorthand `.ashe` may be used in informal documentation but the wire-canonical path is always `.well-known/ashe/`.

### Commitment 2: Handshake delivers architecture spec at interaction time

The arriving agent issues an ASHE handshake against `.well-known/ashe`. The handshake response delivers (at minimum) the following structured fields:

| Field | Purpose |
|-------|---------|
| `ashe.version` | Protocol version advertised by this site |
| `ashe.profile` | Conformance tier (ASHE-Lite / ASHE-Standard / ASHE-Full per VISION §8) |
| `ashe.services` | Service surface exposed (per [ADR-013](ADR-013-multi-service-architecture.md): Session / Blueprint / Operator / Build / Audit) |
| `ashe.blueprint-url` | Where to fetch the 15-layer blueprint root manifest |
| `ashe.auth-methods` | Supported identity primitives (OIDC, auth.md, etc.) |
| `ashe.affordances-url` | Where to fetch the capability/affordance catalog for this site |
| `ashe.session-url` | Where to issue session handshake (HELLO equivalent) |
| `ashe.intent-surfaces` | Declares which intent-adapted surfaces this site supports (Commitment 3) |

The agent learns the site's capability surface dynamically. **No out-of-band API documentation is required to begin interacting**; the handshake response is self-describing per HATEOAS heritage. Subsequent navigation through `ashe.blueprint-url` → `ashe.affordances-url` → `ashe.session-url` follows discovery-driven state-transfer.

### Commitment 3: Surface representation adapts to declared intent

The agent declares its intent in the handshake request via a structured `ashe-intent` header (or equivalent payload field for non-HTTP transports). The site MAY return surface representations adapted to the declared intent:

| Declared intent | Default surface optimization |
|-----------------|------------------------------|
| `user-directed` | Rich JSON; full affordance descriptors; exploration metadata; human-readable error messages |
| `task-directed` | TOON projection; minimal affordance descriptors; operational structured-error codes only; ETag stability emphasized for caching |
| `autonomous-cascade` | Cascade-policy surface; explicit attenuation matrix; child-agent capability templates; ancestry metadata |
| (unspecified) | Default to canonical JSON with full descriptors (conservative, exploration-safe) |

Surface adaptation is an **OPTIMIZATION not a REQUIREMENT**. A minimal `.well-known/ashe` implementation may return the same representation regardless of intent and remain conformant-but-suboptimal. Sites with significant agent traffic will adopt intent-adapted surfaces to reduce wire cost. The wire-economy commitment from [ADR-012](ADR-012-wire-format-grpc-protobuf-with-projections.md) extends to the web-side surface through this mechanism.

A site MUST advertise its intent-surface support via the `ashe.intent-surfaces` field in the handshake response. Agents that declare an intent unsupported by the site receive the site's default surface representation (typically the canonical JSON projection).

### Commitment 4: Composition with existing web infrastructure is structural

`.well-known/ashe` does NOT require:

- New HTTP server
- New domain
- New TLS certificate
- Migration off HTML

It is a static-or-dynamic endpoint at a well-known path. Implementations span three conformance tiers per VISION §8:

| Tier | `.well-known/ashe` implementation shape |
|------|-----------------------------------------|
| **ASHE-Lite** | Static `.well-known/ashe/index.json` (no backend required); handshake response is the static file; intent adaptation may be absent |
| **ASHE-Standard** | Dynamic endpoint backed by SessionService + BlueprintService per [ADR-013](ADR-013-multi-service-architecture.md); intent adaptation supported for at least `user-directed` and `task-directed` |
| **ASHE-Full** | Full multi-service surface (Session / Blueprint / Operator / Build / Audit) + tier-2 evaluator pipeline; all three intent surfaces supported; sandbox infrastructure available for BuildService |

A site adds `.well-known/ashe` *alongside* its existing HTML pages; HTML remains the human-browser surface; `.well-known/ashe` becomes the agent surface. Both coexist via ALPN multiplexing on port 443 or simple path-based routing.

## Trust assumptions

| Layer of trust | Assumption | Where it's enforced |
|----------------|------------|----------------------|
| Site-honest handshake response | The site delivers the architecture spec it claims | Agent verifies against published blueprint via discovery chain; spec mismatch triggers conformance failure per ADR-015 |
| Intent declaration honesty | The agent's declared intent matches its actual behavior | At Layer 1 (cooperating SDK per [ADR-014](ADR-014-phased-enforcement-model.md)), declared intent is trusted; Layer 2+ enforcement verifies intent against actual operations |
| TLS authenticates origin | Standard web PKI | `.well-known/ashe` inherits the site's TLS context; no novel cryptographic requirements |
| Surface-representation integrity | Standard web response-integrity assumptions | No novel cryptographic requirements at this layer; ETag stability per ADR-013 §58 supports cache integrity |

## Composition story across the ecosystem

| Layer | Provided by | What it does |
|-------|-------------|--------------|
| **Identity** (caller authentication) | OIDC / auth.md / WorkOS / Auth0 / etc. | Establishes agent identity |
| **Tool catalog** (what operations exist) | MCP / vendor catalogs | Describes available tools; ASHE consumes as capability-catalog source |
| **Capability descriptor format** | ASHE | The grammar for capability grants (per [ADR-003](ADR-003-invariant-language.md)) |
| **Capability broker** | ASHE | Issues, attenuates, audits, revokes capability grants |
| **Web-side discovery** | **THIS ADR** (`.well-known/ashe`) | How agents find a site's ASHE surface |
| **Wire format** | ASHE (per [ADR-012](ADR-012-wire-format-grpc-protobuf-with-projections.md)) | Protobuf canonical + JSON + TOON projections |
| **Isolation substrate** | Containers / sandboxes / microVMs | Enforces process / FS / network isolation |
| **Identity-grant binding** | OAuth 2.1 + ASHE token model | Binds capabilities to authenticated identities |

`.well-known/ashe` is specifically the *discovery + handshake* layer that lets these compose with zero out-of-band knowledge at the web-side surface. It is the agent's structural entry point to ASHE on any opted-in site.

## Consequences

**What becomes easier**:

- **Website operators have a concrete deliverable shape**: "add a `.well-known/ashe` endpoint" is operational guidance, not abstract protocol
- **Agents can discover capabilities without out-of-band knowledge**: cross-vendor agent code stops requiring per-site API documentation
- **Wire-economy commitments extend end-to-end**: the website surface itself becomes token-reductive when calling intent permits
- **Tiered adoption is concrete**: ASHE-Lite = static `.well-known/ashe/index.json`; ASHE-Standard = dynamic handshake-aware endpoint; ASHE-Full = full service surface backed
- **HATEOAS heritage realized in protocol form**: discovery + state-transfer + self-description, formalized as a cross-vendor convention

**What becomes harder**:

- **Sites with strong reverse-proxy or CDN setups need `.well-known/ashe` routing configured**: typically trivial but explicit
- **Intent-adapted surfaces require server-side surface-generation logic**: sites doing intent-adaptation maintain at least two response shapes (user-directed canonical JSON; task-directed TOON)
- **Surface-spec versioning becomes a real concern**: `ashe.version` declaration in handshake response must be honored; protocol evolution requires version-handshake negotiation
- **Adoption discipline at the web-side**: sites that publish stale or misleading `.well-known/ashe` responses degrade the entire ASHE ecosystem; conformance verification matters

**What becomes possible**:

- **Token-reductive end-to-end agent web traffic**: the wire-economy targets from VISION §3 become achievable not only on the agent side but on the website side
- **Cross-vendor agent code that "just works" against any ASHE-compliant site**: the agent's `.well-known/ashe` discovery code is the same regardless of which ASHE-compliant site is being accessed
- **Surface-optimization-by-intent as a propagating pattern**: other `.well-known/` endpoints may eventually adopt intent-adapted representations following ASHE's precedent
- **Honest tiered conformance at the website level**: ASHE-Lite sites can opt in with a static endpoint; demonstrates adoption viability before larger investment

**What becomes impossible** (intentionally):

- Out-of-band site-specific agent API contracts as the dominant interaction model (discovery becomes structural; site-specific APIs are no longer the agent's responsibility to maintain via vendor documentation)
- Vendor-locked agent code that only works against one site's surface (handshake response normalizes the surface contract)

## Alternatives Considered

**1. Use a custom domain (`ashe.example.com`).** Rejected because:
- Requires DNS configuration, separate TLS certificates, separate hosting decisions
- Breaks the "small server-controlled opt-in" pattern that makes `.well-known/` adoption simple
- Inconsistent with the discovery-endpoint lineage (no other `.well-known/`-style protocol uses a separate domain)

**2. Use a different path (e.g., `/agent-api/` or `/ashe-discovery`).** Rejected because:
- `.well-known/` is the registered URI suffix (RFC 5785) precisely for this kind of metadata; using a non-`.well-known/` path means re-inventing convention without benefit
- Coexistence with other `.well-known/` endpoints (`/openid-configuration`, `/security.txt`, etc.) is structurally clean
- Reserved path conflicts (e.g., `/agent-api/` could collide with an existing site path) are eliminated by `.well-known/` convention

**3. Require dynamic handshake (no static `.well-known/ashe/index.json` allowed).** Rejected because:
- Excludes the lowest-investment adoption tier (ASHE-Lite static endpoint), which is the highest-volume potential adoption surface
- Static `.well-known/ashe/index.json` is sufficient for many use cases (capability surface that rarely changes)
- The protocol can be implemented at any tier; forcing dynamic excludes valuable adopters

**4. Mandate intent-adapted surface representation (no static alternative).** Rejected because:
- Surface adaptation is an optimization, not a correctness requirement
- Mandating it raises the implementation cost above what some adopters will invest
- Freedom from per-action prompts is a high-order adoption value (per [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) Commitment 2 analogue)

**5. Make `.well-known/ashe` deliver only the handshake URL (no capability surface in the response).** Partially accepted:
- For minimal implementations, `.well-known/ashe/index.json` MAY return only `{ashe.version, ashe.session-url, ashe.blueprint-url}` — three pointers — and let subsequent handshake against the session-url deliver the full surface
- For higher tiers, the full handshake response shape from Commitment 2 may be returned inline
- Both patterns are conformant; specific deployments choose their own bandwidth-vs-roundtrip tradeoffs

**6. Use a header-based discovery (e.g., `Link: <...>; rel="ashe"`).** Rejected as primary mechanism:
- Header-based discovery requires fetching some page first; not a *canonical* discovery path
- `.well-known/` is fetch-by-convention with no precursor; header discovery requires a primary-page fetch
- Header-based augmentation MAY be added in future ADRs as a secondary mechanism (e.g., per-page capability hints); the canonical discovery remains `.well-known/ashe`

## Related decisions

- [ADR-006](ADR-006-toon-dual-projection.md) — TOON dual-projection (the token-reductive surface delivery mechanism)
- [ADR-012](ADR-012-wire-format-grpc-protobuf-with-projections.md) — Wire format with projections (the canonical + projection model that surface adaptation uses)
- [ADR-013](ADR-013-multi-service-architecture.md) — Multi-service architecture (SessionService / BlueprintService / etc. that back dynamic `.well-known/ashe` implementations)
- [ADR-014](ADR-014-phased-enforcement-model.md) — Phased enforcement model (the trust-assumption layers per which intent declaration is honored or enforced)
- [ADR-015](ADR-015-validation-methodology-and-tiered-claims.md) — Validation methodology and tiered claims (`.well-known/ashe` conformance is part of the v1 benchmark suite)
- [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md) — Sealed-workspace foundational dev pattern (peer convention at the dev-side surface; `.well-known/ashe` is its web-side counterpart)

## Implementation notes

**For Continuum's reference implementation**:

- v1 ships static `.well-known/ashe/index.json` template + dynamic handshake-aware endpoint built on SessionService / BlueprintService
- Surface adaptation by intent ships in v1 for the two most-common intents (`user-directed` / `task-directed`)
- Reference site (e.g., `https://reference.continuum.dev/.well-known/ashe/`) demonstrates the convention working
- Conformance probe: any ASHE-compliant agent should successfully discover, handshake, and interact against the reference site without per-site configuration

**For other implementations**:

- Express / Fastify / Flask / Django / Rails / Spring middleware adapters add `.well-known/ashe` handling as a single declaration
- Static-site generators (Hugo, Eleventy, Jekyll, etc.) add `.well-known/ashe/index.json` template support
- Cloudflare Workers + Cloudflare Agents SDK natively serve `.well-known/ashe` from edge with surface-adaptation logic at the edge

**Conformance suite for `.well-known/ashe`** (per [ADR-015](ADR-015-validation-methodology-and-tiered-claims.md)):

- **Discovery**: `.well-known/ashe/index.json` is fetchable from a compliant site
- **Handshake**: a valid handshake request returns a structured response per Commitment 2
- **Intent adaptation**: a task-directed handshake returns a smaller wire representation than user-directed (when site claims ASHE-Standard or ASHE-Full tier)
- **Composition**: the handshake response is consumable by ASHE-aware agents without per-site code
- **Version negotiation**: handshake response includes `ashe.version`; agents handle version mismatch gracefully

**Tri-surface coherence check**:

A complete ASHE deployment exercises all three surfaces:

1. **Dev-side** ([ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md)): `ashe workspace init` produces a sealed development environment
2. **Agent-side** ([ADR-014](ADR-014-phased-enforcement-model.md)): the agent process within (or interacting with) that workspace is mediated through one of the four enforcement layers
3. **Web-side** (THIS ADR): when the agent reaches out to an ASHE-compliant website, it discovers via `.well-known/ashe`, handshakes, and operates within the discovered capability surface

The three surfaces together realize ASHE's tri-surface architecture. Each is independently adoptable; together they deliver the full capability-broker protocol.

---

**ADR-018 commits ASHE to `.well-known/ashe` as the web-side discovery endpoint convention, peer to [ADR-017](ADR-017-sealed-workspace-foundational-dev-pattern.md)'s dev-side sealed-workspace convention and [ADR-014](ADR-014-phased-enforcement-model.md)'s agent-side enforcement progression. Together the three ADRs establish ASHE's tri-surface structural shape: agent-side capability broker, dev-side sealed workspace, web-side `.well-known/ashe` interaction point. The web-side surface inherits the `.well-known/` discovery-endpoint lineage (RFC 5785; OpenID provider discovery; security.txt) and extends it with the novel surface-representation-by-declared-intent commitment that delivers wire-economy end-to-end.**
