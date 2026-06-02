/**
 * Reference adapter — a *correctly applied* ASHE (object-capability primitive,
 * structural at Layer 3, established at construction, weight concentrated at Tier C),
 * built on the reference protocol primitives in `../protocol`. It makes the
 * conformance suite self-verifying (`npm run test:example` → all groups green) and
 * shows implementers the shape of a conformant adapter: a thin translation from the
 * suite's `AsheConformanceAdapter` contract to real protocol objects.
 *
 * It is in-memory and minimal — not a production enforcement engine — but the
 * authority model it exposes (unforgeable capabilities, structural attenuation,
 * routine-path pass-through) is the genuine primitive set, not a stub.
 */
import type {
  ActionDescriptor,
  Actor as OpaqueActor,
  AsheConformanceAdapter,
  CapabilityRef,
  EnforcementLayer,
  Grade,
  InvokeResult,
  Tier,
} from "../adapter.js";
import {
  Actor,
  CapabilityIssuer,
  CapabilitySet,
  DEFAULT_TIER_C,
  Mediator,
  TierRegistry,
} from "../protocol/index.js";

const issuer = new CapabilityIssuer();
const tiers = new TierRegistry().registerAll(DEFAULT_TIER_C, "C");
const mediator = new Mediator(tiers);

/** Mint a fresh capability per requested name (the issuer is the trust root). */
function setFor(grants: CapabilityRef[]): CapabilitySet {
  return new CapabilitySet(grants.map((name) => issuer.mint(name)));
}

function asActor(a: OpaqueActor): Actor {
  if (!(a instanceof Actor)) throw new Error("adapter received a foreign actor handle");
  return a;
}

let actorSeq = 0;

const adapter: AsheConformanceAdapter = {
  // ── what ──────────────────────────────────────────────────────────────────
  makeActor(grants: CapabilityRef[]): OpaqueActor {
    actorSeq += 1;
    return new Actor(`actor#${actorSeq}`, setFor(grants));
  },

  reachableAuthorities(actor: OpaqueActor): CapabilityRef[] {
    return asActor(actor).reachableAuthorities();
  },

  canName(actor: OpaqueActor, action: ActionDescriptor): boolean {
    return asActor(actor).canName(action.requiredCapability);
  },

  invoke(actor: OpaqueActor, action: ActionDescriptor): InvokeResult {
    return mediator.mediate(asActor(actor), {
      capability: action.requiredCapability,
      payload: action.payload,
    }).decision;
  },

  spawnSubActor(parent: OpaqueActor, grants: CapabilityRef[]): OpaqueActor {
    actorSeq += 1;
    // Attenuation is structural: the child can only keep names the parent holds.
    return asActor(parent).spawn(`actor#${actorSeq}`, grants);
  },

  // ── how ───────────────────────────────────────────────────────────────────
  routinePathLayer(): EnforcementLayer {
    return 3; // OS-level structural mediation: the substrate is the boundary.
  },

  routineActionTrace(action: ActionDescriptor) {
    // A held routine capability: the mediator interposes no Tier-C boundary, and the
    // payload is delivered byte-identical.
    const probe = new Actor("trace-probe", setFor([action.requiredCapability]));
    const r = mediator.mediate(probe, {
      capability: action.requiredCapability,
      payload: action.payload,
    });
    return { stepInterposed: r.boundaryInvoked, payloadDelivered: r.payloadDelivered };
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
    // ambient access, because the capability references do not exist outside it.
    return "unreachable" as const;
  },

  // ── where ─────────────────────────────────────────────────────────────────
  classifyTier(action: ActionDescriptor): Tier {
    return tiers.classify(action.requiredCapability);
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
