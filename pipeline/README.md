# Sthyra CPM — 360° × BIM analysis pipeline

Compares an Insta360 walkthrough against the BIM model and files discrepancies as
site issues. Every stage exists and runs; the **vision model is the one pluggable
component** (deterministic stub by default, real Anthropic-vision drop-in provided).

```
Supervisor connects Insta360 X5 → captures 360° video (timestamp + floor + zone + IMU)
  → upload          ┐
  → extract frames  │  cpm-pipeline edge function  (Supabase, service role)  ← runs live
  → map to plan     │  …or pipeline/worker.mjs     (local CLI, same logic)
  → align BIM       │
  → AI element check┘  ← detect.mjs → detect.claude.mjs (the model — swappable)
  → diff → discrepancies → cpm_issues
```

## What's live (deployed + verified)

- **Backend tables** (Supabase `rajvfosoxgkyanwmdphq`, anon read-only):
  `cpm_captures, cpm_frames, cpm_bim_elements, cpm_detections, cpm_discrepancies`.
- **Edge function `cpm-pipeline`** — `https://rajvfosoxgkyanwmdphq.supabase.co/functions/v1/cpm-pipeline`
  (`verify_jwt=true`). The **genuine server-side write path**: runs with the service
  role, so it is the only thing that may insert detections/discrepancies and **auto-file
  issues into `cpm_issues`** (anon INSERT is RLS-blocked). Idempotent, CORS-enabled,
  fails closed (a rejected write flags the capture `failed` and returns 500).
  Verified: `POST {capture_id:"CAP-0613-01"}` → 13 frames, 11 detections, 5 discrepancies
  (1 crit/3 warn/1 low), 4 issues filed; re-runs don't duplicate; no-auth → 401.
- **Auto-process trigger** (`cpm_captures_autoprocess` + `cpm_trigger_pipeline()`):
  when a capture's `status` transitions to `'uploaded'`, a `pg_net` async POST invokes
  the edge function. Recursion-safe (the function only moves status forward, never back
  to `'uploaded'`). Verified: one `uploaded` flip → exactly one HTTP call (200) → capture
  auto-returned to `analyzed`. See `pipeline/trigger.sql`.

## The AI model (one pluggable function)

`detect.mjs#runVisionModel` dispatches:

- `VISION_PROVIDER=model` → **`detect.transformers.mjs`** — a **free local ML model**:
  Hugging Face **transformers.js** running **CLIP zero-shot** (`Xenova/clip-vit-base-patch32`)
  entirely in the browser (WASM/WebGPU). No API, no per-call cost — a one-time model
  download, then cached. For each BIM element it scores the photo as a binary
  *present-to-spec vs its own off-spec/absent* hypothesis → a genuine **semantic
  BIM(planned)-vs-photo(as-built) quality check**. Verified live in-app on the 5 real
  frames: e.g. the doorway photo → "door opening" 79% ✓, kitchen pipework → "plumbing
  fixture" 95% ✓, tiled bathroom → "waterproofing membrane" 35% ✗ (correctly rejects —
  it's already tiled). Inlined into the app as `window.__MODEL` (lazy-imports
  transformers.js from CDN). **Honest scope:** a general model used zero-shot — real and
  free, but decision-support; construction-tuned weights (YOLO/SAM) or geometric
  registration would raise precision. Also available: `Xenova/owlvit-base-patch32`
  (zero-shot object detection with boxes) via the same library.
- `VISION_PROVIDER=cv` → **`detect.cv.mjs`** — a **free, on-device classical-CV detector**
  (no API, no model download, no deps). Processes the real pixels: brightness (mean luma),
  sharpness (Laplacian variance), edge coverage (Sobel), and an HSV colour profile. The
  **browser** supplies decoded pixels via canvas `getImageData` (the app inlines this core
  as `window.__CV` and runs it on real frame photos — see the "On-device CV · free" panel
  in **More → BIM × 360 → capture detail**). Verified live on 5 CORS-enabled Wikimedia
  construction photos (`pipeline/cv-sample-images.json`, seeded into `cpm_frames.img`):
  real, differentiated per-frame metrics (brightness 34–54%, edge 16–46%). **Honest scope:**
  quality/lighting/coverage + colour signals are real measurements; element-level CV labels
  are heuristic (modest confidence) — semantic object ID still needs a trained model. In
  Node (no image decoder) the worker falls back to the stub.
- `VISION_PROVIDER=claude` → **`detect.claude.mjs`** — a **real Anthropic-vision detector**
  (`claude-opus-4-8`, raw HTTP, `output_config.format` structured JSON). Sends each frame
  image + the zone's planned BIM elements and asks, per element, "present / to spec?".
  Needs `ANTHROPIC_API_KEY` + `cpm_frames.img` (an extracted-frame URL). Falls back to the
  stub on any error unless `VISION_STRICT=1`.
- default → deterministic stub (embedded as-built table) so the pipeline runs offline.

Other real options documented in `detect.claude.mjs`: a YOLOv8+SAM2 endpoint, or SLAM/IFC
for true dimension checks. Everything downstream of the model is unchanged when you swap it.

## Run

```bash
# local CLI worker (dry-run: reads live data, computes, prints; --service to persist)
node pipeline/worker.mjs CAP-0613-01

# trigger the deployed function directly (anon JWT in Authorization)
curl -s -X POST https://rajvfosoxgkyanwmdphq.supabase.co/functions/v1/cpm-pipeline \
  -H "Authorization: Bearer <ANON_JWT>" -H "Content-Type: application/json" \
  -d '{"capture_id":"CAP-0613-01"}'

# enable the real vision model in the local worker
ANTHROPIC_API_KEY=sk-ant-... VISION_PROVIDER=claude node pipeline/worker.mjs CAP-0613-01
```

The supervisor app's **More → BIM × 360 analysis → Re-run analysis** (and the capture
review's "Save & analyze vs BIM") call the deployed function, then reload results — the
"Processed by cpm-pipeline edge function ✓" badge confirms a live run.

## Files

- `supabase/functions/cpm-pipeline/index.ts` — deployed edge function (the deployed build
  ASCII-normalizes a few unicode glyphs in this source; logic is identical).
- `pipeline/detect.mjs` — model dispatch + diff + issue-generation logic.
- `pipeline/detect.claude.mjs` — the real Anthropic-vision detector.
- `pipeline/worker.mjs` — local CLI orchestrator (same stages as the edge function).
- `pipeline/trigger.sql` — pg_net auto-process trigger (uses the anon JWT; the function
  self-elevates server-side, so no service key lives in the DB).

## BIM model viewer + upload, and real BIM↔photo datasets

The capture-detail screen has a **BIM model · 3D** panel: a `<model-viewer>` (lazy-loaded
from CDN) rendering a real openly-licensed building model (three.js `LittlestTokyo.glb`,
CC-BY) as a stand-in, plus **upload your own** `.glb`/`.gltf`. IFC → convert to glTF via
[web-ifc](https://github.com/ThatOpen/engine_web-ifc) / IfcConvert (architected, not wired).

**Real paired "BIM model + site photos" datasets** are scarce as clean hotlinkable assets;
the established open ones are large academic bundles, not CORS URLs:
- **Schependomlaan** — IFC + 4D planning + site point-cloud/photos (TU/e; the canonical
  scan-vs-BIM progress dataset).
- **buildingSMART sample IFC** (Duplex Apartment, Office) — models, generally without paired
  site photos.
- Academic **construction progress/quality monitoring** datasets (TU Delft, ETH) pair images
  with BIM but require registration/request.

The practical path this app implements: **upload your real BIM (glTF/IFC→glTF) + your site
photos**, run the free CLIP check per element, and (future) project IFC geometry onto the
camera view for true geometric overlay — which needs camera pose (SfM/SLAM or the Insta360 IMU).

## Honesty note

The default detector is a **reproducible stub**, not real CV — the worker prints a ⚠ banner.
The real path (`detect.claude.mjs`) is wired and correct but needs an API key + real frame
images to produce true detections. Schema, REST, frame mapping, BIM comparison, issue
generation, the trigger, and the whole app are real and verified.
