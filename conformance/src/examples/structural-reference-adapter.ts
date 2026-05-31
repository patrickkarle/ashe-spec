/**
 * Illustrative reference adapter — a minimal, in-memory model of a *correctly
 * applied* ASHE (object-capability primitive, structural at Layer 3, established at
 * construction, weight concentrated at Tier C). It exists to make the conformance
 * suite self-verifying — `npm run test:example` runs the suite against it and all
 * four groups pass — and to show implementers the shape of a conformant adapter.
 *
 * It is NOT a real enforcement implementation and makes no claim of being one. It is
 * the conformance analogue of a "hello world": enough to exercise every assertion.
 */
import type {
  ActionDescriptor,
  Actor,
  AsheConformanceAdapter,
  CapabilityRef,
  EnforcementLayer,
  Grade,
  InvokeResult,
  Tier,
} from "../adapter.js";

/** An actor is just the set of capability references it holds — nothing ambient. */
type CapActor = { readonly caps: ReadonlySet<CapabilityRef> };

function isCapActor(a: Actor): a is CapActor {
  return typeof a === "object" && a !== null && "caps" in a;
}

const adapter: AsheConformanceAdapter = {
  // ── what ──────────────────────────────────────────────────────────────────
  makeActor(grants: CapabilityRef[]): Actor {
    return { caps: new Set(grants) } satisfies CapActor;
  },

  reachableAuthorities(actor: Actor): CapabilityRef[] {
    if (!isCapActor(actor)) return [];
    // Structural model: the only authorities reachable are the held references.
    // There is no ambient surface to recover anything else from.
    return [...actor.caps];
  },

  canName(actor: Actor, action: ActionDescriptor): boolean {
    return isCapActor(actor) && actor.caps.has(action.requiredCapability);
  },

  invoke(actor: Actor, action: ActionDescriptor): InvokeResult {
    // No reference → the action is not expressible. Absence, never a denial.
    if (!this.canName(actor, action)) return "UNNAMEABLE";
    return "ALLOWED";
  },

  spawnSubActor(parent: Actor, grants: CapabilityRef[]): Actor {
    const parentCaps = isCapActor(parent) ? parent.caps : new Set<CapabilityRef>();
    // Attenuation is structural: the child cannot receive what the parent lacks.
    const attenuated = grants.filter((g) => parentCaps.has(g));
    return { caps: new Set(attenuated) } satisfies CapActor;
  },

  // ── how ───────────────────────────────────────────────────────────────────
  routinePathLayer(): EnforcementLayer {
    return 3; // OS-level structural mediation: the boundary is the substrate.
  },

  routineActionTrace(action: ActionDescriptor) {
    // Structural boundary: nothing is interposed, and the payload is untouched.
    return { stepInterposed: false, payloadDelivered: action.payload };
  },

  declaredGrade(_invariant: "no-delay" | "no-bandwidth"): Grade {
    return "literal-zero"; // honest at Layer 3
  },

  // ── when ──────────────────────────────────────────────────────────────────
  perimeterEstablishedAtConstruction(): boolean {
    return true; // wall-up-first
  },

  guardedReachabilityWithAsheDisabled(_action: ActionDescriptor) {
    // The boundary is the system's shape: there is no "ASHE off" mode that restores
    // ambient access, because the references simply do not exist outside it.
    return "unreachable" as const;
  },

  // ── where ─────────────────────────────────────────────────────────────────
  classifyTier(action: ActionDescriptor): Tier {
    return action.expectedTier;
  },

  costProfile(action: ActionDescriptor) {
    if (this.classifyTier(action) === "C") {
      // Deliberate weight at the ~2% boundary — interference is the intended function.
      return { roundTrip: true, addedTokens: 0, humanPrompt: true };
    }
    // The ~98% routine path: no round-trip, no token, no prompt.
    return { roundTrip: false, addedTokens: 0, humanPrompt: false };
  },

  routinePromptFrequency(workload: ActionDescriptor[]): number {
    const prompted = workload.filter((a) => this.costProfile(a).humanPrompt).length;
    return workload.length === 0 ? 0 : prompted / workload.length;
  },

  promptFrequencyThreshold(): number {
    return 0.05;
  },

  // ── shared ──────────────────────────────────────────────────────────────────
  unmediatedBaselinePayload(action: ActionDescriptor): Uint8Array {
    return action.payload;
  },
};

export default adapter;
