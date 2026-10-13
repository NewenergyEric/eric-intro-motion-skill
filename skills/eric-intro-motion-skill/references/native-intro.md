# Native intro recipe (v3)

Use this small vector template for a concrete note/card workflow. It is separate from v1 three-card stories and v2 reusable profile/motion-study recipes; those formats and commands remain supported.

From this skill directory:

```sh
npm ci
node scripts/native-intro.mjs --input assets/examples/pocket-notes.json --out output/intro --stills
node scripts/native-intro.mjs --input assets/examples/pocket-notes.json --out output/intro --cache output/frame-cache
```

The default creates Chinese and English at 1:1, 3:4 and 9:16. Each output has MP4, poster, all scene stills, measured layout report, encode hashes and samples extracted from the encoded transitions. MP4 is H.264/yuv420p, AAC, square pixels and faststart. The sample uses a silent track; supply `--audio path/to/music.wav` for a licensed track covering the whole timeline. A GIF remains available through the existing v1/v2 renderers; the new v3 command exports MP4 and static images.

Options: `--languages zh,en`, `--ratios square,portrait,vertical`, `--fps 24|25|30|60`, `--stills`, `--cache directory`, `--force`. Use a new directory or `--force` when changing an existing output. An exact verified output hit needs neither rasterization nor encoding.

## Recipe and templates

Copy `assets/examples/pocket-notes.json` to the user's workspace. Keep `schemaVersion:3`, a safe lowercase `id`, `brand.zh` and `brand.en`, and 1–12 `scenes`. Each scene has `template`, `seconds` (3–30), plus `zh` and `en` objects containing `title`, `note`, `action`, `detail` and `caption`. Pick a reading time appropriate to the copy; these limits are just the supplied template's supported range.

- `capture`: a note arrives and its next action appears.
- `tag`: the note gains a visible category marker.
- `save`: confirmation appears while the same object stays identifiable.
- `return`: the saved state and next action remain visible.

Reorder or repeat these shots as needed. Add a new composition for real search interfaces, large illustrations, grids or richer transitions; do not misrepresent the product to fit these four templates. The original MIT vector example is a fictional workflow, not a claim about a shipped app.

`makeIntro()` uses native canvas coordinates for both cards, headings, wrapping and connector curves. Square uses a side-by-side action; 3:4 uses an offset vertical sequence; 9:16 changes card widths and spacing independently. `introAudit()` measures outlined glyphs and containers for every scene. The sibling native auditor compares identical sample frames and rejects missing scenes/layers, mixed source revisions, changed copy and a scene that only scales the master.

## Cache and audio

The v3 visual key contains source scripts, the font, lockfile, recipe, language, ratio, dimensions and fps. Its frames manifest records SHA-256 for each PNG. Interrupted runs resume valid frames, regenerating missing or corrupt ones. The output key also includes the audio hash and FFmpeg version. Keep one renderer per visual cache key; parallel processes must use separate cache directories.

Do not claim the cache proves an image looks good. When extending the renderer to use external art, logos or fonts, hash every referenced asset into the visual key. Frame caching trades disk space for saved rasterization; the release ZIP excludes frame caches.

For an audio-only edit to an existing H.264 export:

```sh
node scripts/replace-audio.mjs --video output/old.mp4 --audio music.wav --out output/new.mp4
```

The helper uses stream copy for video, encodes the new audio to AAC, fully decodes the result, and compares before/after video stream hashes and frame counts. It refuses existing output paths and audio shorter than the timeline. The source remains intact. When the timeline or pixels change, render them first; audio replacement does not repair stale visuals.

## Source and licensing

The sample's text and vector cards are original MIT work. The bundled Noto Sans SC font keeps OFL 1.1. No product artwork or customer content is required. Preserve a source URL, license and hash for each additional asset. See `references/case-findings.md` for the evidence that motivated these methods.
