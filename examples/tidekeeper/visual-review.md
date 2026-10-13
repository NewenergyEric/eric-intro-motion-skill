# Tidekeeper visual review

Reviewed on 2026-10-13. This records an agent's visual inspection of the delivered example, not approval by an art director or a test of a social platform upload.

## Coverage

- Chinese and English: six scenes in each of three native compositions (1:1, 3:4, 9:16).
- Encoded scene, entrance, game-state and transition samples: 29 images per film, 174 in total. The scene and transition contact sheets make the sampled coverage inspectable.
- Eight measured holds/UI states per film: 48 DOM geometry samples. `verification.json` and the per-film layout reports retain the automated results.
- All six MP4s were decoded to the end with FFmpeg and played to 24 seconds in the local browser. Playback observations are recorded separately in `browser-playback.json`.

## Visual findings

The harbor environment, lampmaker, lamp progression and game interface remain recognizable across all ratios. Square scenes place the game interface beside the heading; portrait scenes place it below the heading. The portrait artwork is reused as a scene layer, with independent character, text and UI geometry.

The opening and closing portrait compositions were corrected so the foreground character's feet rest on the dock. English headings fit their containers, and visible game-interface labels are translated. The merge, delivery, reward and unlock states use the source UI state logic and appear in the encoded samples.

Scene boundaries use a short crossfade. Adjacent headings briefly overlap during the dissolve; the transition contact sheets show this intentionally transient state. No blank scene boundary was observed. Hold frames keep the primary copy readable without missing glyphs or measured text overflow.

The gallery was inspected at its desktop size and at a 390-pixel mobile viewport. The mobile layout becomes a single column without horizontal page overflow. The language switch updates video, poster, download and evidence links together. The three-ratio playback control reaches the end of all three films.

## Scope

The films are silent. The artwork is a pinned, publicly licensed candidate prototype, not an approved or shipped game. Browser playback and file validation do not establish how an external platform will crop, recompress or display an uploaded film. The README GIF is a lower-resolution preview; the MP4s are the delivered films.

## English gallery update · v0.5.1

The home and case pages were reviewed again with English introductions, navigation, controls and status messages. Both pages select English in their initial HTML: video, poster, download, layout-report and scene-preview links match before JavaScript runs. The English README uses the English GIF and three-format preview.

All three English films were replayed to 24 seconds with no media errors. Switching to Chinese and back updated the media and evidence links together. English copy was inspected at the desktop size and a 390-pixel mobile viewport on both pages; no horizontal overflow was observed. The delivered films and their source fingerprint are unchanged from v0.5.0.
