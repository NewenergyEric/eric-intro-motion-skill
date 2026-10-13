import { readFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'examples/readme');
const exec = promisify(execFile);
const run = async (command, args) => (await exec(command, args, { maxBuffer: 16 * 1024 * 1024, windowsHide: true })).stdout;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
assert.equal(manifest.inputs.length, 4);
assert.equal(manifest.outputs.length, 4);
for (const input of manifest.inputs) {
  assert.equal(digest(await readFile(path.join(root, input.path))), input.sha256, `Stale preview input: ${input.path}`);
}
for (const output of manifest.outputs) {
  const file = path.join(directory, output.path);
  const bytes = await readFile(file);
  assert.equal(bytes.length, output.bytes);
  assert.equal(digest(bytes), output.sha256, file);
  const metadata = JSON.parse(await run('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file]));
  const video = metadata.streams[0];
  assert.equal(video.width, output.width);
  assert.equal(video.height, output.height);
  if (file.endsWith('.gif')) {
    assert.equal(Number(video.nb_read_frames), 480);
    assert.equal(video.r_frame_rate, '20/1');
    assert.ok(Math.abs(Number(metadata.format.duration) - 24) < .02);
    assert.ok(bytes.includes(Buffer.from('21ff0b4e45545343415045322e300301000000', 'hex')), 'Infinite GIF loop extension');
    assert.ok(bytes.length <= manifest.previewBudgetBytes);
    await run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-']);
  }
}
for (const name of ['README.md', 'README.zh-CN.md']) {
  const markdown = await readFile(path.join(root, name), 'utf8');
  const targets = [
    ...Array.from(markdown.matchAll(/(?:href|src|srcset)="([^"]+)"/g), match => match[1]),
    ...Array.from(markdown.matchAll(/\]\(([^\s)]+)\)/g), match => match[1])
  ];
  for (const target of targets) {
    if (/^(https?:|#|data:|mailto:)/.test(target)) continue;
    await stat(path.join(root, decodeURIComponent(target.split(/[?#]/)[0])));
  }
}
console.log('PASS: README local links, four source hashes, two full 20 FPS / 24s looping previews, static covers and byte budgets.');
