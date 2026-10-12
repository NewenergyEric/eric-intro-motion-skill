import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderStory, png } from '../skills/motion-story/scripts/render.mjs';
import { makeComposition } from '../skills/motion-story/scripts/core.mjs';
import { textBox } from '../skills/motion-story/scripts/text.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(await readFile(path.join(root, 'skills/social-motion/assets/presets.json'), 'utf8'));
const jobs = [['idea-to-post', 'x'], ['idea-to-post', 'linkedin'], ['idea-to-post', 'moments'], ['idea-to-post', 'vertical'], ['agents-at-work', 'x'], ['keep-the-feeling', 'moments']];
const results = [];
for (const [name, target] of jobs) {
  const story = JSON.parse(await readFile(path.join(root, `skills/motion-story/assets/examples/${name}.json`), 'utf8'));
  const out = path.join(root, 'examples', name, target);
  const report = await renderStory(story, { ...catalog.presets[target], out, force: process.argv.includes('--force'), onProgress: message => console.log(`${name}/${target}: ${message}`) });
  results.push({ name, target, ...report.outputs });
}
await writeFile(path.join(root, 'examples/catalog.json'), JSON.stringify({ generatedBy: 'npm run examples', rulesCheckedOn: catalog.verifiedOn, examples: results }, null, 2) + '\n');

// Compare the native compositions at the same display height, without altering their aspect ratios.
const source = JSON.parse(await readFile(path.join(root, 'skills/motion-story/assets/examples/idea-to-post.json'), 'utf8'));
const panels = [], names = ['x', 'moments', 'linkedin', 'vertical'];
let x = 40;
for (const name of names) {
  const preset = catalog.presets[name], h = 330, w = h * preset.width / preset.height;
  const composition = makeComposition(source, preset);
  const bytes = png(composition.frame(2.24), 720);
  const label = { x, y: 405, w, h: 55 };
  panels.push(`<image x="${x}" y="60" width="${w}" height="${h}" href="data:image/png;base64,${bytes.toString('base64')}"/>`);
  panels.push(textBox({ x: '16:9 / X', moments: '1:1 / Moments', linkedin: '4:5 / LinkedIn', vertical: '9:16 / Vertical' }[name], label, { size: 18, weight: 650, field: 'comparison label' }).svg);
  x += w + 26;
}
const comparison = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(x + 14)}" height="480"><rect width="100%" height="100%" fill="#e5eae7"/>${panels.join('')}</svg>`;
await writeFile(path.join(root, 'examples/ratio-comparison.png'), png(comparison, Math.ceil(x + 14)));
console.log(`Built ${results.length} examples and the ratio comparison.`);
