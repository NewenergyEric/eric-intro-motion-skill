# A visual language for small explanations

Start with a still frame that already makes sense. Use motion to show what travels, changes, or depends on something else. Keep the main copy readable throughout the loop.

The bundled direction uses warm paper, dark navy ink, fine outlines, a restrained teal/blue palette, and flat diagrams. This is an editable starting style, not a rule against a user's brand. Shapes and timing are original sample artwork; no paid image assets or external rendering API are needed.

Use concrete relationships:

- A dot on a connector can show a handoff.
- Changing bars can show a result being revised.
- A reference card sliding into a stack can show memory being kept.
- A rotating arc can show a loop continuing.

Avoid motion that contradicts the story, unreadably fast labels, arbitrary zooms, or a whole slide merely fading in and out. The starter renderer uses a deterministic frame clock and periodic functions. Compare the beginning and end if adding one-shot entrances; seamless looping is a property to check, not a consequence of using GIF.

For new motifs, keep layout calculation separate from `frame(seconds)`, precompute text paths, and derive positions from the safe rectangle. The renderer streams PNG frames into FFmpeg; do not hold hundreds of full-resolution frames in an array. Font shaping and rasterization come from [fontkit](https://github.com/foliojs/fontkit) and [resvg-js](https://github.com/thx/resvg-js). GIF palette generation uses [FFmpeg's palette filters](https://ffmpeg.org/ffmpeg-filters.html#palettegen).

Make a poster and several time samples for visual review. Check a representative encode after modifying geometry or timing, including the small display size where the animation will be consumed.
