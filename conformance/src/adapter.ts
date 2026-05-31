/**
 * ASHE conformance adapter — the contract an implementation-under-test (the "SUT")
 * implements so the weightlessness-gate suite (ADR-020) can exercise it.
 *
 * The suite never imports an implementation directly. An implementation provides a
 * module whose default export is an `AsheConformanceAdapter`, points
 * `ASHE_CONFORMANCE_ADAPTER` at it, and runs the suite. With no adapter configured,
 * every group is skipped (see `requireAdapter`).
 *
 * The four method blocks below map one-to-one to the four facets of proper
 * application in ADR-020: what / how / when / where.
 */

/** Enforcement layer per ADR-014: 1 cooperating-SDK, 2 runtime-hook, 3 OS, 4 hardware. */
export type EnforcementLayer = 1 | 2 | 3 | 4;

/** Risk tier per ADR-017: A routine (~90%), B medium (~8%), C high-stakes (~2%). */
export type Tier = "A" | "B" | "C";

/** Disclosed grade for an invariant on the routine path (ADR-015 / ADR-020 caveat). */
export type Grade = "literal-zero" | "amortized-small";

/** Outcome of attempting an action. The W/H distinction is load-bearing: an
 *  unauthorized action under proper application is UNNAMEABLE (no reference to
 *  invoke), never DENIED (a flag evaluated at action time). */
export type InvokeResult = "ALLOWED" | "UNNAMEABLE" | "DENIED";

/** Opaque handle to an actor constructed by the SUT. */
export type Actor = unknown;

/** A capability the SUT understands, named however the SUT names them. */
export type CapabilityRef = string;

/** Describes an action the suite asks the SUT to attempt or classify. */
export interface ActionDescriptor {
  /** Stable id for logging. */
  readonly id: string;
  /** The capability this action requires to be nameable. */
  readonly requiredCapability: CapabilityRef;
  /** The risk tier the action is expected to fall in (for the where-facet tests). */
  readonly expectedTier: Tier;
  /** Opaque application payload, used by the byte-identity test. */
  readonly payload: Uint8Array;
}

export interface AsheConformanceAdapter {
  // ── Facet WHAT — object-capability primitive ──────────────────────────────
  /** Construct a fresh actor holding exactly `grants` and nothing ambient. */
  makeActor(grants: CapabilityRef[]): Actor;
  /** Every authority reachable by `actor`, including anything recoverable via
   *  traversal / absolute paths / subprocess / reflection. Zero-ambient means
   *  this equals exactly the granted set. */
  reachableAuthorities(actor: Actor): CapabilityRef[];
  /** Does `actor` hold a *reference* by which `action` can be invoked at all? */
  canName(actor: Actor, action: ActionDescriptor): boolean;
  /** Attempt `action`. Must distinguish UNNAMEABLE (no reference) from DENIED
   *  (reference present, evaluated, rejected) from ALLOWED. */
  invoke(actor: Actor, action: ActionDescriptor): InvokeResult;
  /** Spawn a sub-actor with `grants`; used for the cascade-attenuation test. */
  spawnSubActor(parent: Actor, grants: CapabilityRef[]): Actor;

  // ── Facet HOW — structural mechanism ──────────────────────────────────────
  /** The enforcement layer the SUT applies on the routine (Tier A/B) path. */
  routinePathLayer(): EnforcementLayer;
  /** Run a passing routine action; report whether an ASHE-executed evaluation
   *  step was interposed on the path, and the payload as delivered to the handler. */
  routineActionTrace(action: ActionDescriptor): {
    stepInterposed: boolean;
    payloadDelivered: Uint8Array;
  };
  /** The grade the SUT *claims* for an invariant on the routine path. A Layer-1
   *  SUT must declare "amortized-small" for no-delay/no-bandwidth, not literal-zero. */
  declaredGrade(invariant: "no-delay" | "no-bandwidth"): Grade;

  // ── Facet WHEN — at construction ──────────────────────────────────────────
  /** True iff the perimeter is established before workspace contents are
   *  reachable (wall-up-first, `ashe workspace init` as step 1; ADR-017 C1). */
  perimeterEstablishedAtConstruction(): boolean;
  /** With the ASHE component disabled, is `action` UNREACHABLE (structural shape)
   *  or REACHABLE (a removable front gate — bolted on)? */
  guardedReachabilityWithAsheDisabled(action: ActionDescriptor):
    | "unreachable"
    | "reachable";

  // ── Facet WHERE — concentrated scope ──────────────────────────────────────
  /** Which tier the SUT assigns `action`. */
  classifyTier(action: ActionDescriptor): Tier;
  /** Cost the SUT incurs for `action` on its path. */
  costProfile(action: ActionDescriptor): {
    roundTrip: boolean;
    addedTokens: number;
    humanPrompt: boolean;
  };
  /** Fraction (0..1) of routine-path actions in `workload` that triggered an
   *  explicit human prompt. */
  routinePromptFrequency(workload: ActionDescriptor[]): number;
  /** The SUT's own declared frictionlessness threshold (ADR-017 C2). */
  promptFrequencyThreshold(): number;

  // ── Shared baseline ───────────────────────────────────────────────────────
  /** The payload an *unmediated* invocation of `action` would deliver to the
   *  handler — the byte-identity baseline for the no-data-alteration floor. */
  unmediatedBaselinePayload(action: ActionDescriptor): Uint8Array;
}

/** Returns the configured adapter, or null when none is registered. */
export function loadAdapter(): AsheConformanceAdapter | null {
  return (globalThis as { __ASHE_ADAPTER__?: AsheConformanceAdapter }).__ASHE_ADAPTER__ ?? null;
}

/** Resolve the adapter for a test group, or null to signal the group should skip. */
export function requireAdapter(): AsheConformanceAdapter | null {
  return loadAdapter();
}
