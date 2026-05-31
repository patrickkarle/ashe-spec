import { describe, it, expect } from "vitest";
import { requireAdapter, type ActionDescriptor } from "../src/adapter.js";

const adapter = requireAdapter();
const group = adapter ? describe : describe.skip;

const ROUTINE: ActionDescriptor = {
  id: "run-tests",
  requiredCapability: "test.run",
  expectedTier: "A",
  payload: new Uint8Array([1]),
};
const TIER_C: ActionDescriptor = {
  id: "read-secret",
  requiredCapability: "secret.read",
  expectedTier: "C",
  payload: new Uint8Array([2]),
};

// A representative routine workload for the friction-frequency measurement.
const WORKLOAD: ActionDescriptor[] = Array.from({ length: 100 }, (_, i) => ({
  id: `routine-${i}`,
  requiredCapability: "code.read",
  expectedTier: "A" as const,
  payload: new Uint8Array([i & 0xff]),
}));

// ADR-020 Group R — where (concentrated scope).
group("Group R — where (concentrated scope)", () => {
  it("R1-path-classification: routine and Tier C are classified distinctly", () => {
    const a = adapter!;
    expect(a.classifyTier(ROUTINE)).not.toBe("C");
    expect(a.classifyTier(TIER_C)).toBe("C");
  });

  it("R2-no-uniform-enforcement: the 98% is not gated like the 2%", () => {
    const a = adapter!;
    const routine = a.costProfile(ROUTINE);
    expect(routine.roundTrip).toBe(false);
    expect(routine.addedTokens).toBe(0);
    expect(routine.humanPrompt).toBe(false);

    // The Tier C boundary, by contrast, DOES invoke the explicit boundary —
    // interference there is the intended function, not a violation.
    const tierC = a.costProfile(TIER_C);
    expect(tierC.roundTrip || tierC.humanPrompt).toBe(true);
  });

  it("R3-friction-frequency: routine-path prompt frequency stays below the declared threshold", () => {
    const a = adapter!;
    expect(a.routinePromptFrequency(WORKLOAD)).toBeLessThan(a.promptFrequencyThreshold());
  });
});
