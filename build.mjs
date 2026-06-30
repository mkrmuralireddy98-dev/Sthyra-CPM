/* Build a self-contained index.html from sources.
   Run:  node build.mjs
   Why this exists: the built index.html must work when opened directly
   (file://) or in previews that don't fetch sibling files. Sources stay
   editable; index.html is generated. Uses template interpolation (NOT
   String.replace, whose $$/$& patterns would corrupt the JS). */
import { readFileSync, writeFileSync, statSync } from "node:fs";

// Escape the only byte sequence that can prematurely close an inline <script> (MAINT-5).
const safe = s => s.split("</script").join("<" + String.fromCharCode(92) + "/script");
const css = readFileSync("styles.css", "utf8");
const cfg = readFileSync("config.js", "utf8");   // single source of backend identity (ARCH-3)
const js  = readFileSync("app.js", "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sthyra CPM · Construction Command Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
${css}
  </style>
</head>
<body>
  <div class="app" id="app">

    <aside class="rail" id="rail">
      <div class="rail__brand">
        <span class="brandmark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none">
            <rect x="11" y="9" width="10" height="16" stroke="currentColor" stroke-width="1.1"/>
            <line x1="14" y1="10.5" x2="14" y2="23.5" stroke="currentColor" stroke-width="0.7"/>
            <line x1="16" y1="10.5" x2="16" y2="23.5" stroke="currentColor" stroke-width="0.7"/>
            <line x1="18" y1="10.5" x2="18" y2="23.5" stroke="currentColor" stroke-width="0.7"/>
            <line x1="8" y1="9" x2="24" y2="9" stroke="currentColor" stroke-width="1.3"/>
            <line x1="8" y1="25" x2="24" y2="25" stroke="currentColor" stroke-width="1.3"/>
            <circle cx="8" cy="9" r="1.6" fill="currentColor"/>
            <circle cx="24" cy="9" r="1.6" fill="currentColor"/>
            <circle cx="8" cy="25" r="1.6" fill="currentColor"/>
            <circle cx="24" cy="25" r="1.6" fill="currentColor"/>
          </svg>
        </span>
        <span class="brandmark__word">
          <span class="brandmark__name">Sthyra</span>
          <span class="brandmark__sub">CPM</span>
        </span>
      </div>

      <nav class="nav" id="nav" aria-label="Primary"></nav>

      <div class="rail__foot">
        <div class="role" id="roleToggle" role="group" aria-label="View as">
          <button class="role__btn is-active" data-role="builder">Builder</button>
          <button class="role__btn" data-role="client">Client</button>
        </div>
        <div class="rail__project">
          <span class="mono-label">Project</span>
          <span class="rail__projname">Sky Villa — Kokapet</span>
        </div>
      </div>
    </aside>

    <div class="main">
      <header class="topbar" id="topbar">
        <div class="topbar__left">
          <button class="iconbtn rail-toggle" id="railToggle" aria-label="Toggle navigation">
            <span></span><span></span><span></span>
          </button>
          <div class="topbar__project">
            <span class="topbar__projname" id="projName">Sky Villa, Kokapet</span>
            <span class="topbar__meta" id="projMeta">Hyderabad · G+2 luxury villa · Plot 14</span>
          </div>
        </div>

        <div class="topbar__right">
          <div class="weather" title="Site weather">
            <span class="weather__temp">34°</span>
            <span class="weather__desc">Partly cloudy · rain risk tomorrow</span>
          </div>
          <button class="ghostbtn" id="problemsToggle" aria-pressed="false">Problems only</button>
          <button class="solidbtn" id="changedBtn">What changed today</button>
          <button class="iconbtn bell" id="bell" aria-label="Alerts">
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M10 3a4 4 0 0 0-4 4c0 4-1.5 5-1.5 5h11S14 11 14 7a4 4 0 0 0-4-4Z"/>
              <path d="M8.5 15a1.5 1.5 0 0 0 3 0"/>
            </svg>
            <span class="bell__dot" id="bellDot">3</span>
          </button>
          <div class="avatar" title="Murali Krishna">MK</div>
        </div>
      </header>

      <main class="view" id="view"><!-- rendered by app.js --></main>

      <footer class="appfoot">
        <span>Sthyra CPM · <em>Build with proof.</em></span>
        <span class="mono-label" id="footStamp"></span>
      </footer>
    </div>
  </div>

  <div class="drawer-scrim" id="scrim" hidden></div>
  <aside class="drawer" id="drawer" hidden aria-modal="true" role="dialog"></aside>

  <script>
${cfg}
  </script>
  <script>
${safe(js)}
  </script>
</body>
</html>
`;

writeFileSync("index.html", html);
console.log("Built index.html →", (statSync("index.html").size / 1024).toFixed(1) + " KB");
