# Element 02: Lease

| Field | Value |
|---|---|
| Status | ✅ issuance · 🟡 revocation (spec'd here, partial code) |
| Layers | 1–4 |
| ADRs | [017](../decisions/ADR-017-sealed-workspace-foundational-dev-pattern.md) (standing capabilities), [WEIGHTLESS.md](../WEIGHTLESS.md) (amortization), [009](../decisions/ADR-009-deployment-profiles.md) (degradation), [015](../decisions/ADR-015-validation-methodology-and-tiered-claims.md) (revocation-vs-speed trade) |
| Reference code | [`conformance/src/protocol/lease.ts`](../conformance/src/protocol/lease.ts) |
| Depends on | 01 Capability |
| Depended on by | 03 Mediation, 08 Audit, 14 Agent-side enforcement |

A **lease** binds a `CapabilitySet` to a subject for a bounded window. It is **where weight is paid** (WEIGHTLESS.md): the cost — identity validation, policy evaluation, audit, the handshake — is paid *once*, at issuance, at the boundary. The steady-state per-action path then has nothing left to check but local possession. At `N` actions per lease, per-action overhead → `boundary_cost / N` → ~0. This is the TLS handshake-vs-symmetric-crypto split generalized from bytes to actions.

The hard part of a lease is not issuance — it is **revocation**: the tension (named in [ADR-015](../decisions/ADR-015-validation-methodology-and-tiered-claims.md) and [WEIGHTLESS.md](../WEIGHTLESS.md)) between *fast local validation* (don't phone home per action) and *prompt revocation* (a withdrawn capability must stop working soon). This spec resolves it with **short TTL + epoch + revocation list at the boundary**.

---

## 1. Technology

| Layer | Lease representation | Revocation mechanism |
|---|---|---|
| **1 — SDK** | In-memory `Lease { subject, capabilities, issuedAt, expiresAt, epoch }` | Issuer holds a revocation set; checked at renewal (TTL boundary), not per action |
| **2 — runtime** | Same, plus the hooked stdlib consults the active lease | As Layer 1; renewal interval enforced by the runtime |
| **3 — OS** | Lease materialized as the process's capability/fd set at spawn; TTL = process/namespace lifetime or a refresh timer | Kernel revokes by closing fds / tearing the namespace; eBPF map update propagates an epoch bump |
| **4 — hardware** | Signed, TPM-sealed token with `expiresAt` + `epoch`; verified per sensitive op | Short TTL + signed revocation list (CRL/OCSP-style) verified at the boundary; hardware refuses expired/revoked epochs |

**Data structures:**

```
Lease       = { subject, capabilities: CapabilitySet, issuedAt, expiresAt, epoch }
LeaseAuthority = { now(), revoked: Set<capabilityId>, epoch: int }
```

**Dependencies:** a clock source (monotonic preferred); at Layer 4, the signing key + a revocation-list distribution channel.

---

## 2. Application

- **Session establishment**: an agent authenticates (Element 04 Identity), declares intent (Element 07), and receives a lease — the single boundary event for the whole session.
- **Standing capabilities (ADR-017 C2)**: the lease *is* the frictionlessness mechanism — routine in-scope actions ride the lease with no per-action prompt.
- **Cascade (ADR-017)**: a sub-agent gets a *child lease* whose capability set is attenuated and whose TTL is ≤ parent's.
- **Graceful degradation (ADR-009)**: if the issuer is unreachable, an existing unexpired lease keeps working (fail-functional for already-granted authority); a *new* lease cannot be issued (fail-closed for new authority).

---

## 3. Algorithm

### 3.1 Issuance (the amortizable boundary event)
Given holder authority `H` (the principal's full set), a requested `scope` (names), and a TTL:

```
issue(subject, H, scope, ttl):
    capabilities ← H.attenuate(scope)        # Invariant: lease ⊆ holder (no amplification)
    issuedAt ← now()
    return Lease{ subject, capabilities, issuedAt, expiresAt: issuedAt+ttl, epoch: authority.epoch }
```

- **Invariant L1:** `lease.capabilities ⊆ holder` — a lease never carries authority the subject lacked. (Follows from attenuation, Element 01 I2.)
- **Cost accounting:** all expensive work (identity check, policy eval, audit-write) happens here, *once*. Amortized per-action cost = issuance_cost / N.
- **Complexity:** O(|scope|).

### 3.2 Validation (the steady-state per-action check — must be cheap)
```
active(lease, now):
    return now ≥ lease.issuedAt
       and now <  lease.expiresAt
       and lease.epoch ≥ authority.min_valid_epoch    # epoch gate (see 3.3)
```
- **Routine path:** at Layers 1–3 this is a comparison and a possession check — **no network callout** (the WEIGHTLESS no-bandwidth/no-delay target). At Layer 4 a signature/epoch check runs (the disclosed cost of hardware-rooted trust).
- **Complexity:** O(1).

### 3.3 Revocation — resolving fast-validation vs prompt-revocation
The trade (ADR-015): you cannot have *both* zero-callout per-action validation *and* instant global revocation. ASHE chooses **bounded staleness** via three composing mechanisms:

1. **Short TTL** — a lease self-expires in `ttl` (e.g., minutes for routine, seconds for Tier-C-adjacent). Worst-case staleness ≤ `ttl`. Renewal re-checks the revocation set at the boundary, off the hot path.
2. **Epoch bump** — to revoke *everything* fast (incident response), the authority increments `min_valid_epoch`; all leases with a lower epoch fail validation at their next check. Propagation cost is one integer pushed to validators (an eBPF map write at Layer 3; a CRL field at Layer 4).
3. **Targeted revocation list** — to revoke *one* capability, add its `id` to `revoked`; consulted at renewal and (for Tier-C) at the explicit boundary.

```
revoke_one(capId):       authority.revoked.add(capId)         # effective ≤ next renewal / at Tier-C boundary
revoke_all():            authority.min_valid_epoch ← authority.epoch + 1   # effective ≤ next validation
renew(lease, scope, ttl):
    if any(c.id in authority.revoked for c in lease.capabilities): drop those c   # at the boundary
    return issue(lease.subject, current_holder_authority(lease.subject), scope, ttl)
```

- **Security property:** maximum exposure window after revocation = `min(ttl, time-to-next-validation)` for epoch revocation, and `ttl` for targeted revocation — **bounded, tunable, and disclosed**, never "instant" (which is unachievable without per-action callout) and never "never" (which is unsafe).
- **Tier-C exception:** high-stakes actions (Element 06) consult `revoked` *synchronously at the explicit boundary* — they already pay round-trip weight by design, so revocation there is immediate. The bounded-staleness window applies only to the routine path, where it belongs.

---

## 4. Pseudocode

```text
class LeaseAuthority:
    now      ← clock
    revoked  ← set()          # capability ids
    epoch    ← 0
    min_valid_epoch ← 0

    func issue(subject, holder: CapabilitySet, scope, ttl) -> Lease:        # boundary cost paid here
        t ← now()
        return Lease{ subject,
                      capabilities: holder.attenuate(scope),   # L1: ⊆ holder
                      issuedAt: t, expiresAt: t+ttl, epoch: self.epoch }

    func active(lease, t) -> bool:                                          # hot path: O(1), no callout
        return lease.issuedAt ≤ t < lease.expiresAt
           and lease.epoch ≥ self.min_valid_epoch

    func revoke_one(capId):  self.revoked.add(capId)                        # ≤ ttl staleness
    func revoke_all():       self.min_valid_epoch ← self.epoch + 1          # ≤ next-validation staleness

    func renew(lease, scope, ttl) -> Lease:                                 # off hot path
        live_holder ← holder_authority(lease.subject)
                        .attenuate([n for n in names if id_of(n) not in self.revoked])
        return issue(lease.subject, live_holder, scope, ttl)

# Tier-C synchronous revocation check (only the ~2% path pays this)
func mediate_tierC(actor, action, lease):
    if not active(lease, now()):           return UNNAMEABLE_OR_EXPIRED
    if id_of(action.cap) in revoked:        return DENIED        # immediate at the boundary
    return ALLOWED_WITH_EXPLICIT_BOUNDARY
```

---

## 5. Conformance

- **ADR-020 Group H (how)** — `active()` on the routine path must add no boundary step at Layers 1–3 (structural), and a Layer-1 implementation must *disclose* the amortized-small grade. Revocation staleness is a **disclosed** property, not a hidden one.
- Unit-tested in [`tests/protocol/lease.test.ts`](../conformance/tests/protocol/lease.test.ts): a lease carries ≤ holder authority; `leaseActive` respects the window (issue inclusive, expiry exclusive).
- **To add (revocation tests):** epoch-bump invalidates lower-epoch leases at next validation; targeted revocation drops the capability at renewal; Tier-C synchronous revocation is immediate.

---

## 6. Failure modes & limits

- **No instant global revocation without per-action callout** — physics/CAP. ASHE's answer is *bounded, disclosed staleness*, tuned by TTL per tier. This is the honest WEIGHTLESS limit, not a bug.
- **Clock dependence** — TTL relies on a clock; skew widens or narrows the window. Mitigation: monotonic clocks for validation; NTP discipline; at Layer 4, hardware time.
- **Issuer unavailability** (ADR-009 degradation): existing leases keep working until expiry (fail-functional); new issuance fails closed. A long-TTL lease is more available but less promptly revocable — the tunable trade, made explicit at issuance.
- **Renewal storms** — many short-TTL leases renewing simultaneously load the issuer. Mitigation: jittered TTLs, renewal coalescing, per-subject renewal caching.
