# README preview review

Reviewed 2026-10-13. English remains the primary introduction and media language.

- The 24-second hero is the later public Art Director source film, including workshop repair, night lighting and boat arrival. The separate synchronized comparison uses this repository's earlier six-scene native English films.
- Both GIFs retain the complete timeline at 20 FPS / 480 frames, with infinite looping. The hero is 800 × 450; the comparison is 878 × 424. Actual byte counts and input/output hashes are in `manifest.json`.
- Encoded GIF samples were inspected at the opening, member/item introduction, dense game UI, repair, night and ending. The main English titles remain readable. Fine artwork has some GIF palette quantization; full-color PNG posters and full-resolution MP4s remain available.
- The three formats preserve the complete source frame and matching timestamps, with the ratio labeled above each film. Character, title and UI arrangements differ across the native films. Tiny in-game text in the comparison is secondary detail; the adjacent full-size player is the reading view.
- README badges identify the verified license, local rendering, two languages, native layouts and editable source. They are local SVG assets, with no external badge-service dependency.
- `<picture>` includes static covers for reduced-motion preferences, with adjacent explicit static links and separate playback/download links.

`node scripts/verify-readme.mjs` checks source/output hashes, all local README destinations, dimensions, frame count, timing, infinite loop extensions, byte budgets and full GIF decoding. Actual GitHub playback and layout are checked separately after publication; encoding validation alone does not establish host behavior.

Rebuild from the existing source films with `npm run examples:readme -- --out output/readme`. The export is a presentation of finished films, not a new native adaptation.
