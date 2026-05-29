# ADR-006: TOON Dual-Projection as Paradigm-Level Design

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-22 |
| Decider | PK + Claude |
| Touches | Paradigm, protocol |

## Context

The prior `warehouse/blueprints/ashe-toon-paradigm/` directory naming made TOON co-equal with ASHE in the conceptual hierarchy. The kernel-scope reorganization (2026-05-22) initially demoted TOON to "one format option among others" by treating it as a peripheral feature in PROTOCOL-SPEC-v0.5.md §47-48. PK flagged the omission: "the protocol has lost TOON."

The flag is correct. TOON is not an output-format option; it is the protocol's structural answer to the **agent-token-economics problem**. LLM agents are token-bound consumers; their cost function is dominated by tokens-in-context. A canonical-JSON-only protocol forces agents to pay full JSON tax on every blueprint fetch, state inspection, recipe lookup, and event delivery. Empirically, JSON costs 30-60% more tokens than equivalent TOON projections of the same content. Across an active agent session — recurring blueprint reverifications, state inspections, event subscriptions, recipe lookups — that overhead can consume 20-40% of the agent's context window before any actual work.

Without TOON, agents either ration their reads of the protocol surface (defeating A4 Complete current spec and A6 Operational memory) or burn through context faster than they accomplish work (defeating the empowerment side of the bidirectional contract). Either way, the protocol fails its own value proposition for the dominant consumer class.

## Decision

**TOON is a paradigm-level element of ASHE, not an optional feature.** The protocol adopts a **dual-projection design** for all structured response surfaces:

- **Canonical JSON** — source of truth; lossless; schema-validated; for programmatic clients, persistence, validation tooling.
- **LLM-facing TOON projection** — derived from canonical JSON; deterministic and lossless-for-the-supported-shape; tabular form for uniform arrays; LLM-prompt-optimized; typically 30-60% fewer tokens.

Both projections carry the **same logical content**. They differ only in encoding. A `format=json|toon|both` selector on the request envelope lets consumers pick.

### Conformance implications

- TOON support is part of the **Core conformance tier** (cannot be skipped). A conforming implementation MUST be able to project every structured response into TOON.
- Conformance testing MUST validate both projections render correctly for every response surface.
- The format selector grammar is normative on the request envelope.
- Conformance tier names remain (Core / +Continuity / +Recipes / +History / +Invariants / +StateMachines per ADR-001); TOON is folded into Core rather than promoted to its own tier — token efficiency is too central to defer.

### Paradigm doc updates

- PARADIGM-v0.md axiom A7 expanded to A7 (implementer cost) + A8 (token-efficient agent-facing projection)
- PARADIGM-v0.md §12 "Dual-Projection Design" added as a substantive paradigm section, not a footnote
- PARADIGM-v0.md §3 (Scope) explicitly lists dual-projection delivery

### Protocol spec implications

- PROTOCOL-SPEC §47 (Format selectors) and §48 (TOON projection profile) remain in the spec but must be promoted to normative-must status rather than optional-feature framing when full prose is drafted
- Every blueprint layer schema (§26-42) MUST be designed with both projections in mind — no JSON-only layers
- Event envelopes (§57) MUST support TOON projection for event payloads
- Error envelopes (§60) MUST support TOON projection for error details

## Consequences

**Positive:**

- **Agent token economics fixed at the paradigm level** — agents can actually use the protocol routinely without context starvation
- The empowerment side of the bidirectional contract becomes structurally affordable, not just nominally promised
- Carryover dimensions (A5) work efficiently — cached blueprints deliver real bandwidth savings because TOON makes the cache contents small
- A6 (Operational memory) becomes practical — history queries return TOON-projected timelines that fit in context
- Continuum's existing TOON encoder in `construct-agent-hateoas.js` (Sessions 45-51) is preserved and promotable to a kernel `lib/` utility for all ASHE-enabled DMs

**Negative:**

- Implementer cost rises slightly — every implementer must implement TOON projection (or use the SDK's projector) for Core conformance
- The protocol spec grows — every response-surface section must specify both projections
- Schema design discipline: blueprint layers cannot use shapes that don't project cleanly into TOON (some highly-nested heterogeneous schemas may need refactoring for projection)

**Forecloses:**

- "TOON later as extension" — by making TOON Core, we commit upfront. The alternative (defer TOON to a tier) was considered and rejected: deferring it would let implementations claim Core conformance without addressing the token-economics problem, defeating the whole point.
- Substituting TOON with another LLM-projection format — the protocol commits to TOON specifically. A future projection format would require a spec extension (and a strong justification — TOON works).

## Alternatives Considered

**TOON as optional `+Projection` conformance tier.** Rejected — Core tier without TOON delivers a protocol that's structurally unusable by token-bound consumers. The whole point of the agent-facing protocol is to serve agents efficiently. Making efficiency optional is making the protocol's purpose optional.

**TOON-only (no JSON).** Rejected — programmatic consumers (renderer, MCP gateway, custom integrations, validators) need JSON as the lossless canonical form. JSON Schema validation requires JSON.

**Other LLM-projection formats** (custom YAML variant, MessagePack-textual, CSV-with-headers, S-expressions). Considered — TOON is the projection format the prior Construct work proved practical; switching would discard working code, require new spec, and gain marginal benefit. TOON's tabular-for-uniform-arrays + scalar-indentation pattern is well-tuned for the blueprint-style payload distribution.

**Make TOON the *default* (no `format` selector).** Rejected — programmatic clients consuming JSON would have to opt back in; better to default to `both` (backward compatible, lets clients pick at consumption time) per spec §47.

**Auto-detect consumer type and select format.** Rejected — implicit behavior creates surprise; explicit `format` parameter is contract-honest.

## References

- `PARADIGM-v0.md` §3 (Scope — dual-projection in-scope)
- `PARADIGM-v0.md` §4.3 (Efficiency Family — A7 + A8)
- `PARADIGM-v0.md` §12 (Dual-Projection Design — full rationale)
- `PROTOCOL-SPEC-v0.5.md` §47 (Format selectors)
- `PROTOCOL-SPEC-v0.5.md` §48 (TOON projection profile)
- ADR-001 (tiered conformance — TOON folded into Core)
- Construct-scope TOON encoder exists within the reference implementation (details available upon engagement)
- Earlier prototypes of the spec lived under a working directory whose name reflected TOON's centrality in the design
