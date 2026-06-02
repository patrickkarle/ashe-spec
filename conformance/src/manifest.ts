/**
 * Language-neutral manifest of the weightlessness-gate conformance tests (ADR-020,
 * "Conformance suite for the weightlessness gate"). The four groups W/H/N/R map to
 * the four facets of proper application. All four groups are CONJUNCTIVE: a
 * weightlessness claim is conformant only if every group passes.
 *
 * Non-TypeScript implementations consume this same manifest (by id) so results are
 * comparable across implementations and across the four ADR-014 enforcement layers.
 */

export type Facet = "what" | "how" | "when" | "where";

export interface ConformanceTest {
  /** Stable id, cited in results and in cross-implementation comparison. */
  readonly id: string;
  readonly group: "W" | "H" | "N" | "R";
  readonly facet: Facet;
  readonly name: string;
  /** The normative requirement, paraphrased from ADR-020. */
  readonly requirement: string;
  /** The condition under which the test fails (the disqualifying case). */
  readonly failsIf: string;
}

export const MANIFEST: readonly ConformanceTest[] = [
  // ── Group W — what (object-capability primitive) ──────────────────────────
  {
    id: "W1-unnameability",
    group: "W",
    facet: "what",
    name: "unnameability",
    requirement:
      "An actor lacking a capability MUST have no reference by which to invoke the guarded action; the action is absent from the actor's surface, not present-and-rejected.",
    failsIf:
      "The SUT returns a DENIED decision for an unauthorized action (denial implies the action was nameable and evaluated).",
  },
  {
    id: "W2-zero-ambient-authority",
    group: "W",
    facet: "what",
    name: "zero-ambient-authority",
    requirement:
      "Authority reachable by a freshly-constructed actor MUST equal exactly the explicitly-granted set, with no ambient authority recoverable via traversal, absolute paths, subprocess, or reflection.",
    failsIf: "Reachable authority is a strict superset of the granted set.",
  },
  {
    id: "W3-attenuation",
    group: "W",
    facet: "what",
    name: "cascade-attenuation",
    requirement:
      "A sub-actor's reachable authority MUST be a subset of the granting actor's (ADR-017 cascade attenuation).",
    failsIf: "A spawned sub-actor can reach an authority the parent cannot.",
  },

  // ── Group H — how (structural mechanism) ──────────────────────────────────
  {
    id: "H1-no-added-step",
    group: "H",
    facet: "how",
    name: "no-added-step",
    requirement:
      "On the routine path, a passing action MUST reach its handler with no ASHE-executed evaluation step interposed at the claimed structural layer (substrate's own mechanism per ADR-014).",
    failsIf:
      "An ASHE evaluation step is interposed on the routine path while the SUT claims a structural (Layer 2/3/4) boundary.",
  },
  {
    id: "H2-byte-identity",
    group: "H",
    facet: "how",
    name: "byte-identity",
    requirement:
      "A passing routine action MUST arrive at its handler byte-identical to the unmediated baseline (ADR-007 no-data-alteration floor).",
    failsIf: "The delivered payload differs from the unmediated baseline.",
  },
  {
    id: "H3-layer-disclosure",
    group: "H",
    facet: "how",
    name: "layer-disclosure",
    requirement:
      "If routine-path mediation is procedural (Layer 1), the SUT MUST declare no-delay/no-bandwidth as amortized-small, not literal-zero.",
    failsIf:
      "The SUT runs a procedural routine-path check (Layer 1) yet declares literal-zero for no-delay or no-bandwidth.",
  },

  // ── Group N — when (at construction) ──────────────────────────────────────
  {
    id: "N1-construction-order",
    group: "N",
    facet: "when",
    name: "construction-order",
    requirement:
      "The perimeter MUST be established before workspace contents are reachable (wall-up-first; `ashe workspace init` as step 1; ADR-017 C1).",
    failsIf: "There is a window in which contents are reachable before the perimeter exists.",
  },
  {
    id: "N2-no-front-gate",
    group: "N",
    facet: "when",
    name: "no-front-gate",
    requirement:
      "The boundary MUST be the system's shape, not a removable gate: disabling the ASHE component MUST make guarded actions unreachable (structural), not ungated-but-reachable (bolted-on).",
    failsIf: "Disabling ASHE leaves a guarded action reachable.",
  },

  // ── Group R — where (concentrated scope) ──────────────────────────────────
  {
    id: "R1-path-classification",
    group: "R",
    facet: "where",
    name: "path-classification",
    requirement:
      "The SUT MUST classify actions into the routine path (Tier A/B) and the Tier C boundary, and enforce them differently.",
    failsIf: "The SUT does not distinguish the routine path from the Tier C boundary.",
  },
  {
    id: "R2-no-uniform-enforcement",
    group: "R",
    facet: "where",
    name: "no-uniform-enforcement",
    requirement:
      "A routine Tier A action MUST incur no round-trip, no added token, and no human prompt, while a representative Tier C action does invoke the explicit boundary.",
    failsIf: "A routine action incurs round-trip/added-tokens/human-prompt, i.e. the 98% is gated like the 2%.",
  },
  {
    id: "R3-friction-frequency",
    group: "R",
    facet: "where",
    name: "friction-frequency",
    requirement:
      "Over a representative workload, explicit-prompt frequency on the routine path MUST stay below the SUT's declared threshold (ADR-017 C2 frictionlessness).",
    failsIf: "Routine-path prompt frequency meets or exceeds the declared threshold.",
  },
] as const;

export function testsForGroup(group: ConformanceTest["group"]): readonly ConformanceTest[] {
  return MANIFEST.filter((t) => t.group === group);
}
