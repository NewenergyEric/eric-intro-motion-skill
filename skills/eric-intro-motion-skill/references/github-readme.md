# Motion in a GitHub introduction

Use this mode when the requested surface is the repository introduction, README, or GitHub homepage. A GitHub Pages gallery is a useful full player, but does not put motion in the repository's README.

## Choose and package the proof

Inspect completed films and their source revisions first. Use the strongest relevant finished case, in the user's requested language. A recent filename alone does not establish a better or approved case. Preserve private work in progress and distinguish later source footage from older ratio adaptations.

For motion that starts in the README, export a looping image from the existing film. Keep a separate link to a verified MP4 player/download; do not depend on raw `<video autoplay>` or JavaScript surviving GitHub Markdown rendering. Do not wrap the animated image in the only playback link: GitHub may replace that link with its animated-image viewer.

Start around 800 px wide and 20 FPS, then inspect the result at the actual README width. Set a measured project byte budget (for example 6 MiB), rather than claiming it is GitHub's repository file limit. Optimize palette/dither and resolution before removing scenes or lowering an agreed frame rate. A small label in a compressed preview needs a readable text explanation or full-size playback link.

When showing several aspect ratios simultaneously, place the already composed films at matching timestamps in one looping comparison image. Keep each frame's aspect ratio and label the formats. This display composition does not perform native scene re-layout; never substitute crops or stretched master footage for the requested independent films. Compare scenes from the same revision. A newer separate hero film must be identified separately.

Use a standalone `<picture>` with a static source for reduced motion, meaningful alt text, and an adjacent full player link:

```html
<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="examples/readme/hero-en.png">
  <img src="examples/readme/hero-en.gif" width="800" alt="A lampmaker repairs the harbor, lights it and welcomes a returning boat.">
</picture>
```

The paths and subject are illustrative. Reuse the actual project's content. A reproducible three-film packaging example is in the source repository's `scripts/build-readme-media.mjs`; it is not part of the portable skill runtime.

## Make the opening useful

Put the name, a specific outcome, a short benefit statement, a few factual badges, and the strongest moving proof near the top. Provide a clear install entry and an example request with concrete outputs. Keep old release history and renderer internals below the showcase or in collapsible details.

Badges may identify the license, languages, output formats and verified workflow. Link each to its supporting section. Do not copy a reference project's compatibility, speed, quality or installation claims. Verify any new one-command installer and its complete dependencies before recommending it. Learn the reference's hierarchy and rhythm; preserve the user's product and chosen language.

## Verify the destination

Check actual generated GIF frames, duration, dimensions, looping, full decoding and byte size, and retain input/output hashes. Review opening, dense UI, late scenes and the complete loop. Check the actual GitHub README after publishing: images decoded, motion visible, badge text readable, links correct, and the selected English/Chinese version consistent. Check static fallback and mobile sizing where the host supports them. An MP4 player working on Pages or a local Markdown preview passing is not evidence that the GitHub README works.

GitHub supports GIF images and documents relative image paths in repository Markdown. The file-attachment size limits concern comments/issues and must not be misreported as repository asset limits. Sources checked 2026-10-13: [GitHub image syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#images), [attachment contexts](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files). Host presentation still needs an actual page check.
