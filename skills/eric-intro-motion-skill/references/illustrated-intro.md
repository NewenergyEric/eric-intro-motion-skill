# Rich artwork and UI introductions

Use the public [Tidekeeper example](https://github.com/NewenergyEric/eric-intro-motion-skill/tree/main/examples/tidekeeper) when a product already has polished scenes, characters, objects and interface source. The [live case](https://newenergyeric.github.io/eric-intro-motion-skill/tidekeeper/) includes six complete 24-second Chinese/English films at 1:1, 3:4 and 9:16.

Start from the best existing production, not the oldest simple demo. Inspect recent manifests and the actual images. Pin a finished source revision before copying assets from a project that is still being edited. Keep each original file's hash, source path and license. Reuse finished art; generate only what the story genuinely lacks.

## Compose a world, not a slide deck

- Let an environment establish the subject; keep the main character and text separate so each ratio has room to breathe.
- Make the detail sequence concrete: initial item → evolved item, unfinished place → restored place, missing order → fulfilled order.
- Use actual UI source and state transitions when available. Decorative cards are not a substitute for a product's working interface.
- Preserve the character's silhouette and important scene landmarks. Anchor feet to a real supporting surface in each crop; an in-bounds character can still stand outside the dock. Move labels away from bodies and faces; compare at the final viewing size.
- Translate visible interface states as well as headlines. Budget line height for actual glyph ink, especially mixed fonts and nested scale transforms.
- Reflow each scene. Square copy can sit beside a tall UI; portrait copy can sit above it. Existing portrait environment art is useful, but does not replace independent foreground layout.
- Preview multiple expressive scenes in the gallery and README. Put the best completed film first, keep simpler studies discoverable below it, and retain a static alternative to animated previews.

The example's six beats are an adaptable editorial sequence, not a universal duration or required story. Its game source is a fictional candidate prototype. Keep that status clear when showing it.

## Rebuild and inspect

The repository's `examples/tidekeeper` folder contains pinned React/Remotion dependencies, original artwork, fonts, `src/TidekeeperNative.tsx`, the game's editable UI/state logic and a renderer. This optional source is distributed in the examples archive; the lightweight installed skill does not silently add Remotion.

Render stills for both languages and every ratio first, inspect all scenes, then encode. Check the real output dimensions, duration, frames, full decoding, UI text, object occlusion, transitions, and playback. `scripts/export-tidekeeper.mjs` produces the shipped evidence and contact sheets. A clean bounds report supplements visual review; it does not replace it.
