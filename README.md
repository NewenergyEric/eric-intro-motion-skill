<p align="center"><sub><b>English</b> · <a href="README.zh-CN.md">中文</a></sub></p>

<h1 align="center">Eric Intro Motion</h1>

<p align="center"><em>Give your product a story people can see.</em></p>

<p align="center">
  <a href="LICENSE"><img src="examples/readme/badges/license.svg" alt="License: MIT"></a>
  <a href="#install"><img src="examples/readme/badges/render.svg" alt="Rendering: local"></a>
  <a href="#watch-three-formats"><img src="examples/readme/badges/languages.svg" alt="Languages: English and Chinese"></a>
  <a href="#watch-three-formats"><img src="examples/readme/badges/layouts.svg" alt="Native layouts: 1:1, 3:4 and 9:16"></a>
  <a href="#make-it-yours"><img src="examples/readme/badges/source.svg" alt="Source: editable"></a>
</p>

<p align="center"><strong>One product. Three native layouts. Two languages.</strong><br>
Turn your artwork and real product workflow into an introduction worth watching.<br>
Keep the characters, the details, and the editable source. Give every format its own composition.</p>

<p align="center">
  <a href="#showcase">See it move</a> · <a href="#watch-three-formats">Compare formats</a> · <a href="#install">Install the skill</a> · <a href="https://github.com/NewenergyEric/eric-intro-motion-skill/releases/tag/v0.5.3">Download v0.5.3</a>
</p>

## Showcase

**TIDEKEEPER — A small harbor. A story in motion.**

Meet the lampmaker. Rebuild the workshop. Light the harbor and welcome a boat home. The latest English film brings the illustrated world, characters and working game UI into one 24-second story.

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="examples/readme/hero-en.png">
  <img src="examples/readme/hero-en.gif" width="800" alt="Tidekeeper's latest English film: an illustrated harbor, game UI, workshop repair, night lighting and a returning boat.">
</picture>

**[Play the full English film](https://newenergyeric.github.io/eric-intro-motion-skill/#cases)** · [Download MP4](https://newenergyeric.github.io/eric-intro-motion-skill/materials-update/latest-source-en.mp4) · [Static preview](examples/readme/hero-en.png)

<sub>Latest public source film from the author's Art Director project, checked 13 October 2026. [Source, revision and license](examples/materials-update/README.md).</sub>

## Watch three formats

**Same story. Every scene recomposed.** The square, portrait and vertical films run together below. Watch the character, title and UI change position while the story stays in sync.

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="examples/readme/three-formats-en.png">
  <img src="examples/readme/three-formats-en.gif" width="878" alt="Three synchronized English Tidekeeper films, labeled square 1:1, portrait 3:4 and vertical 9:16, with independently arranged scenes.">
</picture>

**[Open the three-film player](https://newenergyeric.github.io/eric-intro-motion-skill/)** · [All six English / Chinese films](https://newenergyeric.github.io/eric-intro-motion-skill/tidekeeper/) · [Static comparison](examples/readme/three-formats-en.png)

| Square · 1:1 | Portrait · 3:4 | Vertical · 9:16 |
| --- | --- | --- |
| 1080 × 1080 | 1080 × 1440 | 1080 × 1920 |
| [English MP4](https://newenergyeric.github.io/eric-intro-motion-skill/tidekeeper/tidekeeper-en-square/film.mp4) | [English MP4](https://newenergyeric.github.io/eric-intro-motion-skill/tidekeeper/tidekeeper-en-portrait/film.mp4) | [English MP4](https://newenergyeric.github.io/eric-intro-motion-skill/tidekeeper/tidekeeper-en-vertical/film.mp4) |

<sub>These six-scene native adaptations use the earlier edit and are separate from the later source film above. [Editable case](examples/tidekeeper/README.md) · [Scene-by-scene evidence](examples/tidekeeper/verification.json) · [README media measurements](examples/readme/manifest.json).</sub>

## Make it yours

Bring your existing artwork, product screens and story. Ask the skill to reuse what works, compose each scene for its destination, and deliver files you can change.

> Use $eric-intro-motion-skill to introduce this product in English and Chinese. Reuse my finished artwork and show the real workflow. Compose every scene for 1:1, 3:4 and 9:16, then put a looping English preview and a synchronized format comparison in my GitHub README. Deliver the source, MP4s, GIFs and static covers.

| You need | You get |
| --- | --- |
| A launch story with existing artwork | Editable scenes, characters, UI details and finished films |
| One story across screens | Native layouts and typography for each ratio and language |
| A moving GitHub introduction | Looping previews, readable badges, static alternatives and a playback link |
| A faster revision | Verified reusable frames; audio-only edits preserve the video stream |

Start with **[Tidekeeper](examples/tidekeeper/README.md)** for an illustrated product, or **[Pocket Notes](examples/native-intro/)** for a small capture → tag → save → return workflow. The visual style follows your product.

## Install

Require **Node.js 22+** and **FFmpeg/FFprobe** on PATH. The vector renderer uses a bundled font; it needs no account, browser or paid rendering API.

```sh
git clone https://github.com/NewenergyEric/eric-intro-motion-skill.git
cd eric-intro-motion-skill
npm run setup
node scripts/install.mjs
```

The installer prints the exact `npm ci --prefix .../eric-intro-motion-skill` command for the installed runtime. Run it, then refresh skill discovery or start a new session.

For an existing installation, use `node scripts/install.mjs --upgrade`. Existing canonical, companion and legacy folders are preserved in a unique dated backup beside the skills directory. Without that flag, installation refuses to overwrite. Add `--dest /path/to/skills` for another skill library. The new [skill ZIP](https://github.com/NewenergyEric/eric-intro-motion-skill/releases/latest) also includes the canonical skill, companion and compatibility alias; run `npm ci` in the canonical folder after extraction.

The installed name is **`eric-intro-motion-skill`**. The package also installs the `social-motion` ratio companion and the `motion-story` compatibility entry. [Migration details](skills/eric-intro-motion-skill/references/migration.md).

<details>
<summary><strong>Rebuild the films and README animations</strong></summary>

## Render Tidekeeper

The illustrated case has its own locked React/Remotion dependencies and also requires Chrome. Its finished films can be watched without installing the renderer.

```sh
cd examples/tidekeeper
npm ci
node render.mjs --stills
node render.mjs
```

Inspect the stills before the full render. See [the case README](examples/tidekeeper/README.md) for output selection, Chrome configuration and export checks.

## Render the Pocket Notes workflow template

From the repository root:

```sh
npm run examples:intro -- --stills
npm run examples:intro
```

For a custom recipe, copy the [example JSON](skills/eric-intro-motion-skill/assets/examples/pocket-notes.json), edit its copy/timing, then run:

```sh
node skills/eric-intro-motion-skill/scripts/native-intro.mjs --input recipe.json --out output/intro --stills
node skills/eric-intro-motion-skill/scripts/native-intro.mjs --input recipe.json --out output/intro --cache output/frame-cache
```

Use `--languages zh,en`, `--ratios square,portrait,vertical`, or `--audio licensed-music.wav` as needed. The sample uses silent AAC. New outputs include posters, every scene's stable layout, measured audits, compressed entrance/hold/cut samples, output hashes and full-decode results. Exact cache hits skip rasterization and encoding. Changed existing outputs require `--force` or another directory. [Recipe, template limits and cache rules](skills/eric-intro-motion-skill/references/native-intro.md).

Only changing the soundtrack:

```sh
node skills/eric-intro-motion-skill/scripts/replace-audio.mjs --video old.mp4 --audio music.wav --out new.mp4
```

It preserves the source and compares video stream hashes. A new soundtrack must cover the whole timeline.

### Rebuild the README previews

```sh
npm run examples:readme -- --out output/readme
```

This packages the existing English films into two full 24-second, 20 FPS looping GIFs, matching PNG covers and a hash/measurement manifest. It preserves each source frame's aspect ratio and checks full decoding. [Presentation workflow](skills/eric-intro-motion-skill/references/github-readme.md).

</details>

## More capabilities

| Capability | Entry |
| --- | --- |
| Three vector story motifs, GIF/MP4/poster/SVG/JSON | `skills/eric-intro-motion-skill/scripts/cli.mjs` |
| Nine profile modules and three motion studies, clip caches | `skills/eric-intro-motion-skill/scripts/compose.mjs --list` |
| Cut/sequence existing media | `skills/eric-intro-motion-skill/scripts/assemble-media.mjs` |
| Social preset packs and native evidence audit | `skills/social-motion/` |
| Source-based React/Remotion example with original artwork | [Native Art Director](examples/native-art-director/) |

```sh
node skills/eric-intro-motion-skill/scripts/cli.mjs --input skills/eric-intro-motion-skill/assets/examples/idea-to-post.json --out output/demo
node skills/eric-intro-motion-skill/scripts/compose.mjs --input skills/eric-intro-motion-skill/assets/examples/profile-remix.json --out output/remix --preset xiaohongshu --cache output/clips
node skills/social-motion/scripts/pack.mjs --input skills/eric-intro-motion-skill/assets/examples/idea-to-post.json --out output/social --presets moments,xiaohongshu,vertical
```

`frame.mjs` and `reframe.mjs` still provide **explicitly requested** embedding or cropping treatments. They report `nativeReflow:false`; they are not a native multi-ratio conversion. [Whole-film native workflow](skills/social-motion/references/native-recomposition.md).

## Verification and examples

`npm test` covers bilingual layout, overflow and missing glyphs, unchanged legacy features, real MP4/GIF encoding, every-scene recomposition, corrupted-frame recovery, audio stream preservation and backup-safe migration. [Release verification](examples/native-intro/verification.json) records what was actually checked. Geometry and audit reports supplement visual review; social platforms may still crop thumbnails or add controls.

Open [the gallery](https://newenergyeric.github.io/eric-intro-motion-skill/) or `examples/index.html` after cloning. GitHub's source archive includes renderers, recipes, fonts/licenses, MP4s and static alternatives; the release's smaller ZIP contains the portable skills. The optional Art Director case has its own locked React/Remotion dependencies. Rebuild old examples with `npm run examples` or `npm run examples:remix`; use `-- --force` when replacing their outputs.

The v0.4 workflow also distills inspected production methods from the completed 68-second bilingual Anxiety Fixer introduction. Its branded footage/art and Dahao's private source stay local. [Evidence and licensing boundary](skills/eric-intro-motion-skill/references/case-findings.md).

Code, instructions and original vector artwork: **MIT**. Noto Sans SC and the Art Director font retain **OFL**. Private project assets are excluded. [Third-party notices and pinned sources](THIRD_PARTY_NOTICES.md).
