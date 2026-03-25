#!/usr/bin/env node
import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import {
  Attest,
  checkCompliance,
  classifyRisk,
  generateAnnexIvDocs,
  scanProject,
} from '@asterpay/attest-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EU_AI_ACT_DEADLINE = new Date('2026-08-02T00:00:00.000Z');

function deadlineCountdown(): string {
  const now = Date.now();
  const ms = EU_AI_ACT_DEADLINE.getTime() - now;
  if (ms <= 0) return 'Deadline passed — verify current enforcement dates with legal counsel.';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return `${days}d ${hours}h until 2 Aug 2026 (high-risk / limited-risk milestones — confirm with counsel)`;
}

function loadConfig(root: string): { name: string; provider: string; description?: string } {
  const p = path.join(root, '.attest', 'config.json');
  if (fs.existsSync(p)) {
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8')) as {
        system?: { name?: string; provider?: string; description?: string };
      };
      if (j.system?.name && j.system?.provider) {
        return {
          name: j.system.name,
          provider: j.system.provider,
          description: j.system.description,
        };
      }
    } catch {
      /* fall through */
    }
  }
  return { name: 'Unnamed AI system', provider: 'Unknown provider' };
}

const program = new Command();
program
  .name('attest')
  .description('EU AI Act compliance toolkit for your codebase — Powered by AsterPay')
  .version('0.1.0');

program
  .command('scan')
  .description('Scan project for AI SDK imports')
  .option('-r, --root <dir>', 'Project root', process.cwd())
  .action((opts: { root: string }) => {
    const scan = scanProject({ rootDir: path.resolve(opts.root) });
    console.log(`Root: ${scan.rootDir}`);
    console.log(`Files scanned: ${scan.filesScanned}`);
    console.log(`Packages: ${scan.packagesDetected.join(', ') || '(none)'}`);
    if (scan.findings.length) {
      console.log('\nFindings:');
      for (const f of scan.findings) {
        console.log(`  - ${f.packageName}  ${f.filePath}:${f.line}  (${f.kind})`);
      }
    }
    const risk = classifyRisk(scan);
    console.log(`\nHeuristic risk: ${risk.level}`);
    console.log(`Reason: ${risk.reason}`);
    if (risk.articles.length) console.log(`Articles (indicative): ${risk.articles.join(', ')}`);
    console.log(`\n${deadlineCountdown()}`);
  });

program
  .command('check')
  .description('Run compliance heuristics (transparency, logging, oversight signals)')
  .option('-r, --root <dir>', 'Project root', process.cwd())
  .action((opts: { root: string }) => {
    const root = path.resolve(opts.root);
    const scan = scanProject({ rootDir: root });
    const report = checkCompliance(scan, root);
    for (const c of report.checks) {
      const icon = c.status === 'pass' ? '[PASS]' : c.status === 'fail' ? '[FAIL]' : '[WARN]';
      console.log(`${icon} ${c.label}`);
      console.log(`      ${c.detail}`);
    }
    console.log(`\nCompliance score (heuristic): ${report.score}/100`);
    console.log(`\n${deadlineCountdown()}`);
  });

program
  .command('docs')
  .description('Generate Annex IV-style Markdown scaffolds')
  .requiredOption('-o, --output <dir>', 'Output directory')
  .option('-r, --root <dir>', 'Project root', process.cwd())
  .option('--name <name>', 'System name (overrides .attest/config.json)')
  .option('--provider <name>', 'Provider (overrides .attest/config.json)')
  .action(
    (opts: { output: string; root: string; name?: string; provider?: string }) => {
      const root = path.resolve(opts.root);
      const cfg = loadConfig(root);
      const scan = scanProject({ rootDir: root });
      const risk = classifyRisk(scan);
      const { files } = generateAnnexIvDocs(scan, risk, {
        outputDir: path.resolve(opts.output),
        systemName: opts.name ?? cfg.name,
        provider: opts.provider ?? cfg.provider,
        description: cfg.description,
      });
      console.log('Wrote:');
      for (const f of files) console.log(`  ${f}`);
    },
  );

program
  .command('export')
  .description('Export tamper-evident audit log (JSON)')
  .option('-r, --root <dir>', 'Project root', process.cwd())
  .option('--from <iso>', 'Filter entries from ISO date')
  .action((opts: { root: string; from?: string }) => {
    const root = path.resolve(opts.root);
    const cfg = loadConfig(root);
    const attest = new Attest({
      system: { name: cfg.name, provider: cfg.provider, description: cfg.description },
      projectRoot: root,
    });
    const out = attest.exportAuditLog({ format: 'json', from: opts.from });
    process.stdout.write(out);
  });

program
  .command('verify')
  .description('Verify audit log hash chain integrity')
  .option('-r, --root <dir>', 'Project root', process.cwd())
  .action((opts: { root: string }) => {
    const root = path.resolve(opts.root);
    const cfg = loadConfig(root);
    const attest = new Attest({
      system: { name: cfg.name, provider: cfg.provider, description: cfg.description },
      projectRoot: root,
    });
    const v = attest.verifyAuditChain();
    if (v.ok) console.log('Audit chain: OK');
    else console.log(`Audit chain: BROKEN at index ${v.brokenAt}`);
    process.exit(v.ok ? 0 : 1);
  });

program
  .command('dashboard')
  .description('Open local compliance dashboard (static)')
  .option('-p, --port <n>', 'Port', '3500')
  .action((opts: { port: string }) => {
    const port = Number(opts.port) || 3500;
    const htmlPath = path.join(__dirname, '..', 'static', 'dashboard.html');
    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/index.html') {
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, service: 'attest-dashboard' }));
        return;
      }
      res.writeHead(404);
      res.end('Not found');
    });
    server.listen(port, () => {
      console.log(`Attest dashboard: http://127.0.0.1:${port}/`);
      console.log('Press Ctrl+C to stop.');
    });
  });

program.parse();
