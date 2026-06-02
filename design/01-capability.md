# Element 01: Capability

| Field | Value |
|---|---|
| Status | ✅ running code |
| Layers | 1–4 (representation changes per layer; semantics constant) |
| ADRs | [003](../decisions/ADR-003-invariant-language.md) (invariant language), VISION §1 (object-capability lineage) |
| Reference code | [`conformance/src/protocol/capability.ts`](../conformance/src/protocol/capability.ts) |
| Depends on | nothing (root primitive) |
| Depended on by | 02 Lease, 03 Mediation, 08 Audit, 10 Wire, 11 Token — everything |

A **capability** is an unforgeable, transferable reference that *is* the authority to perform a class of action. Holding the reference = having the authority; not holding it = the action is **unnameable**, not merely denied. This is the object-capability model (Dennis & Van Horn 1966; KeyKOS; E; Capsicum) at the root of ASHE's 50-year lineage (VISION §1). The single most important property: **authority cannot be amplified** — you can only hold, attenuate, or pass on what you were given.

---

## 1. Technology

The *semantics* are constant across layers; the *representation* hardens as enforcement deepens.

| Layer | Representation of a capability | Unforgeability mechanism |
|---|---|---|
| **1 — cooperating SDK** | An in-process object reference (branded/opaque type); a `CapabilitySet` is a closure-private map | Language module privacy: the constructor mint-token is module-scoped, so a capability cannot be constructed from outside the issuing module (see reference code) |
| **2 — runtime hook** | Same object, but the runtime's standard library (`fs`, `net`, `child_process`) will only act when handed a live reference; raw calls are intercepted | Runtime mediation: the hooked stdlib refuses ambient (referenceless) operations |
| **3 — OS mediation** | An OS handle — a file descriptor, a Capsicum capability, a seccomp-bpf-gated syscall context, a gVisor/Firecracker capability | The kernel/sandbox: an fd you were never passed is not in your descriptor table; there is no namespace in which to express the call |
| **4 — hardware root** | A cryptographically signed token, sealed to a TPM/TEE, verified by hardware before the operation is admitted | Cryptography + hardware attestation: forging requires the sealing key, which never leaves the secure element |

**Data structures (Layer 1 reference):**

- `Capability` — `{ name: string, id: string }`, constructible only via the module-private mint token.
- `CapabilityIssuer` — the trust root; the sole minter. A deployment holds exactly one logical issuer chain (delegable).
- `CapabilitySet` — an immutable `Map<name → Capability>`; the only derivation is `attenuate(allowedNames) → CapabilitySet` (subset-or-smaller). There is deliberately **no** `grant`/`union`.

**Dependencies:** SHA-256 (only at Layer 4, for token signing); nothing else at Layers 1–3.

---

## 2. Application

A capability appears at every authority boundary in ASHE:

- **Lease issuance (02)** packages a `CapabilitySet` as standing authority for a session.
- **Mediation (03)** asks one question — *does this actor hold a reference naming this action?* — and that question is the entire routine-path check.
- **Cascade attenuation (ADR-017)**: a parent agent spawning a sub-agent passes an *attenuated* set; the sub-agent structurally cannot exceed it.
- **Wire/token (10/11)**: a capability crossing a process or host boundary is serialized (Layer 1–2: by reference within a trust domain; Layer 4: as a signed token).

Canonical use cases: *a JPEG-parser agent that never holds `secret.ssh-key.read` cannot name SSH keys at all* (VISION §1); *a CI runner holds `test.run` + `build.invoke` but not `deploy.production`* (ADR-017 role templates).

---

## 3. Algorithm

### 3.1 Minting (issuance of the primitive)
Only the issuer mints. Each mint produces a fresh, distinct reference even for the same name (so identity ≠ name — two holders of "code.read" hold *different* references, which matters for revocation and provenance).

- **Invariant I1 (unforgeability):** a `Capability` exists ⟺ it was returned by `CapabilityIssuer.mint`. Enforced structurally (module-private token / OS handle table / signed token).
- **Complexity:** O(1) mint.

### 3.2 Attenuation (the only derivation)
Given a held set `S` and a requested name set `R`, produce `S' = { c ∈ S : c.name ∈ R }`.

- **Invariant I2 (no amplification):** `S' ⊆ S` always. Names in `R \ names(S)` are **silently dropped**, never created. This is what makes "a sub-actor exceeding its parent" *unconstructable* rather than *rejected* — there is no code path that adds authority.
- **Invariant I3 (monotone cascade):** attenuation composes — `attenuate(attenuate(S, R₁), R₂) = attenuate(S, R₁ ∩ R₂) ⊆ S`. A grandchild cannot re-acquire what a child dropped.
- **Complexity:** O(|S|).
- **Security property:** the maximal authority of any descendant in a spawn cascade is bounded above by the root grant, with no runtime check required to enforce the bound — the bound is structural.

### 3.3 Holding / naming check
`has(name)` is a map lookup; `holds(cap)` is an identity comparison (`set[cap.name] === cap`). The distinction matters: `has` answers nameability (used by routine mediation); `holds` answers provenance (used by audit/revocation to distinguish *this* grant from a same-named one).

- **Complexity:** O(1).

### 3.4 Layer-4 verification (when representation is a signed token)
`verify(token) → bool`: check the signature against the issuer's public key and the TPM/TEE attestation chain; check `name`, `id`, not-expired, not-revoked. Only at Layer 4 is naming a *cryptographic* check rather than a *structural* absence; this is the one layer where the routine path pays a verification cost, justified by the hardware-rooted trust it buys.

---

## 4. Pseudocode

```text
# ── Minting (issuer is the sole trust root) ──────────────────────────
MINT ← module_private_unique_token            # cannot be referenced externally

class Capability(token, name, id):
    if token ≠ MINT: raise "unforgeable: obtain from issuer"   # Invariant I1
    self.name, self.id ← name, id

class CapabilityIssuer:
    seq ← 0
    func mint(name) -> Capability:
        seq ← seq + 1
        return Capability(MINT, name, name + "#" + seq)        # fresh identity each time

# ── CapabilitySet: attenuate-only (no grant/union exists) ────────────
class CapabilitySet(caps):
    byName ← map{ c.name → c  for c in caps }

    func has(name)   -> bool:  return name in byName
    func holds(cap)  -> bool:  return byName.get(cap.name) is cap      # identity, not name
    func names()     -> list:  return keys(byName)

    func attenuate(allowed) -> CapabilitySet:                          # Invariant I2/I3
        kept ← [ byName[n] for n in byName.keys() if n in allowed ]    # subset only
        return CapabilitySet(kept)                                     # dropped names are NOT minted

# ── Layer-4 only: cryptographic naming ───────────────────────────────
func verify_token(tok, issuer_pubkey, now) -> bool:
    return  attestation_chain_valid(tok)
        and signature_valid(tok, issuer_pubkey)
        and tok.expiresAt > now
        and not revoked(tok.id)
```

---

## 5. Conformance

Exercised directly by **ADR-020 Group W (what)**:
- `W1-unnameability` — an unheld capability yields *absence* (mediation returns `UNNAMEABLE`), never a `DENIED` evaluation. (Tests I1 indirectly: there is no reference to evaluate.)
- `W2-zero-ambient-authority` — `reachableAuthorities` equals exactly the held names. (Tests no ambient surface.)
- `W3-attenuation` — a sub-actor's set ⊆ parent's. (Tests I2/I3.)

Unit-tested in [`tests/protocol/capability.test.ts`](../conformance/tests/protocol/capability.test.ts): external construction throws; distinct mints; attenuate-only; `contains` recognises subsets.

---

## 6. Failure modes & limits

- **Cannot prevent misuse *within* a held capability** (ADR-014 honest limit): if you hold `code.write`, ASHE does not judge whether a given write is wise — only that you may write. Granularity of the capability name is the only lever.
- **Identity collision is impossible by construction** (fresh `id` per mint) but **name collision is intentional** — two grants of `code.read` are distinct references with the same nameability; revocation targets `id`, nameability targets `name`.
- **Layer 1–2 unforgeability assumes an uncompromised runtime** (ADR-014 trust assumption): in-process native code that bypasses the module system can fabricate references. This is exactly why Layer 3/4 exist — at Layer 3 the fd table is the kernel's, not the process's, to forge.
- **Trust regress terminates at the issuer** (Layer 1–3) or **the hardware root** (Layer 4); ASHE does not pretend the regress is infinite (ADR-014).
