# Recompose the whole video for each ratio

Use this path when the user asks for the video itself in 1:1, 3:4, 9:16, or another aspect ratio. A colored or blurred border, a new title outside an inset landscape video, a crop, and uniform scaling of the whole scene do not satisfy that request.

## Recover the editable material

Inspect the supplied repository or project for compositions, timelines, source graphics, fonts, captions and audio. Preserve their licenses, style, copy, claims and timing. Pin asset versions and save a small manifest so a disconnected session can resume. Do not use a stale local export when newer source was supplied.

Keep reusable images, fonts, components and unchanged shot footage. Reuse does not mean preserving their old coordinates. If only flattened pixels remain, reconstruct the necessary text/graphics and motion from the reference. Explain the fidelity limits; never silently fall back to an outer frame. Exact retention of every baked pixel, no cropping, no distortion and a different aspect ratio cannot all be obtained by scaling.

## Lay out independent objects

Use each target composition's width and height. For Remotion, `useVideoConfig()` provides those values. Build target-specific geometry for headings, artwork, cards, captions, connector endpoints and shared objects' motion paths. Do not render a 16:9 composition as a texture inside a larger canvas.

- A wide row can become a grid or a vertical sequence. Recalculate paths from the new endpoints.
- Re-typeset bilingual text independently. Keep full copy unless the user requests editing; do not solve overflow by clipping or shrinking everything into unreadable type.
- Preserve motion meaning: collect → package → hand off should still show the same objects changing roles. Re-layout every scene, including transitions and the closing shot.
- Image assets can stay intact within a scene. An individual illustration is different from embedding the finished video. Preserve focal subjects and keep art/text relationships readable.
- Keep voiceover, music and sound effects synchronized if present. Do not replace existing audio with silence merely to simplify adaptation.

The bundled v1/v2 renderers cover their documented motifs. For a different film, modify its native source or create a dedicated composition. The skill is not a universal one-command conversion of arbitrary footage.

## Verify before delivering

Export posters for every scene in each language/ratio first. Inspect at phone size. Check actual text bounds, text-to-text overlap, art occlusion, logo/CTA placement and reading time. Dimensions alone do not establish a native composition. A passing poster also does not establish correct transitions.

Then render the complete timeline at the target dimensions. Verify codec, dimensions, duration, frame count, square pixels, audio when present and seekability. Sample each scene plus transition boundaries from the actual encoded video. Keep the editable source and a static poster with the delivery.

Optional source-renderer audit: emit `{mode:'native', embeddedMasterVideo:false, sourceHash, width, height, samples, errors:[]}`. Each sample contains `frame,width,height,rows,overlaps`. A measured row has `id,kind:'text'|'layer',text?,bounds:{x,y,w,h},out,overflow`. Use stable independent layer IDs across ratios; exclude deliberately offstage entrances from readable-hold bounds checks, but inspect those transitions separately.

```sh
node scripts/native-audit.mjs square/layout-audit.json portrait/layout-audit.json vertical/layout-audit.json
```

The validator rejects missing/failed measurements, framing reports and globally scaled/translated layouts without evidence of individual re-layout. It validates the supplied evidence; it does not inspect source pixels, certify aesthetic quality, detect every occlusion, or replace a full-video review. A good native composition can contain individual video shots; identify them as such, rather than falsely declaring a finished master to be editable layers.

## Cost follows the requested result

Cache pinned assets and unchanged renders; use small, representative samples while iterating. Spend the required source-editing and rendering effort when the target calls for it. A cheaper workflow that changes the user's requested result is not an optimization.

Source APIs: [Remotion composition geometry](https://www.remotion.dev/docs/use-video-config), [renderer](https://www.remotion.dev/docs/renderer/render-media). Read current docs when changing renderer APIs.
