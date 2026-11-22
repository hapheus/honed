import { describe, expect, test } from 'bun:test';
import {
  formatGithub,
  formatJson,
  formatPretty,
  formatSarif,
} from '../../src/detect/formatters.js';
import type { ScanResult } from '../../src/detect/types.js';

const SAMPLE_RESULT: ScanResult = {
  scannedFiles: 1,
  findings: [
    {
      ruleId: 'ts-empty-catch',
      ruleName: 'Empty Catch Block',
      category: 'resilience',
      severity: 'P1',
      filePath: 'src/app.ts',
      line: 12,
      column: 5,
      message: 'Empty catch block silently swallows errors.',
      remediation: 'Handle or rethrow the error.',
      snippet: 'catch (e) {}',
    },
  ],
  unusedIgnores: [],
  errors: [],
};

describe('output formatters', () => {
  test('formats pretty, JSON, GitHub annotations, and SARIF 2.1.0', () => {
    expect(formatPretty(SAMPLE_RESULT)).toContain('[P1] src/app.ts:12:5 (ts-empty-catch)');

    const parsedJson = JSON.parse(formatJson(SAMPLE_RESULT)) as ScanResult;
    expect(parsedJson.findings).toHaveLength(1);

    expect(formatGithub(SAMPLE_RESULT)).toContain(
      '::error file=src/app.ts,line=12,col=5,title=ts-empty-catch::',
    );

    const sarif = JSON.parse(formatSarif(SAMPLE_RESULT, '0.1.0')) as {
      version: string;
      runs: Array<{
        tool: { driver: { name: string; rules: unknown[] } };
        invocations: Array<{ executionSuccessful: boolean }>;
        results: Array<{ ruleId: string }>;
      }>;
    };
    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0]?.tool.driver.name).toBe('honed');
    expect(sarif.runs[0]?.invocations[0]?.executionSuccessful).toBe(true);
    expect(sarif.runs[0]?.results[0]?.ruleId).toBe('ts-empty-catch');
  });
});
