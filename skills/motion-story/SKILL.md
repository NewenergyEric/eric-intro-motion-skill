---
name: motion-story
description: Reuse, remix, and create GIF/MP4 motion graphics locally. Use for animated profiles, README demos, product stories, reusable animation components, and video assembly from existing footage or short JSON recipes.
---

# Motion Story

Turn an idea into a small visual story: objects should gather, travel, connect, or change in a way that explains the idea. Deliver the editable content alongside the animation.

## Reuse first; keep context small

Inspect existing media and manifests before creating anything. Reuse artwork, fonts and suitable components. Read the source needed for the requested changes; a whole-film ratio adaptation may require editing every scene. Keep resumable manifests and caches instead of repeatedly loading unchanged material.

Choose the least expensive path that actually achieves the requested result:

1. Same finished animation: copy its GIF or transcode to MP4. No new artwork.
2. Reorder/cut footage: `scripts/assemble-media.mjs` keeps existing pixels and audio. Read [reuse recipes](references/reuse.md).
3. Change copy, modules, or ratio: `scripts/compose.mjs`. Run `--list` once for the 12-module catalog; inspect only selected labels in `assets/modules.json` if changing them. Nine profile scenes and three motion studies can be sequenced freely.
4. A new visual idea: extend just the missing component, then reuse it through the same recipe.

A request to change the whole video's aspect ratio requires independent layer re-layout, including every scene and transition. An inset landscape video with a new background is a different treatment. For existing source films, follow sibling [social-motion's native recomposition workflow](../social-motion/references/native-recomposition.md); the small bundled module renderer is not a universal converter. Quality and fidelity take priority over token savings when the user requests that tradeoff.

```sh
node scripts/compose.mjs --input assets/examples/profile-remix.json --out output/remix --cache output/cache --preset moments
```

Start with `--formats png` for layout review. Clip hashes reuse unchanged renders across recipes; exact output hits skip encoding too. Keep the cache between runs. Rendering calls no model or image API; planning and editing still consume tokens. Do not invent a savings percentage.

## Choose the story

Use the user's own subject and tone. Pick a concrete action to show, then write the minimum copy needed to understand it. The bundled examples are starting points, not a prescribed personal brand or a requirement to use three points for every story.

Read [the content schema](references/story-format.md) when using the renderer. Its starter motifs each support three cards:

- `flow`: a note moves through a process.
- `orbit`: information travels between a central agent and supporting nodes.
- `stack`: references are collected and organized.

For a substantially different story, extend the renderer or create a custom composition using [the motion language](references/motion-language.md). Preserve source-based ratio adaptation. Do not squeeze arbitrary content into three cards or replace requested content merely to fit a template.

## Render locally

Paths below are relative to this skill directory. Require Node.js 22+ and `ffmpeg` / `ffprobe` on PATH. Install dependencies once:

```sh
npm ci
node scripts/cli.mjs --input assets/examples/idea-to-post.json --out output/demo
```

Copy the JSON example into the user's workspace before editing it. Use an output directory there rather than modifying the installed examples.

The default is a 1920×1080, 30 fps MP4 plus a 720 px wide, 20 fps GIF, a full-size PNG poster, source SVG and JSON, a safe-area preview, and a validation report. MP4 is H.264 / yuv420p / square pixels / faststart with a silent AAC track. The GIF loops indefinitely. The PNG is the static alternative for reduced motion.

```sh
node scripts/cli.mjs --input story.json --out output/square --width 1080 --height 1080
```

Useful options: `--formats png` for a fast layout pass, `--gif-width 600` for a smaller GIF, `--fps 20`, and `--force` to replace that output deliberately. A poster and review files are always included.

## Review the result

- Inspect the poster and safe-area preview at the size people will actually see. Review moving frames too: a passing text-bounds check does not prove a useful or appealing story.
- Keep the content intact when changing ratios. The renderer measures outlined glyphs, wraps text, and fails on overflow or missing characters instead of clipping. Shorten copy with the user's intent in mind, or enlarge/rearrange the composition.
- Check the report for geometry, duration, frame count, sampled motion, and file sizes. A GIF above the suggested 5 MB budget needs optimization if the destination requires it; this budget is not a universal platform limit.
- Include the JSON and poster with final GIF/MP4 links. State any remaining display uncertainty.

For LinkedIn, X, Moments, or a pack of multiple ratios, use the sibling `social-motion` skill when installed. Creating an asset does not authorize publishing it or changing profiles.
