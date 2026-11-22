import type { Rule, RuleMatch } from '../types.js';

const PHP_EMPTY_CATCH_RE = /\bcatch\s*\([^)]*\)\s*\{\s*\}/;
const PHP_UNSAFE_RE = /\b(?:eval|shell_exec|unserialize)\s*\(/;
const PHP_DEBUG_RE = /\b(?:dd|dump|var_dump|print_r)\s*\(/;
const PHP_ERROR_SUPPRESS_RE =
  /(?:^|[^\w$])@(?:\$[a-zA-Z_]|(?:fopen|file_get_contents|unlink|include|require)\s*\()/;

export const phpRules: Rule[] = [
  {
    id: 'php-empty-catch',
    name: 'Empty PHP Catch Block',
    category: 'resilience',
    severity: 'P1',
    languages: ['php'],
    description: 'Empty catch block silently discards exceptions.',
    remediation: 'Log with context, wrap in a domain exception, or rethrow.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = PHP_EMPTY_CATCH_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'php-unsafe-exec',
    name: 'Unsafe PHP Execution or Deserialization',
    category: 'security',
    severity: 'P0',
    languages: ['php'],
    description: 'eval(), shell_exec(), or unserialize() introduces RCE/object-injection risks.',
    remediation:
      'Use JSON serialization and safe process/API abstractions with strict argument arrays.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = PHP_UNSAFE_RE.exec(line);
        if (m) {
          if (line.includes('unserialize') && /allowed_classes\s*['"]\s*=>\s*false/.test(line)) {
            continue;
          }
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'php-debug-leftover',
    name: 'PHP Debug Helper Leftover',
    category: 'slop',
    severity: 'P2',
    languages: ['php'],
    description: 'Debug call (dd, dump, var_dump, print_r) left in PHP source.',
    remediation: 'Remove debug dumps or replace with structured PSR-3 logging.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = PHP_DEBUG_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'php-error-suppression',
    name: 'PHP @ Error Suppression Operator',
    category: 'quality',
    severity: 'P2',
    languages: ['php'],
    description: 'Using `@` silences PHP errors and hides failures.',
    remediation: 'Check return values or handle thrown ErrorException/Throwable explicitly.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = PHP_ERROR_SUPPRESS_RE.exec(line);
        if (m) {
          matches.push({ line: i + 1, column: m.index + 1, snippet: line.trim() });
        }
      }
      return matches;
    },
  },
  {
    id: 'php-missing-strict-types',
    name: 'Missing declare(strict_types=1)',
    category: 'quality',
    severity: 'P3',
    languages: ['php'],
    description: 'PHP file lacks `declare(strict_types=1);`, allowing silent type coercion.',
    remediation: 'Add `declare(strict_types=1);` after `<?php`.',
    check: ({ content, lines }) => {
      if (!content.includes('<?php')) return [];
      if (/declare\s*\(\s*strict_types\s*=\s*1\s*\)/.test(content)) return [];
      if (lines.length < 5) return [];
      return [{ line: 1, column: 1, snippet: lines[0]?.trim() ?? '<?php' }];
    },
  },
];
