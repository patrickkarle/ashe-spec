/**
 * ASHE reference protocol primitives — the embryonic reference implementation the
 * conformance suite's example adapter wraps. Object-capability core (capability),
 * principals (actor), boundary-amortized authority (lease), risk-tier scope (tier),
 * and the structural interception point (mediation).
 *
 * This is intentionally small and in-memory: enough to make the weightlessness gate
 * (ADR-020) pass against a *correctly applied* implementation, and to grow into.
 */
export { Capability, CapabilityIssuer, CapabilitySet } from "./capability.js";
export { Actor } from "./actor.js";
export { type Lease, LeaseAuthority, leaseActive } from "./lease.js";
export { type Tier, TierRegistry, DEFAULT_TIER_C } from "./tier.js";
export { type Action, type Decision, type MediationResult, Mediator } from "./mediation.js";
