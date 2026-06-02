import { describe, it, expect } from "vitest";
import { Actor, CapabilityIssuer, CapabilitySet } from "../../src/protocol/index.js";

describe("Actor — cascade attenuation is structural", () => {
  const issuer = new CapabilityIssuer();
  const parent = new Actor(
    "parent",
    new CapabilitySet([issuer.mint("code.read"), issuer.mint("code.write")]),
  );

  it("a sub-actor cannot exceed the parent — excess names are simply not constructed", () => {
    const child = parent.spawn("child", ["code.read", "deploy.production"]);
    expect(child.reachableAuthorities().sort()).toEqual(["code.read"]);
    expect(child.canName("deploy.production")).toBe(false);
  });

  it("reachable authority equals exactly the held set (zero ambient)", () => {
    expect(parent.reachableAuthorities().sort()).toEqual(["code.read", "code.write"]);
  });

  it("grandchildren attenuate monotonically down the cascade", () => {
    const child = parent.spawn("child", ["code.read", "code.write"]);
    const grandchild = child.spawn("grandchild", ["code.write"]);
    expect(grandchild.reachableAuthorities()).toEqual(["code.write"]);
    // Cannot re-acquire code.read it was not handed.
    expect(grandchild.spawn("ggc", ["code.read"]).reachableAuthorities()).toEqual([]);
  });
});
