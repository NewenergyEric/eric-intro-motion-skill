import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { renderStory } from './render.mjs';

export function parseArgs(argv, valueKeys, flagKeys = ['force']) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    if (!argv[i].startsWith('--') || (!valueKeys.includes(key) && !flagKeys.includes(key))) throw new Error(`Unknown argument: ${argv[i]}`);
    if (flagKeys.includes(key)) result[key] = true;
    else {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value.`);
      result[key] = value;
    }
  }
  return result;
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('node scripts/cli.mjs --input story.json --out output [--width 1920 --height 1080 --fps 30 --gif-width 720 --formats mp4,gif,png --force]');
    return;
  }
  const args = parseArgs(process.argv.slice(2), ['input', 'out', 'width', 'height', 'fps', 'gif-width', 'formats']);
  if (!args.input || !args.out) throw new Error('--input and --out are required. Use --help for usage.');
  const story = JSON.parse(await readFile(args.input, 'utf8'));
  const report = await renderStory(story, { out: args.out, width: args.width ? Number(args.width) : 1920, height: args.height ? Number(args.height) : 1080, fps: args.fps ? Number(args.fps) : 30, gifWidth: args['gif-width'] ? Number(args['gif-width']) : 720, formats: args.formats?.split(','), force: args.force, onProgress: message => console.log(message) });
  console.log(JSON.stringify({ story: story.id, outputs: report.outputs }, null, 2));
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main().catch(error => { console.error(error.message); process.exitCode = 1; });
