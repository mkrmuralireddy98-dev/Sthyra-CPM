/* Build a self-contained supervisor.html from sources.
   Run:  node supervisor.build.mjs
   Mirrors build.mjs — the supervisor app must work opened directly
   (file://) or via the static server, with no sibling fetches.
   Sources (supervisor.css / supervisor.js) stay editable. */
import { readFileSync, writeFileSync, statSync } from "node:fs";

const css = readFileSync("supervisor.css", "utf8");
const js  = readFileSync("supervisor.js", "utf8");

/* Inline the FREE detector modules for the browser. Strip ESM export keywords
   and expose each module's API on a window global so supervisor.js can call it.
   One source of truth — the same files the Node worker / docs reference. */
function stripExports(src){
  return src
    .replace(/^export default [\s\S]*?;\s*$/m, "")
    .replace(/^export (async function|function|const|let|class) /gm, "$1 ");
}
// 1) Free on-device classical CV (canvas getImageData → metrics) → window.__CV
const cvInline = "(function(){\n" + stripExports(readFileSync("pipeline/detect.cv.mjs", "utf8")) +
  "\nwindow.__CV = { analyzeImage, cvDetect, computeLaplacianVariance, sobelEdgeDensity };\n})();";
// 2) Free LOCAL ML model (transformers.js CLIP zero-shot, lazy CDN import) → window.__MODEL
const modelInline = "(function(){\n" + stripExports(readFileSync("pipeline/detect.transformers.mjs", "utf8")) +
  "\nwindow.__MODEL = { loadModel, isLoaded, classifyFrame, runVisionModelTransformers, hypothesisFor };\n})();";
// 3) Insta360 engine: real equirectangular 360 viewer + in-browser frame extraction -> window.__INSTA360
const instaInline = "(function(){\n" + stripExports(readFileSync("pipeline/insta360.mjs", "utf8")) +
  "\nwindow.__INSTA360 = { ensureThree, createSphereViewer, extractFrames, isEquirect, createMepScene, createIfcScene, createDxfScene };\n})();";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1" />
  <meta name="theme-color" content="#F5F1E8" />
  <title>Sthyra CPM · Supervisor</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
${css}
  </style>
</head>
<body>
  <div class="stage">

    <aside class="stage__aside">
      <div class="eyebrow">Sthyra CPM</div>
      <h1>The supervisor's<br><em>site companion.</em></h1>
      <p>Photo-first, voice-first, offline-first. Built for fast taps with gloves on — every update lands as proof in the builder's command center.</p>
      <div class="legend">
        <div><span class="k">01</span><div><b>Today's dashboard</b> — only what matters now.</div></div>
        <div><span class="k">02</span><div><b>360° capture</b> — guided floor-by-floor walkthrough.</div></div>
        <div><span class="k">03</span><div><b>Voice → report</b> — speak once, file everything.</div></div>
        <div><span class="k">04</span><div><b>Offline sync</b> — capture now, upload when connected.</div></div>
      </div>
    </aside>

    <div class="phone" id="phone">
      <div class="statusbar">
        <span id="clock">06:42</span>
        <span class="statusbar__right">
          <span id="cellIc"></span>
          <span class="mono" style="font-size:11px">5G</span>
          <span id="battIc"></span>
        </span>
      </div>

      <header class="appbar" id="appbar">
        <div class="appbar__row">
          <div class="appbar__brand">
            <span class="brandmark" id="brandmark"></span>
            <div class="appbar__proj">
              <div class="appbar__projname" id="appProj">Sky Villa, Kokapet <span class="chev" id="projChev"></span></div>
              <div class="appbar__projmeta" id="appMeta">Hyderabad · G+2 luxury villa</div>
            </div>
          </div>
          <div class="appbar__acts">
            <button class="iconbtn" id="bell" aria-label="Alerts"><span id="bellIc"></span><span class="dot" id="bellDot">3</span></button>
            <div class="avatar">MK</div>
          </div>
        </div>
        <div class="syncbar is-online" id="syncbar"></div>
      </header>

      <main class="screen" id="screen"><!-- rendered by supervisor.js --></main>

      <nav class="tabbar" id="tabbar"></nav>

      <div class="scrim" id="scrim"></div>
      <aside class="sheet" id="sheet" role="dialog" aria-modal="true"></aside>
      <div class="toast" id="toast"></div>
    </div>
  </div>

  <script>
/* FREE on-device CV core (inlined from pipeline/detect.cv.mjs) → window.__CV */
${cvInline}
  </script>
  <script>
/* FREE local ML model wrapper (inlined from pipeline/detect.transformers.mjs) → window.__MODEL
   (lazy-imports transformers.js from CDN at runtime; one-time model download, cached) */
${modelInline}
  </script>
  <script>
/* Insta360 engine (inlined from pipeline/insta360.mjs) → window.__INSTA360
   (lazy-imports three.js from CDN at runtime for the equirectangular 360 viewer) */
${instaInline}
  </script>
  <script>
${js}
  </script>
  <script>
  /* paint the few static chrome icons that live in the shell */
  (function(){
    var M={brandmark:'<svg viewBox="0 0 32 32" width="30" height="30" fill="none"><rect x="11" y="9" width="10" height="16" stroke="currentColor" stroke-width="1.1"/><line x1="14" y1="10.5" x2="14" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="16" y1="10.5" x2="16" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="18" y1="10.5" x2="18" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="8" y1="9" x2="24" y2="9" stroke="currentColor" stroke-width="1.3"/><line x1="8" y1="25" x2="24" y2="25" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="9" r="1.6" fill="currentColor"/><circle cx="24" cy="9" r="1.6" fill="currentColor"/><circle cx="8" cy="25" r="1.6" fill="currentColor"/><circle cx="24" cy="25" r="1.6" fill="currentColor"/></svg>',
      projChev:'<svg viewBox="0 0 18 18" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7l4 4 4-4"/></svg>',
      bellIc:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3a4 4 0 0 0-4 4c0 4-1.5 5-1.5 5h11S14 11 14 7a4 4 0 0 0-4-4Z"/><path d="M8.5 15a1.5 1.5 0 0 0 3 0"/></svg>',
      cellIc:'<svg viewBox="0 0 18 12" width="17" height="11" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>',
      battIc:'<svg viewBox="0 0 24 14" width="22" height="13" fill="none" stroke="currentColor" stroke-width="1.1"><rect x="1" y="2" width="19" height="10" rx="2.5"/><rect x="2.5" y="3.5" width="13" height="7" rx="1" fill="currentColor" stroke="none"/><path d="M22 5v4" stroke-linecap="round" stroke-width="1.6"/></svg>'};
    for(var k in M){var el=document.getElementById(k); if(el)el.innerHTML=M[k];}
  })();
  </script>
</body>
</html>
`;

writeFileSync("supervisor.html", html);
console.log("Built supervisor.html →", (statSync("supervisor.html").size / 1024).toFixed(1) + " KB");
