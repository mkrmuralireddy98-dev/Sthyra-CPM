# Sthyra CPM

Construction project-management / site-intelligence for India — "Build with proof."

- **Command center** (`index.html` / `app.js`) — builder dashboard.
- **Supervisor app** (`supervisor.html`, built from `supervisor.js` via `node supervisor.build.mjs`) — on-site mobile companion: 360° capture, voice→report, offline sync, and a **BIM × 360** module (real 360 viewer, frame extraction → on-device CV/CLIP, split-compare 360↔MEP/IFC/floor-plan, and a locked walk that drives a BIM camera along the recovered Insta360 path with see-through-walls X-ray).
- **`pipeline/`** — free on-device detectors (`detect.cv.mjs`, `detect.transformers.mjs`) + the Insta360 engine (`insta360.mjs`: equirect viewer, frame extraction, procedural MEP, web-ifc IFC loader, DXF).
- **`asbuilt360/`** — Insta360 walkthrough → COLMAP reconstruction → register to floor plan → as-built-vs-as-designed audit + construction-quality report (scripts + `out/` reports; heavy intermediates are git-ignored, reproduce via the scripts).
- **`supabase/`** — `cpm-pipeline` edge function. Client uses the Supabase **anon/publishable** key (RLS-protected).

Dev serve: `node .claude/static-server.mjs` → http://localhost:4318/
