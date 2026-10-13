# Tidekeeper · a complete illustrated introduction

Six 24-second films: Chinese and English, each composed for 1080×1080, 1080×1440 and 1080×1920 at 30 fps. Watch [the live gallery](https://newenergyeric.github.io/eric-intro-motion-skill/tidekeeper/) or serve `examples/` locally with `npm run preview` from the repository root.

The gallery's introduction and controls are in English. The English films, posters, scene stills and downloads are selected by default, including on first load before JavaScript runs. Use the film-language switch to select the Chinese edition.

The harbor, lampmaker, item chains and game UI reuse the author's finished public [Art Director case](https://github.com/NewenergyEric/art-director-skill/tree/a6d17d873845ebeeb530fdf295b9d527c6ac2181/motion), pinned to `a6d17d873845ebeeb530fdf295b9d527c6ac2181`. Artwork is copied byte-for-byte. `asset-provenance.json` records original paths, licenses and hashes. `SOURCE-LICENSE.txt` retains the author's MIT notice; the two font locations keep their OFL notices. These are candidate prototype assets, not an approved or shipped game.

## What's in the film

1. Enter the harbor: character and environment establish the subject.
2. Set the direction: character, initial objects and scene share rules.
3. Continue the work: a new pose, restored scene and higher item levels.
4. Use the result: merge two items, deliver orders, reward and unlock.
5. Compare the same place before and after repair.
6. Close on one team, one visual memory.

Every scene has its own ratio geometry. The game UI moves from beside the square composition's copy to below the portrait copy. Opening, review and closing use the existing portrait scene artwork when appropriate; foreground characters, words and movement remain independent layers. No master video is embedded. The English edition translates visible game-interface copy as well as headings. The films are silent, matching the source.

## Rebuild

Node.js 22+, FFmpeg/ffprobe and Chrome are required. React and Remotion are optional dependencies of this example; their own package terms apply.

```sh
cd examples/tidekeeper
npm ci
node render.mjs --stills
node render.mjs --short --only tidekeeper-zh-square
node render.mjs
```

Set `CHROME_PATH` if Chrome is installed elsewhere. Use `--only tidekeeper-en`, `--only tidekeeper-zh-vertical`, or `--concurrency 4` to select work. Rendered working files go under `output/`. Unchanged output hashes skip encoding; unchanged raw renders can be reused for container fixes. This optional renderer does not implement the portable vector renderer's per-frame resume cache.

After checking the stills, run `node ../../scripts/export-tidekeeper.mjs` to check and publish the outputs into this example folder. It checks all six files, compares scene-by-scene geometry, fully decodes each movie, samples its scenes and cuts, and produces the gallery's contact sheets and small GIF previews. The prebuilt gallery needs no Remotion install.

`src/TidekeeperNative.tsx` defines the six scenes and per-ratio layouts. `src/TidekeeperUI.tsx` uses the pinned `ui-kit.js` state logic and translates its visible strings. `src/common.tsx` loads bundled fonts and measures DOM glyphs, including the nested UI scale. Change these editable sources rather than flattening a movie into a new background.

## Delivery and evidence

Each `tidekeeper-{zh|en}-{square|portrait|vertical}` folder contains `film.mp4`, `poster.png`, six MP4-derived scene images, layout and encoding records. Shared `verification.json`, `visual-review.md`, and `browser-playback.json` distinguish geometry, encoded-file checks and human-visible playback. These checks do not claim platform-upload testing or art-director approval. The README GIF shows the full story at lower resolution; `ratio-review.jpg` and the per-film posters are static alternatives.

`source-fingerprint.json` records the rendered source fingerprint and its LF-normalized equivalent. `source-hash.mjs` normalizes text line endings so the same source remains verifiable after a Windows checkout or a GitHub source download; artwork and MP4 hashes always cover the exact binary bytes.
