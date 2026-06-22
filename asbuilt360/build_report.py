#!/usr/bin/env python3
"""Assemble the as-built vs as-designed audit report (Sthyra-branded, self-contained HTML).
Consumes: out/asdesigned.json, out/asbuilt_locations.json, out/findings_final.json,
optional figures in out/. Embeds images as base64 so the file is portable.
"""
import json, base64, os, html, glob

OUT = "out"
def j(p, default=None):
    try: return json.load(open(os.path.join(OUT, p)))
    except Exception: return default
def b64(path):
    if not path or not os.path.exists(path): return None
    ext = os.path.splitext(path)[1].lstrip(".").replace("jpg","jpeg")
    return f"data:image/{ext};base64," + base64.b64encode(open(path,"rb").read()).decode()
def img(path, cls="", alt=""):
    d = b64(path)
    return f'<img class="{cls}" alt="{html.escape(alt)}" src="{d}">' if d else f'<div class="missing">[{html.escape(alt or path)}]</div>'

plan = j("asdesigned.json", {})
findings = j("findings_final.json", [])
traj = j("trajectory_2d.json", {})
meta = j("report_meta.json", {})

SEV = {"critical":"#7a1320","major":"#a8432b","minor":"#9a7a2e","observation":"#52607a","safety":"#7a1320"}
DISC = {"structural":"Structural","electrical":"Electrical","plumbing":"Plumbing"}
order = {"critical":0,"safety":0,"major":1,"minor":2,"observation":3}
findings = sorted(findings, key=lambda f: (order.get(f.get("severity","observation"),3), -float(f.get("confidence",0))))

def sev_pill(s):
    return f'<span class="pill" style="background:{SEV.get(s,"#52607a")}">{html.escape(s.upper())}</span>'

def finding_card(f, compact=False):
    ev = f.get("evidence_timepoints", [])
    thumbs = ""
    if not compact:
        for tp in ev[:4]:
            p = f"{OUT}/evidence/{tp}.jpg"
            thumbs += f'<figure>{img(p,"thumb",tp)}<figcaption>{html.escape(tp)} · {int(tp[1:])*2 if tp[1:].isdigit() else "?"}s</figcaption></figure>'
    vn = f.get("verify_note","")
    disc = f.get("discipline","")
    return f"""
    <article class="card{' compact' if compact else ''}">
      <header><span class="fid">{html.escape(f.get('id',''))}</span>{sev_pill(f.get('severity','observation'))}
        <span class="disc-chip {disc}">{html.escape(disc.title())}</span>
        <span class="ftype">{html.escape(f.get('type',''))}</span>
        <span class="conf">conf {float(f.get('confidence',0) or 0):.0%}</span></header>
      <h3>{html.escape(f.get('title',''))}</h3>
      <p>{html.escape(f.get('description','') if not compact else (f.get('description','')[:240]+'…'))}</p>
      {f'<p class="ref"><b>Plan ref:</b> {html.escape(f.get("plan_reference",""))}</p>' if f.get('plan_reference') and not compact else ''}
      {f'<p class="rec"><b>Action:</b> {html.escape(f.get("recommendation",""))}</p>' if f.get('recommendation') and not compact else ''}
      {f'<p class="verify"><b>Verification:</b> {html.escape(vn)}</p>' if vn else ''}
      <div class="thumbs">{thumbs}</div>
    </article>"""

sevrank = {"critical":0,"safety":0,"major":1,"minor":2,"observation":3}
def bucket(b): return [f for f in findings if f.get("bucket")==b]
active = sorted(bucket("active"), key=lambda f:(sevrank.get(f.get("severity"),3), -float(f.get("confidence",0) or 0)))
conf   = bucket("conformance")
stood  = bucket("standdown")

active_html = f"""<section><h2>Findings requiring action <span class="count">{len(active)} · sorted by severity</span></h2>
  {''.join(finding_card(f) for f in active)}</section>"""
conf_html = f"""<section><h2>Built as drawn — conformances <span class="count">{len(conf)} verified</span></h2>
  <p>Elements the camera reached that match the architectural intent:</p>
  {''.join(finding_card(f, compact=True) for f in conf)}</section>"""
stood_html = f"""<section><h2>Checked &amp; stood down <span class="count">{len(stood)} de-escalated by verification</span></h2>
  <p>Candidate issues that the adversarial verification pass reduced or dismissed after re-reading the source frames — shown for transparency.</p>
  {''.join(finding_card(f, compact=True) for f in stood)}</section>"""

rooms_rows = "".join(
    f"<tr><td>{html.escape(r.get('name',''))}</td><td>{html.escape(r.get('dims',''))}</td><td>{html.escape(r.get('location_note',''))}</td></tr>"
    for r in plan.get("rooms", []))

overlay = img(f"{OUT}/overlay_annotated.png","fig","As-built path registered on plan")
topdown = img(f"{OUT}/topdown_preview.png","fig","SfM top-down reconstruction")

HTML = f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>As-Built vs As-Designed — HSR Office</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{{--paper:#f7f2e9;--ink:#1c1a17;--mut:#6b6557;--line:#d9cfbd;--burg:#7a2230;--burg2:#9a3142;}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,system-ui,sans-serif;font-weight:400;line-height:1.55}}
.wrap{{max-width:1000px;margin:0 auto;padding:56px 40px 96px}}
h1,h2,h3{{font-family:'Cormorant Garamond',serif;font-weight:600;letter-spacing:.2px}}
h1{{font-size:46px;line-height:1.05;margin:0 0 6px}}
.sub{{font-size:18px;color:var(--mut);font-family:'Cormorant Garamond',serif;font-style:italic;margin-bottom:28px}}
.rule{{height:2px;background:var(--burg);width:64px;margin:18px 0 30px}}
.kicker{{font-family:Inter;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--burg);font-weight:600}}
h2{{font-size:30px;margin:46px 0 6px;border-bottom:1px solid var(--line);padding-bottom:8px}}
h2 .count{{font-family:Inter;font-size:12px;color:var(--mut);font-weight:400;letter-spacing:.04em;float:right;margin-top:14px}}
h3{{font-size:22px;margin:4px 0 8px}}
p{{margin:8px 0}}
.lead{{font-size:17px}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:24px 0}}
.stat{{background:#fffdf8;border:1px solid var(--line);border-radius:10px;padding:16px}}
.stat .n{{font-family:'Cormorant Garamond',serif;font-size:34px;color:var(--burg);line-height:1}}
.stat .l{{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--mut);margin-top:6px}}
.callout{{background:#fdf6f1;border-left:3px solid var(--burg);padding:14px 18px;border-radius:0 8px 8px 0;margin:18px 0}}
.card{{background:#fffdf8;border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin:16px 0;box-shadow:0 1px 0 rgba(0,0,0,.02)}}
.card header{{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:2px}}
.fid{{font-family:Inter;font-weight:600;font-size:12px;color:var(--mut)}}
.pill{{color:#fff;font-size:10px;font-weight:600;letter-spacing:.08em;padding:3px 8px;border-radius:20px}}
.ftype{{font-size:11px;color:var(--mut);background:#efe8da;padding:3px 8px;border-radius:20px}}
.disc-chip{{font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:20px;color:#fff}}
.disc-chip.structural{{background:#52607a}}.disc-chip.electrical{{background:#9a6a1f}}.disc-chip.plumbing{{background:#2f6f7d}}
.card.compact{{padding:12px 16px}}.card.compact h3{{font-size:18px}}
.conf{{margin-left:auto;font-size:11px;color:var(--mut)}}
.ref,.rec,.verify{{font-size:13.5px;color:#403a30}}
.rec{{color:var(--burg2)}}
.verify{{color:var(--mut);font-style:italic}}
.thumbs{{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}}
.thumbs figure{{margin:0;width:150px}}
.thumb{{width:150px;height:90px;object-fit:cover;border-radius:6px;border:1px solid var(--line)}}
.thumbs figcaption{{font-size:10px;color:var(--mut);margin-top:3px}}
.fig{{width:100%;border:1px solid var(--line);border-radius:10px;margin:14px 0}}
table{{width:100%;border-collapse:collapse;margin:14px 0;font-size:13.5px}}
th,td{{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}}
th{{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}}
.missing{{color:#b00;font-size:12px;padding:10px;border:1px dashed #d9b0b0;border-radius:8px}}
.foot{{margin-top:60px;border-top:1px solid var(--line);padding-top:18px;font-size:12px;color:var(--mut)}}
.method li{{margin:6px 0;font-size:14px}}
.limit{{background:#f4efe4;border:1px solid var(--line);border-radius:10px;padding:18px 22px}}
.limit li{{margin:6px 0;font-size:13.5px;color:#403a30}}
</style></head><body><div class="wrap">
<div class="kicker">Sthyra · Build-with-Proof</div>
<h1>As-Built vs As-Designed Audit</h1>
<div class="sub">HSR Office, Typical Floor — 360° walkthrough reconstructed and registered to the architectural plan</div>
<div class="rule"></div>
<p class="lead">{html.escape(meta.get('lead',''))}</p>

<div class="grid">
  <div class="stat"><div class="n">{meta.get('n_findings','—')}</div><div class="l">Verified findings</div></div>
  <div class="stat"><div class="n">{meta.get('n_critical','—')}</div><div class="l">Critical / safety</div></div>
  <div class="stat"><div class="n">{meta.get('coverage_pct','—')}</div><div class="l">Plan area filmed</div></div>
  <div class="stat"><div class="n">{traj.get('registered_views','—')}</div><div class="l">SfM views solved</div></div>
</div>

<div class="callout">{meta.get('callout','')}</div>

<h2>Spatial registration</h2>
<p>The walked path recovered by Structure-from-Motion, registered onto the architectural plan. Coloured markers locate the findings below; the hatched zones were never entered by the camera.</p>
{overlay}
{topdown}

{active_html}
{conf_html}
{stood_html}

<h2>As-designed reference (digitised plan)</h2>
<p><b>Overall:</b> {html.escape(plan.get('overall_dims',''))}</p>
<table><thead><tr><th>Room</th><th>Designed size</th><th>Location</th></tr></thead><tbody>{rooms_rows}</tbody></table>

<h2>Method &amp; limitations</h2>
<ol class="method">
<li>Insta360 equirectangular video (3840×1920, 70 s) → 105 panoramas → 318 overlapping perspective views.</li>
<li>Camera trajectory + sparse point cloud via COLMAP Structure-from-Motion (SIFT, affine + domain-size pooling).</li>
<li>Semantic survey: 35 location stops, each read across 4 walls + ceiling + full surround by independent vision agents.</li>
<li>Each finding cross-checked against the digitised plan and adversarially re-verified against the source frames.</li>
</ol>
<div class="limit"><b>Honest limitations</b><ul>
{''.join(f'<li>{html.escape(x)}</li>' for x in meta.get('limitations', []))}
</ul></div>

<div class="foot">Generated by the Sthyra as-built pipeline · monocular SfM is scale-recovered from the plan · this is a screening tool, not a substitute for a measured site survey.</div>
</div></body></html>"""

open("out/report.html","w").write(HTML)
print("WROTE out/report.html  (", len(HTML), "bytes )")
