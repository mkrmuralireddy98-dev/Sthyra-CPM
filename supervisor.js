/* ============================================================
   Sthyra CPM — Supervisor App  (on-site mobile companion)
   Photo-first, voice-first, offline-aware. Reads the same
   cpm_* Supabase backend as the command center; writes issues
   and progress back. Built for fast taps with gloves on.
   ============================================================ */
(function(){
"use strict";
var $  = function(s,r){return (r||document).querySelector(s);};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

/* ---------------------------------------------------------- ICONS */
var I = {
  home:'<svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 11 3l8 6.5V19a1 1 0 0 1-1 1h-4v-6h-6v6H4a1 1 0 0 1-1-1Z"/></svg>',
  tasks:'<svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="14" height="16" rx="2"/><path d="M8 3h6v3H8z"/><path d="M8 11l2 2 3.5-3.5"/><path d="M8 16h6"/></svg>',
  cap:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.4"/><path d="M3.5 12a8.5 8.5 0 0 1 17 0"/><path d="M20.5 12a8.5 8.5 0 0 1-17 0"/><path d="M18.5 8.5 20.5 12l-3.6.4M5.5 15.5 3.5 12l3.6-.4"/></svg>',
  box:'<svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 11 3l8 4.5v7L11 19l-8-4.5Z"/><path d="M3 7.5 11 12l8-4.5M11 12v7"/></svg>',
  flag:'<svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20V4M5 4h11l-2 3 2 3H5"/></svg>',
  more:'<svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="5" cy="11" r="1.6"/><circle cx="11" cy="11" r="1.6"/><circle cx="17" cy="11" r="1.6"/></svg>',
  check:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5 7 13l7.5-8"/></svg>',
  x:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l10 10M14 4 4 14"/></svg>',
  chev:'<svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4l5 5-5 5"/></svg>',
  chevD:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7l4 4 4-4"/></svg>',
  back:'<svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4 6 9l5 5"/></svg>',
  mic:'<svg viewBox="0 0 26 26" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9.5" y="3" width="7" height="12" rx="3.5"/><path d="M6 12a7 7 0 0 0 14 0M13 19v3"/></svg>',
  qr:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="13" y="3" width="6" height="6" rx="1"/><rect x="3" y="13" width="6" height="6" rx="1"/><path d="M13 13h2v2M19 13v6M13 19h2M17 17h2"/></svg>',
  camera:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3l1.5-2h7L16 7h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><circle cx="11" cy="12.5" r="3.2"/></svg>',
  plus:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 4v12M4 10h12"/></svg>',
  photo:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="16" height="14" rx="2"/><circle cx="8" cy="9" r="1.6"/><path d="M3 15l4-3 3 2.5L14 9l5 5"/></svg>',
  draw:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="16" height="16" rx="1.5"/><path d="M3 8h16M8 8v11M8 13h11"/></svg>',
  people:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M2.5 18a5.5 5.5 0 0 1 11 0"/><path d="M15 5.5a3 3 0 0 1 0 5.6M16 18a5.5 5.5 0 0 0-2.2-4.4"/></svg>',
  report:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h8l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13 3v4h4M7 12h8M7 15h8M7 9h3"/></svg>',
  shield:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3 4 6v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6Z"/><path d="M8 11l2 2 4-4"/></svg>',
  helmet:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15a8 8 0 0 1 16 0"/><path d="M2 15h18v2H2zM8 7V5h6v2M11 5v2"/></svg>',
  bell:'<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3a4 4 0 0 0-4 4c0 4-1.5 5-1.5 5h11S14 11 14 7a4 4 0 0 0-4-4Z"/><path d="M8.5 15a1.5 1.5 0 0 0 3 0"/></svg>',
  sync:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a6 6 0 0 1 10-4.3L15 6M15 9a6 6 0 0 1-10 4.3L3 12"/><path d="M15 3v3h-3M3 15v-3h3"/></svg>',
  upload:'<svg viewBox="0 0 22 22" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 15V5M7 9l4-4 4 4"/><path d="M4 15v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2"/></svg>',
  play:'<svg viewBox="0 0 18 18" width="14" height="14" fill="currentColor"><path d="M5 3.5 14 9l-9 5.5Z"/></svg>',
  pause:'<svg viewBox="0 0 18 18" width="14" height="14" fill="currentColor"><rect x="4" y="3.5" width="3.5" height="11" rx="1"/><rect x="10.5" y="3.5" width="3.5" height="11" rx="1"/></svg>',
  pin:'<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 16s5-4.2 5-8a5 5 0 0 0-10 0c0 3.8 5 8 5 8Z"/><circle cx="9" cy="8" r="1.8"/></svg>',
  siren:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17a6 6 0 0 1 12 0v1H5Z"/><path d="M11 5V3M5 8 3.5 6.5M17 8l1.5-1.5M11 8v9"/></svg>',
  ruler:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="17" height="8" rx="1.5" transform="rotate(0 11 11)"/><path d="M6.5 7v2.5M10 7v3.5M13.5 7v2.5M17 7v3.5"/></svg>',
  truck:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h10v8H2zM12 9h4l3 3v2h-7z"/><circle cx="6" cy="16" r="1.6"/><circle cx="15.5" cy="16" r="1.6"/></svg>',
  wifi0:'<svg viewBox="0 0 22 22" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a13 13 0 0 1 16 0M6 11.5a8 8 0 0 1 10 0M9 15a3.5 3.5 0 0 1 4 0"/><circle cx="11" cy="18" r=".6" fill="currentColor"/><path d="M3 3 19 19" stroke-width="1.4"/></svg>',
  voice:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v4M7.5 6v10M11 4v14M14.5 7v8M18 9v4"/></svg>',
  hardhat:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="8" r="4"/><path d="M4 18a7 7 0 0 1 14 0"/></svg>',
  clip:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="12" height="15" rx="2"/><path d="M9 4h4v2.5H9z"/><path d="M8 11h6M8 14h6"/></svg>',
  gear:'<svg viewBox="0 0 22 22" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="2.6"/><path d="M11 3v2.2M11 16.8V19M3 11h2.2M16.8 11H19M5.4 5.4l1.6 1.6M15 15l1.6 1.6M16.6 5.4 15 7M7 15l-1.6 1.6"/></svg>',
  wx:'<svg viewBox="0 0 22 22" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M4 4l1 1M11 11l1 1M12 4l-1 1M5 11l-1 1"/><path d="M11 16a3 3 0 0 1 .3-6 4 4 0 0 1 7.5 1.2A2.6 2.6 0 0 1 18 16Z"/></svg>',
  clock:'<svg viewBox="0 0 18 18" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="6.5"/><path d="M9 5.5V9l2.5 1.5"/></svg>',
  battery:'<svg viewBox="0 0 24 14" width="22" height="13" fill="none" stroke="currentColor" stroke-width="1.1"><rect x="1" y="2" width="19" height="10" rx="2.5"/><rect x="2.5" y="3.5" width="13" height="7" rx="1" fill="currentColor" stroke="none"/><path d="M22 5v4" stroke-linecap="round" stroke-width="1.6"/></svg>',
  cell:'<svg viewBox="0 0 18 12" width="17" height="11" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>',
  brand:'<svg viewBox="0 0 32 32" width="30" height="30" fill="none"><rect x="11" y="9" width="10" height="16" stroke="currentColor" stroke-width="1.1"/><line x1="14" y1="10.5" x2="14" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="16" y1="10.5" x2="16" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="18" y1="10.5" x2="18" y2="23.5" stroke="currentColor" stroke-width="0.7"/><line x1="8" y1="9" x2="24" y2="9" stroke="currentColor" stroke-width="1.3"/><line x1="8" y1="25" x2="24" y2="25" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="9" r="1.6" fill="currentColor"/><circle cx="24" cy="9" r="1.6" fill="currentColor"/><circle cx="8" cy="25" r="1.6" fill="currentColor"/><circle cx="24" cy="25" r="1.6" fill="currentColor"/></svg>'
};

/* ---------------------------------------------------------- BACKEND (same project as command center) */
var BACKEND = {
  base:"https://rajvfosoxgkyanwmdphq.supabase.co",
  url:"https://rajvfosoxgkyanwmdphq.supabase.co/rest/v1",
  key:"sb_publishable_u3pa8Z9iEZE8A7GSZnGXOQ_dAsjUbOp",
  fn:"https://rajvfosoxgkyanwmdphq.supabase.co/functions/v1/cpm-pipeline",
  jwt:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhanZmb3NveGdreWFud21kcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMDg3MDgsImV4cCI6MjA5NTY4NDcwOH0.MejkaPs8AFleMTTGDqk_v1TJcb_3y9-E1ptj_adIgOI"
};
var backendLive=false, pipelineLive=false;
function sb(path,opts){opts=opts||{};opts.headers=Object.assign({apikey:BACKEND.key,Authorization:"Bearer "+BACKEND.key},opts.headers||{});return fetch(BACKEND.url+path,opts);}
// Trigger the deployed cpm-pipeline edge function (real server-side run), then reload its results.
function runPipelineLive(captureId){
  pipelineLive=false;
  return fetch(BACKEND.fn,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+BACKEND.jwt},body:JSON.stringify({capture_id:captureId})})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(res){ if(res&&res.ok){ pipelineLive=true; return loadBackend(); } return false; })
    .catch(function(){ return false; });
}

/* ---------------------------------------------------------- SEED DATA (mirrors live cpm_* — offline fallback) */
var PROJECT={name:"Sky Villa, Kokapet",meta:"Hyderabad · G+2 luxury villa · Plot 14"};

var LABOR=[
  {team:"Mason",count:14,c:"#6B1F2A"},{team:"Helper / mazdoor",count:12,c:"#9A7B2E"},
  {team:"Bar bender",count:6,c:"#2E5A6B"},{team:"Electrical",count:5,c:"#5B6E4A"},
  {team:"Plumbing",count:4,c:"#4A463E"},{team:"Waterproofing",count:3,c:"#8A2A33"}
];
var PRESENCE=[["Supervisor",2],["Engineer",1],["Visitor",3],["Unknown",1]];

var WORKPKGS=[
  {name:"Foundation & raft",code:"WP-01",pct:100,status:"ok",lbl:"Complete",con:"BuildRight Civil",labor:0,plan:100},
  {name:"Basement RCC",code:"WP-02",pct:100,status:"ok",lbl:"Complete",con:"BuildRight Civil",labor:0,plan:100},
  {name:"Ground floor columns",code:"WP-03",pct:100,status:"ok",lbl:"Complete",con:"BuildRight Civil",labor:0,plan:100},
  {name:"Ground floor slab",code:"WP-04",pct:92,status:"warn",lbl:"Curing",con:"BuildRight Civil",labor:4,plan:95},
  {name:"GF blockwork",code:"WP-05",pct:65,status:"accent",lbl:"In progress",con:"ABC Mason Team",labor:12,plan:70},
  {name:"Plumbing rough-in",code:"WP-06",pct:38,status:"accent",lbl:"In progress",con:"Sri Sai Plumbers",labor:4,plan:45}
];

var CHECKLIST=[
  {grp:"Before pour — Slab GF-1",items:[["Rebar checked","done","Eng. Ramesh"],["Shuttering alignment","done","Ramesh"],["Cover blocks placed","done","—"],["Electrical conduits","done","Suresh"],["Plumbing sleeves","pending","Awaiting"],["Formwork oil applied","done","—"],["Concrete grade confirmed — M25","done","RMC"],["Slump test done","pending","On arrival"]]},
  {grp:"Waterproofing — Bathroom B-2",items:[["Surface cleaned","done","Imran"],["Cracks filled","done","Imran"],["First coat applied","done","Imran"],["Corner mesh applied","pending","—"],["Second coat applied","todo","—"],["Ponding test started","todo","—"],["Leakage checked","todo","—"],["Engineer approved","todo","Pending"]]}
];

var MATERIALS=[
  {name:"Cement (OPC 53)",unit:"bags",stock:22,days:2,rate:"3/day",status:"crit",po:"On order"},
  {name:"Steel (Fe500D)",unit:"T",stock:3.2,days:9,rate:"0.35/day",status:"warn",po:"Short 300kg"},
  {name:"River sand",unit:"cft",stock:0,days:0,rate:"—",status:"crit",po:"Delivery pending"},
  {name:"20mm aggregate",unit:"cft",stock:640,days:14,rate:"45/day",status:"ok",po:"OK"},
  {name:"AAC blocks",unit:"nos",stock:1850,days:11,rate:"170/day",status:"ok",po:"OK"},
  {name:"Waterproof compound",unit:"kg",stock:90,days:7,rate:"13/day",status:"ok",po:"OK"}
];
var MAT_REQUESTS=[
  {mat:"Cement (OPC 53)",qty:"100 bags",for:"First floor plastering",by:"Tomorrow AM",sev:"crit",status:"Awaiting builder"},
  {mat:"River sand",qty:"400 cft",for:"GF blockwork mortar",by:"Today",sev:"crit",status:"Approved · in transit"},
  {mat:"Binding wire",qty:"50 kg",for:"FF column rebar",by:"In 2 days",sev:"warn",status:"Awaiting builder"}
];

var ISSUES=[
  {id:"SI-214",t:"Bathroom B-2 waterproofing incomplete",loc:"Bathroom B-2",sev:"crit",who:"Waterproofing",status:"Open",age:"2h",type:"Quality"},
  {id:"SI-213",t:"Open slab edge without barricade",loc:"GF slab — east",sev:"crit",who:"Safety officer",status:"Open",age:"4h",type:"Safety"},
  {id:"SI-212",t:"Bedroom-2 door opening 850mm (spec 900)",loc:"Bedroom 2",sev:"warn",who:"ABC Mason Team",status:"Assigned",age:"1d",type:"Drawing mismatch"},
  {id:"SI-210",t:"Pipe sleeve missing near WC wall",loc:"Bathroom B-1",sev:"warn",who:"Sri Sai Plumbers",status:"In progress",age:"1d",type:"Quality"},
  {id:"SI-207",t:"Cement stock low — 2 days remaining",loc:"Material store",sev:"warn",who:"Storekeeper",status:"Open",age:"3h",type:"Material"},
  {id:"SI-204",t:"Honeycomb on column C4 face",loc:"Column C4",sev:"low",who:"BuildRight Civil",status:"Fixed",age:"2d",type:"Quality"},
  {id:"SI-201",t:"Scaffold tie missing — 2nd lift",loc:"North elevation",sev:"warn",who:"Safety officer",status:"Closed",age:"3d",type:"Safety"}
];

var QRLOCS=[
  {id:"QR-S1",name:"Slab GF-1",type:"Structural",pending:2,last:"Today"},
  {id:"QR-B2",name:"Bathroom B-2",type:"Waterproofing",pending:1,last:"Today"},
  {id:"QR-W3",name:"Bedroom Wall W3",type:"Blockwork",pending:1,last:"Today"},
  {id:"QR-C1",name:"Column C1",type:"Structural",pending:0,last:"12 Jun"},
  {id:"QR-K1",name:"Kitchen Plumbing",type:"MEP",pending:0,last:"11 Jun"}
];

var DRAW_SETS=[
  {name:"Architectural",rng:"A-100 → A-180",rev:"Rev 04",status:"ok",when:"2 Jun"},
  {name:"Structural",rng:"S-100 → S-140",rev:"Rev 03",status:"ok",when:"28 May"},
  {name:"Plumbing",rng:"P-100 → P-120",rev:"Rev 02",status:"warn",when:"14 May"},
  {name:"Electrical",rng:"E-100 → E-115",rev:"Rev 02",status:"ok",when:"20 May"}
];

var SAFETY=[
  ["Workers wearing helmets","done"],["Workers wearing safety shoes","done"],
  ["Scaffolding checked & tied","pending"],["Open edges protected","todo"],
  ["Electrical wires safely placed","done"],["Excavation barricaded","done"],
  ["Fire extinguisher available","done"],["First aid kit available","done"],
  ["No unauthorized person inside","pending"]
];

var ALERTS=[
  {tone:"crit",t:"Cement stock will finish in 2 days",d:"Raise request before 5 PM to avoid stoppage",go:"materials"},
  {tone:"crit",t:"Slab GF-1 pour checklist incomplete",d:"Plumbing sleeves + slump test pending",go:"tasks:checklist:0"},
  {tone:"warn",t:"360° capture pending today",d:"Last walkthrough was yesterday 6:10 PM",go:"capture"},
  {tone:"warn",t:"Issue overdue: Bathroom B-2 waterproofing",d:"Due today · assigned to waterproofing team",go:"issues:sub:SI-214"},
  {tone:"info",t:"Builder approved: River sand request",d:"400 cft in transit · ETA today 2 PM",go:"materials"},
  {tone:"info",t:"Customer visit at 11:30 AM",d:"Mr. & Mrs. Rao · site walkthrough",go:"more:visit"}
];

/* ---- BIM × 360 analysis pipeline (mirrors cpm_captures/frames/bim/detections/discrepancies) ---- */
var CAPTURES=[
  {id:"CAP-0613-01",floor:"Ground floor",zone:"Full walkthrough",device:"Insta360 X5",duration_s:144,distance_m:86.5,frame_count:96,coverage_pct:96,quality_score:"A− · usable",status:"analyzed",processing_step:6,model_version:"yolov8-construct-v3 + SAM2 + BIM-projector v0.4",started:"Today 5:20 PM",
    steps:[["upload","Upload to backend","done","412 MB · 8K 360° video","4.2s"],["extract","Extract frames","done","96 frames @ 1.5 s","9.1s"],["map","Map frames to floor plan","done","13 anchored · IMU + QR","3.3s"],["align","Align BIM model","done","GF · Rev 04 · 12 elements","2.6s"],["detect","AI element check","done","yolov8 + SAM2 · 71 detections","15.4s"],["issues","Generate discrepancies","done","5 found · 2 critical","0.8s"]]},
  {id:"CAP-0613-02",floor:"First floor",zone:"Full walkthrough",device:"Insta360 X5",duration_s:98,distance_m:61,frame_count:64,coverage_pct:0,quality_score:null,status:"processing",processing_step:3,model_version:"yolov8-construct-v3 + SAM2 + BIM-projector v0.4",started:"Today 5:40 PM",
    steps:[["upload","Upload to backend","done","288 MB · 8K 360° video","3.6s"],["extract","Extract frames","done","64 frames @ 1.5 s","7.4s"],["map","Map frames to floor plan","running","anchoring to FF plan…",""],["align","Align BIM model","queued","FF · Rev 04",""],["detect","AI element check","queued","",""],["issues","Generate discrepancies","queued","",""]]}
];
var FRAMES=[
  {idx:1,t:0,zone:"Staircase",fx:72,fy:78},{idx:2,t:1.5,zone:"Staircase",fx:68,fy:68},
  {idx:3,t:3,zone:"Living",fx:55,fy:45},{idx:4,t:4.5,zone:"Living",fx:38,fy:32},{idx:5,t:6,zone:"Living",fx:28,fy:30},
  {idx:6,t:7.5,zone:"Kitchen",fx:40,fy:60},{idx:7,t:9,zone:"Kitchen",fx:46,fy:73},
  {idx:8,t:10.5,zone:"Bathroom B-2",fx:28,fy:68,lit:false},{idx:9,t:12,zone:"Bathroom B-2",fx:18,fy:74,lit:false},{idx:10,t:13.5,zone:"Bathroom B-2",fx:16,fy:80,lit:false},
  {idx:11,t:15,zone:"Bedroom 1",fx:60,fy:38},{idx:12,t:16.5,zone:"Bedroom 1",fx:72,fy:30},{idx:13,t:18,zone:"Staircase",fx:72,fy:72}
];
var BIM=[
  {zone:"Living",type:"block",code:"W-3",name:"Living partition wall",disc:"ARCH",spec:"AAC 200mm",bx:30,by:38},
  {zone:"Living",type:"window",code:"WIN-3",name:"Living window",disc:"ARCH",spec:"1500×1200",bx:22,by:28},
  {zone:"Living",type:"conduit",code:"EC-1",name:"Power conduit",disc:"MEP",spec:"20mm concealed",bx:28,by:34},
  {zone:"Bedroom 1",type:"door",code:"D-2",name:"Bedroom-2 door",disc:"ARCH",spec:"900mm clear",bx:73,by:33},
  {zone:"Bedroom 1",type:"window",code:"WIN-5",name:"Bedroom window",disc:"ARCH",spec:"1200×1200",bx:78,by:28},
  {zone:"Bathroom B-2",type:"waterproofing",code:"WP-2",name:"Waterproofing membrane",disc:"PLUMB",spec:"2-coat + mesh",bx:18,by:74},
  {zone:"Bathroom B-2",type:"fixture",code:"FT-1",name:"Floor trap",disc:"PLUMB",spec:"110mm sleeve",bx:22,by:78},
  {zone:"Bathroom B-2",type:"conduit",code:"WC-2",name:"Wall conduit",disc:"MEP",spec:"20mm concealed",bx:14,by:70},
  {zone:"Kitchen",type:"pipe",code:"PL-1",name:"Plumbing point",disc:"PLUMB",spec:"CPVC ×2 sleeved",bx:46,by:72},
  {zone:"Kitchen",type:"window",code:"WIN-7",name:"Kitchen window",disc:"ARCH",spec:"900×900",bx:50,by:66},
  {zone:"Kitchen",type:"fixture",code:"SNK-1",name:"Sink rough-in",disc:"PLUMB",spec:"waste+trap",bx:42,by:74}
];
var DETECTIONS=[
  {zone:"Living",code:"W-3",label:"AAC blockwork wall",confidence:0.94,bbox:[0.18,0.30,0.40,0.55],present:true},
  {zone:"Living",code:"WIN-3",label:"window opening",confidence:0.91,bbox:[0.62,0.22,0.20,0.30],present:true},
  {zone:"Living",code:"EC-1",label:"surface-run conduit",confidence:0.74,bbox:[0.40,0.45,0.25,0.10],present:true},
  {zone:"Kitchen",code:"WIN-7",label:"window opening",confidence:0.88,bbox:[0.55,0.20,0.18,0.26],present:true},
  {zone:"Kitchen",code:"PL-1",label:"CPVC pipe stub",confidence:0.83,bbox:[0.30,0.55,0.10,0.22],present:true},
  {zone:"Kitchen",code:"SNK-1",label:"sink waste (partial)",confidence:0.61,bbox:[0.45,0.60,0.14,0.18],present:true},
  {zone:"Bathroom B-2",code:"WP-2",label:"membrane 1st coat only",confidence:0.88,bbox:[0.10,0.40,0.70,0.45],present:false},
  {zone:"Bathroom B-2",code:"FT-1",label:"floor trap",confidence:0.79,bbox:[0.40,0.70,0.12,0.14],present:true},
  {zone:"Bathroom B-2",code:"WC-2",label:"wall conduit (concealed)",confidence:0.71,bbox:[0.20,0.30,0.08,0.30],present:true},
  {zone:"Bedroom 1",code:"D-2",label:"door opening ~850mm",confidence:0.79,bbox:[0.35,0.20,0.30,0.62],present:true},
  {zone:"Bedroom 1",code:"WIN-5",label:"window opening",confidence:0.90,bbox:[0.70,0.25,0.18,0.28],present:true}
];
var DISCREPANCIES=[
  {zone:"Bathroom B-2",kind:"incomplete",element:"Waterproofing membrane (WP-2)",severity:"crit",confidence:0.88,status:"issue_created",issue_id:"SI-214",note:"BIM expects 2-coat membrane + corner mesh. AI sees 1st coat only — 2nd coat & mesh not present. Pour/tiling must not proceed."},
  {zone:"Bedroom 1",kind:"deviation",element:"Door opening D-2 width",severity:"warn",confidence:0.79,status:"issue_created",issue_id:"SI-212",note:"BIM clear opening 900mm. AI-measured opening ~850mm (−50mm). Door leaf will not fit per schedule."},
  {zone:"Living",kind:"deviation",element:"Power conduit EC-1 routing",severity:"warn",confidence:0.74,status:"open",issue_id:null,note:"BIM specifies 20mm concealed/chased. AI sees surface-run conduit on finished wall. Re-route before plaster."},
  {zone:"Kitchen",kind:"missing",element:"Plumbing sleeve at PL-1",severity:"warn",confidence:0.81,status:"open",issue_id:null,note:"BIM has 2 sleeved points (hot+cold). AI detects 1 pipe stub, sleeve absent near WC wall. Pressure test blocked."},
  {zone:"Bathroom B-2",kind:"quality",element:"Capture quality — low light",severity:"low",confidence:0.55,status:"verified",issue_id:null,note:"Frames 8–10 under-lit. Membrane verdict confidence 0.88 but a re-walk with lighting is advised to confirm."}
];

/* ---------------------------------------------------------- STATE */
var state={
  tab:"home", sub:null,
  online:true, pending:7, photos:4, captures:1,
  dayStarted:false,
  taskTab:"work",        // work | checklist | approvals
  issueFilter:"all",
  matTab:"stock",
  cap:{step:0,tower:null,floor:null,device:null,conn:"Wi-Fi Direct",connected:false,connecting:false,type:null,start:null,elapsed:0,pins:[],anchors:0,light:"low"},
  voice:{rec:false,done:false},
  insta:{src:null,kind:null,name:null,demo:false,busy:false,prog:"",frames:0,autorotate:true},
  cmp:{split:50,right:"mep",locked:false,pos:0,walls:true,traj:null},
  createIssue:{sev:"warn",type:"Quality",photos:0,loc:""},
  bim:{cmpMode:"side",cmpZone:"Bathroom B-2",ovl:55,analyzeStep:0,cv:null,cvRunning:false,
       model:null,modelRunning:false,modelProgress:"",modelErr:null,
       mvOpen:false,glb:"https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/LittlestTokyo.glb",glbName:"LittlestTokyo (sample) · CC-BY"}
};
var capTimer=null, voiceTimer=null, analyzeTimer=null;
var instaViewer=null;
var cmpAView=null, cmpBView=null;
var INSTA_DEMO_PLAN="assets/insta360/office-floorplan.png";
var INSTA_DEMO={video:"assets/insta360/office360-demo.mp4",image:"assets/insta360/office360-demo.jpg",name:"Office walkthrough (sample) \u00b7 Insta360 X5"};

/* ---------------------------------------------------------- SMALL HELPERS */
function tone(t){return t==="crit"||t==="accent"?"crit":t==="warn"?"warn":t==="ok"?"ok":t==="info"?"info":"neutral";}
function toneColor(t){return {crit:"var(--accent)",warn:"var(--warn)",ok:"var(--ok)",info:"var(--info)",accent:"var(--accent)"}[t]||"var(--ink-3)";}
function pill(label,t){return '<span class="pill pill--'+tone(t)+'"><span class="pd"></span>'+label+'</span>';}
function statusPill(s){
  var m={"Open":"crit","Assigned":"info","In progress":"info","Fixed":"warn","Ready for review":"warn","Closed":"ok","Rejected":"neutral","Reopened":"crit"};
  return '<span class="pill pill--'+(m[s]||"neutral")+'">'+s+'</span>';
}
function laborTotal(){return LABOR.reduce(function(s,r){return s+(r.count||0);},0);}
function openIssues(){return ISSUES.filter(function(i){return ["Open","Assigned","In progress","Reopened"].indexOf(i.status)>-1;});}
function pendingChecks(){var n=0;CHECKLIST.forEach(function(g){g.items.forEach(function(it){if(it[1]!=="done")n++;});});return n;}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

/* ---------------------------------------------------------- TOAST */
function toast(msg,kind){
  var t=$("#toast");
  t.classList.remove("is-show");
  t.className="toast"+(kind==="warn"?" is-warn":"");
  t.innerHTML='<span class="ti">'+(kind==="warn"?I.bell:I.check)+'</span><span>'+msg+'</span>';
  void t.offsetHeight;            // commit hidden state, then animate (no rAF — survives bg throttling)
  t.classList.add("is-show");
  clearTimeout(t.__h);t.__h=setTimeout(function(){t.classList.remove("is-show");},2600);
}

/* ---------------------------------------------------------- SHEET */
function sheet(eyebrow,title,body,foot){
  var el=$("#sheet");
  el.classList.remove("is-open");
  el.innerHTML='<div class="sheet__grip"></div>'+
    '<div class="sheet__head"><div><div class="eyebrow">'+eyebrow+'</div><h3>'+title+'</h3></div><button class="sheet__close" data-act="close-sheet">×</button></div>'+
    '<div class="sheet__body">'+body+'</div>'+(foot?'<div class="sheet__foot">'+foot+'</div>':"");
  $("#scrim").classList.add("is-open");
  void el.offsetHeight;           // commit closed state, then animate open (no rAF — survives bg throttling)
  el.classList.add("is-open");
}
function closeSheet(){$("#sheet").classList.remove("is-open");$("#scrim").classList.remove("is-open");}

/* ============================================================ VIEWS */

/* -------- HOME -------- */
function homeView(){
  var lab=laborTotal(), cem=MATERIALS.filter(function(m){return m.name.indexOf("Cement")===0;})[0];
  var stats=[
    {lbl:"Labourers on site",val:lab,foot:LABOR.length+" trades active",t:"ok",go:"more:labor"},
    {lbl:"Pending checklists",val:pendingChecks(),foot:"2 blocking a pour",t:"warn",go:"tasks:checklist"},
    {lbl:"Material requests",val:MAT_REQUESTS.length,foot:"1 awaiting builder",t:"warn",go:"materials:requests"},
    {lbl:"Delayed tasks",val:4,foot:"vs. today's plan",t:"warn",go:"tasks"},
    {lbl:"Quality issues open",val:openIssues().length,foot:"2 critical",t:"crit",go:"issues"},
    {lbl:"Cement stock",val:cem?cem.days:2,sm:"days",foot:"reorder now",t:"crit",go:"materials"}
  ];
  return ''+
  '<div class="today">'+
    '<div class="today__eyebrow"><span>Today · '+esc(PROJECT.name.split(",")[0])+'</span>'+
      '<span class="wx">'+I.wx+' 34° · rain risk tmrw</span></div>'+
    '<h1>Good morning,<br><em>Murali.</em></h1>'+
    '<div class="today__date">FRI · 13 JUNE 2026 · 06:42 AM</div>'+
  '</div>'+
  '<button class="daybtn '+(state.dayStarted?"is-on":"")+'" data-act="toggle-day">'+
    '<span class="daybtn__ic">'+(state.dayStarted?I.check:I.play)+'</span>'+
    '<span class="daybtn__tx"><b>'+(state.dayStarted?"Site day running":"Start site day")+'</b>'+
      '<span>'+(state.dayStarted?"Started 06:42 · tap to end & submit report":"Logs attendance, weather & opening counts")+'</span></span>'+
    '<span class="daybtn__go">'+(state.dayStarted?"END DAY":"START")+I.chev+'</span>'+
  '</button>'+

  '<div class="section-label"><h3>At a glance</h3><span class="more" data-go="more:report">Full report '+I.chev+'</span></div>'+
  '<div class="stats">'+stats.map(function(s){
    return '<div class="stat '+(s.t==="crit"?"stat--crit":"")+'" data-go="'+s.go+'">'+
      '<span class="stat__tag t-'+s.t+'"></span>'+
      '<div class="stat__lbl">'+s.lbl+'</div>'+
      '<div class="stat__val">'+s.val+(s.sm?'<small>'+s.sm+'</small>':"")+'</div>'+
      '<div class="stat__foot" style="color:'+toneColor(s.t)+'">'+s.foot+'</div>'+
    '</div>';
  }).join("")+'</div>'+

  '<div class="section-label"><h3>Quick actions</h3></div>'+
  '<div class="quick">'+
    qbtn("cap","Capture 360°","capture")+
    qbtn("camera","Photo proof","capture:photos")+
    qbtn("voice","Voice report","capture:voice")+
    qbtn("flag","Raise issue","issues:create")+
    qbtn("clip","Checklists","tasks:checklist")+
    qbtn("box","Material req.","materials:request")+
    qbtn("qr","Scan QR","more:qr")+
    qbtn("report","Daily report","more:report")+
    '<button class="quick__btn is-alarm" data-go="more:emergency"><span class="qi">'+I.siren+'</span><span>Emergency</span></button>'+
  '</div>'+

  '<div class="section-label"><h3>Needs your attention</h3><span class="more" data-act="problems">'+openIssues().length+' open</span></div>'+
  '<div class="alerts">'+ALERTS.map(function(a){
    return '<div class="alert" data-go="'+a.go+'">'+
      '<span class="alert__mark" style="background:'+toneColor(a.tone)+'"></span>'+
      '<div class="alert__body"><div class="alert__t">'+a.t+'</div><div class="alert__d">'+a.d+'</div></div>'+
      '<span class="alert__chev">'+I.chev+'</span>'+
    '</div>';
  }).join("")+'</div>';
}
function qbtn(ic,label,go){return '<button class="quick__btn" data-go="'+go+'"><span class="qi">'+(I[ic]||"")+'</span><span>'+label+'</span></button>';}

/* -------- TASKS -------- */
function tasksView(){
  if(state.sub && state.sub.indexOf("checklist:")===0) return checklistDetail(parseInt(state.sub.split(":")[1],10));
  if(state.sub==="checklist") state.taskTab="checklist";
  var head=screenHead("Tasks","Today's work, quality & sign-offs");
  var seg='<div class="seg">'+
    segBtn("work","Work progress",state.taskTab)+
    segBtn("checklist","Checklists",state.taskTab)+
    segBtn("approvals","Approvals",state.taskTab)+'</div>';
  var body;
  if(state.taskTab==="checklist") body=checklistList();
  else if(state.taskTab==="approvals") body=approvalsList();
  else body=workList();
  return head+seg+body;
}
function workList(){
  return WORKPKGS.filter(function(w){return w.status!=="ok";}).concat(WORKPKGS.filter(function(w){return w.status==="ok";})).map(function(w){
    var done=w.status==="ok";
    var delta=w.pct-w.plan;
    return '<div class="card">'+
      '<div class="card__head"><div><div class="card__title">'+w.name+'</div>'+
        '<div class="card__sub"><span class="card__code">'+w.code+'</span> · '+w.con+'</div></div>'+
        pill(w.lbl,w.status==="ok"?"ok":w.status==="warn"?"warn":"accent")+'</div>'+
      '<div class="bar '+(done?"bar--ok":w.status==="warn"?"bar--warn":"")+'"><i style="width:'+w.pct+'%"></i></div>'+
      '<div class="bar__row"><span>Plan '+w.plan+'% · actual <b>'+w.pct+'%</b></span>'+
        '<span style="color:'+(delta<0?"var(--warn)":"var(--ok)")+'">'+(delta<0?delta+"% behind":"on track")+'</span></div>'+
      (done?'':'<div class="actrow">'+
        '<button class="chipbtn chipbtn--accent" data-act="update-progress" data-code="'+w.code+'">'+I.play+' Update %</button>'+
        '<button class="chipbtn" data-act="add-photo">'+I.camera+' Photo</button>'+
        '<button class="chipbtn" data-go="issues:create">'+I.flag+' Issue</button>'+
        '<button class="chipbtn" data-act="req-inspect" data-name="'+esc(w.name)+'">Inspect</button>'+
      '</div>')+
    '</div>';
  }).join("");
}
function checklistList(){
  return '<div class="chk-lock">'+I.shield+'<div><b>Stage-locked.</b> Concrete pour for Slab GF-1 stays blocked until rebar, sleeve &amp; shuttering checks are engineer-approved.</div></div>'+
    CHECKLIST.map(function(g,i){
      var total=g.items.length, done=g.items.filter(function(x){return x[1]==="done";}).length;
      var pend=g.items.filter(function(x){return x[1]==="pending";}).length;
      return '<div class="lrow" data-go="tasks:checklist:'+i+'">'+
        '<div class="lrow__ic">'+I.clip+'</div>'+
        '<div class="lrow__tx"><b>'+g.grp+'</b><span>'+done+'/'+total+' done'+(pend?' · '+pend+' pending':'')+'</span></div>'+
        '<div class="lrow__rt">'+(done===total?pill("Ready","ok"):pill(total-done+" left","warn"))+'<span class="lrow__chev">'+I.chev+'</span></div>'+
      '</div>';
    }).join("");
}
function checklistDetail(idx){
  var g=CHECKLIST[idx]; if(!g) return tasksView();
  var done=g.items.filter(function(x){return x[1]==="done";}).length;
  return '<button class="backlink" data-go="tasks:checklist">'+I.back+' Checklists</button>'+
    '<div class="screen-title h-display">'+g.grp.split("—")[0]+'</div>'+
    '<div class="muted mt-8" style="font-size:12.5px">'+esc(g.grp)+' · '+done+'/'+g.items.length+' complete · tap to mark</div>'+
    '<div class="card mt-14">'+g.items.map(function(it,i){
      var st=it[1];
      var box=st==="done"?'<span class="chk__box done">'+I.check+'</span>':st==="pending"?'<span class="chk__box pending"></span>':'<span class="chk__box"></span>';
      return '<div class="chk '+(st==="done"?"is-done":"")+'" data-act="toggle-chk" data-g="'+idx+'" data-i="'+i+'">'+
        box+'<span class="chk__lbl">'+it[0]+'</span>'+
        (it[2]&&it[2]!=="—"?'<span class="chk__who">'+it[2]+'</span>':"")+'</div>';
    }).join("")+'</div>'+
    '<div class="card" style="background:var(--accent-wash);border-color:var(--accent-line)"><div class="row-between"><div><div style="font-weight:700;font-size:13px">Mandatory proof</div><div class="muted" style="font-size:11.5px;margin-top:2px">Photo + engineer sign-off required to close</div></div>'+I.shield+'</div></div>'+
    '<div class="btn-row"><button class="btn btn--ghost" data-act="add-photo">'+I.camera+' Add photo</button>'+
    '<button class="btn btn--solid" data-act="req-approval" data-name="'+esc(g.grp)+'">Request approval</button></div>';
}
function approvalsList(){
  var rows=[
    ["Concrete pour — GF Slab","Rebar + MEP photos uploaded · engineer pending","crit","Send to engineer"],
    ["Material purchase — Cement 100 bags","₹38,500 · awaiting builder","warn","Awaiting builder"],
    ["Waterproofing rework — Bath B-2","Re-do corner mesh before 2nd coat","warn","Awaiting builder"],
    ["GF blockwork milestone — 65%","Proof photos verified","info","Ready to claim"]
  ];
  return rows.map(function(r){
    return '<div class="card"><div class="card__head"><div class="card__title" style="font-size:13.5px">'+r[0]+'</div>'+pill(r[3],r[2])+'</div>'+
      '<div class="card__sub" style="margin-top:6px">'+r[1]+'</div>'+
      '<div class="actrow"><button class="chipbtn chipbtn--accent" data-act="approval-send" data-name="'+esc(r[0])+'">Request approval</button>'+
      '<button class="chipbtn" data-act="add-photo">'+I.camera+' Add proof</button></div></div>';
  }).join("");
}

/* -------- CAPTURE -------- */
function captureView(){
  if(state.sub==="photos") return photosView();
  if(state.sub==="voice") return voiceView();
  return capStepper();
}
var CAP_STEPS=["Tower","Floor","Camera","Type","Start point","Walkthrough","Review"];
var TOWERS=[{n:"Tower A — Main villa",d:"G+2 · 6 units",sel:true},{n:"Tower B — Annexe",d:"G+1 · guest block"},{n:"Common amenities",d:"Clubhouse · pool deck"}];
var FLOORS=[{n:"Basement",d:"Parking · services"},{n:"Ground floor",d:"Living · kitchen · 2 baths",hot:true},{n:"First floor",d:"3 bedrooms · 3 baths"},{n:"Second floor",d:"Master suite · terrace"},{n:"Terrace",d:"Roof · OHT"}];
var DEVICES=[{n:"Insta360 X5",d:"8K · 360°",bat:84,ok:true},{n:"Ricoh Theta Z1",d:"Paired",bat:0,ok:false},{n:"GoPro Max",d:"Not found",bat:0,ok:false},{n:"Phone camera",d:"Fallback · this device",bat:62,ok:true}];
var CAPTYPES=[{n:"Full floor walkthrough",d:"Every room · auto-stitched",ic:"cap"},{n:"Single room / zone",d:"One space in detail",ic:"camera"},{n:"Progress comparison",d:"Re-walk yesterday's path",ic:"sync"},{n:"Defect / snag pass",d:"Issue-focused capture",ic:"flag"}];

function capStepper(){
  var s=state.cap.step;
  var bars=CAP_STEPS.map(function(_,i){return '<div class="st '+(i<s?"done":i===s?"cur":"")+'"></div>';}).join("");
  var head='<div class="cap__steps">'+bars+'</div>'+
    '<div class="cap__stepn">STEP '+(s+1)+' / '+CAP_STEPS.length+' · 360° CAPTURE</div>';
  var body, foot;

  if(s===0){
    body='<h2>Which tower?</h2><div class="cap__hint">Pick the right structure so the walkthrough maps correctly. Selecting wrong tower is the #1 cause of mis-mapped captures.</div>'+
      TOWERS.map(function(t){return optRow(t.n,t.d,state.cap.tower===t.n,"cap-pick","tower",t.n,"opt");}).join("");
  } else if(s===1){
    body='<h2>Select floor</h2><div class="cap__hint">Tower A · choose the floor you are standing on.</div>'+
      FLOORS.map(function(f){return optRow(f.n,f.d,state.cap.floor===f.n,"cap-pick","floor",f.n,f.hot?"hot":"");}).join("");
  } else if(s===2){
    body=insta360Connect();
  } else if(s===3){
    body='<h2>Capture type</h2><div class="cap__hint">What kind of pass is this?</div>'+
      CAPTYPES.map(function(t){return optRow(t.n,t.d,state.cap.type===t.n,"cap-pick","type",t.n,"",t.ic);}).join("");
  } else if(s===4){
    body='<h2>Mark your start point</h2><div class="cap__hint">Tap where you are standing on the floor plan. Anchor QRs at key locations will auto-correct the map as you walk.</div>'+
      floorPlan()+
      '<div class="row-between" style="font-size:12px;color:var(--ink-3)"><span>'+I.qr+' 5 anchor QRs on this floor</span>'+(state.cap.start?'<span style="color:var(--ok);font-weight:700">'+I.check+' Start set</span>':'<span>Tap to place pin</span>')+'</div>';
  } else if(s===5){
    return capLive();
  } else if(s===6){
    return capReview();
  }

  var canNext=(s===0&&state.cap.tower)||(s===1&&state.cap.floor)||(s===2&&state.cap.connected)||(s===3&&state.cap.type)||(s===4&&state.cap.start);
  foot='<div class="btn-row" style="margin-top:18px">'+
    (s>0?'<button class="btn btn--ghost" data-act="cap-back" style="flex:0 0 46%">'+I.back+' Back</button>':'')+
    '<button class="btn btn--solid" data-act="cap-next" '+(canNext?'':'disabled')+'>'+(s===4?'Start walkthrough':'Continue')+' '+I.chev+'</button>'+
  '</div>';
  return '<div class="cap">'+head+body+foot+'</div>';
}
function optRow(title,sub,sel,act,k,v,extra,ic){
  return '<div class="opt '+(sel?"is-sel":"")+'" data-act="'+act+'" data-k="'+k+'" data-v="'+esc(v)+'">'+
    '<div class="opt__ic">'+(ic?I[ic]:I.box)+'</div>'+
    '<div class="opt__tx"><b>'+title+'</b><span>'+sub+'</span></div>'+
    (extra==="hot"?'<span class="pill pill--accent" style="font-size:9px">ACTIVE</span>':"")+
    '<div class="opt__check">'+(sel?I.check:"")+'</div></div>';
}
function chkLine(label,t,val){return '<div class="checkline"><span class="pd" style="width:8px;height:8px;border-radius:50%;background:'+toneColor(t)+';display:inline-block"></span>'+label+'<span class="ci" style="color:'+toneColor(t)+'">'+val+'</span></div>';}
function connOpt(name,sub){
  var sel=state.cap.conn===name;
  return '<button class="connpick '+(sel?"is-sel":"")+'" data-act="cap-conn" data-v="'+name+'"><b>'+name+'</b><span>'+sub+'</span></button>';
}
function insta360Connect(){
  var c=state.cap;
  if(c.connected){
    var phone=c.device==="Phone camera";
    return '<h2>'+(phone?"Phone camera ready":"Insta360 X5 connected")+'</h2>'+
      '<div class="cap__hint">'+(phone?"Fallback mode — capturing with this phone's camera.":"Paired to this phone over "+c.conn+". The 360° video records on the Insta360 and streams live to your phone as the viewfinder.")+'</div>'+
      '<div class="insta insta--ok"><div class="insta__cam">'+I.cap+'</div><div class="insta__tx"><b>'+(phone?"Phone camera":"Insta360 X5")+'</b><span>● Connected · live to phone</span></div><span class="pill pill--ok"><span class="pd"></span>LIVE</span></div>'+
      '<div class="card mt-14"><div class="eyebrow" style="margin-bottom:8px">Pre-capture check</div>'+
        chkLine("Camera link — "+c.conn,"ok","Live")+
        chkLine("Battery","ok",phone?"62%":"84%")+
        chkLine("Storage","ok","61 GB free")+
        chkLine("Lens / horizon level","ok","Good")+
        chkLine("Capture mode","ok",phone?"Wide video":"8K 360° video")+
        chkLine("Live preview on phone","ok","Ready")+
      '</div>'+
      '<button class="chipbtn" data-act="cap-disconnect">'+I.x+' Disconnect</button>';
  }
  if(c.connecting){
    return '<h2>Connecting…</h2><div class="cap__hint">Pairing Insta360 X5 with this phone over '+c.conn+'. Keep the camera close.</div>'+
      '<div class="insta insta--busy"><div class="insta__cam spin">'+I.cap+'</div><div class="insta__tx"><b>Insta360 X5</b><span>Handshaking · authorising phone…</span></div><span class="pill pill--warn"><span class="pd"></span>PAIRING</span></div>';
  }
  return '<h2>Connect your Insta360</h2>'+
    '<div class="cap__hint">The 360° walkthrough is shot on the Insta360 X5 and streamed live to this phone — your phone becomes the viewfinder, recorder &amp; quality monitor. Connect the camera to begin.</div>'+
    '<div class="insta"><div class="insta__cam">'+I.cap+'</div><div class="insta__tx"><b>Insta360 X5</b><span>Found nearby · not connected</span></div><span class="pill pill--neutral">OFF</span></div>'+
    '<div class="cap__stepn" style="margin:16px 0 9px">CONNECT TO PHONE VIA</div>'+
    '<div class="devgrid">'+connOpt("Wi-Fi Direct","Fastest · wireless")+connOpt("USB-C cable","Most stable link")+'</div>'+
    '<button class="btn btn--solid mt-14" data-act="cap-connect">'+I.cap+' Connect Insta360 to phone</button>'+
    '<button class="btn btn--ghost mt-8" data-act="cap-usephone">'+I.camera+' Use phone camera instead</button>'+
    '<button class="btn btn--ghost mt-8" data-go="more:bim">'+I.upload+' Import an existing 360\u00b0 file</button>';
}
function floorPlan(){
  var p=state.cap.start;
  return '<div class="floorplan" data-act="set-start">'+
    '<svg viewBox="0 0 300 230" preserveAspectRatio="none">'+
      '<g stroke="#C9BFA6" stroke-width="1.5" fill="none">'+
        '<rect x="20" y="20" width="260" height="190"/>'+
        '<line x1="20" y1="110" x2="170" y2="110"/><line x1="170" y1="20" x2="170" y2="210"/>'+
        '<line x1="95" y1="110" x2="95" y2="210"/><line x1="170" y1="120" x2="280" y2="120"/>'+
        '<line x1="225" y1="20" x2="225" y2="120"/>'+
      '</g>'+
      '<g fill="#8C8268" font-family="JetBrains Mono" font-size="9">'+
        '<text x="70" y="68">LIVING</text><text x="200" y="68">BEDROOM 1</text>'+
        '<text x="36" y="165">BATH B-2</text><text x="120" y="165">KITCHEN</text><text x="200" y="175">STAIR</text>'+
      '</g>'+
    '</svg>'+
    (p?'<div class="pin" style="left:'+p.x+'%;top:'+p.y+'%"></div>':"")+
    '<div class="tap-hint">'+(p?'Start: staircase lobby — tap to move':'Tap your standing position')+'</div>'+
  '</div>';
}
function capLive(){
  var t=state.cap.elapsed;
  var mm=String(Math.floor(t/60)).padStart(2,"0"), ss=String(t%60).padStart(2,"0");
  var light=t>14?"good":"low";
  var dev=state.cap.device||"Insta360 X5";
  var phone=dev==="Phone camera";
  var meters=[
    ["Walking speed","Good","ok"],
    ["Camera tilt","Level","ok"],
    ["Light level",light==="good"?"Good":"Low",light==="good"?"ok":"warn"],
    ["Lens blocked","No","ok"],
    ["Floor selected",state.cap.floor||"GF","ok"],
    ["Anchors hit",state.cap.anchors+" / 5",state.cap.anchors>0?"ok":"warn"]
  ];
  return '<div class="cap__stepn">RECORDING · '+dev.toUpperCase()+' · '+(state.cap.floor||"GROUND FLOOR").toUpperCase()+'</div>'+
    '<div class="live">'+
      '<div class="live__rec"><span class="recdot"></span> REC · '+(phone?"VIDEO":"8K 360°")+'<span class="live__time">'+mm+':'+ss+'</span></div>'+
      '<div class="live__src"><span class="live-dot"></span>'+I.cap+' Live from '+dev+(phone?"":" → "+state.cap.conn)+' · recording to phone</div>'+
      '<div class="live__sphere"><span class="scan"></span><span class="ll">LIVE 360° FEED · '+dev.toUpperCase()+'</span></div>'+
      '<div class="meter">'+meters.map(function(m){
        return '<div class="meter__cell"><div class="meter__lbl">'+m[0]+'</div><div class="meter__val"><span class="pd" style="background:'+toneColor(m[2])+'"></span>'+m[1]+'</div></div>';
      }).join("")+'</div>'+
      (light==="low"?'<div style="margin-top:12px;font-size:11.5px;color:#D9B25A;font-weight:600;display:flex;gap:7px;align-items:center">'+I.bell+' Lighting is low — move slower through this zone.</div>':"")+
      '<button class="live__pin" data-act="pin-issue">'+I.pin+' Pin issue / voice note here</button>'+
      (state.cap.pins.length?'<div class="pinlist">'+state.cap.pins.map(function(p){return '<div class="pinrow">'+I.pin+' '+p.txt+'<span class="pt">'+p.at+'</span></div>';}).join("")+'</div>':"")+
    '</div>'+
    '<button class="btn btn--solid" data-act="cap-stop" style="background:#E0584F">■ Stop &amp; review capture</button>';
}
function capReview(){
  var dur=state.cap.elapsed;
  var mm=Math.floor(dur/60), ss=dur%60;
  return '<div class="cap__stepn">CAPTURE COMPLETE</div>'+
    '<h2 class="h-display" style="font-family:var(--f-display);font-size:26px;margin-bottom:4px">Review quality</h2>'+
    '<div class="cap__hint">'+(state.cap.device||"Insta360 X5")+' · Tower A · '+(state.cap.floor||"Ground floor")+' · '+(state.cap.type||"Full walkthrough")+'</div>'+
    '<div class="live__sphere" style="height:150px;border-radius:14px;margin-bottom:14px"><span class="ll">360° PREVIEW · TAP TO INSPECT</span></div>'+
    '<div class="card">'+
      metaRow("Captured on",state.cap.device||"Insta360 X5") +
      metaRow("Duration",(mm+"m "+(ss<10?"0":"")+ss+"s")) +
      metaRow("Coverage","Good · 96% stitched") +
      metaRow("Anchors detected",state.cap.anchors+" / 5") +
      metaRow("Issues pinned",String(state.cap.pins.length)) +
      metaRow("Quality score",'<span style="color:var(--ok)">A− · usable</span>') +
    '</div>'+
    (state.cap.pins.length?'<div class="section-label"><h3>Pinned on this capture</h3></div>'+state.cap.pins.map(function(p){
      return '<div class="lrow"><div class="lrow__ic">'+I.pin+'</div><div class="lrow__tx"><b>'+p.txt+'</b><span>'+(state.cap.floor||"GF")+' · '+p.at+' into walk</span></div><div class="lrow__rt">'+pill("→ Issue","warn")+'</div></div>';
    }).join(""):"")+
    '<div class="card" style="background:var(--info-wash);border-color:rgba(46,90,107,.25)"><div class="row-between"><div><div style="font-weight:700;font-size:13px;color:var(--info)">'+(state.online?"Will upload now":"Saved locally")+'</div><div class="muted" style="font-size:11.5px;margin-top:3px">'+(state.online?"Compressed preview first, original on Wi-Fi":"1 capture queued · uploads when internet returns")+'</div></div>'+I.upload+'</div></div>'+
    '<button class="btn btn--solid" data-act="cap-analyze">'+I.cap+' Save &amp; analyze vs BIM</button>'+
    '<div class="btn-row mt-8"><button class="btn btn--ghost" data-act="cap-redo">Re-capture</button>'+
    '<button class="btn btn--ghost" data-act="cap-upload">'+I.upload+' Just upload</button></div>';
}
function metaRow(k,v){return '<div class="metarow"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>';}

/* -------- PHOTOS / PROOF -------- */
function photosView(){
  return '<button class="backlink" data-go="capture">'+I.back+' Capture</button>'+
  screenHead("Photo &amp; video proof","AI checks every shot before it counts")+
  '<div class="photoadd" data-act="add-photo">'+I.camera+'<span>Take photo / video — auto-tagged to location &amp; time</span></div>'+
  '<div class="section-label"><h3>AI checks</h3></div>'+
  '<div class="card">'+
    ['Image taken today','Location matches work package','Not a reused photo','Required object visible','Not blurry'].map(function(c){
      return '<div class="checkline"><span class="pd" style="width:8px;height:8px;border-radius:50%;background:var(--ok);display:inline-block"></span>'+c+'<span class="ci" style="color:var(--ok)">'+I.check+'</span></div>';
    }).join("")+'</div>'+
  '<div class="section-label"><h3>Today\'s uploads</h3><span class="more">'+state.photos+' photos</span></div>'+
  '<div class="photostrip">'+Array.from({length:state.photos}).map(function(_,i){
    return '<div class="photothumb">'+I.photo+'<span class="ai-ok">AI ✓</span></div>';
  }).join("")+'<div class="photothumb" style="background:var(--warn-wash);border-color:var(--warn)"><span style="font-size:9px;font-weight:700;color:var(--warn)">REUSED?</span></div></div>'+
  '<div class="muted" style="font-size:11.5px;margin-top:12px">1 photo flagged: possible reuse on "surface cleaning" stage — tap to recapture.</div>';
}

/* -------- VOICE TO REPORT -------- */
function voiceView(){
  var sample="Today ground floor blockwork is 65 percent complete. Plumber finished bathroom 1 rough-in. Cement stock is low, need 100 bags tomorrow. One issue — bedroom 2 door opening is small.";
  return '<button class="backlink" data-go="capture">'+I.back+' Capture</button>'+
  '<div class="voice">'+
    '<div class="eyebrow" style="color:var(--on-dark-2);justify-content:center;display:flex;margin-bottom:10px">VOICE → REPORT</div>'+
    '<h3>Just speak. We\'ll file it.</h3>'+
    '<p>Say your update naturally — Hindi, Telugu or English. We turn it into progress, material requests &amp; issues.</p>'+
    '<div class="mic '+(state.voice.rec?"is-rec":"")+'" data-act="voice-toggle">'+I.mic+'</div>'+
    '<div class="wave">'+Array.from({length:34}).map(function(_,i){
      var h=state.voice.rec?(18+Math.round(26*Math.abs(Math.sin(i*0.7)))):8;
      return '<i style="height:'+h+'%"></i>';
    }).join("")+'</div>'+
    '<div style="font-size:12px;color:var(--on-dark-2);font-weight:600">'+(state.voice.rec?"Listening… tap to stop":state.voice.done?"Transcribed":"Tap the mic to start")+'</div>'+
    (state.voice.done?'<div class="transcript">"'+sample+'"</div>':"")+
  '</div>'+
  (state.voice.done?voiceParsed():'<div class="empty"><div class="ei">'+I.voice+'</div><b>No recording yet</b><span>Your spoken update will be parsed into structured site records.</span></div>');
}
function voiceParsed(){
  return '<div class="section-label"><h3>Parsed into records</h3><span class="more" style="color:var(--ok)">Ready</span></div>'+
  '<div class="parsed">'+
    pSec("Progress update",["GF blockwork → 65% complete","Bathroom 1 plumbing rough-in → completed"],"ok")+
    pSec("Material request",["Cement → 100 bags required tomorrow"],"warn")+
    pSec("Issue raised",["Bedroom 2 door opening size mismatch"],"crit")+
  '</div>'+
  '<button class="btn btn--solid mt-14" data-act="voice-file">'+I.check+' Create all 3 records</button>'+
  '<button class="btn btn--ghost mt-8" data-act="voice-toggle">Re-record</button>';
}
function pSec(title,items,t){
  return '<div class="parsed__sec"><h4><span class="pd" style="width:7px;height:7px;border-radius:50%;background:'+toneColor(t)+';display:inline-block"></span>'+title+'</h4>'+
    items.map(function(it){return '<div class="parsed__item"><span class="pj" style="color:'+toneColor(t)+'">'+I.chev+'</span>'+it+'<span class="made">+1</span></div>';}).join("")+'</div>';
}

/* -------- MATERIALS -------- */
function materialsView(){
  if(state.sub==="request") return materialRequestForm();
  if(state.sub==="requests") state.matTab="requests";
  var head=screenHead("Materials","Stock, requests, receipts &amp; issue");
  var seg='<div class="seg">'+segBtn("stock","Stock",state.matTab)+segBtn("requests","Requests",state.matTab)+segBtn("issue","Issue",state.matTab)+'</div>';
  var body;
  if(state.matTab==="requests") body=matRequests();
  else if(state.matTab==="issue") body=matIssue();
  else body=matStock();
  return head+seg+body+'<button class="btn btn--solid mt-14" data-go="materials:request">'+I.plus+' New material request</button>';
}
function matStock(){
  return MATERIALS.map(function(m){
    return '<div class="lrow" data-act="mat-detail" data-name="'+esc(m.name)+'">'+
      '<div class="lrow__ic" style="color:'+toneColor(m.status)+'">'+I.box+'</div>'+
      '<div class="lrow__tx"><b>'+m.name+'</b><span>'+m.stock+' '+m.unit+' · use '+m.rate+' · '+m.po+'</span></div>'+
      '<div class="lrow__rt">'+pill(m.days?m.days+"d left":"empty",m.status)+'<span class="lrow__chev">'+I.chev+'</span></div>'+
    '</div>';
  }).join("");
}
function matRequests(){
  return MAT_REQUESTS.map(function(r){
    return '<div class="card"><div class="card__head"><div><div class="card__title" style="font-size:14px">'+r.mat+'</div><div class="card__sub">'+r.qty+' · for '+r.for+'</div></div>'+pill(r.sev==="crit"?"High":"Normal",r.sev)+'</div>'+
      '<div class="metarow" style="border-top:1px solid var(--hair);margin-top:10px"><span class="k">Needed by</span><span class="v">'+r.by+'</span></div>'+
      '<div class="metarow"><span class="k">Status</span><span class="v">'+r.status+'</span></div></div>';
  }).join("");
}
function matIssue(){
  return '<div class="muted" style="font-size:12.5px;margin-bottom:12px">Issue material from store to a contractor — photo proof &amp; receiver sign-off required.</div>'+
    [["Cement → ABC Mason Team","25 bags · GF blockwork · today 09:10","ok"],
     ["AAC blocks → ABC Mason Team","450 nos · GF blockwork · today 08:30","ok"],
     ["Waterproof compound → Imran","18 kg · Bath B-2 · yesterday","ok"]].map(function(r){
      return '<div class="lrow"><div class="lrow__ic">'+I.truck+'</div><div class="lrow__tx"><b>'+r[0]+'</b><span>'+r[1]+'</span></div><div class="lrow__rt">'+pill("Signed","ok")+'</div></div>';
    }).join("")+
    '<button class="btn btn--ghost mt-8" data-act="mat-issue-new">'+I.plus+' Issue material to contractor</button>';
}
function materialRequestForm(){
  return '<button class="backlink" data-go="materials">'+I.back+' Materials</button>'+
  screenHead("Request material","Goes to builder for approval")+
  '<div class="field"><label>Material</label><select><option>Cement (OPC 53)</option><option>Steel (Fe500D)</option><option>River sand</option><option>20mm aggregate</option><option>AAC blocks</option><option>Waterproof compound</option></select></div>'+
  '<div class="field"><label>Quantity</label><input inputmode="numeric" placeholder="e.g. 100 bags"/></div>'+
  '<div class="field"><label>Needed for</label><input placeholder="e.g. First floor plastering"/></div>'+
  '<div class="field"><label>Required by</label><div class="optgrid"><button class="optpick is-sel">Today</button><button class="optpick">Tomorrow</button><button class="optpick">In 2 days</button></div></div>'+
  '<div class="field"><label>Priority</label><div class="optgrid"><button class="optpick sev-low">Low</button><button class="optpick sev-warn is-sel">Normal</button><button class="optpick sev-crit">High</button></div></div>'+
  '<div class="card" style="background:var(--paper-3)"><div class="metarow" style="padding-top:0"><span class="k">Current stock</span><span class="v">22 bags · ~2 days</span></div><div class="metarow"><span class="k">Expected usage</span><span class="v">~22 bags/day</span></div></div>'+
  '<button class="btn btn--solid mt-8" data-act="submit-request">Send request to builder</button>';
}

/* -------- ISSUES -------- */
function issuesView(){
  if(state.sub==="create") return createIssueForm();
  if(state.sub && state.sub.indexOf("sub:")===0) return issueDetail(state.sub.split(":")[1]);
  var head=screenHead("Site issues","Snags, safety &amp; quality — one tap to raise");
  var filters=[["all","All"],["Quality","Quality"],["Safety","Safety"],["Material","Material"],["Drawing mismatch","Drawing"]];
  var chips='<div class="chips">'+filters.map(function(f){
    return '<button class="fc '+(state.issueFilter===f[0]?"is-active":"")+'" data-act="issue-filter" data-v="'+f[0]+'">'+f[1]+'</button>';
  }).join("")+'</div>';
  var list=ISSUES.filter(function(i){return state.issueFilter==="all"||i.type===state.issueFilter;});
  var body=list.map(function(i){
    return '<div class="lrow" data-go="issues:sub:'+i.id+'">'+
      '<div class="lrow__ic" style="color:'+toneColor(i.sev)+'">'+(i.type==="Safety"?I.shield:i.type==="Material"?I.box:I.flag)+'</div>'+
      '<div class="lrow__tx"><b>'+i.t+'</b><span><span class="mono">'+i.id+'</span> · '+i.loc+' · '+i.who+'</span></div>'+
      '<div class="lrow__rt">'+statusPill(i.status)+'<span class="muted mono" style="font-size:10px">'+i.age+'</span></div>'+
    '</div>';
  }).join("");
  return head+chips+(list.length?body:'<div class="empty"><div class="ei">'+I.check+'</div><b>Nothing here</b><span>No '+state.issueFilter+' issues open.</span></div>')+
    '<button class="btn btn--solid mt-14" data-go="issues:create">'+I.plus+' Raise an issue</button>';
}
function issueDetail(id){
  var i=ISSUES.filter(function(x){return x.id===id;})[0]; if(!i) return issuesView();
  return '<button class="backlink" data-go="issues">'+I.back+' Issues</button>'+
    '<div class="row-between"><div class="eyebrow">'+i.id+' · '+i.type+'</div>'+pill(i.sev==="crit"?"Critical":i.sev==="warn"?"Medium":"Low",i.sev)+'</div>'+
    '<div class="screen-title h-display" style="font-size:24px;margin-top:8px">'+i.t+'</div>'+
    '<div class="photothumb" style="width:100%;height:160px;border-radius:14px;margin:14px 0">'+I.photo+'</div>'+
    '<div class="card">'+
      metaRow("Status",statusPill(i.status))+
      metaRow("Location",i.loc)+
      metaRow("Assigned to",i.who)+
      metaRow("Raised",i.age+" ago")+
      metaRow("Due","Today")+
    '</div>'+
    (["Open","Assigned","In progress","Reopened"].indexOf(i.status)>-1?
      '<div class="btn-row"><button class="btn btn--ghost" data-act="add-photo">'+I.camera+' Add proof</button>'+
      '<button class="btn btn--ok" data-act="resolve-issue" data-id="'+i.id+'">'+I.check+' Mark fixed</button></div>'
      :'<button class="btn btn--ghost" data-act="reopen-issue" data-id="'+i.id+'">Reopen issue</button>');
}
function createIssueForm(){
  var c=state.createIssue;
  var types=["Quality","Safety","Material","Drawing mismatch","Delay","Rework"];
  return '<button class="backlink" data-go="issues">'+I.back+' Issues</button>'+
  screenHead("Raise an issue","Photo first. Three taps. Done.")+
  '<div class="photoadd" data-act="ci-photo">'+I.camera+'<span>'+(c.photos?c.photos+" photo(s) attached — tap to add more":"Take photo / video of the problem")+'</span></div>'+
  (c.photos?'<div class="photostrip">'+Array.from({length:c.photos}).map(function(){return '<div class="photothumb">'+I.photo+'<span class="ai-ok">AI ✓</span></div>';}).join("")+'</div>':"")+
  '<div class="field mt-14"><label>Location</label><div class="row-between" style="gap:8px"><input id="ci-loc" placeholder="Room / grid / area" value="'+esc(c.loc)+'" style="flex:1"/><button class="iconbtn" data-go="more:qr" title="Scan QR">'+I.qr+'</button></div></div>'+
  '<div class="field"><label>Issue type</label><div class="optgrid">'+types.map(function(t){
    return '<button class="optpick '+(c.type===t?"is-sel":"")+'" data-act="ci-type" data-v="'+t+'">'+t+'</button>';
  }).join("")+'</div></div>'+
  '<div class="field"><label>Severity</label><div class="optgrid">'+
    '<button class="optpick sev-low '+(c.sev==="low"?"is-sel":"")+'" data-act="ci-sev" data-v="low">Low</button>'+
    '<button class="optpick sev-warn '+(c.sev==="warn"?"is-sel":"")+'" data-act="ci-sev" data-v="warn">Medium</button>'+
    '<button class="optpick sev-crit '+(c.sev==="crit"?"is-sel":"")+'" data-act="ci-sev" data-v="crit">Critical</button></div></div>'+
  '<div class="field"><label>Assign to</label><select id="ci-who"><option>ABC Mason Team</option><option>Sri Sai Plumbers</option><option>BuildRight Civil</option><option>Waterproofing team</option><option>Safety officer</option><option>Storekeeper</option></select></div>'+
  '<div class="field"><label>Describe (optional — or use voice)</label><textarea id="ci-desc" placeholder="What is wrong? Tap mic to speak…"></textarea></div>'+
  '<button class="btn btn--solid" data-act="submit-issue">'+I.flag+' Submit issue</button>';
}

/* -------- MORE -------- */
function moreView(){
  if(state.sub==="labor") return laborView();
  if(state.sub==="report") return reportView();
  if(state.sub==="drawings") return drawingsView();
  if(state.sub==="safety") return safetyView();
  if(state.sub==="qr") return qrView();
  if(state.sub==="contractors") return contractorsView();
  if(state.sub==="offline") return offlineView();
  if(state.sub==="emergency") return emergencyView();
  if(state.sub==="visit") return visitView();
  if(state.sub==="measure") return measureView();
  if(state.sub==="bim") return bimListView();
  if(state.sub && state.sub.indexOf("bim:")===0) return bimDetailView(state.sub.split(":")[1]);
  if(state.sub && state.sub.indexOf("analyze:")===0) return bimAnalyzeView(state.sub.split(":")[1]);
  var openDisc=DISCREPANCIES.filter(function(d){return d.status==="open";}).length;
  var items=[
    ["cap","BIM × 360 analysis","Compare capture vs model","bim",String(openDisc||"")],
    ["people","Labour & attendance",laborTotal()+" on site now","labor",null],
    ["report","Daily report","Auto-built · review & submit","report",null],
    ["draw","Drawings","Latest revisions · offline","drawings","1"],
    ["shield","Safety","Daily checks + AI alerts","safety","2"],
    ["qr","Scan location QR","Open room context instantly","qr",null],
    ["hardhat","Contractors","6 teams · scores & work","contractors",null],
    ["ruler","Measurement","AR & manual field checks","measure",null],
    ["people","Customer visit","Mr. & Mrs. Rao · 11:30","visit",null],
    ["sync","Offline sync",state.pending+" items pending","offline",state.pending],
    ["siren","Emergency","SOS · accident · fire","emergency",null]
  ];
  return screenHead("More","Everything else, one tap away")+
  '<div class="menu">'+items.map(function(it){
    return '<div class="menu__item" data-go="more:'+it[3]+'">'+
      (it[4]?'<span class="badge pill pill--accent" style="font-size:9px">'+it[4]+'</span>':"")+
      '<div class="mi">'+(I[it[0]]||"")+'</div>'+
      '<b>'+it[1]+'</b><span>'+it[2]+'</span></div>';
  }).join("")+'</div>'+
  '<div class="card mt-18" style="background:var(--char);color:var(--on-dark);border:none">'+
    '<div class="row-between"><div><div style="font-family:var(--f-display);font-size:18px;font-weight:600">Murali Krishna</div><div style="font-size:11.5px;color:var(--on-dark-2);margin-top:2px">Site Supervisor · Sky Villa</div></div><div class="avatar">MK</div></div>'+
    '<div class="actrow" style="margin-top:14px"><button class="chipbtn" style="background:var(--char-3);border-color:var(--char-3);color:var(--on-dark)" data-act="role">Switch role</button><button class="chipbtn" style="background:var(--char-3);border-color:var(--char-3);color:var(--on-dark)" data-go="more:offline">Sync settings</button></div>'+
  '</div>'+
  '<div class="center muted" style="font-size:11px;margin-top:18px">Sthyra CPM · Supervisor · <em style="font-family:var(--f-display);font-size:13px">Build with proof.</em><br><span class="mono" style="font-size:9px;opacity:.7">build: 360\u2194BIM compare \u00b7 v3</span></div>';
}

function laborView(){
  return back("more")+screenHead("Labour & attendance","Live site presence")+
  '<div class="card" style="background:var(--char);color:var(--on-dark);border:none"><div class="row-between"><div><div class="eyebrow" style="color:var(--on-dark-2)">ON SITE NOW</div><div style="font-family:var(--f-mono);font-size:40px;font-weight:600;margin-top:4px">'+laborTotal()+'</div></div><div style="text-align:right;font-size:11.5px;color:var(--on-dark-2);line-height:1.6">Peak today 46<br>Avg 39<br>Planned 48</div></div></div>'+
  '<div class="btn-row mt-8"><button class="btn btn--solid" data-act="labor-checkin">'+I.qr+' Check-in (scan)</button><button class="btn btn--ghost" data-act="labor-add">'+I.plus+' Add worker</button></div>'+
  '<div class="section-label"><h3>By trade</h3></div>'+
  '<div class="roster">'+LABOR.map(function(l){
    return '<div class="rost"><div class="rost__top"><div class="rost__n">'+l.count+'</div><div class="rost__dot" style="background:'+l.c+'">'+l.team[0]+'</div></div><div class="rost__l">'+l.team+'</div></div>';
  }).join("")+'</div>'+
  '<div class="section-label"><h3>Others on site</h3></div>'+
  '<div class="card">'+PRESENCE.map(function(p){
    return '<div class="metarow"><span class="k">'+p[0]+(p[0]==="Unknown"?' <span class="pill pill--crit" style="font-size:9px">verify</span>':"")+'</span><span class="v">'+p[1]+'</span></div>';
  }).join("")+'</div>';
}

function reportView(){
  var lab=laborTotal();
  return back("more")+
  '<div class="report">'+
    '<div class="report__hd"><div class="eyebrow">Sthyra CPM · daily site report</div><h2>Sky Villa — Kokapet</h2><div class="muted mono" style="font-size:11px">FRI · 13 JUNE 2026 · auto-compiled 6:05 PM</div></div>'+
    rSec("Work completed",[bul("GF blockwork advanced to 65% (plan 70%)"),bul("Bathroom B-1 plumbing rough-in completed"),bul("GF slab curing — day 3 of 7")])+
    rSec("Labour",[rLine("Peak count","46"),rLine("Average","39"),rLine("On site now",String(lab))])+
    rSec("Materials",[rLine("Cement issued","25 bags"),rLine("AAC blocks issued","450 nos"),rLine("River sand","in transit"),rLine("Cement stock","22 bags · 2d")])+
    rSec("Quality & safety",[rLine("Checklists done","3"),rLine("Issues opened","2"),rLine("Issues closed","1"),rLine("Safety flags","1 open edge")])+
    rSec("Capture",[rLine("360° walkthrough","pending"),rLine("Photos","12 · all verified")])+
    rSec("Tomorrow",[bul("Approve & receive 100 cement bags"),bul("Continue GF blockwork to 80%"),bul("Close bedroom-2 door opening issue")])+
  '</div>'+
  '<div class="btn-row mt-14"><button class="btn btn--ghost" data-act="report-voice">'+I.mic+' Add voice note</button><button class="btn btn--solid" data-act="report-submit">Submit to builder</button></div>';
}
function rSec(t,rows){return '<div class="report__sec"><h4>'+t+'</h4>'+rows.join("")+'</div>';}
function rLine(k,v){return '<div class="report__line"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>';}
function bul(t){return '<div class="report__bul">'+t+'</div>';}

function drawingsView(){
  return back("more")+screenHead("Drawings","Latest revisions · works offline")+
  '<div class="draw-warn">'+I.bell+'<div>You opened <b>P-105 Rev 02</b> — latest is <b>Rev 03</b> (14 May). Many site errors come from old drawings. Tap to load the current set.</div></div>'+
  DRAW_SETS.map(function(d){
    return '<div class="drawcard">'+
      '<div class="drawcard__canvas"><svg class="lines" viewBox="0 0 300 140" preserveAspectRatio="none"><g stroke="#9FB4BC" stroke-width="1" fill="none" opacity=".7"><rect x="30" y="20" width="240" height="100"/><line x1="150" y1="20" x2="150" y2="120"/><line x1="30" y1="70" x2="150" y2="70"/><circle cx="90" cy="45" r="10"/><line x1="200" y1="20" x2="200" y2="120"/></g></svg></div>'+
      '<div class="drawcard__body"><div class="row-between"><div><div class="card__title" style="font-size:13.5px">'+d.name+'</div><div class="card__sub"><span class="mono">'+d.rng+'</span> · '+d.when+'</div></div><div style="text-align:right">'+pill(d.rev,d.status==="ok"?"ok":"warn")+'<div class="muted" style="font-size:10px;margin-top:4px">'+(d.status==="ok"?"current":"update due")+'</div></div></div>'+
      '<div class="actrow"><button class="chipbtn chipbtn--accent">Open</button><button class="chipbtn">'+I.flag+' Mark on drawing</button><button class="chipbtn">Compare rev</button></div></div></div>';
  }).join("");
}

function safetyView(){
  var done=SAFETY.filter(function(s){return s[1]==="done";}).length, score=Math.round(done/SAFETY.length*100);
  return back("more")+screenHead("Safety","Daily checks + camera AI alerts")+
  '<div class="safety-score"><div class="ring"><svg viewBox="0 0 74 74" width="74" height="74"><circle cx="37" cy="37" r="31" fill="none" stroke="var(--paper-4)" stroke-width="7"/><circle cx="37" cy="37" r="31" fill="none" stroke="'+(score>80?"var(--ok)":"var(--warn)")+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*31)+'" stroke-dashoffset="'+(2*Math.PI*31*(1-score/100))+'"/></svg><div class="ring__v">'+score+'</div></div><div><div style="font-weight:700;font-size:15px">Site safety score</div><div class="muted" style="font-size:12px;margin-top:3px">'+done+' of '+SAFETY.length+' checks passed · 2 open</div></div></div>'+
  '<div class="card" style="background:var(--accent-wash);border-color:var(--accent-line)"><div class="eyebrow" style="color:var(--accent);margin-bottom:8px">⚠ AI alert · camera 3 — material yard</div><div style="font-weight:700;font-size:13.5px">Open slab edge without barricade</div><div class="muted" style="font-size:12px;margin-top:4px">Detected 7 min ago · workers within 3 m. Confirm and raise a critical issue.</div><div class="actrow"><button class="chipbtn chipbtn--accent" data-go="issues:create">Raise critical issue</button><button class="chipbtn">Dismiss</button></div></div>'+
  '<div class="section-label"><h3>Daily safety checklist</h3></div>'+
  '<div class="card">'+SAFETY.map(function(s,i){
    var st=s[1], box=st==="done"?'<span class="chk__box done">'+I.check+'</span>':st==="pending"?'<span class="chk__box pending"></span>':'<span class="chk__box"></span>';
    return '<div class="chk '+(st==="done"?"is-done":"")+'" data-act="toggle-safety" data-i="'+i+'">'+box+'<span class="chk__lbl">'+s[0]+'</span></div>';
  }).join("")+'</div>';
}

function qrView(){
  return back("more")+screenHead("Scan location QR","Open the exact site context")+
  '<div class="qrscan"><div class="qrframe"><span></span><span></span><span></span><span></span><div class="laser"></div></div><div class="qhint">Point at a location QR sticker</div></div>'+
  '<button class="btn btn--solid" data-act="qr-demo">'+I.qr+' Simulate scan — Bathroom B-2</button>'+
  '<div class="section-label"><h3>Recent scans</h3></div>'+
  QRLOCS.map(function(q){
    return '<div class="lrow" data-act="qr-open" data-name="'+esc(q.name)+'"><div class="lrow__ic">'+I.qr+'</div><div class="lrow__tx"><b>'+q.name+'</b><span><span class="mono">'+q.id+'</span> · '+q.type+' · '+q.last+'</span></div><div class="lrow__rt">'+(q.pending?pill(q.pending+" pending","warn"):pill("clear","ok"))+'</div></div>';
  }).join("");
}

function contractorsView(){
  var rows=[
    ["ABC Mason Team","GF blockwork",12,"1,500 blocks · 25 cement",3,78],
    ["Sri Sai Plumbers","Plumbing rough-in",4,"40 m pipe · 12 fittings",1,84],
    ["BuildRight Civil","RCC / slab",4,"—",0,91],
    ["Imran Waterproofing","Bath B-2",3,"18 kg compound",2,69]
  ];
  return back("more")+screenHead("Contractors","Teams on site today")+
  rows.map(function(r){
    return '<div class="card"><div class="card__head"><div><div class="card__title" style="font-size:14px">'+r[0]+'</div><div class="card__sub">'+r[1]+' · '+r[2]+' labour today</div></div><div style="text-align:right"><div style="font-family:var(--f-mono);font-size:18px;font-weight:600;color:'+(r[5]>80?"var(--ok)":r[5]>70?"var(--warn)":"var(--accent)")+'">'+r[5]+'</div><div class="muted" style="font-size:9px">QUALITY</div></div></div>'+
      '<div class="metarow" style="border-top:1px solid var(--hair);margin-top:8px"><span class="k">Material issued</span><span class="v">'+r[3]+'</span></div>'+
      '<div class="metarow"><span class="k">Open issues</span><span class="v" style="color:'+(r[4]?"var(--accent)":"var(--ok)")+'">'+r[4]+'</span></div></div>';
  }).join("");
}

function offlineView(){
  return back("more")+screenHead("Offline sync","Capture now, sync when connected")+
  '<div class="card" style="background:'+(state.online?"var(--ok-wash)":"var(--warn-wash)")+';border-color:'+(state.online?"var(--ok)":"var(--warn)")+'"><div class="row-between"><div><div style="font-weight:700;font-size:14px;color:'+(state.online?"var(--ok)":"var(--warn)")+'">'+(state.online?"Online · synced":"Offline mode")+'</div><div class="muted" style="font-size:11.5px;margin-top:3px">'+(state.online?"All site data backed up to cloud":state.pending+" items waiting for a connection")+'</div></div>'+I.sync+'</div></div>'+
  '<div class="card">'+
    metaRow("Items pending sync",String(state.pending))+
    metaRow("Photos pending upload",String(state.photos))+
    metaRow("360° captures pending",String(state.captures))+
    metaRow("Last full sync","Today 5:48 PM")+
  '</div>'+
  '<div class="muted" style="font-size:12px;margin:4px 2px 12px">Captures, checklists, issues, QR scans &amp; attendance all work fully offline. Uploads resume automatically — preview first, originals on Wi-Fi.</div>'+
  '<button class="btn '+(state.online?"btn--ghost":"btn--solid")+'" data-act="toggle-online">'+(state.online?"Simulate going offline":I.sync+" Sync now")+'</button>';
}

function emergencyView(){
  var acts=[["Report accident","Injury on site"],["Report fire","Fire / smoke"],["Report theft","Material / equipment"],["Structural concern","Crack / collapse risk"]];
  return back("more")+screenHead("Emergency","Fast actions — no forms")+
  '<button class="btn" style="background:#C0392B;color:#fff;padding:20px;font-size:16px" data-act="sos">'+I.siren+' SEND SOS TO BUILDER & ADMIN</button>'+
  '<div class="muted center" style="font-size:11.5px;margin:10px 0 16px">Shares live location, time &amp; your number with builder, PM &amp; emergency contacts.</div>'+
  '<div class="menu">'+acts.map(function(a){
    return '<div class="menu__item" data-act="emergency-report" data-name="'+esc(a[0])+'" style="border-color:var(--accent-line)"><div class="mi">'+I.siren+'</div><b>'+a[0]+'</b><span>'+a[1]+'</span></div>';
  }).join("")+'</div>'+
  '<div class="section-label"><h3>Emergency contacts</h3></div>'+
  '<div class="card">'+[["Builder — Mr. Reddy","+91 98xxx 11020"],["Project manager","+91 98xxx 44518"],["Ambulance","108"],["Fire","101"]].map(function(c){
    return '<div class="metarow"><span class="k">'+c[0]+'</span><span class="v mono">'+c[1]+'</span></div>';
  }).join("")+'</div>';
}

function visitView(){
  return back("more")+screenHead("Customer visit","Professional client handling")+
  '<div class="card"><div class="card__head"><div><div class="card__title">Mr. &amp; Mrs. Rao</div><div class="card__sub">Owners · Unit A-2 · today 11:30 AM</div></div>'+pill("Scheduled","info")+'</div>'+
  '<div class="metarow" style="border-top:1px solid var(--hair);margin-top:10px"><span class="k">Purpose</span><span class="v">Progress walkthrough</span></div>'+
  '<div class="metarow"><span class="k">Allowed zones</span><span class="v">GF · 1st floor</span></div>'+
  '<div class="metarow"><span class="k">PPE issued</span><span class="v">2 helmets · vests</span></div></div>'+
  '<div class="btn-row"><button class="btn btn--ghost" data-act="visit-checkin">Check-in visitor</button><button class="btn btn--solid" data-act="visit-share">Share photos after</button></div>';
}

function measureView(){
  return back("more")+screenHead("Measurement","AR &amp; manual field checks")+
  '<div class="card"><div class="eyebrow" style="margin-bottom:8px">AR MEASURE · LIVE</div><div class="live__sphere" style="height:150px;background:repeating-linear-gradient(90deg,#2a2722 0 1px,transparent 1px 28px),radial-gradient(120% 120% at 50% 30%,#3a352d,#1c1a16)"><span class="ll">POINT AT DOOR OPENING</span></div></div>'+
  '<div class="card"><div class="card__title" style="font-size:14px">Bedroom 2 — door opening</div>'+
    metaRow("Expected (spec)","900 mm")+metaRow("Measured","850 mm")+metaRow("Deviation",'<span style="color:var(--accent)">−50 mm</span>')+
    '<button class="btn btn--solid mt-8" data-go="issues:create">'+I.flag+' Create issue from deviation</button></div>'+
  '<button class="btn btn--ghost" data-act="measure-manual">'+I.ruler+' Manual measurement entry</button>';
}

/* ============================================================ BIM × 360 ANALYSIS */
function discTone(s){return s==="crit"?"crit":s==="warn"?"warn":"ok";}
function discBySev(){return {crit:DISCREPANCIES.filter(function(d){return d.severity==="crit";}).length,warn:DISCREPANCIES.filter(function(d){return d.severity==="warn";}).length,low:DISCREPANCIES.filter(function(d){return d.severity==="low";}).length};}
function discColor(disc){return disc==="MEP"?"#5B6E4A":disc==="PLUMB"?"#2E5A6B":disc==="STRUCT"?"#9A7B2E":"#6B1F2A";}

/* ---- Insta360: real 360 viewer + import + on-device frame extraction ---- */
function instaHasMedia(){return !!(state.insta&&state.insta.src);}
function ensureImportCapture(){
  if(CAPTURES.some(function(c){return c.id==="CAP-IMPORT";})) return;
  CAPTURES.unshift({id:"CAP-IMPORT",floor:"Imported walkthrough",zone:state.insta.name||"Insta360 import",device:"Insta360 · imported",duration_s:0,distance_m:0,frame_count:0,coverage_pct:0,quality_score:null,status:"processing",processing_step:0,model_version:"on-device CV + CLIP (free)",started:"Just now",steps:[]});
}
function instaStatusHTML(){
  var s=state.insta;
  if(s.busy) return '<div class="card center" style="padding:14px;margin-top:10px"><span class="spin" style="display:inline-block">'+I.sync+'</span> '+esc(s.prog||"extracting frames…")+'</div>';
  if(s.frames) return '<div class="card" style="background:var(--ok-wash);border-color:var(--ok);font-size:12px;color:var(--ok);font-weight:650;margin-top:10px">✓ '+s.frames+' perspective frames extracted on-device — now feeding the CV &amp; CLIP checks.</div>'+
    '<div class="btn-row mt-8"><button class="btn btn--ghost" data-act="insta-extract">'+I.sync+' Re-extract</button><button class="btn btn--solid" data-go="more:bim:CAP-IMPORT">'+I.cap+' Open analysis</button></div>';
  return '<button class="btn btn--solid mt-8" data-act="insta-extract">'+I.camera+' Extract frames for analysis</button>';
}
function instaImportPanel(){
  var s=state.insta;
  var head='<div class="section-label"><h3>Insta360 walkthrough · <em style="font-family:var(--f-display);font-style:italic">live 3D</em></h3><span class="more mono" style="font-size:9px">three.js · on-device</span></div>'+
    '<div class="muted" style="font-size:11.5px;margin:-4px 2px 10px;line-height:1.4">Import an Insta360 equirectangular walkthrough (.mp4 / .jpg) — pan it in real 3D, then extract perspective frames that feed the on-device CV &amp; CLIP checks. No upload, no API.</div>';
  if(!instaHasMedia()){
    return head+
      '<button class="btn btn--solid" data-act="insta-pick">'+I.cap+' Import 360° walkthrough</button>'+
      '<button class="btn btn--ghost mt-8" data-act="insta-demo">'+I.play+' Load sample walkthrough</button>';
  }
  return head+
    compareSplitView()+
    '<div class="row-between" style="margin-top:6px"><span class="muted mono" style="font-size:10px">drag the divider to compare · '+esc(s.name||"360 walkthrough")+' · '+(s.kind==="video"?"video":"photo")+'</span>'+
      '<button class="chipbtn" data-act="insta-clear">'+I.x+' Remove</button></div>'+
    '<div id="insta-status">'+instaStatusHTML()+'</div>';
}
function mountSphere(){
  var el=$("#sphere360"); if(!el||!window.__INSTA360||!state.insta.src) return;
  if(instaViewer){try{instaViewer.dispose();}catch(_){}instaViewer=null;}
  el.innerHTML='<div class="center muted" style="padding:60px 0;font-size:12px"><span class="spin" style="display:inline-block">'+I.sync+'</span> loading 360 viewer…</div>';
  window.__INSTA360.createSphereViewer(el,{src:state.insta.src,video:state.insta.kind==="video",autorotate:state.insta.autorotate})
    .then(function(v){instaViewer=v;})
    .catch(function(e){ var x=$("#sphere360"); if(x)x.innerHTML='<div class="center muted" style="padding:40px 12px;font-size:12px">360 viewer needs three.js (network). '+esc((e&&e.message)||"")+'</div>'; });
}
function paintInstaStatus(){var el=$("#insta-status"); if(el) el.innerHTML=instaStatusHTML();}
function onInstaImport(file){
  if(!file) return;
  var __nm=(file.name||"").toLowerCase();
  if(/\.(insv|insp)$/.test(__nm)){ toast("Raw Insta360 .insv is dual-fisheye \u2014 export an equirectangular .mp4/.jpg from Insta360 Studio, then import.","warn"); return; }
  if(instaViewer){try{instaViewer.dispose();}catch(_){}instaViewer=null;}
  var isVid=/^video/.test(file.type||"")||/\.(mp4|mov|insv|webm)$/i.test(file.name||"");
  var url=URL.createObjectURL(file);
  state.insta={src:url,kind:isVid?"video":"image",name:file.name||"360 file",demo:false,busy:false,prog:"",frames:0,autorotate:true};
  ensureImportCapture(); toast("Loaded "+(file.name||"360 file")+" · drag to look around");
  nav("more","bim");
}
function onInstaDemo(){
  if(instaViewer){try{instaViewer.dispose();}catch(_){}instaViewer=null;}
  state.insta={src:INSTA_DEMO.video,kind:"video",name:INSTA_DEMO.name,demo:true,busy:false,prog:"",frames:0,autorotate:true};
  ensureImportCapture(); toast("Loading sample Insta360 walkthrough…");
  nav("more","bim");
}
function instaClear(){
  if(instaViewer){try{instaViewer.dispose();}catch(_){}instaViewer=null;}
  if(state.insta.src&&!state.insta.demo){try{URL.revokeObjectURL(state.insta.src);}catch(_){}}
  state.insta={src:null,kind:null,name:null,demo:false,busy:false,prog:"",frames:0,autorotate:true};
  render();
}
function instaExtract(){
  if(!window.__INSTA360){toast("360 engine not loaded","warn");return;}
  var s=state.insta; if(!s.src) return;
  s.busy=true; s.prog="decoding 360° "+(s.kind==="video"?"video":"photo")+"…"; paintInstaStatus();
  window.__INSTA360.extractFrames(s.src,{video:s.kind==="video",count:12,fov:90,yawWalk:s.kind==="video",
    onProgress:function(p){ state.insta.prog="extracting frame "+p.done+"/"+p.total+(p.t!=null?" @"+(+p.t).toFixed(1)+"s":""); paintInstaStatus(); }})
  .then(function(frames){
    replaceArr(FRAMES,frames);
    state.bim.cv=null; state.bim.model=null;
    s.busy=false; s.frames=frames.length;
    var cap=CAPTURES.filter(function(c){return c.id==="CAP-IMPORT";})[0];
    if(cap){cap.frame_count=frames.length;cap.status="analyzed";cap.duration_s=Math.round(frames[frames.length-1].t)||frames.length;cap.coverage_pct=90;cap.quality_score="on-device";}
    toast(frames.length+" frames extracted from the 360° walkthrough");
    render();
  }).catch(function(e){ state.insta.busy=false; toast("Frame extraction failed: "+((e&&e.message)||e),"warn"); render(); });
}

/* ---- split-screen drag compare (360 as-built  vs  MEP BIM / floor plan / Revit) ---- */
/* ---- locked BIM walk: drive the BIM camera from the recovered Insta360 path ---- */
function loadTraj(){
  if(state.cmp.traj) return Promise.resolve(state.cmp.traj);
  return fetch("assets/insta360/office-trajectory.json").then(function(r){return r.ok?r.json():null;}).then(function(j){ if(j) state.cmp.traj=j; return j; }).catch(function(){ return null; });
}
function trajAt(f){
  var pts=state.cmp.traj&&state.cmp.traj.points; if(!pts||!pts.length) return null;
  if(f<=pts[0].f) return pts[0]; if(f>=pts[pts.length-1].f) return pts[pts.length-1];
  for(var i=0;i<pts.length-1;i++){ var a=pts[i],b=pts[i+1]; if(a.f<=f&&b.f>=f){ var t=(f-a.f)/Math.max(1e-6,b.f-a.f);
    return {mx:a.mx+(b.mx-a.mx)*t,mz:a.mz+(b.mz-a.mz)*t,h:a.h+(b.h-a.h)*t,px:a.px+(b.px-a.px)*t,py:a.py+(b.py-a.py)*t}; } }
  return pts[pts.length-1];
}
function applyWalk(f){
  var p=trajAt(f); if(!p) return;
  if(cmpBView&&cmpBView.setPose){ try{cmpBView.setPose(p.mx,p.mz,p.h); cmpBView.setWalls(state.cmp.walls);}catch(_){} }
  if(cmpAView&&cmpAView.video){ try{ cmpAView.video.pause(); var d=cmpAView.video.duration; if(d&&isFinite(d)) cmpAView.video.currentTime=Math.min(d-0.05,f*d); }catch(_){} }
  var dot=$("#walkdot"); if(dot){ dot.style.left=(p.px*100)+"%"; dot.style.top=(p.py*100)+"%"; }
}
window.__cmpWalk=function(v){ var f=Math.max(0,Math.min(1,(+v)/1000)); state.cmp.pos=f; var l=$("#walklbl"); if(l)l.textContent="walk "+Math.round(f*100)+"%"; applyWalk(f); };
function lockedWalkUI(){
  var c=state.cmp;
  var lockBtn='<button class="chipbtn '+(c.locked?"chipbtn--accent":"")+'" data-act="cmp-lock">'+(c.locked?I.check+' BIM locked to walk':I.pin+' Lock BIM to walk path')+'</button>';
  if(!c.locked) return '<div style="margin-top:10px">'+lockBtn+'</div>'+
    '<div class="muted" style="font-size:11px;margin-top:6px;line-height:1.4">Lock the BIM/Revit model to the recovered Insta360 camera path — scrub the walk and the model shows the exact same viewpoint, with walls you can switch off to see the services behind them.</div>';
  var wallsBtn='<button class="chipbtn '+(c.walls?"":"chipbtn--accent")+'" data-act="cmp-walls">'+(c.walls?'Hide walls · X-ray':'Show walls')+'</button>';
  return '<div class="row-between" style="margin-top:10px">'+lockBtn+wallsBtn+'</div>'+
    '<div style="margin-top:12px"><input id="walkscrub" type="range" min="0" max="1000" value="'+Math.round(c.pos*1000)+'" style="width:100%;accent-color:var(--accent)" oninput="__cmpWalk(this.value)"/>'+
    '<div class="row-between mono" style="font-size:9px;color:var(--ink-3);margin-top:2px"><span>START</span><span id="walklbl">walk '+Math.round(c.pos*100)+'%</span><span>END</span></div></div>'+
    '<div class="muted" style="font-size:11px;margin-top:8px;line-height:1.4">'+I.cap+' BIM camera follows the recovered path · '+(c.traj?c.traj.n:"…")+' poses mapped to the CAD plan. Walls off = X-ray the services behind them.</div>'+
    '<div id="walkmap" style="position:relative;margin-top:10px;height:130px;border-radius:10px;overflow:hidden;border:1px solid var(--hair-2);background:#f7f2e9">'+
      '<img src="'+INSTA_DEMO_PLAN+'" style="width:100%;height:100%;object-fit:contain"/>'+
      '<div id="walkdot" style="position:absolute;width:13px;height:13px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);transform:translate(-50%,-50%);left:'+(c.pos*100)+'%;top:50%"></div>'+
    '</div>';
}

function compareSplitView(){
  var rp=state.cmp.right;
  var rlabel=rp==="floor"?"FLOOR PLAN":rp==="glb"?"REVIT MODEL":"MEP BIM";
  var sp=state.cmp.split;
  return '<div class="muted" style="font-size:11.5px;margin:0 2px 8px;line-height:1.4">Drag the centre divider left or right to wipe between the as-built 360° walkthrough and the planned '+rlabel.toLowerCase()+' of the same property.</div>'+
    '<div id="cmpsplit" style="position:relative;width:100%;height:300px;border-radius:14px;overflow:hidden;background:#15130f;user-select:none;touch-action:none">'+
      '<div id="cmpB" style="position:absolute;inset:0"></div>'+
      '<div id="cmpA" style="position:absolute;inset:0;clip-path:inset(0 '+(100-sp)+'% 0 0)"></div>'+
      '<div id="cmpDiv" style="position:absolute;top:0;bottom:0;left:'+sp+'%;width:2px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);cursor:ew-resize;z-index:5">'+
        '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;background:#fff;color:#7a2230;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.45);font-size:15px;font-weight:700">&#8646;</div>'+
      '</div>'+
      '<span style="position:absolute;top:8px;left:10px;font-family:var(--f-mono);font-size:9px;letter-spacing:.1em;color:#fff;background:rgba(0,0,0,.5);padding:3px 8px;border-radius:20px;z-index:6">360° AS-BUILT</span>'+
      '<span style="position:absolute;top:8px;right:10px;font-family:var(--f-mono);font-size:9px;letter-spacing:.1em;color:#fff;background:rgba(122,34,48,.78);padding:3px 8px;border-radius:20px;z-index:6">'+rlabel+'</span>'+
    '</div>'+
    '<div class="seg cmp__seg" style="margin-top:10px">'+
      '<button class="'+(rp==="mep"?"is-active":"")+'" data-act="cmp-right" data-v="mep">MEP model</button>'+
      '<button class="'+(rp==="floor"?"is-active":"")+'" data-act="cmp-right" data-v="floor">Floor plan</button>'+
      '<button class="'+(rp==="glb"?"is-active":"")+'" data-act="cmp-right" data-v="glb">Your BIM</button>'+
    '</div>'+
    (rp==="glb"?'<button class="btn btn--ghost mt-8" data-act="cmp-pick-glb">'+I.upload+(state.bim.glbUser?' Replace BIM model':' Upload BIM model (.ifc / .glb / .dxf)')+'</button>'+(state.bim.glbUser?'<div class="muted mono" style="font-size:10px;margin-top:6px">'+esc(state.bim.glbName||"")+'</div>':'<button class="btn btn--ghost mt-8" data-act="cmp-sample-ifc">'+I.play+' Load sample IFC (IfcOpenHouse)</button><div class="muted" style="font-size:11px;margin-top:6px;line-height:1.4">From Revit: <b>File \u2192 Export \u2192 IFC</b> (no plugin). Also takes glTF (.glb) and 2D .dxf. Parsed in your browser \u2014 nothing leaves your device.</div>'):'')+((state.cmp.right==="mep"||(state.cmp.right==="glb"&&state.bim.modelKind==="ifc"))?lockedWalkUI():'');
}
function mountCompare(){
  var box=$("#cmpsplit"); if(!box) return;
  var a=$("#cmpA"), b=$("#cmpB"); if(!a||!b) return;
  if(cmpAView){try{cmpAView.dispose();}catch(_){}cmpAView=null;}
  if(window.__INSTA360 && state.insta.src){
    a.innerHTML='';
    window.__INSTA360.createSphereViewer(a,{src:state.insta.src,video:state.insta.kind==="video",autorotate:true}).then(function(v){cmpAView=v;}).catch(function(){ var aa=$("#cmpA"); if(aa)aa.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#999">360 viewer needs three.js (network)</div>'; });
  }
  if(cmpBView){try{cmpBView.dispose&&cmpBView.dispose();}catch(_){}cmpBView=null;}
  b.innerHTML='';
  var rp=state.cmp.right;
  if(rp==="floor"){
    b.innerHTML='<img src="'+INSTA_DEMO_PLAN+'" alt="office floor plan" style="width:100%;height:100%;object-fit:contain;background:#f7f2e9"/>';
  } else if(rp==="glb"){
    if(!state.bim.glbUser || !state.bim.glb){ b.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:11.5px;color:#9b958a;padding:24px">Upload a BIM model (.ifc / .glb / .dxf) below \u2014 or load the sample IFC.</div>'; }
    else if(state.bim.modelKind==="ifc"){ if(window.__INSTA360&&window.__INSTA360.createIfcScene){ window.__INSTA360.createIfcScene(b,{url:state.bim.glb,walls:state.cmp.walls}).then(function(v){cmpBView=v; if(state.cmp.locked){try{cmpBView.setAutorotate(false); applyWalk(state.cmp.pos);}catch(_){}}}).catch(function(){}); } }
    else if(state.bim.modelKind==="dxf"){ if(window.__INSTA360&&window.__INSTA360.createDxfScene){ window.__INSTA360.createDxfScene(b,{url:state.bim.glb}).then(function(v){cmpBView=v;}).catch(function(){}); } }
    else { ensureModelViewer().then(function(){ var bb=$("#cmpB"); if(bb) bb.innerHTML='<model-viewer src="'+esc(state.bim.glb)+'" camera-controls auto-rotate touch-action="pan-y" exposure="1.1" style="width:100%;height:100%;background:#15130f"></model-viewer>'; }); }
  } else {
    if(window.__INSTA360 && window.__INSTA360.createMepScene){ window.__INSTA360.createMepScene(b).then(function(v){cmpBView=v; if(state.cmp.locked){ try{cmpBView.setAutorotate(false); applyWalk(state.cmp.pos);}catch(_){} } }).catch(function(){ var bb=$("#cmpB"); if(bb) bb.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#999">MEP model needs three.js</div>'; }); }
  }
  setupCmpDrag();
  if(state.cmp.locked) applyWalk(state.cmp.pos);
}
function setupCmpDrag(){
  var div=$("#cmpDiv"), box=$("#cmpsplit"), a=$("#cmpA"); if(!div||!box||!a||div.__wired) return; div.__wired=true;
  function setPct(p){ p=Math.max(4,Math.min(96,p)); state.cmp.split=p; div.style.left=p+"%"; a.style.clipPath="inset(0 "+(100-p)+"% 0 0)"; }
  function onMove(e){ var r=box.getBoundingClientRect(); var x=(e.touches?e.touches[0]:e).clientX; setPct((x-r.left)/r.width*100); if(e.cancelable)e.preventDefault(); }
  function end(){ document.removeEventListener("mousemove",onMove); document.removeEventListener("touchmove",onMove); document.removeEventListener("mouseup",end); document.removeEventListener("touchend",end); }
  function start(e){ e.preventDefault(); e.stopPropagation(); document.addEventListener("mousemove",onMove); document.addEventListener("touchmove",onMove,{passive:false}); document.addEventListener("mouseup",end); document.addEventListener("touchend",end); }
  div.addEventListener("mousedown",start); div.addEventListener("touchstart",start,{passive:false});
}
function pickInstaFile(){
  var inp=document.getElementById("__instaFile");
  if(!inp){
    inp=document.createElement("input"); inp.type="file"; inp.id="__instaFile";
    inp.accept="video/*,image/*,.insv,.insp,.mp4,.mov,.jpg,.jpeg,.png";
    inp.style.cssText="position:absolute;width:1px;height:1px;opacity:0;left:0;top:0;overflow:hidden;z-index:-1";
    inp.addEventListener("change",function(){ var fl=inp.files&&inp.files[0]; if(fl) onInstaImport(fl); try{inp.value="";}catch(_){} });
    (document.getElementById("phone")||document.body).appendChild(inp);
  }
  toast("Opening file picker\u2026");
  inp.click();
}
function pickGlbFile(){
  var inp=document.createElement("input"); inp.type="file"; inp.accept=".glb,.gltf,.ifc,.dxf,model/gltf-binary";
  inp.style.cssText="position:fixed;left:-9999px;top:0;opacity:0";
  document.body.appendChild(inp);
  inp.addEventListener("change",function(){ var fl=inp.files&&inp.files[0]; try{document.body.removeChild(inp);}catch(_){} if(fl) onCmpGlb(fl); });
  inp.click();
}
function onCmpGlb(file){
  var nm=(file.name||"").toLowerCase();
  var kind=/\.ifc$/.test(nm)?"ifc":/\.dxf$/.test(nm)?"dxf":"glb";
  try{
    var url=URL.createObjectURL(file);
    state.bim.glb=url; state.bim.modelKind=kind;
    state.bim.glbName=(file.name||"model")+" \u00b7 your "+(kind==="ifc"?"IFC":kind==="dxf"?"DXF":"glTF");
    state.bim.glbUser=true; state.cmp.right="glb";
    toast("Loaded "+(file.name||"model")+(kind==="ifc"?" \u00b7 parsing IFC\u2026":" \u00b7 BIM model"));
    render();
  }catch(e){ toast("Could not load model","warn"); }
}

function bimListView(){
  return back("more")+screenHead("BIM × 360 analysis","Insta360 walkthroughs compared to the planned model")+
  '<div class="card" style="background:var(--info-wash);border-color:rgba(46,90,107,.25);font-size:12px;line-height:1.45;color:var(--ink-2)">'+
    'Each capture is uploaded, frames extracted every 1.5 s, mapped to the floor plan, then an AI vision model checks every planned BIM element. Mismatches become issues automatically.</div>'+
  '<div id="instabox">'+instaImportPanel()+'</div>'+
  CAPTURES.map(function(c){
    var analyzed=c.status==="analyzed";
    var sev=analyzed?discBySev():null;
    return '<div class="capcard" data-go="'+(analyzed?"more:bim:"+c.id:"more:analyze:"+c.id)+'">'+
      '<div class="capcard__thumb"><span class="scan"></span><span class="ll">360° · '+c.floor.toUpperCase()+'</span></div>'+
      '<div class="row-between"><div><div class="card__title" style="font-size:14px">'+c.floor+' · walkthrough</div>'+
        '<div class="card__sub"><span class="mono">'+c.id+'</span> · '+c.device+' · '+c.started+'</div></div>'+
        (analyzed?pill("Analyzed","ok"):pill("Processing "+Math.round(c.processing_step/6*100)+"%","warn"))+'</div>'+
      '<div class="metarow" style="border-top:1px solid var(--hair);margin-top:10px"><span class="k">'+c.frame_count+' frames · '+c.duration_s+'s · '+c.distance_m+'m</span>'+
        (analyzed?'<span class="v">'+(sev.crit?'<span style="color:var(--accent)">'+sev.crit+' critical</span> · ':'')+(sev.warn+sev.low)+' more</span>':'<span class="v" style="color:var(--warn)">in pipeline…</span>')+'</div>'+
    '</div>';
  }).join("");
}

function pipeTimeline(c){
  return '<div class="pipe">'+c.steps.map(function(s,i){
    var st=s[2]; var node=st==="done"?I.check:st==="running"?'<span class="spin">'+I.sync+'</span>':String(i+1);
    return '<div class="pipe__row '+st+'">'+(i<c.steps.length-1?'<div class="pipe__rail"></div>':'')+
      '<div class="pipe__node">'+node+'</div>'+
      '<div class="pipe__tx"><b>'+s[1]+'</b><span>'+(s[3]||(st==="queued"?"queued":""))+'</span></div>'+
      (s[4]?'<div class="pipe__ms">'+s[4]+'</div>':'')+
    '</div>';
  }).join("")+'</div>';
}

function analysisMap(){
  // frame path + BIM markers + discrepancy pins on the GF plan
  var pathPts=FRAMES.map(function(f){return (f.fx/100*300)+","+(f.fy/100*230);}).join(" ");
  var frameDots=FRAMES.map(function(f){return '<div class="amap__frame" style="left:'+f.fx+'%;top:'+f.fy+'%" title="frame '+f.idx+'"></div>';}).join("");
  var bimMarks=BIM.map(function(b){return '<div class="amap__bim" style="left:'+b.bx+'%;top:'+b.by+'%;border-color:'+discColor(b.disc)+'" title="'+b.code+'"></div>';}).join("");
  var discPins=DISCREPANCIES.filter(function(d){return d.kind!=="quality";}).map(function(d){
    var b=BIM.filter(function(x){return d.element.indexOf(x.code)>-1;})[0]; if(!b)return"";
    return '<div class="amap__disc" style="left:'+b.bx+'%;top:'+b.by+'%;background:'+toneColor(d.severity)+'"><i>!</i></div>';
  }).join("");
  return '<div class="amap">'+
    '<svg class="plan" viewBox="0 0 300 230" preserveAspectRatio="none">'+
      '<g stroke="#C9BFA6" stroke-width="1.5" fill="none">'+
        '<rect x="20" y="20" width="260" height="190"/><line x1="20" y1="110" x2="170" y2="110"/>'+
        '<line x1="170" y1="20" x2="170" y2="210"/><line x1="95" y1="110" x2="95" y2="210"/>'+
        '<line x1="170" y1="120" x2="280" y2="120"/><line x1="225" y1="20" x2="225" y2="120"/></g>'+
      '<g fill="#8C8268" font-family="JetBrains Mono" font-size="8.5">'+
        '<text x="60" y="66">LIVING</text><text x="196" y="66">BEDROOM 1</text>'+
        '<text x="34" y="168">BATH B-2</text><text x="118" y="160">KITCHEN</text><text x="196" y="178">STAIR</text></g>'+
      '<polyline class="amap__path" points="'+pathPts+'"/>'+
    '</svg>'+frameDots+bimMarks+discPins+
    '<div class="amap__legend"><span><span class="d" style="background:var(--info)"></span>frame</span>'+
      '<span><span class="d" style="background:transparent;border:1.6px solid var(--ink-2)"></span>BIM</span>'+
      '<span><span class="d" style="background:var(--accent)"></span>finding</span>'+
      '<span class="mono" style="margin-left:auto">IMU + QR path</span></div>'+
  '</div>';
}

function comparePanel(){
  var zone=state.bim.cmpZone;
  var zones=[...new Set(BIM.map(function(b){return b.zone;}))];
  var zbar='<div class="cmp__zone">'+zones.map(function(z){
    var hasIssue=DISCREPANCIES.some(function(d){return d.zone===z&&d.kind!=="quality";});
    return '<button class="cmp__zb '+(z===zone?"is-active":"")+'" data-act="cmp-zone" data-v="'+esc(z)+'"><span class="zdot" style="background:'+(hasIssue?"var(--accent)":"var(--ok)")+'"></span>'+z+'</button>';
  }).join("")+'</div>';
  var seg='<div class="seg cmp__seg"><button class="'+(state.bim.cmpMode==="side"?"is-active":"")+'" data-act="cmp-mode" data-v="side">Side-by-side</button>'+
    '<button class="'+(state.bim.cmpMode==="overlay"?"is-active":"")+'" data-act="cmp-mode" data-v="overlay">Overlay</button></div>';
  var dets=DETECTIONS.filter(function(d){return d.zone===zone;});
  var bims=BIM.filter(function(b){return b.zone===zone;});
  var body=state.bim.cmpMode==="overlay"?compareOverlay(dets,bims):compareSide(dets,bims);
  return zbar+seg+body;
}
function bboxEls(dets){
  return dets.map(function(d){
    var b=d.bbox; var col=d.present?"#9DBE86":"#E0584F";
    return '<div class="bbox" style="left:'+(b[0]*100)+'%;top:'+(b[1]*100)+'%;width:'+(b[2]*100)+'%;height:'+(b[3]*100)+'%;border-color:'+col+'">'+
      '<span class="bbox__t" style="background:'+col+'">'+d.label+' '+Math.round(d.confidence*100)+'%</span></div>';
  }).join("");
}
function compareSide(dets,bims){
  // BIM pane: a wireframe box per planned element, positioned at its matched detection bbox (fallback grid)
  var bimBoxes=bims.map(function(b,i){
    var det=dets.filter(function(d){return d.code===b.code;})[0];
    var bb=det?det.bbox:[0.1+(i%3)*0.3,0.12+Math.floor(i/3)*0.4,0.24,0.30];
    return '<div class="bbox" style="left:'+(bb[0]*100)+'%;top:'+(bb[1]*100)+'%;width:'+(bb[2]*100)+'%;height:'+(bb[3]*100)+'%;border-color:'+discColor(b.disc)+';border-style:dashed">'+
      '<span class="bbox__t" style="background:'+discColor(b.disc)+';color:#fff">'+b.code+'</span></div>';
  }).join("");
  return '<div class="cmp__grid">'+
    '<div class="pane pane--frame"><div class="pane__cap">360° — as captured</div><div class="pane__view">'+bboxEls(dets)+'</div></div>'+
    '<div class="pane pane--bim"><div class="pane__cap">BIM — planned</div><div class="pane__view">'+bimBoxes+'</div></div></div>'+
    '<div class="card mt-14" style="margin-bottom:0"><div class="eyebrow" style="margin-bottom:8px">PLANNED vs DETECTED</div>'+
    bims.map(function(b){
      var det=dets.filter(function(d){return d.code===b.code;})[0];
      var verdict=!det?["✗","Not detected","crit"]:det.present===false?["✗","Built partial / missing","crit"]:
        (b.code==="D-2"||b.code==="EC-1"||b.code==="PL-1")&&DISCREPANCIES.some(function(d){return d.element.indexOf(b.code)>-1;})?["≠","Deviation","warn"]:["✓","Matches BIM","ok"];
      return '<div class="metarow"><span class="k"><span class="mono" style="color:'+discColor(b.disc)+'">'+b.code+'</span> '+b.name+'</span>'+
        '<span class="v" style="color:'+toneColor(verdict[2])+'">'+verdict[0]+' '+verdict[1]+'</span></div>';
    }).join("")+'</div>';
}
function compareOverlay(dets,bims){
  var op=state.bim.ovl;
  return '<div class="ovl"><div class="ovl__bim" style="opacity:'+(op/100)+'"></div>'+bboxEls(dets)+
    '<div style="position:absolute;top:8px;left:8px;font-family:var(--f-mono);font-size:9px;letter-spacing:.1em;color:#C98A92">360° + BIM OVERLAY · '+state.bim.cmpZone.toUpperCase()+'</div></div>'+
    '<input class="ovl__slider" type="range" min="0" max="100" value="'+op+'" oninput="__cmpOvl(this.value)"/>'+
    '<div class="ovl__lbls"><span>360° FRAME</span><span>'+op+'% BIM</span><span>BIM MODEL</span></div>'+
    '<div class="muted" style="font-size:11.5px;margin-top:10px;line-height:1.4">Slide to fade the planned BIM wireframe over the captured frame. Red boxes are AI detections that don\'t match the model.</div>';
}

function detectionList(){
  return '<div class="card"><div class="eyebrow" style="margin-bottom:4px">AI DETECTIONS · '+DETECTIONS.length+' elements</div>'+
    DETECTIONS.map(function(d){
      var pct=Math.round(d.confidence*100);
      var ok=d.present; var col=ok?"var(--ok)":"var(--accent)";
      return '<div class="det"><div class="det__ic" style="background:'+(ok?"var(--ok-wash)":"var(--crit-wash)")+';color:'+col+'">'+(ok?I.check:I.x)+'</div>'+
        '<div class="det__tx"><b>'+d.label+'</b><span><span class="mono">'+d.code+'</span> · '+d.zone+'</span></div>'+
        '<div class="det__conf"><div class="det__pct">'+pct+'%</div><div class="det__bar"><i style="width:'+pct+'%;background:'+col+'"></i></div></div></div>';
    }).join("")+'</div>';
}

function discrepancyList(){
  return DISCREPANCIES.map(function(d,i){
    var col=toneColor(d.severity);
    var actions=d.status==="issue_created"?'<span class="pill pill--info">'+I.flag+' '+d.issue_id+'</span><button class="chipbtn" data-go="issues:sub:'+d.issue_id+'">View issue</button>'
      :d.status==="verified"?pill("Verified · acceptable","ok")
      :'<button class="chipbtn chipbtn--accent" data-act="disc-issue" data-i="'+i+'">'+I.flag+' Create issue</button><button class="chipbtn" data-act="disc-dismiss" data-i="'+i+'">Dismiss</button>';
    return '<div class="disc"><div class="disc__stripe" style="background:'+col+'"></div><div class="disc__b">'+
      '<div class="disc__top"><span class="disc__kind" style="background:'+col+';color:#fff">'+d.kind+'</span>'+
        '<span class="disc__el">'+d.element+'</span></div>'+
      '<div class="card__sub" style="margin-bottom:0">'+d.zone+' · '+pill(d.severity==="crit"?"Critical":d.severity==="warn"?"Medium":"Low",d.severity)+'</div>'+
      '<div class="disc__note">'+d.note+'</div>'+
      '<div class="disc__foot"><span class="disc__conf">AI confidence <b>'+Math.round(d.confidence*100)+'%</b></span>'+actions+'</div>'+
    '</div></div>';
  }).join("");
}

/* ---- FREE on-device CV: process the real frame pixels in the browser ---- */
function cvFramesWithImg(){return FRAMES.filter(function(f){return f.img;});}
/* Normalize app BIM objects (which use .type) to the detector contract
   (.element_type + .plan_status) used by detect.cv.mjs / detect.transformers.mjs. */
function bimZoneFor(zone){return BIM.filter(function(b){return b.zone===zone;}).map(function(b){
  return {code:b.code,name:b.name,spec:b.spec,zone:b.zone,element_type:b.type||b.element_type,plan_status:b.plan_status||"should_be_present",bx:b.bx,by:b.by};});}
function loadImg(url){return new Promise(function(res,rej){var im=new Image();im.crossOrigin="anonymous";im.onload=function(){res(im);};im.onerror=function(){rej(new Error("load failed"));};im.src=url;});}
function cvRunFrames(){
  if(!window.__CV){toast("CV core not loaded","warn");return;}
  state.bim.cvRunning=true; paintCv();
  var frames=cvFramesWithImg(), results=[], allDet=[];
  var chain=Promise.resolve();
  frames.forEach(function(f){
    chain=chain.then(function(){
      return loadImg(f.img).then(function(im){
        var nw=im.naturalWidth||im.width||480, nh=im.naturalHeight||im.height||360;
        var W=Math.min(480,nw), scale=W/nw, H=Math.max(1,Math.round(nh*scale));
        var c=document.createElement("canvas"); c.width=W; c.height=H;
        var cx=c.getContext("2d"); cx.drawImage(im,0,0,W,H);
        var idata=cx.getImageData(0,0,W,H);
        var bimZone=bimZoneFor(f.zone);
        var out=window.__CV.cvDetect(f,bimZone,{data:idata.data,width:idata.width,height:idata.height});
        results.push({idx:f.idx,zone:f.zone,img:f.img,metrics:out.metrics,quality:out.quality});
        (out.detections||[]).forEach(function(d){allDet.push(d);});
      }).catch(function(){ results.push({idx:f.idx,zone:f.zone,img:f.img,error:true}); });
    });
  });
  chain.then(function(){ state.bim.cv={frames:results,detections:allDet}; state.bim.cvRunning=false; paintCv(); });
}
function paintCv(){var el=$("#cvbox"); if(el) el.innerHTML=cvSectionHTML();}
function cvBar(label,v){v=Math.max(0,Math.min(1,v||0));var pc=Math.round(v*100);var col=v>0.6?"var(--ok)":v>0.3?"var(--warn)":"var(--accent)";return '<div class="cvbar"><span class="cvbar__l">'+label+'</span><div class="cvbar__t"><i style="width:'+pc+'%;background:'+col+'"></i></div><span class="cvbar__v">'+pc+'%</span></div>';}
function cvSectionHTML(){
  var n=cvFramesWithImg().length;
  var head='<div class="section-label"><h3>On-device CV · <em style="font-family:var(--f-display);font-style:italic">free</em></h3><span class="more mono" style="font-size:9px">no API · no download</span></div>'+
    '<div class="muted" style="font-size:11.5px;margin:-4px 2px 10px;line-height:1.4">Processes the actual frame pixels in your browser — brightness, sharpness (Laplacian), edge coverage (Sobel) &amp; colour. Free, deterministic, explainable. '+n+' frames carry real photos.</div>';
  if(state.bim.cvRunning) return head+'<div class="center muted" style="padding:16px"><span class="spin" style="display:inline-block">'+I.sync+'</span> Processing '+n+' real frames on-device…</div>';
  if(!state.bim.cv) return head+'<button class="btn btn--solid" data-act="cv-run">'+I.camera+' Run free CV on '+n+' real frames</button>';
  var cv=state.bim.cv, good=cv.frames.filter(function(f){return !f.error;});
  var lit=good.filter(function(f){return f.quality&&f.quality.lit;}).length;
  var avgB=good.length?good.reduce(function(s,f){return s+(f.metrics?f.metrics.brightness:0);},0)/good.length:0;
  var rows=cv.frames.map(function(fr){
    if(fr.error) return '<div class="cvrow"><div class="cvrow__b"><div class="cvrow__top"><b>'+fr.zone+'</b> <span class="muted mono" style="font-size:10px">frame '+fr.idx+'</span> '+pill("load failed","crit")+'</div></div></div>';
    var m=fr.metrics, q=fr.quality;
    return '<div class="cvrow">'+
      '<img class="cvrow__img" src="'+fr.img+'" crossorigin="anonymous" alt="frame '+fr.idx+'"/>'+
      '<div class="cvrow__b"><div class="cvrow__top"><b>'+fr.zone+'</b> <span class="muted mono" style="font-size:10px">f'+fr.idx+'</span>'+
        (q.lit?pill("lit","ok"):pill("under-lit","warn"))+(q.sharp?pill("sharp","ok"):pill("blurry","warn"))+'</div>'+
        cvBar("Brightness",m.brightness)+cvBar("Sharpness",q.sharpClarity)+cvBar("Edge coverage",m.edgeDensity)+
      '</div></div>';
  }).join("");
  var detList=cv.detections.length?'<div class="muted" style="font-size:11px;margin:10px 2px 6px">CV-derived element signals (heuristic, modest confidence — semantic ID needs a trained model):</div>'+
    '<div class="card">'+cv.detections.slice(0,8).map(function(d){var pcv=Math.round((d.confidence||0)*100);var ok=d.present;return '<div class="det"><div class="det__ic" style="background:'+(ok?"var(--ok-wash)":"var(--paper-3)")+';color:'+(ok?"var(--ok)":"var(--ink-3)")+'">'+(ok?I.check:I.x)+'</div><div class="det__tx"><b style="font-size:12px">'+d.label+'</b><span><span class="mono">'+(d.bim_code||"?")+'</span> · '+d.zone+'</span></div><div class="det__conf"><div class="det__pct">'+pcv+'%</div><div class="det__bar"><i style="width:'+pcv+'%;background:'+(ok?"var(--ok)":"var(--ink-3)")+'"></i></div></div></div>';}).join("")+'</div>':'';
  return head+
    '<div class="card" style="background:var(--ok-wash);border-color:var(--ok);font-size:12px;color:var(--ok);font-weight:650">✓ Processed '+good.length+' real frames on-device · '+(good.length-lit)+' under-lit · avg brightness '+Math.round(avgB*100)+'%</div>'+
    rows+detList+
    '<button class="chipbtn mt-8" data-act="cv-run">'+I.sync+' Re-run</button>';
}

/* ---- FREE LOCAL ML MODEL (transformers.js CLIP) — semantic photo↔BIM compare ---- */
function paintModel(){var el=$("#modelbox"); if(el) el.innerHTML=modelSectionHTML();}
function paintBimViewer(){var el=$("#bimviewer"); if(el) el.innerHTML=bimViewerHTML();}
function onBimUpload(file){
  if(!file) return;
  var name=file.name||"model";
  if(/\.ifc$/i.test(name)){ toast("IFC upload: convert to glTF (web-ifc/IfcConvert) — viewer takes .glb/.gltf","warn"); return; }
  try{ var url=URL.createObjectURL(file); state.bim.glb=url; state.bim.glbName=name+" · your upload"; state.bim.mvOpen=true; ensureModelViewer().then(function(){paintBimViewer();}); toast("Loaded "+name); }
  catch(e){ toast("Could not load model","warn"); }
}
function modelRunFrames(){
  if(!window.__MODEL){toast("Local model wrapper not loaded","warn");return;}
  state.bim.modelErr=null; state.bim.modelRunning=true; state.bim.modelProgress="loading model (one-time download)…"; paintModel();
  var frames=cvFramesWithImg(), results=[], allDet=[];
  var prog=function(p){
    if(!p) return;
    if(p.status==="progress" && p.file){ state.bim.modelProgress="downloading "+String(p.file).split("/").pop()+" · "+Math.round(p.progress||0)+"%"; paintModel(); }
    else if(p.status==="ready"){ state.bim.modelProgress="model ready · running inference…"; paintModel(); }
  };
  (async function(){
    try{
      for(var i=0;i<frames.length;i++){
        var f=frames[i];
        state.bim.modelProgress="analyzing frame "+(i+1)+"/"+frames.length+" ("+f.zone+")…"; paintModel();
        var bimZone=bimZoneFor(f.zone);
        var dets=await window.__MODEL.runVisionModelTransformers({img:f.img,zone:f.zone,bx:f.bx,by:f.by,idx:f.idx}, bimZone, i===0?prog:null);
        results.push({idx:f.idx,zone:f.zone,img:f.img,detections:dets});
        (dets||[]).forEach(function(d){allDet.push(d);});
      }
      state.bim.model={frames:results,detections:allDet};
    }catch(e){ state.bim.modelErr=String((e&&e.message)||e); }
    state.bim.modelRunning=false; paintModel();
  })();
}
function modelSectionHTML(){
  var n=cvFramesWithImg().length;
  var head='<div class="section-label"><h3>Local ML model · <em style="font-family:var(--f-display);font-style:italic">free</em></h3><span class="more mono" style="font-size:9px">CLIP · on-device · no API</span></div>'+
    '<div class="muted" style="font-size:11.5px;margin:-4px 2px 10px;line-height:1.4">Real semantic check — runs Hugging Face <b>CLIP zero-shot</b> in your browser (one-time ~'+'model download, then cached; $0 per run). For each BIM element it asks the photo "does this match the planned, to-spec state?" — a genuine model-vs-photo quality comparison.</div>';
  if(state.bim.modelErr) return head+'<div class="card" style="background:var(--crit-wash);border-color:var(--accent);font-size:12px;color:var(--accent)">Model error: '+esc(state.bim.modelErr)+'</div><button class="btn btn--ghost mt-8" data-act="model-run">'+I.sync+' Retry</button>';
  if(state.bim.modelRunning) return head+'<div class="card center" style="padding:16px"><span class="spin" style="display:inline-block">'+I.sync+'</span> '+esc(state.bim.modelProgress||"working…")+'<div class="muted" style="font-size:11px;margin-top:8px">First run downloads the CLIP weights (~tens of MB) once; later runs are instant.</div></div>';
  if(!state.bim.model) return head+'<button class="btn btn--solid" data-act="model-run">'+I.cap+' Run local model on '+n+' real frames</button>';
  var m=state.bim.model;
  var matched=m.detections.filter(function(d){return d.present;}).length, mism=m.detections.length-matched;
  var rows=m.frames.map(function(fr){
    var dets=fr.detections.map(function(d){
      var pc=Math.round((d.confidence||0)*100); var ok=d.present;
      return '<div class="det" style="padding:7px 0"><div class="det__ic" style="width:24px;height:24px;background:'+(ok?"var(--ok-wash)":"var(--crit-wash)")+';color:'+(ok?"var(--ok)":"var(--accent)")+'">'+(ok?I.check:I.x)+'</div>'+
        '<div class="det__tx"><b style="font-size:12px">'+d.label+'</b><span><span class="mono">'+(d.bim_code||"?")+'</span></span></div>'+
        '<div class="det__conf"><div class="det__pct">'+pc+'%</div><div class="det__bar"><i style="width:'+pc+'%;background:'+(ok?"var(--ok)":"var(--accent)")+'"></i></div></div></div>';
    }).join("");
    return '<div class="cvrow" style="align-items:flex-start"><img class="cvrow__img" src="'+fr.img+'" crossorigin="anonymous" alt=""/>'+
      '<div class="cvrow__b"><div class="cvrow__top"><b>'+fr.zone+'</b> <span class="muted mono" style="font-size:10px">f'+fr.idx+' · CLIP</span></div>'+dets+'</div></div>';
  }).join("");
  return head+
    '<div class="card" style="background:var(--ok-wash);border-color:var(--ok);font-size:12px;color:var(--ok);font-weight:650">✓ '+m.frames.length+' frames scored on-device · '+matched+' match BIM · '+mism+' mismatch</div>'+
    rows+
    '<div class="muted" style="font-size:11px;margin-top:6px">CLIP compares each photo to text descriptions of the BIM element\'s expected state. Real, free, semantic — but a general model: treat as decision-support, confirm critical calls. Construction-tuned weights (YOLO/SAM) or geometric BIM registration would raise precision.</div>'+
    '<button class="chipbtn mt-8" data-act="model-run">'+I.sync+' Re-run</button>';
}

/* ---- 3D BIM model viewer (model-viewer web component, lazy CDN) + upload ---- */
function ensureModelViewer(){
  if(window.customElements && customElements.get("model-viewer")) return Promise.resolve();
  if(window.__mvLoading) return window.__mvLoading;
  window.__mvLoading=new Promise(function(res){
    var s=document.createElement("script"); s.type="module";
    s.src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js";
    s.onload=function(){res();}; s.onerror=function(){res();}; document.head.appendChild(s);
  });
  return window.__mvLoading;
}
function bimViewerHTML(){
  var head='<div class="section-label"><h3>BIM model · 3D</h3><span class="more mono" style="font-size:9px">upload .glb / .gltf</span></div>';
  if(!state.bim.mvOpen) return head+'<div class="muted" style="font-size:11.5px;margin:-4px 2px 10px;line-height:1.4">View the planned BIM model in 3D and compare it against the captured photos. Loads a sample building, or upload your own glTF/GLB. (IFC → convert to glTF via web-ifc/IfcConvert.)</div>'+
    '<button class="btn btn--solid" data-act="bim-view-load">'+I.draw+' Load 3D BIM model</button>';
  return head+
    '<model-viewer src="'+esc(state.bim.glb)+'" camera-controls auto-rotate touch-action="pan-y" shadow-intensity="1" exposure="1" style="width:100%;height:260px;border-radius:14px;background:var(--paper-3);border:1px solid var(--hair-2)"></model-viewer>'+
    '<div class="muted mono" style="font-size:10px;margin-top:6px">'+esc(state.bim.glbName)+'</div>'+
    '<label class="btn btn--ghost mt-8" style="cursor:pointer"><input type="file" accept=".glb,.gltf,model/gltf-binary" data-act="bim-upload" style="display:none"/>'+I.upload+' Upload your BIM model (.glb / .gltf)</label>'+
    '<div class="muted" style="font-size:11px;margin-top:8px">Real BIM↔photo quality scoring is done by the Local ML model panel below (semantic) and the Discrepancies panel (vs the BIM element list). True geometric overlay (projecting IFC geometry onto the camera view) needs camera pose — architected, not wired.</div>';
}

function bimDetailView(id){
  var c=CAPTURES.filter(function(x){return x.id===id;})[0]; if(!c) return bimListView();
  var sev=discBySev();
  return '<button class="backlink" data-go="more:bim">'+I.back+' Analyses</button>'+
    '<div class="row-between"><div class="eyebrow">'+c.id+' · '+c.device+'</div>'+pill("Analyzed","ok")+'</div>'+
    '<div class="screen-title h-display" style="font-size:25px;margin-top:8px">'+c.floor+'<br><em>vs BIM model</em></div>'+
    '<div class="muted mt-8" style="font-size:12px;margin-bottom:6px">'+c.frame_count+' frames · '+c.coverage_pct+'% coverage · '+c.quality_score+' · '+c.model_version+'</div>'+

    '<div class="stats" style="margin-top:10px"><div class="stat stat--crit"><div class="stat__lbl">Critical findings</div><div class="stat__val">'+sev.crit+'</div><div class="stat__foot" style="color:var(--accent)">block next stage</div></div>'+
      '<div class="stat"><div class="stat__lbl">Total discrepancies</div><div class="stat__val">'+DISCREPANCIES.length+'</div><div class="stat__foot" style="color:var(--warn)">'+DISCREPANCIES.filter(function(d){return d.status==="issue_created";}).length+' filed as issues</div></div></div>'+

    '<div class="section-label"><h3>Pipeline</h3><span class="more mono" style="font-size:10px">'+c.model_version.split(" + ")[0]+'</span></div>'+pipeTimeline(c)+

    '<div class="section-label"><h3>Frames mapped to floor plan</h3></div>'+analysisMap()+

    '<div class="section-label"><h3>Compare · 360 vs BIM</h3></div>'+comparePanel()+

    '<div class="section-label"><h3>AI element check</h3></div>'+detectionList()+

    '<div id="cvbox">'+cvSectionHTML()+'</div>'+

    '<div id="modelbox">'+modelSectionHTML()+'</div>'+

    '<div id="bimviewer">'+bimViewerHTML()+'</div>'+

    '<div class="section-label"><h3>Discrepancies → issues</h3><span class="more">'+DISCREPANCIES.filter(function(d){return d.status==="open";}).length+' to file</span></div>'+discrepancyList()+
    '<button class="btn btn--ghost mt-8" data-act="reanalyze" data-id="'+id+'">'+I.sync+' Re-run analysis</button>';
}

function bimAnalyzeView(id){
  var c=CAPTURES.filter(function(x){return x.id===id;})[0]; if(!c) return bimListView();
  var step=state.bim.analyzeStep;
  // build a live steps array: steps before `step` done, current running, rest queued
  var labels=[["upload","Upload to backend","412 MB · 8K 360° video"],["extract","Extract frames","frames @ 1.5 s"],["map","Map frames to floor plan","IMU + QR anchoring"],["align","Align BIM model",c.floor+" · Rev 04"],["detect","AI element check","yolov8 + SAM2"],["issues","Generate discrepancies","compare BIM ↔ as-built"]];
  var steps=labels.map(function(l,i){return [l[0],l[1],i<step?"done":i===step?"running":"queued",l[2],i<step?(1.4+i*0.7).toFixed(1)+"s":""];});
  var done=step>=6;
  return '<button class="backlink" data-go="more:bim">'+I.back+' Analyses</button>'+
    '<div class="screen-title h-display" style="font-size:25px">Analyzing<br><em>'+c.floor+'</em></div>'+
    '<div class="muted mt-8" style="font-size:12px;margin-bottom:10px"><span class="mono">'+c.id+'</span> · '+c.device+' · running 360° × BIM pipeline</div>'+
    (state.online?'<div class="syncbar is-online" style="margin:0 0 14px"><span class="statusdot"></span><span>'+(pipelineLive?"Processed by cpm-pipeline edge function ✓":"Calling cpm-pipeline edge function…")+'</span><span class="grow"></span><span class="mono" style="font-size:10px;opacity:.8">Supabase</span></div>':'')+
    '<div class="card">'+pipeTimeline({steps:steps})+'</div>'+
    (done?'<button class="btn btn--solid" data-go="more:bim:'+id+'">'+I.check+' View results · '+DISCREPANCIES.length+' findings</button>'
         :'<div class="center muted" style="font-size:12px;padding:6px"><span class="spin" style="display:inline-block">'+I.sync+'</span> '+labels[Math.min(step,5)][1]+'…</div>');
}

/* shared chrome */
function screenHead(title,sub){return '<div class="screen-title h-display">'+title+'</div><div class="muted mt-8" style="font-size:13px;margin-bottom:14px">'+sub+'</div>';}
function back(tab){return '<button class="backlink" data-go="'+tab+'">'+I.back+' More</button>';}
function segBtn(id,label,cur){return '<button class="'+(cur===id?"is-active":"")+'" data-act="task-tab" data-v="'+id+'" data-grp="'+(cur===state.matTab?"mat":"task")+'">'+label+'</button>';}

/* ============================================================ RENDER */
var VIEWS={home:homeView,tasks:tasksView,capture:captureView,materials:materialsView,issues:issuesView,more:moreView};
var TABS=[["home","Home","home"],["tasks","Tasks","tasks"],["capture","Capture","cap"],["materials","Materials","box"],["issues","Issues","flag"],["more","More","more"]];

function buildTabbar(){
  var oi=openIssues().length;
  $("#tabbar").innerHTML=TABS.map(function(t){
    var cap=t[0]==="capture";
    var count=t[0]==="issues"?oi:t[0]==="more"?state.pending:0;
    return '<button class="tab '+(cap?"tab--cap ":"")+(state.tab===t[0]?"is-active":"")+'" data-tab="'+t[0]+'">'+
      (count?'<span class="tab__count">'+count+'</span>':"")+
      '<span class="ti">'+(I[t[2]]||"")+'</span><span>'+t[1]+'</span></button>';
  }).join("");
}
function buildAppbar(){
  $("#appProj").textContent=PROJECT.name;
  $("#appMeta").textContent=PROJECT.meta;
  var sbar=$("#syncbar");
  if(state.online){sbar.className="syncbar is-online";sbar.innerHTML='<span class="statusdot"></span><span>Online · live to builder</span><span class="grow"></span><span class="mono" style="font-size:10px;opacity:.8">'+(backendLive?"Supabase ✓":"synced")+'</span>';}
  else{sbar.className="syncbar is-offline";sbar.innerHTML=I.wifi0+'<span>Offline — '+state.pending+' items queued</span><span class="grow"></span><button data-go="more:offline">View</button>';}
  $("#bellDot").textContent=ALERTS.filter(function(a){return a.tone==="crit";}).length;
}
function render(){
  if(capTimer){clearInterval(capTimer);capTimer=null;}
  if(analyzeTimer){clearInterval(analyzeTimer);analyzeTimer=null;}
  buildAppbar();
  buildTabbar();
  var fn=VIEWS[state.tab]||homeView;
  $("#screen").innerHTML=fn();
  var __cmp=$("#cmpsplit"), __sph=$("#sphere360");
  if(__cmp && state.insta.src){ mountCompare(); }
  else if(__sph && state.insta.src){ mountSphere(); }
  else {
    if(instaViewer){try{instaViewer.dispose();}catch(_){}instaViewer=null;}
    if(cmpAView){try{cmpAView.dispose();}catch(_){}cmpAView=null;}
    if(cmpBView){try{cmpBView.dispose&&cmpBView.dispose();}catch(_){}cmpBView=null;}
  }
  if(state.tab==="capture" && !state.sub && state.cap.step===5) startCapTimer();
  if(state.tab==="more" && state.sub && state.sub.indexOf("analyze:")===0 && state.bim.analyzeStep<6) startAnalyze();
  $("#screen").scrollTop=0;
}
function nav(tab,sub){state.tab=tab;state.sub=sub||null;render();}
function goString(str){
  // formats: "tab", "tab:sub", "tab:sub:extra"
  var parts=str.split(":");
  var tab=parts[0];
  if(parts.length===1){nav(tab,null);return;}
  if(parts[0]==="issues"&&parts[1]==="sub"){nav("issues","sub:"+parts[2]);return;}
  if(parts[0]==="tasks"&&parts[1]==="checklist"&&parts[2]!=null){nav("tasks","checklist:"+parts[2]);return;}
  if(parts[0]==="tasks"&&parts[1]==="checklist"){state.taskTab="checklist";nav("tasks","checklist");return;}
  if(parts[0]==="materials"&&parts[1]==="requests"){state.matTab="requests";nav("materials","requests");return;}
  if(parts[0]==="more"&&parts[1]==="analyze"){state.bim.analyzeStep=0;nav("more","analyze:"+parts[2]);return;}
  if(parts[0]==="more"&&parts[1]==="bim"&&parts[2]){nav("more","bim:"+parts[2]);return;}
  nav(tab,parts.slice(1).join(":"));
}
// overlay slider — live, no full re-render
window.__cmpOvl=function(v){state.bim.ovl=+v;var b=$(".ovl__bim");if(b)b.style.opacity=v/100;var l=$$(".ovl__lbls span");if(l[1])l[1].textContent=v+"% BIM";};

/* ============================================================ ANALYZE PIPELINE (animated) */
function startAnalyze(){
  if(analyzeTimer)clearInterval(analyzeTimer);
  var id=state.sub.split(":")[1];
  // Fire the REAL deployed pipeline (Supabase edge function) once, when online.
  // It runs server-side and writes detections/discrepancies/issues; on return we
  // reload so the results screen reflects the live run. Animation runs regardless.
  if(state.online && !state.bim.firedFor){ state.bim.firedFor=id; runPipelineLive(id); }
  analyzeTimer=setInterval(function(){
    if(!(state.tab==="more"&&state.sub&&state.sub.indexOf("analyze:")===0)){clearInterval(analyzeTimer);analyzeTimer=null;return;}
    state.bim.analyzeStep++;
    $("#screen").innerHTML=bimAnalyzeView(id);
    if(state.bim.analyzeStep>=6){clearInterval(analyzeTimer);analyzeTimer=null;state.bim.firedFor=null;}
  },1000);
}

/* ============================================================ CAPTURE TIMER */
function startCapTimer(){
  if(capTimer)clearInterval(capTimer);
  capTimer=setInterval(function(){
    state.cap.elapsed++;
    if(state.cap.elapsed===6)state.cap.anchors=1;
    if(state.cap.elapsed===13)state.cap.anchors=2;
    if(state.cap.elapsed===22)state.cap.anchors=3;
    // only repaint the live screen if still there
    if(state.tab==="capture"&&!state.sub&&state.cap.step===5){
      var live=$("#screen");
      // update just the timer + meter cheaply by re-render of capLive
      live.innerHTML=capLive();
    } else { clearInterval(capTimer);capTimer=null; }
  },1000);
}

/* ============================================================ EVENTS */
function onClick(e){
  var t=e.target;
  var go=t.closest("[data-go]");
  var act=t.closest("[data-act]");
  var tab=t.closest("[data-tab]");

  if(tab){var id=tab.dataset.tab; if(id==="capture"&&state.tab==="capture"){/*restart flow*/state.cap.step=0;} state.sub=null; nav(id,null); return;}
  if(go&&!act){goString(go.dataset.go); return;}
  if(!act) return;
  var a=act.dataset.act;

  switch(a){
    case "close-sheet": closeSheet(); break;
    case "toggle-day":
      state.dayStarted=!state.dayStarted;
      if(!state.dayStarted){toast("Day ended — daily report sent to builder");nav("more","report");}
      else {toast("Site day started · 06:42 · attendance logging");render();}
      break;
    case "problems": nav("issues",null); break;

    /* capture flow */
    case "cap-pick":
      state.cap[act.dataset.k]=act.dataset.v; render(); break;
    case "cap-conn":
      state.cap.conn=act.dataset.v; render(); break;
    case "cap-connect":
      state.cap.connecting=true; render();
      setTimeout(function(){
        if(state.tab!=="capture"||state.cap.step!==2){state.cap.connecting=false;return;}
        state.cap.connecting=false; state.cap.connected=true; state.cap.device="Insta360 X5";
        render(); toast("Insta360 X5 connected · streaming to phone");
      },1300); break;
    case "cap-usephone":
      state.cap.device="Phone camera"; state.cap.conn="Phone camera"; state.cap.connected=true; state.cap.connecting=false;
      render(); toast("Using phone camera as fallback"); break;
    case "cap-disconnect":
      state.cap.connected=false; state.cap.device=null; state.cap.conn="Wi-Fi Direct"; render(); break;
    case "set-start":
      var r=act.getBoundingClientRect();
      state.cap.start={x:Math.round((e.clientX-r.left)/r.width*100),y:Math.round((e.clientY-r.top)/r.height*100)};
      render(); break;
    case "cap-next":
      state.cap.step++; if(state.cap.step===5){state.cap.elapsed=0;state.cap.anchors=0;} render(); break;
    case "cap-back": state.cap.step=Math.max(0,state.cap.step-1); render(); break;
    case "cap-stop": if(capTimer){clearInterval(capTimer);capTimer=null;} state.cap.step=6; render(); break;
    case "pin-issue": pinIssueSheet(); break;
    case "cap-upload":
      state.captures=0; state.dayStarted=state.dayStarted;
      toast("Capture saved · "+(state.online?"uploading now":"queued for Wi-Fi"));
      state.cap={step:0,tower:null,floor:null,device:null,conn:"Wi-Fi Direct",connected:false,connecting:false,type:null,start:null,elapsed:0,pins:[],anchors:0,light:"low"};
      nav("home",null); break;
    case "cap-redo": state.cap.step=5; state.cap.elapsed=0; state.cap.anchors=0; state.cap.pins=[]; render(); break;
    case "cap-analyze":
      state.captures=0; toast("Capture uploaded · running 360° × BIM pipeline");
      state.cap={step:0,tower:null,floor:null,device:null,conn:"Wi-Fi Direct",connected:false,connecting:false,type:null,start:null,elapsed:0,pins:[],anchors:0,light:"low"};
      state.bim.analyzeStep=0; nav("more","analyze:CAP-0613-01"); break;

    /* photos / voice */
    case "add-photo": case "ci-photo":
      if(a==="ci-photo"){state.createIssue.photos++;render();} else {state.photos++; toast("Photo captured · AI verified ✓"); if(state.tab==="capture")render();}
      break;
    case "voice-toggle":
      state.voice.rec=!state.voice.rec;
      if(state.voice.rec){state.voice.done=false; render(); voiceTimer=setTimeout(function(){state.voice.rec=false;state.voice.done=true;render();},2600);}
      else {if(voiceTimer)clearTimeout(voiceTimer); render();}
      break;
    case "voice-file":
      toast("Created: 1 progress update · 1 material request · 1 issue");
      state.voice={rec:false,done:false}; nav("home",null); break;

    /* tasks */
    case "task-tab":
      if(state.tab==="materials"){state.matTab=act.dataset.v; state.sub=null;}
      else state.taskTab=act.dataset.v;
      state.sub=null; render(); break;
    case "toggle-chk":
      var g=CHECKLIST[+act.dataset.g], it=g.items[+act.dataset.i];
      it[1]=it[1]==="done"?"todo":"done"; render(); break;
    case "toggle-safety":
      var s=SAFETY[+act.dataset.i]; s[1]=s[1]==="done"?"todo":"done"; render(); break;
    case "update-progress": progressSheet(act.dataset.code); break;
    case "req-inspect": toast("Inspection requested · engineer notified"); break;
    case "req-approval": toast("Approval requested for "+act.dataset.name); break;
    case "approval-send": case "report-submit":
      toast(a==="report-submit"?"Daily report submitted to builder":"Sent for approval"); break;

    /* materials */
    case "mat-detail": matSheet(act.dataset.name); break;
    case "mat-issue-new": toast("Material issue — pick contractor & qty"); break;
    case "submit-request":
      MAT_REQUESTS.unshift({mat:"Cement (OPC 53)",qty:"100 bags",for:"First floor plastering",by:"Today",sev:"crit",status:"Awaiting builder"});
      state.pending++; toast("Request sent to builder · awaiting approval"); state.matTab="requests"; nav("materials","requests"); break;

    /* issues */
    case "issue-filter": state.issueFilter=act.dataset.v; render(); break;
    case "ci-type": state.createIssue.type=act.dataset.v; render(); break;
    case "ci-sev": state.createIssue.sev=act.dataset.v; render(); break;
    case "submit-issue": submitIssue(); break;
    case "resolve-issue": resolveIssue(act.dataset.id); break;
    case "reopen-issue":
      var iss=ISSUES.filter(function(x){return x.id===act.dataset.id;})[0]; if(iss)iss.status="Reopened";
      toast("Issue reopened"); render(); break;

    /* labour */
    case "labor-checkin": toast("Scan worker QR / RFID to check in"); break;
    case "labor-add": addWorkerSheet(); break;

    /* qr */
    case "qr-demo": case "qr-open": qrContextSheet(act.dataset.name||"Bathroom B-2"); break;

    /* misc */
    case "role": toast("Role: Supervisor · (Storekeeper / Engineer / Safety available)"); break;
    case "toggle-online":
      state.online=!state.online;
      if(state.online){state.pending=0;state.photos=0;state.captures=0;toast("Synced · all site data backed up");}
      else toast("Offline mode — work continues, data queued","warn");
      render(); break;
    case "sos": toast("SOS sent · builder, PM & contacts notified","warn"); break;
    case "emergency-report": toast(act.dataset.name+" — capturing location, time & photo","warn"); break;
    case "report-voice": nav("capture","voice"); break;
    case "visit-checkin": toast("Visitor checked in · PPE issued"); break;
    case "visit-share": toast("Walkthrough photos will be shared after exit"); break;
    case "measure-manual": toast("Manual measurement saved"); break;

    /* BIM × 360 analysis */
    case "cv-run": cvRunFrames(); break;
    case "model-run": modelRunFrames(); break;
    case "insta-demo": onInstaDemo(); break;
    case "insta-extract": instaExtract(); break;
    case "insta-clear": instaClear(); break;
    case "insta-pick": pickInstaFile(); break;
    case "cmp-pick-glb": pickGlbFile(); break;
    case "cmp-right": state.cmp.right=act.dataset.v; render(); break;
    case "cmp-lock":
      state.cmp.locked=!state.cmp.locked;
      if(state.cmp.locked){
        if(!(state.cmp.right==="mep"||(state.cmp.right==="glb"&&state.bim.modelKind==="ifc"))) state.cmp.right="mep";
        if(!state.cmp.traj){ toast("Loading recovered walk path\u2026"); loadTraj().then(function(){render();}); break; }
      }
      render(); break;
    case "cmp-walls":
      state.cmp.walls=!state.cmp.walls;
      if(cmpBView&&cmpBView.setWalls){try{cmpBView.setWalls(state.cmp.walls);}catch(_){}}
      var __wb=document.querySelector('[data-act=\'cmp-walls\']'); if(__wb){ __wb.textContent=state.cmp.walls?"Hide walls \u00b7 X-ray":"Show walls"; __wb.className="chipbtn "+(state.cmp.walls?"":"chipbtn--accent"); }
      break;
    case "cmp-sample-ifc":
      state.bim.glb="https://raw.githubusercontent.com/ThatOpen/engine_web-ifc/main/tests/ifcfiles/public/IfcOpenHouse_IFC4.ifc";
      state.bim.glbName="IfcOpenHouse (sample IFC)"; state.bim.glbUser=true; state.bim.modelKind="ifc"; state.cmp.right="glb";
      toast("Loading sample IFC\u2026 (web-ifc)"); render(); break;
    case "bim-view-load":
      state.bim.mvOpen=true; paintBimViewer();
      ensureModelViewer().then(function(){ paintBimViewer(); });
      break;
    case "cmp-mode": state.bim.cmpMode=act.dataset.v; render(); break;
    case "cmp-zone": state.bim.cmpZone=act.dataset.v; render(); break;
    case "reanalyze": state.bim.analyzeStep=0; nav("more","analyze:"+act.dataset.id); break;
    case "disc-issue": discToIssue(+act.dataset.i); break;
    case "disc-dismiss":
      DISCREPANCIES[+act.dataset.i].status="dismissed"; toast("Discrepancy dismissed"); render(); break;

    default: break;
  }
}
function discToIssue(i){
  var d=DISCREPANCIES[i]; if(!d||d.status!=="open")return;
  var id="SI-"+(214+Math.floor(Math.random()*700));
  var who=d.zone.indexOf("Bath")>-1?"Waterproofing team":d.kind==="deviation"?"ABC Mason Team":"Sri Sai Plumbers";
  ISSUES.unshift({id:id,t:d.element+" — "+d.kind+" (BIM mismatch)",loc:d.zone,sev:d.severity,who:who,status:"Open",age:"now",type:d.kind==="deviation"?"Drawing mismatch":"Quality"});
  d.status="issue_created"; d.issue_id=id; state.pending++;
  toast(id+" raised from AI finding · saved to device");
  render();
}

/* ---- sheets ---- */
function pinIssueSheet(){
  sheet("During capture · "+(state.cap.floor||"Ground floor"),"Pin issue here",
    '<div class="muted" style="font-size:12.5px;margin-bottom:14px">Speak or pick — we tag it to your exact spot in the walkthrough.</div>'+
    '<div class="gap-9">'+
    ['Bathroom 1 waterproofing incomplete','Wall plaster crack near window','Conduit not embedded','Block joint gap > 12mm','Custom — type / speak'].map(function(x,i){
      return '<button class="opt" data-act="pin-add" data-txt="'+esc(x)+'" style="margin:0"><div class="opt__ic">'+(i===4?I.mic:I.flag)+'</div><div class="opt__tx"><b style="font-size:13px">'+x+'</b></div></button>';
    }).join("")+'</div>',
    '<button class="btn btn--ghost" data-act="close-sheet">Cancel</button>');
}
function progressSheet(code){
  var w=WORKPKGS.filter(function(x){return x.code===code;})[0]; if(!w)return;
  sheet(code+" · "+w.con,"Update progress",
    '<div class="card" style="margin:0 0 14px"><div class="card__title" style="font-size:14px">'+w.name+'</div><div class="bar"><i style="width:'+w.pct+'%"></i></div><div class="bar__row"><span>now</span><b id="pp">'+w.pct+'%</b></div></div>'+
    '<div class="field"><label>Set progress %</label><input type="range" min="0" max="100" value="'+w.pct+'" id="prange" oninput="document.getElementById(\'pp\').textContent=this.value+\'%\'" style="width:100%;accent-color:var(--accent)"/></div>'+
    '<div class="field"><label>What got done?</label><textarea placeholder="e.g. completed 3 walls, started window line…"></textarea></div>'+
    '<div class="photoadd" data-act="add-photo">'+I.camera+'<span>Photo proof (required to mark complete)</span></div>',
    '<button class="btn btn--ghost" data-act="close-sheet">Cancel</button><button class="btn btn--solid" data-act="save-progress" data-code="'+code+'">Save update</button>');
}
function matSheet(name){
  var m=MATERIALS.filter(function(x){return x.name===name;})[0]; if(!m)return;
  sheet("Stock · "+m.po,name,
    '<div class="card" style="margin:0 0 14px">'+metaRow("In stock",m.stock+" "+m.unit)+metaRow("Days remaining",(m.days||0)+" days")+metaRow("Usage rate",m.rate)+metaRow("PO status",m.po)+'</div>'+
    '<div class="muted" style="font-size:12px">Scan the material lot QR to see received qty, storage location, issue history &amp; linked work packages.</div>',
    '<button class="btn btn--ghost" data-act="close-sheet">Close</button><button class="btn btn--solid" data-go="materials:request">Request more</button>');
}
function addWorkerSheet(){
  sheet("Daily labour","Add worker for today",
    '<div class="field"><label>Contractor</label><select><option>ABC Mason Team</option><option>Sri Sai Plumbers</option><option>BuildRight Civil</option></select></div>'+
    '<div class="field"><label>Role</label><div class="optgrid"><button class="optpick is-sel">Mason</button><button class="optpick">Helper</button><button class="optpick">Electrician</button></div></div>'+
    '<div class="field"><label>Helmet / vest colour</label><div class="optgrid"><button class="optpick is-sel">Yellow</button><button class="optpick">Blue</button><button class="optpick">Red</button></div></div>'+
    '<div class="card" style="background:var(--paper-3);text-align:center"><div class="qrframe" style="margin:6px auto;width:90px;height:90px"><span></span><span></span><span></span><span></span></div><div class="muted" style="font-size:11px">Daily QR generated — scan at gate to check in</div></div>',
    '<button class="btn btn--ghost" data-act="close-sheet">Cancel</button><button class="btn btn--solid" data-act="worker-added">Add & check in</button>');
}
function qrContextSheet(name){
  sheet("Location QR","◉ "+name,
    '<div class="gap-9">'+
    ctxRow("draw","Drawings","A-104 Rev 04 · P-110 Rev 02")+
    ctxRow("tasks","Active tasks","Waterproofing · 2nd coat pending")+
    ctxRow("clip","Quality checklist","Bathroom B-2 · 3/8 done")+
    ctxRow("flag","Open issues","1 · waterproofing incomplete")+
    ctxRow("box","Material issued","18 kg waterproof compound")+
    ctxRow("cap","360° captures","2 · last today 09:40")+
    '</div>',
    '<button class="btn btn--ghost" data-act="close-sheet">Close</button><button class="btn btn--solid" data-go="issues:create">Raise issue here</button>');
}
function ctxRow(ic,k,v){return '<div class="lrow" style="margin:0"><div class="lrow__ic">'+I[ic]+'</div><div class="lrow__tx"><b>'+k+'</b><span>'+v+'</span></div><span class="lrow__chev">'+I.chev+'</span></div>';}

/* sheet-scoped actions need their own binding (delegated below) */
function onSheetClick(e){
  var act=e.target.closest("[data-act]"); if(!act)return;
  var a=act.dataset.act;
  if(a==="pin-add"){
    var sec=Math.max(1,state.cap.elapsed); var mm=Math.floor(sec/60), ss=sec%60;
    state.cap.pins.push({txt:act.dataset.txt.replace(" — type / speak",""),at:mm+":"+(ss<10?"0":"")+ss});
    closeSheet(); toast("Pinned to capture · "+state.cap.pins.length+" total");
    if(state.tab==="capture"&&state.cap.step===5){$("#screen").innerHTML=capLive();startCapTimer();}
  }
  if(a==="save-progress"){
    var rng=$("#prange"); var w=WORKPKGS.filter(function(x){return x.code===act.dataset.code;})[0];
    if(w&&rng){w.pct=+rng.value; w.lbl=w.pct>=100?"Complete":"In progress"; if(w.pct>=100)w.status="ok";}
    state.pending++; closeSheet(); toast("Progress updated to "+(rng?rng.value:"")+"% · proof attached"); render();
  }
  if(a==="worker-added"){state.pending++; closeSheet(); toast("Worker added · checked in");}
}

/* ---- write-backs ---- */
function submitIssue(){
  var c=state.createIssue;
  var loc=($("#ci-loc")&&$("#ci-loc").value)||"Unspecified";
  var who=($("#ci-who")&&$("#ci-who").value)||"Unassigned";
  var desc=($("#ci-desc")&&$("#ci-desc").value)||"";
  var id="SI-"+(214+Math.floor(Math.random()*700));
  var issue={id:id,t:desc||(c.type+" issue at "+loc),loc:loc,sev:c.sev,who:who,status:"Open",age:"now",type:c.type};
  ISSUES.unshift(issue);
  state.createIssue={sev:"warn",type:"Quality",photos:0,loc:""};
  state.pending++;
  toast(id+" raised · saved to device");
  nav("issues",null);
  // best-effort write to the shared command-center backend; offline-safe.
  // Only claim "synced" on a confirmed 2xx — never assert proof we don't have.
  if(state.online){
    try{ sb("/cpm_issues",{method:"POST",headers:{"Content-Type":"application/json","Prefer":"return=minimal"},
      body:JSON.stringify({id:id,t:issue.t,loc:loc,sev:c.sev,who:who,status:"Open",age:"now",resp:who,drawing:"—",sort:999})})
      .then(function(r){ if(r&&r.ok){ state.pending=Math.max(0,state.pending-1); buildAppbar(); buildTabbar(); toast(id+" synced to builder ✓"); } })
      .catch(function(){}); }catch(_){}
  }
}
function resolveIssue(id){
  var it=ISSUES.filter(function(x){return x.id===id;})[0]; if(it)it.status="Closed";
  toast(id+" marked fixed"); nav("issues",null);
  if(state.online){try{sb("/cpm_issues?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({status:"Closed"})})
    .then(function(r){ if(r&&r.ok) toast(id+" closed · builder updated ✓"); }).catch(function(){});}catch(_){}}
}

/* ============================================================ BACKEND LOAD */
function replaceArr(arr,rows){if(!Array.isArray(rows))return;arr.length=0;rows.forEach(function(r){arr.push(r);});}
function loadBackend(){
  function get(t,q){return sb("/"+t+"?"+(q||"select=*")).then(function(r){if(!r.ok)throw 0;return r.json();});}
  return Promise.all([
    get("cpm_labor_teams","select=team,count&order=sort"),
    get("cpm_work_packages","select=name,code,pct,status,lbl&order=sort"),
    get("cpm_materials","select=name,unit,stock,days,rate,status,po&order=sort"),
    get("cpm_checklist","select=grp,items&order=sort"),
    get("cpm_qr","select=id,name,type,pending,last&order=sort"),
    get("cpm_issues","select=id,t,loc,sev,who,status,age&order=sort"),
    get("cpm_captures","select=*&order=sort"),
    get("cpm_frames","select=*&order=capture_id,idx"),
    get("cpm_bim_elements","select=*&order=sort"),
    get("cpm_detections","select=*&order=sort"),
    get("cpm_discrepancies","select=*&order=sort")
  ]).then(function(d){
    var pal=["#6B1F2A","#9A7B2E","#2E5A6B","#5B6E4A","#4A463E","#8A2A33"];
    if(d[0]&&d[0].length) replaceArr(LABOR,d[0].map(function(r,i){return {team:r.team,count:r.count,c:pal[i%pal.length]};}));
    if(d[1]&&d[1].length) WORKPKGS.forEach(function(w){var m=d[1].filter(function(x){return x.code===w.code;})[0];if(m){w.pct=m.pct;w.status=m.status;w.lbl=m.lbl;}});
    if(d[2]&&d[2].length) replaceArr(MATERIALS,d[2]);
    if(d[3]&&d[3].length) replaceArr(CHECKLIST,d[3].map(function(r){return {grp:r.grp,items:r.items};}));
    if(d[4]&&d[4].length) replaceArr(QRLOCS,d[4]);
    if(d[5]&&d[5].length) replaceArr(ISSUES,d[5].map(function(r){return {id:r.id,t:r.t,loc:r.loc,sev:r.sev,who:r.who,status:r.status,age:r.age,type:guessType(r)};}));
    // --- BIM × 360 pipeline ---
    if(d[6]&&d[6].length) replaceArr(CAPTURES,d[6].map(function(r){return {
      id:r.id,floor:r.floor,zone:r.zone,device:r.device,duration_s:r.duration_s,distance_m:r.distance_m,frame_count:r.frame_count,
      coverage_pct:r.coverage_pct,quality_score:r.quality_score,status:r.status,processing_step:r.processing_step,model_version:r.model_version,
      started:"Today",steps:(r.steps||[]).map(function(s){return [s.k,s.label,s.status,s.detail,s.ms?(s.ms/1000).toFixed(1)+"s":""];})};}));
    if(d[7]&&d[7].length) replaceArr(FRAMES,d[7].filter(function(r){return r.capture_id==="CAP-0613-01";}).map(function(r){return {idx:r.idx,t:r.t_offset_s,zone:r.zone,fx:r.fx,fy:r.fy,lit:r.lit,img:r.img};}));
    if(d[8]&&d[8].length) replaceArr(BIM,d[8].filter(function(r){return r.floor==="Ground floor";}).map(function(r){return {zone:r.zone,type:r.element_type,code:r.code,name:r.name,disc:r.discipline,spec:r.spec,bx:r.bx,by:r.by};}));
    if(d[9]&&d[9].length) replaceArr(DETECTIONS,d[9].map(function(r){return {zone:r.zone,code:bimCodeForDet(r,d[8]),label:r.label,confidence:r.confidence,bbox:r.bbox,present:r.present};}));
    if(d[10]&&d[10].length) replaceArr(DISCREPANCIES,d[10].map(function(r){return {zone:r.zone,kind:r.kind,element:r.element,severity:r.severity,confidence:r.confidence,status:r.status,issue_id:r.issue_id,note:r.note};}));
    backendLive=true; render();
    return true;
  }).catch(function(){return false;});
}
function bimCodeForDet(det,bimRows){var b=(bimRows||[]).filter(function(x){return x.id===det.bim_id;})[0];return b?b.code:"";}
function guessType(r){var s=(r.t||"").toLowerCase();if(s.indexOf("safety")>-1||s.indexOf("edge")>-1||s.indexOf("scaffold")>-1)return"Safety";if(s.indexOf("cement")>-1||s.indexOf("stock")>-1||s.indexOf("material")>-1)return"Material";if(s.indexOf("door")>-1||s.indexOf("drawing")>-1||s.indexOf("mismatch")>-1)return"Drawing mismatch";return"Quality";}

/* ============================================================ CLOCK + BOOT */
function tickClock(){
  var el=$("#clock"); if(!el)return;
  var d=new Date(); var h=d.getHours(), m=d.getMinutes();
  el.textContent=(h<10?"0":"")+h+":"+(m<10?"0":"")+m;
}
function boot(){
  document.getElementById("phone").addEventListener("click",function(e){
    if(e.target.closest("#sheet")) onSheetClick(e);
    onClick(e);
  });
  document.getElementById("phone").addEventListener("change",function(e){
    var f=e.target.closest('input[type=file][data-act="bim-upload"]');
    if(f && f.files && f.files[0]){ onBimUpload(f.files[0]); return; }
    var inf=e.target.closest('input[type=file][data-act="insta-import"]');
    if(inf && inf.files && inf.files[0]){ onInstaImport(inf.files[0]); return; }
  });
  $("#scrim").addEventListener("click",closeSheet);
  $("#bell").addEventListener("click",function(){nav("home",null);toast("Showing today's priority alerts");});
  try{console.log("%cSthyra Supervisor build: 360\u2194BIM compare v3","color:#7a2230;font-weight:700");}catch(_){}
  tickClock(); setInterval(tickClock,30000);
  render();
  loadBackend();
}
if(document.readyState!=="loading")boot(); else document.addEventListener("DOMContentLoaded",boot);
})();
