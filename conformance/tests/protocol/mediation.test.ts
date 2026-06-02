import { describe, it, expect } from "vitest";
import {
  Actor,
  CapabilityIssuer,
  CapabilitySet,
  DEFAULT_TIER_C,
  Mediator,
  TierRegistry,
} from "../../src/protocol/index.js";

const issuer = new CapabilityIssuer();
const tiers = new TierRegistry().registerAll(DEFAULT_TIER_C, "C");
const mediator = new Mediator(tiers);

const dev = new Actor(
  "dev",
  new CapabilitySet([issuer.mint("code.write"), issuer.mint("deploy.production")]),
);

const payload = new Uint8Array([7, 8, 9]);

describe("Mediator — structural routine path, explicit Tier-C boundary", () => {
  it("routine (Tier A) held action: allowed, no boundary step, payload untouched", () => {
    const r = mediator.mediate(dev, { capability: "code.write", payload });
    expect(r.decision).toBe("ALLOWED");
    expect(r.boundaryInvoked).toBe(false);
    expect(Array.from(r.payloadDelivered)).toEqual(Array.from(payload));
  });

  it("Tier-C held action: allowed, but the explicit boundary is invoked", () => {
    const r = mediator.mediate(dev, { capability: "deploy.production", payload });
    expect(r.decision).toBe("ALLOWED");
    expect(r.boundaryInvoked).toBe(true);
  });

  it("unheld capability is UNNAMEABLE, never DENIED (absence, not a denied check)", () => {
    const r = mediator.mediate(dev, { capability: "secret.read", payload });
    expect(r.decision).toBe("UNNAMEABLE");
    expect(r.decision).not.toBe("DENIED");
    expect(r.boundaryInvoked).toBe(false);
  });
});
