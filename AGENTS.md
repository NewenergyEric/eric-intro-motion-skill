This repository contains the eric-intro-motion-skill, its social-motion companion,
a motion-story compatibility entry, and deterministic vector renderers.

- Keep rendering local and independent of paid services. Node, FFmpeg and the bundled font are the runtime requirements.
- Preserve the shared JSON content when adapting ratios. Re-layout vectors and text; do not stretch the exported video.
- Fail on text overflow or missing glyphs. Do not hide important text or silently truncate it to make a render pass.
- Distinguish file guarantees from platform display behavior. Platform recommendations must identify their scope, source, and verification date. Personal WeChat Moments is not Tencent Ads.
- Skill instructions do not grant permission to publish, connect accounts, or change profiles.
- Keep private project details, credentials, customer data, and machine-specific paths out of examples and documentation.
- New code and sample artwork are MIT. Keep the bundled font's separate OFL license and attribution.
- Run `npm test`, a real short encode, and validators for all three skill entries for functional changes. Inspect each requested ratio after layout changes.
