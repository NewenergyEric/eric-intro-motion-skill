# Visual review · 2026-10-13

Reviewed all four scenes in Chinese and English at 1:1, 3:4 and 9:16, from the actual encoded MP4 samples. The contact sheets are `zh-scenes.png`, `en-scenes.png`, `zh-transitions.png` and `en-transitions.png`.

- Square keeps note and action side by side; 3:4 stacks them with an offset action; 9:16 changes widths, spacing and connector endpoints independently.
- Titles and body text retain their content in every ratio. The square note wraps while the taller layouts use their wider native text boxes. The initial body type was enlarged before the final exports for phone-sized reading.
- No clipped headings, missing glyphs or collisions in stable reading frames. Container checks pass for all note/action copy. Metadata labels are intentionally secondary; the main note and action carry the story.
- Both sides of each encoded cut were inspected in both languages. The 0.22-second crossfade intentionally overlaps outgoing and incoming copy briefly; stable reading frames remain separate. No empty or black canvas is introduced at a scene boundary.
- The four scenes preserve the same note while its category and saved state change. This restrained template demonstrates a small workflow; richer product interfaces should use their own source compositions.
- All six videos played to 16 seconds with `ended:true`, `readyState:4` and no media error in the Codex in-app browser. The language switch selects the matching three source files. See `browser-playback.json`.

This was a local file/browser check, not a social-platform upload or physical-phone feed test. The sample has silent AAC audio and does not contain a QR code. The inspected Anxiety Fixer production's QR/audio checks are recorded separately as case findings, not attributed to this new example.
