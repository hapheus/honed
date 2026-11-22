import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanTargets } from '../../src/detect/scanner.js';

describe('inline ignores', () => {
  test('suppresses waived findings and reports unused ignores', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'honed-ignore-'));
    try {
      const file = path.join(dir, 'src', 'waived.ts');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(
        file,
        [
          '// honed-disable-next-line ts-any-cast: legacy untyped callback',
          'export const a: any = 1;',
          '// honed-disable-next-line ts-empty-catch: stale waiver',
          'export const b = 2;',
        ].join('\n'),
        'utf8',
      );

      const res = scanTargets(['.'], { cwd: dir, reportUnusedIgnores: true });
      expect(res.findings).toHaveLength(0);
      expect(res.unusedIgnores).toHaveLength(1);
      expect(res.unusedIgnores[0]?.ruleId).toBe('ts-empty-catch');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
