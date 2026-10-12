# Story content and render options

Use UTF-8 JSON. Example: `../assets/examples/idea-to-post.json` relative to this reference directory.

| Field | Meaning |
| --- | --- |
| `schemaVersion` | `1` |
| `id` | 1–64 lowercase letters, digits, and hyphens; first character alphanumeric |
| `lang` | Content language tag, such as `en` or `zh-CN`; descriptive metadata, not automatic translation |
| `motif` | `flow`, `orbit`, or `stack` |
| `eyebrow` | Short section label |
| `title` | Main thought; an explicit `\n` may separate two intended lines |
| `subtitle` | One short supporting sentence |
| `cards` | Three objects, each containing `label` and `caption` |
| `footer` | Short closing line or attribution |
| `duration` | Number of seconds, between 2 and 30; examples use 8 |

No URLs or scripts in the manifest are executed. Unknown fields fail validation. Use short copy first; fitting is judged from font metrics, not a character-count guess. English wraps at word boundaries with a fallback for long tokens; Chinese can wrap between segments. The shipped Noto Sans SC font supports the examples' Latin and Simplified Chinese. Other scripts and emoji may need a different font: change `scripts/text.mjs`, include the new font's license, and inspect shaping before claiming support.

The CLI accepts even dimensions from 480 to 4096, with ratios between 1:2.4 and 2.4:1. These are renderer constraints, not every platform's upload rules. `--width` and `--height` change the composition's actual geometry. Wide layouts put copy beside the graphic; square layouts put copy above horizontal cards; portrait flow layouts put the cards in a column.

The renderer exports:

- `id.mp4`, `id.gif`: requested motion formats.
- `id.png`, `id.svg`: readable poster at 28% of the loop, even when requesting only video.
- `id-safe.png`: design inset guide; not a simulated platform screenshot.
- `id.story.json`: unchanged content source.
- `id.report.json`: text boxes, glyph bounds, file metadata, checksums and explicit preview status.

`--formats png` skips encoding. `--formats mp4,png` skips GIF creation. `--force` replaces files with this story ID in the selected output directory. Keep outputs in a fresh directory to compare revisions.

Text remains visible throughout the animation. Exported SVG text is outlined for reproducible rendering, so use the JSON for copy edits. All essential text is checked against our design inset; decorative motion is reviewed visually. The background paints every pixel. Existing platform UI and feed thumbnails are outside this file-level guarantee.
