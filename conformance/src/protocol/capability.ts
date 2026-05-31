/**
 * Object-capability primitive (VISION §1; ADR-003 invariant language).
 *
 * A capability is an *unforgeable* reference. Authority is the reference itself:
 * you hold it or you do not. There is no ambient table to consult, and there is no
 * way to fabricate a capability from outside this module — the only path to one is
 * being handed it by a `CapabilityIssuer`. This is what makes an unauthorized action
 * *unnameable* rather than *denied*: an actor without the reference has nothing to
 * invoke, so there is no check to run (WEIGHTLESS.md, "structural, not procedural").
 */

/** Module-private mint token. `new Capability(...)` from outside this module throws,
 *  so capabilities cannot be forged — only issued. */
const MINT: unique symbol = Symbol("ashe.capability.mint");

export class Capability {
  /** @internal — use {@link CapabilityIssuer.mint}. */
  constructor(
    token: symbol,
    public readonly name: string,
    public readonly id: string,
  ) {
    if (token !== MINT) {
      throw new Error(
        "capabilities are unforgeable: obtain one from a CapabilityIssuer, do not construct it",
      );
    }
  }
}

/** The sole legitimate source of capabilities. A deployment holds an issuer at the
 *  trust root; everything downstream receives references, never the mint. */
export class CapabilityIssuer {
  private seq = 0;
  mint(name: string): Capability {
    this.seq += 1;
    return new Capability(MINT, name, `${name}#${this.seq}`);
  }
}

/**
 * An immutable bundle of held capabilities. The only derivation operation is
 * {@link attenuate} — you can drop authority, never add it. There is deliberately
 * no `union`/`grant` method: amplification is not expressible, which is the
 * cascade-attenuation invariant (ADR-017) made structural rather than checked.
 */
export class CapabilitySet {
  private readonly byName: ReadonlyMap<string, Capability>;

  constructor(caps: Iterable<Capability> = []) {
    const m = new Map<string, Capability>();
    for (const c of caps) m.set(c.name, c);
    this.byName = m;
  }

  /** True iff a capability with this name is held. */
  has(name: string): boolean {
    return this.byName.has(name);
  }

  /** True iff this exact capability reference is held (identity, not name). */
  holds(cap: Capability): boolean {
    return this.byName.get(cap.name) === cap;
  }

  names(): string[] {
    return [...this.byName.keys()];
  }

  get size(): number {
    return this.byName.size;
  }

  /** Derive a strictly-not-larger set keeping only the named capabilities that are
   *  already held. Names not held are silently dropped — you cannot attenuate
   *  *upward* into authority you never had. */
  attenuate(allowedNames: Iterable<string>): CapabilitySet {
    const allow = new Set(allowedNames);
    const kept: Capability[] = [];
    for (const [name, cap] of this.byName) {
      if (allow.has(name)) kept.push(cap);
    }
    return new CapabilitySet(kept);
  }

  /** True iff every capability in `other` is held here (identity-wise). */
  contains(other: CapabilitySet): boolean {
    for (const name of other.names()) {
      const here = this.byName.get(name);
      if (!here || !other.holds(here)) return false;
    }
    return true;
  }
}
