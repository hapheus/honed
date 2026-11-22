import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface CliProvider {
  id: string;
  displayName: string;
  configDir: string;
  globalSkillsDir: string;
  hooksManifestRel?: string;
}

export const CLI_PROVIDERS: Record<string, CliProvider> = {
  'claude-code': {
    id: 'claude-code',
    displayName: 'Claude Code',
    configDir: '.claude',
    globalSkillsDir: '.claude/skills',
    hooksManifestRel: 'settings.json',
  },
  cursor: {
    id: 'cursor',
    displayName: 'Cursor',
    configDir: '.cursor',
    globalSkillsDir: '.cursor/skills',
    hooksManifestRel: 'hooks.json',
  },
  codex: {
    id: 'codex',
    displayName: 'Codex CLI',
    configDir: '.codex',
    globalSkillsDir: '.codex/skills',
    hooksManifestRel: 'hooks.json',
  },
  agents: {
    id: 'agents',
    displayName: 'Agent Skills (.agents)',
    configDir: '.agents',
    globalSkillsDir: '.agents/skills',
  },
  github: {
    id: 'github',
    displayName: 'GitHub Copilot',
    configDir: '.github',
    globalSkillsDir: '.copilot/skills',
    hooksManifestRel: 'hooks/honed.json',
  },
  gemini: {
    id: 'gemini',
    displayName: 'Gemini CLI',
    configDir: '.gemini',
    globalSkillsDir: '.gemini/skills',
  },
  antigravity: {
    id: 'antigravity',
    displayName: 'Antigravity',
    configDir: '.agent',
    globalSkillsDir: '.gemini/skills',
  },
  opencode: {
    id: 'opencode',
    displayName: 'OpenCode',
    configDir: '.opencode',
    globalSkillsDir: '.config/opencode/skills',
  },
};

export function detectProviders(cwd: string, homeDir = os.homedir()): CliProvider[] {
  const found: CliProvider[] = [];
  for (const provider of Object.values(CLI_PROVIDERS)) {
    const projectDir = path.join(cwd, provider.configDir);
    const globalDir = path.join(homeDir, provider.configDir);
    if (fs.existsSync(projectDir) || fs.existsSync(globalDir)) {
      found.push(provider);
    }
  }
  return found;
}

export function resolveProviderList(
  names: string[] | undefined,
  cwd: string,
  homeDir = os.homedir(),
): CliProvider[] {
  if (!names || names.length === 0) {
    const detected = detectProviders(cwd, homeDir);
    return detected.length > 0 ? detected : [CLI_PROVIDERS['claude-code'] as CliProvider];
  }

  const resolved: CliProvider[] = [];
  for (const raw of names) {
    const key = raw.trim().toLowerCase();
    const provider = CLI_PROVIDERS[key];
    if (!provider) {
      throw new Error(
        `Unknown provider "${raw}". Valid providers: ${Object.keys(CLI_PROVIDERS).join(', ')}`,
      );
    }
    resolved.push(provider);
  }
  return resolved;
}
