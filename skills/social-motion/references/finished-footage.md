# When only the finished GIF or video remains

A flat export has no editable text, layout constraints, or separate subjects. If the user wants the whole video adapted to a new ratio, recover source or reconstruct the required layers using [native recomposition](native-recomposition.md). The treatments below apply only when explicitly chosen; neither is native re-layout. Three goals cannot always be achieved together by scaling: retain every source pixel, fill a different aspect ratio with the original image alone, and avoid distortion.

## Backdrop: preserve the full source frame

```sh
node scripts/reframe.mjs --intent embed --input source.mp4 --out square.mp4 --preset moments --mode backdrop
```

The foreground is scaled proportionally to fit. A blurred, darkened duplicate fills the entire background. This adds no black padding and does not cut the foreground. Any existing black bars in the source remain part of that source; inspect them before choosing this mode. Wide graphics with small type can become too small in a tall canvas. In that case, rebuild from editable content instead.

## Crop: fill with the source image

```sh
node scripts/reframe.mjs --intent crop --input source.mp4 --out portrait.mp4 --preset linkedin --mode crop --focus-x 0.65 --focus-y 0.5
```

Focus values run from 0 to 1 and locate the crop within the available horizontal/vertical excess; they are not face detection. Cropping intentionally loses edges. Check titles, subtitles, logos and faces throughout the clip, not just the first frame. It is unsuitable when all of a text-heavy source must remain visible.

Both modes accept a decodable video or GIF and output MP4 with H.264/yuv420p, square pixels, 30 fps, faststart and AAC audio. The first audio track is preserved/re-encoded when present; otherwise a silent track is generated. The source is never replaced. The accompanying report verifies media properties but explicitly does not certify text safety or live platform previews.

For a different canvas, add a clearly named preset with its scope and evidence status, or use the editable base renderer. The underlying [FFmpeg scale, crop, blur and overlay filters](https://ffmpeg.org/ffmpeg-filters.html) are local; no account connection or upload is involved.
