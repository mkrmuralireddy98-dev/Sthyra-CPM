/* ============================================================================
   Sthyra CPM — FREE on-device CLASSICAL computer-vision detector
   ----------------------------------------------------------------------------
   THIS IS A FREE, DEPENDENCY-FREE, PURE-JAVASCRIPT classical-CV detector.
   No npm packages. No model weights. No model downloads. No network. No API.
   It runs entirely on-device (browser tab or Node worker) on raw pixels.

   It is wired into the pipeline via  VISION_PROVIDER=cv  and is a drop-in for
   the stub `runVisionModel(frame, bimForZone)` in detect.mjs: same returned
   detection shape { bim_code, zone, element_type, label, confidence, bbox,
   present, model }, so matchToBim / diff downstream are unchanged.

   ----------------------------------------------------------------------------
   WHAT IT HONESTLY DOES (and does NOT do)
   ----------------------------------------------------------------------------
   STRONG, REAL outputs (this is the value): per-frame QUALITY metrics computed
   from first principles — brightness (mean luma), contrast (luma stddev),
   sharpness (variance of the Laplacian), edge density (Sobel gradient coverage),
   and a coarse HSV colour profile (dark / bright / bare-grey / warm-orange /
   blue-green region ratios). These are exactly the signals a capture-quality
   meter needs: "is the frame lit?", "is it in focus?", "is the surface bare or
   covered?", "is there a bright opening (window)?".

   WEAK / DELIBERATELY MODEST output: element-level "detections". Classical CV
   CANNOT semantically recognise "a 900mm door" or "the 2nd waterproofing coat".
   So every per-element detection here carries MODEST confidence (clamped
   0.30..0.85) and its `label` describes the OBSERVED SIGNAL honestly
   (e.g. "bright window region detected", "dark uniform region (possible
   membrane)", "low edge density — surface may be incomplete"). It never claims a
   precise semantic ID. A trained detector (YOLO/SAM) or a VLM (detect.claude.mjs)
   would be needed for real object recognition.

   We also REFUSE to overclaim on an unusable frame: if the frame is under-lit /
   blown-out / blurred, "presence" verdicts that depend purely on brightness or a
   dark uniform region (window, membrane) are demoted to honest "can't tell",
   because a dark frame trivially looks like a "dark membrane" everywhere.

   ----------------------------------------------------------------------------
   IMAGE INPUT (runtime-agnostic)
   ----------------------------------------------------------------------------
   Operates on an image given as  { data, width, height }  where `data` is an
   RGBA byte array (Uint8ClampedArray or plain Array), exactly the layout of the
   browser's  CanvasRenderingContext2D.getImageData()  result — 4 bytes/pixel,
   row-major, channel order R,G,B,A.

     - BROWSER: draw the frame to a <canvas> and pass ctx.getImageData(...).
     - NODE:    Node has no canvas natively, so the worker must DECODE the frame
                first (e.g. sharp/jimp/pngjs/upng) into { data, width, height }
                before calling cvDetect. This file itself stays dependency-free;
                decoding is the caller's responsibility.

   Pure ESM (.mjs). The same file is imported by both the browser app and the
   Node worker. It uses only ECMAScript built-ins (Math, Float32Array, typed or
   plain arrays) — no DOM, no Deno, no Node-only globals.
   ============================================================================ */

/* Performance: a 360° frame can be 4000×2000 = 8M pixels. Per-pixel passes at
   full resolution are wasteful for these aggregate stats, so we SAMPLE on a
   stride. We target roughly TARGET_SAMPLES sampled pixels and derive an integer
   stride from the total pixel count. Stride 1 keeps small images exact; large
   images get a coarse-but-stable estimate. The Laplacian/Sobel passes build a
   downscaled luma buffer (see buildLuma) so neighbour access stays O(samples). */
const TARGET_SAMPLES = 200000;   // ~0.2 MP sampled — plenty for aggregate stats
const SHARPNESS_C = 80;          // normalization constant for sharpClarity = s/(s+C)
const EDGE_THRESHOLD = 48;       // Sobel gradient magnitude (0..~1442) counted as an "edge"
const LIT_MIN = 0.25;            // brightness below this → under-lit (not "lit")
const LIT_MAX = 0.92;            // brightness above this → blown-out (not "lit")
const SHARP_MIN_CLARITY = 0.45;  // sharpClarity below this → "blurry" (not "sharp")

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);
const round = (n) => Math.round(n * 100) / 100;
const round3 = (n) => Math.round(n * 1000) / 1000;
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
const pct = (r) => (clamp01(r) * 100).toFixed(0); // honest 0..100% for labels

/* ----------------------------------------------------------------------------
   Validation helper — guards against width/height 0, missing/short RGBA buffers,
   and anything that isn't the {data,width,height} contract. Returns a normalized
   { ok, data, width, height, length } so callers never divide by zero.
   ---------------------------------------------------------------------------- */
function validateImage(img) {
  if (!img || typeof img !== 'object') return { ok: false, width: 0, height: 0 };
  const width = img.width | 0;
  const height = img.height | 0;
  const data = img.data;
  if (width <= 0 || height <= 0) return { ok: false, width: Math.max(0, width), height: Math.max(0, height) };
  if (!data || typeof data.length !== 'number') return { ok: false, width, height };
  // Guard against width*height overflowing a safe integer before we trust it.
  const px = width * height;
  if (!Number.isSafeInteger(px)) return { ok: false, width, height };
  // RGBA = 4 bytes per pixel. Require at least that many bytes; tolerate extra.
  const needed = px * 4;
  if (data.length < needed) return { ok: false, width, height };
  return { ok: true, data, width, height, length: needed };
}

/* Integer stride (in pixels) so that we sample ~TARGET_SAMPLES pixels total. */
function pixelStride(width, height) {
  const total = width * height;
  if (total <= TARGET_SAMPLES) return 1;
  // step in pixels; floor keeps us at/above TARGET_SAMPLES sampled pixels.
  return Math.max(1, Math.floor(Math.sqrt(total / TARGET_SAMPLES)));
}

/* Luma from one RGBA pixel, 0..255 (Rec.601: 0.299R + 0.587G + 0.114B). */
function lumaAt(data, i) {
  return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
}

/* RGB (0..255) → HSV with h in 0..360, s in 0..1, v in 0..1. */
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h, s, v];
}

/* ----------------------------------------------------------------------------
   buildLuma — produce a (possibly downscaled) single-channel luma buffer plus
   its dimensions, for the neighbour-based Laplacian / Sobel passes. Downscaling
   keeps those O(n) passes bounded for huge frames while preserving structure.
   Returns { luma: Float32Array, w, h }.
   ---------------------------------------------------------------------------- */
function buildLuma(data, width, height) {
  const stride = pixelStride(width, height);
  const w = Math.max(1, Math.floor(width / stride));
  const h = Math.max(1, Math.floor(height / stride));
  const luma = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(height - 1, y * stride);
    for (let x = 0; x < w; x++) {
      const sx = Math.min(width - 1, x * stride);
      const i = (sy * width + sx) * 4;
      luma[y * w + x] = lumaAt(data, i);
    }
  }
  return { luma, w, h };
}

/* ----------------------------------------------------------------------------
   computeLaplacianVariance(luma, w, h) -> raw variance of the 4-neighbour
   Laplacian over the luma buffer. Higher = more high-frequency detail = sharper.
   A flat/blurred image yields a low variance. Exported for unit testing.
   ---------------------------------------------------------------------------- */
export function computeLaplacianVariance(luma, w, h) {
  w = w | 0; h = h | 0;
  if (!luma || w < 3 || h < 3) return 0;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const c = luma[y * w + x];
      // 4-neighbour Laplacian kernel [[0,1,0],[1,-4,1],[0,1,0]]
      const lap =
        luma[(y - 1) * w + x] +
        luma[(y + 1) * w + x] +
        luma[y * w + (x - 1)] +
        luma[y * w + (x + 1)] -
        4 * c;
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  return variance > 0 ? variance : 0;
}

/* ----------------------------------------------------------------------------
   sobelEdgeDensity(luma, w, h, threshold) -> fraction (0..1) of interior pixels
   whose Sobel gradient magnitude exceeds `threshold`. A clean bare surface has
   low edge density; a frame full of edges (formwork, rebar, pipes, clutter) is
   high. Exported for unit testing.

   NOTE on a perfect 1-px checkerboard: opposite corners of the 3×3 window are
   equal, so Gx and Gy cancel to 0 — that is correct Sobel behaviour, not a bug.
   Real (lower-frequency) edges register normally.
   ---------------------------------------------------------------------------- */
export function sobelEdgeDensity(luma, w, h, threshold = EDGE_THRESHOLD) {
  w = w | 0; h = h | 0;
  if (!luma || w < 3 || h < 3) return 0;
  let edges = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = luma[(y - 1) * w + (x - 1)];
      const tc = luma[(y - 1) * w + x];
      const tr = luma[(y - 1) * w + (x + 1)];
      const ml = luma[y * w + (x - 1)];
      const mr = luma[y * w + (x + 1)];
      const bl = luma[(y + 1) * w + (x - 1)];
      const bc = luma[(y + 1) * w + x];
      const br = luma[(y + 1) * w + (x + 1)];
      const gx = tl + 2 * ml + bl - (tr + 2 * mr + br);
      const gy = tl + 2 * tc + tr - (bl + 2 * bc + br);
      const mag = Math.sqrt(gx * gx + gy * gy);
      if (mag >= threshold) edges++;
      n++;
    }
  }
  return n === 0 ? 0 : edges / n;
}

/* Neutral metrics object for unusable / missing frames. valid flips per case. */
function neutralMetrics(width, height, valid) {
  return {
    width: width || 0,
    height: height || 0,
    brightness: 0,
    contrast: 0,
    sharpness: 0,
    sharpClarity: 0,
    edgeDensity: 0,
    dominant: { h: 0, s: 0, v: 0 },
    colorRatios: { dark: 0, bright: 0, greyLowSat: 0, warmOrange: 0, blueGreen: 0 },
    valid: !!valid,
    _luma: null, // internal: shared downscaled luma buffer for reuse by heuristics
  };
}

/* ----------------------------------------------------------------------------
   analyzeImage(img) -> aggregate, honest, per-frame metrics. See file header.
   All ratios are 0..1; brightness/contrast are luma-derived /255; dominant is
   an HSV summary; colorRatios bucket pixels by HSV into construction-meaningful
   regions. Sampling uses pixelStride for the per-pixel pass and a downscaled
   luma buffer for the neighbour passes.

   The result carries an internal `_luma` ({luma,w,h}) so a second pass (e.g. the
   door column profile) can reuse it instead of rebuilding. cvDetect strips it
   before returning metrics to callers.
   ---------------------------------------------------------------------------- */
export function analyzeImage(img) {
  const v = validateImage(img);
  if (!v.ok) {
    // Safe, neutral metrics so the pipeline never crashes on a bad frame.
    return neutralMetrics(v.width, v.height, false);
  }

  const { data, width, height } = v;
  const stride = pixelStride(width, height);
  const stepBytes = stride * 4;

  // --- single per-pixel pass (strided): luma stats + HSV buckets + hue accumulation
  let sumLuma = 0;
  let sumLumaSq = 0;
  let count = 0;

  let dark = 0;
  let bright = 0;
  let greyLowSat = 0;
  let warmOrange = 0;
  let blueGreen = 0;

  // Average hue is circular → accumulate sin/cos and recover the mean angle.
  let hueSin = 0;
  let hueCos = 0;
  let sumS = 0;
  let sumV = 0;

  const rowBytes = width * 4;
  for (let y = 0; y < height; y += stride) {
    // i restarts from the row base each row, then advances by exactly stepBytes
    // per x-step in lockstep with `x += stride`, so it can never drift OOB even
    // when width is not a multiple of stride. (Verified against an independent
    // (y*width+x)*4 reference.)
    let i = y * rowBytes;
    for (let x = 0; x < width; x += stride, i += stepBytes) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sumLuma += lum;
      sumLumaSq += lum * lum;

      const [h, s, vv] = rgbToHsv(r, g, b);
      sumS += s;
      sumV += vv;
      // Weight hue by saturation so near-grey pixels don't pull the mean hue.
      const rad = (h * Math.PI) / 180;
      hueSin += Math.sin(rad) * s;
      hueCos += Math.cos(rad) * s;

      // Construction-meaningful HSV buckets:
      if (vv < 0.22) dark++;                                   // shadow / dark cavity / dark membrane
      else if (vv > 0.82) bright++;                            // window / sky / blown highlight
      if (s < 0.18 && vv >= 0.2 && vv <= 0.7) greyLowSat++;    // bare concrete / plaster / grey membrane
      if (h >= 15 && h <= 45 && s > 0.4) warmOrange++;         // rust / wood / terracotta / clay
      if (h >= 150 && h <= 260 && s > 0.25) blueGreen++;       // tarp / tile / water / blue film

      count++;
    }
  }

  if (count === 0) {
    // Degenerate sampling (should not happen given validateImage, but be safe).
    return neutralMetrics(width, height, true);
  }

  const meanLuma = sumLuma / count;
  const varLuma = Math.max(0, sumLumaSq / count - meanLuma * meanLuma);
  const brightness = clamp01(meanLuma / 255);
  const contrast = clamp01(Math.sqrt(varLuma) / 255);

  // Mean (saturation-weighted) hue, plus mean s/v for the dominant summary.
  let domH = 0;
  if (hueSin !== 0 || hueCos !== 0) {
    domH = (Math.atan2(hueSin, hueCos) * 180) / Math.PI;
    if (domH < 0) domH += 360;
  }
  const dominant = { h: Math.round(domH), s: round3(clamp01(sumS / count)), v: round3(clamp01(sumV / count)) };

  // --- neighbour passes on a downscaled luma buffer (sharpness + edges)
  const lumaPlane = buildLuma(data, width, height);
  const sharpness = computeLaplacianVariance(lumaPlane.luma, lumaPlane.w, lumaPlane.h);
  const sharpClarity = clamp01(sharpness / (sharpness + SHARPNESS_C));
  const edgeDensity = clamp01(sobelEdgeDensity(lumaPlane.luma, lumaPlane.w, lumaPlane.h, EDGE_THRESHOLD));

  return {
    width,
    height,
    brightness: round3(brightness),
    contrast: round3(contrast),
    sharpness: Math.round(sharpness),
    sharpClarity: round3(sharpClarity),
    edgeDensity: round3(edgeDensity),
    dominant,
    colorRatios: {
      dark: round3(dark / count),
      bright: round3(bright / count),
      greyLowSat: round3(greyLowSat / count),
      warmOrange: round3(warmOrange / count),
      blueGreen: round3(blueGreen / count),
    },
    valid: true,
    _luma: lumaPlane, // reused by the door heuristic; ignored by everything else
  };
}

/* ----------------------------------------------------------------------------
   Per-element honest heuristics.
   Each returns { present, confidence, label } DERIVED FROM REAL METRICS. The
   confidence is a function of the measured ratio, clamped 0.30..0.85 so we never
   overclaim, and the label always describes the OBSERVED SIGNAL — never a
   semantic ID like "900mm door".

   We bucket by the element_type the BIM row carries (window, block, wall,
   waterproofing, pipe, conduit, fixture, door, ...). Unknown types fall back to
   a generic edge-based heuristic.
   ---------------------------------------------------------------------------- */

const CONF_MIN = 0.3;
const CONF_MAX = 0.85;
const confFromRatio = (r) => round(clamp(CONF_MIN + clamp01(r) * (CONF_MAX - CONF_MIN), CONF_MIN, CONF_MAX));

function heuristicWindow(m) {
  // Windows read as a bright region (glass/sky). Strong signal = high colorRatios.bright.
  const r = m.colorRatios.bright;
  const present = r >= 0.06;
  return present
    ? { present, confidence: confFromRatio(r * 4), label: `bright window region detected (${pct(r)}% of frame bright)` }
    : { present, confidence: CONF_MIN, label: 'no clear bright opening — window not evident in this frame' };
}

function heuristicBlockWall(m) {
  // Blockwork / plaster: a bare grey low-sat surface. Joints add edge texture,
  // but a smoothly plastered wall is legitimately near-edgeless — so a clearly
  // grey-dominant frame counts even at low edge density.
  const grey = m.colorRatios.greyLowSat;
  const present = grey >= 0.12;
  const score = clamp01(grey * 1.5 + m.edgeDensity);
  return present
    ? { present, confidence: confFromRatio(score), label: `bare grey wall surface present (grey ${pct(grey)}%, edges ${pct(m.edgeDensity)}%)` }
    : { present, confidence: CONF_MIN, label: 'little bare-grey surface — wall area not clearly observed' };
}

function heuristicWaterproofing(m, frameUsable) {
  // Membrane reads as a dark OR grey, UNIFORM (low-edge) region. CRITICAL honesty
  // guard: an under-lit / blown-out frame is dark/uniform EVERYWHERE for trivial
  // exposure reasons, so we must NOT call "membrane present" on an unusable frame.
  const uniformDark = m.colorRatios.dark;
  const uniformGrey = m.colorRatios.greyLowSat;
  const lowEdge = m.edgeDensity < 0.06;
  const cover = Math.max(uniformDark, uniformGrey);
  const present = frameUsable && cover >= 0.15 && lowEdge;
  if (present) {
    return {
      present,
      confidence: confFromRatio(cover * 1.5),
      label: `dark/uniform low-edge region (possible membrane, ${pct(cover)}% coverage)`,
    };
  }
  if (!frameUsable) {
    return {
      present: false,
      confidence: CONF_MIN,
      label: 'frame under-lit/blown-out — cannot distinguish a membrane from poor exposure',
    };
  }
  return {
    present,
    confidence: CONF_MIN,
    label: lowEdge
      ? 'low coverage of dark/uniform region — membrane not clearly evident'
      : `high edge density (${pct(m.edgeDensity)}%) — surface looks textured/incomplete, not a smooth coat`,
  };
}

function heuristicLinear(m, kind) {
  // Pipe / conduit: thin linear objects → inferred from edge density, boosted by
  // warm-orange (rust/copper/CPVC) presence. Classical CV cannot trace the run.
  const edges = m.edgeDensity;
  const warm = m.colorRatios.warmOrange;
  const score = clamp01(edges * 1.5 + warm * 2);
  const present = edges >= 0.05;
  const what = kind === 'conduit' ? 'conduit' : 'pipe';
  return present
    ? { present, confidence: confFromRatio(score), label: `edge/linear activity consistent with surface ${what} (edges ${pct(edges)}%${warm > 0.02 ? `, warm-tone ${pct(warm)}%` : ''})` }
    : { present, confidence: CONF_MIN, label: `low edge density (${pct(edges)}%) — no clear ${what} routing observed` };
}

function heuristicFixture(m) {
  // Fixture / sink / fitting: compact object → edges + (often) warm or bright accents.
  const edges = m.edgeDensity;
  const accent = Math.max(m.colorRatios.warmOrange, m.colorRatios.bright);
  const score = clamp01(edges * 1.4 + accent * 1.5);
  const present = edges >= 0.05;
  return present
    ? { present, confidence: confFromRatio(score), label: `localized edge/accent activity (possible fixture, edges ${pct(edges)}%)` }
    : { present, confidence: CONF_MIN, label: 'low edge activity — no distinct fixture observed' };
}

function heuristicDoor(m, frameUsable) {
  // Door opening ≈ a tall DARK vertical gap. We scan a coarse vertical luma
  // profile: if a contiguous band of columns is markedly darker than the frame
  // mean, treat it as a possible opening. Reuses the downscaled luma buffer that
  // analyzeImage already built (m._luma). Honesty guard: on an unusable frame we
  // do not assert a door, since a dark frame is dark everywhere.
  const plane = m && m._luma;
  if (frameUsable && plane && plane.w >= 8 && plane.h >= 8) {
    const { luma, w, h } = plane;
    const colMean = new Float32Array(w);
    let frameSum = 0;
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let y = 0; y < h; y++) s += luma[y * w + x];
      const cm = s / h;
      colMean[x] = cm;
      frameSum += cm;
    }
    const frameMean = frameSum / w;
    const darkCut = frameMean * 0.6; // a column is "dark" if well below the frame mean
    // longest run of consecutive dark columns; track its END index.
    let best = 0, cur = 0, bestEnd = -1;
    for (let x = 0; x < w; x++) {
      if (colMean[x] < darkCut) { cur++; if (cur > best) { best = cur; bestEnd = x; } }
      else cur = 0;
    }
    const gapFrac = best / w; // width of the dark vertical band as a fraction
    const present = gapFrac >= 0.04 && frameMean > 8; // need some signal, not an all-black frame
    if (present) {
      // band spans columns (bestEnd-best+1 .. bestEnd); centre = bestEnd-(best-1)/2
      const cx = (bestEnd - (best - 1) / 2 + 0.5) / w; // +0.5 → centre of the cell, 0..1
      return {
        present,
        confidence: confFromRatio(gapFrac * 4),
        label: `tall dark vertical gap (${pct(gapFrac)}% wide) — possible door opening`,
        _bboxCx: clamp01(cx),
      };
    }
    return { present, confidence: CONF_MIN, label: 'no tall dark vertical gap — door opening not evident' };
  }
  if (!frameUsable) {
    return { present: false, confidence: CONF_MIN, label: 'frame under-lit/blown-out — door opening not separable' };
  }
  // Fallback (tiny luma plane): edge-only, low confidence.
  const present = m.edgeDensity >= 0.05;
  return present
    ? { present, confidence: round(clamp(CONF_MIN + 0.1, CONF_MIN, CONF_MAX)), label: `frame has edge structure (${pct(m.edgeDensity)}%) — door opening not separable by classical CV` }
    : { present, confidence: CONF_MIN, label: 'low edge density — door opening not observed' };
}

/* Dispatch an element to the right heuristic based on its BIM element_type.
   `frameUsable` lets brightness/dark-region heuristics refuse to overclaim on an
   under-lit/blown-out frame. */
function heuristicFor(el, m, frameUsable) {
  const t = String(el.element_type || '').toLowerCase();
  if (t.includes('window')) return heuristicWindow(m);
  if (t.includes('door')) return heuristicDoor(m, frameUsable);
  if (t.includes('waterproof') || t.includes('membrane')) return heuristicWaterproofing(m, frameUsable);
  if (t.includes('conduit')) return heuristicLinear(m, 'conduit');
  if (t.includes('pipe')) return heuristicLinear(m, 'pipe');
  if (t.includes('fixture') || t.includes('sink') || t.includes('fitting')) return heuristicFixture(m);
  if (t.includes('block') || t.includes('wall') || t.includes('plaster') || t.includes('column') || t.includes('slab')) return heuristicBlockWall(m);
  // Unknown type → generic edge presence, honestly labelled.
  const present = m.edgeDensity >= 0.04;
  return present
    ? { present, confidence: confFromRatio(m.edgeDensity * 1.5), label: `edge structure present (${pct(m.edgeDensity)}%) — type "${el.element_type}" not classically recognisable` }
    : { present, confidence: CONF_MIN, label: `flat/low-edge region — "${el.element_type}" not observed` };
}

/* ----------------------------------------------------------------------------
   cvDetect(frame, bimForZone, img) -> { metrics, detections, quality }
   - frame:       a cpm_frames-like row (zone, optional bx/by plan position, etc.)
   - bimForZone:  planned BIM elements for this frame's zone
   - img:         { data, width, height } RGBA — from getImageData (browser) or a
                  decoder (Node). If img is missing/invalid, metrics are neutral
                  and every detection is present:false @ CONF_MIN (honest "blind").

   One detection is emitted per BIM element with plan_status !== "future".
   present/confidence/label are derived from REAL metrics; bbox is synthesized
   from the element's plan position (bx/by 0..100 → /100) or a central box.
   ---------------------------------------------------------------------------- */
export function cvDetect(frame, bimForZone, img) {
  const metrics = analyzeImage(img);

  const lit = metrics.valid && metrics.brightness >= LIT_MIN && metrics.brightness <= LIT_MAX;
  const sharp = metrics.valid && metrics.sharpClarity >= SHARP_MIN_CLARITY;
  const quality = {
    lit,
    sharp,
    brightness: metrics.brightness,
    sharpClarity: metrics.sharpClarity,
    edgeDensity: metrics.edgeDensity,
  };
  // "Usable" = we actually have a valid, lit frame. Heuristics that key off
  // brightness/dark uniformity must not overclaim when this is false.
  const frameUsable = metrics.valid && lit;

  const zone = frame?.zone;
  const planned = Array.isArray(bimForZone) ? bimForZone : [];
  const detections = [];

  for (const el of planned) {
    if (!el || el.plan_status === 'future') continue; // not built yet per plan

    const h = heuristicFor(el, metrics, frameUsable);

    // bbox: prefer the element's planned floor-plan position (bx/by are 0..100).
    // A door heuristic may surface a measured horizontal centre (_bboxCx).
    const cx = h._bboxCx != null ? h._bboxCx : (isNum(el.bx) ? el.bx / 100 : (isNum(frame?.bx) ? frame.bx / 100 : 0.5));
    const cy = isNum(el.by) ? el.by / 100 : (isNum(frame?.by) ? frame.by / 100 : 0.5);
    const bw = 0.36, bh = 0.42;
    const bbox = [
      round3(clamp01(cx - bw / 2)),
      round3(clamp01(cy - bh / 2)),
      bw,
      bh,
    ];

    // If the frame itself is unusable (dark/blurred), trim confidence honestly.
    let confidence = h.confidence;
    if (!quality.lit) confidence = round(Math.max(CONF_MIN, confidence - 0.08));
    if (!quality.sharp) confidence = round(Math.max(CONF_MIN, confidence - 0.05));

    detections.push({
      bim_code: el.code,
      zone: el.zone ?? zone,
      element_type: el.element_type,
      label: h.label,
      confidence: round(clamp(confidence, CONF_MIN, CONF_MAX)),
      bbox,
      present: h.present === true,
      model: 'free-cv (brightness+laplacian+sobel+hsv)',
    });
  }

  // Don't leak the internal luma buffer to callers / serializers.
  const publicMetrics = { ...metrics };
  delete publicMetrics._luma;

  return { metrics: publicMetrics, detections, quality };
}

/* ----------------------------------------------------------------------------
   runVisionModel — pipeline-compatible adapter so detect.cv.mjs is a drop-in for
   the stub when VISION_PROVIDER=cv. The pipeline calls runVisionModel(frame,
   bimForZone) and expects ONLY the detections array. The frame must carry an
   `img` ({data,width,height} RGBA) — supplied by the browser (getImageData) or a
   Node decoder. With no image, detections are returned honestly as present:false.

   To activate it, detect.mjs needs a `VISION_PROVIDER === 'cv'` branch that does:
       const { runVisionModel } = await import('./detect.cv.mjs');
       return runVisionModel(frame, bimForZone);
   (detect.mjs currently only branches on 'claude'; add the 'cv' case there.)
   ---------------------------------------------------------------------------- */
export function runVisionModel(frame, bimForZone) {
  const img = frame?.img && typeof frame.img === 'object' ? frame.img : null;
  const { detections } = cvDetect(frame, bimForZone, img);
  return detections;
}

export default { analyzeImage, cvDetect, computeLaplacianVariance, sobelEdgeDensity, runVisionModel };
