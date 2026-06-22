# As-Built 360 → Plan Audit (Sthyra "Build-with-Proof")

Reconstructs an Insta360 office walkthrough in 3D, registers it to the architectural
floor plan, and reports structural / electrical / plumbing deviations between
as-built (video) and as-designed (plan).

## Inputs
- `office360.mp4` — Insta360 equirectangular 360° video (3840×1920, ~70 s) — from `~/Downloads`
- `HSR OFFICE FLOOR PLAN -TYPICAL FLOOR.pdf` — vector CAD plan (ZWCAD) — from `~/Downloads`

## Deliverable
- **`out/report.html`** — self-contained branded audit report (open in any browser; print → PDF to share)
- `out/overlay_annotated.png` — walked path + coverage + finding markers on the plan
- `out/findings_final.json` — 15 verified findings (active / conformance / stood-down)
- `out/asdesigned.json`, `out/asbuilt_locations.json` — digitised plan + per-stop as-built inventory

## Pipeline (re-run from this folder)
```bash
# 1. plan render + frame extraction (ffmpeg)
pdftoppm -r 300 -png "<plan>.pdf" plan/plan
ffmpeg -i "<video>.mp4" -vf fps=1.5 -q:v 2 frames/pano_%04d.jpg

# 2. equirect -> overlapping perspective views, then COLMAP sparse SfM
python3 make_cubes.py           # 318 perspective views (6 yaws × 53 panos)
./run_colmap.sh                 # SIFT + exhaustive matching + mapper  (GPU)
python3 analyze_recon.py        # camera trajectory + top-down (out/)

# 3. semantic survey (35 location stops, 6 views each)
python3 extract_semantic.py     # sem/tNN/*.jpg

# 4. registration + report
python3 register_overlay.py     # path registered to plan -> out/overlay_annotated.png
python3 build_report.py         # out/report.html

# 5. construction-quality / dimensional analysis
python3 geometry_quality.py     # slab level/parallel/height, wall-recoverability -> out/quality_metrics.json
python3 make_section.py         # height histogram (why walls aren't measurable) -> out/section_view.png
#   (door/wall dims + per-room grades come from the asbuilt-dimensional-quality workflow -> out/dimquality_rooms.json)
python3 build_quality_report.py # out/quality_report.html
```
Steps 3's vision inventory and the discipline comparison/verification were run as
multi-agent workflows (`asbuilt-semantic-inventory`, `asbuilt-discipline-compare`);
their structured outputs are cached in `out/asbuilt_locations.json` and
`out/findings_all.json`.

## Key results (this run)
- COLMAP solved **307 / 318** views @ 1.05 px reprojection error; all 53 stops positioned.
- **Critical coverage gap:** toilets, pantry and lift/stair core were never filmed → all
  4 drawn plumbing fixtures unverifiable.
- **Safety:** no exit/emergency signage observed; glass balustrade guard height unverified.
- **Finishing:** raw/chipped plaster at the reception lift-shaft door jamb.
- **Electrical:** some genuine unterminated ceiling wiring + surface conduit vs the
  concealed-services design intent (plan has no electrical layer).
- **Conformances:** reception accent wall, glass cabins, sliding doors & perimeter glazing
  all built as drawn.
- Adversarial verification **dropped** false positives (an "exposed concrete beam" that is a
  finished ceiling; a suspected water stain).

## Honest limitations
Monocular SfM is scale-recovered from the plan, not surveyed (placement ±~1.5 m). No CUDA
on this Mac → sparse reconstruction only (no dense mesh / mm-level wall deviation). The plan
is architectural (no MEP layers). This is a **screening tool, not a measured site survey**.
