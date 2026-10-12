import { cp, mkdir, access, copyFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--dest')) throw new Error('Usage: node scripts/install.mjs [--dest /path/to/skills]');
const destination = path.resolve(args[1] || path.join(process.env.CODEX_HOME || path.join(homedir(), '.codex'), 'skills'));
const names = ['motion-story', 'social-motion'];
for (const name of names) {
  const target = path.join(destination, name);
  if (await access(target).then(() => true, () => false)) throw new Error(`${target} already exists. Existing skills will not be overwritten; choose another destination or update the files you intend to change.`);
}
await mkdir(destination, { recursive: true });
for (const name of names) {
  const source = path.join(root, 'skills', name), target = path.join(destination, name);
  await cp(source, target, { recursive: true, filter: entry => !path.relative(source, entry).split(path.sep).some(part => ['node_modules', 'output', '__pycache__'].includes(part)) });
  await copyFile(path.join(root, 'LICENSE'), path.join(target, 'LICENSE'));
  await copyFile(path.join(root, 'THIRD_PARTY_NOTICES.md'), path.join(target, 'THIRD_PARTY_NOTICES.md'));
}
console.log(`Installed both skill folders into ${destination}`);
console.log('Next, install the base skill runtime with:');
console.log(`npm ci --prefix "${path.join(destination, 'motion-story')}"`);
console.log('Refresh skill discovery or start a new Codex session if the new skills are not listed yet.');
