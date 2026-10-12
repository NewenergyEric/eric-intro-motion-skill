# Motion Story Skills

**v0.3 makes native recomposition the default.** Re-layout the whole film from editable layers for 1:1, 3:4 and 9:16; framing/backdrop/crop require an explicit treatment flag. [Native workflow and measured checks](skills/social-motion/references/native-recomposition.md).

[A complete source-based example](examples/native-art-director/): the same 24-second Art Director film in square, 3:4 and 9:16, with React/Remotion source, original artwork, fonts and measured layout reports.

**v0.2 added reusable motion.** Nine scenes from the author's profile, three independent motion studies, cached component recipes, existing-media cuts, and full-frame social adaptations. [Reuse guide](skills/motion-story/references/reuse.md) · [Reference credits](skills/motion-story/references/motion-studies.md).

```sh
node skills/motion-story/scripts/compose.mjs --list
node skills/motion-story/scripts/compose.mjs --input skills/motion-story/assets/examples/profile-remix.json --out output/remix --preset xiaohongshu --cache output/cache
```

Change a short JSON recipe instead of rebuilding every asset. Unchanged clips reuse verified caches; exact output hits skip encoding too. Rendering calls no model API. Planning and editing still consume tokens, so no unmeasured savings percentage is claimed. Use `--formats png` to review layouts first.

New 12-second samples: [profile remix, square](examples/remix/profile-square/profile-remix.mp4), [profile remix, 3:4](examples/remix/profile-portrait/profile-remix.mp4), [three motion studies](examples/remix/reference-portrait/reference-remix.mp4). GIFs and editable recipes sit beside each MP4. Rebuild them with `npm run examples:remix -- --force`.

Social presets now include Xiaohongshu 1080×1440 (3:4), alongside Moments 1080×1080 and optional vertical 1080×1920. These are design recommendations; check the actual platform preview. `social-motion/scripts/frame.mjs --intent embed` is an optional inset-video treatment, not native ratio adaptation. Private project media is not included in this repository.

[中文](README.zh-CN.md) · [Examples](examples/) · [Download](https://github.com/NewenergyEric/motion-story-skills/releases/latest) · [MIT license](LICENSE)

Small animations for explaining an idea. Make a GIF or MP4, then give it a layout that fits where you want to share it.

![A note moves through three stages: catch it, shape it, share it.](examples/idea-to-post/x/idea-to-post.gif)

The same story can sit beside its diagram in a wide frame, above it in a square, or flow down the page in a portrait. Text is measured and re-wrapped. Cards and connectors move to new positions. The renderer does not just stretch the finished video.

![One story re-laid out as landscape, square, portrait and tall portrait.](examples/ratio-comparison.png)

## Two skills

| Skill | Use it for |
| --- | --- |
| [`motion-story`](skills/motion-story/SKILL.md) | Turn an idea into a short vector story. Export MP4, GIF, a poster and editable content. |
| [`social-motion`](skills/social-motion/SKILL.md) | Re-layout that story for LinkedIn, X, Moments or another ratio. Recover source and recompose existing films; explicit embedding/cropping remains optional. |

Three starter motifs cover a process, a collaboration loop, and a collection of visual references. They are starting points for new stories, not a limit on what a skill can help create. English and Simplified Chinese examples are included. The instructions work with agents that read `SKILL.md`; Codex also receives display metadata.

## Try it

Install **Node.js 22+** and **FFmpeg** (`ffmpeg` and `ffprobe` must be on PATH). No account, paid API, or rendering service is needed.

```sh
git clone https://github.com/NewenergyEric/motion-story-skills.git
cd motion-story-skills
npm run setup

node skills/motion-story/scripts/cli.mjs --input skills/motion-story/assets/examples/idea-to-post.json --out output/demo

node skills/social-motion/scripts/pack.mjs --input skills/motion-story/assets/examples/idea-to-post.json --out output/social --presets linkedin,x,moments,vertical
```

Copy an example JSON, replace the text, and pass your file to `--input`. Start with `--formats png` to check a layout before encoding. See [the content format](skills/motion-story/references/story-format.md) for custom dimensions, fonts, and export options.

### Install as skills

```sh
node scripts/install.mjs
```

The installer copies both folders into `$CODEX_HOME/skills`, or `~/.codex/skills` if unset. It refuses to overwrite existing skills. It prints the exact `npm ci --prefix "…/motion-story"` command needed to install their runtime. Run that command, then refresh skill discovery or open a new session if necessary.

For another agent or a project-specific location, use `node scripts/install.mjs --dest /path/to/skills`. Keep the two folders next to each other. Alternatively, extract the [skill release archive](https://github.com/NewenergyEric/motion-story-skills/releases/latest) into the skills directory, then run `npm ci` inside `motion-story`.

Example requests:

> Use $motion-story to show how an idea becomes a short demo. Keep it simple, use my wording, and give me a GIF and MP4.

> Use $social-motion to make LinkedIn, X and Moments versions of this story. Re-layout the cards, keep all the text, and include the source and static posters.

## Examples you can use

Each example is an 8-second loop with a full-resolution MP4, a 720 px wide GIF, a PNG poster, source JSON/SVG, a safe-area preview, and a validation report.

| Story | Canvas | Files |
| --- | --- | --- |
| One idea. Room to move. | 1920×1080 / 16:9 | [MP4](examples/idea-to-post/x/idea-to-post.mp4) · [GIF](examples/idea-to-post/x/idea-to-post.gif) |
| The same idea, re-laid out | 1080×1350 / 4:5 | [MP4](examples/idea-to-post/linkedin/idea-to-post.mp4) · [GIF](examples/idea-to-post/linkedin/idea-to-post.gif) |
| The same idea, square | 1080×1080 / 1:1 | [MP4](examples/idea-to-post/moments/idea-to-post.mp4) · [GIF](examples/idea-to-post/moments/idea-to-post.gif) |
| The same idea, tall | 1080×1920 / 9:16 | [MP4](examples/idea-to-post/vertical/idea-to-post.mp4) · [GIF](examples/idea-to-post/vertical/idea-to-post.gif) |
| A little help. A better loop. | 1920×1080 / 16:9 | [MP4](examples/agents-at-work/x/agents-at-work.mp4) · [GIF](examples/agents-at-work/x/agents-at-work.gif) |
| 有些感觉，值得留住。 | 1080×1080 / 1:1 | [MP4](examples/keep-the-feeling/moments/keep-the-feeling.mp4) · [GIF](examples/keep-the-feeling/moments/keep-the-feeling.gif) |

After cloning or downloading the example archive, open [`examples/index.html`](examples/index.html) in a browser for the interactive gallery. Videos start only when you press play. To rebuild: `npm run examples` (or `npm run examples -- --force` to replace existing outputs).

## About cropping and black bars

Native compositions fill their own canvas and keep text within checked design insets. This prevents black padding or clipped text from being baked into those files. Platforms still control their players, overlays and feed thumbnails. LinkedIn explicitly documents device-dependent cropping; the Moments square preset is a conservative authoring choice that needs a real-phone preview. [Read the checked platform guidance and sources.](skills/social-motion/references/platforms.md)

For native adaptation of an existing GIF/MP4, recover source or reconstruct its layers first. Only for an explicitly requested backdrop treatment:

```sh
node skills/social-motion/scripts/reframe.mjs --intent embed --input existing.mp4 --out square.mp4 --preset moments --mode backdrop
```

`backdrop` keeps the full source over a blurred duplicate. `crop` intentionally cuts the edges; use it only when that suits the content. Existing borders remain part of a supplied source, and small text may need rebuilding. [See the tradeoffs.](skills/social-motion/references/finished-footage.md)

## Verification and license

`npm test` checks bilingual layouts, content preservation, deterministic motion, overflow failures, and a real MP4/GIF encode. Exports include media dimensions, duration, frame count, bitrates, hashes, and an explicit platform-preview status. Source MP4 uses H.264/yuv420p, square pixels, faststart, silent AAC and a 1 Mbps video target. The font is bundled for reproducible rendering. Files do not require local system fonts.

Code, skill instructions and sample artwork: **MIT**. The bundled Noto Sans SC font retains **SIL OFL 1.1**. See [third-party notices](THIRD_PARTY_NOTICES.md). No FFmpeg binary is distributed.

Contributions are welcome: new motifs, better layouts, other writing systems, and platform guidance backed by current sources. Keep the editable source and an inspected example with any new composition.
