import path from 'node:path';
import type { Language, Rule } from '../types.js';
import { genericRules } from './generic.js';
import { goRules } from './go.js';
import { phpRules } from './php.js';
import { pythonRules } from './python.js';
import { typescriptRules } from './typescript.js';

export const ALL_RULES: Rule[] = [
  ...genericRules,
  ...typescriptRules,
  ...pythonRules,
  ...phpRules,
  ...goRules,
];

const EXT_TO_LANGUAGE: Record<string, Language> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.php': 'php',
  '.go': 'go',
};

export function detectLanguage(filePath: string): Language | null {
  const ext = path.extname(filePath).toLowerCase();
  return EXT_TO_LANGUAGE[ext] ?? null;
}

export function getRulesForLanguage(language: Language): Rule[] {
  return ALL_RULES.filter(
    (rule) => rule.languages.includes('generic') || rule.languages.includes(language),
  );
}
