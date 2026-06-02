import { describe, it, expect } from "vitest";
import {
  CapabilityIssuer,
  CapabilitySet,
  LeaseAuthority,
  leaseActive,
} from "../../src/protocol/index.js";

describe("LeaseAuthority — boundary-amortized authority", () => {
  const issuer = new CapabilityIssuer();
  const holder = new CapabilitySet([
    issuer.mint("code.read"),
    issuer.mint("code.write"),
    issuer.mint("test.run"),
  ]);

  it("a lease carries at most the holder's authority, attenuated to scope", () => {
    let clock = 1_000;
    const authority = new LeaseAuthority(() => clock);
    const lease = authority.issue("session-1", holder, ["code.read", "deploy.production"], 5_000);
    // deploy.production was never held → not leasable.
    expect(lease.capabilities.names().sort()).toEqual(["code.read"]);
    expect(lease.subject).toBe("session-1");
  });

  it("leaseActive() respects the issued/expiry window", () => {
    let clock = 1_000;
    const authority = new LeaseAuthority(() => clock);
    const lease = authority.issue("session-2", holder, ["test.run"], 5_000);
    expect(leaseActive(lease, 1_000)).toBe(true);
    expect(leaseActive(lease, 5_999)).toBe(true);
    expect(leaseActive(lease, 6_000)).toBe(false); // expiry is exclusive
    expect(leaseActive(lease, 999)).toBe(false);
  });
});
