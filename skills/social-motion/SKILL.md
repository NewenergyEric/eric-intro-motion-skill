---
name: social-motion
description: Adapt GIF/MP4 and editable motion recipes to LinkedIn, X, WeChat Moments, Xiaohongshu, and other ratios. Re-layout vectors or preserve finished footage in a branded frame, reusing media and cached results.
---

# Social Motion

Make each target ratio a usable composition. This skill depends on the sibling `motion-story` folder with its Node dependencies installed. Install both skill folders together; the relative imports work in the repository and in a skills directory.

## Choose the adaptation method

If an editable story exists, re-render it. Read [platform guidance](references/platforms.md) for the requested destination and use the preset as a design starting point. Inspect current official guidance again for a live publication when the verification date is stale or requirements may have changed.

From this skill directory:

```sh
node scripts/pack.mjs --input /path/to/story.json --out /path/to/social-pack --presets linkedin,x,moments
```

Add `xiaohongshu` for 3:4, `vertical` for 9:16, or `square` for a general square asset. These are authoring choices, not a guarantee of feed-thumbnail behavior. Use `--formats png` for the first layout pass. Optional `--gif-width` and `--force` behave as in the base skill. Each output preserves the content source and receives its own composition and report. For custom dimensions, use the base renderer with `--width` and `--height`.

For a v2 component recipe, use the sibling `motion-story/scripts/compose.mjs --preset xiaohongshu` instead of `pack.mjs`. Keep its cache between ratios and later edits.

For finished footage, prefer reuse over reconstructing every scene. A designed frame preserves the original video and audio, adds readable context, and fills the canvas with chosen colors:

```sh
node scripts/frame.mjs --input existing.mp4 --copy copy.json --out framed.mp4 --preset xiaohongshu
```

Use `--preview` before encoding. The copy file contains `heading`, optional `eyebrow`, `caption`, and six-digit hex `colors` (`background`, `ink`, `accent`, `muted`). Exact repeat requests reuse the checked output. The source is fitted in full; its internal text is not re-typeset. See [reuse recipes](../motion-story/references/reuse.md).

If only an existing video or GIF is available, it cannot be re-typeset from pixels. Inspect it and choose from [finished-footage adaptation](references/finished-footage.md):

- `backdrop` keeps the complete source frame, fits it inside the new canvas, and fills the surrounding space with a blurred duplicate. Check that text is still large enough.
- `crop` fills the frame by cutting away source edges. Use it when that loss is acceptable for the user's content; inspect subjects, faces, and every text block.

```sh
node scripts/reframe.mjs --input /path/to/existing.mp4 --out /path/to/adapted.mp4 --preset moments --mode backdrop
```

## Deliver and describe accurately

Inspect every requested ratio, including moving frames and a phone-sized preview. In the re-layout workflow, fix overflow by changing layout or appropriately shortening copy. Do not silently omit content or stretch an export to another ratio.

Provide the MP4, optional GIF, static poster, source, and reports. Use MP4 as the default handoff for social video and GIF for a README or supported inline preview. Never rename a GIF to MP4.

Say what was actually verified: the generated file's dimensions, its content bounds, and whether a platform composer was previewed. A clean full-canvas export does not guarantee a platform will never crop, letterbox, compress, overlay controls, or choose a different thumbnail. Our safe insets are conservative design choices, not official UI masks. Personal Moments guidance is explicitly provisional.

Only publish or connect accounts when requested. Preparing a social pack by itself grants no such authorization.
