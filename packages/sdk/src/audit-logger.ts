import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export interface AuditEntry {
  id: string;
  timestamp: string;
  system: string;
  action: string;
  model?: string;
  purpose?: string;
  input_type?: string;
  contains_pii?: boolean;
  human_oversight?: string;
  response_time_ms?: number;
  tokens_used?: number;
  error?: string;
  hash: string;
  previous_hash: string | null;
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function serializeForHash(entry: Omit<AuditEntry, 'hash'>): string {
  return JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    system: entry.system,
    action: entry.action,
    model: entry.model,
    purpose: entry.purpose,
    input_type: entry.input_type,
    contains_pii: entry.contains_pii,
    human_oversight: entry.human_oversight,
    response_time_ms: entry.response_time_ms,
    tokens_used: entry.tokens_used,
    error: entry.error,
    previous_hash: entry.previous_hash,
  });
}

export class AuditLogger {
  private readonly logPath: string;
  private readonly systemName: string;
  private lastHash: string | null = null;

  constructor(logPath: string, systemName: string) {
    this.logPath = path.resolve(logPath);
    this.systemName = systemName;
    this.loadLastHash();
  }

  private loadLastHash(): void {
    if (!fs.existsSync(this.logPath)) {
      this.lastHash = null;
      return;
    }
    const lines = fs.readFileSync(this.logPath, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length === 0) {
      this.lastHash = null;
      return;
    }
    try {
      const last = JSON.parse(lines[lines.length - 1]!) as AuditEntry;
      this.lastHash = last.hash;
    } catch {
      this.lastHash = null;
    }
  }

  /** `system` is always taken from the logger instance — do not pass it in `partial`. */
  append(
    partial: Omit<AuditEntry, 'id' | 'timestamp' | 'hash' | 'previous_hash' | 'system'> & {
      action: string;
    },
  ): AuditEntry {
    const id = `log_${randomUUID()}`;
    const timestamp = new Date().toISOString();
    const previous_hash = this.lastHash;
    const base: Omit<AuditEntry, 'hash'> = {
      ...partial,
      id,
      timestamp,
      system: this.systemName,
      previous_hash,
    };
    const hash = sha256Hex(serializeForHash(base));
    const entry: AuditEntry = { ...base, hash };
    fs.mkdirSync(path.dirname(this.logPath), { recursive: true });
    fs.appendFileSync(this.logPath, JSON.stringify(entry) + '\n', 'utf8');
    this.lastHash = hash;
    return entry;
  }

  readAll(): AuditEntry[] {
    if (!fs.existsSync(this.logPath)) return [];
    return fs
      .readFileSync(this.logPath, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AuditEntry);
  }

  exportJson(fromIso?: string): AuditEntry[] {
    const all = this.readAll();
    if (!fromIso) return all;
    const from = Date.parse(fromIso);
    return all.filter((e) => Date.parse(e.timestamp) >= from);
  }

  verifyChain(): { ok: boolean; brokenAt?: number } {
    const all = this.readAll();
    let prev: string | null = null;
    for (let i = 0; i < all.length; i++) {
      const e = all[i]!;
      if (e.previous_hash !== prev) return { ok: false, brokenAt: i };
      const expected = sha256Hex(
        serializeForHash({
          id: e.id,
          timestamp: e.timestamp,
          system: e.system,
          action: e.action,
          model: e.model,
          purpose: e.purpose,
          input_type: e.input_type,
          contains_pii: e.contains_pii,
          human_oversight: e.human_oversight,
          response_time_ms: e.response_time_ms,
          tokens_used: e.tokens_used,
          error: e.error,
          previous_hash: e.previous_hash,
        }),
      );
      if (expected !== e.hash) return { ok: false, brokenAt: i };
      prev = e.hash;
    }
    return { ok: true };
  }
}
