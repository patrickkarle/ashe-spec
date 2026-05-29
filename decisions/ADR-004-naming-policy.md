# ADR-004: Naming Policy — "ASHE" Working Name + Neutral Wire Identifiers

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-22 |
| Decider | PK + Claude |
| Touches | Protocol, paradigm |

## Context

The protocol needs a name. "ASHE" — **A**ffordances, **S**tate, **H**ypermedia, **E**nvironment — is the name we've been using internally. The question is whether to:

- Commit to "ASHE" as the permanent public name (with all the rebranding pain if standardization adopters want a different name later)
- Rename now to something more descriptive (with bikeshedding risk and no clear winner)
- Defer naming to standardization time (working name during development; public name at v1.0)

Standards bodies (IETF, W3C) frequently rename protocols at finalization (SSL→TLS, SPDY→HTTP/2, ZeroMQ namespace shifts). Wire-level identifiers that are tied to the project name become migration debt at rename time.

## Decision

**Two-part policy:**

### 1. Working name discipline

"ASHE" is the working name through v0.x development. The acronym expansion (Affordances, State, Hypermedia, Environment) is meaningful and stays in working materials. The name is owned by this project for the duration of development.

### 2. Wire-level identifiers use neutral names from day 1

Anything that would require migration on rename uses neutral, descriptive identifiers:

| Identifier | Day-1 value | NOT |
|------------|-------------|-----|
| Wire `apiVersion` field | `agent-protocol.v0` | `ashe.v0` |
| MIME type | `application/agent-protocol+json` | `application/ashe+json` |
| URN namespace | `urn:agent-protocol:*` | `urn:ashe:*` |
| Recommended npm/pypi package | `agent-protocol-sdk` | `ashe-sdk` |
| Doc filenames (in this dir) | Functional names (`PARADIGM-v0.md`, `PROTOCOL-SPEC-v0.5.md`) | (mixed with "ASHE-*" tag where the dir name disambiguates) |
| Continuum service ID (internal) | `ashe` (with planned alias mechanism) | (internal-only, low blast radius) |

### 3. Standardization-time rename

At protocol v1.0 — when the spec is implementation-tested and ready for adopter community input — the public name is decided with adopters at the table. Continuum-internal codename remains "ASHE" regardless of public name; external artifacts shift to the chosen public name.

## Consequences

**Positive:**

- No naming bikeshedding now blocks design work
- Public-facing artifacts read as "ASHE (working name) — the Agent Protocol" — signals intent without committing
- At v1.0 we have leverage to pick the right standardization name with input from adopters
- Continuum-internal codename stays "ASHE" forever, even if public name changes — preserves continuity for the project team
- Wire-level identifiers don't need renaming when the public name changes — zero migration debt

**Negative:**

- Slight bikeshedding deferred to v1.0 (but it's a smaller decision then because the protocol is concrete and adopters can weigh in)
- Slight operational awkwardness in early outreach if early adopters know it as ASHE then have to relabel
- Internal Continuum service ID `ashe` would need an alias mechanism if public name changes — minor work

**Forecloses:**

- Nothing meaningful

## Alternatives Considered

**Keep ASHE permanently.** Considered. The acronym is meaningful, the name is short and memorable. But "ASHE" has real-world collisions (League of Legends character, multiple band names, common surname) and standardization bodies often rename. Wire-level commitment to "ashe" creates migration debt for downstream consumers if rename happens.

**Rename now.** Considered candidates: OAP (Open Agent Protocol), ABP (Agent Boundary Protocol), AHP (Agent Handover Protocol), CAP (Capability Agent Protocol). None is obviously better than ASHE. Premature commitment without adopter input.

**ASHE name + ASHE wire identifiers (no separation).** Rejected — couples the name to the wire, creating migration debt if rename happens. The discipline of neutral wire identifiers is cheap to do now and expensive to retrofit later.

## References

- `PARADIGM-v0.md` §9 (Naming Policy)
- `PROTOCOL-SPEC-v0.5.md` front matter (Naming policy field)
- Prior art: SSL→TLS, SPDY→HTTP/2, ZeroMQ→AMQP namespace shifts
