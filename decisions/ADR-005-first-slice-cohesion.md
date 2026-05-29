# ADR-005: First-Slice Cohesion — Vision + Spec DRAFT + Continuum Full Impl + Spec v1.0 + Conformance Suite

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-22 |
| Decider | PK + Claude |
| Touches | Process, reference architecture |

## Context

ASHE is a multi-month design + implementation arc. The very first slice of work — what we deliver before any wider stakeholder review — determines whether the design is reality-tested, whether the standard is portable, and whether the reference implementation is canonical. Three candidate shapes:

- **(a)** Vision + Spec + minimal Continuum implementation (full stack demonstrated in miniature)
- **(b)** Vision + Spec only, no code yet (pure design exercise)
- **(c)** Implementation-first; harvest spec from working code (fastest to code)

PK's directive of "Continuum implementation full at all times" (ADR-001) rules out (c) — that would mean Continuum starts with a partial implementation, contradicting the full-tier requirement. PK's directive also implies that pure design without implementation (b) is insufficient because the implementation discipline is what catches hand-wavy designs.

## Decision

**Path (a) with sharpened phasing:**

```
PHASE 1 — Vision document (1-2 sessions)
└── warehouse/blueprints/ashe/PARADIGM-v0.md ✓ DONE 2026-05-22

PHASE 2 — Spec draft (3-5 sessions)
└── warehouse/blueprints/ashe/PROTOCOL-SPEC-v0.5.md ✓ DONE 2026-05-22 (outline level)

PHASE 3 — Reference implementation full-tier (8-12 sessions)
├── New ASHE domain manager (top-level coordinating component)
├── ASHE subsystems (~11 internal modules for lease lifecycle, capability checks, audit, etc.)
├── Shared utility for capability expression evaluation
├── Domain-manager registry entry
├── Existing-DM migration to register operations through ASHE
└── IPC gateway integration (gate hook in message dispatch path)

PHASE 4 — Spec v1.0 (post-implementation revision, 1-2 sessions)
└── warehouse/blueprints/ashe/PROTOCOL-SPEC-v1.0.md
    Revised based on implementation lessons; all DRAFT markers removed

PHASE 5 — Conformance test suite (2-3 sessions)
└── warehouse/blueprints/ashe/conformance/ (post-v1.0)
```

**Discipline required throughout:**

- Every time we reach for a Continuum-specific thing in the implementation, **stop and ask**: "Is this a protocol choice or a Continuum substrate choice?" If protocol, it goes in the spec. If substrate, it stays in the DM and is annotated as substrate-specific.
- The spec doc and the implementation evolve in lockstep but separately — never co-mingled in the same file.
- The conformance test suite is what catches drift between spec and reference implementation.

## Consequences

**Positive:**

- **Every protocol decision survives contact with code** — the discipline of building it forces honesty about what's actually implementable
- Continuum becomes the canonical full-tier reference implementation immediately
- Conformance test suite lets the standard be enforced — other implementers can prove their tier
- Tiered model lets adopters pick depth without lowering our bar
- Spec v1.0 is post-implementation, so we ship a tested spec, not a paper spec

**Negative:**

- Big up-front investment before any other project benefits (~15-25 sessions total across all phases)
- Continuum dev velocity in OTHER tracks slows — this is a major track
- Risk of "Continuum-coupled" decisions sneaking in unnoticed — mitigated by keeping spec docs in `warehouse/blueprints/ashe/` (signals substrate-independence by location) and by maintaining the substrate-vs-protocol review discipline at every decision

**Forecloses:**

- Quick first-mover advantage in the agent-protocol space (MCP is already shipping; we trade speed for depth)
- "Spec finalization before any implementation" path (rejected — would produce paper-only spec untested against reality)

## Alternatives Considered

**(b) Vision + Spec only, no code.** Rejected — pure design produces hand-wavy specs; "this can't be implemented cleanly," "this clashes with existing IPC," "this conflicts with the Database DM" surprises don't surface until implementation. The spec ends up needing major revision after first implementation.

**(c) Implementation-first, harvest spec from it.** Rejected — Continuum-isms bake into the spec; generalization happens too late; multi-vendor adoption becomes harder. Also incompatible with ADR-001 ("Continuum implementation full at all times" requires the spec to exist before implementation can target it).

**Vision + Spec v0.5 + minimal one-tenant impl + Spec v1.0 + scale-up to full impl.** Considered as a middle path. Rejected because "minimal one-tenant impl" doesn't actually test the full surface — many protocol decisions (continuity, recipes, history, full invariant language) wouldn't be exercised. Better to commit to full-tier from the start.

## References

- `PARADIGM-v0.md` §3 (Scope)
- `PARADIGM-v0.md` §7 (Four-layer architectural separation)
- `ADR-001-tiered-conformance.md` (the "Continuum at full tier always" decision this depends on)
- `PROTOCOL-SPEC-v0.5.md` Part XIV — Appendix D (Reference implementation pointers placeholder)
