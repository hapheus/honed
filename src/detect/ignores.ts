import type { Finding, UnusedIgnore } from './types.js';

interface ParsedIgnore {
  line: number;
  ruleId: string;
  scope: 'next-line' | 'file';
  used: boolean;
}

const DISABLE_NEXT_LINE_RE = /honed-disable-next-line\s+([a-z0-9-]+)(?::.*)?$/i;
const DISABLE_FILE_RE = /honed-disable-file\s+([a-z0-9-]+)(?::.*)?$/i;

export function applyInlineIgnores(
  filePath: string,
  lines: string[],
  findings: Finding[],
): { findings: Finding[]; unusedIgnores: UnusedIgnore[] } {
  const ignores: ParsedIgnore[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const lineText = lines[idx] ?? '';
    const nextMatch = DISABLE_NEXT_LINE_RE.exec(lineText);
    if (nextMatch?.[1]) {
      ignores.push({
        line: idx + 1,
        ruleId: nextMatch[1].toLowerCase(),
        scope: 'next-line',
        used: false,
      });
      continue;
    }

    const fileMatch = DISABLE_FILE_RE.exec(lineText);
    if (fileMatch?.[1]) {
      ignores.push({
        line: idx + 1,
        ruleId: fileMatch[1].toLowerCase(),
        scope: 'file',
        used: false,
      });
    }
  }

  if (ignores.length === 0) {
    return { findings, unusedIgnores: [] };
  }

  const kept: Finding[] = [];
  for (const finding of findings) {
    const matching = ignores.find(
      (ig) => ig.ruleId === finding.ruleId && (ig.scope === 'file' || ig.line === finding.line - 1),
    );
    if (matching) {
      matching.used = true;
    } else {
      kept.push(finding);
    }
  }

  const unusedIgnores: UnusedIgnore[] = ignores
    .filter((ig) => !ig.used)
    .map((ig) => ({
      filePath,
      line: ig.line,
      ruleId: ig.ruleId,
      scope: ig.scope,
    }));

  return { findings: kept, unusedIgnores };
}
