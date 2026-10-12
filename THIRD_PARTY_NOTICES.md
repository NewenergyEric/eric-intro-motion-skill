# Third-party components

The skill instructions, renderer, example content and vector artwork are original work distributed under the repository's MIT license. Existing enterprise playbook text, private customer material, and third-party art have not been copied into this distribution.

## Noto Sans SC

`skills/motion-story/assets/fonts/NotoSansSC.ttf` is the unmodified variable font from [Google Fonts](https://github.com/google/fonts/tree/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl/notosanssc), pinned to commit `bd8f81ddb5c74d5c8897b36ad88b440266245103`.

- License: SIL Open Font License 1.1, included beside the font as `OFL.txt`.
- Original filename: `NotoSansSC[wght].ttf`.
- SHA-256: `a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`.
- Copyright and reserved font-name information: see the included OFL file.

The font retains its own license; MIT does not replace it. Renaming the file for portability does not modify the font itself.

## Runtime dependencies

- [fontkit](https://github.com/foliojs/fontkit), 2.0.4, MIT.
- [resvg-js](https://github.com/thx/resvg-js), 2.6.2, MPL-2.0; underlying libraries keep their respective licenses.
- [FFmpeg](https://ffmpeg.org/legal.html), installed separately. Its license depends on the build configuration; no FFmpeg binary is bundled here.

The package lock pins npm dependencies. Their notices are distributed by npm with the installed packages. A distributable skill archive includes the repository MIT license and this notice in the base skill folder, plus the font's OFL.
