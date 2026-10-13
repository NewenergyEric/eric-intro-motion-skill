# Verified production findings · 2026-10-13

The repository and original local checkout were inspected at `1c002f5f00c56a05ef03c788bddad673254d101a` (v0.3.0). The original checkout had no uncommitted changes. That release already contained the 12 v2 modules, explicit framing/crop intent, native recomposition instructions and a public 24-second Art Director case. Those are retained.

## Newer local case

The Anxiety Fixer introduction task had completed, and its delivery files and QA records were present. The inspected production contains Chinese and English versions of a 68-second timeline, each at 1080×1080, 1080×1440 and 1080×1920: six videos, 2040 frames each at 30 fps. Its recorded checks cover full decoding, QR decoding, 126 scene samples, 144 transition samples, 192 measured text-container relationships, and browser playthrough to the end for all six outputs. These are the original production's recorded observations, not a fresh platform-upload test. Release evidence separately records hashes rechecked from the actual local files.

Reusable improvements adopted here:

- Validate glyphs within their containing card/control as well as the canvas.
- Maintain independent Chinese/English typography and artwork-label placement.
- Inspect the final compressed timeline, including scene entrance/hold and both sides of cuts.
- Keep a resumable frame cache separate from encoding; include visual assets and audio in the appropriate keys.
- Replace an audio-only edit by copying and hashing the unchanged video stream.
- Package source, manifest and licenses without caches, abandoned narration or machine paths.

The production's assets notice reserves its brand art and product content; it does not grant an open-source license. Therefore this repository includes the reusable workflow and independently authored `Pocket Notes` vector example, **not** that production's video, branded art, logo, product source or music. Dahao's private source and media also remain outside this repository.

## Public evidence

- `examples/native-art-director`: the already-public source-based case and its pinned asset provenance.
- `examples/native-intro`: six newly encoded bilingual examples, scene and transition samples, current layout/encode reports and original MIT recipe.
- `examples/native-intro/verification.json`: release-time checks against actual outputs, including cache reuse and source provenance.

The old auditor accepted a film if any one sampled scene changed its geometry. It now requires independent re-layout evidence for every matching sampled scene, the same source revision and preserved text/layer identities. Regression tests deliberately put an unchanged later scene after a reflowed first scene and require failure.
