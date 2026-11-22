import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildSkills } from '../../scripts/build.js';
import { runDoctor } from '../../src/cli/doctor.js';
import { installSkill } from '../../src/cli/install.js';
import { managePin } from '../../src/cli/pin.js';

describe('CLI install, pin, and doctor', () => {
  test('installs into project, pins/unpins a command, and runs doctor', () => {
    const pkgRoot = path.resolve(import.meta.dir, '..', '..');
    buildSkills(pkgRoot);

    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'honed-cli-'));
    try {
      const report = installSkill({
        cwd: projectDir,
        homeDir: projectDir,
        providers: ['claude-code'],
        scope: 'project',
        withHooks: true,
        packageRoot: pkgRoot,
      });

      expect(report.installed).toHaveLength(1);
      expect(fs.existsSync(path.join(projectDir, '.claude', 'skills', 'honed', 'SKILL.md'))).toBe(
        true,
      );
      expect(fs.existsSync(path.join(projectDir, '.claude', 'settings.json'))).toBe(true);

      const pinned = managePin({
        action: 'pin',
        command: 'audit',
        cwd: projectDir,
        homeDir: projectDir,
        providers: ['claude-code'],
        scope: 'project',
      });
      expect(pinned).toHaveLength(1);
      expect(fs.existsSync(path.join(projectDir, '.claude', 'skills', 'audit', 'SKILL.md'))).toBe(
        true,
      );

      managePin({
        action: 'unpin',
        command: 'audit',
        cwd: projectDir,
        homeDir: projectDir,
        providers: ['claude-code'],
        scope: 'project',
      });
      expect(fs.existsSync(path.join(projectDir, '.claude', 'skills', 'audit'))).toBe(false);

      const doc = runDoctor(projectDir, projectDir);
      expect(doc.installedProviders.map((p) => p.id)).toContain('claude-code');
      expect(doc.architectureMdPresent).toBe(false);
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });
});
