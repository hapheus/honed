import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveProviderList } from './providers.js';

const PINNABLE_COMMANDS = new Set([
  'init',
  'audit',
  'simplify',
  'architect',
  'refactor',
  'harden',
  'optimize',
  'test',
  'observe',
  'productionize',
  'deslop',
  'polish',
  'doctor',
]);

export interface PinOptions {
  action: 'pin' | 'unpin';
  command: string;
  cwd: string;
  homeDir?: string;
  providers?: string[];
  scope?: 'project' | 'global';
}

export function managePin(options: PinOptions): string[] {
  const cmd = options.command.trim().toLowerCase();
  if (!PINNABLE_COMMANDS.has(cmd)) {
    throw new Error(
      `Unknown command "${options.command}". Pinnable commands: ${Array.from(PINNABLE_COMMANDS).join(', ')}`,
    );
  }

  const homeDir = options.homeDir ?? os.homedir();
  const scope = options.scope ?? 'project';
  const providers = resolveProviderList(options.providers, options.cwd, homeDir);
  const touched: string[] = [];

  for (const provider of providers) {
    const baseSkills =
      scope === 'global'
        ? path.join(homeDir, provider.globalSkillsDir)
        : path.join(options.cwd, provider.configDir, 'skills');
    const pinDir = path.join(baseSkills, cmd);

    if (options.action === 'unpin') {
      if (fs.existsSync(pinDir)) {
        fs.rmSync(pinDir, { recursive: true, force: true });
        touched.push(pinDir);
      }
      continue;
    }

    const playbookPath = path.join(baseSkills, 'honed', 'reference', `${cmd}.md`);
    if (!fs.existsSync(playbookPath)) {
      throw new Error(
        `Honed is not installed for ${provider.id} at ${baseSkills}. Run "honed install" first.`,
      );
    }

    fs.mkdirSync(pinDir, { recursive: true });
    const shortcutContent = [
      '---',
      `name: ${cmd}`,
      `description: "Shortcut for /honed ${cmd}."`,
      'user-invocable: true',
      '---',
      '',
      `Read and follow \`../honed/reference/${cmd}.md\` and \`../honed/reference/engineering-floor.md\` before editing code.`,
      '',
    ].join('\n');

    fs.writeFileSync(path.join(pinDir, 'SKILL.md'), shortcutContent, 'utf8');
    touched.push(pinDir);
  }

  return touched;
}
