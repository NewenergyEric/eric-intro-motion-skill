# Pocket Notes · native bilingual intro

An original MIT workflow study: capture a thought, categorize it, save it, and return. Four scenes, 16 seconds, Chinese and English, each at 1:1, 3:4 and 9:16. The product is fictional. No private product footage or brand assets are included.

[Play and compare](https://newenergyeric.github.io/eric-intro-motion-skill/native-intro/) · [Download the complete examples and source](https://github.com/NewenergyEric/eric-intro-motion-skill/releases/latest)

Open `index.html` locally to compare all three ratios. Each film folder includes MP4, full-size poster, all scene stills, layout measurements, encode metadata and compressed transition samples.

From the repository root (or the full examples archive):

```sh
npm run setup
npm run examples:intro -- --stills
npm run examples:intro
```

Run again for verified output-cache hits; add `--force` to rebuild changed outputs. The editable [recipe](recipe.json) mirrors the canonical [template recipe](../../skills/eric-intro-motion-skill/assets/examples/pocket-notes.json). The renderer lives at `skills/eric-intro-motion-skill/scripts/native-intro.mjs` and needs Node 22+ plus FFmpeg/FFprobe. No browser or model API is required for this vector example.

Text and vectors: repository MIT license. Font: bundled Noto Sans SC, SIL OFL 1.1; see [asset provenance](asset-provenance.json). The examples use silent AAC audio. See [verification](verification.json) for actual release checks and [case findings](../../skills/eric-intro-motion-skill/references/case-findings.md) for the local production methods that informed this template.
