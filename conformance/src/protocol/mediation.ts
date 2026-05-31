/**
 * Mediation — the interception point (ADR-007), applied structurally.
 *
 * The load-bearing property: on the routine (Tier A/B) path, a held capability is
 * passed through with *no boundary step* and the payload *untouched* — the decision
 * was made when the reference was granted, so there is nothing to evaluate now
 * (no-delay, no-bandwidth, no-data-alteration). The explicit boundary is invoked only
 * at Tier C, where interference is the intended function. An unheld capability yields
 * UNNAMEABLE — an absence, never a DENIED decision (which would imply the action was
 * nameable and evaluated, i.e. procedural — the very thing ADR-020 Group W forbids).
 */
import type { Actor } from "./actor.js";
import type { TierRegistry } from "./tier.js";

export type Decision = "ALLOWED" | "UNNAMEABLE" | "DENIED";

export interface Action {
  readonly capability: string;
  readonly payload: Uint8Array;
}

export interface MediationResult {
  readonly decision: Decision;
  /** Whether the explicit Tier-C boundary was invoked on this action. */
  readonly boundaryInvoked: boolean;
  /** The payload as delivered to the handler — byte-identical to input on the
   *  routine path (the no-data-alteration floor, ADR-007). */
  readonly payloadDelivered: Uint8Array;
}

export class Mediator {
  constructor(private readonly tiers: TierRegistry) {}

  mediate(actor: Actor, action: Action): MediationResult {
    // No reference → the action is not expressible. Absence, not a denied check.
    if (!actor.canName(action.capability)) {
      return { decision: "UNNAMEABLE", boundaryInvoked: false, payloadDelivered: action.payload };
    }

    if (this.tiers.classify(action.capability) === "C") {
      // The ~2% boundary: the explicit gate runs; interference is the point here.
      return { decision: "ALLOWED", boundaryInvoked: true, payloadDelivered: action.payload };
    }

    // Routine path: structural pass-through. No step added, payload untouched.
    return { decision: "ALLOWED", boundaryInvoked: false, payloadDelivered: action.payload };
  }
}
