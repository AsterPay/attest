import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanProject } from './scanner.js';

describe('scanProject', () => {
  it('detects openai import', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'attest-scan-'));
    fs.writeFileSync(
      path.join(dir, 'app.ts'),
      `import OpenAI from 'openai';\nconst x = new OpenAI();\n`,
      'utf8',
    );
    const r = scanProject({ rootDir: dir });
    expect(r.packagesDetected).toContain('openai');
    expect(r.findings.some((f) => f.packageName === 'openai')).toBe(true);
  });

  it('detects require anthropic', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'attest-scan-'));
    fs.writeFileSync(
      path.join(dir, 'legacy.js'),
      `const Anthropic = require("@anthropic-ai/sdk");\n`,
      'utf8',
    );
    const r = scanProject({ rootDir: dir });
    expect(r.packagesDetected).toContain('@anthropic-ai/sdk');
  });
});
