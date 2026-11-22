import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROVIDERS, transformSkillMarkdown, validateSkillLinks } from './lib/transformers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SKILL_DIR = path.join(ROOT, 'skill');
const DIST_SKILLS = path.join(ROOT, 'dist', 'skills');

const MAX_SKILL_MD_BYTES = 16_384;

function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function buildSkills(rootDir = ROOT): { providersBuilt: number; referenceCount: number } {
  const skillDir = path.join(rootDir, 'skill');
  const distSkills = path.join(rootDir, 'dist', 'skills');
  const srcPath = path.join(skillDir, 'SKILL.src.md');
  const refDir = path.join(skillDir, 'reference');

  const source = fs.readFileSync(srcPath, 'utf8');
  const linkErrors = validateSkillLinks(skillDir, source);
  if (linkErrors.length > 0) {
    throw new Error(linkErrors.join('\n'));
  }

  fs.rmSync(distSkills, { recursive: true, force: true });
  fs.mkdirSync(distSkills, { recursive: true });

  const refFiles = fs.readdirSync(refDir).filter((f) => f.endsWith('.md'));
  let providersBuilt = 0;

  for (const provider of Object.values(PROVIDERS)) {
    const outDir = path.join(distSkills, provider.id, 'honed');
    fs.mkdirSync(outDir, { recursive: true });

    const transformed = transformSkillMarkdown(source, provider);
    if (Buffer.byteLength(transformed, 'utf8') > MAX_SKILL_MD_BYTES) {
      throw new Error(
        `Transformed SKILL.md for ${provider.id} exceeds ${MAX_SKILL_MD_BYTES} bytes`,
      );
    }

    fs.writeFileSync(path.join(outDir, 'SKILL.md'), transformed, 'utf8');
    copyDirSync(refDir, path.join(outDir, 'reference'));
    providersBuilt++;
  }

  return { providersBuilt, referenceCount: refFiles.length };
}

if (import.meta.main) {
  const res = buildSkills();
  process.stdout.write(
    `Built honed skills for ${res.providersBuilt} providers (${res.referenceCount} reference playbooks).\n`,
  );
}
