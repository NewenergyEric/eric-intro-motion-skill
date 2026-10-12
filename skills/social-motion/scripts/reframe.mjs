import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { parseArgs } from '../../motion-story/scripts/cli.mjs';
import { probe, run, inspectVideo } from '../../motion-story/scripts/render.mjs';

const catalog = JSON.parse(await readFile(new URL('../assets/presets.json', import.meta.url), 'utf8'));

export async function reframe({ input, out, preset = 'moments', mode = 'backdrop', focusX = 0.5, focusY = 0.5, force = false }) {
  if (!input || !out) throw new Error('input and out are required.');
  if (!Object.hasOwn(catalog.presets, preset)) throw new Error(`Unknown preset: ${preset}`);
  if (!['backdrop', 'crop'].includes(mode)) throw new Error('mode must be backdrop or crop.');
  if (![focusX, focusY].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) throw new Error('Focus coordinates must be between 0 and 1.');
  const sourcePath = path.resolve(input), targetPath = path.resolve(out);
  if (sourcePath.toLowerCase() === targetPath.toLowerCase()) throw new Error('Choose a different output path; the source will not be replaced.');
  if (path.extname(targetPath).toLowerCase() !== '.mp4') throw new Error('The reframe output must end in .mp4.');
  for (const file of [targetPath, `${targetPath}.report.json`]) if (!force && await access(file).then(() => true, () => false)) throw new Error(`Output already exists: ${file}. Use a new path or --force.`);
  const source = await probe(sourcePath), video = source.streams.find(stream => stream.codec_type === 'video');
  if (!video) throw new Error('No video stream found in the source.');
  const duration = Number(video.duration || source.format.duration);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Cannot determine source duration.');
  const frameCount = Math.max(1, Math.round(duration * 30)), outputDuration = frameCount / 30;
  const { width: w, height: h } = catalog.presets[preset];
  // Older FFmpeg builds end a decoded GIF at the last frame timestamp instead of
  // including its display delay. Pad the end, then trim to our explicit clock.
  const finish = `setsar=1,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1,fps=30,trim=end_frame=${frameCount},format=yuv420p[v]`;
  const filters = mode === 'backdrop'
    ? `[0:v]split=2[bgsrc][fgsrc];[bgsrc]scale=${w}:${h}:force_original_aspect_ratio=increase:force_divisible_by=2,crop=${w}:${h},gblur=sigma=35,eq=brightness=-0.08:saturation=0.65[bg];[fgsrc]scale=${w}:${h}:force_original_aspect_ratio=decrease:force_divisible_by=2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2:shortest=1,${finish}`
    : `[0:v]scale=${w}:${h}:force_original_aspect_ratio=increase:force_divisible_by=2,crop=${w}:${h}:(iw-ow)*${focusX}:(ih-oh)*${focusY},${finish}`;
  const hasAudio = source.streams.some(stream => stream.codec_type === 'audio');
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', sourcePath];
  if (!hasAudio) args.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000');
  args.push('-filter_complex', filters, '-map', '[v]', '-map', hasAudio ? '0:a:0' : '1:a:0', '-frames:v', String(frameCount), '-t', String(outputDuration), '-c:v', 'libx264', '-preset', 'medium');
  if (preset === 'linkedin') args.push('-b:v', '4M', '-minrate', '4M', '-maxrate', '4M', '-bufsize', '8M', '-x264-params', 'nal-hrd=cbr');
  else args.push('-crf', '20');
  args.push('-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-threads', '4', targetPath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await run('ffmpeg', args);
  const output = await inspectVideo(targetPath, { width: w, height: h, duration: outputDuration, fps: 30 });
  const report = { mode, preset, sourceSeconds: duration, output, preservesFullSourceFrame: mode === 'backdrop', addsBlackPadding: false, nativeReflow: false, textSafetyVerified: false, platformPreviewVerified: false, note: mode === 'backdrop' ? 'The whole source is fitted over a blurred duplicate. Existing borders stay part of the source; check text readability and platform preview.' : 'The source is deliberately cropped. Inspect the result for lost text and faces before publishing.' };
  await writeFile(`${targetPath}.report.json`, JSON.stringify(report, null, 2) + '\n');
  return report;
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('node scripts/reframe.mjs --input existing.mp4 --out adapted.mp4 [--preset moments --mode backdrop|crop --focus-x 0.5 --focus-y 0.5 --force]');
    return;
  }
  const args = parseArgs(process.argv.slice(2), ['input', 'out', 'preset', 'mode', 'focus-x', 'focus-y']);
  console.log(JSON.stringify(await reframe({ input: args.input, out: args.out, preset: args.preset, mode: args.mode, focusX: args['focus-x'] === undefined ? 0.5 : Number(args['focus-x']), focusY: args['focus-y'] === undefined ? 0.5 : Number(args['focus-y']), force: args.force }), null, 2));
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main().catch(error => { console.error(error.message); process.exitCode = 1; });
