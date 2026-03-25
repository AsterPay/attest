import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ComplianceCheck, ComplianceReport, ScanResult } from './types.js';

const TRANSPARENCY_PATTERNS = [
  /artificial intelligence/i,
  /\bai[-\s]generated\b/i,
  /\bthis (chat|conversation|message) (is|was) (powered|created) by\b/i,
  /powered by ai/i,
  /@asterpay\/attest/i,
  /attest\.disclosure/i,
  /eu ai act/i,
];

const LOGGING_PATTERNS = [
  /@asterpay\/attest-sdk/i,
  /attest\.track/i,
  /audit.?log/i,
  /compliance.?log/i,
];

const OVERSIGHT_PATTERNS = [
  /human.?in.?the.?loop/i,
  /human.?oversight/i,
  /humanOversight/i,
  /requireApproval/i,
  /approval.?gate/i,
];

function readProjectCorpus(rootDir: string, maxBytes = 1_500_000): string {
  const chunks: string[] = [];
  let total = 0;
  const walk = (dir: string): void => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (
        e.name === 'node_modules' ||
        e.name === '.git' ||
        e.name === 'dist' ||
        e.name === '.next'
      )
        continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|jsx|mdx?|vue|svelte)$/i.test(e.name)) {
        try {
          const buf = fs.readFileSync(full);
          if (total + buf.length > maxBytes) return;
          total += buf.length;
          chunks.push(buf.toString('utf8'));
        } catch {
          /* ignore */
        }
      }
    }
  };
  walk(rootDir);
  return chunks.join('\n');
}

export function checkCompliance(
  scan: ScanResult,
  rootDir: string = scan.rootDir,
): ComplianceReport {
  const corpus = readProjectCorpus(rootDir);
  const checks: ComplianceCheck[] = [];

  const hasAi = scan.packagesDetected.length > 0;
  checks.push({
    id: 'ai-usage',
    label: 'AI SDK usage detected',
    status: hasAi ? 'pass' : 'warn',
    detail: hasAi
      ? `Packages: ${scan.packagesDetected.join(', ')}`
      : 'No known AI SDK imports found (may still use REST or other paths).',
  });

  const transparency = TRANSPARENCY_PATTERNS.some((re) => re.test(corpus));
  checks.push({
    id: 'transparency',
    label: 'Transparency / disclosure signals',
    status: hasAi ? (transparency ? 'pass' : 'fail') : 'warn',
    detail: transparency
      ? 'Found disclosure-related patterns in source.'
      : hasAi
        ? 'No obvious user-facing AI disclosure pattern detected — Article 50 style transparency may be required.'
        : 'N/A without AI usage.',
  });

  const logging = LOGGING_PATTERNS.some((re) => re.test(corpus));
  checks.push({
    id: 'logging',
    label: 'Logging / attest integration signals',
    status: hasAi ? (logging ? 'pass' : 'warn') : 'warn',
    detail: logging
      ? 'Found logging or @asterpay/attest usage hints.'
      : 'Consider structured logging for AI inferences (Article 12 style record-keeping for high-risk systems).',
  });

  const oversight = OVERSIGHT_PATTERNS.some((re) => re.test(corpus));
  checks.push({
    id: 'oversight',
    label: 'Human oversight signals',
    status: hasAi ? (oversight ? 'pass' : 'warn') : 'warn',
    detail: oversight
      ? 'Found human oversight related patterns.'
      : 'No human oversight patterns detected — may be required for high-risk deployments (Article 14).',
  });

  const pass = checks.filter((c) => c.status === 'pass').length;
  const fail = checks.filter((c) => c.status === 'fail').length;
  const warn = checks.filter((c) => c.status === 'warn').length;
  const score = Math.max(
    0,
    Math.min(100, Math.round((pass * 100 - fail * 25 - warn * 10) / checks.length)),
  );

  return { checks, score };
}
