import { describe, it, expect } from "vitest";
import { Capability, CapabilityIssuer, CapabilitySet } from "../../src/protocol/index.js";

describe("Capability — unforgeability", () => {
  it("cannot be constructed from outside the module (no mint token)", () => {
    // The mint token is module-private, so any externally-supplied symbol is rejected
    // at runtime — capabilities can only be issued, never forged.
    expect(() => new Capability(Symbol("fake"), "deploy.production", "x")).toThrow(/unforgeable/);
  });

  it("an issuer mints distinct references even for the same name", () => {
    const issuer = new CapabilityIssuer();
    const a = issuer.mint("code.read");
    const b = issuer.mint("code.read");
    expect(a).not.toBe(b);
    expect(a.id).not.toEqual(b.id);
  });
});

describe("CapabilitySet — attenuation only, never amplification", () => {
  const issuer = new CapabilityIssuer();
  const read = issuer.mint("code.read");
  const write = issuer.mint("code.write");
  const set = new CapabilitySet([read, write]);

  it("has() reflects held names", () => {
    expect(set.has("code.read")).toBe(true);
    expect(set.has("secret.read")).toBe(false);
  });

  it("holds() is identity-based, not name-based", () => {
    const impostor = issuer.mint("code.read");
    expect(set.holds(read)).toBe(true);
    expect(set.holds(impostor)).toBe(false);
  });

  it("attenuate() can only drop authority, never add it", () => {
    const narrowed = set.attenuate(["code.read", "secret.read"]);
    expect(narrowed.names().sort()).toEqual(["code.read"]); // secret.read was never held
    expect(narrowed.size).toBe(1);
  });

  it("contains() recognises a strict attenuation as a subset", () => {
    const narrowed = set.attenuate(["code.read"]);
    expect(set.contains(narrowed)).toBe(true);
    expect(narrowed.contains(set)).toBe(false);
  });
});
