/* ============================================================================
   Sthyra CPM — REAL Anthropic-vision construction-element detector
   ----------------------------------------------------------------------------
   THIS IS THE REAL MODEL (not the deterministic stub in detect.mjs).

   detect.mjs dispatches to this module when  process.env.VISION_PROVIDER === 'claude'.
   It is a drop-in replacement for the stub `runVisionModel(frame, bimForZone)`:
   same signature, same returned detection shape, so matchToBim / diff downstream
   are unchanged.

   What it does: for one extracted 360°-walk frame, it sends the frame image plus
   the list of BIM elements planned for that frame's zone to Claude (opus-4-8,
   vision), and asks — for each planned element — "is it present / built, and to
   spec?". The model returns structured JSON which we map to the pipeline's
   detection shape:  { bim_code, zone, element_type, label, confidence, bbox,
   present, model }.

   Failure policy: if ANTHROPIC_API_KEY is missing, or the frame has no image URL,
   or the HTTP call / JSON is bad, this THROWS. The caller (detect.mjs) is expected
   to catch and fall back to the deterministic stub so the pipeline never stalls.

   Runtime: ESM .mjs, Node 18+ (global fetch). No SDK — raw HTTPS fetch only, so
   the exact same code also runs in the Supabase Edge (Deno) runtime.

   API facts (authoritative):
     - POST https://api.anthropic.com/v1/messages
       headers { content-type: application/json, x-api-key, anthropic-version: 2023-06-01 }
     - model id is exactly  claude-opus-4-8  (no date suffix)
     - vision: { type:'image', source:{ type:'url', url } } in a user content array
     - structured JSON: body.output_config.format = { type:'json_schema', schema }
       then response.content[0].text is valid JSON. Schema rules: every object has
       additionalProperties:false and lists ALL keys in required; no min/max; no
       nullable shorthand (empty string == no value).
     - Do NOT send temperature / top_p / top_k / thinking on opus-4-8 (they 400).
   ============================================================================ */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-8';
const ANTHROPIC_VERSION = '2023-06-01';

/* Structured-output schema. Every planned element gets one detection object.
   - additionalProperties:false and ALL keys in `required` on every object (incl. items)
   - no numeric min/max (unsupported)
   - `deviation` is an empty string when there is no deviation (no nullable shorthand) */
const DETECTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['detections'],
  properties: {
    detections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['code', 'present', 'confidence', 'deviation', 'note'],
        properties: {
          code: { type: 'string' },        // BIM code echoed back from the planned list
          present: { type: 'boolean' },     // is the element actually built / there
          confidence: { type: 'number' },   // 0..1 model confidence
          deviation: { type: 'string' },    // '' if built to spec; else what differs
          note: { type: 'string' },         // short human-readable observation
        },
      },
    },
  },
};

/**
 * Real Anthropic-vision detector. Drop-in for the stub runVisionModel.
 *
 * @param {Object} frame        one cpm_frames row; uses frame.img (image URL) and frame.zone
 * @param {Array}  bimForZone   cpm_bim_elements planned for this frame's zone
 * @returns {Promise<Array>}    detections in pipeline shape (see header)
 * @throws if no API key, no frame image, non-2xx response, or malformed JSON
 */
export async function runVisionModelClaude(frame, bimForZone) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  // No key or no image → throw so detect.mjs falls back to the deterministic stub.
  if (!apiKey) throw new Error('runVisionModelClaude: ANTHROPIC_API_KEY is not set');
  if (!frame || !frame.img) {
    throw new Error(`runVisionModelClaude: frame has no image URL (frame.img) for zone ${frame?.zone ?? '?'}`);
  }

  const zone = frame.zone;
  const planned = Array.isArray(bimForZone) ? bimForZone : [];

  // Build the planned-element brief for the prompt (code, name, type, spec).
  const plannedLines = planned.map((el) =>
    `- code: ${el.code} | name: ${el.name} | type: ${el.element_type} | spec: ${el.spec ?? '(none)'}`
  ).join('\n');

  const promptText =
    `You are a construction QA inspector reviewing one 360° site-capture frame from ` +
    `zone "${zone}". The BIM model says the following elements are planned for this zone:\n\n` +
    `${plannedLines || '(no planned elements listed)'}\n\n` +
    `For EACH planned element above, look at the image and decide:\n` +
    `  1. present — is the element actually built / installed and visible (or clearly in place)?\n` +
    `  2. confidence — your 0..1 confidence in that present/absent judgement.\n` +
    `  3. deviation — if it IS present but NOT built to its spec (wrong dimension, wrong ` +
    `routing, missing part, wrong material, incomplete coat, etc.), describe the deviation ` +
    `briefly; if it is built correctly OR not present, return an empty string "".\n` +
    `  4. note — one short phrase describing what you see for this element.\n\n` +
    `Echo back the exact "code" for every planned element. Do not invent elements that ` +
    `are not in the planned list. Return one detection object per planned element.`;

  const body = {
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: frame.img } },
          { type: 'text', text: promptText },
        ],
      },
    ],
    output_config: { format: { type: 'json_schema', schema: DETECTION_SCHEMA } },
    // NOTE: no temperature / top_p / top_k / thinking — opus-4-8 rejects them.
  };

  let res;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`runVisionModelClaude: request to Anthropic failed: ${err?.message ?? err}`);
  }

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch { /* ignore */ }
    throw new Error(`runVisionModelClaude: Anthropic returned ${res.status} ${res.statusText} — ${detail}`);
  }

  let payload;
  try {
    payload = await res.json();
  } catch (err) {
    throw new Error(`runVisionModelClaude: could not parse Anthropic response envelope: ${err?.message ?? err}`);
  }

  const text = payload?.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new Error('runVisionModelClaude: Anthropic response had no text content block to parse');
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`runVisionModelClaude: model output was not valid JSON: ${err?.message ?? err}`);
  }

  const rows = Array.isArray(parsed?.detections) ? parsed.detections : null;
  if (!rows) {
    throw new Error('runVisionModelClaude: parsed JSON did not contain a "detections" array');
  }

  // Index planned elements by code so we can recover element_type + plan position.
  const byCode = Object.fromEntries(planned.map((el) => [el.code, el]));

  const dets = [];
  for (const d of rows) {
    const el = byCode[d.code];
    if (!el) continue; // ignore any element the model hallucinated outside the planned list
    const elementType = el.element_type;
    const note = (typeof d.note === 'string' && d.note.trim()) ? d.note.trim() : `${elementType} detected`;
    // Synthesize a bbox around the element's planned floor-plan position (bx/by are 0..100).
    const cx = (el.bx ?? 50) / 100;
    const cy = (el.by ?? 50) / 100;
    dets.push({
      bim_code: el.code,
      zone,
      element_type: elementType,
      label: note,
      confidence: round(typeof d.confidence === 'number' ? d.confidence : 0.6),
      bbox: [round(cx - 0.18), round(cy - 0.15), 0.36, 0.42],
      present: d.present === true,
      model: 'claude-opus-4-8 (vision)',
    });
  }

  return dets;
}

function round(n) { return Math.round(n * 100) / 100; }
