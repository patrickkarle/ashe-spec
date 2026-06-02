import { describe, it, expect } from "vitest";
import { requireAdapter, type ActionDescriptor } from "../src/adapter.js";

const adapter = requireAdapter();
const group = adapter ? describe : describe.skip;

const ROUTINE: ActionDescriptor = {
  id: "write-source",
  requiredCapability: "code.write",
  expectedTier: "A",
  payload: new Uint8Array([10, 20, 30, 40]),
};

// ADR-020 Group H — how (structural mechanism).
group("Group H — how (structural mechanism)", () => {
  it("H1-no-added-step: no ASHE evaluation step on the routine path when claiming structural", () => {
    const a = adapter!;
    const layer = a.routinePathLayer();
    const { stepInterposed } = a.routineActionTrace(ROUTINE);
    if (layer >= 2) {
      // Structural claim (Layer 2/3/4): the substrate is the boundary, no added step.
      expect(stepInterposed).toBe(false);
    } else {
      // Layer 1 is procedural by construction; honesty is enforced by H3, not here.
      expect(layer).toBe(1);
    }
  });

  it("H2-byte-identity: routine payload arrives byte-identical to the unmediated baseline", () => {
    const a = adapter!;
    const { payloadDelivered } = a.routineActionTrace(ROUTINE);
    const baseline = a.unmediatedBaselinePayload(ROUTINE);
    expect(Array.from(payloadDelivered)).toEqual(Array.from(baseline));
  });

  it("H3-layer-disclosure: a procedural (Layer 1) routine path must not claim literal-zero", () => {
    const a = adapter!;
    if (a.routinePathLayer() === 1) {
      expect(a.declaredGrade("no-delay")).toBe("amortized-small");
      expect(a.declaredGrade("no-bandwidth")).toBe("amortized-small");
    } else {
      // Structural layers may legitimately claim literal-zero; nothing to disclose.
      expect(["literal-zero", "amortized-small"]).toContain(a.declaredGrade("no-delay"));
    }
  });
});
