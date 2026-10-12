# Platform guidance

Last checked: **2026-10-12**. Scope: ordinary organic posts, not paid advertisements. Presets are maintained in `assets/presets.json` (relative to the skill root).

| Target | Our starting canvas | Why this layout | What still needs checking |
| --- | --- | --- | --- |
| LinkedIn feed | 1080×1350, 4:5 | Readable portrait layout for text and diagrams | Mobile feed, expanded player, selected cover |
| X | 1920×1080, 16:9 | A wide, readable video composition | Feed preview, full player, account upload limits |
| Personal WeChat Moments | 1080×1080, 1:1 | Conservative square composition | Actual phone composer and feed thumbnail; recommendation is a heuristic |
| Xiaohongshu organic video | 1080×1440, 3:4; optional 1080×1920, 9:16 | A taller composition for phone viewing | Current upload composer, cover and feed crop; 3:4 is our recommendation, not a verified universal platform specification |
| Generic vertical | 1080×1920, 9:16 | A separate tall composition with larger top/bottom insets | Destination-specific controls and previews |

These choices are not claims that a platform requires or universally favors one ratio. The presets leave roughly 6–9% on the sides and additional room at the top/bottom; the generic vertical preset uses 11% top and 16% bottom. These are **our design margins**, not published platform safe-zone coordinates.

## LinkedIn

[Share videos on LinkedIn](https://www.linkedin.com/help/linkedin/answer/a7174587) specifies ordinary video uploads up to 5 GB and 15 minutes, aspect ratios from 1:2.4 to 2.4:1, 10–60 fps, bitrates of 192 Kbps–30 Mbps, and a resolution range of 256×144 to 4096×2304. Minimum length is 3 seconds on desktop and 2 seconds on mobile. Our 8-second, 30 fps examples use a 1 Mbps target with CBR padding; without it, sparse vector scenes can compress below the published bitrate minimum. This is not the older Page/Career Page rule set.

[Full-screen vertical video on LinkedIn](https://www.linkedin.com/help/linkedin/answer/a6290168) says display depends on device and that parts of a video can be cropped. It also distinguishes uploading a normal video from selection into the immersive feed. Never promise a direct immersive-feed placement or zero cropping on every phone.

## X

[How to share and watch videos on X](https://help.x.com/en/using-x/x-videos) describes ordinary non-Premium uploads of up to 140 seconds and 512 MB, with different limits for Premium. The short example files fit the ordinary duration and size limits. Use the intended account's current composer to verify acceptance.

The [photo/GIF help page](https://help.x.com/en/using-x/posting-gifs-and-pictures) discusses how single images are displayed. Those image statements are not a blanket guarantee for video players, multi-image grids, or thumbnails. Do not transfer an image-only ratio rule to videos.

## Personal WeChat Moments

No dependable, current primary specification for personal Moments aspect ratios and thumbnail behavior was located during this check. The square preset is an **authoring recommendation requiring a real-device preview**, not a verified upload specification. Tencent Ads material applies to advertisements and must not be presented as personal Moments requirements.

Check the target phone's composer, cover/thumbnail preview, and expanded playback. The user may do this themselves; do not publish a test post without authorization. Prefer an actual MP4 video handoff rather than assuming an animated GIF behaves as a video.

## File quality versus display behavior

Native re-layout paints the full canvas, preserves every text field, and checks glyph bounds. Finished-footage backdrop mode fits the original frame without adding black padding. Neither controls platform-added UI, player backgrounds, recompression, feed crops, or borders already embedded in a supplied file. A report deliberately records `platformPreviewVerified: false` until that separate step really occurs.
