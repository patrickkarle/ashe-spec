/**
 * Intent declaration (VISION §6; ADR-017 "intent declared once, actions
 * auto-validated"). An actor declares an intent — a labelled scope of capability
 * names with a TTL — once, at a boundary. Subsequent in-scope actions reconcile
 * silently against it, which is what lets the routine path stay prompt-free
 * (frictionlessness, ADR-017 C2) without abandoning per-action accountability:
 * every action is still reconciled, just not re-approved.
 */
export interface IntentDeclaration {
  readonly label: string;
  readonly subject: string;
  readonly scope: ReadonlySet<string>;
  readonly declaredAt: number;
  readonly expiresAt: number;
}

export type Reconciliation = "in-scope" | "out-of-scope" | "expired";

export class IntentContext {
  constructor(private readonly now: () => number = () => Date.now()) {}

  /** Declare an intent over a set of capability names for `ttlMs`. */
  declare(subject: string, label: string, scope: Iterable<string>, ttlMs: number): IntentDeclaration {
    const declaredAt = this.now();
    return {
      label,
      subject,
      scope: new Set(scope),
      declaredAt,
      expiresAt: declaredAt + ttlMs,
    };
  }

  /** Reconcile an action's required capability against a declared intent. An
   *  in-scope, unexpired action needs no fresh approval; anything else escalates. */
  reconcile(intent: IntentDeclaration, capabilityName: string, at: number = this.now()): Reconciliation {
    if (at >= intent.expiresAt) return "expired";
    return intent.scope.has(capabilityName) ? "in-scope" : "out-of-scope";
  }
}
