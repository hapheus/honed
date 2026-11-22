import type { Rule, RuleMatch } from '../types.js';

const EMPTY_CATCH_RE = /\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}/;
const FETCH_RE = /\bfetch\s*\(/;
const EVAL_RE = /\b(?:eval\s*\(|new\s+Function\s*\()/;
const ANY_RE = /(?::\s*any\b|\bas\s+any\b|<any>)/;
const TS_IGNORE_RE = /\/\/\s*@ts-(?:ignore|nocheck)\b/;
const CONSOLE_LOG_RE = /\bconsole\.log\s*\(/;

function maskStringsAndLineComments(line: string): string {
  return line
    .replace(/\/\/.*$/, '')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/`(?:\\.|[^`\\])*`/g, '``')
    .replace(/\/(?:\\.|[^/\\\s])+\/[gimsuvy]*/g, '//');
}

export const typescriptRules: Rule[] = [
  {
    id: 'ts-empty-catch',
    name: 'Empty Catch Block',
    category: 'resilience',
    severity: 'P1',
    languages: ['typescript', 'javascript'],
    description: 'Empty catch block silently swallows errors.',
    remediation: 'Handle, wrap with context, or explicitly log/rethrow the error.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = EMPTY_CATCH_RE.exec(maskStringsAndLineComments(line));
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'ts-fetch-no-timeout',
    name: 'Outbound fetch() Without Timeout',
    category: 'resilience',
    severity: 'P1',
    languages: ['typescript', 'javascript'],
    description: 'Outbound fetch() call lacks an explicit AbortSignal / timeout.',
    remediation: 'Pass `{ signal: AbortSignal.timeout(ms) }` or an AbortController signal.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = FETCH_RE.exec(maskStringsAndLineComments(line));
        if (!m) continue;
        const windowText = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
        if (!/\bsignal\s*:|\bAbortSignal\b|\btimeout\b/i.test(windowText)) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'ts-eval-usage',
    name: 'Dynamic Code Execution (eval / new Function)',
    category: 'security',
    severity: 'P0',
    languages: ['typescript', 'javascript'],
    description: 'Use of eval() or new Function() enables code injection and breaks CSP.',
    remediation: 'Replace dynamic evaluation with structured data parsing or explicit dispatch.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = EVAL_RE.exec(maskStringsAndLineComments(line));
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'ts-any-cast',
    name: 'Explicit any Type Escape',
    category: 'slop',
    severity: 'P2',
    languages: ['typescript'],
    description: 'Using `any` disables TypeScript type safety.',
    remediation: 'Use `unknown` with runtime narrowing, generics, or a concrete interface.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (line.trim().startsWith('*')) continue;
        const m = ANY_RE.exec(maskStringsAndLineComments(line));
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'ts-ignore-directive',
    name: 'Blanket TypeScript Suppression',
    category: 'slop',
    severity: 'P2',
    languages: ['typescript'],
    description: '@ts-ignore / @ts-nocheck suppresses compiler checks without verifying an error.',
    remediation: 'Fix the underlying type mismatch, or use @ts-expect-error with an explanation.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = TS_IGNORE_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'ts-console-log',
    name: 'Debug console.log Leftover',
    category: 'slop',
    severity: 'P3',
    languages: ['typescript', 'javascript'],
    description: 'Unstructured console.log() left in source code.',
    remediation: 'Use a structured logger (or process.stdout.write in CLI output layers).',
    check: ({ lines, filePath }) => {
      if (/(?:^|\/)(?:cli|tests?|scripts?)\//.test(filePath)) return [];
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = CONSOLE_LOG_RE.exec(maskStringsAndLineComments(line));
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
];
