# Motion studies and attribution

Reviewed 2026-10-12. These are small, independently implemented studies of motion techniques, not pixel-identical copies of third-party films. No external footage, proprietary source, or Motion+ package is included.

| Study | Reference | Reusable idea |
| --- | --- | --- |
| Staggered grid | [Anime.js stagger](https://animejs.com/documentation/utilities/stagger/) | A delay field spreads movement across a grid. |
| Path tracing | [Anime.js createDrawable](https://animejs.com/documentation/svg/createdrawable) | A moving visible portion makes a path readable over time. |
| Kinetic ticker | [Motion Ticker](https://motion.dev/docs/react-ticker) | Repeated text travels continuously through a viewport. |

The nine `profile.*` modules originate in the author's [personal profile renderer](https://github.com/NewenergyEric/NewenergyEric/blob/526a279de92886e0fc47eb9e2e9522d55629a875/motion/motion.mjs), extracted at the author's request for this open-source skill. The library retains the original motion objects, replaces system-dependent text with bundled outlined glyphs, and removes personal biography copy. Module sequences and page layouts are new compositions; they should not be described as byte-identical copies of the original GIF.
