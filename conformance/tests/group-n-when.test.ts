import { describe, it, expect } from "vitest";
import { requireAdapter, type ActionDescriptor } from "../src/adapter.js";

const adapter = requireAdapter();
const group = adapter ? describe : describe.skip;

const GUARDED: ActionDescriptor = {
  id: "deploy-production",
  requiredCapability: "deploy.production",
  expectedTier: "C",
  payload: new Uint8Array([99]),
};

// ADR-020 Group N — when (at construction).
group("Group N — when (at construction)", () => {
  it("N1-construction-order: the perimeter exists before contents are reachable", () => {
    const a = adapter!;
    expect(a.perimeterEstablishedAtConstruction()).toBe(true);
  });

  it("N2-no-front-gate: disabling ASHE makes a guarded action unreachable, not merely ungated", () => {
    const a = adapter!;
    // The sharpest test of the facet: if removing the component restores direct
    // access, the boundary was a removable front gate (bolted on), not the shape.
    expect(a.guardedReachabilityWithAsheDisabled(GUARDED)).toBe("unreachable");
    expect(a.guardedReachabilityWithAsheDisabled(GUARDED)).not.toBe("reachable");
  });
});
