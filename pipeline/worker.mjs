/* ============================================================================
   Sthyra CPM — 360° × BIM analysis pipeline worker
   ----------------------------------------------------------------------------
   Runs the full end-to-end pipeline for one capture against the live Supabase
   backend, mirroring exactly what the supervisor app visualizes:

     select capture -> extract frames -> map to floor plan -> align BIM
     -> AI element check (detect.mjs) -> diff -> discrepancies -> issues

   RUN:
     node pipeline/worker.mjs CAP-0613-01            # dry-run (anon read, prints result)
     SERVICE_ROLE=<key> node pipeline/worker.mjs CAP-0613-01   # also writes results

   Reads are done with the publishable (anon) key. Writes require a Supabase
   service-role key in SERVICE_ROLE (anon is read-only by RLS, by design) — so
   without it the worker computes and prints the pipeline but does not persist.
   ============================================================================ */
import { runVisionModel, matchToBim, diffBimVsDetections } from './detect.mjs';

const URL = process.env.SUPABASE_URL || 'https://rajvfosoxgkyanwmdphq.supabase.co/rest/v1';
const ANON = process.env.SUPABASE_KEY || 'sb_publishable_u3pa8Z9iEZE8A7GSZnGXOQ_dAsjUbOp';
const SERVICE = process.env.SERVICE_ROLE || null;          // optional — enables writes
const captureId = process.argv[2] || 'CAP-0613-01';
const cid = encodeURIComponent(captureId);   // SEC-5: prevent PostgREST query injection via the CLI arg

const READ = { apikey: ANON, Authorization: `Bearer ${ANON}` };
const WRITE = SERVICE ? { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' } : null;

const get = (t, q) => fetch(`${URL}/${t}?${q}`, { headers: READ }).then(r => r.json());
async function patch(t, q, body) {
  if (!WRITE) return;
  await fetch(`${URL}/${t}?${q}`, { method: 'PATCH', headers: { ...WRITE, Prefer: 'return=minimal' }, body: JSON.stringify(body) });
}
async function post(t, rows) {
  if (!WRITE) return;
  await fetch(`${URL}/${t}`, { method: 'POST', headers: { ...WRITE, Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
}

const log = (s) => console.log(s);
const stage = (n, label, detail) => log(`\n  [${n}/6] ${label}${detail ? '  ·  ' + detail : ''}`);

async function run() {
  log(`\n┌─ Sthyra CPM · 360°×BIM pipeline ─────────────────────────────`);
  log(`│  capture: ${captureId}   mode: ${WRITE ? 'WRITE (service role)' : 'DRY-RUN (anon read-only)'}`);
  log(`└──────────────────────────────────────────────────────────────`);
  if (!WRITE) log(`  ⚠  AI model is a deterministic STUB (detect.mjs). See its header to wire a real\n     YOLOv8+SAM2 / VLM endpoint. Results below are reproducible, not from real CV.`);

  // ---- 0. select capture ----
  const cap = (await get('cpm_captures', `id=eq.${cid}&select=*`))[0];
  if (!cap) return log(`  ✗ capture ${captureId} not found`);
  log(`\n  Project ${cap.project} · ${cap.tower} · ${cap.floor} · ${cap.device}`);

  // ---- 1. frames (extracted @ 1.5s; here we read the mapped analysis frames) ----
  stage(1, 'Extract + map frames', `${cap.frame_count} @1.5s · reading mapped analysis frames`);
  const frames = await get('cpm_frames', `capture_id=eq.${cid}&select=*&order=idx`);
  log(`        ${frames.length} frames mapped across zones: ${[...new Set(frames.map(f => f.zone))].join(', ')}`);

  // ---- 2. align BIM (planned elements for this floor) ----
  stage(2, 'Align BIM model', `${cap.floor} · Rev 04`);
  const bim = await get('cpm_bim_elements', `floor=eq.${encodeURIComponent(cap.floor)}&select=*&order=sort`);
  log(`        ${bim.length} planned elements: ${bim.map(b => b.code).join(', ')}`);

  // ---- 3. AI element check (per frame -> detections) ----
  stage(3, 'AI element check', cap.model_version || 'vision model');
  const byZone = groupBy(bim, 'zone');
  let dets = [];
  for (const f of frames) {
    const out = await runVisionModel(f, byZone[f.zone] || []);
    out.forEach(d => dets.push({ ...d, frame_idx: f.idx }));
  }
  dets = dedupeBest(dets);                                   // keep highest-confidence per element
  const matched = matchToBim(dets, bim);
  log(`        ${dets.length} detections · ${matched.filter(m => m.bim).length} matched to BIM`);

  // ---- 4. diff (expected vs actual) ----
  stage(4, 'Compare BIM ↔ as-built', 'expected vs detected');
  const discs = diffBimVsDetections(bim, matched, frames);
  log(`        ${discs.length} discrepancies: ` +
      ['crit', 'warn', 'low'].map(s => `${discs.filter(d => d.severity === s).length} ${s}`).join(' · '));

  // ---- 5. generate issues (for open crit/warn discrepancies) ----
  stage(5, 'Generate issues', 'auto-file open crit/warn');
  const toFile = discs.filter(d => d.kind !== 'quality' && d.severity !== 'low');
  for (const d of discs) {
    log(`        ${icon(d.severity)} [${d.kind.toUpperCase()}] ${d.zone} — ${d.element}`);
    log(`            ${d.note}  (conf ${d.confidence})`);
  }

  // ---- 6. persist (write mode only) ----
  stage(6, 'Persist results', WRITE ? 'writing to Supabase' : 'skipped (dry-run)');
  if (WRITE) {
    await post('cpm_detections', matched.map((m, i) => ({
      capture_id: captureId, zone: m.zone, element_type: m.element_type, label: m.label,
      confidence: m.confidence, bbox: m.bbox, bim_id: m.bim?.id ?? null, present: m.present, model: m.model, sort: i + 1,
    })));
    await post('cpm_discrepancies', discs.map((d, i) => ({
      capture_id: captureId, floor: cap.floor, zone: d.zone, kind: d.kind, element: d.element,
      severity: d.severity, confidence: d.confidence, note: d.note,
      status: toFile.includes(d) ? 'issue_created' : (d.severity === 'low' ? 'verified' : 'open'), sort: i + 1,
    })));
    await patch('cpm_captures', `id=eq.${cid}`, { status: 'analyzed', processing_step: 6 });
    log(`        ✓ wrote ${matched.length} detections + ${discs.length} discrepancies`);
  }

  log(`\n  ✓ pipeline complete — ${toFile.length} issue(s) to file, ${discs.length} discrepancies total\n`);
}

const groupBy = (a, k) => a.reduce((m, x) => ((m[x[k]] ||= []).push(x), m), {});
const icon = (s) => (s === 'crit' ? '🟥' : s === 'warn' ? '🟧' : '🟩');
function dedupeBest(dets) {
  const best = {};
  for (const d of dets) { const k = d.bim_code; if (!best[k] || d.confidence > best[k].confidence) best[k] = d; }
  return Object.values(best);
}

run().catch(e => { console.error(e); process.exit(1); });
