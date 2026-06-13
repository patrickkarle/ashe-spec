# ADR-008: Validation graph with default-to-tiny-ONNX evaluators

| Field | Value |
|-------|-------|
| Status | Accepted (forward-progression commitment; v0 implementation is rules-only foundation). **Amendment 2026-05-23**: §1's engine-reuse aspect ("reuse phor-graph-scheduler") is SUPERSEDED by [ADR-010](ADR-010-standalone-graph-engine.md). All other commitments in this ADR (graph as composition model, evaluator contract, default-to-tiny-ONNX, tier ladder, model-agnosticism) REMAIN IN FORCE. |
| Date | 2026-05-23 |
| Decider | PK + Claude |
| Touches | reference-arch (primary), protocol (any implementor faces same composition question) |

## Context

ASHE's permission decisions grow in complexity over time. v0 makes decisions from rules alone (identity, scope, JSON Schema, rate limits). Future versions will need to evaluate: agent intent, code submissions, behavioral anomalies, reconciliation of stated-intent vs. actual-code-behavior. Each of these requires *intelligence* — learned or symbolic reasoning beyond rule lookup.

The composition question: how should ASHE assemble multiple evaluators into a coherent decision pipeline?

A related question: how *smart* should the intelligent components be? Cloud LLMs are most capable but introduce network dependency, cost, latency, non-determinism, and privacy concerns. Local LLMs (1-4B params) are reasonable but multi-GB and slow per-decision. Tiny classifiers (ONNX, 5-200MB) are fast, deterministic, narrow.

A third question: which models should ASHE commit to? Locking in a specific model (e.g., Phi-3-mini) creates vendor dependency and forecloses optimization as better models emerge.

The deep insight that drives this ADR: **for security/permission decisions, determinism + auditability + composability matter more than raw capability**. A decision that can be replayed and explained beats a decision that's smarter but unauditable.

## Decision

**Three coupled commitments**:

### 1. Validation as a graph

ASHE composes evaluators using a directed graph, executed by the existing `phor-graph-scheduler` (the engine that walks Construct compositions). The graph supports conditional routing (cheap evaluators short-circuit expensive ones), parallel evaluation (independent evidence collected concurrently), and path-dependent decisions (later nodes shaped by earlier outcomes).

### 2. Uniform evaluator contract

Every evaluator implements one shape regardless of backing technology:

```
evaluator.evaluate({ request, context, tier }) → {
  decision:   'allow' | 'deny' | 'defer' | 'sandbox',
  confidence: number,
  reason:     string,
  evaluator:  { id, version }
}
```

The contract is **symmetric** to the IPC-gateway interception contract (ADR-007). Same pattern at both layers; uniform consumer-of-contract design across the kernel.

### 3. Default to tiny ONNX

The primary evaluator mechanism is small ONNX classifiers (5-200 MB, sub-50ms, deterministic). LLM-based evaluators exist as escalation paths only — invoked when classifier confidence is insufficient. Model selection is **per-evaluator-node, per-deployment**; ASHE itself names no specific model.

Tier ladder:

| Tier | Mechanism | Latency | Role |
|------|-----------|---------|------|
| 0 — Rules | Hardcoded predicates, JSON Schema | <5ms | v0 floor; always present |
| 1 — Classifier | Tiny ONNX | 10–50ms | Default mechanism for learned decisions |
| 2 — Small LLM | Local 1–4B model | 500ms–5s | Semantic reasoning when classifiers can't decide |
| 3 — Cloud LLM | Frontier API | 2–30s | Last-resort escalation |

The majority of decisions terminate at tier 0 or tier 1. Tier 2 fires only on classifier deferral. Tier 3 fires only on tier-2 deferral AND deployment authorization.

## Consequences

**What becomes easier**:

- Adding new evaluators — implement contract, register node in graph topology; no ASHE core changes
- Auditing decisions — the path through the graph IS the explanation; every node's output is recorded with model-version pinning
- Replaying historical decisions — deterministic evaluators produce reproducible outcomes
- Composing specialized intelligence — narrow, well-trained classifiers stacked outperform a single generalist on the same task
- Visualizing policy — graph topology is drawable, simulatable, A/B testable
- Replacing models — swap one evaluator's backing implementation without touching others
- Deploying narrowly — embedded contexts use tier 0 + tier 1 only; production hosts add tier 2+

**What becomes harder**:

- First-time evaluator training — requires labeled corpus per evaluator (mitigation: tier-3 cloud-LLM phase generates the corpus as a side effect)
- Topology versioning — graph itself becomes versioned artifact requiring schema validation + golden-path tests (treat graph as code)
- Performance debugging — multi-node graphs require per-node profiling to identify slow paths

**What becomes possible**:

- ASHE deployed across the full spectrum from embedded to production hosts without forking the codebase (see ADR-009)
- Long-term migration to fully-local intelligence (sovereign deployments) without cloud dependency
- Per-deployment policy customization — same protocol surface, different evaluator topologies
- Progression awareness — as compute cheapens, the right response is MORE tiny specialists, not bigger generalists; horizontal scaling preserved

**What becomes impossible** (intentionally):

- "The LLM decided" as a bypass for explainability — every decision must traverse a graph whose topology is documented
- Vendor lock-in to a specific model — the model-agnostic contract is structural
- Hidden non-determinism — temperature/sampling/stateful inference is contained at evaluator nodes whose non-determinism is explicit, not pervasive

## Alternatives Considered

**1. Chain of evaluators (sequential pipeline).** All evaluators run in fixed order for every request. Rejected because: (a) cheap evaluators can't short-circuit expensive ones — every request pays the full cost; (b) parallel evidence collection impossible; (c) no path-dependent decisions; (d) adding evaluators changes flat ordering, hard to reason about.

**2. LLM-first design (everything through an LLM).** Use a Phi-class or larger LLM as the primary evaluator; classifiers as optimization. Rejected because: (a) determinism unavailable — LLM outputs are probabilistic; (b) auditability poor — "model said X" is not a trace; (c) latency floor too high for hot path; (d) GB-scale memory footprint disqualifies embedded deployments; (e) locks in a specific model class.

**3. Rules-only forever.** v0 is rules-based; never add learned evaluators. Rejected because: (a) cannot handle code-evaluation, intent-classification, anomaly-detection — these require learned models; (b) closes off ASHE's long-term value proposition (safe agentic execution); (c) rules can't scale to the policy complexity needed for novel agent behaviors.

**4. Capability tokens (per-request).** ASHE returns a token at handshake encoding all allowed operations; per-request decisions become token validation. Rejected as primary mechanism because: (a) revocation complexity; (b) can't model context-dependent decisions (state-aware policy); (c) doesn't address code-eval / intent-eval. Worth revisiting as a fast-path optimization layered over the graph for the most common decisions.

**5. Lock in one specific model (e.g., Phi-3-mini for everything).** Pick the best current generalist and commit. Rejected because: (a) creates vendor dependency; (b) forecloses optimization as better models emerge; (c) loses specialization advantages (narrow classifiers beat generalists on narrow tasks); (d) violates the "model-agnostic at every seam" architectural principle.

**6. Build a custom inference engine.** Don't use ONNX Runtime or llama.cpp; build a kernel-native inference path. Rejected because: (a) massive engineering investment for no qualitative benefit; (b) ONNX Runtime is mature, fast, deterministic, multi-language; (c) llama.cpp is the de-facto local LLM runtime; (d) custom inference would need to track upstream model formats — unending maintenance burden.

## Related decisions

- ADR-007 — Interception-chain pattern as kernel-wide extension model (same pattern applied at IPC seam)
- ADR-009 — ASHE deployment profiles (which tiers ship in which deployment)
- Forward: Tier-2 model selection (deferred to v3 implementation when corpus from tier-3 phase exists)
- Forward: Graph topology versioning / testing strategy (deferred to v1 implementation when graph engine wired in)
