import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanTargets } from '../../src/detect/scanner.js';

function withTempFile(filename: string, content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'honed-test-'));
  const filePath = path.join(dir, filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return dir;
}

describe('detector rules', () => {
  test('flags generic secrets, SQL interpolation, and tautological comments', () => {
    const dir = withTempFile(
      'src/service.ts',
      [
        '// Return the result',
        'const token = "ghp_1234567890abcdefghijklmnopqrstuv";',
        'const query = `SELECT * FROM users WHERE id = ${userId}`;',
        'export const ok = true;',
      ].join('\n'),
    );
    try {
      const res = scanTargets(['.'], { cwd: dir });
      const ruleIds = res.findings.map((f) => f.ruleId);
      expect(ruleIds).toContain('tautological-comment');
      expect(ruleIds).toContain('hardcoded-secret');
      expect(ruleIds).toContain('sql-string-interpolation');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('does not flag placeholder secrets or parameterized SQL', () => {
    const dir = withTempFile(
      'src/clean.ts',
      [
        '// Retry limit keeps p99 under SLO during transient DB blips',
        'const apiKey = process.env.API_KEY ?? "";',
        'const exampleKey = "example_placeholder_123456";',
        'const rows = db.query("SELECT id FROM users WHERE id = $1", [userId]);',
      ].join('\n'),
    );
    try {
      const res = scanTargets(['.'], { cwd: dir });
      expect(res.findings).toHaveLength(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('flags TypeScript anti-patterns and passes clean TS', () => {
    const badDir = withTempFile(
      'src/bad.ts',
      [
        'export async function load(url: string, data: any) {',
        '  try {',
        '    return await fetch(url);',
        '  } catch (err) {}',
        '}',
      ].join('\n'),
    );
    const goodDir = withTempFile(
      'src/good.ts',
      [
        'export const doc = "Avoid eval() and console.log() in production";',
        'export async function load(url: string, data: unknown) {',
        '  try {',
        '    return await fetch(url, { signal: AbortSignal.timeout(5000) });',
        '  } catch (err) {',
        '    throw new Error("Load failed", { cause: err });',
        '  }',
        '}',
      ].join('\n'),
    );
    try {
      const badIds = scanTargets(['.'], { cwd: badDir }).findings.map((f) => f.ruleId);
      expect(badIds).toContain('ts-any-cast');
      expect(badIds).toContain('ts-fetch-no-timeout');
      expect(badIds).toContain('ts-empty-catch');

      const goodRes = scanTargets(['.'], { cwd: goodDir });
      expect(goodRes.findings).toHaveLength(0);
    } finally {
      fs.rmSync(badDir, { recursive: true, force: true });
      fs.rmSync(goodDir, { recursive: true, force: true });
    }
  });

  test('flags Python anti-patterns and passes clean Python', () => {
    const badDir = withTempFile(
      'app/worker.py',
      [
        'import requests',
        'def add_item(item, items=[]):',
        '    try:',
        '        return requests.get("https://api.example.com")',
        '    except:',
        '        pass',
      ].join('\n'),
    );
    const goodDir = withTempFile(
      'app/worker.py',
      [
        'import requests',
        'def add_item(item: str, items: list[str] | None = None) -> list[str]:',
        '    target = items if items is not None else []',
        '    target.append(item)',
        '    return target',
        'def fetch_data() -> requests.Response:',
        '    return requests.get("https://api.example.com", timeout=5.0)',
      ].join('\n'),
    );
    try {
      const badIds = scanTargets(['.'], { cwd: badDir }).findings.map((f) => f.ruleId);
      expect(badIds).toContain('py-mutable-default');
      expect(badIds).toContain('py-requests-no-timeout');
      expect(badIds).toContain('py-bare-except');

      const goodRes = scanTargets(['.'], { cwd: goodDir });
      expect(goodRes.findings).toHaveLength(0);
    } finally {
      fs.rmSync(badDir, { recursive: true, force: true });
      fs.rmSync(goodDir, { recursive: true, force: true });
    }
  });

  test('flags PHP anti-patterns and passes clean PHP', () => {
    const badDir = withTempFile(
      'src/Handler.php',
      [
        '<?php',
        'function run($payload) {',
        '    dd($payload);',
        '    try {',
        '        return @file_get_contents($payload);',
        '    } catch (\\Throwable $e) {}',
        '}',
      ].join('\n'),
    );
    const goodDir = withTempFile(
      'src/Handler.php',
      [
        '<?php',
        'declare(strict_types=1);',
        'function run(string $data): array {',
        '    return json_decode($data, true, 512, JSON_THROW_ON_ERROR);',
        '}',
      ].join('\n'),
    );
    try {
      const badIds = scanTargets(['.'], { cwd: badDir }).findings.map((f) => f.ruleId);
      expect(badIds).toContain('php-missing-strict-types');
      expect(badIds).toContain('php-debug-leftover');
      expect(badIds).toContain('php-error-suppression');
      expect(badIds).toContain('php-empty-catch');

      const goodRes = scanTargets(['.'], { cwd: goodDir });
      expect(goodRes.findings).toHaveLength(0);
    } finally {
      fs.rmSync(badDir, { recursive: true, force: true });
      fs.rmSync(goodDir, { recursive: true, force: true });
    }
  });

  test('flags Go anti-patterns and passes clean Go', () => {
    const badDir = withTempFile(
      'pkg/client.go',
      [
        'package pkg',
        'func fetch() {',
        '    _ = doWork()',
        '    http.Get("https://example.com")',
        '}',
      ].join('\n'),
    );
    const goodDir = withTempFile(
      'pkg/client.go',
      [
        'package pkg',
        'func fetch(client *http.Client) (*http.Response, error) {',
        '    return client.Get("https://example.com")',
        '}',
      ].join('\n'),
    );
    try {
      const badIds = scanTargets(['.'], { cwd: badDir }).findings.map((f) => f.ruleId);
      expect(badIds).toContain('go-ignored-error');
      expect(badIds).toContain('go-http-no-timeout');

      const goodRes = scanTargets(['.'], { cwd: goodDir });
      expect(goodRes.findings).toHaveLength(0);
    } finally {
      fs.rmSync(badDir, { recursive: true, force: true });
      fs.rmSync(goodDir, { recursive: true, force: true });
    }
  });
});
