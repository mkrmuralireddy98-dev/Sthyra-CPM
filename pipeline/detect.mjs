/* ============================================================================
   Sthyra CPM — AI element-detection + BIM-comparison layer
   ----------------------------------------------------------------------------
   This is the "AI detection model" stage of the pipeline. It has three parts:

     1. runVisionModel(frame)      — THE pluggable model. Stub now; swap for real.
     2. matchToBim(dets, bim)      — associate detections with planned BIM elements
     3. diffBimVsDetections(...)   — turn (expected vs actual) into discrepancies

   ----------------------------------------------------------------------------
   HOW TO MAKE THE MODEL REAL  (replace ONLY runVisionModel — nothing else):

   A) Object detection / segmentation (recommended for "is it built, where, how big"):
        const form = new FormData();
        form.append('image', frameBytes, 'frame.jpg');
        const r = await fetch(process.env.VISION_ENDPOINT, { method:'POST', body: form });
        const out = await r.json();   // e.g. Roboflow / self-hosted YOLOv8 + SAM2
        return out.predictions.map(p => ({
          element_type: MAP[p.class],          // map model classes -> BIM types
          label: p.class, confidence: p.confidence,
          bbox: [p.x-p.width/2, p.y-p.height/2, p.width, p.height].map(n=>n/IMG),
        }));
      Construction-tuned weights exist for: wall/blockwork, formwork, rebar, conduit,
      pipe, door/window openings, ponding, honeycomb, PPE, scaffolding.

   B) Zero-shot presence check with a vision-language model (no training data needed):
        const r = await anthropic.messages.create({ model:'claude-opus-4-8', ...,
          content:[{type:'image', source:{...frame}}, {type:'text',
            text:`For each planned element ${JSON.stringify(bimForZone)}, is it present
                  and built to spec? Return JSON [{code, present, deviation, confidence}].`}]});
      Good for "is the 2nd waterproofing coat applied?" style checks.

   C) Geometry / dimension checks (door width, slab level) need camera pose. Pair the
      Insta360 frames with SfM/SLAM (e.g. OpenMVG, COLMAP) or the camera's own IMU to
      recover scale, then measure openings against the BIM (IFC) projected to that view.

   The STUB below returns deterministic, realistic detections driven by a small
   "as-built" ground-truth table, so the whole pipeline runs and is reproducible
   offline. It is NOT a real model — see the banner the worker prints.
   ============================================================================ */

/* What the camera would actually see on site (the "as-built" truth the model recovers).
   Keyed by BIM code. `present:false` or a `deviation` is what drives a discrepancy. */
const AS_BUILT = {
  'W-3':   { present: true,  conf: 0.94 },
  'WIN-3': { present: true,  conf: 0.91 },
  'EC-1':  { present: true,  conf: 0.74, deviation: { kind: 'routing', got: 'surface-run', want: 'concealed' } },
  'D-2':   { present: true,  conf: 0.79, deviation: { kind: 'dimension', got: 850, want: 900, unit: 'mm' } },
  'WIN-5': { present: true,  conf: 0.90 },
  'WP-2':  { present: false, conf: 0.88, partial: '1st coat only (no 2nd coat / mesh)' },
  'FT-1':  { present: true,  conf: 0.79 },
  'WC-2':  { present: true,  conf: 0.71 },
  'PL-1':  { present: true,  conf: 0.81, deviation: { kind: 'missing-part', got: '1 stub, no sleeve', want: '2 sleeved points' } },
  'WIN-7': { present: true,  conf: 0.88 },
  'SNK-1': { present: true,  conf: 0.61 },        // in-progress per plan → not a defect
};

const TYPE_SEVERITY = { waterproofing: 'crit', slab: 'crit', column: 'crit', rebar: 'crit',
  pipe: 'warn', conduit: 'warn', door: 'warn', window: 'low', block: 'warn', fixture: 'low' };

/* 1) THE MODEL. Two providers behind one function:
   - VISION_PROVIDER=claude  → real Anthropic vision (detect.claude.mjs), needs
     ANTHROPIC_API_KEY + frame.img. Falls back to the stub on any error unless
     VISION_STRICT is set (so the pipeline never stalls on a model hiccup).
   - default                 → deterministic stub from the AS_BUILT table.
   Everything downstream (matchToBim, diff, issues, the app) is identical either way. */
export async function runVisionModel(frame, bimForZone) {
  if (process.env.VISION_PROVIDER === 'claude') {
    try {
      const { runVisionModelClaude } = await import('./detect.claude.mjs');
      return await runVisionModelClaude(frame, bimForZone);
    } catch (e) {
      if (process.env.VISION_STRICT) throw e;
      console.warn(`[vision] claude failed (${e?.message ?? e}); falling back to stub`);
    }
  }
  if (process.env.VISION_PROVIDER === 'cv') {
    // Free on-device classical CV (no API). Needs DECODED pixels: frame.img must
    // be a {data,width,height} RGBA object. The BROWSER supplies that via canvas
    // getImageData (supervisor.js calls window.__CV.cvDetect directly — that's the
    // real CV runtime). In Node the worker has no decoder, so frame.img is just a
    // URL string; rather than flag everything "missing", fall back to the stub.
    const decoded = frame && frame.img && typeof frame.img === 'object';
    if (decoded) {
      try {
        const { runVisionModel: cvRun } = await import('./detect.cv.mjs');
        return cvRun(frame, bimForZone);
      } catch (e) {
        if (process.env.VISION_STRICT) throw e;
        console.warn(`[vision] cv failed (${e?.message ?? e}); falling back to stub`);
      }
    } else {
      if (process.env.VISION_STRICT) throw new Error('cv provider needs a decoded image (browser canvas); Node has no decoder');
      console.warn('[vision] cv provider: no decoded image in Node (browser is the CV runtime); using stub');
    }
  }
  const dets = [];
  for (const el of bimForZone) {
    if (el.plan_status === 'future') continue;            // not built yet by plan
    const truth = AS_BUILT[el.code];
    if (!truth) continue;
    // jitter a bbox around the element's plan position so it looks model-emitted
    const cx = (el.bx ?? 50) / 100, cy = (el.by ?? 50) / 100;
    dets.push({
      bim_code: el.code,
      zone: el.zone,
      element_type: el.element_type,
      label: labelFor(el, truth),
      confidence: round(truth.conf - (frame.lit === false ? 0.04 : 0)),
      bbox: [round(cx - 0.18), round(cy - 0.15), 0.36, 0.42],
      present: truth.present,
      _truth: truth,
      model: 'yolov8-construct-v3 + SAM2 (stub)',
    });
  }
  return dets;
}

function labelFor(el, t) {
  if (el.code === 'WP-2') return 'membrane 1st coat only';
  if (el.code === 'EC-1') return 'surface-run conduit';
  if (el.code === 'D-2')  return `door opening ~${t.deviation?.got ?? '?'}mm`;
  if (el.code === 'PL-1') return 'CPVC pipe stub (no sleeve)';
  return `${el.element_type} detected`;
}

/* 2) Associate each detection with its planned BIM element (here: by code, since the
   stub knows it; a real matcher uses zone + class + IoU against projected BIM geometry). */
export function matchToBim(detections, bimElements) {
  const byCode = Object.fromEntries(bimElements.map(b => [b.code, b]));
  return detections.map(d => ({ ...d, bim: byCode[d.bim_code] || null }));
}

/* 3) Expected (BIM) vs actual (detections) -> discrepancies. */
export function diffBimVsDetections(bimElements, matched, frames) {
  const out = [];
  const detByCode = Object.fromEntries(matched.map(m => [m.bim_code, m]));
  const lowLightZones = new Set(frames.filter(f => f.lit === false).map(f => f.zone));

  for (const el of bimElements) {
    if (el.plan_status !== 'should_be_present') continue;   // only judge what should exist now
    const d = detByCode[el.code];

    if (!d || d.present === false) {
      const partial = d?._truth?.partial;
      out.push(mk(el, partial ? 'incomplete' : 'missing',
        sev(el, 'crit'), d?.confidence ?? 0.6,
        partial ? `BIM expects ${el.spec}. AI sees ${partial}.`
                : `BIM expects ${el.name} (${el.spec}). Not detected in any frame.`));
      continue;
    }
    const dev = d._truth?.deviation;
    if (dev?.kind === 'dimension') {
      out.push(mk(el, 'deviation', 'warn', d.confidence,
        `BIM ${dev.want}${dev.unit} clear. AI-measured ~${dev.got}${dev.unit} (${dev.got - dev.want}${dev.unit}).`));
    } else if (dev?.kind === 'routing') {
      out.push(mk(el, 'deviation', 'warn', d.confidence,
        `BIM specifies ${dev.want}. AI sees ${dev.got}. Re-route before next stage.`));
    } else if (dev?.kind === 'missing-part') {
      out.push(mk(el, 'missing', 'warn', d.confidence,
        `BIM has ${dev.want}. AI detects ${dev.got}.`));
    }
  }

  // extras: detections with no planned BIM element
  for (const d of matched) {
    if (!d.bim) out.push({ zone: d.zone, kind: 'extra', element: d.label, severity: 'low',
      confidence: d.confidence, note: `Detected ${d.label} with no matching planned element.` , bim_code: null });
  }

  // capture-quality flag (low confidence due to lighting)
  for (const z of lowLightZones) {
    const crit = out.find(o => o.zone === z && o.severity === 'crit');
    if (crit) out.push({ zone: z, kind: 'quality', element: 'Capture quality — low light', severity: 'low',
      confidence: 0.55, note: `Frames in ${z} under-lit; a re-walk with lighting is advised to confirm the ${crit.kind} verdict.`, bim_code: crit.bim_code });
  }
  return out;
}

function mk(el, kind, severity, confidence, note) {
  return { zone: el.zone, kind, element: `${el.name} (${el.code})`, severity,
    confidence: round(confidence), note, bim_code: el.code };
}
function sev(el, fallback) { return TYPE_SEVERITY[el.element_type] || fallback; }
function round(n) { return Math.round(n * 100) / 100; }
