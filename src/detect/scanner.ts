import fs from 'node:fs';
import path from 'node:path';
import { applyInlineIgnores } from './ignores.js';
import { detectLanguage, getRulesForLanguage } from './rules/index.js';
import type { Finding, HonedConfig, ScanOptions, ScanResult, UnusedIgnore } from './types.js';

const DEFAULT_IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'vendor',
  '.venv',
  'venv',
  '__pycache__',
  '.next',
  '.nuxt',
  '.svelte-kit',
  'target',
]);

export function loadHonedConfig(cwd: string): HonedConfig {
  const configPath = path.join(cwd, '.honed', 'config.json');
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw) as HonedConfig;
  } catch {
    return {};
  }
}

function shouldSkipPath(relPath: string, ignorePaths: string[]): boolean {
  const normalized = relPath.split(path.sep).join('/');
  return ignorePaths.some((pattern) => {
    const clean = pattern.replace(/\/+$/, '');
    return normalized === clean || normalized.startsWith(`${clean}/`);
  });
}

function collectFiles(
  targetPath: string,
  cwd: string,
  ignorePaths: string[],
  out: string[],
  errors: string[],
): void {
  let stat: fs.Stats;
  try {
    stat = fs.statSync(targetPath);
  } catch (err) {
    errors.push(`Cannot access ${targetPath}: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  if (stat.isFile()) {
    out.push(targetPath);
    return;
  }

  if (!stat.isDirectory()) return;

  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && DEFAULT_IGNORED_DIRS.has(entry.name)) {
      continue;
    }
    const full = path.join(targetPath, entry.name);
    const rel = path.relative(cwd, full);
    if (shouldSkipPath(rel, ignorePaths)) {
      continue;
    }
    if (entry.isDirectory()) {
      collectFiles(full, cwd, ignorePaths, out, errors);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
}

export function scanFile(
  filePath: string,
  cwd: string,
  disabledRules: Set<string>,
): { findings: Finding[]; unusedIgnores: UnusedIgnore[]; scanned: boolean } {
  const language = detectLanguage(filePath);
  if (!language) {
    return { findings: [], unusedIgnores: [], scanned: false };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const relPath = path.relative(cwd, filePath).split(path.sep).join('/') || path.basename(filePath);
  const rules = getRulesForLanguage(language).filter((r) => !disabledRules.has(r.id));

  const rawFindings: Finding[] = [];
  for (const rule of rules) {
    const matches = rule.check({
      filePath: relPath,
      language,
      content,
      lines,
    });
    for (const match of matches) {
      rawFindings.push({
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        severity: rule.severity,
        filePath: relPath,
        line: match.line,
        column: match.column,
        message: match.message ?? rule.description,
        remediation: rule.remediation,
        snippet: match.snippet,
      });
    }
  }

  const { findings, unusedIgnores } = applyInlineIgnores(relPath, lines, rawFindings);
  return { findings, unusedIgnores, scanned: true };
}

export function scanTargets(targets: string[], options: ScanOptions): ScanResult {
  const config = options.config ?? loadHonedConfig(options.cwd);
  const ignorePaths = config.ignorePaths ?? [];
  const disabledRules = new Set((config.disableRules ?? []).map((r) => r.toLowerCase()));

  const files: string[] = [];
  const errors: string[] = [];

  for (const target of targets) {
    const resolved = path.resolve(options.cwd, target);
    collectFiles(resolved, options.cwd, ignorePaths, files, errors);
  }

  const allFindings: Finding[] = [];
  const allUnusedIgnores: UnusedIgnore[] = [];
  let scannedFiles = 0;

  for (const file of files) {
    try {
      const res = scanFile(file, options.cwd, disabledRules);
      if (res.scanned) {
        scannedFiles++;
        allFindings.push(...res.findings);
        allUnusedIgnores.push(...res.unusedIgnores);
      }
    } catch (err) {
      errors.push(`Failed reading ${file}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  allFindings.sort((a, b) => {
    if (a.filePath !== b.filePath) return a.filePath.localeCompare(b.filePath);
    if (a.line !== b.line) return a.line - b.line;
    return a.column - b.column;
  });

  return {
    scannedFiles,
    findings: allFindings,
    unusedIgnores: allUnusedIgnores,
    errors,
  };
}
