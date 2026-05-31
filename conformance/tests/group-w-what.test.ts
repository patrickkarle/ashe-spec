import { describe, it, expect } from "vitest";
import { requireAdapter, type ActionDescriptor } from "../src/adapter.js";

const adapter = requireAdapter();
const group = adapter ? describe : describe.skip;

const SSH: ActionDescriptor = {
  id: "read-ssh-key",
  requiredCapability: "secret.ssh-key.read",
  expectedTier: "C",
  payload: new Uint8Array([1, 2, 3]),
};
const READ: ActionDescriptor = {
  id: "read-source",
  requiredCapability: "code.read",
  expectedTier: "A",
  payload: new Uint8Array([4, 5, 6]),
};

// ADR-020 Group W — what (object-capability primitive).
group("Group W — what (object-capability primitive)", () => {
  it("W1-unnameability: an unauthorized action is UNNAMEABLE, never DENIED", () => {
    const a = adapter!;
    // A JPEG-parser-like actor holds the read capability but never the SSH-key one.
    const actor = a.makeActor([READ.requiredCapability]);
    expect(a.canName(actor, SSH)).toBe(false);
    // The load-bearing assertion: absence, not denial. A denial decision means the
    // action was nameable and evaluated — that is procedural, and fails the facet.
    expect(a.invoke(actor, SSH)).toBe("UNNAMEABLE");
    expect(a.invoke(actor, SSH)).not.toBe("DENIED");
  });

  it("W2-zero-ambient-authority: reachable authority equals exactly the granted set", () => {
    const a = adapter!;
    const grants = [READ.requiredCapability];
    const actor = a.makeActor(grants);
    const reachable = a.reachableAuthorities(actor).sort();
    expect(reachable).toEqual([...grants].sort());
  });

  it("W3-attenuation: a sub-actor cannot exceed the granting actor", () => {
    const a = adapter!;
    const parent = a.makeActor([READ.requiredCapability]);
    // Attempt to grant the child more than the parent holds.
    const child = a.spawnSubActor(parent, [
      READ.requiredCapability,
      SSH.requiredCapability,
    ]);
    const parentSet = new Set(a.reachableAuthorities(parent));
    for (const cap of a.reachableAuthorities(child)) {
      expect(parentSet.has(cap)).toBe(true);
    }
  });
});
