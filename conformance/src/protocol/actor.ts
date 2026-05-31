/**
 * An actor is a principal that holds a {@link CapabilitySet} and nothing ambient.
 * Its entire authority is the set it holds; `spawn` can only hand a child a subset
 * (cascade attenuation, ADR-017), because {@link CapabilitySet.attenuate} cannot
 * amplify. A sub-actor exceeding its parent is therefore not "rejected" — it is
 * unconstructable.
 */
import { CapabilitySet } from "./capability.js";

export class Actor {
  constructor(
    public readonly id: string,
    public readonly capabilities: CapabilitySet,
  ) {}

  /** Does this actor hold a reference by which `capabilityName` can be named? */
  canName(capabilityName: string): boolean {
    return this.capabilities.has(capabilityName);
  }

  /** Every authority reachable by this actor — exactly the held set, nothing more.
   *  There is no ambient surface from which to recover anything else. */
  reachableAuthorities(): string[] {
    return this.capabilities.names();
  }

  /** Spawn a sub-actor holding at most the named subset of this actor's authority. */
  spawn(childId: string, allowedNames: Iterable<string>): Actor {
    return new Actor(childId, this.capabilities.attenuate(allowedNames));
  }
}
