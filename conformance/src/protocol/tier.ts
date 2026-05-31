/**
 * Risk-tier classification (ADR-017 C2; WEIGHTLESS.md "concentrated scope").
 *
 * Tier A (~90%) and B (~8%) are the routine path — literal-zero, structural.
 * Tier C (~2%) is the deliberate-weight boundary (production deploy, secret access,
 * capability escalation, irreversible destruction) where interference is the
 * intended function. The whole weightlessness discipline is making A/B cover the
 * dominant path and concentrating cost at C.
 */
export type Tier = "A" | "B" | "C";

/** Maps a capability name to its tier. Unregistered names default to the routine
 *  path (Tier A): a capability is only "heavy" if explicitly declared so. */
export class TierRegistry {
  private readonly byName = new Map<string, Tier>();

  /** Register one capability name at a tier. Returns `this` for chaining. */
  register(name: string, tier: Tier): this {
    this.byName.set(name, tier);
    return this;
  }

  /** Register many names at one tier. */
  registerAll(names: Iterable<string>, tier: Tier): this {
    for (const n of names) this.register(n, tier);
    return this;
  }

  classify(capabilityName: string): Tier {
    return this.byName.get(capabilityName) ?? "A";
  }

  /** True iff the capability is on the routine (literal-zero) path. */
  isRoutine(capabilityName: string): boolean {
    return this.classify(capabilityName) !== "C";
  }
}

/** A conventional Tier-C default set for developer-workflow deployments (ADR-017
 *  names exactly these as the high-stakes operations). */
export const DEFAULT_TIER_C: readonly string[] = [
  "secret.read",
  "secret.ssh-key.read",
  "deploy.staging",
  "deploy.production",
  "capability.escalate",
  "fs.destroy",
];
