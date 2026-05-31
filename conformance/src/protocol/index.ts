/**
 * ASHE reference protocol primitives — the embryonic reference implementation the
 * conformance suite's example adapter wraps. Object-capability core (capability),
 * principals (actor), boundary-amortized authority (lease), risk-tier scope (tier),
 * the structural interception point (mediation), tamper-evident audit-by-construction
 * (audit), and declare-once intent reconciliation (intent).
 *
 * This is intentionally small and in-memory: enough to make the weightlessness gate
 * (ADR-020) pass against a *correctly applied* implementation, and to grow into.
 */
export { Capability, CapabilityIssuer, CapabilitySet } from "./capability.js";
export { Actor } from "./actor.js";
export { type Lease, LeaseAuthority, leaseActive } from "./lease.js";
export { type Tier, TierRegistry, DEFAULT_TIER_C } from "./tier.js";
export {
  type Action,
  type Decision,
  type MediationResult,
  type MediatorOptions,
  Mediator,
} from "./mediation.js";
export { type AuditEntry, type AuditRecord, AuditLog } from "./audit.js";
export { type IntentDeclaration, type Reconciliation, IntentContext } from "./intent.js";
