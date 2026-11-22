export type Severity = 'P0' | 'P1' | 'P2' | 'P3';

export type Category = 'slop' | 'quality' | 'security' | 'resilience';

export type Language = 'generic' | 'typescript' | 'javascript' | 'python' | 'php' | 'go';

export interface RuleContext {
  filePath: string;
  language: Language;
  content: string;
  lines: string[];
}

export interface RuleMatch {
  line: number;
  column: number;
  snippet: string;
  message?: string;
}

export interface Rule {
  id: string;
  name: string;
  category: Category;
  severity: Severity;
  languages: Language[];
  description: string;
  remediation: string;
  check: (ctx: RuleContext) => RuleMatch[];
}

export interface Finding {
  ruleId: string;
  ruleName: string;
  category: Category;
  severity: Severity;
  filePath: string;
  line: number;
  column: number;
  message: string;
  remediation: string;
  snippet: string;
}

export interface UnusedIgnore {
  filePath: string;
  line: number;
  ruleId: string;
  scope: 'next-line' | 'file';
}

export interface ScanResult {
  scannedFiles: number;
  findings: Finding[];
  unusedIgnores: UnusedIgnore[];
  errors: string[];
}

export interface HonedConfig {
  ignorePaths?: string[];
  disableRules?: string[];
  maxFileLines?: number;
}

export interface ScanOptions {
  cwd: string;
  config?: HonedConfig;
  reportUnusedIgnores?: boolean;
}
