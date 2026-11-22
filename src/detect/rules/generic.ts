import type { Rule, RuleMatch } from '../types.js';

const SECRET_PATTERNS: RegExp[] = [
  /AKIA[0-9A-Z]{16}/,
  /gh[pousr]_[A-Za-z0-9_]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api_key|apikey|secret_key|auth_token|password)\s*[:=]\s*['"][A-Za-z0-9_\-+/=]{12,}['"]/i,
];

const PLACEHOLDER_RE = /(?:example|changeme|placeholder|dummy|your[_-]?key|xxx+|test[_-]?secret)/i;

const SQL_INTERP_RE =
  /(?:SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+.+\s+SET|DELETE\s+FROM)\s+[^;\n]*(?:\$\{[^}]+\}|\.\s*\$[a-zA-Z_]|%s|\+\s*[a-zA-Z_])/i;

const TAUTOLOGICAL_COMMENT_RE =
  /^\s*(?:\/\/|#)\s*(?:return(?:s|ing)?\s+(?:the\s+)?(?:result|value|data|response|error)|increment(?:s|ing)?\s+(?:the\s+)?counter|import(?:s|ing)?\s+(?:required\s+)?(?:dependencies|modules)|initialize\s+(?:the\s+)?variables?|loop\s+through\s+(?:the\s+)?(?:items|array|list))\b/i;

export const genericRules: Rule[] = [
  {
    id: 'hardcoded-secret',
    name: 'Hardcoded Secret or Credential',
    category: 'security',
    severity: 'P0',
    languages: ['generic'],
    description: 'Potential hardcoded API key, token, password, or private key detected.',
    remediation: 'Move credentials to environment variables or a secret manager.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (PLACEHOLDER_RE.test(line)) continue;
        for (const pattern of SECRET_PATTERNS) {
          const m = pattern.exec(line);
          if (m) {
            matches.push({
              line: i + 1,
              column: m.index + 1,
              snippet: line.trim().slice(0, 100),
            });
            break;
          }
        }
      }
      return matches;
    },
  },
  {
    id: 'sql-string-interpolation',
    name: 'SQL String Interpolation',
    category: 'security',
    severity: 'P0',
    languages: ['generic'],
    description: 'SQL query appears to interpolate or concatenate variables directly.',
    remediation:
      'Use parameterized queries or prepared statements instead of string interpolation.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const m = SQL_INTERP_RE.exec(line);
        if (m) {
          matches.push({
            line: i + 1,
            column: m.index + 1,
            snippet: line.trim().slice(0, 120),
          });
        }
      }
      return matches;
    },
  },
  {
    id: 'tautological-comment',
    name: 'Tautological AI-Slop Comment',
    category: 'slop',
    severity: 'P2',
    languages: ['generic'],
    description: 'Comment restates obvious code behavior instead of explaining why.',
    remediation: 'Delete narrator comments; only document non-obvious invariants or tradeoffs.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (TAUTOLOGICAL_COMMENT_RE.test(line)) {
          matches.push({
            line: i + 1,
            column: 1,
            snippet: line.trim(),
          });
        }
      }
      return matches;
    },
  },
  {
    id: 'deep-nesting',
    name: 'Excessive Nesting Depth',
    category: 'quality',
    severity: 'P2',
    languages: ['generic'],
    description: 'Code indentation exceeds 5 levels (20+ spaces or 5+ tabs), hurting readability.',
    remediation: 'Flatten control flow using early returns, guard clauses, or extracted helpers.',
    check: ({ lines }) => {
      const matches: RuleMatch[] = [];
      let reportedInBlock = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const trimmed = line.trim();
        if (
          !trimmed ||
          trimmed.startsWith('//') ||
          trimmed.startsWith('#') ||
          trimmed.startsWith('*')
        ) {
          continue;
        }
        const leading = /^([ \t]*)/.exec(line)?.[1] ?? '';
        const spaces = leading.replace(/\t/g, '    ').length;
        if (
          spaces >= 24 &&
          !trimmed.startsWith('}') &&
          !trimmed.startsWith(')') &&
          !trimmed.startsWith(']')
        ) {
          if (!reportedInBlock) {
            matches.push({
              line: i + 1,
              column: 1,
              snippet: trimmed.slice(0, 100),
            });
            reportedInBlock = true;
          }
        } else if (spaces <= 8) {
          reportedInBlock = false;
        }
      }
      return matches;
    },
  },
  {
    id: 'oversized-file',
    name: 'Oversized Source File',
    category: 'quality',
    severity: 'P3',
    languages: ['generic'],
    description: 'Source file exceeds 500 lines, suggesting mixed responsibilities.',
    remediation: 'Split cohesive domain capabilities into smaller focused modules.',
    check: ({ lines }) => {
      if (lines.length <= 500) return [];
      return [
        {
          line: 1,
          column: 1,
          snippet: `${lines.length} lines`,
          message: `File has ${lines.length} lines (recommended max: 500).`,
        },
      ];
    },
  },
];
