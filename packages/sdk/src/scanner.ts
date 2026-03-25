import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';
import { AI_SDK_PACKAGES } from './ai-packages.js';
import type { ScanFinding, ScanResult } from './types.js';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.turbo',
  'vendor',
]);

const EXT = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);

const AI_SET = new Set(AI_SDK_PACKAGES.map((p) => p.toLowerCase()));

function normalizeSpecifier(spec: string): string | null {
  const s = spec.trim();
  if (!s || s.startsWith('.')) return null;
  const bare = s.startsWith('@')
    ? s.split('/').slice(0, 2).join('/')
    : s.split('/')[0] ?? s;
  return bare?.toLowerCase() ?? null;
}

function matchesAiPackage(spec: string): string | null {
  const n = normalizeSpecifier(spec);
  if (!n) return null;
  if (AI_SET.has(n)) return n;
  for (const p of AI_SDK_PACKAGES) {
    if (n === p.toLowerCase() || n.startsWith(`${p.toLowerCase()}/`)) return p;
  }
  return null;
}

function walkDir(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walkDir(full, out);
    } else if (e.isFile()) {
      const ext = path.extname(e.name);
      if (EXT.has(ext)) out.push(full);
    }
  }
}

function getLine(source: string, pos: number): number {
  return source.slice(0, pos).split('\n').length;
}

function scriptKindForPath(absPath: string): ts.ScriptKind {
  const lower = absPath.toLowerCase();
  if (lower.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (lower.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs'))
    return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function visitSource(
  filePath: string,
  absPath: string,
  content: string,
  findings: ScanFinding[],
): void {
  const sf = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKindForPath(absPath),
  );

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      const pkg = matchesAiPackage(spec);
      if (pkg) {
        findings.push({
          packageName: pkg,
          filePath,
          line: getLine(content, node.getStart(sf)),
          kind: 'import',
        });
      }
    }

    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (ts.isIdentifier(expr) && expr.text === 'require' && node.arguments.length > 0) {
        const arg0 = node.arguments[0];
        if (ts.isStringLiteral(arg0)) {
          const pkg = matchesAiPackage(arg0.text);
          if (pkg) {
            findings.push({
              packageName: pkg,
              filePath,
              line: getLine(content, node.getStart(sf)),
              kind: 'require',
            });
          }
        }
      }
      // dynamic import('pkg')
      if (expr.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length > 0) {
        const arg0 = node.arguments[0];
        if (ts.isStringLiteral(arg0)) {
          const pkg = matchesAiPackage(arg0.text);
          if (pkg) {
            findings.push({
              packageName: pkg,
              filePath,
              line: getLine(content, node.getStart(sf)),
              kind: 'dynamic_import',
            });
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);
}

export interface ScanOptions {
  rootDir: string;
}

export function scanProject(options: ScanOptions): ScanResult {
  const rootDir = path.resolve(options.rootDir);
  const files: string[] = [];
  walkDir(rootDir, files);

  const findings: ScanFinding[] = [];
  let scanned = 0;
  for (const file of files) {
    let content: string;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    scanned += 1;
    visitSource(
      path.relative(rootDir, file).replace(/\\/g, '/'),
      file,
      content,
      findings,
    );
  }

  const packagesDetected = [...new Set(findings.map((f) => f.packageName))].sort();
  return {
    rootDir,
    filesScanned: scanned,
    findings,
    packagesDetected,
  };
}
