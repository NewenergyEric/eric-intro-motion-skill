# Third-party components

The skill instructions, renderer, example content and vector artwork are original work distributed under the repository's MIT license. Existing enterprise playbook text, private customer material, and third-party art have not been copied into this distribution.

The nine `profile.*` components reuse the author's own [profile renderer](https://github.com/NewenergyEric/NewenergyEric/blob/526a279de92886e0fc47eb9e2e9522d55629a875/motion/motion.mjs), extracted at the author's request for this open-source package. The three `reference.*` studies are independent implementations of common motion techniques; references and differences are documented in [motion-studies.md](skills/eric-intro-motion-skill/references/motion-studies.md). No Motion+ code, third-party video, or private project media is distributed.

The optional `examples/native-art-director` case derives from the author's [Art Director source](https://github.com/NewenergyEric/art-director-skill/tree/7f7cd6f67864be397507592a96bbe9809031367f/motion), at the pinned commit in its asset manifest. Its original artwork and source are MIT; its Field Sans font subset retains the bundled OFL license. The example also includes an identical copy of the Noto Sans SC font described below. React/Remotion are separate optional dependencies of that example, not dependencies of the portable skill renderer; their licenses are supplied by their packages.

## Noto Sans SC

The `examples/tidekeeper` case reuses the author's public [Tidekeeper artwork and game UI](https://github.com/NewenergyEric/art-director-skill/tree/a6d17d873845ebeeb530fdf295b9d527c6ac2181/motion), pinned to commit `a6d17d873845ebeeb530fdf295b9d527c6ac2181`. The case preserves the MIT copyright notice in `SOURCE-LICENSE.txt`; its unmodified artwork and font files have individual hashes in `asset-provenance.json`. Native layouts and the visible English UI translation are adaptations made here. The original candidate/prototype status is preserved. Tide Sans and the Noto fallback keep their own bundled OFL files; no private-project source, art, music or video was copied.

The new `Pocket Notes` recipe, cards, native layouts, animation paths and renderer are original MIT work. It is a fictional workflow study. The locally inspected Anxiety Fixer and Dahao productions contributed general workflow findings only; their videos, product source, brand artwork and music are not distributed or relicensed here.

`skills/eric-intro-motion-skill/assets/fonts/NotoSansSC.ttf` is the unmodified variable font from [Google Fonts](https://github.com/google/fonts/tree/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl/notosanssc), pinned to commit `bd8f81ddb5c74d5c8897b36ad88b440266245103`.

- License: SIL Open Font License 1.1, included beside the font as `OFL.txt`.
- Original filename: `NotoSansSC[wght].ttf`.
- SHA-256: `a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`.
- Copyright and reserved font-name information: see the included OFL file.

The font retains its own license; MIT does not replace it. Renaming the file for portability does not modify the font itself.

## README showcase media

`examples/readme/hero-en.gif` and its PNG cover are derivatives of the author's public English source film in `examples/materials-update`, pinned to Art Director commit `04f183050a5d1122648a9c5aa35b998f325bf08f`. Its MIT notice is preserved in `examples/materials-update/LICENSE`; embedded fonts retain OFL. The synchronized comparison derives from this repository's three English Tidekeeper films, using the earlier artwork revision documented above. `examples/readme/manifest.json` records the source and output hashes. The five informational badge SVGs are original MIT work.

The README's introductory hierarchy was informed by [Huashu Design](https://github.com/alchaincyf/huashu-design). Its prose, artwork, films and compatibility claims are not included in this distribution.

## Runtime dependencies

- [fontkit](https://github.com/foliojs/fontkit), 2.0.4, MIT.
- [resvg-js](https://github.com/thx/resvg-js), 2.6.2, MPL-2.0; underlying libraries keep their respective licenses.
- [FFmpeg](https://ffmpeg.org/legal.html), installed separately. Its license depends on the build configuration; no FFmpeg binary is bundled here.

The package lock pins npm dependencies. Their notices are distributed by npm with the installed packages. A distributable skill archive includes the repository MIT license and this notice in the base skill folder, plus the font's OFL.
