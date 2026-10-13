import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { renderStory } from '../skills/eric-intro-motion-skill/scripts/render.mjs';
import { reframe } from '../skills/social-motion/scripts/reframe.mjs';

test('real MP4 and GIF encode with the expected geometry, duration and frame count', { timeout: 120000 }, async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'eric-intro-motion-skill-test-'));
  try {
    const story = JSON.parse(await readFile(new URL('../skills/eric-intro-motion-skill/assets/examples/idea-to-post.json', import.meta.url), 'utf8'));
    story.duration = 2;
    const result = await renderStory(story, { out, width: 960, height: 540, fps: 20, gifWidth: 480 });
    assert.equal(result.outputs.mp4.width, 960);
    assert.equal(result.outputs.mp4.codec, 'h264');
    assert.equal(result.outputs.mp4.frames, 40);
    assert.ok(result.outputs.mp4.videoBitrate >= 192000, 'vector compression must not undershoot LinkedIn’s documented minimum bitrate');
    assert.equal(result.outputs.gif.width, 480);
    assert.equal(result.outputs.gif.frames, 40);
    assert.equal(result.sampledUniqueFrames, result.sampledFrames);
    const mp4 = await readFile(path.join(out, `${story.id}.mp4`));
    assert.ok(mp4.indexOf(Buffer.from('moov')) < mp4.indexOf(Buffer.from('mdat')), 'faststart metadata precedes media');
    const gif = await readFile(path.join(out, `${story.id}.gif`));
    assert.ok(gif.includes(Buffer.from('NETSCAPE2.0')), 'GIF contains loop extension');
    assert.equal(result.platformPreviewVerified, false);
    await assert.rejects(renderStory(story, { out, width: 960, height: 540, gifWidth: 480, formats: ['png'] }), /already exists/);
    const backdrop = await reframe({ intent: 'embed', input: path.join(out, `${story.id}.gif`), out: path.join(out, 'backdrop.mp4'), preset: 'moments' });
    assert.equal(backdrop.preservesFullSourceFrame, true);
    assert.equal(backdrop.textSafetyVerified, false);
    assert.equal(backdrop.output.width, 1080);
    assert.equal(backdrop.output.height, 1080);
    assert.equal(backdrop.output.frames, 60);
    const crop = await reframe({ intent: 'crop', input: path.join(out, `${story.id}.mp4`), out: path.join(out, 'crop.mp4'), preset: 'linkedin', mode: 'crop', focusX: 0.7 });
    assert.equal(crop.preservesFullSourceFrame, false);
    assert.equal(crop.output.height, 1350);
    assert.ok(crop.output.videoBitrate >= 192000);
    await assert.rejects(reframe({ intent: 'embed', input: path.join(out, 'crop.mp4'), out: path.join(out, 'crop.mp4'), force: true }), /source will not be replaced/);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});
