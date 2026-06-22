/* ============================================================
   Sthyra CPM — Insta360 integration engine  (browser, free, no API)
   Real equirectangular 360° viewer + in-browser frame extraction.
   Inlined into supervisor.html as window.__INSTA360 (see supervisor.build.mjs).

   - ensureThree()             lazy-load three.js ESM from CDN (cached)
   - createSphereViewer(el,o)  interactive 360 sphere (image OR video texture)
   - extractFrames(src,o)      equirect video/photo -> perspective frames (dataURLs)
   - isEquirect(file)          quick 2:1 / spherical heuristic

   Monocular, on-device, deterministic. The extracted frames feed the SAME
   __CV / __MODEL pipeline the app already uses — no new backend.
   ============================================================ */

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export async function ensureThree(){
  if (window.__THREE) return window.__THREE;
  if (window.__threeLoading) return window.__threeLoading;
  window.__threeLoading = import(/* @vite-ignore */ THREE_URL)
    .then(function(m){ window.__THREE = m; return m; });
  return window.__threeLoading;
}

/* A 2:1 aspect (or insta/spherical-named) file is treated as equirectangular. */
export function isEquirect(file){
  if (!file) return false;
  const n = (file.name || "").toLowerCase();
  if (/\.(insv|insp|360)$/.test(n)) return true;
  if (/(equirect|insta|360|theta|pano)/.test(n)) return true;
  return null; // unknown — caller may probe dimensions
}

/* ---- interactive equirectangular sphere viewer (drag to look, optional autorotate) ---- */
export async function createSphereViewer(el, opts){
  opts = opts || {};
  const THREE = await ensureThree();
  while (el.firstChild) el.removeChild(el.firstChild);
  const W = el.clientWidth || 320, H = el.clientHeight || 200;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.fov || 76, W / H, 0.1, 1100);
  camera.position.set(0, 0, 0.01);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;cursor:grab;touch-action:none";

  const geo = new THREE.SphereGeometry(500, 60, 40);
  geo.scale(-1, 1, 1);

  let texture, videoEl = null;
  if (opts.video){
    videoEl = document.createElement("video");
    videoEl.src = opts.src; videoEl.crossOrigin = "anonymous";
    videoEl.loop = true; videoEl.muted = true; videoEl.playsInline = true;
    videoEl.setAttribute("playsinline", ""); videoEl.setAttribute("webkit-playsinline", "");
    texture = new THREE.VideoTexture(videoEl);
    videoEl.play().catch(function(){});
  } else {
    texture = new THREE.TextureLoader().load(opts.src);
  }
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  let lon = opts.lon != null ? opts.lon : 0, lat = 0;
  let dragging = false, px = 0, py = 0, plon = 0, plat = 0;
  function down(e){ dragging = true; const p = pt(e); px = p.x; py = p.y; plon = lon; plat = lat; renderer.domElement.style.cursor = "grabbing"; }
  function move(e){ if(!dragging) return; const p = pt(e); lon = plon - (p.x - px) * 0.16; lat = Math.max(-85, Math.min(85, plat + (p.y - py) * 0.16)); }
  function up(){ dragging = false; renderer.domElement.style.cursor = "grab"; }
  function pt(e){ const t = e.touches ? e.touches[0] : e; return { x: t.clientX, y: t.clientY }; }
  const dom = renderer.domElement;
  dom.addEventListener("mousedown", down); window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  dom.addEventListener("touchstart", down, {passive:true}); dom.addEventListener("touchmove", move, {passive:true}); dom.addEventListener("touchend", up);

  let raf = 0, disposed = false, auto = !!opts.autorotate;
  function frame(){
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (auto && !dragging) lon += 0.06;
    const phi = THREE.MathUtils.degToRad(90 - lat), theta = THREE.MathUtils.degToRad(lon);
    camera.lookAt(
      500 * Math.sin(phi) * Math.cos(theta),
      500 * Math.cos(phi),
      500 * Math.sin(phi) * Math.sin(theta)
    );
    renderer.render(scene, camera);
  }
  frame();

  function resize(){ const w = el.clientWidth || W, h = el.clientHeight || H; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
  window.addEventListener("resize", resize);

  return {
    el, video: videoEl,
    setAutorotate: function(v){ auto = !!v; },
    play: function(){ if (videoEl) return videoEl.play(); },
    dispose: function(){
      disposed = true; cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);
      window.removeEventListener("resize", resize);
      try{ if (videoEl){ videoEl.pause(); videoEl.src = ""; } }catch(_){}
      try{ texture.dispose(); geo.dispose(); mat.dispose(); renderer.dispose(); }catch(_){}
      if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}

/* ---- equirectangular -> perspective (pin-hole) remap on a canvas ---- */
function remapPerspective(srcData, srcW, srcH, yawDeg, pitchDeg, fovDeg, outW, outH){
  const out = document.createElement("canvas"); out.width = outW; out.height = outH;
  const octx = out.getContext("2d");
  const dst = octx.createImageData(outW, outH);
  const f = 0.5 * outW / Math.tan((fovDeg * Math.PI / 180) / 2);
  const cx = outW / 2, cy = outH / 2;
  const yaw = yawDeg * Math.PI / 180, pit = pitchDeg * Math.PI / 180;
  const cyaw = Math.cos(yaw), syaw = Math.sin(yaw), cp = Math.cos(pit), sp = Math.sin(pit);
  const s = srcData, dd = dst.data;
  for (let j = 0; j < outH; j++){
    for (let i = 0; i < outW; i++){
      let x = i - cx, y = j - cy, z = f;
      let n = Math.hypot(x, y, z); x /= n; y /= n; z /= n;
      let y1 = y * cp - z * sp, z1 = y * sp + z * cp;
      let x2 = x * cyaw + z1 * syaw, z2 = -x * syaw + z1 * cyaw;
      const lon = Math.atan2(x2, z2);
      const lat = Math.asin(Math.max(-1, Math.min(1, y1)));
      let u = (lon / (2 * Math.PI) + 0.5) * srcW;
      let v = (lat / Math.PI + 0.5) * srcH;
      let su = u | 0, sv = v | 0;
      if (su < 0) su += srcW; if (su >= srcW) su -= srcW;
      if (sv < 0) sv = 0; if (sv >= srcH) sv = srcH - 1;
      const si = (sv * srcW + su) * 4, di = (j * outW + i) * 4;
      dd[di] = s[si]; dd[di+1] = s[si+1]; dd[di+2] = s[si+2]; dd[di+3] = 255;
    }
  }
  octx.putImageData(dst, 0, 0);
  return out.toDataURL("image/jpeg", 0.82);
}

const ZONES = ["Entrance","Living","Living","Kitchen","Kitchen","Passage","Bedroom 1","Bedroom 1","Bathroom","Passage","Living","Staircase","Staircase"];

/* extract perspective frames from an equirect VIDEO or IMAGE source. */
export async function extractFrames(src, opts){
  opts = opts || {};
  const count = opts.count || 12;
  const fov = opts.fov || 90;
  const outW = opts.outW || 448, outH = Math.round(outW * 0.72);
  const onP = opts.onProgress || function(){};
  const eqW = 1280, eqH = 640;
  const eq = document.createElement("canvas"); eq.width = eqW; eq.height = eqH;
  const ectx = eq.getContext("2d", { willReadFrequently: true });
  const frames = [];
  let currentSource;

  function buildFrame(idx, t, yaw){
    ectx.drawImage(currentSource, 0, 0, eqW, eqH);
    const idata = ectx.getImageData(0, 0, eqW, eqH);
    const img = remapPerspective(idata.data, eqW, eqH, yaw, -4, fov, outW, outH);
    const fx = 22 + Math.round(58 * (idx / Math.max(1, count - 1)));
    const fy = 30 + Math.round(40 * Math.abs(Math.sin(idx * 0.9)));
    frames.push({ idx: idx + 1, t: +t.toFixed(1), zone: ZONES[idx % ZONES.length], img: img, fx: fx, fy: fy, yaw: yaw });
  }

  if (opts.video){
    const v = document.createElement("video");
    v.src = src; v.crossOrigin = "anonymous"; v.muted = true; v.playsInline = true; v.preload = "auto";
    await new Promise(function(res, rej){
      v.onloadedmetadata = function(){ res(); };
      v.onerror = function(){ rej(new Error("video load failed")); };
    });
    const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : count * 1.5;
    currentSource = v;
    for (let i = 0; i < count; i++){
      const t = Math.min(dur - 0.05, (i + 0.5) * dur / count);
      await new Promise(function(res){
        let done = false;
        v.onseeked = function(){ if (done) return; done = true; res(); };
        try { v.currentTime = t; } catch(_) { res(); }
        setTimeout(function(){ if (!done){ done = true; res(); } }, 1400);
      });
      const yaw = opts.yawWalk ? (i * 28) % 360 : 0;
      buildFrame(i, t, yaw);
      onP({ done: i + 1, total: count, t: t });
      await new Promise(function(r){ setTimeout(r, 0); });
    }
    try { v.pause(); v.src = ""; } catch(_){}
  } else {
    const im = new Image(); im.crossOrigin = "anonymous";
    await new Promise(function(res, rej){ im.onload = res; im.onerror = function(){ rej(new Error("image load failed")); }; im.src = src; });
    currentSource = im;
    for (let i = 0; i < count; i++){
      const yaw = Math.round((i / count) * 360);
      buildFrame(i, i * 1.5, yaw);
      onP({ done: i + 1, total: count });
      await new Promise(function(r){ setTimeout(r, 0); });
    }
  }
  return frames;
}


/* ---- procedural MEP BIM model (stand-in for a Revit export; load a .glb to replace) ---- */
export async function createMepScene(el, opts){
  opts = opts || {};
  const THREE = await ensureThree();
  while (el.firstChild) el.removeChild(el.firstChild);
  const W = el.clientWidth || 320, H = el.clientHeight || 240;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x14130f);
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 300);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W, H);
  el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;cursor:grab";
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const dir = new THREE.DirectionalLight(0xffffff, 0.85); dir.position.set(8, 18, 12); scene.add(dir);
  // floor slab + grid (office footprint ~ 14 x 20)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 20), new THREE.MeshStandardMaterial({ color: 0x26241f, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.01; scene.add(floor);
  const grid = new THREE.GridHelper(20, 20, 0x4a463e, 0x33312b); scene.add(grid);
  function box(x, y, z, w, h, d, col, met){ const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: col, metalness: met == null ? 0.4 : met, roughness: 0.5 })); m.position.set(x, y, z); scene.add(m); return m; }
  function tube(x, y, z, len, axis, r, col){ const m = new THREE.Mesh(new THREE.CylinderGeometry(r || 0.16, r || 0.16, len, 14), new THREE.MeshStandardMaterial({ color: col, metalness: 0.3, roughness: 0.45 })); m.position.set(x, y, z); if (axis === "x") m.rotation.z = Math.PI / 2; if (axis === "z") m.rotation.x = Math.PI / 2; scene.add(m); return m; }
  // HVAC ducts (grey)
  box(0, 3.0, -6, 12, 0.7, 0.8, 0xb9b9b9); box(0, 3.0, 0, 12, 0.7, 0.8, 0xb9b9b9); box(0, 3.0, 6, 10, 0.7, 0.8, 0xb9b9b9);
  box(-5, 3.0, 0, 0.8, 0.7, 12, 0xb9b9b9); box(5, 3.0, 0, 0.8, 0.7, 12, 0xb9b9b9);
  // plumbing (blue)
  tube(-6, 1.6, -8, 3, "y", 0.18, 0x2E6FB0); tube(-6, 2.7, -4, 8, "z", 0.18, 0x2E6FB0); tube(6, 1.6, 8, 3, "y", 0.18, 0x2E6FB0); tube(6, 2.7, 4, 8, "z", 0.18, 0x2E6FB0);
  // electrical cable trays / conduit (green)
  box(4, 2.85, -6, 10, 0.18, 0.5, 0x5B7E3A, 0.2); box(-4, 2.85, 4, 10, 0.18, 0.5, 0x5B7E3A, 0.2);
  // fire sprinkler line (red) + heads
  tube(0, 3.45, -3, 16, "x", 0.1, 0xB03A3A);
  for (let i = -7; i <= 7; i += 3.5){ const h = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 10), new THREE.MeshStandardMaterial({ color: 0xB03A3A })); h.position.set(i, 3.2, -3); scene.add(h); }
  // light fixtures (warm emissive panels)
  for (let i = -5; i <= 5; i += 2.5) for (let j = -7.5; j <= 7.5; j += 3.75){ const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: 0xffe6b0, emissive: 0xffcf80, emissiveIntensity: 0.6 })); l.position.set(i, 2.95, j); scene.add(l); }
  // toggleable walls (hide them to see the MEP that is actually behind the wall)
  const walls = new THREE.Group();
  const wmat = new THREE.MeshStandardMaterial({ color: 0xcfc7b6, roughness: 0.96, transparent: true, opacity: 0.94, side: THREE.DoubleSide });
  function wall(x,z,w,d){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,3.2,d), wmat); m.position.set(x,1.6,z); walls.add(m); }
  wall(0,-10,14,0.2); wall(0,10,14,0.2); wall(-7,0,0.2,20); wall(7,0,0.2,20);
  wall(2,-3,0.2,8); wall(-2.5,4,7,0.2);
  scene.add(walls);
  let driven = false; const lookT = new THREE.Vector3(0,1.6,0);
  let raf = 0, disposed = false, ang = 0.6, drag = false, px = 0;
  function loop(){ if (disposed) return; raf = requestAnimationFrame(loop); if (!driven){ if (!drag) ang += 0.0026; const r = 21; camera.position.set(Math.sin(ang) * r, 11.5, Math.cos(ang) * r); camera.lookAt(0, 1.6, 0); } renderer.render(scene, camera); }
  loop();
  const dom = renderer.domElement;
  function dn(e){ drag = true; px = (e.touches ? e.touches[0] : e).clientX; }
  function mv(e){ if (!drag) return; const x = (e.touches ? e.touches[0] : e).clientX; ang -= (x - px) * 0.01; px = x; }
  function up(){ drag = false; }
  dom.addEventListener("mousedown", dn); window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
  dom.addEventListener("touchstart", dn, {passive:true}); dom.addEventListener("touchmove", mv, {passive:true}); dom.addEventListener("touchend", up);
  function resize(){ const w = el.clientWidth || W, h = el.clientHeight || H; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
  window.addEventListener("resize", resize);
  return {
    setPose: function(mx,mz,hd){ driven=true; const px=mx*5.5, pz=mz*8.0, hr=hd*Math.PI/180; camera.position.set(px,1.62,pz); lookT.set(px+Math.sin(hr)*6, 1.35, pz+Math.cos(hr)*6); camera.lookAt(lookT); },
    setWalls: function(v){ walls.visible = !!v; },
    setAutorotate: function(v){ driven = !v; },
    dispose: function(){ disposed = true; cancelAnimationFrame(raf); window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); window.removeEventListener("resize", resize); try{ renderer.dispose(); }catch(_){ } if (dom.parentNode) dom.parentNode.removeChild(dom); } };
}


/* ===== IFC (web-ifc 0.0.77 / IfcOpenShell WASM) — parse + render fully in-browser, no cloud ===== */
const WEBIFC_VER = "0.0.77";
const WEBIFC_BASE = "https://cdn.jsdelivr.net/npm/web-ifc@" + WEBIFC_VER + "/";
const IFC_HIDE = new Set([2391406946,3512223829,1529196076,1973544240,2016517767]); // wall, wall-std, slab, covering, roof

async function ifcToThreeGroup(buffer, THREE){
  const WebIFC = await import(WEBIFC_BASE + "+esm");
  const dataBuf = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const api = new WebIFC.IfcAPI();
  api.SetWasmPath(WEBIFC_BASE, true);          // DIRECTORY + absolute=true (both required)
  await api.Init(undefined, true);             // single-thread -> no COOP/COEP headers needed
  const modelID = api.OpenModel(dataBuf, { COORDINATE_TO_ORIGIN: true });
  const group = new THREE.Group(); group.name = "IFC";
  const mats = Object.create(null);
  function mat(c){ const k=c.x+"_"+c.y+"_"+c.z+"_"+c.w; let m=mats[k]; if(m) return m;
    m=new THREE.MeshLambertMaterial({color:new THREE.Color(c.x,c.y,c.z),side:THREE.DoubleSide,transparent:c.w!==1,opacity:c.w}); return mats[k]=m; }
  function geom(pg){ const g=api.GetGeometry(modelID,pg.geometryExpressID);
    const v=api.GetVertexArray(g.GetVertexData(),g.GetVertexDataSize());
    const ix=api.GetIndexArray(g.GetIndexData(),g.GetIndexDataSize());
    const bg=new THREE.BufferGeometry(); const pos=new Float32Array(v.length/2), nrm=new Float32Array(v.length/2);
    for(let i=0;i<v.length;i+=6){ pos[i/2]=v[i];pos[i/2+1]=v[i+1];pos[i/2+2]=v[i+2]; nrm[i/2]=v[i+3];nrm[i/2+1]=v[i+4];nrm[i/2+2]=v[i+5]; }
    bg.setAttribute("position",new THREE.BufferAttribute(pos,3));
    bg.setAttribute("normal",new THREE.BufferAttribute(nrm,3));
    bg.setIndex(new THREE.BufferAttribute(ix,1)); g.delete(); return bg; }
  api.StreamAllMeshes(modelID, function(fm){
    const eid=fm.expressID; const type=api.GetLineType(modelID,eid); const gs=fm.geometries;
    for(let i=0;i<gs.size();i++){ const pg=gs.get(i);
      const mesh=new THREE.Mesh(geom(pg),mat(pg.color));
      mesh.matrix=new THREE.Matrix4().fromArray(pg.flatTransformation); mesh.matrixAutoUpdate=false;
      mesh.userData.ifcType=type; group.add(mesh); }
  });
  group.rotation.x = -Math.PI/2;                 // IFC is Z-up -> three.js Y-up
  api.CloseModel(modelID);
  return group;
}
function ifcTypeMap(group){ const m=new Map(); group.traverse(function(o){ if(!o.isMesh) return; const t=o.userData.ifcType; if(!m.has(t)) m.set(t,[]); m.get(t).push(o); }); return m; }
function ifcSetXray(map,on){ map.forEach(function(meshes,t){ if(IFC_HIDE.has(t)) meshes.forEach(function(mm){ mm.visible = !on; }); }); }

/* Render an uploaded/sample IFC; same control surface as createMepScene (setPose/setWalls/setAutorotate). */
export async function createIfcScene(el, opts){
  opts=opts||{};
  const THREE = await ensureThree();
  while(el.firstChild) el.removeChild(el.firstChild);
  el.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#9b958a;font-size:12px">parsing IFC (web-ifc)…</div>';
  const W=el.clientWidth||320, H=el.clientHeight||240;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x14130f);
  const camera=new THREE.PerspectiveCamera(50,W/H,0.05,8000);
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(W,H);
  scene.add(new THREE.AmbientLight(0xffffff,0.85));
  const dir=new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(10,20,12); scene.add(dir);
  let group,typeMap; const center=new THREE.Vector3(); let radius=8; const half=new THREE.Vector3(4,3,4); let minY=0,maxY=3;
  try{
    const buf = opts.buffer ? opts.buffer : await (await fetch(opts.url)).arrayBuffer();
    group = await ifcToThreeGroup(buf, THREE);
    scene.add(group); typeMap=ifcTypeMap(group);
    const box=new THREE.Box3().setFromObject(group); box.getCenter(center);
    box.getSize(half); radius=Math.max(2, half.length()/2); half.multiplyScalar(0.5); minY=box.min.y; maxY=box.max.y;
    if(opts.walls===false) ifcSetXray(typeMap,true);
  }catch(e){ el.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#cc8a8a;font-size:11px;padding:16px;text-align:center">IFC parse failed: '+String((e&&e.message)||e).slice(0,90)+'</div>'; return {dispose:function(){},setPose:function(){},setWalls:function(){},setAutorotate:function(){}}; }
  while(el.firstChild) el.removeChild(el.firstChild);
  el.appendChild(renderer.domElement); renderer.domElement.style.cssText="display:block;width:100%;height:100%;cursor:grab";
  let raf=0,disposed=false,ang=0.6,drag=false,px=0,driven=false; const lookT=new THREE.Vector3();
  function loop(){ if(disposed) return; raf=requestAnimationFrame(loop);
    if(!driven){ if(!drag) ang+=0.0024; camera.position.set(center.x+Math.sin(ang)*radius*1.9, center.y+radius*0.95, center.z+Math.cos(ang)*radius*1.9); camera.lookAt(center); }
    renderer.render(scene,camera); }
  loop();
  const dom=renderer.domElement;
  function dn(e){drag=true;px=(e.touches?e.touches[0]:e).clientX;}
  function mv(e){if(!drag)return;const x=(e.touches?e.touches[0]:e).clientX;ang-=(x-px)*0.01;px=x;}
  function up(){drag=false;}
  dom.addEventListener("mousedown",dn);window.addEventListener("mousemove",mv);window.addEventListener("mouseup",up);
  dom.addEventListener("touchstart",dn,{passive:true});dom.addEventListener("touchmove",mv,{passive:true});dom.addEventListener("touchend",up);
  function resize(){const w=el.clientWidth||W,h=el.clientHeight||H;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
  window.addEventListener("resize",resize);
  return {
    setPose:function(mx,mz,hd){ driven=true; const x=center.x+mx*half.x*1.4, z=center.z+mz*half.z*1.4, y=minY+(maxY-minY)*0.28, hr=hd*Math.PI/180; camera.position.set(x,y,z); lookT.set(x+Math.sin(hr)*radius, y-radius*0.04, z+Math.cos(hr)*radius); camera.lookAt(lookT); },
    setWalls:function(v){ if(typeMap) ifcSetXray(typeMap, !v); },
    setAutorotate:function(v){ driven=!v; },
    dispose:function(){ disposed=true; cancelAnimationFrame(raf); window.removeEventListener("mousemove",mv); window.removeEventListener("mouseup",up); window.removeEventListener("resize",resize); try{renderer.dispose();}catch(_){} if(dom.parentNode) dom.parentNode.removeChild(dom); }
  };
}

/* Render a 2D DXF (CAD plan) as line work; same control surface (pose/walls are no-ops). */
export async function createDxfScene(el, opts){
  opts=opts||{};
  const THREE = await ensureThree();
  while(el.firstChild) el.removeChild(el.firstChild);
  let DxfParser;
  try{ DxfParser=(await import("https://cdn.jsdelivr.net/npm/dxf-parser@1.1.2/+esm")).default; }
  catch(e){ el.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#cc8a8a;font-size:11px">DXF parser load failed</div>'; return {dispose:function(){},setPose:function(){},setWalls:function(){},setAutorotate:function(){}}; }
  const W=el.clientWidth||320, H=el.clientHeight||240;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0xf7f2e9);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(W,H);
  const grp=new THREE.Group(); const lmat=new THREE.LineBasicMaterial({color:0x2a2724});
  try{
    const txt = opts.text ? opts.text : await (await fetch(opts.url)).text();
    const dxf=new DxfParser().parseSync(txt);
    (dxf.entities||[]).forEach(function(e){ if((e.type==="LINE"||e.type==="LWPOLYLINE"||e.type==="POLYLINE")&&e.vertices){ const pts=e.vertices.map(function(v){return new THREE.Vector3(v.x,v.y,v.z||0);}); grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lmat)); } });
  }catch(e){ el.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#cc8a8a;font-size:11px;padding:16px;text-align:center">DXF parse failed</div>'; return {dispose:function(){},setPose:function(){},setWalls:function(){},setAutorotate:function(){}}; }
  scene.add(grp);
  el.appendChild(renderer.domElement); renderer.domElement.style.cssText="display:block;width:100%;height:100%";
  const box=new THREE.Box3().setFromObject(grp); const c=box.getCenter(new THREE.Vector3()); const sz=box.getSize(new THREE.Vector3());
  const mx=Math.max(sz.x,sz.y)*0.6||10; const cam=new THREE.OrthographicCamera(-mx,mx,mx,-mx,-1000,1000);
  cam.position.set(c.x,c.y,100); cam.lookAt(c.x,c.y,0);
  let raf=0,disposed=false;
  function loop(){ if(disposed) return; raf=requestAnimationFrame(loop); renderer.render(scene,cam); }
  loop();
  function resize(){const w=el.clientWidth||W,h=el.clientHeight||H; renderer.setSize(w,h);}
  window.addEventListener("resize",resize);
  return { setPose:function(){}, setWalls:function(){}, setAutorotate:function(){}, dispose:function(){ disposed=true; cancelAnimationFrame(raf); window.removeEventListener("resize",resize); try{renderer.dispose();}catch(_){} if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); } };
}

export default { ensureThree, createSphereViewer, extractFrames, isEquirect, createMepScene, createIfcScene, createDxfScene };
