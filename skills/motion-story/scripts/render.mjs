import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile, readFile, stat, access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Resvg } from '@resvg/resvg-js';
import { makeComposition } from './core.mjs';

export function run(command, args, { input } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr = (stderr + data).slice(-12000); });
    child.on('error', error => reject(new Error(`${command}: ${error.message}. Install FFmpeg and put ffmpeg/ffprobe on PATH if missing.`)));
    child.on('close', code => code === 0 ? resolve(stdout) : reject(new Error(`${command} exited ${code}: ${stderr}`)));
    if (input) child.stdin.end(input);
  });
}

export async function probe(file) {
  return JSON.parse(await run('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file]));
}

export function png(svg, width) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } }).render().asPng();
}

async function encode(composition, file, fps, onProgress) {
  const count = Math.round(composition.story.duration * fps);
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'png', '-i', 'pipe:0', '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000', '-map', '0:v:0', '-map', '1:a:0', '-frames:v', String(count), '-t', String(count / fps), '-c:v', 'libx264', '-preset', 'medium', '-b:v', '1M', '-minrate', '1M', '-maxrate', '1M', '-bufsize', '2M', '-x264-params', 'nal-hrd=cbr', '-pix_fmt', 'yuv420p', '-vf', 'setsar=1', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', '-threads', '4', file];
  const child = spawn('ffmpeg', args, { windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', data => { stderr = (stderr + data).slice(-12000); });
  const completed = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`MP4 encoding failed (${code}): ${stderr}`)));
  });
  completed.catch(() => {}); // Observe immediately; report the error after ending the frame stream.
  let streamError;
  child.stdin.on('error', error => { streamError = error; });
  try {
    for (let i = 0; i < count; i++) {
      if (streamError) throw streamError;
      const bytes = png(composition.frame(i / fps), composition.metadata.width);
      if (!child.stdin.write(bytes)) await once(child.stdin, 'drain');
      if (i % Math.max(1, Math.floor(count / 4)) === 0) onProgress?.(`frames ${i}/${count}`);
    }
    child.stdin.end();
    await completed;
  } catch (error) {
    child.kill();
    await completed.catch(() => {});
    throw new Error(`${error.message}${stderr ? `\n${stderr}` : ''}`);
  }
}

export async function inspectVideo(file, { width, height, duration, fps, gif = false }) {
  const data = await probe(file);
  const v = data.streams.find(stream => stream.codec_type === 'video');
  if (!v) throw new Error(`No video stream: ${file}`);
  const actualDuration = Number(v.duration || data.format.duration);
  if (v.width !== width || v.height !== height) throw new Error(`Unexpected output dimensions ${v.width}x${v.height}; expected ${width}x${height}.`);
  if (!Number.isFinite(actualDuration) || Math.abs(actualDuration - duration) > 0.11) throw new Error(`Unexpected duration ${actualDuration}; expected ${duration}.`);
  if (Math.abs(Number(v.nb_read_frames) - Math.round(duration * fps)) > 1) throw new Error('Encoded frame count does not match the frame clock.');
  if (!gif && (v.codec_name !== 'h264' || v.pix_fmt !== 'yuv420p' || v.sample_aspect_ratio !== '1:1')) throw new Error('MP4 must be H.264, yuv420p, square pixels.');
  if (!gif && !data.streams.some(stream => stream.codec_name === 'aac')) throw new Error('The compatibility AAC audio stream is missing.');
  const bytes = (await stat(file)).size;
  return { width: v.width, height: v.height, seconds: actualDuration, frames: Number(v.nb_read_frames), codec: v.codec_name, pixelFormat: v.pix_fmt, videoBitrate: Number(v.bit_rate) || null, bytes, sha256: createHash('sha256').update(await readFile(file)).digest('hex') };
}

export async function renderStory(story, options = {}) {
  const { width = 1920, height = 1080, safe, out, fps = 30, gifWidth = 720, formats = ['mp4', 'gif', 'png'], force = false, onProgress } = options;
  if (!out) throw new Error('An output directory is required.');
  if (![20, 24, 25, 30, 60].includes(fps)) throw new Error('fps must be 20, 24, 25, 30, or 60.');
  if (!Number.isInteger(gifWidth) || gifWidth < 240 || gifWidth > width || gifWidth % 2) throw new Error('gifWidth must be even, at least 240, and no wider than the source.');
  if (!formats.length || formats.some(item => !['mp4', 'gif', 'png'].includes(item))) throw new Error('formats must contain mp4, gif, and/or png.');
  const composition = makeComposition(story, { width, height, safe });
  const directory = path.resolve(out), base = path.join(directory, story.id);
  const files = ['.svg', '.png', '-safe.png', '.story.json', '.report.json', ...formats.filter(x => x !== 'png').map(x => `.${x}`)];
  if (!force) for (const suffix of files) {
    const exists = await access(base + suffix).then(() => true, () => false);
    if (exists) throw new Error(`Output already exists: ${base + suffix}. Choose a new directory or use --force.`);
  }
  await mkdir(directory, { recursive: true });
  const posterAt = story.duration * 0.28;
  const svg = composition.frame(posterAt);
  await writeFile(base + '.svg', svg);
  await writeFile(base + '.png', png(svg, width));
  await writeFile(base + '-safe.png', png(composition.frame(posterAt, { guide: true }), Math.min(width, 900)));
  await writeFile(base + '.story.json', JSON.stringify(story, null, 2) + '\n');
  const samples = [0, 0.13, 0.28, 0.47, 0.63, 0.81].map(p => createHash('sha256').update(png(composition.frame(p * story.duration), 480)).digest('hex'));
  if (new Set(samples).size !== samples.length) throw new Error('Motion check failed: sampled frames repeat unexpectedly.');
  const report = { schemaVersion: 1, storyId: story.id, composition: composition.metadata, sampledUniqueFrames: new Set(samples).size, sampledFrames: samples.length, nativeNoPadding: true, platformPreviewVerified: false, outputs: {} };
  if (formats.includes('mp4') || formats.includes('gif')) {
    await run('ffmpeg', ['-version']);
    await run('ffprobe', ['-version']);
    const scratch = await mkdtemp(path.join(tmpdir(), 'motion-story-'));
    try {
      const movie = formats.includes('mp4') ? base + '.mp4' : path.join(scratch, 'source.mp4');
      onProgress?.(`encoding ${width}x${height}`);
      await encode(composition, movie, fps, onProgress);
      const encodedDuration = Math.round(story.duration * fps) / fps;
      const movieReport = await inspectVideo(movie, { width, height, duration: encodedDuration, fps });
      if (formats.includes('mp4')) report.outputs.mp4 = movieReport;
      if (formats.includes('gif')) {
        onProgress?.('building GIF palette');
        const palette = path.join(scratch, 'palette.png');
        const scale = `fps=20,scale=${gifWidth}:-1:flags=lanczos`;
        await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', movie, '-vf', `${scale},palettegen=max_colors=128:reserve_transparent=0`, '-frames:v', '1', '-update', '1', palette]);
        await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', movie, '-i', palette, '-filter_complex', `[0:v]${scale}[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, '-loop', '0', '-an', base + '.gif']);
        const gifHeight = Math.round(height * gifWidth / width);
        report.outputs.gif = await inspectVideo(base + '.gif', { width: gifWidth, height: gifHeight, duration: encodedDuration, fps: 20, gif: true });
        report.outputs.gif.under5MB = report.outputs.gif.bytes <= 5_000_000;
      }
    } finally {
      // Only remove the fresh directory returned by mkdtemp, never a caller-provided path.
      await rm(scratch, { recursive: true, force: true });
    }
  }
  await writeFile(base + '.report.json', JSON.stringify(report, null, 2) + '\n');
  onProgress?.(`ready: ${directory}`);
  return report;
}
