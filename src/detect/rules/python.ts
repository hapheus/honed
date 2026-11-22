import type { Rule, RuleMatch } from '../types.js';

const BARE_EXCEPT_RE = /^\s*except\s*:/;
const PASS_EXCEPT_RE = /^\s*except(?:\s+[^:]+)?\s*:\s*pass\b/;
const REQUESTS_CALL_RE = /\b(?:requests|httpx)\.(?:get|post|put|delete|patch|request)\s*\(/;
const UNSAFE_EXEC_RE = /\b(?:eval|exec|pickle\.loads)\s*\(/;
const MUTABLE_DEFAULT_RE =
  /^\s*(?:async\s+)?def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*=\s*(?:\[\]|\{\})/;
const TYPE_IGNORE_BARE_RE = /#\s*type:\s*ignore(?!\[)/;
const PRINT_RE = /^\s*print\s*\(/;

export const pythonRules: Rule[] = [
  {
    id: 'py-bare-except',
    name: 'Bare or Swallowed Python Exception',
    category: 'resilience',
    severity: 'P1',
    languages: ['python'],
    description:
      'Bare `except:` or `except ...: pass` swallows errors including SystemExit/KeyboardInterrupt.',
    remediation: 'Catch specific exception types and handle, log, or re-raise with context.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (BARE_EXCEPT_RE.test(line) || PASS_EXCEPT_RE.test(line)) {
          matches.push({ line: i + 1, column: 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'py-requests-no-timeout',
    name: 'HTTP Call Without Timeout',
    category: 'resilience',
    severity: 'P1',
    languages: ['python'],
    description: 'requests/httpx call without an explicit timeout= can hang indefinitely.',
    remediation: 'Pass `timeout=...` to every outbound HTTP call or configure client defaults.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = REQUESTS_CALL_RE.exec(line);
        if (!m) continue;
        const windowText = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
        if (!/\btimeout\s*=/.test(windowText)) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'py-unsafe-exec',
    name: 'Unsafe Dynamic Execution or Deserialization',
    category: 'security',
    severity: 'P0',
    languages: ['python'],
    description: 'eval(), exec(), or pickle.loads() can execute arbitrary code.',
    remediation: 'Use safe parsers (json, ast.literal_eval) and avoid untrusted pickle payloads.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = UNSAFE_EXEC_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'py-mutable-default',
    name: 'Mutable Default Argument',
    category: 'quality',
    severity: 'P1',
    languages: ['python'],
    description: 'Mutable default argument (`[]` or `{}`) is shared across function calls.',
    remediation: 'Default to `None` and initialize inside the function body.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (MUTABLE_DEFAULT_RE.test(line)) {
          matches.push({ line: i + 1, column: 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'py-type-ignore-bare',
    name: 'Blanket # type: ignore',
    category: 'slop',
    severity: 'P2',
    languages: ['python'],
    description: 'Bare `# type: ignore` hides all type errors on the line without an error code.',
    remediation: 'Fix the type annotation or specify the exact error code `# type: ignore[code]`.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = TYPE_IGNORE_BARE_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'py-print-debug',
    name: 'Debug print() Leftover',
    category: 'slop',
    severity: 'P3',
    languages: ['python'],
    description: 'Bare print() call left in non-CLI module.',
    remediation: 'Use structured logging (`logging` / `structlog`) instead of `print()`.',
    check: ({ lines, filePath }) => {
      if (/(?:^|\/)(?:cli|tests?|scripts?)\//.test(filePath)) return [];
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (PRINT_RE.test(line)) {
          matches.push({ line: i + 1, column: 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
];
