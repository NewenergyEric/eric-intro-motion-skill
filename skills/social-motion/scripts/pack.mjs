import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseArgs } from '../../motion-story/scripts/cli.mjs';
import { renderStory } from '../../motion-story/scripts/render.mjs';

const presetsFile = fileURLToPath(new URL('../assets/presets.json', import.meta.url));
const catalog = JSON.parse(await readFile(presetsFile, 'utf8'));

async function main() {
  if (process.argv.includes('--help')) {
    console.log('node scripts/pack.mjs --input story.json --out social-pack [--presets linkedin,x,moments,vertical,square --formats mp4,gif,png --gif-width 720 --force]');
    console.log('Re-renders the source story. Requires the sibling motion-story skill and its npm dependencies.');
    return;
  }
  const args = parseArgs(process.argv.slice(2), ['input', 'out', 'presets', 'formats', 'gif-width']);
  if (!args.input || !args.out) throw new Error('--input and --out are required.');
  const names = (args.presets || 'linkedin,x,moments').split(',');
  if (new Set(names).size !== names.length) throw new Error('Duplicate presets are not allowed.');
  for (const name of names) if (!Object.hasOwn(catalog.presets, name)) throw new Error(`Unknown preset: ${name}. Available: ${Object.keys(catalog.presets).join(', ')}`);
  const story = JSON.parse(await readFile(args.input, 'utf8'));
  const report = { storyId: story.id, presetRulesCheckedOn: catalog.verifiedOn, note: catalog.note, outputs: {} };
  for (const name of names) {
    const preset = catalog.presets[name];
    const item = await renderStory(story, { ...preset, out: path.join(args.out, name), formats: args.formats?.split(','), gifWidth: args['gif-width'] ? Number(args['gif-width']) : 720, force: args.force, onProgress: message => console.log(`[${name}] ${message}`) });
    report.outputs[name] = { ...item, recommendationStatus: preset.status, scope: preset.scope };
  }
  await mkdir(args.out, { recursive: true });
  await writeFile(path.join(args.out, 'social-pack.json'), JSON.stringify(report, null, 2) + '\n');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
