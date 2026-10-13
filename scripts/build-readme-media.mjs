// Package finished films for GitHub's README. No artwork or source scene is re-rendered.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir, copyFile, mkdtemp, rm, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
let out = path.join(root, 'examples/readme');
let force = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out' && args[i + 1] && !args[i + 1].startsWith('--')) out = path.resolve(args[++i]);
  else if (args[i] === '--force') force = true;
  else throw new Error('Usage: node scripts/build-readme-media.mjs [--out directory] [--force]');
}
const files = ['hero-en.gif', 'hero-en.png', 'three-formats-en.gif', 'three-formats-en.png', 'manifest.json'];
for (const file of files) {
  if (!force && await access(path.join(out, file)).then(() => true, () => false)) {
    throw new Error(`${file} already exists; choose --out or deliberately use --force.`);
  }
}
await mkdir(out, { recursive: true });
await mkdir(path.join(root, '.work'), { recursive: true });
const stage = await mkdtemp(path.join(root, '.work/readme-media-'));
const run = async (command, parameters) => (await exec(command, parameters, { cwd: stage, maxBuffer: 32 * 1024 * 1024, windowsHide: true })).stdout;
const ffmpeg = parameters => run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...parameters]);
const probe = async file => JSON.parse(await run('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file]));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const digest = async file => sha256(await readFile(file));
const palette = '[frame]split[pixels][palette];[palette]palettegen=max_colors=64:stats_mode=diff[colors];[pixels][colors]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle[out]';
const hero = 'examples/materials-update/latest-source-en.mp4';
const native = ['square', 'portrait', 'vertical'].map(ratio => `examples/tidekeeper/tidekeeper-en-${ratio}/film.mp4`);

try {
  const inputRecords = [];
  for (const file of [hero, ...native]) {
    const metadata = await probe(path.join(root, file));
    const video = metadata.streams.find(stream => stream.codec_type === 'video');
    assert.equal(Number(video.nb_read_frames), 720, `Expected a completed 24-second source: ${file}`);
    assert.ok(!video.sample_aspect_ratio || video.sample_aspect_ratio === '1:1', `Non-square source pixels: ${file}`);
    assert.ok(Math.abs(Number(video.duration) - 24) < .01);
    inputRecords.push({ path: file, sha256: await digest(path.join(root, file)), width: video.width, height: video.height, durationSeconds: Number(video.duration) });
  }
  for (let i = 0; i < native.length; i++) {
    assert.equal(inputRecords[i + 1].width, 1080);
    assert.equal(inputRecords[i + 1].height, [1080, 1440, 1920][i]);
  }
  await copyFile(path.join(root, 'skills/eric-intro-motion-skill/assets/fonts/NotoSansSC.ttf'), path.join(stage, 'font.ttf'));
  for (const [i, label] of ['SQUARE  1:1', 'PORTRAIT  3:4', 'VERTICAL  9:16'].entries()) {
    await writeFile(path.join(stage, `label-${i}.txt`), label);
  }
  const comparison = [
    '[0:v]setpts=PTS-STARTPTS,fps=20,scale=352:352:flags=lanczos,setsar=1,pad=368:424:16:52:color=0xeaf0e5[a]',
    '[1:v]setpts=PTS-STARTPTS,fps=20,scale=264:352:flags=lanczos,setsar=1,pad=280:424:16:52:color=0xeaf0e5[b]',
    '[2:v]setpts=PTS-STARTPTS,fps=20,scale=198:352:flags=lanczos,setsar=1,pad=230:424:16:52:color=0xeaf0e5[c]',
    '[a][b][c]hstack=inputs=3:shortest=1,' + [
      'drawtext=fontfile=font.ttf:textfile=label-0.txt:fontsize=18:fontcolor=0x194f48:x=16+(352-text_w)/2:y=16',
      'drawtext=fontfile=font.ttf:textfile=label-1.txt:fontsize=18:fontcolor=0x194f48:x=384+(264-text_w)/2:y=16',
      'drawtext=fontfile=font.ttf:textfile=label-2.txt:fontsize=18:fontcolor=0x194f48:x=664+(198-text_w)/2:y=16'
    ].join(',') + '[frame]'
  ].join(';');
  const jobs = [
    { name: 'hero-en', inputs: [hero], graph: '[0:v]fps=20,scale=800:450:flags=lanczos,setsar=1[frame]', posterTime: 18, width: 800, height: 450 },
    { name: 'three-formats-en', inputs: native, graph: comparison, posterTime: 19.8, width: 878, height: 424 }
  ];
  const outputs = [];
  for (const job of jobs) {
    const inputArgs = job.inputs.flatMap(file => ['-i', path.join(root, file)]);
    const gif = path.join(stage, `${job.name}.gif`);
    const poster = path.join(stage, `${job.name}.png`);
    await ffmpeg([...inputArgs, '-filter_complex', `${job.graph};${palette}`, '-map', '[out]', '-an', '-loop', '0', gif]);
    // Select after composition, preserving matching timestamps for all three films.
    await ffmpeg([...inputArgs, '-filter_complex', `${job.graph};[frame]select=gte(t\\,${job.posterTime})[poster]`, '-map', '[poster]', '-frames:v', '1', poster]);
    const metadata = await probe(gif);
    const video = metadata.streams.find(stream => stream.codec_type === 'video');
    const bytes = await readFile(gif);
    assert.equal(video.width, job.width);
    assert.equal(video.height, job.height);
    assert.equal(Number(video.nb_read_frames), 480);
    assert.ok(Math.abs(Number(metadata.format.duration) - 24) < .02);
    assert.ok(bytes.includes(Buffer.from('NETSCAPE2.0')), 'GIF must loop');
    assert.ok(bytes.length <= 6 * 1024 * 1024, `${job.name}: ${(bytes.length / 1048576).toFixed(2)} MiB exceeds the 6 MiB project budget`);
    await ffmpeg(['-i', gif, '-f', 'null', '-']);
    for (const file of [gif, poster]) outputs.push({ path: path.basename(file), bytes: (await readFile(file)).length, sha256: await digest(file), width: job.width, height: job.height, ...(file === gif ? { fps: 20, frames: 480, durationSeconds: 24, loop: 'infinite', fullDecodePassed: true } : {}) });
    console.log(`${job.name}: ${job.width}x${job.height}, 24s / 480 frames / ${(bytes.length / 1048576).toFixed(2)} MiB`);
  }
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: 'English GitHub README animation previews; static posters for reduced motion',
    previewBudgetBytes: 6 * 1024 * 1024,
    inputs: inputRecords,
    sourceRevisions: { hero: '04f183050a5d1122648a9c5aa35b998f325bf08f', nativeArtwork: 'a6d17d873845ebeeb530fdf295b9d527c6ac2181' },
    comparison: { matchingTimestamps: true, nativeFilmsAlreadyComposed: true, sourceFrameCropping: false, note: 'Comparison displays the earlier native edit. The hero is the later English source film.' },
    outputs,
    browserVerification: 'Separate from encoding; see visual-review.md'
  };
  await writeFile(path.join(stage, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  for (const file of files) await copyFile(path.join(stage, file), path.join(out, file));
} finally {
  await rm(stage, { recursive: true, force: true });
}
