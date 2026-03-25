import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  HIGH_RISK_KEYWORDS,
  PROHIBITED_KEYWORDS,
} from './ai-packages.js';
import type { RiskClassification, RiskLevel, ScanResult } from './types.js';

function readAllSourceText(rootDir: string, maxBytes = 2_000_000): string {
  const parts: string[] = [];
  let total = 0;
  const walk = (dir: string): void => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|jsx|md|json|env)$/i.test(e.name)) {
        try {
          const buf = fs.readFileSync(full);
          if (total + buf.length > maxBytes) return;
          total += buf.length;
          parts.push(buf.toString('utf8'));
        } catch {
          /* ignore */
        }
      }
    }
  };
  walk(rootDir);
  return parts.join('\n').toLowerCase();
}

export interface ClassifyContext {
  /** Combined source text hint (optional; if omitted, reads from disk). */
  corpus?: string;
}

export function classifyRisk(
  scan: ScanResult,
  context?: ClassifyContext,
): RiskClassification {
  const warnings: string[] = [];
  const articles: string[] = [];

  const corpus =
    context?.corpus?.toLowerCase() ?? readAllSourceText(scan.rootDir);

  for (const kw of PROHIBITED_KEYWORDS) {
    if (corpus.includes(kw.toLowerCase())) {
      return {
        level: 'prohibited',
        reason: `Possible prohibited practice indicated by keyword: "${kw}". Legal review required.`,
        articles: ['Article 5'],
        warnings: [
          'Heuristic scan only — not legal advice. Consult qualified counsel.',
        ],
      };
    }
  }

  let highHit = false;
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (corpus.includes(kw.toLowerCase())) {
      highHit = true;
      warnings.push(`High-risk context hint: "${kw}"`);
    }
  }

  if (scan.packagesDetected.length === 0) {
    return {
      level: 'minimal',
      reason: 'No known AI SDK imports detected in scanned files.',
      articles: [],
      warnings,
    };
  }

  if (highHit) {
    articles.push('Annex III', 'Articles 9–15', 'Article 26');
    return {
      level: 'high',
      reason:
        'AI SDK usage detected together with keywords suggesting Annex III high-risk domains (heuristic).',
      articles,
      warnings,
    };
  }

  articles.push('Article 50');
  return {
    level: 'limited',
    reason:
      'AI SDK usage detected; likely transparency obligations for interactable AI (e.g. chatbots) under limited-risk rules.',
    articles,
    warnings,
  };
}

export function riskLevelOrder(level: RiskLevel): number {
  const o: Record<RiskLevel, number> = {
    minimal: 0,
    limited: 1,
    high: 2,
    prohibited: 3,
  };
  return o[level];
}
