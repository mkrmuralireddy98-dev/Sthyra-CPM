/* Build a self-contained supervisor.html from sources.
   Run:  node supervisor.build.mjs
   Sthyra — Reality Capture (MVP). Works opened directly (file://)
   or via the static server, with no sibling fetches except the
   sample assets and the Supabase REST/Storage API. */
import { readFileSync, writeFileSync, statSync } from "node:fs";

// Escape the only byte sequence that can prematurely close an inline <script> (MAINT-5).
const safe = s => s.split("</script").join("<" + String.fromCharCode(92) + "/script");
const css = readFileSync("supervisor.css", "utf8");
const cfg = readFileSync("config.js", "utf8");   // single source of backend identity (ARCH-3)
const js  = readFileSync("supervisor.js", "utf8");

/* Inline the 360 engine for the browser. Strip ESM export keywords and
   expose the MVP subset on window.__INSTA360 (createSphereViewer is the
   only piece the reality-capture viewer needs; the others support import). */
function stripExports(src){
  return src
    .replace(/^export default [\s\S]*?;\s*$/m, "")
    .replace(/^export (async function|function|const|let|class) /gm, "$1 ");
}
const instaInline = "(function(){\n" + stripExports(readFileSync("pipeline/insta360.mjs", "utf8")) +
  "\nwindow.__INSTA360 = { ensureThree, createSphereViewer, extractFrames, isEquirect };\n})();";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1" />
  <meta name="theme-color" content="#F5F1E8" />
  <title>Sthyra · Reality Capture</title>
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
      <div class="eyebrow">Sthyra · Reality Capture</div>
      <h1>Walk it once.<br><em>Return any time.</em></h1>
      <p>Walk a property with a 360° camera. Sthyra places the visual record on the floor plan so anyone can return to any location and any date — remotely.</p>
      <div class="legend">
        <div><span class="k">01</span><div><b>Plan</b> — upload &amp; calibrate the 2D floor plan.</div></div>
        <div><span class="k">02</span><div><b>Capture</b> — import a 360° walk, mark start, trace route.</div></div>
        <div><span class="k">03</span><div><b>Review</b> — click the plan, inspect the 360° view.</div></div>
        <div><span class="k">04</span><div><b>Compare · note · share</b> — across dates, with evidence.</div></div>
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
              <div class="appbar__projname" id="appProj">Sthyra <span class="chev" id="projChev"></span></div>
              <div class="appbar__projmeta" id="appMeta">Reality capture</div>
            </div>
          </div>
          <div class="appbar__acts">
            <button class="iconbtn" id="bell" aria-label="Info"><span id="bellIc"></span><span class="dot" id="bellDot"></span></button>
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
${cfg}
  </script>
  <script>
/* Insta360 engine (inlined from pipeline/insta360.mjs) → window.__INSTA360
   (lazy-imports three.js from CDN at runtime for the equirectangular 360 viewer) */
${instaInline}
  </script>
  <script>
${safe(js)}
  </script>
  <script>
  /* paint the few static chrome icons that live in the shell */
  (function(){
    var M={brandmark:'<svg viewBox="0 0 32 32" width="30" height="30" fill="none"><rect x="11" y="9" width="10" height="16" stroke="currentColor" stroke-width="1.1"/><line x1="14" y1="10.5" x2="14" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="16" y1="10.5" x2="16" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="18" y1="10.5" x2="18" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="8" y1="9" x2="24" y2="9" stroke="currentColor" stroke-width="1.3"/><line x1="8" y1="25" x2="24" y2="25" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="9" r="1.6" fill="currentColor"/><circle cx="24" cy="9" r="1.6" fill="currentColor"/><circle cx="8" cy="25" r="1.6" fill="currentColor"/><circle cx="24" cy="25" r="1.6" fill="currentColor"/></svg>',
      projChev:'',
      bellIc:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M10 9v4M10 6.6v.1"/></svg>',
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
