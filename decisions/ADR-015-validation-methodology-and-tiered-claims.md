# ADR-015: Validation methodology — benchmark-first; tiered claims with evidence grades

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-25 |
| Decider | PK + Claude |
| Touches | process, reference-arch (commits a validation discipline that shapes implementation work) |
| Cited by | Forthcoming Tier 1 + Tier 2 artifacts (especially CASE-FOR-NOW and BENCHMARK-PLAN) |

## Context

ASHE's efficiency claims have evolved through three iterations during the May 2026 conversation arc:

1. Initial speculation (unbounded improvements; "1500x" cost spread)
2. Empirically anchored (arXiv 2511.23281 demonstrates 2-5x token / 5x runtime for structured alternatives vs HTML)
3. Tiered framing (floor empirically validated; target design-grounded; stretch deployment-dependent)

The honest discipline requires:

- **Distinguishing what's measured from what's projected.** Conflating the two destroys credibility on contact with expert scrutiny.
- **Committing to validate projections through measurement.** A target claim that can't be falsified is aspirational; one that can be falsified is testable.
- **Building the validation work into the project plan, not deferring it.** "We'll measure later" rarely happens; "we publish the controlled study with the v1 reference implementation" forces the work to happen.

A separate force: **the artifacts must survive engagement with people who have built agents at scale.** Casual claims that "frontier models are required for HTML" or "1500x cost reduction is achievable" fall apart on first contact with anyone at Anthropic / OpenAI / Google's agent teams. Defensive discipline requires every empirical claim to be evidence-graded and verifiable.

## Decision

**ASHE adopts a tiered-claim discipline with explicit evidence grades, and commits to benchmark-first validation methodology.**

### Tiered claims with evidence grades

Every empirical claim in ASHE's public artifacts MUST be classified into one of three evidence tiers:

| Tier | Definition | Citation requirement | Honest framing |
|------|------------|---------------------|----------------|
| **Floor** | Empirically validated by published controlled study or production measurement | MUST cite source by author, venue, year, identifier | "Demonstrated to achieve X" |
| **Target** | Design-grounded projection with specific mechanism named | MUST identify the optimization mechanism that produces the projected improvement | "Designed to achieve X via mechanism Y, subject to validation" |
| **Stretch** | Deployment-pattern-dependent upper bound; requires favorable conditions | MUST name the conditions required for the stretch claim to materialize | "Under conditions Z, could reach X" |

Claims without one of these classifications are not permitted in public artifacts. Every projection is paired with its evidence-grade label.

**Example application** (for the wire-efficiency claim):

| Metric | Floor (cited) | Target (design-grounded) | Stretch (deployment-dependent) |
|--------|--------------|--------------------------|--------------------------------|
| Token efficiency vs HTML | 2-5x (arXiv 2511.23281) | 10-30x (Protobuf binary + HTTP/3 + persistent connections + intent-declared transactions) | 50-100x (cascade-agent configuration with long-session streaming) |
| Runtime efficiency vs HTML | 5x (arXiv 2511.23281) | 10-20x (same mechanisms) | 30-50x (favorable patterns) |
| Server-side bandwidth | Not directly measured in cited study | 20-50x (binary + chrome-elimination) | 100-500x (favorable patterns) |

The floor is what defenders can cite without hedging. The target is what design predicts. The stretch is what's possible. Critics can dispute the target and stretch, but the floor is empirically grounded and not easily attacked.

### Benchmark-first methodology

**Before public release of any artifact claiming wire-efficiency or cascade-economic improvements, ASHE MUST publish a controlled benchmark replicating the arXiv 2511.23281 methodology against the ASHE reference implementation.**

Benchmark requirements:

| Component | Specification |
|-----------|--------------|
| **Workload** | One representative multi-step agent task (e-commerce product-search + cart + order-status recommended; specific definition in BENCHMARK-PLAN artifact) |
| **Backends compared** | At minimum: HTML, REST/JSON, MCP, NLWeb, ASHE — same workload across all five |
| **Agent configurations** | At minimum: monolithic-frontier-only AND cascade (frontier + cheap) — for both ASHE and at least one comparison backend |
| **LLM consistency** | Same LLM (Claude Sonnet class or equivalent) across all backends; cheap-tier model (Haiku class or equivalent) for cascade configuration |
| **Measurements** | Tokens per task (per model tier); wall-clock runtime per task; bandwidth per task; round-trip count per task; success rate per attempt; cost per successful task at retail model pricing |
| **Reproducibility** | Containerized (Docker compose or equivalent); reproduction instructions; raw data published |
| **Publication form** | Public benchmark report at `infrastructure/protocols/ashe/benchmarks/BENCHMARK-REPORT-v1.md`; raw data + code in `benchmarks/` directory |

**Timing commitment**: the benchmark report ships **within 12 months of ASHE v1 reference implementation completion** (or accompanying its release, whichever comes first). Public artifacts (VISION, MANIFESTO, etc.) MAY cite design-grounded targets BEFORE the benchmark; MUST cite the floor numbers from arXiv 2511.23281; MUST commit to the benchmark in writing.

### Validation continues post-launch

Beyond the v1 benchmark, ASHE commits to ongoing measurement:

- Real-world deployment data published periodically (subject to privacy/consent)
- Conformance suite results published per implementation (per ADR-009 profile)
- Comparison benchmarks updated as new structured alternatives (MCP versions, NLWeb evolution) ship
- Honest reporting when measurements fall short of targets — the artifact gets updated, not the measurement disputed

## Consequences

**What becomes easier**:

- Public artifacts have built-in defensibility — every claim survives scrutiny because evidence grade is explicit
- Refuters cannot accuse ASHE of overclaiming; the floor/target/stretch separation pre-empts the attack
- Implementation work has a clear validation gate — the benchmark publication is a binary milestone
- Adopters can make informed decisions about which improvements they should expect at their deployment phase

**What becomes harder**:

- More work in artifact authoring — every claim must be evidence-graded explicitly
- Benchmark publication is a significant project (estimated 4-6 weeks of focused implementation per cascade-pattern extension to existing benchmark plan)
- Measurement results that fall short of targets must be reported honestly — there's no hiding place

**What becomes possible**:

- ASHE's public claims are categorically more defensible than typical protocol/standards proposals
- The benchmark itself becomes a citable artifact in subsequent work (analogous to how the arXiv 2511.23281 study is citable)
- Implementation teams get clear go/no-go signals on whether design hypotheses materialize in practice
- The discipline of honest measurement is institutionalized — sets the standard for what claims any party adopting ASHE can make

**What becomes impossible** (intentionally):

- Unverifiable claims in public artifacts — every empirical statement requires evidence grade + source
- Marketing-grade exaggeration — the tier system bounds what can be said
- Hiding measurement failures — the methodology commits to reporting results regardless of outcome

## Alternatives Considered

**1. Specification-first without benchmark commitment.** Rejected because:
- Specifications without measurement are aspirational; first contact with adversarial scrutiny exposes the gap
- The arXiv 2511.23281 study exists; it's the credibility anchor; ASHE must engage with that level of rigor or be dismissed
- Standards-track work has historically failed when specs ship without working reference implementations; benchmark-first prevents this failure mode

**2. Benchmark as a future commitment without timeline.** Rejected because:
- "We'll measure eventually" rarely produces actual measurement; the commitment must be time-bounded
- 12 months is generous enough to allow real engineering work; specific enough to be falsifiable
- Without timeline, public artifacts make claims that have no validation horizon — invites the "you'll never deliver" attack

**3. Match the arXiv methodology exactly (no extensions).** Rejected because:
- The cascade-agent pattern is ASHE-specific; needs to be measured against ASHE's design
- Adding cascade-agent configuration to the methodology is a small extension (1 week beyond base benchmark) with disproportionate value (validates the killer economic pitch)
- Some additional measurements (server-side bandwidth, cost-per-successful-task) are valuable beyond the arXiv study's scope

**4. Claim only what's empirically measured today (no target / stretch tiers).** Rejected because:
- Forecloses the architectural ambition; ASHE's design targets >5x not 5x
- Standards work that under-claims gets dismissed as incremental; design ambition must be communicated
- The tiered structure WITH explicit evidence grades is more honest than either extreme

## Related decisions

- ADR-006 — TOON dual-projection (validated by existing test suite; floor measurements available)
- ADR-008 — Validation graph (compatible; per-evaluator benchmarks possible)
- ADR-012 — Wire format gRPC/Protobuf (the benchmark validates the wire-format choice's claimed economics)
- ADR-013 — Multi-service architecture (benchmark per-service conformance becomes possible)
- ADR-014 — Phased enforcement model (benchmark per enforcement-layer claim becomes possible)
- Forthcoming BENCHMARK-PLAN.md — concrete methodology
- Forthcoming BENCHMARK-REPORT-v1.md — concrete measurements (within 12 months of v1 reference impl)

## Implementation notes

For Continuum's reference implementation:

- Benchmark code lives at `infrastructure/protocols/ashe/benchmarks/`
- Test workloads versioned alongside benchmark code
- Each benchmark report tagged with: ASHE version tested, comparison-backend versions, LLM versions, hardware spec, date, methodology hash
- Reproduction instructions in containerized form (Docker compose preferred for portability)
- Raw measurement data (JSON or CSV) committed alongside the analyzed report
- Subsequent benchmark runs add to the report rather than replacing it (longitudinal validation)
