# Reuse recipes

Work from a small recipe, not a fresh description of every frame. All commands run locally. No model, image-generation, or paid motion API is called by these renderers.

## Recombine vector components

```json
{"schemaVersion":2,"id":"my-remix","language":"en","clips":[
  {"module":"profile.product","seconds":4,"title":"Make a small thing.","subtitle":"See what happens."},
  {"module":"profile.agents","seconds":4,"title":"Keep trying."}
]}
```

`compose.mjs --list` returns names only. `assets/modules.json` holds bilingual default labels for the nine profile modules: marketing, sales, brand, support, operations, data, product, agents, methods. Three additional modules are `reference.stagger`, `reference.trace`, and `reference.ticker`.

- A clip lasts 2–30 seconds; a recipe contains 1–30 clips.
- `title` is required; `subtitle` and `labels` are optional. Use `\n` for an intentional line break.
- A labels override must have the original label count and fit the original measured widths. Longer labels need a component layout edit; they are never silently truncated.
- Layouts rearrange copy and graphics. A whole video is not stretched to another ratio.
- `--formats png` creates one poster per scene, a main poster and a safe-area preview before animation encoding.
- `--cache folder` shares clip renders across recipes. A reordered clip keeps its cache key. Changing its copy, duration, language, geometry, engine, dependency lock or font invalidates that clip. Output and cache SHA-256 hashes are checked before reuse.
- A completed output hit skips both rendering and encoding. A clip hit still needs final assembly when the timeline changes.
- `--force` permits replacement of that output; it does not disable verified cache reuse.

Frames use a deterministic clock. Cuts are intentional; this version does not offer arbitrary transitions, layered video editing, speech generation, or a claim that every seam is visually seamless.

## Reorder existing GIF/MP4 pixels

```json
{"schemaVersion":1,"clips":[
  {"file":"original.gif","from":10,"seconds":5},
  {"file":"original.gif","from":0,"seconds":5}
]}
```

```sh
node scripts/assemble-media.mjs --input edit.json --out remix.mp4
```

Paths resolve relative to the recipe. `from` and `seconds` are seconds, not frame numbers. All footage must share an aspect ratio and square pixels; frame different ratios first. The output uses the first source's dimensions, 30 fps H.264, AAC and faststart. Existing audio is trimmed and concatenated; silent clips receive silence. This re-encodes existing pixels, so it is not a lossless file copy. No new artwork is generated. Exact repeat requests verify the output hash and skip encoding.

## Put finished footage in a social frame

```json
{"eyebrow":"A SMALL PROJECT","heading":"Keep the feeling.\nPass it on.","caption":"A note for whoever comes next.","colors":{"background":"#001f3f","ink":"#f5f9fb","accent":"#92e4da","muted":"#b2cbd7"}}
```

Use sibling `social-motion/scripts/frame.mjs` with `--copy` and `--preset moments`, `xiaohongshu`, or `vertical`. `--preview` exports a poster; use `--force` for the subsequent full encode into the same output base. The original full frame and audio remain; the surrounding area has a deliberate background, heading and caption. Inspect small original text on a phone. This cannot change text already baked into the source video or remove its existing borders.

## Context and cost discipline

Keep source-media hashes, dimensions, duration, clip choices, a short recipe, and selected posters. Read source code only for the component being changed. Retain caches, and use a saved recipe for retries after a network interruption. Never resend a whole repository or regenerate assets merely to change a ratio.

Reports expose `renderApiCalls: 0`, cache hits, and (for media assembly) `newVisualAssets: 0`. These describe the local renderer, not the assistant's total token usage. Recipe size is measured in UTF-8 bytes, not tokens. Compare actual account usage if a numerical token-saving claim is needed.
