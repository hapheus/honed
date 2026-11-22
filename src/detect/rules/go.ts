import type { Rule, RuleMatch } from '../types.js';

const GO_DEFAULT_HTTP_RE = /\bhttp\.(?:Get|Post|PostForm|Head)\s*\(/;
const GO_IGNORED_ERR_RE = /\b_\s*(?:,\s*_\s*)?=\s*[a-zA-Z0-9_.]+\(/;
const GO_FMT_PRINT_RE = /\bfmt\.(?:Println|Printf|Print)\s*\(/;

export const goRules: Rule[] = [
  {
    id: 'go-http-no-timeout',
    name: 'http.DefaultClient Call Without Timeout',
    category: 'resilience',
    severity: 'P1',
    languages: ['go'],
    description: 'Package-level http.Get/Post uses http.DefaultClient, which has no timeout.',
    remediation: 'Use an explicit `&http.Client{Timeout: ...}` with `http.NewRequestWithContext`.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = GO_DEFAULT_HTTP_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'go-ignored-error',
    name: 'Ignored Return Value / Error',
    category: 'resilience',
    severity: 'P1',
    languages: ['go'],
    description: 'Assigning function call results to `_` may silently discard an error.',
    remediation: 'Check the returned `err` or document explicitly why it is safe to ignore.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = GO_IGNORED_ERR_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'go-fmt-print-debug',
    name: 'Unstructured fmt.Print Debug Leftover',
    category: 'slop',
    severity: 'P3',
    languages: ['go'],
    description: 'fmt.Println/Printf used in non-CLI Go source.',
    remediation: 'Use structured logging (`log/slog`, `zap`, `zerolog`).',
    check: ({ lines, filePath }) => {
      if (/(?:^|\/)(?:cmd|cli|tests?)\//.test(filePath) || filePath.endsWith('_test.go')) return [];
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = GO_FMT_PRINT_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
];
