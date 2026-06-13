# ADR-014: "ASHE as door" — phased enforcement model

| Field | Value |
|-------|-------|
| Status | Accepted |
| Date | 2026-05-25 |
| Decider | PK + Claude |
| Touches | reference-arch (primary), protocol (commits, protocol-side enforcement layer) |
| Cited by | Forthcoming Tier 1, Tier 2, Tier 3 artifacts |

## Context

A central architectural property of ASHE is that **every action affecting state goes through ASHE-mediated capability authorization**. The aspirational form: "the door of ASHE" — no software change, no system mutation, no agent action happens without ASHE evaluation.

The implementation reality is that enforcement strength depends on which layer enforces. A cooperating SDK enforces against cooperating clients but not against adversarial code; runtime mediation enforces against all code in the runtime but not against kernel-level compromise; hardware-rooted enforcement is the strongest but most expensive.

This ADR commits ASHE to a **phased enforcement progression** that delivers progressively stronger enforcement guarantees while honestly naming what each phase can and cannot claim.

## Decision

**ASHE's enforcement is structured as four discrete layers, each strictly stronger than the prior. The protocol design accommodates all four; implementations progress through them over time according to their needs and capabilities.**

| Layer | Mechanism | What it catches | What slips through | Trust assumption |
|-------|-----------|-----------------|--------------------|-----------------|
| **1. Cooperating SDK** | Apps voluntarily use ASHE-API for capability-mediated actions; clients import ASHE library; calls go through capability tokens | Bugs in cooperating apps; misconfigured policies; mistakes by well-meaning developers; agent actions in cooperating frameworks | Adversarial code that calls raw OS APIs directly; deliberately bypassing the SDK | App developer cooperates; SDK is correctly imported; SDK is uncompromised |
| **2. Language-runtime hook** | Language runtime (Node, Python, JVM, etc.) routes relevant operations through ASHE — e.g., `fs.write` redirected through capability check; ASHE-aware standard libraries | All code running in the hooked runtime, including code that didn't intentionally adopt ASHE | Native code that escapes the runtime; FFI calls; subprocess spawning to unwrapped runtimes | Runtime vendor cooperates; runtime hooks are correct; hooks aren't bypassable from within the runtime |
| **3. OS-level mediation** | All syscalls mediated through ASHE — every kernel transition; capability check per file open, network connect, process spawn; via eBPF on Linux, ETW/syscall hooks on Windows, capability-restricted sandboxes (gVisor, Firecracker) | Every observable action the OS knows about; structurally bounds blast radius of arbitrary in-process compromise | Kernel-level zero-day allowing privilege escalation; hypervisor escape | OS kernel is trusted + mediation hooks are correct + hooks cannot be bypassed without breaking the kernel |
| **4. Hardware-rooted** | TPM / TEE / SGX-style hardware enforcement; capability tokens cryptographically verified by hardware; attestation chains | Everything in layer 3 + protection against compromised OS kernels for the most sensitive operations | Hardware vulnerabilities (Spectre/Meltdown-class); physical attack; supply-chain compromise of hardware itself | Hardware vendor + chip fab are trusted; hardware attestation is sound |

(A theoretical Layer 5 — formally-verified microkernel mediating ASHE itself, seL4 model — exists as the asymptotic limit; ASHE doesn't currently target this but its architecture doesn't preclude it.)

**Progression commitment** — ASHE's reference implementation progresses through layers over time:

| ASHE version | Enforcement layer reached | Honest claim ASHE can make |
|--------------|--------------------------|----------------------------|
| **v0 (Phase 3a foundation, complete)** | Layer 1 capability-token issuance + scope-check; ASHE DM exists but not registered | "ASHE exists in code form" — not a security claim |
| **v1 (Phase 3b-3c, in-design)** | Layer 1 fully active; cooperating IPC traffic gated; intent reconciliation evaluators | "Cooperating IPC traffic is gated; bypassing the IPC layer bypasses ASHE" |
| **v2-v3** | Layer 2 via SDK adapters (Node.js wrappers; eventually Python, Rust, Go SDKs); tier-2 LLM evaluators | "All code using the ASHE SDK is mediated; non-SDK code bypasses; structured execution failure detection" |
| **v4-v5** | Layer 3 runtime mediation; sandbox infrastructure (gVisor/Firecracker integration) | "All syscalls from controlled processes go through ASHE; vulnerability impact bounded to capability set; uncooperating code structurally contained" |
| **v6+** | Layer 4 hardware-rooted (TPM attestation, signed capability tokens verified by hardware) | "Mediation is hardware-anchored; capability boundaries cryptographically enforced; trust base reduces to hardware root + protocol implementation" |

**Each layer's claims are explicitly bounded by what that layer can structurally guarantee.** Marketing-language conflation across layers ("ASHE is unbypassable") is forbidden; each version states what it actually does.

**Honest acknowledgment of limits** (from challenges raised during the May 2026 conversation):

- ASHE cannot detect arbitrary in-memory state changes (physics)
- ASHE cannot prevent attacks within an authorized capability set (definition)
- ASHE cannot make vulnerabilities disappear (impossible)
- ASHE cannot prevent collusion among multiple authorized parties
- ASHE cannot stop perfectly-baseline-mimicking attacks
- ASHE cannot eliminate the trust regress (must terminate somewhere)

What ASHE CAN claim, by layer:

- **Cooperating tier** — accidental misuse caught at the protocol boundary; intent-vs-action mismatches detected; capability scope limits well-intentioned mistakes
- **SDK tier** — cooperating ecosystems get protection automatically; framework adopters benefit transparently
- **Runtime tier** — adversarial code containment via syscall mediation; vulnerability blast-radius bounded by capability scope regardless of code correctness
- **Hardware tier** — cryptographic enforcement; capability tokens unforgeable; protection against compromised OS

## Consequences

**What becomes easier**:

- Marketing/positioning is honest — every claim is bounded by which layer is deployed
- Adopters can progress through layers as their needs grow; ASHE doesn't require Layer 4 commitment to derive Layer 1 value
- The protocol design is layer-agnostic — same operations, same capability tokens, same audit records work at all four layers; what varies is enforcement strength
- Refuters can't catch ASHE in overclaim because claims explicitly state their enforcement layer
- Mixed deployments are coherent — sensitive operations at Layer 3+, mundane operations at Layer 1, all within the same ASHE ecosystem

**What becomes harder**:

- Documentation burden — every public claim must specify which enforcement layer it refers to
- Adopters with weak threat models may overestimate what their layer protects against (mitigated by clear per-layer claims)
- Progress through layers is non-trivial work — runtime mediation (Layer 3) requires substantial OS-integration effort

**What becomes possible**:

- ASHE deployable across a spectrum from "lightweight SDK for cooperating developers" to "hardware-anchored capability enforcement for high-stakes environments"
- Long-term progression toward "agentic web with capability-mediated state changes structurally enforced at every layer"
- Honest positioning that earns trust rather than over-promising
- Coexistence with existing security infrastructure — ASHE Layer 3 leverages eBPF / LSMs / sandbox tools that exist; ASHE Layer 4 leverages TPM / TEE that exist

**What becomes impossible** (intentionally):

- Claiming "ASHE prevents X" without specifying which layer is required for that protection
- Selling Layer 1 as if it were Layer 4
- Hiding the trust regress — the regress is acknowledged structurally

## Alternatives Considered

**1. Single enforcement model from day one (e.g., immediately commit to Layer 3).** Rejected because:
- Bootstrapping requires Layer 1 to validate the protocol design before investing in Layer 3 runtime integration
- Layer 3 work (eBPF for Linux, ETW for Windows, sandboxes everywhere) is substantial; can't be v1
- Forces all deployments to high-investment commitment; locks out the lightweight-cooperating use case that's where many adopters start

**2. Skip Layer 1 cooperating model; go straight to Layer 3 runtime mediation.** Rejected because:
- Validates nothing about the protocol design; could ship Layer 3 enforcement of a wrong protocol
- Massive engineering investment before demonstrating protocol value
- Layer 1 cooperating model is what enables the "agent vendors and site operators adopt without OS-level integration" adoption path

**3. Don't acknowledge enforcement-layer limits publicly.** Rejected because:
- Hostile readers will discover and exploit the lack of limit-naming; better to name them proactively
- Standards work demands honesty about scope; overclaiming destroys credibility
- The honest framing is also the architecturally accurate framing

**4. Frame enforcement as binary (enforced / not enforced) rather than layered.** Rejected because:
- Doesn't match reality; real enforcement is always layered
- Forces every deployment to top tier or no protection, which fits neither the small-deployment nor large-deployment use case
- Loses the "progress through layers as you grow" adoption story

## Related decisions

- ADR-007 — Interception-chain pattern (compatible; the IPC interception hook IS the Layer 1 mechanism)
- ADR-008 — Validation graph (compatible; evaluator graph is Layer 1; runs at all layers as the decision engine)
- ADR-009 — Deployment profiles (compatible; profiles describe evaluator tiers; enforcement layer is orthogonal but typically correlated)
- ADR-012 — Wire format (compatible; capability tokens are first-class Protobuf messages; cryptographic signing for Layer 4)
- ADR-013 — Multi-service architecture (compatible; all five services subject to same enforcement layer in any deployment)
- ADR-015 — Validation methodology (forthcoming; conformance testing per enforcement layer)

## Implementation notes

For Continuum's reference implementation:

- v1 ships Layer 1 (cooperating SDK only); ASHE DM gates IPC traffic; agent vendors using the ASHE-compatible SDK get protection
- v2-v3 add Layer 2 hooks in Node.js (intercepting `fs`, `child_process`, `http` modules to route through ASHE for ASHE-aware processes)
- v4+ exploration of Layer 3 via gVisor / Firecracker / eBPF integration for production hosts running untrusted code
- v6+ exploration of Layer 4 via TPM-rooted attestation for highest-stakes deployments

Each layer transition is its own discrete project with explicit go-ahead gates. v1 doesn't commit to v3+ work; it commits to the protocol shape that allows v3+ to be added without rewrite.
