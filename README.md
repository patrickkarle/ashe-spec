# ASHE

**ASHE — a capability-broker protocol for the agent era.**

An open specification by [Phor](https://phor.io) ™, published 2026-05-28.

---

## What is ASHE?

ASHE is a capability-broker protocol for AI agents acting inside software environments. When an agent takes an action — calls an API, writes a file, executes a command, browses a page — ASHE issues a time-bounded, scope-bounded *capability lease* that determines what the action is authorized to do, who can see it happened, and how it gets audited.

The architectural thesis: **bounded outcomes ≠ censored behavior**. The model thinks, plans, and explores freely. The protocol-layer lease determines what actually happens in the world. This is the structural alternative to current internal-self-limitation safety paradigms (RLHF, constitutional training, refusal layers, training-time capability restriction), which censor benign creativity along with malign output.

## What ASHE delivers

- **Tri-surface architecture**: agent-side enforcement + dev-side sealed workspaces + web-side `.well-known/ashe` handshakes
- **Phased enforcement model**: cooperating-SDK (Layer 1) → runtime-hook (Layer 2) → OS-level mediation (Layer 3) → hardware-rooted (Layer 4)
- **No per-action prompts by mandate**: standing capabilities + risk-tiered automation + cached approvals + inferred intent — removes per-action approval prompts
- **Non-invasive at model layer**: doesn't modify the model; doesn't limit model reasoning capability; bounds outcomes structurally rather than censoring behavior heuristically
- **Cross-vendor neutral**: one protocol, many implementations

## What ASHE is NOT

- Not a replacement for MCP, auth.md, OAuth, or commercial agent-auth platforms — composes above them
- Not a sandbox runtime or development environment — composes with them (Bubblewrap, Seatbelt, gVisor, Firecracker, devcontainers, etc.)
- Not a model-capability limiter — bounds outcomes via the protocol layer; does not censor cognition or limit reasoning
- Not a hallucination fix at the model layer — operates at the dispatch boundary
- Not the first standardization motion in the agent-protocol space — that was MCP. ASHE is the next-layer protocol composing above MCP + auth.md + commercial platforms

## Read in this order

| Order | Document | What it gives you |
|---|---|---|
| 1 | [MANIFESTO.md](./MANIFESTO.md) | The opener — what ASHE is in one paragraph; the bounded-outcomes commitment; what ASHE is not |
| 2 | [CASE-FOR-NOW.md](./CASE-FOR-NOW.md) | The urgency case anchored on Anthropic's Glasswing operational data + the CVD disclosure-funnel quantification |
| 3 | [VISION.md](./VISION.md) | The technical-strategic vision; start with §0 (keystone metaphor) + §1 (capability-broker thesis) |
| 4 | [decisions/INDEX.md](./decisions/INDEX.md) | Architectural decision records (ADRs 001-019) — the design discipline trail |

## Provenance

ASHE was developed within [Continuum](https://phor.io), Phor's integrated environment for agentic composition. Phor is publishing the protocol openly because the architectural pattern it codifies — capability mediation between agents and software — should be a public cross-vendor standard, not a single-vendor advantage.

## External validation (as of 2026-05-29)

Within 48 hours of initial publication, seven independent sources across five credibility categories converged on architectural commitments ASHE specifies:

| Source | Category | Validates |
|---|---|---|
| Cloudflare (Wildani & Ahmad, 2026; Zhang et al., ACM SoCC 2025) | Industry engineering operational | Tri-surface web-side cache architecture |
| HUMAN Security (2026 report; 1+ quadrillion interactions) | Industry threat intelligence | Intent declaration + trust governance |
| Google Cloud (AI Agent Trends 2026; n=3,466 enterprise survey) | Frontier-vendor strategic disclosure | Multi-protocol stack + capability-mediation gap explicitly named |
| Lù et al. (arXiv:2506.10953) | Academic research pipeline | "Agentic Web Interface" foundational position |
| Kenny & Pogrebna (HBR 2026) | Executive business strategy | "First customer is the algorithm" |
| Jeske (Siteimprove 2025) | Operator-practice decisioning | Operator governance frameworks already deployed |
| Wikimedia (Kaggle distribution workaround) | Industry operational | Structured-data-for-agents negotiation |

Full primary-source evidence with quotes and citations: [CASE-FOR-NOW.md §1.9-§1.13](./CASE-FOR-NOW.md).

## Status

Early protocol publication (v0.x). The artifacts here represent architectural commitments + decision discipline + a structural case for adoption — they are NOT a finalized specification ready for ratification. The published [validation methodology](./decisions/ADR-015-validation-methodology-and-tiered-claims.md) commits to publishing benchmarks + a conformance suite within 12 months of v1 reference implementation completion. Tiered claims discipline (Floor / Target / Stretch with evidence grades) is applied throughout.

## License

Apache 2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

The Apache 2.0 license includes a patent grant — implementations and derivative works are protected from patent ambush by the original contributors.

## Engagement

Substantive critique, conformance discussions, and implementation proposals are welcomed via GitHub Issues. Rejection-motivation analysis in [CASE-FOR-NOW §1.8.1](./CASE-FOR-NOW.md) explicitly distinguishes legitimate critique (welcomed; strengthens the protocol) from motivated rejection (capability hoarding / regulatory capture / vendor lock-in / status-quo defense).

Implementation partners and ecosystem coordination conversations: contact via [phor.io](https://phor.io).

## Author

Patrick Karle — systems architect working on operational containment of agent capabilities at the protocol layer. ASHE is one capability published from broader work on the [Phor](https://phor.io) ecosystem and the Continuum product.

---

*"Phor" — from Greek -phor (φόρος), bearer or carrier. Capabilities are carriers of authority between agents and software environments. Bounded outcomes ≠ censored behavior.*
