import { describe, it, expect } from "vitest";
import {
  Actor,
  AuditLog,
  CapabilityIssuer,
  CapabilitySet,
  DEFAULT_TIER_C,
  Mediator,
  TierRegistry,
} from "../../src/protocol/index.js";

describe("AuditLog — tamper-evident hash chain", () => {
  it("links records and verifies a clean chain", () => {
    const log = new AuditLog();
    log.append({ subject: "a", capability: "code.read", tier: "A", decision: "ALLOWED", boundaryInvoked: false, at: 1 });
    log.append({ subject: "a", capability: "deploy.production", tier: "C", decision: "ALLOWED", boundaryInvoked: true, at: 2 });
    expect(log.length).toBe(2);
    expect(log.verify()).toBe(true);
    expect(log.entries()[1]!.prevHash).toBe(log.entries()[0]!.hash);
    expect(log.head).toBe(log.entries()[1]!.hash);
  });

  it("detects a post-hoc edit of a sealed record", () => {
    const log = new AuditLog();
    log.append({ subject: "a", capability: "code.read", tier: "A", decision: "ALLOWED", boundaryInvoked: false, at: 1 });
    log.append({ subject: "a", capability: "secret.read", tier: "C", decision: "UNNAMEABLE", boundaryInvoked: false, at: 2 });
    // Forge: rewrite history so the UNNAMEABLE attempt reads as ALLOWED.
    (log.entries()[1] as { decision: string }).decision = "ALLOWED";
    expect(log.verify()).toBe(false);
  });
});

describe("Mediator — audit-by-construction", () => {
  const issuer = new CapabilityIssuer();
  const tiers = new TierRegistry().registerAll(DEFAULT_TIER_C, "C");
  const actor = new Actor("dev", new CapabilitySet([issuer.mint("code.write")]));
  const payload = new Uint8Array([1]);

  it("every mediation emits one record, including unnameable attempts", () => {
    let clock = 100;
    const audit = new AuditLog();
    const mediator = new Mediator(tiers, { audit, now: () => clock++ });

    mediator.mediate(actor, { capability: "code.write", payload }); // ALLOWED routine
    mediator.mediate(actor, { capability: "secret.read", payload }); // UNNAMEABLE

    expect(audit.length).toBe(2);
    expect(audit.entries()[0]!.decision).toBe("ALLOWED");
    expect(audit.entries()[1]!.decision).toBe("UNNAMEABLE");
    expect(audit.verify()).toBe(true);
  });

  it("is opt-in: no audit log means no recording, decisions unchanged", () => {
    const mediator = new Mediator(tiers);
    expect(mediator.mediate(actor, { capability: "code.write", payload }).decision).toBe("ALLOWED");
  });
});
