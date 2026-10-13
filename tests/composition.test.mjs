import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeComposition } from '../skills/eric-intro-motion-skill/scripts/core.mjs';

const example = name => readFile(new URL(`../skills/eric-intro-motion-skill/assets/examples/${name}.json`, import.meta.url), 'utf8').then(JSON.parse);
const { presets } = JSON.parse(await readFile(new URL('../skills/social-motion/assets/presets.json', import.meta.url), 'utf8'));
const stories = await Promise.all(['idea-to-post', 'agents-at-work', 'keep-the-feeling'].map(example));
const normalize = value => value.replace(/\s/g, '');

test('English and Chinese keep every text field inside each target safe area', () => {
  for (const story of stories) for (const preset of Object.values(presets)) {
    const { metadata, frame } = makeComposition(story, preset);
    assert.equal(metadata.text.length, 10);
    assert.equal(normalize(metadata.text.find(x => x.field === 'title').lines.join('')), normalize(story.title));
    story.cards.forEach((card, i) => {
      assert.equal(normalize(metadata.text.find(x => x.field === `cards[${i}].caption`).lines.join('')), normalize(card.caption));
    });
    const a = metadata.safeArea;
    for (const entry of metadata.text) for (const b of entry.bounds) {
      assert.ok(b.x >= a.x - 1 && b.y >= a.y - 1 && b.x + b.w <= a.x + a.w + 1 && b.y + b.h <= a.y + a.h + 1);
    }
    assert.equal(frame(0), frame(story.duration), 'loop endpoints are deterministic');
    assert.notEqual(frame(0), frame(story.duration * 0.28), 'objects move within the story');
  }
});

test('ratio adaptation reflows card positions and keeps the source unchanged', () => {
  const story = structuredClone(stories[0]), original = JSON.stringify(story);
  const landscape = makeComposition(story, presets.x).metadata;
  const portrait = makeComposition(story, presets.linkedin).metadata;
  const position = (meta, index) => meta.text.find(x => x.field === `cards[${index}].label`).box;
  assert.equal(position(landscape, 0).y, position(landscape, 2).y);
  assert.equal(position(portrait, 0).x, position(portrait, 2).x);
  assert.ok(position(portrait, 0).y < position(portrait, 2).y);
  assert.equal(JSON.stringify(story), original);
});

test('unsafe dimensions, oversized copy, and unavailable glyphs fail clearly', () => {
  assert.throws(() => makeComposition(stories[0], { width: 1081, height: 1080 }), /even integers/);
  assert.throws(() => makeComposition(stories[0], { width: 480, height: 1920 }), /ratios/);
  assert.throws(() => makeComposition({ ...stories[0], title: 'A very long title. '.repeat(40) }, presets.moments), /overflow/);
  assert.throws(() => makeComposition({ ...stories[0], title: '\u{10FFFF}' }, presets.x), /Font is missing/);
  assert.throws(() => makeComposition({ ...stories[0], cards: stories[0].cards.slice(0, 2) }, presets.x), /three cards/);
});
