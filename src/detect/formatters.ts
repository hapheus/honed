import { ALL_RULES } from './rules/index.js';
import type { ScanResult, Severity } from './types.js';

function severityToSarifLevel(severity: Severity): 'error' | 'warning' | 'note' {
  if (severity === 'P0' || severity === 'P1') return 'error';
  if (severity === 'P2') return 'warning';
  return 'note';
}

function severityToGithubLevel(severity: Severity): 'error' | 'warning' | 'notice' {
  if (severity === 'P0' || severity === 'P1') return 'error';
  if (severity === 'P2') return 'warning';
  return 'notice';
}

export function formatPretty(result: ScanResult, reportUnusedIgnores = false): string {
  const lines: string[] = [];

  for (const f of result.findings) {
    lines.push(`[${f.severity}] ${f.filePath}:${f.line}:${f.column} (${f.ruleId}) ${f.message}`);
    if (f.snippet) {
      lines.push(`  > ${f.snippet}`);
    }
    lines.push(`  fix: ${f.remediation}`);
  }

  if (reportUnusedIgnores && result.unusedIgnores.length > 0) {
    lines.push('');
    lines.push('Unused inline ignores:');
    for (const ig of result.unusedIgnores) {
      lines.push(`  ${ig.filePath}:${ig.line} (${ig.ruleId}, ${ig.scope})`);
    }
  }

  for (const err of result.errors) {
    lines.push(`[ERROR] ${err}`);
  }

  const unusedPart = reportUnusedIgnores ? `, ${result.unusedIgnores.length} unused ignore(s)` : '';
  const errorsPart = result.errors.length > 0 ? `, ${result.errors.length} error(s)` : '';
  lines.push('');
  lines.push(
    `Scanned ${result.scannedFiles} file(s): ${result.findings.length} finding(s)${unusedPart}${errorsPart}.`,
  );

  return lines.join('\n');
}

export function formatJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatGithub(result: ScanResult): string {
  const lines: string[] = [];
  for (const f of result.findings) {
    const level = severityToGithubLevel(f.severity);
    lines.push(
      `::${level} file=${f.filePath},line=${f.line},col=${f.column},title=${f.ruleId}::[${f.severity}] ${f.message} (${f.remediation})`,
    );
  }
  for (const err of result.errors) {
    lines.push(`::error::${err}`);
  }
  return lines.join('\n');
}

export function formatSarif(result: ScanResult, version: string): string {
  const executionSuccessful = result.errors.length === 0;
  const sarif = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'honed',
            version,
            informationUri: 'https://github.com/hapheus/honed',
            rules: ALL_RULES.map((rule) => ({
              id: rule.id,
              name: rule.name,
              shortDescription: { text: rule.description },
              help: { text: rule.remediation },
              defaultConfiguration: {
                level: severityToSarifLevel(rule.severity),
              },
              properties: {
                category: rule.category,
                severity: rule.severity,
              },
            })),
          },
        },
        invocations: [
          {
            executionSuccessful,
          },
        ],
        results: result.findings.map((f) => ({
          ruleId: f.ruleId,
          level: severityToSarifLevel(f.severity),
          message: { text: `${f.message} Fix: ${f.remediation}` },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: f.filePath },
                region: {
                  startLine: f.line,
                  startColumn: f.column,
                },
              },
            },
          ],
        })),
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
