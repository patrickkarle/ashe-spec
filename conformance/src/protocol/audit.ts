/**
 * Audit-by-construction (ADR-013 Audit service; ADR-016 provenance). Every mediation
 * decision emits an immutable record into an append-only, hash-chained log, so the
 * trail is tamper-evident by construction rather than reconstructed after the fact.
 *
 * This is a *local* append (the audit subsystem of WEIGHTLESS.md), not a network
 * callout: it does not sit on the action's critical path as a round-trip, and it
 * never mutates the payload. The hash chain gives provenance — any reordering or
 * edit of a past record breaks `verify()`.
 */
import { createHash } from "node:crypto";
import type { Decision } from "./mediation.js";
import type { Tier } from "./tier.js";

export interface AuditEntry {
  readonly subject: string;
  readonly capability: string;
  readonly tier: Tier;
  readonly decision: Decision;
  readonly boundaryInvoked: boolean;
  readonly at: number;
}

export interface AuditRecord extends AuditEntry {
  readonly seq: number;
  /** Hash of the previous record (or the genesis constant for the first). */
  readonly prevHash: string;
  /** Hash over (prevHash + canonical entry) — the chain link. */
  readonly hash: string;
}

const GENESIS = "0".repeat(64);

function hashRecord(prevHash: string, seq: number, e: AuditEntry): string {
  const canonical = JSON.stringify([
    prevHash,
    seq,
    e.subject,
    e.capability,
    e.tier,
    e.decision,
    e.boundaryInvoked,
    e.at,
  ]);
  return createHash("sha256").update(canonical).digest("hex");
}

export class AuditLog {
  private readonly chain: AuditRecord[] = [];

  /** Append an entry, linking it into the hash chain. Returns the sealed record. */
  append(entry: AuditEntry): AuditRecord {
    const seq = this.chain.length;
    const prevHash = seq === 0 ? GENESIS : this.chain[seq - 1]!.hash;
    const hash = hashRecord(prevHash, seq, entry);
    const record: AuditRecord = { ...entry, seq, prevHash, hash };
    this.chain.push(record);
    return record;
  }

  entries(): readonly AuditRecord[] {
    return this.chain;
  }

  get length(): number {
    return this.chain.length;
  }

  /** The head hash — commits to the entire history. */
  get head(): string {
    return this.chain.length === 0 ? GENESIS : this.chain[this.chain.length - 1]!.hash;
  }

  /** Recompute the chain; false if any record was reordered, edited, or dropped. */
  verify(): boolean {
    let prevHash = GENESIS;
    for (let i = 0; i < this.chain.length; i++) {
      const r = this.chain[i]!;
      if (r.seq !== i || r.prevHash !== prevHash) return false;
      if (hashRecord(prevHash, i, r) !== r.hash) return false;
      prevHash = r.hash;
    }
    return true;
  }
}
