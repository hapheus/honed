import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanTargets } from '../detect/scanner.js';
import { detectProviders } from './providers.js';

export interface DoctorReport {
  architectureMdPresent: boolean;
  configJsonValid: boolean;
  installedProviders: Array<{ id: string; path: string }>;
  unusedIgnoresCount: number;
  issues: string[];
}

export function runDoctor(cwd: string, homeDir = os.homedir()): DoctorReport {
  const issues: string[] = [];

  const archPath = path.join(cwd, 'ARCHITECTURE.md');
  const architectureMdPresent = fs.existsSync(archPath);
  if (!architectureMdPresent) {
    issues.push(
      'ARCHITECTURE.md not found. Run `/honed init` in your agent to capture project context.',
    );
  }

  const configPath = path.join(cwd, '.honed', 'config.json');
  let configJsonValid = false;
  if (fs.existsSync(configPath)) {
    try {
      JSON.parse(fs.readFileSync(configPath, 'utf8'));
      configJsonValid = true;
    } catch {
      issues.push('.honed/config.json contains invalid JSON.');
    }
  } else {
    issues.push('.honed/config.json not found (optional, created by `/honed init`).');
  }

  const installedProviders: Array<{ id: string; path: string }> = [];
  for (const p of detectProviders(cwd, homeDir)) {
    const projectSkill = path.join(cwd, p.configDir, 'skills', 'honed', 'SKILL.md');
    const globalSkill = path.join(homeDir, p.globalSkillsDir, 'honed', 'SKILL.md');
    if (fs.existsSync(projectSkill)) {
      installedProviders.push({ id: p.id, path: projectSkill });
    } else if (fs.existsSync(globalSkill)) {
      installedProviders.push({ id: p.id, path: globalSkill });
    }
  }

  if (installedProviders.length === 0) {
    issues.push(
      'Honed skill is not installed for any detected AI provider. Run `npx honed install`.',
    );
  }

  const scan = scanTargets(['.'], { cwd, reportUnusedIgnores: true });
  if (scan.unusedIgnores.length > 0) {
    issues.push(`${scan.unusedIgnores.length} unused inline ignore directive(s) found.`);
  }

  return {
    architectureMdPresent,
    configJsonValid,
    installedProviders,
    unusedIgnoresCount: scan.unusedIgnores.length,
    issues,
  };
}
