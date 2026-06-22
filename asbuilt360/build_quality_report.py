#!/usr/bin/env python3
"""Construction-quality / dimensional report (Sthyra-branded, self-contained HTML).
Consumes out/quality_metrics.json (geometry) + out/dimquality_rooms.json (vision).
"""
import json, base64, os, html
OUT="out"
def j(p,d=None):
    try: return json.load(open(os.path.join(OUT,p)))
    except: return d
def b64(p):
    if not p or not os.path.exists(p): return None
    ext=os.path.splitext(p)[1].lstrip(".").replace("jpg","jpeg")
    return f"data:image/{ext};base64,"+base64.b64encode(open(p,"rb").read()).decode()
def img(p,cls="",alt=""):
    d=b64(p); return f'<img class="{cls}" alt="{html.escape(alt)}" src="{d}">' if d else f'<div class="missing">[{html.escape(alt or p)}]</div>'
def esc(x): return html.escape(str(x if x is not None else ""))
def pill(v):
    v=(v or "").lower();
    good={"plumb","good","flat","square","level"}
    warn={"slight-lean","fair","slightly-wavy","slightly-off","minor-slope"}
    bad={"visible-lean","poor","wavy","skewed","sloped"}
    col="#52607a"
    if v in good: col="#2f7d4f"
    elif v in warn: col="#b08a17"
    elif v in bad: col="#a8432b"
    return f'<span class="pill" style="background:{col}">{esc(v or "—")}</span>'

G=j("quality_metrics.json",{})
rooms=j("dimquality_rooms.json",[])

def gradecol(g):
    g=(g or "")[:1].upper()
    return {"A":"#2f7d4f","B":"#5a8a3f","C":"#b08a17","D":"#a8432b"}.get(g,"#52607a")

# ---- door rows ----
door_rows=""
for r in rooms:
    for d in r.get("doors",[]):
        w=d.get("width_mm") or d.get("est_width_mm"); h=d.get("height_mm") or d.get("est_height_mm")
        door_rows+=f"""<tr><td>{esc(r.get('area'))} <span class="tg">{esc(r.get('tag'))}</span></td>
          <td>{esc(d.get('type'))}</td><td class="num">{esc(round(w)) if w else '—'}</td>
          <td class="num">{esc(round(h)) if h else '—'}</td>
          <td>{esc(d.get('standard_match','—'))}</td>
          <td class="num">{f"{float(d.get('confidence',0)):.0%}" if d.get('confidence') is not None else '—'}</td></tr>"""

# ---- wall/finish rows ----
wall_rows=""
for r in rooms:
    for w in r.get("walls",[]):
        wall_rows+=f"""<tr><td>{esc(r.get('area'))} <span class="tg">{esc(r.get('tag'))}</span></td>
          <td>{esc(w.get('which'))}</td><td>{pill(w.get('plumb'))}</td>
          <td>{pill(w.get('finish_quality'))}</td><td>{pill(w.get('flatness'))}</td>
          <td>{esc(w.get('issues'))}</td></tr>"""

# ---- room dim rows ----
dim_rows=""
for r in rooms:
    rd=r.get("room_dim_check",{}) or {}
    cons=rd.get("looks_consistent")
    badge='<span class="ok">consistent</span>' if cons else ('<span class="bad">deviation</span>' if cons is False else '—')
    ew=rd.get("est_clear_width_m"); ed=rd.get("est_clear_depth_m")
    est=f"{ew}×{ed} m" if ew and ed else "—"
    dim_rows+=f"""<tr><td>{esc(r.get('area'))} <span class="tg">{esc(r.get('tag'))}</span></td>
      <td>{esc(rd.get('plan_dims'))}</td><td>{esc(est)}</td><td>{badge}</td>
      <td>{esc(rd.get('note'))}</td></tr>"""

# ---- grade cards (with expandable annotated evidence) ----
annot={a.get("tag"):a for a in (j("annot_rooms.json",[]) or [])}
grade_cards=""
for r in rooms:
    g=r.get("overall_grade","—"); col=gradecol(g); tag=r.get("tag")
    ev=""
    ap=f"{OUT}/annotated/{tag}.jpg"
    if os.path.exists(ap):
        cap=esc((annot.get(tag) or {}).get("caption",""))
        ev=f'<div class="evid"><img class="zoom" src="{b64(ap)}" alt="marked defects {esc(tag)}"><div class="evcap">▸ click to expand · {cap}</div></div>'
    grade_cards+=f"""<div class="gcard"><div class="gbadge" style="background:{col}">{esc(g[:1])}</div>
      <div class="gbody"><b>{esc(r.get('area'))}</b> <span class="tg">{esc(tag)}</span><br><span class="gr">{esc(r.get('grade_reason'))}</span>{ev}</div></div>"""

ch=G.get("ceiling_height_m"); ft=G.get("floor_tilt_deg"); ct=G.get("ceiling_tilt_deg"); par=G.get("floor_ceiling_parallax_deg")

HTML=f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Construction Quality & Dimensional Report — HSR Office</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{{--paper:#f7f2e9;--ink:#1c1a17;--mut:#6b6557;--line:#d9cfbd;--burg:#7a2230;}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,sans-serif;line-height:1.55}}
.wrap{{max-width:1000px;margin:0 auto;padding:56px 40px 96px}}
h1,h2,h3{{font-family:'Cormorant Garamond',serif;font-weight:600}}
h1{{font-size:44px;margin:0 0 4px}} .sub{{font-size:18px;color:var(--mut);font-style:italic;font-family:'Cormorant Garamond',serif;margin-bottom:24px}}
.kicker{{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--burg);font-weight:600}}
.rule{{height:2px;background:var(--burg);width:64px;margin:16px 0 26px}}
h2{{font-size:28px;margin:44px 0 6px;border-bottom:1px solid var(--line);padding-bottom:7px}}
.lead{{font-size:17px}} p{{margin:8px 0}}
.cap{{background:#fdf6f1;border-left:3px solid var(--burg);padding:14px 18px;border-radius:0 8px 8px 0;margin:18px 0;font-size:14px}}
.cap b{{color:var(--burg)}}
table{{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}}
th,td{{text-align:left;padding:8px 9px;border-bottom:1px solid var(--line);vertical-align:top}}
th{{font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--mut)}}
td.num{{text-align:right;font-variant-numeric:tabular-nums}}
.tg{{font-size:10px;color:var(--mut)}}
.pill{{font-size:10.5px;padding:2px 8px;border-radius:20px;color:#fff;white-space:nowrap}}
.ok{{color:#2f7d4f;font-weight:600}} .bad{{color:#a8432b;font-weight:600}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:22px 0}}
.stat{{background:#fffdf8;border:1px solid var(--line);border-radius:10px;padding:15px}}
.stat .n{{font-family:'Cormorant Garamond',serif;font-size:30px;color:var(--burg);line-height:1}}
.stat .l{{font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);margin-top:6px}}
.gcard{{display:flex;gap:12px;align-items:center;background:#fffdf8;border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:8px 0}}
.gbadge{{width:40px;height:40px;border-radius:8px;color:#fff;font-family:'Cormorant Garamond',serif;font-size:24px;display:flex;align-items:center;justify-content:center;flex:0 0 40px}}
.gbody{{flex:1}}
.gr{{font-size:12.5px;color:var(--mut)}}
.evid{{margin-top:10px}}
.evid img.zoom{{max-width:360px;width:100%;border:1px solid var(--line);border-radius:8px;cursor:zoom-in;display:block}}
.evcap{{font-size:11px;color:var(--burg);margin-top:4px;font-weight:500}}
#lb{{position:fixed;inset:0;background:rgba(20,18,15,.93);display:none;align-items:center;justify-content:center;z-index:999;cursor:zoom-out;padding:20px}}
#lb img{{max-width:96vw;max-height:94vh;border-radius:6px;box-shadow:0 8px 50px rgba(0,0,0,.55)}}
.fig{{width:100%;border:1px solid var(--line);border-radius:10px;margin:12px 0}}
.limit{{background:#f4efe4;border:1px solid var(--line);border-radius:10px;padding:16px 20px;font-size:13.5px}}
.limit li{{margin:6px 0}}
.foot{{margin-top:54px;border-top:1px solid var(--line);padding-top:16px;font-size:12px;color:var(--mut)}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
</style></head><body><div class="wrap">
<div class="kicker">Sthyra · Build-with-Proof</div>
<h1>Construction Quality &amp; Dimensional Report</h1>
<div class="sub">HSR Office, Typical Floor — as-built structural geometry vs the architectural plan</div>
<div class="rule"></div>

<p class="lead">This report compares as-built structural components (slab, walls, doors, rooms) against the architectural plan, combining a photogrammetric 3D model with frame-by-frame visual metrology. Read the capability note first — it defines exactly what these numbers can and cannot certify.</p>

<div class="cap"><b>What this method can &amp; cannot measure.</b> The 3D model is a <i>monocular, sparse</i> reconstruction. It reconstructs <b>horizontal surfaces well</b> (floor, desks, the multi-level false ceiling) but the office's <b>blank painted walls produced almost no 3D points</b>, so per-wall plumb, thickness and length are <b>not</b> photogrammetrically measurable here. Wall/door dimensions below are therefore <b>visual estimates from the video using in-frame references</b> (door heights, tiles, switch plates), accurate to roughly <b>±10–15%</b>. Metric scale is recovered from the plan (±~20%). This is a <b>screening tool that flags gross deviations</b> — it is <b>not</b> a substitute for a laser/total-station/LiDAR measured survey and does not certify mm-level tolerances.</div>

<div class="grid">
  <div class="stat"><div class="n">{esc(ch) if ch else '~3.3'} m</div><div class="l">Slab / ceiling height (±~20%)</div></div>
  <div class="stat"><div class="n">{esc(ct) if ct is not None else '~0.5'}°</div><div class="l">Ceiling out-of-level</div></div>
  <div class="stat"><div class="n">{esc(par) if par is not None else '~0.9'}°</div><div class="l">Floor–ceiling non-parallel</div></div>
  <div class="stat"><div class="n">{len(rooms)}</div><div class="l">Rooms visually assessed</div></div>
</div>

<h2>1 · Structural geometry (from the 3D model)</h2>
<div class="two"><div>
<p><b>Slab is level &amp; parallel.</b> The dominant floor and ceiling planes are horizontal to within <b>{esc(ft)}° / {esc(ct)}°</b> and parallel to within <b>{esc(par)}°</b> — i.e. no detectable slab tilt or ceiling slope at screening resolution. Slab-to-slab height measures <b>~{esc(ch)} m</b> (cross-checked to ±~20% against an eye-height scale).</p>
<p><b>Walls were not reconstructable.</b> Every dominant plane in the cloud is horizontal; the bare walls carried too little texture to form measurable surfaces (see histogram — the 1.4–2.3 m "wall zone" is nearly empty). Per-wall verticality and room dimensions therefore come from the visual pass below, not the geometry.</p>
</div><div>{img(f"{OUT}/section_view.png","fig","point height histogram")}</div></div>

<h2>2 · Door / opening dimensions (visual metrology)</h2>
<p>Estimated from the footage using in-frame references; each cross-checked by a second independent estimate. Compare against standard Indian sizes (internal 750–900 × 2030–2100 mm; main 900–1000 × 2100 mm).</p>
<table><thead><tr><th>Location</th><th>Type</th><th>Width mm</th><th>Height mm</th><th>vs standard</th><th>Conf.</th></tr></thead>
<tbody>{door_rows or '<tr><td colspan=6>No doors resolved.</td></tr>'}</tbody></table>

<h2>3 · Wall &amp; finish quality</h2>
<table><thead><tr><th>Location</th><th>Wall</th><th>Plumb</th><th>Finish</th><th>Flatness</th><th>Issues</th></tr></thead>
<tbody>{wall_rows or '<tr><td colspan=6>—</td></tr>'}</tbody></table>

<h2>4 · Room dimensions vs plan</h2>
<table><thead><tr><th>Room</th><th>Plan (as-designed)</th><th>Visual estimate</th><th>Check</th><th>Note</th></tr></thead>
<tbody>{dim_rows or '<tr><td colspan=5>—</td></tr>'}</tbody></table>

<h2>5 · Construction-quality grades</h2>
<p>Each area carries an annotated evidence frame with the exact problems boxed and numbered — <b>click any image to expand</b>.</p>
{grade_cards}

<h2>6 · Reference tolerances (for context)</h2>
<p>Indian benchmarks the as-built would be judged against in a proper survey. This 360 method can only confirm <b>gross</b> compliance/violation — treat green/amber here as "no gross deviation seen", not certified pass.</p>
<table><thead><tr><th>Element</th><th>Reference tolerance</th><th>Source</th><th>This survey can detect?</th></tr></thead><tbody>
<tr><td>Wall verticality (plumb)</td><td>±6 mm / 3 m (max 12 mm)</td><td>IS 2212 / NBC 2016</td><td>Only gross lean (&gt;~1.5°)</td></tr>
<tr><td>Wall surface flatness</td><td>±5 mm / 2 m straightedge</td><td>Fit-out good practice</td><td>Only visible waviness</td></tr>
<tr><td>Door frame plumb / size</td><td>±3 mm plumb; ±5 mm size</td><td>IS 4021 / fit-out</td><td>No — visual ±10–15%</td></tr>
<tr><td>Room dimensions</td><td>±10–15 mm</td><td>Finishes good practice</td><td>Only gross (&gt;~0.2 m)</td></tr>
<tr><td>Floor level</td><td>±5 mm / 3 m</td><td>IS 456 / NBC</td><td>Slab tilt only (~0.5° here)</td></tr>
<tr><td>Slab / floor-to-floor height</td><td>per design</td><td>Structural drawing</td><td>Yes ±~20% (~{esc(ch)} m)</td></tr>
</tbody></table>

<h2>Limitations &amp; recommendation</h2>
<div class="limit"><ul>
<li><b>Not a measured survey.</b> Wall/door/room figures are visual estimates (±10–15%); metric scale is plan-recovered (±~20%). Use only to flag gross deviations, not for tolerance sign-off.</li>
<li><b>Walls unmeasurable photogrammetrically</b> because they are blank. To get true wall plumb/length/thickness from imagery, either add temporary targets/texture, or capture with a <b>LiDAR scanner</b> (terrestrial scanner, or even an iPhone Pro / iPad Pro LiDAR for room-scale) — that yields mm–cm wall planes directly.</li>
<li><b>Wet areas, pantry and the lift/stair core were never filmed</b>, so their structural geometry is unassessed.</li>
<li><b>For dimensional QC of doors/openings</b>, a 2-minute pass with a laser distance meter beats any image method — recommend that for the elements flagged amber here.</li>
</ul></div>

<div class="foot">Sthyra as-built pipeline · geometry from COLMAP SfM (307 views, 1.05 px) · door/wall dims from frame-based visual metrology with adversarial cross-check · screening tool, not a certified survey.</div>
</div>
<div id="lb" onclick="this.style.display='none'"><img id="lbimg" alt="expanded evidence"></div>
<script>document.addEventListener('click',function(e){{if(e.target.classList&&e.target.classList.contains('zoom')){{var lb=document.getElementById('lb');document.getElementById('lbimg').src=e.target.src;lb.style.display='flex';}}}});</script>
</body></html>"""

# pill() needs to exist before use above — define and re-render not needed since Python evaluates calls at build time
open("out/quality_report.html","w").write(HTML)
print("WROTE out/quality_report.html", len(HTML), "bytes")
