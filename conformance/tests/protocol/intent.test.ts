import { describe, it, expect } from "vitest";
import { IntentContext } from "../../src/protocol/index.js";

describe("IntentContext — declare once, reconcile silently", () => {
  it("in-scope actions reconcile without escalation", () => {
    let clock = 0;
    const ctx = new IntentContext(() => clock);
    const intent = ctx.declare("dev", "auth refactor", ["code.read", "code.write", "test.run"], 3_600_000);
    expect(ctx.reconcile(intent, "code.write", 1_000)).toBe("in-scope");
    expect(ctx.reconcile(intent, "test.run", 1_000)).toBe("in-scope");
  });

  it("out-of-scope actions escalate rather than ride the declaration", () => {
    let clock = 0;
    const ctx = new IntentContext(() => clock);
    const intent = ctx.declare("dev", "auth refactor", ["code.read", "code.write"], 3_600_000);
    expect(ctx.reconcile(intent, "deploy.production", 1_000)).toBe("out-of-scope");
  });

  it("an expired declaration no longer covers even in-scope actions", () => {
    let clock = 0;
    const ctx = new IntentContext(() => clock);
    const intent = ctx.declare("dev", "auth refactor", ["code.write"], 5_000);
    expect(ctx.reconcile(intent, "code.write", 4_999)).toBe("in-scope");
    expect(ctx.reconcile(intent, "code.write", 5_000)).toBe("expired");
  });
});
