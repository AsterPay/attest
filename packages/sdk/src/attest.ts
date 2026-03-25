import * as path from 'node:path';
import { AuditLogger } from './audit-logger.js';
import { checkCompliance } from './compliance-checker.js';
import { classifyRisk } from './risk-classifier.js';
import { generateAnnexIvDocs } from './docs-generator.js';
import { scanProject } from './scanner.js';
import { getDisclosure, type DisclosureLocale } from './transparency.js';
import type {
  AttestConfig,
  ComplianceReport,
  ExportAuditOptions,
  GenerateDocsOptions,
  RiskClassification,
  ScanResult,
  TrackMeta,
} from './types.js';

export class Attest {
  private readonly config: AttestConfig;
  private readonly projectRoot: string;
  private readonly audit?: AuditLogger;

  constructor(config: AttestConfig) {
    this.config = config;
    this.projectRoot = path.resolve(
      config.projectRoot ?? process.cwd(),
    );
    const logPath =
      config.auditLogPath ?? path.join(this.projectRoot, '.attest', 'audit.jsonl');
    this.audit = new AuditLogger(logPath, config.system.name);
  }

  scan(): ScanResult {
    return scanProject({ rootDir: this.projectRoot });
  }

  async classifyRisk(): Promise<RiskClassification> {
    const scan = this.scan();
    return classifyRisk(scan);
  }

  check(): ComplianceReport {
    const scan = this.scan();
    return checkCompliance(scan, this.projectRoot);
  }

  async generateDocs(options: GenerateDocsOptions): Promise<{ files: string[] }> {
    const scan = this.scan();
    const risk = classifyRisk(scan);
    return generateAnnexIvDocs(scan, risk, {
      outputDir: options.outputDir,
      systemName: this.config.system.name,
      provider: this.config.system.provider,
      description: this.config.system.description,
      language: options.language,
    });
  }

  exportAuditLog(options: ExportAuditOptions): string {
    if (!this.audit) return '';
    const entries = this.audit.exportJson(options.from);
    if (options.format === 'jsonl') {
      return entries.map((e) => JSON.stringify(e)).join('\n') + '\n';
    }
    return JSON.stringify(entries, null, 2) + '\n';
  }

  disclosure(locale: DisclosureLocale = 'en', opts?: { humanAvailable?: boolean }): string {
    return getDisclosure(locale, opts);
  }

  /**
   * Wrap an async AI call with audit logging (duration, optional meta).
   */
  async track<T>(fn: () => Promise<T>, meta?: TrackMeta): Promise<T> {
    if (!this.audit) return fn();
    const start = Date.now();
    try {
      const result = await fn();
      const ms = Date.now() - start;
      this.audit.append({
        action: 'ai_inference',
        model: meta?.model,
        purpose: meta?.purpose,
        input_type: 'text',
        contains_pii: meta?.containsPII ?? false,
        human_oversight: meta?.humanOversight ?? 'none',
        response_time_ms: ms,
      });
      return result;
    } catch (err) {
      const ms = Date.now() - start;
      this.audit.append({
        action: 'ai_inference_error',
        model: meta?.model,
        purpose: meta?.purpose,
        response_time_ms: ms,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  verifyAuditChain(): { ok: boolean; brokenAt?: number } {
    return this.audit?.verifyChain() ?? { ok: true };
  }
}

export function defaultAuditPath(projectRoot: string): string {
  return path.join(projectRoot, '.attest', 'audit.jsonl');
}
