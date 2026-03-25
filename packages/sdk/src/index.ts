export { AI_SDK_PACKAGES, HIGH_RISK_KEYWORDS, PROHIBITED_KEYWORDS } from './ai-packages.js';
export { Attest, defaultAuditPath } from './attest.js';
export { AuditLogger } from './audit-logger.js';
export type { AuditEntry } from './audit-logger.js';
export { checkCompliance } from './compliance-checker.js';
export { classifyRisk, riskLevelOrder } from './risk-classifier.js';
export { generateAnnexIvDocs } from './docs-generator.js';
export { scanProject } from './scanner.js';
export { getDisclosure } from './transparency.js';
export type { DisclosureLocale } from './transparency.js';

export type {
  AttestConfig,
  AttestEuConfig,
  AttestSystemConfig,
  ComplianceCheck,
  ComplianceReport,
  ComplianceStatus,
  ExportAuditOptions,
  GenerateDocsOptions,
  RiskClassification,
  RiskLevel,
  ScanFinding,
  ScanResult,
  TrackMeta,
} from './types.js';
