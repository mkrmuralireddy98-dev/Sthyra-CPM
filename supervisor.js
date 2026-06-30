/* ============================================================
   Sthyra — Reality Capture (MVP)
   Walk a property once with a 360 camera. Sthyra places the
   visual record on the floor plan so anyone can return to any
   location and date. Assisted localization, web review.
   Persists to Supabase (sth_* tables). Single-tenant demo.
   ============================================================ */
(function(){
"use strict";
var $  = function(s,r){return (r||document).querySelector(s);};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

/* ------------------------------------------------------------ ICONS */
var I={
  proj:'<svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h6l2 2h8v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5Z"/></svg>',
  plan:'<svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="16" height="16" rx="1.5"/><path d="M3 9h16M9 9v10M9 13h10"/></svg>',
  cap:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.4"/><path d="M3.5 12a8.5 8.5 0 0 1 17 0"/><path d="M20.5 12a8.5 8.5 0 0 1-17 0"/><path d="M18.5 8.5 20.5 12l-3.6.4M5.5 15.5 3.5 12l3.6-.4"/></svg>',
  note:'<svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h9l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13 3v4h4M7 12h8M7 15h6"/></svg>',
  back:'<svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4 6 9l5 5"/></svg>',
  chev:'<svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4l5 5-5 5"/></svg>',
  plus:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 4v12M4 10h12"/></svg>',
  check:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5 7 13l7.5-8"/></svg>',
  x:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l10 10M14 4 4 14"/></svg>',
  play:'<svg viewBox="0 0 18 18" width="14" height="14" fill="currentColor"><path d="M5 3.5 14 9l-9 5.5Z"/></svg>',
  pause:'<svg viewBox="0 0 18 18" width="14" height="14" fill="currentColor"><rect x="4" y="3.5" width="3.5" height="11" rx="1"/><rect x="10.5" y="3.5" width="3.5" height="11" rx="1"/></svg>',
  upload:'<svg viewBox="0 0 22 22" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 15V5M7 9l4-4 4 4"/><path d="M4 15v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2"/></svg>',
  ruler:'<svg viewBox="0 0 22 22" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="17" height="8" rx="1.5"/><path d="M6.5 7v2.5M10 7v3.5M13.5 7v2.5M17 7v3.5"/></svg>',
  pin:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 16s5-4.2 5-8a5 5 0 0 0-10 0c0 3.8 5 8 5 8Z"/><circle cx="9" cy="8" r="1.8"/></svg>',
  share:'<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="10" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="M6.8 9 13 6M6.8 11 13 14"/></svg>',
  dl:'<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3v10M6 9l4 4 4-4M4 16h12"/></svg>',
  sync:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a6 6 0 0 1 10-4.3L15 6M15 9a6 6 0 0 1-10 4.3L3 12"/><path d="M15 3v3h-3M3 15v-3h3"/></svg>',
  cal:'<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="14" height="13" rx="1.5"/><path d="M3 8h14M7 2v3M13 2v3"/></svg>',
  layers:'<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 3 6.5 10 10l7-3.5Z"/><path d="M3 10.5 10 14l7-3.5M3 13.5 10 17l7-3.5"/></svg>',
  bell:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3a4 4 0 0 0-4 4c0 4-1.5 5-1.5 5h11S14 11 14 7a4 4 0 0 0-4-4Z"/><path d="M8.5 15a1.5 1.5 0 0 0 3 0"/></svg>'
};

/* ------------------------------------------------------------ BACKEND (Supabase, sth_* tables) */
var BACKEND = window.__SthyraConfig || {};   // single-sourced in config.js (ARCH-3)
var backendLive=false;
function sb(path,opts){opts=opts||{};opts.headers=Object.assign({apikey:BACKEND.key,Authorization:"Bearer "+BACKEND.key},opts.headers||{});return fetch(BACKEND.url+path,opts);}
function sbGet(path){return sb(path,{}).then(function(r){backendLive=r.ok;return r.ok?r.json():[];}).catch(function(){return [];});}
function sbInsert(table,row){return sb("/"+table,{method:"POST",headers:{"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(row)}).then(function(r){return r.json();}).then(function(a){return Array.isArray(a)?a[0]:a;});}
function sbInsertMany(table,rows){return sb("/"+table,{method:"POST",headers:{"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(rows)});}
function sbPatch(table,id,patch){return sb("/"+table+"?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(patch)}).then(function(r){return r.json();}).then(function(a){return a&&a[0];});}
function sbDelete(table,id){return sb("/"+table+"?id=eq."+encodeURIComponent(id),{method:"DELETE",headers:{Prefer:"return=minimal"}});}
function uploadMedia(file,key){
  return fetch(BACKEND.base+"/storage/v1/object/sth-media/"+key,{method:"POST",headers:{apikey:BACKEND.key,Authorization:"Bearer "+BACKEND.key,"x-upsert":"true","Content-Type":file.type||"application/octet-stream"},body:file})
    .then(function(r){ if(!r.ok) throw new Error("upload "+r.status); return BACKEND.base+"/storage/v1/object/public/sth-media/"+key; });
}
function uid(){return Math.floor(Date.now()).toString(36)+"-"+Math.floor(Math.random()*1e9).toString(36);}
function token(){var a="abcdefghijkmnpqrstuvwxyz23456789",s="";for(var i=0;i<10;i++)s+=a[Math.floor(Math.random()*a.length)];return s;}

/* ------------------------------------------------------------ STATE */
var state={
  tab:"projects", sub:null, loading:true, online:true,
  projects:[], floors:[], plans:[], captures:[], notes:[],
  pid:null, fid:null,
  capId:null, poses:[], pos:0, full:false,
  planMode:null,           // null|cal1|cal2|start|control|route|note
  cal:{p1:null,p2:null},
  draft:null,              // capture import draft
  cmp:{a:null,b:null,split:50},
  share:null               // active share-view payload (read-only)
};
var seeded=false, syncRAF=0;
var sphereV=null, cmpAV=null, cmpBV=null;
var SAMPLE_VIDEO="assets/insta360/office360-full.mp4";
var SAMPLE_PLAN="assets/insta360/office-floorplan-mini.png";

/* ------------------------------------------------------------ HELPERS */
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function fmtDate(d){ if(!d) return ""; var p=String(d).slice(0,10).split("-"); if(p.length<3) return d; var mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return (+p[2])+" "+mo[(+p[1])-1]+" "+p[0]; }
function curProject(){return state.projects.filter(function(p){return p.id===state.pid;})[0]||null;}
function curFloor(){return state.floors.filter(function(f){return f.id===state.fid;})[0]||null;}
function floorsOf(pid){return state.floors.filter(function(f){return f.project_id===pid;});}
function planOf(fid){return state.plans.filter(function(p){return p.floor_id===fid;})[0]||null;}
function capturesOf(fid){return state.captures.filter(function(c){return c.floor_id===fid;});}
function notesOf(fid){return state.notes.filter(function(n){return n.floor_id===fid;});}
function curCapture(){return state.captures.filter(function(c){return c.id===state.capId;})[0]||null;}
function pill(label,t){var m={ok:"ok",warn:"warn",crit:"crit",info:"info"};return '<span class="pill pill--'+(m[t]||"neutral")+'"><span class="pd"></span>'+label+'</span>';}

function toast(msg,kind){
  var t=$("#toast"); if(!t) return;
  t.classList.remove("is-show");
  t.className="toast"+(kind==="warn"?" is-warn":"");
  t.innerHTML='<span class="ti">'+(kind==="warn"?I.bell:I.check)+'</span><span>'+esc(msg)+'</span>';
  void t.offsetHeight; t.classList.add("is-show");
  clearTimeout(t.__h); t.__h=setTimeout(function(){t.classList.remove("is-show");},2800);
}
function sheet(eyebrow,title,body,foot){
  var el=$("#sheet"); el.classList.remove("is-open");
  el.innerHTML='<div class="sheet__grip"></div>'+
    '<div class="sheet__head"><div><div class="eyebrow">'+esc(eyebrow)+'</div><h3>'+esc(title)+'</h3></div><button class="sheet__close" data-act="close-sheet">&times;</button></div>'+
    '<div class="sheet__body">'+body+'</div>'+(foot?'<div class="sheet__foot">'+foot+'</div>':"");
  $("#scrim").classList.add("is-open"); void el.offsetHeight; el.classList.add("is-open");
}
function closeSheet(){$("#sheet").classList.remove("is-open");$("#scrim").classList.remove("is-open");}
function screenHead(title,sub){return '<div class="screen-title h-display">'+title+'</div>'+(sub?'<div class="muted mt-8" style="font-size:13px;margin-bottom:14px">'+sub+'</div>':"");}
function btn(label,act,kind,data){data=data||"";return '<button class="btn '+(kind||"btn--solid")+'" data-act="'+act+'" '+data+'>'+label+'</button>';}

/* ------------------------------------------------------------ DATA LOAD + SEED */
function loadAll(){
  return Promise.all([
    sbGet("/sth_projects?select=*&order=created_at"),
    sbGet("/sth_floors?select=*&order=level"),
    sbGet("/sth_plans?select=*"),
    sbGet("/sth_captures?select=*&order=captured_on.desc"),
    sbGet("/sth_notes?select=*&order=created_at.desc")
  ]).then(function(r){
    state.projects=r[0]||[]; state.floors=r[1]||[]; state.plans=r[2]||[]; state.captures=r[3]||[]; state.notes=r[4]||[];
    if(!state.projects.length && !seeded){ seeded=true; return seedDemo().then(loadAll); }
    if(!state.pid && state.projects.length){ state.pid=state.projects[0].id; }
    if(!state.fid){ var fs=floorsOf(state.pid); if(fs.length) state.fid=fs[0].id; }
    state.loading=false; return true;
  });
}
function loadPoses(capId){
  return sbGet("/sth_poses?select=idx,t_sec,px,py,heading&capture_id=eq."+encodeURIComponent(capId)+"&order=idx").then(function(rows){
    return rows.map(function(r){return {idx:r.idx,t_sec:r.t_sec,px:+r.px,py:+r.py,heading:+r.heading};});
  });
}
function seedDemo(){
  return fetch("assets/insta360/office-trajectory.json").then(function(r){return r.json();}).then(function(traj){
    var pts=traj.points||[];
    // convert recovered (px,py) into plan-display normalized coords (the mini plan is rotated landscape)
    var disp=pts.map(function(p){return {x:1-p.py,y:p.px};});
    function hdg(i){var a=disp[Math.max(0,i-1)],b=disp[Math.min(disp.length-1,i+1)];return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;}
    var ctx={};
    return sbInsert("sth_projects",{name:"HSR Office — Typical Floor",location:"Bengaluru · HSR Layout"})
    .then(function(p){ctx.proj=p;return sbInsert("sth_floors",{project_id:p.id,name:"Typical Floor",level:1});})
    .then(function(f){ctx.fl=f;
      // building 13.97 x 20.07 m across the mini plan footprint -> scale m/px
      var pxw=(traj.planRect.x1-traj.planRect.x0)*1400, pxh=(traj.planRect.y1-traj.planRect.y0)*641;
      var scale=Math.hypot(traj.buildingMetric.w,traj.buildingMetric.d)/Math.hypot(pxw,pxh);
      return sbInsert("sth_plans",{project_id:ctx.proj.id,floor_id:f.id,name:"Typical Floor plan",image_url:SAMPLE_PLAN,width_px:1400,height_px:641,units:"m",scale_m_per_px:+scale.toFixed(5),rotation_deg:0});
    })
    .then(function(pl){ctx.pl=pl;
      return sbInsert("sth_plan_points",{plan_id:pl.id,kind:"start",px:disp[0].x,py:disp[0].y,label:"Lift lobby"});
    })
    .then(function(){
      var dates=[["Baseline walk","2026-06-15"],["Progress walk","2026-06-22"]];
      var chain=Promise.resolve();
      dates.forEach(function(d){ chain=chain.then(function(){
        return sbInsert("sth_captures",{project_id:ctx.proj.id,floor_id:ctx.fl.id,plan_id:ctx.pl.id,label:d[0],captured_on:d[1],video_url:SAMPLE_VIDEO,start_px:disp[0].x,start_py:disp[0].y,start_heading:hdg(0),status:"published",pose_count:pts.length})
        .then(function(cap){
          var rows=pts.map(function(p,i){return {capture_id:cap.id,idx:i,t_sec:(p.f||i/(pts.length-1))*70,px:disp[i].x,py:disp[i].y,heading:hdg(i)};});
          return sbInsertMany("sth_poses",rows);
        });
      });});
      return chain;
    });
  });
}

/* ------------------------------------------------------------ ROUTE / 360 ENGINE */
function trajAt(f){
  var p=state.poses; if(!p||!p.length) return null;
  var x=f*(p.length-1); var i=Math.floor(x); if(i>=p.length-1) return p[p.length-1];
  var t=x-i,a=p[i],b=p[i+1];
  return {px:a.px+(b.px-a.px)*t,py:a.py+(b.py-a.py)*t,heading:a.heading+(b.heading-a.heading)*t};
}
function poseNearest(nx,ny){var p=state.poses;if(!p||!p.length)return 0;var bi=0,bd=1e9;for(var i=0;i<p.length;i++){var dx=p[i].px-nx,dy=p[i].py-ny,d=dx*dx+dy*dy;if(d<bd){bd=d;bi=i;}}return bi;}
/* The VIDEO is the single master clock: while playing, a rAF loop glides the
   map dot + scrubber in lockstep. Teleport (tap the map / arrows) seeks the
   real video and PAUSES at that point; you can still drag to look 360 there,
   and Play resumes the walk. The scrubber pauses while you drag it. */
function paintWalk(f){
  var p=trajAt(f); if(!p) return;
  var dot=$("#walkdot"); if(dot){dot.style.left=(p.px*100)+"%";dot.style.top=(p.py*100)+"%";}
  var l=$("#walklbl"); if(l)l.textContent="walk "+Math.round(f*100)+"%";
  var sc=$("#walkscrub"); if(sc&&!state._scrubbing&&Math.round(+sc.value)!==Math.round(f*1000))sc.value=Math.round(f*1000);
}
function seekTo(f){ f=Math.max(0,Math.min(1,f)); state.pos=f; if(sphereV&&sphereV.video){var d=sphereV.getDuration?sphereV.getDuration():0; if(d){try{sphereV.video.currentTime=f*d;}catch(_){}}} paintWalk(f); }
window.__walk=function(v){ seekTo(Math.max(0,Math.min(1,(+v)/1000))); };
function pausePlayback(){ if(sphereV&&sphereV.video){try{sphereV.video.pause();}catch(_){}} state._playing=false; var b=$('[data-act="walk-play"]'); if(b)b.innerHTML=I.play; }
// teleport: jump to a point on the walk, pause there (still draggable to look 360) until Play
function teleport(f){ pausePlayback(); seekTo(f); }
window.__scrubStart=function(){ state._scrubbing=true; pausePlayback(); };
window.__scrubEnd=function(){ state._scrubbing=false; };
function syncLoop(){
  syncRAF=requestAnimationFrame(syncLoop);
  if(!sphereV) return;
  var v=sphereV.video;
  if(v && v.duration && !v.paused && !v.seeking && !state._scrubbing){ state.pos=v.currentTime/v.duration; paintWalk(state.pos); }
}
function startSync(){ stopSync(); syncLoop(); }
function stopSync(){ if(syncRAF){cancelAnimationFrame(syncRAF);syncRAF=0;} }
function startWalk(){ if(sphereV&&sphereV.video){ sphereV.video.play().catch(function(){}); } state._playing=true; var b=$('[data-act="walk-play"]'); if(b)b.innerHTML=I.pause; }
function stopWalk(){ pausePlayback(); }
function disposeViewers(){ stopSync(); [sphereV,cmpAV,cmpBV].forEach(function(v){if(v){try{v.dispose();}catch(_){}}}); sphereV=cmpAV=cmpBV=null; state._playing=false; state._scrubbing=false; }

function mountSphere(){
  var el=$("#sphere360"),cap=curCapture(); if(!el||!window.__INSTA360||!cap)return;
  if(sphereV){try{sphereV.dispose();}catch(_){}sphereV=null;}
  var isVid=/\.(mp4|mov|webm)$/i.test(cap.video_url||"");
  el.innerHTML='<div class="center muted" style="padding:60px 0;font-size:12px"><span class="spin" style="display:inline-block">'+I.sync+'</span> loading 360 viewer…</div>';
  window.__INSTA360.createSphereViewer(el,{src:cap.video_url,video:isVid,autorotate:false})
    .then(function(v){sphereV=v; seekTo(state.pos); startSync(); state._playing=!!(v.video&&!v.video.paused); var b=$('[data-act="walk-play"]'); if(b)b.innerHTML=state._playing?I.pause:I.play; })
    .catch(function(e){var x=$("#sphere360");if(x)x.innerHTML='<div class="center muted" style="padding:40px 12px;font-size:12px">360 viewer needs three.js (network). '+esc((e&&e.message)||"")+'</div>';});
}

/* ------------------------------------------------------------ MINIMAP (plan + route + dot + notes) */
function minimap(opts){
  opts=opts||{};
  var pl=opts.plan, poses=opts.poses||state.poses, notes=opts.notes||[];
  if(!pl) return "";
  var asp=(pl.width_px&&pl.height_px)?(pl.width_px+"/"+pl.height_px):"1400/641";
  var poly=poses.map(function(p){return (p.px*100).toFixed(2)+","+(p.py*100).toFixed(2);}).join(" ");
  var dots=poses.map(function(p,i){if(i%2&&i!==poses.length-1)return "";return '<span style="position:absolute;left:'+(p.px*100)+'%;top:'+(p.py*100)+'%;width:7px;height:7px;border-radius:50%;border:1.5px solid #fff;background:var(--accent);opacity:.45;transform:translate(-50%,-50%);pointer-events:none;z-index:2"></span>';}).join("");
  var npins=notes.map(function(n,k){if(n.px==null)return "";var col=n.type==="issue"||n.type==="safety"?"var(--accent)":n.type==="punch"?"var(--warn)":"var(--info)";return '<button data-act="note-open" data-id="'+n.id+'" style="position:absolute;left:'+(n.px*100)+'%;top:'+(n.py*100)+'%;transform:translate(-50%,-100%);z-index:4;border:none;background:none;cursor:pointer;padding:0"><span style="display:flex;width:16px;height:16px;border-radius:50% 50% 50% 0;transform:rotate(45deg);background:'+col+';border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);align-items:center;justify-content:center"><b style="transform:rotate(-45deg);color:#fff;font-size:9px">!</b></span></button>';}).join("");
  var cur=trajAt(state.pos)||poses[0]||{px:.5,py:.5,heading:0};
  var dot=opts.live?('<div id="walkdot" style="position:absolute;left:'+(cur.px*100)+'%;top:'+(cur.py*100)+'%;transform:translate(-50%,-50%);z-index:5;pointer-events:none">'+
      '<span style="position:absolute;left:50%;top:50%;width:15px;height:15px;border-radius:50%;background:var(--accent);border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);transform:translate(-50%,-50%)"></span></div>'):"";
  var start=opts.startPt?('<div style="position:absolute;left:'+(opts.startPt.px*100)+'%;top:'+(opts.startPt.py*100)+'%;transform:translate(-50%,-50%);z-index:3"><span style="display:block;width:10px;height:10px;border-radius:50%;background:var(--ok);border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.3)"></span></div>'):"";
  return '<div id="walkmap" data-act="'+(opts.tap||(opts.live?"map-seek":""))+'" style="position:relative;width:100%;aspect-ratio:'+asp+';border-radius:12px;overflow:hidden;border:1px solid var(--hair-2);background:#f4efe4;'+((opts.tap||opts.live)?"cursor:crosshair":"")+'">'+
    '<img src="'+esc(pl.image_url)+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain" draggable="false"/>'+
    (poly?'<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;z-index:1"><polyline points="'+poly+'" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-opacity=".85" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>':"")+
    dots+npins+start+dot+
    (opts.cap?'<span class="mono" style="position:absolute;bottom:5px;left:8px;font-size:8.5px;color:var(--ink-3);background:rgba(247,242,233,.82);padding:1px 6px;border-radius:10px;z-index:6">'+opts.cap+'</span>':"")+
  '</div>';
}

/* ------------------------------------------------------------ VIEW: PROJECTS */
function projectsView(){
  if(state.loading) return '<div class="center muted" style="padding:80px 0"><span class="spin" style="display:inline-block">'+I.sync+'</span> loading…</div>';
  var h=screenHead("Projects","Walk a property once — retrieve it by place & date.");
  var add='<button class="btn btn--ghost" data-act="new-project">'+I.plus+' New project</button>';
  var list=state.projects.map(function(p){
    var fs=floorsOf(p.id), caps=state.captures.filter(function(c){return c.project_id===p.id;});
    var open=p.id===state.pid;
    var head='<div class="lrow" data-act="pick-project" data-id="'+p.id+'" style="margin:0"><div class="lrow__ic" style="background:var(--accent-wash);color:var(--accent)">'+I.proj+'</div>'+
      '<div class="lrow__tx"><b>'+esc(p.name)+'</b><span>'+esc(p.location||"")+' · '+fs.length+' floor'+(fs.length!==1?"s":"")+' · '+caps.length+' capture'+(caps.length!==1?"s":"")+'</span></div>'+
      '<div class="lrow__rt"><span class="lrow__chev" style="transform:rotate('+(open?90:0)+'deg)">'+I.chev+'</span></div></div>';
    var floors=open?('<div style="margin:8px 0 4px 8px;border-left:2px solid var(--hair-2);padding-left:10px">'+
      fs.map(function(f){var on=f.id===state.fid;var cc=capturesOf(f.id).length;var pl=planOf(f.id);
        return '<div class="lrow" data-act="pick-floor" data-id="'+f.id+'" style="margin:0 0 6px"><div class="lrow__ic" style="background:'+(on?"var(--accent)":"var(--paper-3)")+';color:'+(on?"#fff":"var(--ink-3)")+';border-radius:6px">'+I.plan+'</div>'+
        '<div class="lrow__tx"><b>'+esc(f.name)+'</b><span>'+(pl?(pl.scale_m_per_px?"calibrated":"plan uploaded"):"no plan")+' · '+cc+' capture'+(cc!==1?"s":"")+'</span></div>'+
        '<div class="lrow__rt"><span class="lrow__chev">'+I.chev+'</span></div></div>';
      }).join("")+
      '<button class="chipbtn" data-act="new-floor" data-id="'+p.id+'">'+I.plus+' Add floor</button></div>'):"";
    return '<div class="card" style="padding:12px">'+head+floors+'</div>';
  }).join("");
  return h+'<div style="margin-bottom:14px">'+add+'</div>'+(list||'<div class="muted" style="font-size:12.5px">No projects yet — create one to begin.</div>');
}

/* ------------------------------------------------------------ VIEW: PLAN */
function planView(){
  if(state.sub==="review") return reviewView();
  if(state.sub==="compare") return compareView();
  var proj=curProject(), fl=curFloor();
  if(!proj||!fl) return screenHead("Floor plan","")+'<div class="muted" style="font-size:12.5px">Pick a project & floor on the Projects tab first.</div>'+'<button class="btn btn--ghost mt-14" data-act="goto-projects">'+I.back+' Projects</button>';
  var pl=planOf(fl.id);
  var head='<div class="row-between"><div class="eyebrow">'+esc(proj.name)+'</div><span class="mono" style="font-size:10px;color:var(--ink-3)">'+esc(fl.name)+'</span></div>'+
    '<div class="screen-title h-display" style="font-size:24px;margin-top:4px">Floor plan</div>';

  if(!pl){
    return head+'<div class="muted mt-8" style="font-size:12.5px;margin-bottom:14px">Upload this floor’s 2D plan (SVG, PNG or PDF export), then calibrate its scale.</div>'+
      '<button class="btn btn--solid" data-act="upload-plan">'+I.upload+' Upload floor plan</button>';
  }

  // calibration in progress
  if(state.planMode==="cal1"||state.planMode==="cal2"){
    var c=state.cal;
    var overlay=(c.p1?'<div style="position:absolute;left:'+(c.p1.x*100)+'%;top:'+(c.p1.y*100)+'%;transform:translate(-50%,-50%);z-index:4"><span style="display:block;width:12px;height:12px;border-radius:50%;background:var(--info);border:2px solid #fff"></span></div>':"")+
                (c.p2?'<div style="position:absolute;left:'+(c.p2.x*100)+'%;top:'+(c.p2.y*100)+'%;transform:translate(-50%,-50%);z-index:4"><span style="display:block;width:12px;height:12px;border-radius:50%;background:var(--info);border:2px solid #fff"></span></div>':"")+
                ((c.p1&&c.p2)?'<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;z-index:3"><line x1="'+(c.p1.x*100)+'" y1="'+(c.p1.y*100)+'" x2="'+(c.p2.x*100)+'" y2="'+(c.p2.y*100)+'" stroke="var(--info)" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg>':"");
    return head+'<div class="muted mt-8" style="font-size:12.5px;margin-bottom:10px">'+I.ruler+' Tap <b>two points</b> a known distance apart (a wall, a door, a grid line), then enter the real-world distance.</div>'+
      '<div id="planwrap" data-act="plan-tap" style="position:relative;width:100%;aspect-ratio:'+(pl.width_px+"/"+pl.height_px)+';border-radius:12px;overflow:hidden;border:1px solid var(--hair-2);background:#f4efe4;cursor:crosshair"><img src="'+esc(pl.image_url)+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain" draggable="false"/>'+overlay+'</div>'+
      '<div class="row-between mt-14"><button class="btn btn--ghost" data-act="cal-cancel" style="flex:0 0 46%">Cancel</button>'+
      (c.p1&&c.p2?'<button class="btn btn--solid" data-act="cal-dist">Enter distance '+I.chev+'</button>':'<button class="btn btn--solid" disabled>Tap '+(c.p1?"2nd":"1st")+' point</button>')+'</div>';
  }
  // start-point / control placement
  if(state.planMode==="start"||state.planMode==="control"){
    var pts=planPointsCache[pl.id]||[];
    var startPt=pts.filter(function(x){return x.kind==="start";})[0];
    return head+'<div class="muted mt-8" style="font-size:12.5px;margin-bottom:10px">'+I.pin+' Tap the plan to place the <b>'+(state.planMode==="start"?"start point":"control point")+'</b>.</div>'+
      minimap({plan:pl,poses:[],startPt:startPt?{px:startPt.px,py:startPt.py}:null,tap:"plan-tap"})+
      '<button class="btn btn--ghost mt-14" data-act="plan-mode-cancel">Done</button>';
  }

  // normal calibrated/uncalibrated plan
  var caps=capturesOf(fl.id);
  var pts2=planPointsCache[pl.id]||[];
  var startPt=pts2.filter(function(x){return x.kind==="start";})[0];
  var lastCap=caps[0];
  var poses=lastCap&&routeCache[lastCap.id]?routeCache[lastCap.id]:[];
  var scaleLine=pl.scale_m_per_px?('<span style="color:var(--ok)">'+I.check+' Calibrated</span> · 1px = '+(pl.scale_m_per_px).toFixed(4)+' m'+(pl.width_px?(' · '+(pl.width_px*pl.scale_m_per_px).toFixed(1)+' × '+(pl.height_px*pl.scale_m_per_px).toFixed(1)+' m'):"")):('<span style="color:var(--warn)">Not calibrated</span>');
  var map=minimap({plan:pl,poses:poses,notes:notesOf(fl.id),startPt:startPt?{px:startPt.px,py:startPt.py}:null,cap:poses.length?(poses.length+" poses · "+(lastCap?esc(lastCap.label):"")):null});
  var tools='<div class="seg" style="margin-top:12px">'+
    '<button data-act="upload-plan">'+I.upload+' Replace</button>'+
    '<button data-act="calibrate">'+I.ruler+' Calibrate</button>'+
    '<button data-act="set-start">'+I.pin+' Start</button>'+
    '</div>';
  var capList='<div class="section-label" style="margin-top:18px"><h3>Captures on this floor</h3><span class="more" data-act="new-capture">'+I.plus+' New</span></div>'+
    (caps.length?caps.map(function(c){
      return '<div class="lrow" data-act="open-capture" data-id="'+c.id+'" style="margin:0 0 8px"><div class="lrow__ic" style="background:#5B6E4A;color:#fff;border-radius:6px">'+I.cap+'</div>'+
        '<div class="lrow__tx"><b>'+esc(c.label)+'</b><span>'+fmtDate(c.captured_on)+' · '+(c.pose_count||0)+' poses</span></div>'+
        '<div class="lrow__rt">'+pill(c.status==="published"?"Ready":c.status,c.status==="published"?"ok":"warn")+'<span class="lrow__chev">'+I.chev+'</span></div></div>';
    }).join(""):'<div class="muted" style="font-size:12px">No captures yet — import a 360 walk.</div>');
  return head+'<div class="muted mt-8 mono" style="font-size:10.5px;margin-bottom:10px">'+scaleLine+'</div>'+map+tools+capList;
}
var planPointsCache={}, routeCache={};

/* ------------------------------------------------------------ VIEW: REVIEW (360 + route) */
function reviewView(){
  var cap=curCapture(), fl=curFloor(), pl=fl?planOf(fl.id):null;
  if(!cap||!pl) return planView();
  var hgt=state.full?"64vh":"290px";
  var view='<button class="backlink" data-act="review-close">'+I.back+' Floor plan</button>'+
    '<div class="row-between"><div class="screen-title h-display" style="font-size:21px">'+esc(cap.label)+'</div><span class="mono" style="font-size:10px;color:var(--ink-3)">'+fmtDate(cap.captured_on)+'</span></div>'+
    '<div style="position:relative;width:100%;height:'+hgt+';border-radius:14px;overflow:hidden;background:#15130f;margin-top:8px">'+
      '<div id="sphere360" style="position:absolute;inset:0"></div>'+
      '<span class="mono" style="position:absolute;top:9px;left:10px;font-size:9px;letter-spacing:.1em;color:#fff;background:rgba(0,0,0,.5);padding:3px 8px;border-radius:20px;z-index:6">360° AS-BUILT</span>'+
      '<div style="position:absolute;top:8px;right:10px;display:flex;gap:6px;z-index:7">'+
        tbBtn("walk-play",state._playing?I.pause:I.play,"Play")+tbBtn("note-here",I.note,"Note")+tbBtn("view-full",I.layers,"Expand")+'</div>'+
      '<button data-act="pose-step" data-d="-1" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);z-index:5;width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,.82);color:#1c1a17;font-size:21px;display:flex;align-items:center;justify-content:center;cursor:pointer">‹</button>'+
      '<button data-act="pose-step" data-d="1" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:5;width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,.82);color:#1c1a17;font-size:21px;display:flex;align-items:center;justify-content:center;cursor:pointer">›</button>'+
      '<div style="position:absolute;left:12px;right:12px;bottom:9px;z-index:5"><input id="walkscrub" type="range" min="0" max="1000" value="'+Math.round(state.pos*1000)+'" style="width:100%;accent-color:var(--accent)" oninput="__walk(this.value)" onpointerdown="__scrubStart()" onpointerup="__scrubEnd()" onchange="__scrubEnd()"/>'+
        '<div class="row-between mono" style="font-size:9px;color:#fff"><span style="opacity:.7">START</span><span id="walklbl" style="text-shadow:0 1px 2px rgba(0,0,0,.7)">walk '+Math.round(state.pos*100)+'%</span><span style="opacity:.7">END</span></div></div>'+
    '</div>'+
    '<div style="height:10px"></div>'+
    minimap({plan:pl,poses:state.poses,notes:notesOf(fl.id),live:true,cap:state.poses.length+" poses · tap anywhere to teleport"})+
    '<div class="seg" style="margin-top:12px">'+
      '<button data-act="compare-dates">'+I.layers+' Compare dates</button>'+
      '<button data-act="share-capture">'+I.share+' Share</button>'+
      '<button data-act="export-capture">'+I.dl+' Export</button>'+
    '</div>';
  return view;
}
function tbBtn(act,ic,t){return '<button data-act="'+act+'" title="'+t+'" style="width:33px;height:33px;border-radius:8px;border:none;background:rgba(20,18,15,.6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer">'+ic+'</button>';}

/* ------------------------------------------------------------ VIEW: COMPARE TWO DATES */
function compareView(){
  var fl=curFloor(); var caps=capturesOf(fl.id);
  if(caps.length<2) return '<button class="backlink" data-act="review-close">'+I.back+' Back</button><div class="muted" style="font-size:12.5px;margin-top:14px">Need at least two captures on this floor to compare dates.</div>';
  var A=state.cmp.a||caps[0].id, B=state.cmp.b||caps[1].id; state.cmp.a=A; state.cmp.b=B;
  var capA=caps.filter(function(c){return c.id===A;})[0], capB=caps.filter(function(c){return c.id===B;})[0];
  var sp=state.cmp.split;
  function opts(sel){return caps.map(function(c){return '<option value="'+c.id+'"'+(c.id===sel?" selected":"")+'>'+esc(c.label)+' · '+fmtDate(c.captured_on)+'</option>';}).join("");}
  return '<button class="backlink" data-act="compare-back">'+I.back+' Back to walk</button>'+
    '<div class="screen-title h-display" style="font-size:21px;margin:4px 0 4px">Compare dates</div>'+
    '<div class="muted" style="font-size:11.5px;margin-bottom:10px">Same location, two dates. Drag the divider to wipe between them.</div>'+
    '<div class="row-between" style="gap:8px;margin-bottom:10px">'+
      '<select data-act="cmp-a" style="flex:1;font-size:11px;padding:6px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2)">'+opts(A)+'</select>'+
      '<select data-act="cmp-b" style="flex:1;font-size:11px;padding:6px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2)">'+opts(B)+'</select>'+
    '</div>'+
    '<div id="cmpsplit" style="position:relative;width:100%;height:300px;border-radius:14px;overflow:hidden;background:#15130f;user-select:none;touch-action:none">'+
      '<div id="cmpB" style="position:absolute;inset:0"></div>'+
      '<div id="cmpA" style="position:absolute;inset:0;clip-path:inset(0 '+(100-sp)+'% 0 0)"></div>'+
      '<div id="cmpDiv" style="position:absolute;top:0;bottom:0;left:'+sp+'%;width:2px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);cursor:ew-resize;z-index:5"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:#fff;color:#7a2230;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.45);font-size:15px;font-weight:700">&#8646;</div></div>'+
      '<span style="position:absolute;top:8px;left:10px;font-family:var(--f-mono);font-size:9px;color:#fff;background:rgba(0,0,0,.5);padding:3px 8px;border-radius:20px;z-index:6">'+esc(fmtDate(capA.captured_on))+'</span>'+
      '<span style="position:absolute;top:8px;right:10px;font-family:var(--f-mono);font-size:9px;color:#fff;background:rgba(122,34,48,.78);padding:3px 8px;border-radius:20px;z-index:6">'+esc(fmtDate(capB.captured_on))+'</span>'+
    '</div>'+
    '<div class="muted mono" style="font-size:10px;margin-top:8px;text-align:center;color:var(--ink-3)">'+esc(capA.label)+'  ↔  '+esc(capB.label)+'</div>';
}
function mountCompare(){
  var box=$("#cmpsplit"); if(!box||!window.__INSTA360) return;
  var a=$("#cmpA"),b=$("#cmpB"); var fl=curFloor(); var caps=capturesOf(fl.id);
  var capA=caps.filter(function(c){return c.id===state.cmp.a;})[0], capB=caps.filter(function(c){return c.id===state.cmp.b;})[0];
  if(cmpAV){try{cmpAV.dispose();}catch(_){}cmpAV=null;} if(cmpBV){try{cmpBV.dispose();}catch(_){}cmpBV=null;}
  if(capA){a.innerHTML='';window.__INSTA360.createSphereViewer(a,{src:capA.video_url,video:/\.(mp4|mov|webm)$/i.test(capA.video_url),autorotate:true}).then(function(v){cmpAV=v;}).catch(function(){});}
  if(capB){b.innerHTML='';window.__INSTA360.createSphereViewer(b,{src:capB.video_url,video:/\.(mp4|mov|webm)$/i.test(capB.video_url),autorotate:true}).then(function(v){cmpBV=v;}).catch(function(){});}
  var div=$("#cmpDiv");
  if(div&&!div.__wired){div.__wired=true;
    function setP(p){p=Math.max(4,Math.min(96,p));state.cmp.split=p;div.style.left=p+"%";a.style.clipPath="inset(0 "+(100-p)+"% 0 0)";}
    function move(e){var r=box.getBoundingClientRect();var x=(e.touches?e.touches[0]:e).clientX;setP((x-r.left)/r.width*100);if(e.cancelable)e.preventDefault();}
    function end(){document.removeEventListener("mousemove",move);document.removeEventListener("touchmove",move);document.removeEventListener("mouseup",end);document.removeEventListener("touchend",end);}
    function start(e){e.preventDefault();e.stopPropagation();document.addEventListener("mousemove",move);document.addEventListener("touchmove",move,{passive:false});document.addEventListener("mouseup",end);document.addEventListener("touchend",end);}
    div.addEventListener("mousedown",start);div.addEventListener("touchstart",start,{passive:false});
  }
}

/* ------------------------------------------------------------ VIEW: CAPTURE (import walk) */
function captureView(){
  var fl=curFloor(), pl=fl?planOf(fl.id):null;
  if(!fl) return screenHead("New capture","")+'<div class="muted" style="font-size:12.5px">Pick a project & floor first.</div>'+'<button class="btn btn--ghost mt-14" data-act="goto-projects">'+I.back+' Projects</button>';
  if(!pl) return screenHead("New capture","")+'<div class="muted" style="font-size:12.5px">Upload & calibrate this floor’s plan first.</div>'+'<button class="btn btn--ghost mt-14" data-act="goto-plan">'+I.back+' Floor plan</button>';
  var d=state.draft;
  var head='<div class="eyebrow">'+esc(curProject().name)+' · '+esc(fl.name)+'</div><div class="screen-title h-display" style="font-size:23px;margin-top:4px">Import a 360 walk</div>';
  if(!d){
    return head+'<div class="muted mt-8" style="font-size:12.5px;margin-bottom:14px">Record on the Insta360, export an equirectangular .mp4 from Insta360 Studio, then import it here. Or load the sample office walk.</div>'+
      '<button class="btn btn--solid" data-act="cap-import">'+I.upload+' Import 360 video / photo</button>'+
      '<button class="btn btn--ghost mt-8" data-act="cap-sample">'+I.play+' Use sample walkthrough</button>'+
      '<div class="muted mono" style="font-size:10px;margin-top:12px;line-height:1.5">Assisted localization: you mark the start point and trace the route on the plan. Automatic visual-odometry route recovery is a later phase — see roadmap.</div>';
  }
  // wizard: 1 start, 2 route, 3 label+save
  var pts=d.route||[];
  var startMk=d.start?'<div style="position:absolute;left:'+(d.start.x*100)+'%;top:'+(d.start.y*100)+'%;transform:translate(-50%,-50%);z-index:4"><span style="display:block;width:12px;height:12px;border-radius:50%;background:var(--ok);border:2px solid #fff"></span></div>':"";
  var routeMk=pts.length?('<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;z-index:2"><polyline points="'+pts.map(function(p){return (p.x*100)+","+(p.y*100);}).join(" ")+'" fill="none" stroke="var(--accent)" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>'+pts.map(function(p){return '<div style="position:absolute;left:'+(p.x*100)+'%;top:'+(p.y*100)+'%;transform:translate(-50%,-50%);z-index:3"><span style="display:block;width:8px;height:8px;border-radius:50%;background:var(--accent);border:1.5px solid #fff"></span></div>';}).join("")):"";
  var step=d.step||1;
  var hint=step===1?(I.pin+' Tap where you <b>started</b> the walk.'):step===2?(I.cap+' Tap along the corridor to <b>trace your route</b> ('+pts.length+' points — min 2).'):'Name the capture & save.';
  var canvas='<div id="planwrap" data-act="cap-tap" style="position:relative;width:100%;aspect-ratio:'+(pl.width_px+"/"+pl.height_px)+';border-radius:12px;overflow:hidden;border:1px solid var(--hair-2);background:#f4efe4;cursor:crosshair;margin-top:8px"><img src="'+esc(pl.image_url)+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain" draggable="false"/>'+startMk+routeMk+'</div>';
  var foot;
  if(step===1) foot='<div class="row-between mt-14"><button class="btn btn--ghost" data-act="cap-discard" style="flex:0 0 46%">Discard</button>'+(d.start?'<button class="btn btn--solid" data-act="cap-step" data-s="2">Trace route '+I.chev+'</button>':'<button class="btn btn--solid" disabled>Tap start</button>')+'</div>';
  else if(step===2) foot='<div class="row-between mt-14"><button class="btn btn--ghost" data-act="cap-step" data-s="1" style="flex:0 0 46%">'+I.back+' Back</button>'+(pts.length>=2?'<button class="btn btn--solid" data-act="cap-step" data-s="3">Name & save '+I.chev+'</button>':'<button class="btn btn--solid" disabled>Trace route</button>')+'</div>'+(pts.length?'<button class="chipbtn mt-8" data-act="cap-undo">'+I.x+' Undo last point</button>':'');
  else foot='';
  var meta='<div class="muted mono" style="font-size:10px;margin-top:8px">Loaded: '+esc(d.name)+' · '+(d.kind==="video"?"video":"photo")+'</div>';
  if(step===3){
    return head+meta+'<div class="card mt-14"><label class="eyebrow" style="display:block;margin-bottom:6px">Capture label</label><input id="capLabel" value="'+esc(d.label||("Walk · "+fmtDate(new Date().toISOString())))+'" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px"/>'+
      '<label class="eyebrow" style="display:block;margin:12px 0 6px">Date</label><input id="capDate" type="date" value="'+(new Date().toISOString().slice(0,10))+'" style="width:100%;padding:9px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px"/></div>'+
      '<div class="muted mono" style="font-size:10px;margin-top:8px">'+pts.length+' route points → interpolated to a localized track. Start + heading from your trace.</div>'+
      '<div class="row-between mt-14"><button class="btn btn--ghost" data-act="cap-step" data-s="2" style="flex:0 0 46%">'+I.back+' Back</button><button class="btn btn--solid" data-act="cap-save">'+I.check+' Process &amp; save</button></div>';
  }
  return head+meta+'<div class="muted mt-8" style="font-size:12.5px">'+hint+'</div>'+canvas+foot;
}

/* ------------------------------------------------------------ VIEW: NOTES */
function notesView(){
  var fl=curFloor();
  var head=screenHead("Field notes",fl?(esc(curProject().name)+" · "+esc(fl.name)):"");
  if(!fl) return head+'<div class="muted" style="font-size:12.5px">Pick a project & floor first.</div>';
  var ns=notesOf(fl.id);
  var add='<button class="btn btn--ghost" data-act="note-new">'+I.plus+' New note</button>';
  var TYPE={issue:"crit",safety:"crit",punch:"warn",rfi:"info",observation:"info",general:"info"};
  var list=ns.length?ns.map(function(n){
    return '<div class="card" style="padding:12px" data-act="note-open" data-id="'+n.id+'"><div class="card__head"><div><div class="card__title" style="font-size:13.5px">'+esc(n.title||"(untitled)")+'</div>'+
      '<div class="card__sub" style="margin-top:3px">'+esc((n.type||"note").toUpperCase())+(n.assignee?(' · '+esc(n.assignee)):"")+(n.px!=null?" · pinned":"")+'</div></div>'+pill(n.status==="closed"?"Closed":"Open",n.status==="closed"?"ok":(TYPE[n.type]||"info"))+'</div>'+
      (n.body?'<div class="card__sub" style="margin-top:6px">'+esc(n.body)+'</div>':"")+'</div>';
  }).join(""):'<div class="muted" style="font-size:12px">No notes yet. Open a capture and drop a note on the plan, or add one here.</div>';
  return head+'<div style="margin-bottom:14px">'+add+'</div>'+list;
}

/* ------------------------------------------------------------ SHARE READ-ONLY VIEW */
function shareView(){
  var s=state.share;
  if(s==="loading") return '<div class="center muted" style="padding:80px 0"><span class="spin" style="display:inline-block">'+I.sync+'</span> opening shared capture…</div>';
  if(s==="expired") return '<div style="padding:40px 16px;text-align:center"><div class="screen-title h-display">Link expired</div><div class="muted mt-8" style="font-size:13px">This shared view is no longer available.</div></div>';
  if(s==="bad") return '<div style="padding:40px 16px;text-align:center"><div class="screen-title h-display">Not found</div><div class="muted mt-8" style="font-size:13px">This share link is invalid.</div></div>';
  if(!s||!s.cap) return "";
  var cap=s.cap, pl=s.plan;
  return '<div class="eyebrow">Shared view · read-only</div><div class="screen-title h-display" style="font-size:21px;margin-top:4px">'+esc(cap.label)+'</div>'+
    '<div class="muted mono" style="font-size:10px;margin:4px 0 8px">'+fmtDate(cap.captured_on)+' · expires '+fmtDate(s.expires)+'</div>'+
    '<div style="position:relative;width:100%;height:290px;border-radius:14px;overflow:hidden;background:#15130f">'+
      '<div id="sphere360" style="position:absolute;inset:0"></div>'+
      '<button data-act="pose-step" data-d="-1" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);z-index:5;width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,.82);font-size:20px;cursor:pointer">‹</button>'+
      '<button data-act="pose-step" data-d="1" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:5;width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,.82);font-size:20px;cursor:pointer">›</button>'+
      '<div style="position:absolute;left:12px;right:12px;bottom:9px;z-index:5"><input id="walkscrub" type="range" min="0" max="1000" value="'+Math.round(state.pos*1000)+'" style="width:100%;accent-color:var(--accent)" oninput="__walk(this.value)" onpointerdown="__scrubStart()" onpointerup="__scrubEnd()" onchange="__scrubEnd()"/></div>'+
    '</div><div style="height:10px"></div>'+
    minimap({plan:pl,poses:state.poses,live:true,cap:state.poses.length+" poses"});
}

/* ------------------------------------------------------------ RENDER */
var VIEWS={projects:projectsView,plan:planView,capture:captureView,notes:notesView};
var TABS=[["projects","Projects","proj"],["plan","Plan","plan"],["capture","Capture","cap"],["notes","Notes","note"]];
function buildTabbar(){
  if(state.share){$("#tabbar").innerHTML="";return;}
  $("#tabbar").innerHTML=TABS.map(function(t){
    var cap=t[0]==="capture";
    return '<button class="tab '+(cap?"tab--cap ":"")+(state.tab===t[0]?"is-active":"")+'" data-tab="'+t[0]+'"><span class="ti">'+(I[t[2]]||"")+'</span><span>'+t[1]+'</span></button>';
  }).join("");
}
function buildAppbar(){
  var p=curProject();
  $("#appProj").textContent=p?p.name:"Sthyra";
  $("#appMeta").textContent=p?(p.location||""):"Reality capture";
  var sbar=$("#syncbar");
  sbar.className="syncbar is-online";
  sbar.innerHTML='<span class="statusdot"></span><span>'+(state.share?"Shared view":"Reality capture")+'</span><span class="grow"></span><span class="mono" style="font-size:10px;opacity:.8">'+(backendLive?"Supabase ✓":"…")+'</span>';
  var bd=$("#bellDot"); if(bd) bd.textContent="";
}
function render(){
  buildAppbar(); buildTabbar();
  var html = state.share ? shareView() : (VIEWS[state.tab]||projectsView)();
  $("#screen").innerHTML=html;
  // post-mount viewers
  if($("#cmpsplit")){ disposeViewers(); mountCompare(); }
  else if($("#sphere360")){ disposeViewers(); mountSphere(); }
  else { disposeViewers(); }
  $("#screen").scrollTop=0;
}
function nav(tab,sub){state.tab=tab;state.sub=sub||null;render();}

/* ------------------------------------------------------------ INTERACTIONS */
function relCoords(el,e){var r=el.getBoundingClientRect();var cx=(e.touches?e.touches[0]:e).clientX,cy=(e.touches?e.touches[0]:e).clientY;return {x:Math.max(0,Math.min(1,(cx-r.left)/r.width)),y:Math.max(0,Math.min(1,(cy-r.top)/r.height))};}
function onMapSeek(el,e){ var map=$("#walkmap"); if(!map||!state.poses.length) return; var c=relCoords(map,e); var i=poseNearest(c.x,c.y); teleport(state.poses.length>1?i/(state.poses.length-1):0); }
function pickFile(accept,cb){var inp=document.createElement("input");inp.type="file";inp.accept=accept;inp.style.cssText="position:fixed;left:-9999px;opacity:0";document.body.appendChild(inp);inp.addEventListener("change",function(){var f=inp.files&&inp.files[0];try{document.body.removeChild(inp);}catch(_){}if(f)cb(f);});inp.click();}

function ensureRoute(capId){
  if(routeCache[capId]) return Promise.resolve(routeCache[capId]);
  return loadPoses(capId).then(function(p){routeCache[capId]=p;return p;});
}
function ensurePlanPoints(planId){
  if(planPointsCache[planId]) return Promise.resolve(planPointsCache[planId]);
  return sbGet("/sth_plan_points?select=*&plan_id=eq."+encodeURIComponent(planId)).then(function(r){planPointsCache[planId]=r||[];return r;});
}

function openCapture(id){
  state.capId=id; state.pos=0; state.sub="review";
  ensureRoute(id).then(function(p){state.poses=p||[];render();});
  nav("plan","review");
}

function onClick(e){
  var t=e.target;
  var tab=t.closest("[data-tab]");
  var go=t.closest("[data-go]");
  var act=t.closest("[data-act]");
  if(tab){ if(state.share) return; state.sub=null; nav(tab.dataset.tab,null); return; }
  if(go&&!act){ return; }
  if(!act) return;
  var a=act.dataset.act, id=act.dataset.id;
  switch(a){
    case "close-sheet": closeSheet(); break;
    case "goto-projects": nav("projects",null); break;
    case "goto-plan": nav("plan",null); break;

    /* projects */
    case "new-project": sheetNewProject(); break;
    case "pick-project": state.pid=id; var fs=floorsOf(id); state.fid=fs.length?fs[0].id:null; render(); break;
    case "pick-floor": state.fid=id; var pl=planOf(id); if(pl) ensurePlanPoints(pl.id).then(function(){var c=capturesOf(id)[0];if(c)ensureRoute(c.id).then(function(){nav("plan",null);});else nav("plan",null);}); else nav("plan",null); break;
    case "new-floor": sheetNewFloor(id); break;

    /* plan tools */
    case "upload-plan": doUploadPlan(); break;
    case "calibrate": state.planMode="cal1"; state.cal={p1:null,p2:null}; render(); break;
    case "cal-cancel": state.planMode=null; state.cal={p1:null,p2:null}; render(); break;
    case "cal-dist": sheetCalDistance(); break;
    case "set-start": state.planMode="start"; render(); break;
    case "plan-mode-cancel": state.planMode=null; render(); break;
    case "plan-tap": onPlanTap(act,e); break;

    /* captures */
    case "new-capture": case "goto-capture": nav("capture",null); break;
    case "open-capture": openCapture(id); break;
    case "review-close": state.sub=null; state.cmp={a:null,b:null,split:50}; nav("plan",null); break;
    case "compare-back": state.cmp={a:null,b:null,split:50}; state.sub="review"; nav("plan","review"); break;
    case "pose-go": var pi=+act.dataset.i; teleport(state.poses.length>1?pi/(state.poses.length-1):0); break;
    case "pose-step": var dd=+act.dataset.d; var n=state.poses.length||1; var cur=Math.round(state.pos*(n-1)); cur=Math.max(0,Math.min(n-1,cur+dd)); teleport((n>1)?cur/(n-1):0); break;
    case "map-seek": onMapSeek(act,e); break;
    case "walk-play": state._playing?stopWalk():startWalk(); break;
    case "view-full": state.full=!state.full; render(); break;

    /* compare / share / export */
    case "compare-dates": state.sub="compare"; nav("plan","compare"); break;
    case "cmp-a": break; case "cmp-b": break;
    case "share-capture": doShare(); break;
    case "export-capture": doExport(); break;

    /* capture import wizard */
    case "cap-import": pickFile("video/*,image/*,.mp4,.mov,.jpg,.jpeg,.png",function(f){ startDraft(f); }); break;
    case "cap-sample": startDraftSample(); break;
    case "cap-tap": onCapTap(act,e); break;
    case "cap-step": state.draft.step=+act.dataset.s; render(); break;
    case "cap-undo": state.draft.route.pop(); render(); break;
    case "cap-discard": state.draft=null; render(); break;
    case "cap-save": doSaveCapture(); break;

    /* notes */
    case "note-new": sheetNote(null); break;
    case "note-here": sheetNote({fromReview:true}); break;
    case "note-open": sheetNoteView(id); break;
    case "note-close": doCloseNote(id); break;
    case "note-edit": sheetNoteEdit(id); break;
    case "note-del": sheetNoteDelete(id); break;
  }
}
function onChange(e){
  var sel=e.target.closest('select[data-act="cmp-a"],select[data-act="cmp-b"]');
  if(sel){ if(sel.dataset.act==="cmp-a")state.cmp.a=sel.value; else state.cmp.b=sel.value; render(); }
}

/* ---- plan taps ---- */
function onPlanTap(el,e){
  var c=relCoords($("#planwrap")||$("#walkmap")||el,e);
  var pl=planOf(state.fid); if(!pl) return;
  if(state.planMode==="cal1"){ state.cal.p1=c; state.planMode="cal2"; render(); }
  else if(state.planMode==="cal2"){ state.cal.p2=c; render(); }
  else if(state.planMode==="start"){ saveStartPoint(pl,c); }
  else if(state.planMode==="control"){ savePlanPoint(pl,"control",c); }
}
function saveStartPoint(pl,c){
  var existing=(planPointsCache[pl.id]||[]).filter(function(x){return x.kind==="start";})[0];
  var p=existing?sbPatch("sth_plan_points",existing.id,{px:c.x,py:c.y}):sbInsert("sth_plan_points",{plan_id:pl.id,kind:"start",px:c.x,py:c.y,label:"Start"});
  p.then(function(){return ensurePlanPointsFresh(pl.id);}).then(function(){state.planMode=null;toast("Start point saved");render();});
}
function savePlanPoint(pl,kind,c){sbInsert("sth_plan_points",{plan_id:pl.id,kind:kind,px:c.x,py:c.y}).then(function(){return ensurePlanPointsFresh(pl.id);}).then(function(){toast("Control point added");render();});}
function ensurePlanPointsFresh(planId){return sbGet("/sth_plan_points?select=*&plan_id=eq."+encodeURIComponent(planId)).then(function(r){planPointsCache[planId]=r||[];return r;});}

/* ---- calibration ---- */
function sheetCalDistance(){
  sheet("Calibrate scale","Real-world distance",
    '<div class="muted" style="font-size:12.5px;margin-bottom:10px">Enter the true distance between the two points you tapped.</div>'+
    '<div class="row-between" style="gap:8px;align-items:center"><input id="calVal" type="number" step="0.01" placeholder="e.g. 3.20" style="flex:1;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:14px"/>'+
    '<select id="calUnit" style="padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2)"><option value="1">m</option><option value="0.01">cm</option><option value="0.001">mm</option><option value="0.3048">ft</option></select></div>',
    '<button class="btn btn--solid" data-act="cal-save-x" onclick="window.__calSave()">Save calibration</button>');
}
window.__calSave=function(){
  var v=parseFloat($("#calVal").value), u=parseFloat($("#calUnit").value)||1;
  if(!(v>0)){toast("Enter a distance","warn");return;}
  var pl=planOf(state.fid), c=state.cal;
  var pxd=Math.hypot((c.p2.x-c.p1.x)*pl.width_px,(c.p2.y-c.p1.y)*pl.height_px);
  if(pxd<2){toast("Points too close","warn");return;}
  var scale=(v*u)/pxd;
  sbPatch("sth_plans",pl.id,{scale_m_per_px:+scale.toFixed(6)}).then(function(row){
    if(row){ for(var i=0;i<state.plans.length;i++) if(state.plans[i].id===pl.id) state.plans[i]=row; }
    state.planMode=null; state.cal={p1:null,p2:null}; closeSheet(); toast("Calibrated · 1px = "+scale.toFixed(4)+" m"); render();
  });
};

/* ---- plan upload ---- */
function doUploadPlan(){
  pickFile("image/*,.png,.jpg,.jpeg,.svg",function(f){
    toast("Uploading plan…");
    var img=new Image(); var url=URL.createObjectURL(f);
    img.onload=function(){
      var w=img.naturalWidth||1400,h=img.naturalHeight||1000;
      uploadMedia(f,"plans/"+uid()+"-"+f.name.replace(/[^a-z0-9.\-]/gi,"_")).then(function(pub){
        var fl=curFloor(), ex=planOf(fl.id);
        var save=ex?sbPatch("sth_plans",ex.id,{image_url:pub,width_px:w,height_px:h,scale_m_per_px:null,version:(ex.version||1)+1})
                   :sbInsert("sth_plans",{project_id:state.pid,floor_id:fl.id,name:fl.name+" plan",image_url:pub,width_px:w,height_px:h,units:"m"});
        return save;
      }).then(function(){return loadAll();}).then(function(){
        try{URL.revokeObjectURL(url);}catch(_){}
        toast("Plan uploaded — now calibrate the scale"); state.planMode="cal1"; state.cal={p1:null,p2:null}; render();
      }).catch(function(){toast("Plan upload failed (storage)","warn");});
    };
    img.src=url;
  });
}

/* ---- capture import ---- */
function startDraft(f){
  var nm=(f.name||"").toLowerCase();
  if(/\.(insv|insp)$/.test(nm)){toast("Raw .insv is dual-fisheye — export an equirectangular .mp4 from Insta360 Studio first.","warn");return;}
  var isVid=/^video/.test(f.type||"")||/\.(mp4|mov|webm)$/i.test(nm);
  state.draft={file:f,src:URL.createObjectURL(f),kind:isVid?"video":"image",name:f.name||"360 file",start:null,route:[],step:1,label:""};
  toast("Loaded "+(f.name||"360 file")); render();
}
function startDraftSample(){
  state.draft={file:null,src:SAMPLE_VIDEO,kind:"video",name:"Office walkthrough (sample)",start:null,route:[],step:1,label:"Office walk"};
  toast("Sample walkthrough loaded — mark your start"); render();
}
function onCapTap(el,e){
  var c=relCoords($("#planwrap"),e); var d=state.draft; if(!d) return;
  if(d.step===1){ d.start=c; render(); }
  else if(d.step===2){ d.route.push(c); render(); }
}
function doSaveCapture(){
  var d=state.draft, fl=curFloor(), pl=planOf(fl.id);
  var label=($("#capLabel")&&$("#capLabel").value)||d.label||"Walk";
  var date=($("#capDate")&&$("#capDate").value)||new Date().toISOString().slice(0,10);
  // interpolate route into N poses
  var wp=[d.start].concat(d.route).filter(Boolean);
  var N=Math.max(12,wp.length*8);
  var poses=[];
  for(var i=0;i<N;i++){
    var f=i/(N-1), x=f*(wp.length-1), j=Math.min(wp.length-2,Math.floor(x)), tt=x-j;
    var a=wp[j], b=wp[Math.min(wp.length-1,j+1)];
    var px=a.x+(b.x-a.x)*tt, py=a.y+(b.y-a.y)*tt;
    var hd=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
    poses.push({px:px,py:py,heading:hd,t_sec:f*70,idx:i});
  }
  toast("Saving capture…");
  var uploadStep;
  if(d.file && d.kind==="video"){
    uploadStep=uploadMedia(d.file,"captures/"+uid()+".mp4").catch(function(){return d.src;}); // fallback to blob url
  } else if(d.file){ uploadStep=uploadMedia(d.file,"captures/"+uid()).catch(function(){return d.src;}); }
  else { uploadStep=Promise.resolve(d.src); }
  uploadStep.then(function(videoUrl){
    return sbInsert("sth_captures",{project_id:state.pid,floor_id:fl.id,plan_id:pl.id,label:label,captured_on:date,video_url:videoUrl,start_px:d.start.x,start_py:d.start.y,start_heading:poses[0].heading,status:"published",pose_count:N});
  }).then(function(cap){
    var rows=poses.map(function(p){return {capture_id:cap.id,idx:p.idx,t_sec:p.t_sec,px:p.px,py:p.py,heading:p.heading};});
    return sbInsertMany("sth_poses",rows).then(function(){return cap;});
  }).then(function(cap){
    routeCache[cap.id]=poses; state.draft=null;
    return loadAll().then(function(){ openCapture(cap.id); toast("Capture saved & localized"); });
  }).catch(function(err){ toast("Save failed: "+((err&&err.message)||err),"warn"); });
}

/* ---- new project / floor sheets ---- */
function sheetNewProject(){
  sheet("New project","Create project",
    '<label class="eyebrow">Name</label><input id="npName" placeholder="e.g. Lakeside Fit-out" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px"/>'+
    '<label class="eyebrow">Location</label><input id="npLoc" placeholder="e.g. Bengaluru" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin-top:6px"/>',
    '<button class="btn btn--solid" onclick="window.__newProject()">Create</button>');
}
window.__newProject=function(){
  var name=($("#npName").value||"").trim(); if(!name){toast("Enter a name","warn");return;}
  sbInsert("sth_projects",{name:name,location:($("#npLoc").value||"").trim()}).then(function(p){
    return sbInsert("sth_floors",{project_id:p.id,name:"Floor 1",level:1}).then(function(){return p;});
  }).then(function(p){ state.pid=p.id; state.fid=null; closeSheet(); return loadAll(); }).then(function(){toast("Project created");render();});
};
function sheetNewFloor(pid){
  sheet("New floor","Add floor",
    '<label class="eyebrow">Name</label><input id="nfName" placeholder="e.g. Level 2" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px"/>'+
    '<label class="eyebrow">Level number</label><input id="nfLevel" type="number" value="'+(floorsOf(pid).length+1)+'" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin-top:6px"/>',
    '<button class="btn btn--solid" onclick="window.__newFloor(\''+pid+'\')">Add floor</button>');
}
window.__newFloor=function(pid){
  var name=($("#nfName").value||"").trim(); if(!name){toast("Enter a name","warn");return;}
  sbInsert("sth_floors",{project_id:pid,name:name,level:parseInt($("#nfLevel").value,10)||1}).then(function(f){state.fid=f.id;closeSheet();return loadAll();}).then(function(){toast("Floor added");render();});
};

/* ---- notes ---- */
function sheetNote(opts){
  opts=opts||{};
  var loc="";
  if(opts.fromReview){ var p=trajAt(state.pos)||{px:null,py:null,heading:0}; state._noteDraft={px:p.px,py:p.py,yaw:p.heading,capId:state.capId,poseIdx:Math.round(state.pos*((state.poses.length||1)-1))}; loc='<div class="muted mono" style="font-size:10px;margin-bottom:8px">'+I.pin+' pinned at walk '+Math.round(state.pos*100)+'% on the plan</div>'; }
  else state._noteDraft={px:null,py:null,yaw:0,capId:null,poseIdx:null};
  var types=["issue","observation","rfi","safety","punch","general"];
  sheet("Field note","New note", loc+
    '<label class="eyebrow">Title</label><input id="ntTitle" placeholder="Short title" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px"/>'+
    '<label class="eyebrow">Type</label><select id="ntType" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px">'+types.map(function(x){return '<option value="'+x+'">'+x.toUpperCase()+'</option>';}).join("")+'</select>'+
    '<label class="eyebrow">Assignee</label><input id="ntAssignee" placeholder="e.g. MEP contractor" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px"/>'+
    '<label class="eyebrow">Detail</label><textarea id="ntBody" rows="3" placeholder="What did you observe?" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin-top:6px"></textarea>',
    '<button class="btn btn--solid" onclick="window.__saveNote()">Save note</button>');
}
window.__saveNote=function(){
  var title=($("#ntTitle").value||"").trim(); if(!title){toast("Enter a title","warn");return;}
  var d=state._noteDraft||{};
  var fl=curFloor();
  sbInsert("sth_notes",{project_id:state.pid,floor_id:fl.id,capture_id:d.capId,px:d.px,py:d.py,view_yaw:d.yaw,pose_idx:d.poseIdx,title:title,body:($("#ntBody").value||"").trim(),type:$("#ntType").value,status:"open",assignee:($("#ntAssignee").value||"").trim()})
  .then(function(){closeSheet();return loadAll();}).then(function(){toast("Note saved");render();});
};
function sheetNoteView(idn){
  var n=state.notes.filter(function(x){return x.id===idn;})[0]; if(!n) return;
  sheet((n.type||"note").toUpperCase()+(n.status==="closed"?" · closed":""),n.title||"(untitled)",
    (n.body?'<div style="font-size:13px;line-height:1.5;margin-bottom:10px">'+esc(n.body)+'</div>':"")+
    '<div class="muted mono" style="font-size:11px;line-height:1.7">'+(n.assignee?("Assignee: "+esc(n.assignee)+"<br>"):"")+(n.px!=null?("Pinned on plan<br>"):"")+"Created "+fmtDate(n.created_at)+'</div>',
    '<div class="btn-row"><button class="btn btn--ghost" data-act="note-edit" data-id="'+n.id+'">Edit</button>'+(n.status!=="closed"?'<button class="btn btn--solid" data-act="note-close" data-id="'+n.id+'">'+I.check+' Close</button>':'')+'</div>'+'<button class="btn btn--ghost mt-8" data-act="note-del" data-id="'+n.id+'" style="color:var(--accent);border-color:var(--accent-line)">'+I.x+' Delete note</button>');
}
function doCloseNote(idn){sbPatch("sth_notes",idn,{status:"closed"}).then(function(){closeSheet();return loadAll();}).then(function(){toast("Note closed");render();});}
function sheetNoteEdit(idn){
  var n=state.notes.filter(function(x){return x.id===idn;})[0]; if(!n) return;
  var types=["issue","observation","rfi","safety","punch","general"];
  sheet("Edit note","Edit note",
    '<label class="eyebrow">Title</label><input id="ntTitle" value="'+esc(n.title||"")+'" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px"/>'+
    '<label class="eyebrow">Type</label><select id="ntType" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px">'+types.map(function(x){return '<option value="'+x+'"'+(x===n.type?" selected":"")+'>'+x.toUpperCase()+'</option>';}).join("")+'</select>'+
    '<label class="eyebrow">Status</label><select id="ntStatus" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px"><option value="open"'+(n.status!=="closed"?" selected":"")+'>Open</option><option value="closed"'+(n.status==="closed"?" selected":"")+'>Closed</option></select>'+
    '<label class="eyebrow">Assignee</label><input id="ntAssignee" value="'+esc(n.assignee||"")+'" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin:6px 0 12px"/>'+
    '<label class="eyebrow">Detail</label><textarea id="ntBody" rows="3" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:13px;margin-top:6px">'+esc(n.body||"")+'</textarea>',
    '<button class="btn btn--solid" onclick="window.__updateNote(\''+n.id+'\')">Save changes</button>');
}
window.__updateNote=function(idn){
  var title=($("#ntTitle").value||"").trim(); if(!title){toast("Enter a title","warn");return;}
  sbPatch("sth_notes",idn,{title:title,type:$("#ntType").value,status:$("#ntStatus").value,assignee:($("#ntAssignee").value||"").trim(),body:($("#ntBody").value||"").trim()})
  .then(function(){closeSheet();return loadAll();}).then(function(){toast("Note updated");render();});
};
function sheetNoteDelete(idn){
  var n=state.notes.filter(function(x){return x.id===idn;})[0]; if(!n) return;
  sheet("Delete note","Delete this note?",
    '<div class="muted" style="font-size:12.5px;line-height:1.5">Permanently delete <b>'+esc(n.title||"this note")+'</b>? This can\u2019t be undone.</div>',
    '<div class="btn-row"><button class="btn btn--ghost" data-act="note-open" data-id="'+n.id+'">Cancel</button><button class="btn btn--solid" style="background:var(--accent);border-color:var(--accent)" onclick="window.__deleteNote(\''+n.id+'\')">'+I.x+' Delete</button></div>');
}
window.__deleteNote=function(idn){
  sbDelete("sth_notes",idn).then(function(){closeSheet();return loadAll();}).then(function(){toast("Note deleted");render();});
};

/* ---- share ---- */
function doShare(){
  var cap=curCapture(); if(!cap) return;
  toast("Creating share link…");
  var tk=token(); var exp=new Date(Date.now()+7*24*3600*1000).toISOString();
  sbInsert("sth_shares",{project_id:state.pid,capture_id:cap.id,token:tk,scope:"capture",expires_at:exp}).then(function(){
    var link=location.origin+location.pathname+"?share="+tk;
    sheet("Share · read-only","Restricted link",
      '<div class="muted" style="font-size:12.5px;margin-bottom:10px">Anyone with this link can view <b>'+esc(cap.label)+'</b> (360 + route) read-only. Expires in 7 days.</div>'+
      '<input value="'+esc(link)+'" readonly onclick="this.select()" style="width:100%;padding:11px;border-radius:8px;border:1px solid var(--hair-2);background:var(--paper-2);font-size:11.5px;font-family:var(--f-mono)"/>',
      '<button class="btn btn--solid" onclick="(function(){try{navigator.clipboard.writeText(\''+link+'\');}catch(_){}})();window.__toastCopied()">'+I.share+' Copy link</button>');
  }).catch(function(){toast("Could not create link","warn");});
}
window.__toastCopied=function(){toast("Link copied");};

/* ---- export ---- */
function doExport(){
  var cap=curCapture(), fl=curFloor(), pl=planOf(fl.id), proj=curProject();
  var ns=notesOf(fl.id);
  var poly=state.poses.map(function(p){return (p.px*100).toFixed(1)+","+(p.py*100).toFixed(1);}).join(" ");
  var html='<!doctype html><html><head><meta charset="utf-8"><title>Sthyra evidence — '+esc(cap.label)+'</title>'+
    '<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:24px auto;padding:0 18px;color:#1c1a17;background:#F5F1E8}h1{font-family:Georgia,serif}.k{color:#6B1F2A;font-weight:700}.box{border:1px solid #ddd2bd;border-radius:10px;padding:14px;margin:12px 0;background:#fff}table{width:100%;border-collapse:collapse;font-size:13px}td,th{border-bottom:1px solid #eee;padding:7px;text-align:left}.wrap{position:relative}.wrap img{width:100%;border-radius:8px}</style></head><body>'+
    '<div class="k">STHYRA · REALITY CAPTURE</div><h1>'+esc(cap.label)+'</h1>'+
    '<div class="box"><b>'+esc(proj.name)+'</b> · '+esc(fl.name)+'<br>Date: '+fmtDate(cap.captured_on)+' · '+(cap.pose_count||0)+' localized poses · status: '+esc(cap.status)+'<br>Scale: '+(pl.scale_m_per_px?("1px = "+pl.scale_m_per_px.toFixed(4)+" m"):"not calibrated")+'</div>'+
    '<div class="box wrap"><div style="position:relative"><img src="'+location.origin+location.pathname.replace(/[^/]*$/,"")+esc(pl.image_url)+'"/>'+
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><polyline points="'+poly+'" fill="none" stroke="#6B1F2A" stroke-width="0.6"/></svg></div></div>'+
    '<h3>Field notes ('+ns.length+')</h3><table><tr><th>Type</th><th>Title</th><th>Assignee</th><th>Status</th></tr>'+
    ns.map(function(n){return '<tr><td>'+esc((n.type||"").toUpperCase())+'</td><td>'+esc(n.title||"")+'</td><td>'+esc(n.assignee||"—")+'</td><td>'+esc(n.status||"open")+'</td></tr>';}).join("")+'</table>'+
    '<p style="color:#8a8270;font-size:11px;margin-top:24px">Generated by Sthyra · originals retained server-side · localization is assisted; positions carry uncertainty.</p></body></html>';
  var blob=new Blob([html],{type:"text/html"}); var url=URL.createObjectURL(blob);
  window.open(url,"_blank"); toast("Evidence report opened");
}

/* ------------------------------------------------------------ SHARE OPEN (read-only) */
function openShareFromUrl(tk){
  state.share="loading"; render();
  sbGet("/sth_shares?select=*&token=eq."+encodeURIComponent(tk)).then(function(rows){
    var s=rows&&rows[0]; if(!s){state.share="bad";render();return;}
    if(s.expires_at && new Date(s.expires_at).getTime()<Date.now()){state.share="expired";render();return;}
    return Promise.all([sbGet("/sth_captures?select=*&id=eq."+s.capture_id),loadPoses(s.capture_id)]).then(function(r){
      var cap=r[0]&&r[0][0]; if(!cap){state.share="bad";render();return;}
      return sbGet("/sth_plans?select=*&id=eq."+cap.plan_id).then(function(pr){
        state.captures=[cap]; state.capId=cap.id; state.poses=r[1]||[]; state.pos=0;
        state.share={cap:cap,plan:pr&&pr[0],expires:s.expires_at};
        render();
      });
    });
  });
}

/* ------------------------------------------------------------ CLOCK + BOOT */
function tickClock(){var el=$("#clock");if(!el)return;var d=new Date();var h=d.getHours(),m=d.getMinutes();el.textContent=(h<10?"0":"")+h+":"+(m<10?"0":"")+m;}
function boot(){
  var phone=document.getElementById("phone");
  phone.addEventListener("click",onClick);
  phone.addEventListener("change",onChange);
  $("#scrim").addEventListener("click",closeSheet);
  var bell=$("#bell"); if(bell) bell.addEventListener("click",function(){toast("Sthyra reality capture");});
  try{console.log("%cSthyra Reality Capture — MVP","color:#7a2230;font-weight:700");}catch(_){}
  tickClock(); setInterval(tickClock,30000);
  var sp=new URLSearchParams(location.search).get("share");
  if(sp){ openShareFromUrl(sp); return; }
  render();
  loadAll().then(function(){
    var pl=state.fid?planOf(state.fid):null;
    var pre=pl?ensurePlanPoints(pl.id):Promise.resolve();
    pre.then(function(){
      var c=state.fid?capturesOf(state.fid)[0]:null;
      if(c) ensureRoute(c.id).then(render); else render();
    });
  }).catch(function(){state.loading=false;render();});
}
if(document.readyState!=="loading")boot(); else document.addEventListener("DOMContentLoaded",boot);
})();
