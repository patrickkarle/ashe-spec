# Element 03: Mediation

| Field | Value |
|---|---|
| Status | ✅ running code |
| Layers | 1–4 (the *placement* of the interception point is the layer; the decision logic is constant) |
| ADRs | [007](../decisions/ADR-007-interception-chain-pattern.md) (interception chain), [008](../decisions/ADR-008-validation-graph-tiny-onnx.md)/[010](../decisions/ADR-010-standalone-graph-engine.md) (the decision engine), [014](../decisions/ADR-014-phased-enforcement-model.md) (where the point sits per layer), [020](../decisions/ADR-020-weightlessness-proper-application-conformance.md) (the structural-vs-procedural gate) |
| Reference code | [`conformance/src/protocol/mediation.ts`](../conformance/src/protocol/mediation.ts) |
| Depends on | 01 Capability, 02 Lease, 06 Tier |
| Depended on by | every enforced action; 08 Audit (records each decision) |

**Mediation** is the interception point where an attempted action meets ASHE. Its defining property (ADR-020): on the routine path the decision was *already made* when the capability was granted, so mediation **passes through with no boundary step and the payload untouched**; the explicit boundary runs *only* at the ~2% Tier-C path where interference is the intended function. An action whose capability the actor does not hold is **`UNNAMEABLE`** — an absence, never a `DENIED` evaluation (which would betray that the action was nameable and a check ran).

---

## 1. Technology

Mediation is the *same decision* placed at progressively lower substrates (this is precisely the ADR-014 layer trajectory):

| Layer | Where the interception point physically sits | What it can mediate |
|---|---|---|
| **1 — SDK** | In the ASHE library call path / cooperating IPC boundary ([ADR-007](../decisions/ADR-007-interception-chain-pattern.md) is the Layer-1 mechanism) | Cooperating calls; bypassed by raw OS calls |
| **2 — runtime** | Hooked stdlib (`fs.write`, `child_process.spawn`, `http.request` → ASHE) | All code in the runtime, adopted or not |
| **3 — OS** | Syscall mediation — eBPF/LSM (Linux), seccomp-bpf, gVisor/Firecracker sandbox boundary | Every syscall; bounds arbitrary in-process compromise |
| **4 — hardware** | Sensitive ops gated by hardware token verification | + protection against a compromised kernel for those ops |

The decision logic that runs *at* the point is identical at every layer — a `Mediator` over a `TierRegistry`, optionally driving a **validation graph** (Elements 05/06) for non-trivial evaluators and writing to an **audit log** (Element 08). The interception-chain contract ([ADR-007](../decisions/ADR-007-interception-chain-pattern.md)) requires the point be **idempotent with no dispatch-state mutation** — it decides, it never rewrites (this is the WEIGHTLESS *no-data-alteration* floor).

---

## 2. Application

- **Routine path (~98%, Tier A/B):** the vast majority of agent actions — file reads/writes in scope, test runs, in-scope network fetches — pass through structurally. This is where weightlessness lives.
- **Tier-C boundary (~2%):** production deploy, secret access, capability escalation, irreversible destruction — the explicit gate runs (synchronous revocation check per Element 02 §3.3, possible human/multi-party approval, full audit).
- **Unnameable attempts:** an injected/compromised agent reaching for authority it was never leased gets *absence* — and the attempt is still audited (Element 08), turning prompt-injection probes into high-signal audit events.

---

## 3. Algorithm

### 3.1 The core decision (constant across layers)
```
mediate(actor, action) -> (decision, boundaryInvoked, payloadDelivered):
    tier ← TierRegistry.classify(action.capability)

    if not actor.canName(action.capability):           # Element 01 has()
        decision, boundaryInvoked ← UNNAMEABLE, false  # absence, not a check
    else if tier == C:
        decision, boundaryInvoked ← evaluate_boundary(actor, action), true
    else:
        decision, boundaryInvoked ← ALLOWED, false      # routine: structural pass-through

    audit?.append(record(actor, action, tier, decision, boundaryInvoked))   # local, off critical path
    return (decision, boundaryInvoked, action.payload)   # payload byte-identical (no-data-alteration)
```

- **Invariant M1 (no false denial on the routine path):** if the capability is held and tier ≠ C, the result is `ALLOWED` with `boundaryInvoked = false`. No evaluation runs. (ADR-020 Group H.)
- **Invariant M2 (absence, not denial):** unheld ⇒ `UNNAMEABLE`, never `DENIED`. `DENIED` is reserved for *held-but-revoked-at-the-Tier-C-boundary* (Element 02). (ADR-020 Group W.)
- **Invariant M3 (no mutation):** `payloadDelivered ≡ action.payload`, bytewise. (ADR-007 idempotence; WEIGHTLESS no-data-alteration.)
- **Complexity:** routine path O(1) (a classify + a possession check); Tier-C path = cost of `evaluate_boundary` (the only place a validation graph / approval / callout runs).

### 3.2 The Tier-C boundary evaluator
`evaluate_boundary` is where the validation graph (Element 05) runs: lease still active? capability not revoked (synchronous, Element 02 §3.3)? intent reconciles (Element 07)? anomaly score below threshold (Element 06)? multi-party approval satisfied? Each is a node; the graph short-circuits on first deny. This is the *only* path that pays for these checks — concentrating weight where interference is the point (ADR-020 *where* facet).

### 3.3 The interception-chain contract (ADR-007)
The point is one link in an ordered chain of interceptors (audit, policy, rate-limit, …). Contract: each interceptor is **idempotent**, **must not mutate dispatch state**, and either passes the action along or short-circuits with a decision. The chain is the extension model — new concerns (e.g., a compliance interceptor) are added as links without touching the core.

---

## 4. Pseudocode

```text
class Mediator:
    tiers : TierRegistry
    audit : AuditLog?          # optional; local append
    graph : ValidationGraph?   # optional; only consulted at Tier C

    func mediate(actor, action) -> MediationResult:
        tier ← tiers.classify(action.capability)

        if not actor.canName(action.capability):
            res ← { ALLOWED?:no, decision: UNNAMEABLE, boundaryInvoked: false }   # M2
        elif tier == C:
            res ← { decision: self.evaluate_boundary(actor, action),
                    boundaryInvoked: true }                                        # the 2%
        else:
            res ← { decision: ALLOWED, boundaryInvoked: false }                    # M1: structural

        res.payloadDelivered ← action.payload                                      # M3: untouched
        if self.audit:  self.audit.append({ actor.id, action.capability, tier,
                                            res.decision, res.boundaryInvoked, now() })
        return res

    func evaluate_boundary(actor, action) -> Decision:        # only path that pays
        if not lease_active(actor.lease, now()):       return EXPIRED
        if id_of(action.capability) in revoked:        return DENIED      # synchronous (Element 02)
        if self.graph and not self.graph.eval(actor, action): return DENIED
        if requires_approval(action) and not approval_satisfied(action):  return DENIED
        return ALLOWED
```

---

## 5. Conformance

The element most directly tied to **ADR-020**, across three groups:
- **Group H (how)** — `H1-no-added-step` (routine path interposes nothing at a structural layer), `H2-byte-identity` (M3), `H3-layer-disclosure` (Layer-1 procedural mediation must disclose amortized-small).
- **Group W (what)** — `W1-unnameability` (M2: `UNNAMEABLE`, never `DENIED`).
- **Group R (where)** — `R2-no-uniform-enforcement` (routine incurs no round-trip/token/prompt; Tier-C does invoke the boundary).
- Unit-tested in [`tests/protocol/mediation.test.ts`](../conformance/tests/protocol/mediation.test.ts): routine allowed w/ no boundary + payload intact; Tier-C allowed w/ boundary invoked; unheld ⇒ `UNNAMEABLE` ≠ `DENIED`.

---

## 6. Failure modes & limits

- **Layer-1 mediation is bypassable by non-cooperating code** (ADR-014): raw OS calls skip the SDK point. Mitigation is *layer*, not logic — Layer 2 catches runtime code, Layer 3 catches syscalls. The decision logic is unchanged; only the point moves lower.
- **Cannot mediate what it cannot observe** (ADR-014 honest limit): in-memory state mutations with no syscall/stdlib touch are invisible at all layers — physics.
- **The Tier-C boundary is a genuine latency cost** — and is *supposed* to be: it is the deliberate-weight ~2% (ADR-020 *where*). Misclassifying a routine action as Tier-C is a weightlessness regression caught by Group R; misclassifying Tier-C as routine is a *security* regression caught by tier-classification review (Element 06).
- **Idempotence is a contract, not a guarantee against buggy interceptors** — a non-conformant interceptor that mutates dispatch state violates ADR-007; the conformance suite's byte-identity test (H2) is the detector.
