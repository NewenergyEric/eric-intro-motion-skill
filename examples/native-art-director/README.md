# One film, three native compositions

This 24-second example adapts the author's [Art Director film](https://github.com/NewenergyEric/art-director-skill/tree/7f7cd6f67864be397507592a96bbe9809031367f/motion) from editable source. It reuses the original artwork, palette and OFL font. Headings, reference art, cards, connectors, button states and persistent objects receive independent geometry for each canvas.

| Canvas | Complete video | Poster |
| --- | --- | --- |
| 1080×1080 / 1:1 | [MP4](square/film.mp4) | [PNG](square/poster.png) |
| 1080×1440 / 3:4 | [MP4](portrait/film.mp4) | [PNG](portrait/poster.png) |
| 1080×1920 / 9:16 | [MP4](vertical/film.mp4) | [PNG](vertical/poster.png) |

The square input scene places references beside the prompt; portraits stack them. The tall task scene turns three button states into a vertical sequence. Shared artwork and task objects travel between chapters; there is no inset master video or `Video` component.

## Rebuild or adapt

This optional example uses React/Remotion, separate from the lightweight Node/FFmpeg skill runtime. Install its pinned top-level dependencies and provide Chrome plus FFmpeg/ffprobe:

```sh
cd examples/native-art-director
npm ci
node render.mjs --stills
node render.mjs --only art-director-zh
```

`CHROME_PATH` can select a Chrome executable. Review all scene posters and measured reports before encoding. The source also supports English; pass `--only art-director-en` to render it. The complete timeline is 720 frames at 30 fps. `--short --only art-director-zh-square` renders a two-second encoding sample. No footage is uploaded by the renderer.

If you replace a pinned artwork/font file, update its SHA-256 in `asset-provenance.json` and rerun `--stills`. The renderer checks those hashes before cache reuse, so an altered source asset cannot silently reuse an old movie.

`src/ArtNative.tsx` contains the layouts and paths, `src/common.tsx` the font loading, motion helpers and glyph-bound sampling, and `src/index.tsx` the target compositions. The prebuilt files were inspected in a combined local project; their reports retain that build's source hash. This standalone source removes unused project-specific font loaders and registrations, so its rebuilt source hash differs.

Layout reports are measurements, not an aesthetic certification. Inspect full movies and transition boundaries. These exports are silent, matching the source film's lack of voiceover/music. Platform preview behavior is outside the file guarantees.

Code and the author's sample artwork follow the repository MIT license. The fonts keep their bundled OFL notices. [Remotion](https://www.remotion.dev/license), React, Chrome and FFmpeg retain their respective terms and are installed separately. No private-project media is included here.
