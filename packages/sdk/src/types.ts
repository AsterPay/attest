export type RiskLevel = 'minimal' | 'limited' | 'high' | 'prohibited';

export interface ScanFinding {
  readonly packageName: string;
  readonly filePath: string;
  readonly line: number;
  readonly kind: 'import' | 'require' | 'dynamic_import';
}

export interface ScanResult {
  readonly rootDir: string;
  readonly filesScanned: number;
  readonly findings: ScanFinding[];
  readonly packagesDetected: string[];
}

export interface RiskClassification {
  readonly level: RiskLevel;
  readonly reason: string;
  readonly articles: string[];
  readonly warnings: string[];
}

export type ComplianceStatus = 'pass' | 'fail' | 'warn';

export interface ComplianceCheck {
  readonly id: string;
  readonly label: string;
  readonly status: ComplianceStatus;
  readonly detail: string;
}

export interface ComplianceReport {
  readonly checks: ComplianceCheck[];
  readonly score: number;
}

export interface AttestSystemConfig {
  name: string;
  provider: string;
  description?: string;
}

export interface AttestEuConfig {
  deployerCountry?: string;
  registrationId?: string;
}

export interface AttestConfig {
  system: AttestSystemConfig;
  eu?: AttestEuConfig;
  /** Optional path to project root for scans (default: cwd). */
  projectRoot?: string;
  /** Audit log file path (JSONL). */
  auditLogPath?: string;
}

export interface TrackMeta {
  purpose?: string;
  humanOversight?: 'available' | 'required' | 'none';
  containsPII?: boolean;
  model?: string;
}

export interface GenerateDocsOptions {
  outputDir: string;
  format?: 'markdown';
  language?: string;
}

export interface ExportAuditOptions {
  format: 'json' | 'jsonl';
  from?: string;
}
