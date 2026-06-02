/**
 * Lease issuance — where weight is paid (WEIGHTLESS.md amortization; ADR-017
 * standing capabilities). A lease binds a set of standing capabilities to a subject
 * for a bounded window. The cost (validation, audit, the boundary handshake) is paid
 * once here, at the boundary; the steady-state per-action path then has nothing left
 * to check. At N actions per lease, per-action overhead trends to boundary_cost / N.
 */
import { CapabilitySet } from "./capability.js";

export interface Lease {
  readonly subject: string;
  readonly capabilities: CapabilitySet;
  readonly issuedAt: number;
  readonly expiresAt: number;
}

export function leaseActive(lease: Lease, now: number): boolean {
  return now >= lease.issuedAt && now < lease.expiresAt;
}

/**
 * Issues leases by attenuating an actor's held authority down to a requested scope.
 * A lease can never carry authority the subject did not already hold — issuance is
 * attenuating, never amplifying.
 */
export class LeaseAuthority {
  constructor(private readonly now: () => number = () => Date.now()) {}

  /** Issue a lease over `scopeNames` (intersected with what `holder` holds) for
   *  `ttlMs`. This is the amortizable boundary event; everything downstream is free. */
  issue(
    subject: string,
    holder: CapabilitySet,
    scopeNames: Iterable<string>,
    ttlMs: number,
  ): Lease {
    const issuedAt = this.now();
    return {
      subject,
      capabilities: holder.attenuate(scopeNames),
      issuedAt,
      expiresAt: issuedAt + ttlMs,
    };
  }
}
