// ============================================================================
// Sthyra CPM — cpm-pipeline edge function (Deno)
// ----------------------------------------------------------------------------
// The genuine server-side write path for the 360° × BIM analysis pipeline.
// Runs with the SERVICE ROLE key (bypasses RLS), so it is the only place that
// may insert detections / discrepancies and auto-file issues.
//
// POST { capture_id?: string, capture?: object }
//   1. load (or insert) the capture
//   2. mark it processing
//   3. read its mapped frames + the floor's planned BIM elements
//   4. run the vision STUB per frame -> detections (deterministic, no secrets)
//   5. diff BIM (expected) vs detections (actual) -> discrepancies
//   6. wipe prior rows for this capture (idempotent re-runs)
//   7. insert detections + discrepancies
//   8. upsert a cpm_issues row for each auto-filed discrepancy
//   9. mark the capture analyzed (with a per-stage steps log)
//  10. return a summary
//
// Mirrors pipeline/detect.mjs + pipeline/worker.mjs exactly so the app, the CLI
// worker, and this function all produce the same verdict.
//
// SAFETY: the service-role key is read from the env and used only as the apikey/
// Bearer on outbound REST calls. It is NEVER echoed into any response body,
// header, or error string. PostgREST never reflects request headers in its
// response, so even propagated DB error text cannot contain the key; we still
// keep the public error payload generic and log details server-side only.
// ============================================================================

// ---------------------------------------------------------------------------
// CORS — applied to EVERY response, including errors and the preflight.
// ---------------------------------------------------------------------------
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// A write that failed in a way that should fail the whole run. Carries only a
// safe, key-free message (table + status); never the outbound headers.
class WriteError extends Error {}

// ---------------------------------------------------------------------------
// Ground truth — what the camera would actually see on site (the "as-built"
// truth the model recovers). Keyed by BIM code. `present:false` or a
// `deviation` is what drives a discrepancy. Mirrors detect.mjs AS_BUILT.
// ---------------------------------------------------------------------------
type Truth = {
  present: boolean;
  conf: number;
  deviation?: { kind: "routing" | "dimension" | "missing-part"; got: string | number; want: string | number; unit?: string };
  partial?: string;
};

const AS_BUILT: Record<string, Truth> = {
  "W-3": { present: true, conf: 0.94 },
  "WIN-3": { present: true, conf: 0.91 },
  "EC-1": { present: true, conf: 0.74, deviation: { kind: "routing", got: "surface-run", want: "concealed" } },
  "D-2": { present: true, conf: 0.79, deviation: { kind: "dimension", got: 850, want: 900, unit: "mm" } },
  "WIN-5": { present: true, conf: 0.90 },
  "WP-2": { present: false, conf: 0.88, partial: "1st coat only (no 2nd coat / mesh)" },
  "FT-1": { present: true, conf: 0.79 },
  "WC-2": { present: true, conf: 0.71 },
  "PL-1": { present: true, conf: 0.81, deviation: { kind: "missing-part", got: "1 stub, no sleeve", want: "2 sleeved points" } },
  "WIN-7": { present: true, conf: 0.88 },
  "SNK-1": { present: true, conf: 0.61 }, // in-progress per plan → not a defect
};

// element_type -> default severity when the type isn't in the crit set
const TYPE_SEVERITY: Record<string, string> = {
  waterproofing: "crit", slab: "crit", column: "crit", rebar: "crit",
  pipe: "warn", conduit: "warn", door: "warn", window: "low", block: "warn", fixture: "low",
};

const round = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Types for the rows we read (loosely; the REST API returns JSON).
// ---------------------------------------------------------------------------
type Frame = { id?: number; idx?: number; zone?: string; lit?: boolean };
type Bim = {
  id?: number; code: string; name?: string; spec?: string; zone?: string;
  element_type?: string; plan_status?: string; bx?: number; by?: number;
};

// ---------------------------------------------------------------------------
// Vision STUB. For each planned element expected in this frame's zone, emit a
// detection from AS_BUILT (dimmed slightly in low light). Deterministic and
// reproducible — runs with NO secrets.
//
// REAL-MODEL HOOK (intentionally a plain comment, not executable): if a vision
// model were wired in, this is where it would be called — e.g. when
// Deno.env.get("ANTHROPIC_API_KEY") is set, POST the frame image plus the zone's
// planned elements to https://api.anthropic.com/v1/messages with
// {content-type, x-api-key: <key>, anthropic-version: 2023-06-01}, model
// "claude-opus-4-8", a user message whose content array is
// [{type:"image",source:{type:"url",url:frame.img}}, {type:"text",text:"<prompt>"}],
// and output_config:{format:{type:"json_schema", schema:<per-code present/deviation>}},
// then parse response.content[0].text. We DEFAULT to the stub below so the
// pipeline runs offline with no API key.
// ---------------------------------------------------------------------------
type Det = {
  bim_code: string; zone?: string; element_type?: string; label: string;
  confidence: number; bbox: number[]; present: boolean; _truth: Truth; model: string;
};

function runVisionModel(frame: Frame, bimForZone: Bim[]): Det[] {
  const dets: Det[] = [];
  for (const el of bimForZone) {
    if (el.plan_status === "future") continue; // not built yet by plan
    const truth = AS_BUILT[el.code];
    if (!truth) continue;
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
      model: "yolov8-construct-v3 + SAM2 (stub)",
    });
  }
  return dets;
}

function labelFor(el: Bim, t: Truth): string {
  if (el.code === "WP-2") return "membrane 1st coat only";
  if (el.code === "EC-1") return "surface-run conduit";
  if (el.code === "D-2") return `door opening ~${t.deviation?.got ?? "?"}mm`;
  if (el.code === "PL-1") return "CPVC pipe stub (no sleeve)";
  return `${el.element_type} detected`;
}

// ---------------------------------------------------------------------------
// Diff: expected (BIM) vs actual (detections) -> discrepancies.
// Mirrors detect.mjs diffBimVsDetections exactly.
// ---------------------------------------------------------------------------
type Disc = {
  zone?: string; kind: string; element: string; severity: string;
  confidence: number; note: string; bim_code: string | null;
};

function sevFor(el: Bim, fallback: string): string {
  return TYPE_SEVERITY[el.element_type ?? ""] || fallback;
}

function mk(el: Bim, kind: string, severity: string, confidence: number, note: string): Disc {
  return {
    zone: el.zone, kind, element: `${el.name} (${el.code})`, severity,
    confidence: round(confidence), note, bim_code: el.code,
  };
}

function diffBimVsDetections(bim: Bim[], matched: Det[], frames: Frame[]): Disc[] {
  const out: Disc[] = [];
  const detByCode: Record<string, Det> = {};
  for (const m of matched) detByCode[m.bim_code] = m;
  const lowLightZones = new Set(frames.filter((f) => f.lit === false).map((f) => f.zone));

  for (const el of bim) {
    if (el.plan_status !== "should_be_present") continue; // only judge what should exist now
    const d = detByCode[el.code];

    if (!d || d.present === false) {
      const partial = d?._truth?.partial;
      out.push(mk(
        el, partial ? "incomplete" : "missing", sevFor(el, "crit"), d?.confidence ?? 0.6,
        partial
          ? `BIM expects ${el.spec}. AI sees ${partial}.`
          : `BIM expects ${el.name} (${el.spec}). Not detected in any frame.`,
      ));
      continue;
    }
    const dev = d._truth?.deviation;
    if (dev?.kind === "dimension") {
      out.push(mk(el, "deviation", "warn", d.confidence,
        `BIM ${dev.want}${dev.unit} clear. AI-measured ~${dev.got}${dev.unit} (${(dev.got as number) - (dev.want as number)}${dev.unit}).`));
    } else if (dev?.kind === "routing") {
      out.push(mk(el, "deviation", "warn", d.confidence,
        `BIM specifies ${dev.want}. AI sees ${dev.got}. Re-route before next stage.`));
    } else if (dev?.kind === "missing-part") {
      out.push(mk(el, "missing", "warn", d.confidence,
        `BIM has ${dev.want}. AI detects ${dev.got}.`));
    }
  }

  // extras: detections with no planned BIM element
  const bimByCode: Record<string, Bim> = {};
  for (const b of bim) bimByCode[b.code] = b;
  for (const d of matched) {
    if (!bimByCode[d.bim_code]) {
      out.push({
        zone: d.zone, kind: "extra", element: d.label, severity: "low",
        confidence: d.confidence, note: `Detected ${d.label} with no matching planned element.`, bim_code: null,
      });
    }
  }

  // capture-quality flag (low confidence due to lighting): a low-light zone that
  // carries a crit discrepancy gets one extra quality/low note.
  for (const z of lowLightZones) {
    const crit = out.find((o) => o.zone === z && o.severity === "crit");
    if (crit) {
      out.push({
        zone: z, kind: "quality", element: "Capture quality — low light", severity: "low",
        confidence: 0.55,
        note: `Frames in ${z} under-lit; a re-walk with lighting is advised to confirm the ${crit.kind} verdict.`,
        bim_code: crit.bim_code,
      });
    }
  }
  return out;
}

// keep only the highest-confidence detection per BIM code
function dedupeBest(dets: Det[]): Det[] {
  const best: Record<string, Det> = {};
  for (const d of dets) {
    const k = d.bim_code;
    if (!best[k] || d.confidence > best[k].confidence) best[k] = d;
  }
  return Object.values(best);
}

// "who" heuristic for an auto-filed issue — mirrors the app (supervisor.js).
function whoFor(d: Disc): string {
  if ((d.zone ?? "").indexOf("Bath") > -1) return "Waterproofing team";
  if (d.kind === "deviation") return "ABC Mason Team";
  return "Sri Sai Plumbers";
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  // Preflight — CORS on the bare 204, no body.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  // Service-role REST client. The key never leaves this scope: it is only ever
  // placed on the outbound apikey/Authorization headers below, never returned.
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const REST = `${SUPABASE_URL}/rest/v1`;

  // Low-level call. `prefer` is pulled out of the init so it never leaks into
  // the RequestInit passed to fetch.
  async function rest(path: string, opts: RequestInit & { prefer?: string } = {}): Promise<Response> {
    const { prefer, headers: extra, ...init } = opts;
    const headers: Record<string, string> = {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    };
    if (prefer) headers["Prefer"] = prefer;
    return await fetch(`${REST}${path}`, {
      ...init,
      headers: { ...headers, ...(extra as Record<string, string> | undefined) },
    });
  }

  // READ helper: a failed read returns [] (callers treat absent data as empty),
  // but we surface the status to the server log so a broken read isn't silent.
  const restJson = async (path: string, opts?: RequestInit & { prefer?: string }) => {
    const r = await rest(path, opts);
    if (!r.ok) {
      console.error(`read failed ${r.status} on ${path.split("?")[0]}`);
      return [];
    }
    try {
      return await r.json();
    } catch {
      return [];
    }
  };

  // WRITE helper: a non-2xx write is a hard failure. We log the DB error body
  // server-side (PostgREST never reflects the apikey, so this is key-safe) and
  // throw a generic, key-free WriteError that fails the whole run. This is the
  // critical fix: previously every write was fire-and-forget, so a rejected
  // INSERT/PATCH still reported ok:true and marked the capture "analyzed".
  const write = async (path: string, opts: RequestInit & { prefer?: string }): Promise<void> => {
    const r = await rest(path, opts);
    if (!r.ok) {
      const table = path.split("?")[0].replace(/^\//, "");
      let detail = "";
      try { detail = (await r.text()).slice(0, 500); } catch { /* ignore */ }
      console.error(`write failed ${r.status} on ${table}: ${detail}`);
      throw new WriteError(`${table} write failed (${r.status})`);
    }
    // Drain the (usually empty) body so the connection can be reused.
    try { await r.text(); } catch { /* ignore */ }
  };

  // We need the capture id available in the catch for a best-effort "failed".
  let captureId = "";

  try {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json({ ok: false, error: "Server is missing Supabase env configuration" }, 500);
    }

    let body: { capture_id?: string; capture?: Record<string, unknown> } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    captureId = (body.capture_id ?? (body.capture?.id as string | undefined) ?? "").toString();

    // --- 1) load (or insert) the capture --------------------------------------
    let cap: Record<string, unknown> | undefined;
    if (captureId) {
      const rows = await restJson(`/cpm_captures?id=eq.${encodeURIComponent(captureId)}&select=*`);
      cap = Array.isArray(rows) ? rows[0] : undefined;
    }
    if (!cap && body.capture) {
      // Seed a new capture. Use a checked write + return=representation so an
      // insert failure (RLS, constraint, dup id) is a real error, not a silent
      // "not found" 400.
      const seed = { ...body.capture, status: "uploaded" };
      const r = await rest(`/cpm_captures`, {
        method: "POST", body: JSON.stringify(seed), prefer: "return=representation",
      });
      if (!r.ok) {
        const detail = await r.text().catch(() => "");
        console.error(`capture insert failed ${r.status}: ${detail.slice(0, 500)}`);
        return json({ ok: false, error: "Failed to create capture" }, 500);
      }
      const ins = await r.json().catch(() => undefined);
      cap = Array.isArray(ins) ? ins[0] : ins;
      captureId = ((cap?.id as string | undefined) ?? captureId).toString();
    }
    if (!cap || !captureId) {
      return json({ ok: false, error: "capture not found and no capture body provided" }, 400);
    }

    const floor = (cap.floor as string | undefined) ?? "";

    // --- 2) mark processing ---------------------------------------------------
    await write(`/cpm_captures?id=eq.${encodeURIComponent(captureId)}`, {
      method: "PATCH", body: JSON.stringify({ status: "processing", processing_step: 1 }), prefer: "return=minimal",
    });

    // --- 3) read mapped frames + the floor's planned BIM elements -------------
    const framesRaw = await restJson(`/cpm_frames?capture_id=eq.${encodeURIComponent(captureId)}&select=*&order=idx`);
    const bimRaw = await restJson(`/cpm_bim_elements?floor=eq.${encodeURIComponent(floor)}&select=*&order=sort`);
    const frames: Frame[] = Array.isArray(framesRaw) ? framesRaw : [];
    const bim: Bim[] = Array.isArray(bimRaw) ? bimRaw : [];

    // --- 4) detection: per frame, per BIM element in its zone (stub) ----------
    const byZone: Record<string, Bim[]> = {};
    for (const b of bim) (byZone[b.zone ?? ""] ||= []).push(b);

    let detsRaw: Det[] = [];
    for (const f of frames) {
      const out = runVisionModel(f, byZone[f.zone ?? ""] || []);
      detsRaw = detsRaw.concat(out);
    }
    const dets = dedupeBest(detsRaw); // highest-confidence per code

    // --- 5) diff -> discrepancies --------------------------------------------
    const discs = diffBimVsDetections(bim, dets, frames);

    // --- 6) idempotency: wipe prior rows for this capture --------------------
    // Checked so a failed wipe doesn't lead to duplicate rows on the re-insert.
    await write(`/cpm_detections?capture_id=eq.${encodeURIComponent(captureId)}`, { method: "DELETE", prefer: "return=minimal" });
    await write(`/cpm_discrepancies?capture_id=eq.${encodeURIComponent(captureId)}`, { method: "DELETE", prefer: "return=minimal" });

    // resolve bim_id by code for detections / discrepancies
    const bimByCode: Record<string, Bim> = {};
    for (const b of bim) bimByCode[b.code] = b;

    // --- 7) insert detections + discrepancies --------------------------------
    if (dets.length) {
      const detRows = dets.map((m, i) => ({
        capture_id: captureId,
        zone: m.zone,
        element_type: m.element_type,
        label: m.label,
        confidence: m.confidence,
        bbox: m.bbox,
        bim_id: bimByCode[m.bim_code]?.id ?? null,
        present: m.present,
        model: m.model,
        sort: i + 1,
      }));
      await write(`/cpm_detections`, { method: "POST", body: JSON.stringify(detRows), prefer: "return=minimal" });
    }

    // which discrepancies auto-file an issue: not quality AND not low severity
    const isAutoFiled = (d: Disc) => d.kind !== "quality" && d.severity !== "low";

    const discInsert = discs.map((d, i) => ({
      capture_id: captureId,
      floor,
      zone: d.zone,
      kind: d.kind,
      element: d.element,
      bim_id: d.bim_code ? (bimByCode[d.bim_code]?.id ?? null) : null,
      severity: d.severity,
      confidence: d.confidence,
      note: d.note,
      status: isAutoFiled(d) ? "issue_created" : (d.severity === "low" ? "verified" : "open"),
      issue_id: isAutoFiled(d) ? `SI-AUTO-${captureId}-${d.bim_code ?? "X"}` : null,
      sort: i + 1,
    }));
    if (discInsert.length) {
      await write(`/cpm_discrepancies`, { method: "POST", body: JSON.stringify(discInsert), prefer: "return=minimal" });
    }

    // --- 8) upsert a cpm_issues row for each auto-filed discrepancy -----------
    const toFile = discs.filter(isAutoFiled);
    const issueRows = toFile.map((d) => {
      const who = whoFor(d);
      return {
        id: `SI-AUTO-${captureId}-${d.bim_code ?? "X"}`,
        t: `${d.element} — ${d.kind} (BIM mismatch, AI)`,
        loc: d.zone ?? "",
        sev: d.severity,
        who,
        status: "Open",
        age: "now",
        resp: who,
        drawing: "—",
        sort: 999,
      };
    });
    if (issueRows.length) {
      // on_conflict=id + resolution=merge-duplicates so a retry upserts instead
      // of 409-ing on the existing SI-AUTO-* primary key.
      await write(`/cpm_issues?on_conflict=id`, {
        method: "POST", body: JSON.stringify(issueRows), prefer: "resolution=merge-duplicates,return=minimal",
      });
    }

    // --- 9) mark analyzed with a per-stage steps log -------------------------
    const counts = {
      crit: discs.filter((d) => d.severity === "crit").length,
      warn: discs.filter((d) => d.severity === "warn").length,
      low: discs.filter((d) => d.severity === "low").length,
      total: discs.length,
    };
    const steps = [
      { n: 1, label: "Extract + map frames", detail: `${frames.length} frames` },
      { n: 2, label: "Align BIM model", detail: `${bim.length} planned elements` },
      { n: 3, label: "AI element check", detail: `${dets.length} detections (stub)` },
      { n: 4, label: "Compare BIM ↔ as-built", detail: `${discs.length} discrepancies` },
      { n: 5, label: "Generate issues", detail: `${toFile.length} auto-filed` },
      { n: 6, label: "Persist results", detail: "written" },
    ];
    await write(`/cpm_captures?id=eq.${encodeURIComponent(captureId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "analyzed", processing_step: 6, steps }),
      prefer: "return=minimal",
    });

    // --- 10) return summary ---------------------------------------------------
    return json({
      ok: true,
      capture_id: captureId,
      frames: frames.length,
      detections: dets.length,
      discrepancies: counts,
      issues_filed: toFile.length,
    });
  } catch (e) {
    // best-effort: flag the capture failed. Never surface the service key — and
    // since PostgREST does not reflect request headers, neither WriteError nor a
    // network error can contain it. We still return only a generic message.
    if (captureId && SUPABASE_URL && SERVICE_KEY) {
      try {
        await rest(`/cpm_captures?id=eq.${encodeURIComponent(captureId)}`, {
          method: "PATCH", body: JSON.stringify({ status: "failed" }), prefer: "return=minimal",
        });
      } catch {
        // swallow — we are already in the error path
      }
    }
    const msg = e instanceof WriteError ? e.message : "pipeline failed";
    console.error("pipeline error:", e instanceof Error ? e.message : String(e));
    return json({ ok: false, error: msg }, 500);
  }
});
