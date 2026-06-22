/* ============================================================================
   Sthyra CPM — FREE local ML detector via Hugging Face transformers.js
   ----------------------------------------------------------------------------
   Real semantic detection that runs ENTIRELY ON-DEVICE (browser WASM/WebGPU).
   No API, no per-call cost — a ONE-TIME model download (cached by the browser).

   Model: Xenova/clip-vit-base-patch32 — CLIP zero-shot image classification
   (verified live on the HF Hub). Given one frame image and a set of candidate
   TEXT descriptions, CLIP returns how well the image matches each description.

   HOW IT COMPARES AGAINST THE BIM MODEL (the quality check):
   For each BIM element we build descriptions of its EXPECTED (to-spec) state and
   of plausible OFF-spec / absent states, then ask CLIP which the photo looks
   like. If the "present/to-spec" description wins → the element matches the BIM;
   if an "absent/bare/wrong" description wins → a discrepancy. This is a genuine,
   free, semantic "planned (BIM) vs as-built (photo)" comparison.

   Runtime: browser-first. The library is loaded by DYNAMIC import from a CDN
   (TRANSFORMERS_URL) so this file can be inlined into the built app and still
   pull transformers.js at runtime. In Node you'd need the npm package and
   --experimental-network-imports (or set TRANSFORMERS_URL to the package).

   Wired via VISION_PROVIDER=model. Drop-in detection shape:
     { bim_code, zone, element_type, label, confidence, bbox, present, model }
   ============================================================================ */

const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers';
const CLIP_MODEL = 'Xenova/clip-vit-base-patch32';

let _lib = null;     // the transformers.js module namespace
let _clip = null;    // the cached zero-shot-image-classification pipeline
let _loading = null; // in-flight load promise (so concurrent calls share it)

async function lib() {
  if (_lib) return _lib;
  _lib = await import(/* @vite-ignore */ TRANSFORMERS_URL);
  return _lib;
}

/* Lazily build (and cache) the CLIP pipeline. progress is an optional callback
   that transformers.js calls with {status, file, progress, ...} during download
   so the UI can show "downloading model… 42%". Tries q8 (small) then falls back
   to default dtype, and WebGPU then WASM. */
export async function loadModel(progress) {
  if (_clip) return _clip;
  if (_loading) return _loading;
  _loading = (async () => {
    const { pipeline, env } = await lib();
    // Pull weights from the HF Hub (no local model files in this app).
    try { env.allowLocalModels = false; } catch { /* older builds */ }
    const attempts = [
      { dtype: 'q8', device: 'webgpu' },
      { dtype: 'q8' },
      {},
    ];
    let lastErr;
    for (const opts of attempts) {
      try {
        _clip = await pipeline('zero-shot-image-classification', CLIP_MODEL, { ...opts, progress_callback: progress });
        return _clip;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('failed to load CLIP pipeline');
  })();
  try { return await _loading; } finally { _loading = null; }
}

export function isLoaded() { return !!_clip; }

/* ---- BIM element → candidate descriptions ----------------------------------
   For each element type we give: a PRESENT/to-spec description, and one or more
   negative/off-spec descriptions. The first entry is always the "matches BIM"
   hypothesis; the rest are competitors. CLIP softmaxes over all of them. */
const ELEMENT_HYPOTHESES = {
  block:        { present: 'a finished masonry block or plastered wall', negatives: ['an unfinished wall with exposed gaps', 'an empty room with no wall built'] },
  window:       { present: 'a window opening with daylight coming through', negatives: ['a solid wall with no window', 'a bricked-up opening'] },
  door:         { present: 'a clear door opening or doorway in a wall', negatives: ['a solid wall with no opening', 'a partially blocked opening'] },
  conduit:      { present: 'electrical conduit or wiring routed on the wall', negatives: ['a bare wall with no conduit', 'loose unsecured cables'] },
  pipe:         { present: 'installed plumbing pipes with fittings', negatives: ['no plumbing installed', 'a single unfinished pipe stub'] },
  fixture:      { present: 'an installed fixture or floor drain', negatives: ['no fixture installed', 'an open hole with no fixture'] },
  waterproofing:{ present: 'a waterproofing membrane applied over the floor', negatives: ['a bare concrete floor with no membrane', 'a finished tiled floor'] },
  slab:         { present: 'a finished concrete slab surface', negatives: ['cracked or honeycombed concrete', 'unfinished rough concrete'] },
};
const GENERIC_NEGATIVES = ['an empty unfinished construction room', 'a bare concrete surface'];

export function hypothesisFor(el) {
  return ELEMENT_HYPOTHESES[el.element_type] || { present: 'an installed ' + (el.element_type || 'element'), negatives: ['not installed yet'] };
}

/* Build, for one frame's zone, a flat label list where EACH element contributes a
   PRESENT description and its own NEGATIVE description, plus the pairs so we can
   read the result back per element as a binary present-vs-its-negative decision.
   (Comparing each element to its OWN negative avoids one generic "unfinished site"
   label dominating the softmax on construction photos.) */
function buildLabels(bimForZone) {
  const labels = [];
  const pairs = [];
  for (const el of bimForZone) {
    if (el.plan_status === 'future') continue;
    const h = hypothesisFor(el);
    const P = h.present + ' (' + el.code + ')';
    const N = (h.negatives[0] || 'not installed') + ' (' + el.code + ')';
    labels.push(P, N);
    pairs.push({ el, h, P, N });
  }
  return { labels, pairs };
}

const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

/* Run CLIP once on one image input (URL string / Blob / RawImage) against this
   zone's BIM hypotheses. For each element, present = its "to-spec" description
   out-scored its OWN negative; confidence = the binary probability
   score(present)/(score(present)+score(negative)). Returns pipeline-shaped detections. */
export async function classifyFrame(imageInput, frame, bimForZone, progress) {
  const clip = await loadModel(progress);
  const { labels, pairs } = buildLabels(bimForZone);
  if (!labels.length) return [];
  const results = await clip(imageInput, labels, { top_k: labels.length });
  const score = {};
  for (const r of results) score[r.label] = r.score;

  const dets = [];
  for (const { el, h, P, N } of pairs) {
    const sp = score[P] || 0, sn = score[N] || 0;
    const denom = sp + sn;
    const prob = denom > 0 ? sp / denom : 0.5;        // P(present | present vs its own negative)
    const present = prob >= 0.5;
    const cx = (el.bx ?? 50) / 100, cy = (el.by ?? 50) / 100;
    dets.push({
      bim_code: el.code,
      zone: el.zone,
      element_type: el.element_type,
      label: (present ? 'matches BIM: ' : 'BIM mismatch: ') + h.present.replace(/^a |^an /, ''),
      confidence: clamp(Math.round(prob * 100) / 100, 0.3, 0.95),
      bbox: [Math.max(0, cx - 0.18), Math.max(0, cy - 0.15), 0.36, 0.42],
      present,
      model: 'CLIP zero-shot (Xenova/clip-vit-base-patch32, on-device)',
    });
  }
  return dets;
}

/* Pipeline-shaped entry. The caller (browser) must pass a decoded/loadable image
   via frame.img (URL the browser can fetch, or an HTMLImageElement/canvas). */
export async function runVisionModelTransformers(frame, bimForZone, progress) {
  const input = frame && (frame.imgEl || frame.img);
  if (!input) throw new Error('runVisionModelTransformers: frame has no image (frame.img / frame.imgEl)');
  return classifyFrame(input, frame, bimForZone, progress);
}

export default { loadModel, isLoaded, classifyFrame, runVisionModelTransformers, hypothesisFor };
