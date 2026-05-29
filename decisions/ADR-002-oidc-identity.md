# ADR-002: Identity — OIDC with DID-Compatible Claim Shapes

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-22 |
| Decider | PK + Claude |
| Touches | Protocol, reference architecture |

## Context

Agents need stable, verifiable identities to interact with ASHE-enabled systems. Identity drives the trust tier, which drives the permission grant, which drives what the agent can see and do. The protocol must specify an identity profile that is:

- Implementable cheaply (so adoption isn't blocked by identity complexity)
- Strong enough to be useful (so trust tiers mean something)
- Compatible with existing identity ecosystems (so adopters can use what they have)
- Future-flexible (so emerging standards like W3C DIDs aren't foreclosed)

## Decision

**OpenID Connect (OIDC) tokens with DID-compatible claim shapes.**

### Required claims

| Claim | Meaning |
|-------|---------|
| `sub` | Agent stable identifier |
| `iss` | Token issuer (URL) |
| `aud` | Must include `"agent-protocol"` |
| `exp` | Expiry (Unix timestamp) |
| `iat` | Issued-at (Unix timestamp) |

### Recommended claims

| Claim | Meaning |
|-------|---------|
| `agent_runtime` | `"claude-code"` \| `"codex"` \| `"custom"` \| other |
| `agent_version` | Semver string |
| `agent_capabilities` | Array of capability identifiers |

### Optional claims (forward-compat)

| Claim | Meaning |
|-------|---------|
| `did` | W3C DID URI (when agent has one) |
| `agent_passport_ref` | URI to extended descriptor |
| `nonce` | Replay-prevention nonce |

### Validation discipline

- Signature verification against issuer JWKS (mandatory)
- Audience check (`agent-protocol` MUST be in `aud`)
- Expiry with clock-skew tolerance (default 60 seconds)
- Issuer trust list configuration per implementation

### Token binding (where substrate supports it)

DPoP for HTTP, mTLS-thumbprint for TLS — bind the token to the channel to prevent token theft from converting to impersonation. Implementations MAY require token binding above a configured trust tier.

## Consequences

**Positive:**

- Implementation cost low — every language has JWT libraries (jose, pyjwt, jsonwebtoken, etc.)
- **Continuum's existing OAuth broker work (Sessions 35-51) flows directly in** — no rewrite. `dispatch.getAuthorization` already produces OIDC-shaped tokens.
- Anthropic's Claude Code OAuth naturally produces ASHE-acceptable identity (Anthropic = issuer; Claude Code = subject)
- DID forward-compat is explicit — agents that have DIDs include them as claims; agents that don't, use plain OIDC; both work in the same protocol
- Federation via standard OAuth multi-tenant patterns (enterprise = Okta, research = self-issued, etc.)

**Negative:**

- Bearer-token model means token theft = impersonation. Mitigated by short TTL (recommend 1-4 hours) + token binding where substrate supports it. Production deployments without token binding accept the risk.
- Identity assurance is "as good as the issuer." Trust-list configuration discipline is the operational countermeasure (see PROTOCOL-SPEC §18).
- JWT spec complexity (signature algs, audience validation, clock skew) consumes non-trivial spec real estate.

**Forecloses:**

- Pure self-sovereign identity (DID-only, no IdP) becomes a "+DID tier" extension later, not the default
- Cryptographic capability tokens (macaroons-style) would need a separate extension

## Alternatives Considered

**W3C DID as primary.** Rejected — implementation cost high (every adopter needs DID resolver + crypto stack); many DID methods are blockchain-coupled (cost/latency/lock-in); tooling immature in mainstream JS/Python ecosystems; would block adoption.

**Bespoke "Agent Passport" format.** Rejected — virtually every protocol that has tried to invent identity has failed (SOAP/SAML complexity, OAuth1 signing nightmare). Security review burden is high and ongoing. No ecosystem support.

**Pure OAuth2 access tokens (no OIDC).** Rejected — OAuth2 alone doesn't standardize identity claims; we'd end up either reinventing OIDC or having every implementation define its own claim shapes (defeating the universal-protocol goal).

## References

- `PARADIGM-v0.md` §2 (Purpose — Problem 1: permissionless access)
- `PROTOCOL-SPEC-v0.5.md` §16 (Identity profile)
- `PROTOCOL-SPEC-v0.5.md` §17 (Trust tier model)
- `PROTOCOL-SPEC-v0.5.md` §19 (Token binding)
- Continuum OAuth broker work (reference implementation; details available upon engagement)
