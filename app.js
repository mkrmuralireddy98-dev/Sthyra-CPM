/* ============================================================
   STHYRA CPM — app logic, mock data, views, interactions
   Single-file, zero-build. All data is illustrative.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------- ICONS */
  const I = {
    command:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="6" height="6"/><rect x="11.5" y="2.5" width="6" height="6"/><rect x="2.5" y="11.5" width="6" height="6"/><rect x="11.5" y="11.5" width="6" height="6"/></svg>',
    live:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="5" width="11" height="10" rx="1"/><path d="M13.5 9l4-2.2v6.4L13.5 11"/></svg>',
    progress:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 16V4"/><path d="M3 16h14"/><path d="M6 13l3-4 3 2 4-6"/></svg>',
    quality:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 2.5l6 2.2v4.5c0 4-2.6 6.4-6 8.3-3.4-1.9-6-4.3-6-8.3V4.7z"/><path d="M7.3 10l1.8 1.8L13 8"/></svg>',
    materials:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 6.5L10 3l7 3.5v7L10 17 3 13.5z"/><path d="M3 6.5L10 10l7-3.5M10 10v7"/></svg>',
    estimate:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="2.5" width="12" height="15" rx="1.3"/><path d="M6.8 6h6.4M6.8 9.4h2M11.2 9.4h2M6.8 12.6h2M11.2 12.6h2M6.8 15.4h2"/></svg>',
    labor:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="2.6"/><circle cx="14" cy="8" r="2"/><path d="M2.5 16c0-2.6 2-4.2 4.5-4.2S11.5 13.4 11.5 16M12.5 15.5c.1-2 1.4-3.2 3.2-3.2 1.7 0 3 1.1 3 3.2"/></svg>',
    drawings:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 2.5L17 6l-7 3.5L3 6z"/><path d="M3 10l7 3.5L17 10M3 14l7 3.5L17 14"/></svg>',
    issues:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 2.8L18 16.5H2z"/><path d="M10 8v3.5M10 13.6v.1"/></svg>',
    payments:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="4.5" width="15" height="11" rx="1.2"/><path d="M2.5 8h15"/><path d="M5.5 12.5h3"/></svg>',
    reports:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 2.5h7l3 3v12H5z"/><path d="M12 2.5v3.2h3M7.5 10h5M7.5 13h5"/></svg>',
    alerts:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 3a4 4 0 0 0-4 4c0 4-1.5 5-1.5 5h11S14 11 14 7a4 4 0 0 0-4-4Z"/><path d="M8.5 15a1.5 1.5 0 0 0 3 0"/></svg>',
    gallery:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="3.5" width="15" height="13" rx="1.2"/><circle cx="7" cy="8" r="1.4"/><path d="M3 14l4-3.2 3.4 2.6L13 9l4 3.4"/></svg>',
    vision:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"/><circle cx="10" cy="10" r="2.2"/></svg>',
    decision:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 2v3M10 15v3M2 10h3M15 10h3"/><circle cx="10" cy="10" r="3.2"/></svg>',
    voice:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="7.5" y="2.5" width="5" height="9" rx="2.5"/><path d="M5 9.5a5 5 0 0 0 10 0M10 14.5V17"/></svg>',
    check:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10.5l4 4 8-9"/></svg>',
    play:'<svg viewBox="0 0 20 20" fill="#fff"><path d="M6 4l11 6-11 6z"/></svg>',
    drone:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="2.1"/><circle cx="4" cy="4" r="1.9"/><circle cx="16" cy="4" r="1.9"/><circle cx="4" cy="16" r="1.9"/><circle cx="16" cy="16" r="1.9"/><path d="M5.5 5.5l2.9 2.9M14.5 5.5l-2.9 2.9M5.5 14.5l2.9-2.9M14.5 14.5l-2.9-2.9"/></svg>',
    walk:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><ellipse cx="10" cy="10.5" rx="7.5" ry="4.2"/><path d="M3.2 8.4a8 4 0 0 1 13.6 0"/><path d="M10 6.3v8.4"/><path d="M15.3 6.2l1.5.5-.4 1.5"/></svg>',
    warrow:'<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#fff" stroke-width="2"><path d="M5.5 3l5 5-5 5"/></svg>',
    expand:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/></svg>',
    phone:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 3.5h3l1.2 3.2-1.8 1.4a9 9 0 0 0 4 4l1.4-1.8 3.2 1.2v3c0 .8-.7 1.4-1.5 1.3C9.6 15.2 4.8 10.4 3.7 5 3.6 4.2 4.2 3.5 5 3.5Z"/></svg>',
    wa:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 17l1.3-3.5A6.8 6.8 0 1 1 7 16.2z"/><path d="M7.3 7.5c.2 2.4 2.8 4.9 5.2 5.1.7.1 1.3-.6 1.1-1.3l-1.6-.7-.9.8c-.9-.4-1.7-1.2-2.1-2.1l.8-.9-.7-1.6c-.7-.2-1.5.3-1.1 1"/></svg>',
  };

  /* ---------------------------------------------------------- MOCK DATA */
  const PROJECT = {
    name: "Sky Villa, Kokapet",
    meta: "Hyderabad · G+2 luxury villa · Plot 14, Sri Aditya Athena",
    health: 82, healthDelta: +4,
  };

  const KPIS = [
    { label:"Labourers on site", val:"46", foot:"Peak 48 · plan 52", bar:0.88, tone:"warn" },
    { label:"Active tasks", val:"7", foot:"3 delayed", tone:"warn" },
    { label:"Open quality issues", val:"5", foot:"1 critical · 4 medium", tone:"crit" },
    { label:"Cameras online", val:'12<span class="unit">/13</span>', foot:"Gate-2 cam offline 41m", tone:"warn" },
    { label:"Material risk", val:"2d", foot:"Cement runs out Sat", tone:"crit" },
    { label:"Curing tasks due", val:"2", foot:"Slab GF-1 overdue", tone:"crit" },
    { label:"Today's spend", val:"₹1.84L", foot:"Labour + RMC pour", tone:"ok" },
    { label:"Supervisor report", val:"In", foot:"Submitted 6:10 PM", tone:"ok" },
  ];

  const ATTENTION = [
    { tone:"crit", t:"Basement raft curing not confirmed for 2 days", d:"Curing log empty since 11 Jun. Honeycombing risk on raft edge.", actions:[["View",""],["Assign","accent"]] },
    { tone:"crit", t:"Approve cement purchase — 50 bags", d:"Stock covers ~2 days. Quote ₹385/bag from Maha Cement, Kokapet.", actions:[["Decline",""],["Approve","accent"]] },
    { tone:"warn", t:"Waterproofing started before surface cleaning", d:"Bathroom B-2 · first coat applied on un-cleaned surface. AI flagged from photo.", actions:[["View",""],["Hold","accent"]] },
    { tone:"warn", t:"GF slab pour claim pending your sign-off", d:"Mason contractor claims 100% — checklist + cube test pending.", actions:[["Review","accent"]] },
  ];

  const FEED = [
    { t:"6:42 PM", txt:"<b>Daily report</b> generated and sent to you + 2 stakeholders." },
    { t:"5:58 PM", txt:"<b>Pour SLAB-GF-001</b> completed — 14.2 m³ M25, 2 cube sets taken." },
    { t:"4:20 PM", txt:"<b>Quality issue</b> opened: wall alignment off by 22mm, Bedroom 1." },
    { t:"2:05 PM", txt:"<b>Steel</b> received — 3.2 T against PO of 3.5 T. Short by 300 kg." },
    { t:"12:30 PM", txt:"<b>46 workers</b> peak detected across 4 zones by Site Vision." },
    { t:"9:15 AM", txt:"<b>Cement</b> issued to mason team — 18 bags. Balance 22 bags." },
  ];

  const CAMERAS = [
    { zone:"Ground Floor — Hall", people:11, time:"18:44:02", bbox:[[14,42,18,30],[40,50,15,26]] },
    { zone:"First Floor — Slab", people:9, time:"18:44:01", bbox:[[28,38,16,30],[55,46,14,28],[72,40,13,30]] },
    { zone:"Basement — Raft", people:8, time:"18:43:59", bbox:[[20,45,17,30]] },
    { zone:"Material Yard", people:6, time:"18:44:03", bbox:[[44,40,16,32]] },
    { zone:"Entry Gate-1", people:3, time:"18:44:00", bbox:[[50,44,14,30]] },
    { zone:"Entry Gate-2", off:true },
  ];

  const ZONES = [
    { id:"base", name:"Basement", count:8, x:4, y:55, w:30, h:40 },
    { id:"gf",   name:"Ground Floor", count:14, x:36, y:30, w:34, h:42, active:true },
    { id:"ff",   name:"First Floor", count:11, x:36, y:4, w:34, h:24 },
    { id:"yard", name:"Material Yard", count:6, x:72, y:30, w:24, h:32 },
    { id:"gate", name:"Entry Gate", count:3, x:4, y:4, w:30, h:24 },
  ];

  // Genuine construction-site interior 360° captures — equirectangular, CC0
  // (Poly Haven, mirrored on Wikimedia Commons; CORS-enabled, ~2:1)
  const PANO = {
    interior:  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Interior_construction_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg/3840px-Interior_construction_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg",
    abandoned: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Abandoned_construction_-_Panorama_%28Poly_Haven%29.jpg/3840px-Abandoned_construction_-_Panorama_%28Poly_Haven%29.jpg",
    yard:      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Construction_yard_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg/3840px-Construction_yard_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg",
    parking:   "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Future_parking_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg/3840px-Future_parking_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg",
    garage:    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Parking_garage_%E2%80%93_Panorama_%28Greg_Zaal_and_Rico_Cilliers_via_Poly_Haven%29.jpg/3840px-Parking_garage_%E2%80%93_Panorama_%28Greg_Zaal_and_Rico_Cilliers_via_Poly_Haven%29.jpg",
    workshop:  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Small_workshop_-_Panorama_%28Poly_haven%29.jpg/3840px-Small_workshop_-_Panorama_%28Poly_haven%29.jpg",
  };
  // construction stages ordered earliest → latest; rewinding the day walks each scene back
  const STAGES = [PANO.yard, PANO.parking, PANO.abandoned, PANO.interior, PANO.garage, PANO.workshop];
  const WALK_SCENES = [
    { name:"Ground Floor — Hall", floor:"Ground Floor", note:"Blockwork in progress · 65%", draw:"A-02", mx:50, my:52, stage:3 },
    { name:"Bedroom 1", floor:"Ground Floor", note:"Wall alignment issue logged", draw:"A-04", flag:"warn", mx:30, my:44, stage:2 },
    { name:"Bathroom B-2", floor:"Ground Floor", note:"Waterproofing — surface flagged", draw:"P-03", flag:"crit", mx:66, my:40, stage:5 },
    { name:"Kitchen", floor:"Ground Floor", note:"Plumbing sleeves set", draw:"P-02", mx:72, my:62, stage:4 },
    { name:"Staircase core", floor:"Core", note:"Shuttering erected", draw:"S-06", mx:50, my:34, stage:3 },
    { name:"First Floor — Slab", floor:"First Floor", note:"Poured today · curing", draw:"S-04", flag:"warn", mx:55, my:22, stage:1 },
    { name:"Basement — Raft", floor:"Basement", note:"Curing pending 2 days", draw:"S-02", flag:"crit", mx:42, my:76, stage:2 },
  ];
  // which capture to show for a scene on a given day index (earlier day → rawer stage)
  function captureFor(scene, dateIdx){
    var i = scene.stage - ((TIMELINE.length - 1) - dateIdx);
    if(i < 0) i = 0; if(i > STAGES.length - 1) i = STAGES.length - 1;
    return STAGES[i];
  }
  var stageLabels = ["Excavation / yard","Substructure deck","Structural shell","Walls & blockwork","Services & enclosure","Fit-out"];
  function stageLabel(scene, dateIdx){
    var i = scene.stage - ((TIMELINE.length - 1) - dateIdx);
    if(i < 0) i = 0; if(i > STAGES.length - 1) i = STAGES.length - 1;
    return stageLabels[i];
  }

  // ── Drone view: weekly 360° aerial captures (CC0 Poly Haven, equirectangular) ──
  const AER = "https://upload.wikimedia.org/wikipedia/commons/thumb/";
  const DRONE_STAGES = [
    AER+"1/11/Dirt_bike_track_01_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg/3840px-Dirt_bike_track_01_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg",
    AER+"c/ce/Derelict_airfield_01_%E2%80%93_Panorama_%28Alexander_Scholten_via_Poly_Haven%29.jpg/3840px-Derelict_airfield_01_%E2%80%93_Panorama_%28Alexander_Scholten_via_Poly_Haven%29.jpg",
    AER+"7/75/Construction_yard_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg/3840px-Construction_yard_%E2%80%93_Panorama_%28Sergej_Majboroda_via_Poly_Haven%29.jpg",
    AER+"6/6d/Blaubeuren_outskirts_%E2%80%93_Panorama_%28Andreas_Mischok_via_Poly_Haven%29.jpg/3840px-Blaubeuren_outskirts_%E2%80%93_Panorama_%28Andreas_Mischok_via_Poly_Haven%29.jpg",
    AER+"3/3e/Cambridge_%E2%80%93_Panorama_%28Andreas_Mischok_via_Poly_Haven%29.jpg/3840px-Cambridge_%E2%80%93_Panorama_%28Andreas_Mischok_via_Poly_Haven%29.jpg",
    AER+"8/8c/Canary_wharf_%E2%80%93_Panorama_%28Andreas_Mischok_via_Poly_Haven%29.jpg/3840px-Canary_wharf_%E2%80%93_Panorama_%28Andreas_Mischok_via_Poly_Haven%29.jpg"
  ];
  const DRONE_LABELS = ["Site cleared","Earthworks","Foundations & laydown","Superstructure","Topping out","Facade & finishes"];
  const DRONE_SCENES = [
    { name:"Whole site — overview", note:"Topping out · structure 65%", stage:5, mx:50, my:50 },
    { name:"North block", note:"Slab cast, columns up", stage:4, flag:"warn", mx:48, my:26 },
    { name:"South block & yard", note:"Foundations · raft curing", stage:2, flag:"crit", mx:40, my:74 },
    { name:"Entrance & laydown", note:"Material staging area", stage:3, mx:74, my:58 }
  ];
  function droneCapture(scene, dateIdx){
    var i = scene.stage - ((TIMELINE.length - 1) - dateIdx);
    if(i < 0) i = 0; if(i > DRONE_STAGES.length - 1) i = DRONE_STAGES.length - 1;
    return DRONE_STAGES[i];
  }
  function droneStageLabel(scene, dateIdx){
    var i = scene.stage - ((TIMELINE.length - 1) - dateIdx);
    if(i < 0) i = 0; if(i > DRONE_LABELS.length - 1) i = DRONE_LABELS.length - 1;
    return DRONE_LABELS[i];
  }

  const WORKPKGS = [
    { name:"Foundation & raft", code:"WP-01", pct:100, status:"ok", lbl:"Complete" },
    { name:"Basement RCC", code:"WP-02", pct:100, status:"ok", lbl:"Complete" },
    { name:"Ground floor columns", code:"WP-03", pct:100, status:"ok", lbl:"Complete" },
    { name:"Ground floor slab", code:"WP-04", pct:92, status:"warn", lbl:"Curing" },
    { name:"GF blockwork", code:"WP-05", pct:65, status:"accent", lbl:"In progress" },
    { name:"Plumbing rough-in", code:"WP-06", pct:38, status:"accent", lbl:"In progress" },
    { name:"Electrical rough-in", code:"WP-07", pct:24, status:"warn", lbl:"Delayed" },
    { name:"Waterproofing — wet areas", code:"WP-08", pct:15, status:"warn", lbl:"Started" },
    { name:"First floor columns", code:"WP-09", pct:0, status:"neutral", lbl:"Not started" },
  ];

  const TIMELINE = [
    { date:"01 Jun", tag:"Excavation", labor:32, mat:"Diesel 180L", work:"Excavation to founding level", issues:0 },
    { date:"05 Jun", tag:"Footing steel", labor:38, mat:"Steel 2.1 T", work:"Footing reinforcement tied", issues:1 },
    { date:"08 Jun", tag:"Raft concrete", labor:44, mat:"M25 22 m³", work:"Raft pour completed", issues:0 },
    { date:"11 Jun", tag:"Column starter", labor:40, mat:"Cement 30 bags", work:"GF column starters cast", issues:1 },
    { date:"12 Jun", tag:"GF columns", labor:45, mat:"Steel 1.8 T", work:"GF columns 80% cast", issues:2 },
    { date:"13 Jun", tag:"GF slab", labor:46, mat:"M25 14.2 m³", work:"GF slab pour completed", issues:3 },
  ];

  const CHECKLIST = [
    { group:"Before pour", items:[
      ["Rebar checked", "done", "Eng. Ramesh"],["Shuttering alignment", "done", "Ramesh"],
      ["Cover blocks placed", "done", "—"],["Electrical conduits", "done", "Suresh"],
      ["Plumbing sleeves", "pending", "Awaiting"],["Formwork oil applied", "done", "—"],
      ["Concrete grade confirmed — M25", "done", "RMC"],["Slump test done", "pending", "On arrival"],
    ]},
    { group:"During pour", items:[
      ["Concrete batch recorded", "done", "ULTRATECH"],["Pour start 13:05", "done", "—"],
      ["Pour end 15:50", "done", "—"],["Vibration completed", "done", "—"],["Cube samples taken — 2 sets", "done", "Lab"],
    ]},
    { group:"After pour", items:[
      ["Curing started", "todo", "—"],["Shuttering removal date set", "todo", "—"],
      ["Honeycombing inspection", "todo", "—"],["Final engineer approval", "todo", "Pending"],
    ]},
  ];

  const QRLOCS = [
    { id:"QR-C1",  name:"Column C1", type:"Structural", pending:0, last:"12 Jun" },
    { id:"QR-S1",  name:"Slab GF-1", type:"Structural", pending:2, last:"Today" },
    { id:"QR-B2",  name:"Bathroom B-2", type:"Waterproofing", pending:1, last:"Today" },
    { id:"QR-W3",  name:"Bedroom Wall W3", type:"Blockwork", pending:1, last:"Today" },
    { id:"QR-K1",  name:"Kitchen Plumbing", type:"MEP", pending:0, last:"11 Jun" },
    { id:"QR-DB1", name:"Electrical DB", type:"MEP", pending:0, last:"10 Jun" },
    { id:"QR-WP1", name:"Sump Waterproofing", type:"Waterproofing", pending:0, last:"09 Jun" },
    { id:"QR-C5",  name:"Column C5", type:"Structural", pending:0, last:"12 Jun" },
  ];

  const PROOF = [
    { stage:"Surface cleaning", state:"flag", note:"Reused photo suspected", tone:"warn" },
    { stage:"First coat", state:"ok", note:"Verified · location match", tone:"ok", clean:true },
    { stage:"Mesh / treatment", state:"empty" },
    { stage:"Second coat", state:"empty" },
    { stage:"Ponding test", state:"empty" },
    { stage:"Final approval", state:"empty" },
  ];

  const DEFECTS = [
    { t:"Honeycombing on column edge", d:"Column C5, south face · near construction joint", conf:81, box:[20,30,40,45] },
    { t:"Wall alignment deviation", d:"Bedroom 1 · ~22mm out of plumb vs drawing", conf:74, box:[35,20,30,55] },
    { t:"Surface not cleaned before coat", d:"Bathroom B-2 · waterproofing first coat", conf:88, box:[15,35,55,40] },
    { t:"Debris accumulation", d:"First floor slab · obstructs curing", conf:69, box:[40,50,45,35] },
  ];

  // Process quality checks — every construction stage, reviewed & fed back (synced to Supabase)
  const QC = [
    { id:1,  sort:1,  name:"Site cleaning", phase:"Substructure", status:"Pass", rating:5, feedback:"Site cleared, debris removed, access roads OK.", inspector:"Eng. Ramesh", checked_at:"02 Jun" },
    { id:2,  sort:2,  name:"Survey", phase:"Substructure", status:"Pass", rating:5, feedback:"Setting-out verified against drawing. Benchmarks OK.", inspector:"Eng. Ramesh", checked_at:"03 Jun" },
    { id:3,  sort:3,  name:"Earth work", phase:"Substructure", status:"Pass", rating:4, feedback:"Excavation to founding level. Soil bearing confirmed.", inspector:"Eng. Ramesh", checked_at:"05 Jun" },
    { id:4,  sort:4,  name:"Footings", phase:"Substructure", status:"Pass", rating:4, feedback:"Footing reinforcement & cover verified before pour.", inspector:"Eng. Ramesh", checked_at:"06 Jun" },
    { id:5,  sort:5,  name:"Columns", phase:"Superstructure", status:"Pass", rating:4, feedback:"GF columns plumb within tolerance. C5 honeycomb patched.", inspector:"Eng. Ramesh", checked_at:"12 Jun" },
    { id:6,  sort:6,  name:"Slab", phase:"Superstructure", status:"Rework", rating:2, feedback:"GF slab — curing log incomplete; cube test pending; honeycomb at edge. Rework + retest.", inspector:"Eng. Ramesh", checked_at:"13 Jun" },
    { id:7,  sort:7,  name:"Brick work", phase:"Superstructure", status:"Pending", rating:null, feedback:"Bedroom 1 wall 22mm out of plumb — awaiting correction before sign-off.", inspector:"", checked_at:"13 Jun" },
    { id:8,  sort:8,  name:"Electrical / plumbing work", phase:"MEP rough-in", status:"Pending", rating:null, feedback:"Conduiting delayed; bathroom B-2 sleeve missing. Recheck before slab close-up.", inspector:"", checked_at:"13 Jun" },
    { id:9,  sort:9,  name:"Plastering", phase:"Finishing", status:"Not started", rating:null, feedback:"", inspector:"", checked_at:"" },
    { id:10, sort:10, name:"Painting", phase:"Finishing", status:"Not started", rating:null, feedback:"", inspector:"", checked_at:"" },
    { id:11, sort:11, name:"Tiles", phase:"Finishing", status:"Not started", rating:null, feedback:"", inspector:"", checked_at:"" },
    { id:12, sort:12, name:"Door & windows", phase:"Finishing", status:"Not started", rating:null, feedback:"", inspector:"", checked_at:"" },
    { id:13, sort:13, name:"Electrical wiring / switches", phase:"MEP final", status:"Not started", rating:null, feedback:"", inspector:"", checked_at:"" },
    { id:14, sort:14, name:"Plumbing", phase:"MEP final", status:"Not started", rating:null, feedback:"", inspector:"", checked_at:"" },
    { id:15, sort:15, name:"Washroom / kitchen fitting", phase:"Fit-out", status:"Not started", rating:null, feedback:"", inspector:"", checked_at:"" },
    { id:16, sort:16, name:"Granite laying", phase:"Fit-out", status:"Not started", rating:null, feedback:"", inspector:"", checked_at:"" },
  ];
  const QC_STATUS_TONE = { "Pass":"ok", "Rework":"crit", "Pending":"warn", "Not started":"neutral" };

  // Stage-gate quality system: gates (with hold points) + grouped inspection items (loaded from Supabase)
  const QSTAGES = [
    {id:1,sort:1,name:"Site cleaning",phase:"Substructure",is_hold_point:false,status:"Closed",score:94},
    {id:2,sort:2,name:"Survey",phase:"Substructure",is_hold_point:false,status:"Closed",score:96},
    {id:3,sort:3,name:"Earth work",phase:"Substructure",is_hold_point:false,status:"Approved",score:90},
    {id:4,sort:4,name:"Footings",phase:"Substructure",is_hold_point:true,status:"Approved",score:92},
    {id:5,sort:5,name:"Columns",phase:"Superstructure",is_hold_point:true,status:"Approved",score:88},
    {id:6,sort:6,name:"Slab",phase:"Superstructure",is_hold_point:true,status:"Approved with Observation",score:78},
    {id:7,sort:7,name:"Brick work",phase:"Superstructure",is_hold_point:false,status:"Inspection Pending",score:75},
    {id:8,sort:8,name:"Electrical / plumbing rough-in",phase:"MEP rough-in",is_hold_point:true,status:"Ready for Inspection",score:72},
    {id:9,sort:9,name:"Plastering",phase:"Finishing",is_hold_point:false,status:"Not Started",score:0},
    {id:10,sort:10,name:"Painting",phase:"Finishing",is_hold_point:false,status:"Not Started",score:0},
    {id:11,sort:11,name:"Tiles",phase:"Finishing",is_hold_point:true,status:"Not Started",score:0},
    {id:12,sort:12,name:"Door & windows",phase:"Finishing",is_hold_point:false,status:"Not Started",score:0},
    {id:13,sort:13,name:"Electrical wiring / switches",phase:"MEP final",is_hold_point:true,status:"Not Started",score:0},
    {id:14,sort:14,name:"Plumbing",phase:"MEP final",is_hold_point:true,status:"Not Started",score:0},
    {id:15,sort:15,name:"Washroom / kitchen fitting",phase:"Fit-out",is_hold_point:false,status:"Not Started",score:0},
    {id:16,sort:16,name:"Granite laying",phase:"Fit-out",is_hold_point:false,status:"Not Started",score:0},
  ];
  let QITEMS = [];
  const QSTATUS_TONE = { "Closed":"ok","Approved":"ok","Approved with Observation":"warn","Inspection Pending":"warn","Ready for Inspection":"warn","Rework Required":"crit","Rejected":"crit","Rework Completed":"warn","Not Started":"neutral" };
  const QITEM_TONE = { "pass":"ok","fail":"crit","na":"neutral","pending":"warn" };
  const QC_APPROVED = ["Approved","Approved with Observation","Closed"];

  /* ---- Stage-wise material take-off (quantity take-off → recipe → wastage → BOQ). Mirrors cpm_estimate.
     `stage` matches QSTAGES.name so each estimate ties back to its quality gate. */
  const EST_FAM = {
    concrete:["Concrete","#6B6257"], steel:["Steel","#8A2A33"], cement:["Cement","#8C8579"],
    sand:["Sand","#B8A24A"], blocks:["Masonry","#6B7A5A"], mesh:["Reinforcement","#8A2A33"],
    tiles:["Tiles","#6B7A5A"], paint:["Paint / finish","#6B1F2A"], conduit:["Electrical","#B8860B"],
    pipe:["Plumbing","#4A6B7A"], fittings:["Fittings","#4A6B7A"], hardware:["Joinery","#6B6257"],
    earth:["Earthwork","#8C8579"], other:["General","#8C8579"]
  };
  const CONF_TONE = { high:"ok", medium:"warn", low:"crit" };
  // [stage, family, material, base, unit, wastage%, source, confidence]
  const ESTR = [
   ["Earth work","earth","Excavation",145,"m³",0,"Footing layout","high"],
   ["Earth work","earth","Backfilling",92,"m³",0,"Computed","medium"],
   ["Earth work","other","Anti-termite treatment",180,"m²",0,"Area","medium"],
   ["Footings","concrete","PCC (M10)",8.4,"m³",3,"Recipe","high"],
   ["Footings","concrete","RCC footing concrete (M25)",42.8,"m³",3,"BIM volume","high"],
   ["Footings","steel","Reinforcement (Fe500D)",4650,"kg",5,"BBS","high"],
   ["Footings","other","Cover blocks",1800,"nos",5,"Recipe","medium"],
   ["Footings","other","Shuttering",95,"m²",5,"Recipe","medium"],
   ["Columns","concrete","Column concrete (M25)",18.6,"m³",3,"BIM volume","high"],
   ["Columns","steel","Reinforcement (Fe500D)",2950,"kg",5,"BBS","high"],
   ["Columns","other","Column shuttering",240,"m²",5,"Recipe","medium"],
   ["Columns","other","Cover blocks",900,"nos",5,"Recipe","medium"],
   ["Slab","concrete","Slab concrete (M25)",32.5,"m³",3,"BIM volume","high"],
   ["Slab","concrete","Beam concrete (M25)",14.2,"m³",3,"BIM volume","high"],
   ["Slab","steel","Reinforcement (Fe500D)",5200,"kg",5,"BBS","high"],
   ["Slab","other","Shuttering / centering",520,"m²",5,"Recipe","medium"],
   ["Slab","conduit","Electrical conduit 25mm",420,"m",8,"MEP drawing","medium"],
   ["Slab","pipe","Plumbing sleeves",18,"nos",5,"MEP drawing","medium"],
   ["Brick work","blocks","AAC blocks 200×200×400",15800,"nos",5,"Wall area","high"],
   ["Brick work","cement","Cement (mortar 1:6)",185,"bags",3,"Recipe","medium"],
   ["Brick work","sand","River sand",32,"m³",5,"Recipe","medium"],
   ["Brick work","mesh","Chicken mesh at joints",420,"m",5,"Recipe","medium"],
   ["Electrical / plumbing rough-in","conduit","PVC conduit 25mm",620,"m",8,"MEP drawing","medium"],
   ["Electrical / plumbing rough-in","conduit","PVC conduit 20mm",380,"m",8,"MEP drawing","medium"],
   ["Electrical / plumbing rough-in","fittings","Switch / junction boxes",86,"nos",5,"MEP drawing","medium"],
   ["Electrical / plumbing rough-in","pipe","CPVC 20mm",140,"m",8,"MEP drawing","medium"],
   ["Electrical / plumbing rough-in","pipe","UPVC 110mm drainage",95,"m",8,"MEP drawing","medium"],
   ["Plastering","other","Internal plaster area",2400,"m²",0,"BIM area","high"],
   ["Plastering","other","External plaster area",850,"m²",0,"BIM area","high"],
   ["Plastering","cement","Cement (1:4 / 1:6)",520,"bags",3,"Recipe","medium"],
   ["Plastering","sand","River sand",90,"m³",5,"Recipe","medium"],
   ["Painting","other","Paintable area",3100,"m²",0,"BIM area","high"],
   ["Painting","other","Wall putty",1250,"kg",5,"Recipe","medium"],
   ["Painting","paint","Primer",310,"L",5,"Recipe","medium"],
   ["Painting","paint","Interior emulsion",620,"L",8,"Recipe","medium"],
   ["Painting","paint","Exterior emulsion",180,"L",8,"Recipe","medium"],
   ["Tiles","tiles","Floor tiles (vitrified)",1850,"sqft",7,"Room area","high"],
   ["Tiles","tiles","Wall tiles (wet areas)",980,"sqft",10,"Recipe","medium"],
   ["Tiles","other","Tile adhesive",95,"bags",5,"Recipe","medium"],
   ["Tiles","other","Grout",48,"kg",5,"Recipe","medium"],
   ["Door & windows","hardware","Door sets (frame + shutter)",12,"nos",0,"Schedule","high"],
   ["Door & windows","hardware","Windows (frame + glass)",14,"nos",0,"Schedule","high"],
   ["Door & windows","hardware","Hardware sets (lock/hinge/handle)",26,"nos",0,"Schedule","high"],
   ["Electrical wiring / switches","other","Wire 1.5 sqmm",1200,"m",10,"Route est.","medium"],
   ["Electrical wiring / switches","other","Wire 2.5 sqmm",850,"m",10,"Route est.","medium"],
   ["Electrical wiring / switches","fittings","Switches & sockets",150,"nos",5,"Point schedule","high"],
   ["Electrical wiring / switches","fittings","MCB / RCCB",18,"nos",0,"DB schedule","high"],
   ["Plumbing","pipe","CPVC 20mm",180,"m",8,"MEP drawing","medium"],
   ["Plumbing","pipe","UPVC 110mm",95,"m",8,"MEP drawing","medium"],
   ["Plumbing","fittings","Fittings (elbows / tees / valves)",262,"nos",8,"MEP drawing","medium"],
   ["Plumbing","fittings","Floor / nahani traps",8,"nos",0,"Schedule","high"],
   ["Washroom / kitchen fitting","fittings","WC",3,"nos",0,"Sanitary schedule","high"],
   ["Washroom / kitchen fitting","fittings","Wash basin",4,"nos",0,"Sanitary schedule","high"],
   ["Washroom / kitchen fitting","fittings","Kitchen sink",1,"nos",0,"Sanitary schedule","high"],
   ["Washroom / kitchen fitting","fittings","Mixers / faucets",10,"nos",0,"Sanitary schedule","high"],
   ["Granite laying","other","Kitchen countertop granite",62,"sqft",12,"Schedule","medium"],
   ["Granite laying","other","Window sill granite",44,"sqft",12,"Schedule","medium"],
   ["Granite laying","other","Staircase tread granite",180,"sqft",15,"Schedule","medium"],
  ];
  const estRound = (n,u) => u==="nos" ? Math.round(n) : Math.round(n*10)/10;
  const EST = ESTR.map((r,i)=>{ const [stage,family,material,base,unit,w,source,confidence]=r;
    return { id:i+1, sort:i+1, stage, family, material, base, unit, wastage:w, total:estRound(base*(1+w/100),unit), source, confidence }; });

  const POUR = {
    id:"SLAB-GF-001", grade:"M25", rmc:"UltraTech RMC, Gandipet", trucks:"3 (TS09 UB 4412, 4418, 4420)",
    batch:"12:40", arrival:"13:00", start:"13:05", end:"15:50", slump:"110 mm — pass",
    cubes:"2 sets (6 cubes)", vol:"14.2 m³", weather:"34°C, dry", labor:"22", curing:"Not started",
    approval:"Pending", reminders:[
      ["crit","Curing not confirmed for Slab GF-1"],
      ["warn","Cube test result due 20 Jun (7-day)"],
      ["warn","Shuttering removal due tomorrow"],
    ],
  };

  const MATERIALS = [
    { name:"Cement (OPC 53)", unit:"bags", stock:22, days:2, rate:"3/day", status:"crit", po:"On order" },
    { name:"Steel (Fe500D)", unit:"T", stock:3.2, days:9, rate:"0.35/day", status:"warn", po:"Short 300kg" },
    { name:"River sand", unit:"cft", stock:0, days:0, rate:"—", status:"crit", po:"Delivery pending" },
    { name:"20mm aggregate", unit:"cft", stock:640, days:14, rate:"45/day", status:"ok", po:"OK" },
    { name:"AAC blocks", unit:"nos", stock:1850, days:11, rate:"170/day", status:"ok", po:"OK" },
    { name:"Waterproof compound", unit:"kg", stock:90, days:7, rate:"13/day", status:"ok", po:"OK" },
  ];

  const MAT_FLOW = ["Ordered","Delivered","Gate entry","Invoice","Verified","Stored","Issued","Balance"];

  const MAT_ALERTS = [
    { tone:"crit", t:"Cement will finish in ~2 days", d:"3 bags/day consumption vs 22 in stock. Next pour needs 30+.", meta:["Material agent","Confidence 0.93"], act:"Raise PO" },
    { tone:"warn", t:"Steel received less than PO", d:"3.2 T delivered against 3.5 T ordered — 300 kg short. Gate photo + invoice mismatch.", meta:["Gate entry 2:05 PM"], act:"Flag vendor" },
    { tone:"warn", t:"Consumption above estimate — cement", d:"Actual 1.18× BOQ for GF columns. Possible wastage or over-design.", meta:["7-day trend"], act:"Review" },
  ];

  const LABOR_TEAMS = [
    ["Mason", 14],["Helper / mazdoor", 12],["Bar bender", 6],["Electrical", 5],["Plumbing", 4],["Waterproofing", 3],["Carpenter / shuttering", 2],
  ];

  const SCORECARDS = [
    { name:"Sri Sai Constructions", trade:"Civil / Mason", score:78, m:[["Delay rate","12%"],["Rework","5 items"],["Quality","82%"],["Safety","2 issues"]] },
    { name:"Venkat Electricals", trade:"Electrical", score:91, m:[["Delay rate","3%"],["Rework","1 item"],["Quality","94%"],["Safety","0 issues"]] },
    { name:"AquaSeal Waterproofing", trade:"Waterproofing", score:64, m:[["Delay rate","18%"],["Rework","7 items"],["Quality","71%"],["Safety","1 issue"]] },
    { name:"Reddy Plumbing", trade:"Plumbing", score:85, m:[["Delay rate","6%"],["Rework","2 items"],["Quality","88%"],["Safety","0 issues"]] },
  ];

  const DRAW_MISMATCH = [
    { t:"Wall built 120mm off drawing position", d:"Bedroom 1 partition vs Arch A-04", sev:"crit" },
    { t:"Door opening width mismatch", d:"Master bath — 750mm built vs 800mm spec", sev:"warn" },
    { t:"Plumbing sleeve missing in slab", d:"Bathroom B-2 — sleeve not cast before pour", sev:"crit" },
    { t:"Window sill height deviation", d:"Living — 600mm vs 750mm on elevation", sev:"warn" },
  ];

  const DRAW_SETS = [
    ["Architectural", "A-01 … A-12", "ok"],["Structural", "S-01 … S-08", "ok"],
    ["Electrical", "E-01 … E-05", "warn"],["Plumbing", "P-01 … P-04", "ok"],
  ];

  const ISSUES = [
    { id:"ISS-118", t:"Surface not cleaned before waterproofing", loc:"Bathroom B-2", sev:"crit", who:"AquaSeal", status:"Open", age:"2h", resp:"AquaSeal Waterproofing", drawing:"P-03" },
    { id:"ISS-117", t:"Wall alignment off by 22mm", loc:"Bedroom 1", sev:"warn", who:"Sri Sai", status:"Open", age:"5h", resp:"Sri Sai Constructions", drawing:"A-04" },
    { id:"ISS-116", t:"Raft curing log empty 2 days", loc:"Basement raft", sev:"crit", who:"Site team", status:"Open", age:"1d", resp:"Eng. Ramesh", drawing:"S-02" },
    { id:"ISS-115", t:"Debris on first floor slab", loc:"First floor", sev:"low", who:"Helpers", status:"Open", age:"6h", resp:"Sri Sai Constructions", drawing:"—" },
    { id:"ISS-114", t:"Steel short by 300kg vs PO", loc:"Material yard", sev:"warn", who:"Procurement", status:"In review", age:"4h", resp:"Procurement", drawing:"—" },
    { id:"ISS-110", t:"Honeycombing on column C5", loc:"GF Column C5", sev:"warn", who:"Sri Sai", status:"Closed", age:"2d", resp:"Sri Sai Constructions", drawing:"S-05" },
  ];

  const PAYMENTS = [
    { contractor:"Sri Sai Constructions", milestone:"GF blockwork", claim:"100% complete",
      checks:[["Work photos","ok"],["Location QR","ok"],["Supervisor approval","ok"],["Quality checklist","warn"]],
      release:"70%", held:"30%", amount:"₹2,40,000", note:"30% held until 2 quality issues closed." },
    { contractor:"Venkat Electricals", milestone:"GF conduiting", claim:"60% complete",
      checks:[["Work photos","ok"],["Location QR","ok"],["Supervisor approval","ok"],["Quality checklist","ok"]],
      release:"60%", held:"0%", amount:"₹1,05,000", note:"All checks passed. Eligible for full milestone release." },
    { contractor:"AquaSeal Waterproofing", milestone:"Bathroom B-2 wet area", claim:"40% complete",
      checks:[["Work photos","ok"],["Location QR","ok"],["Supervisor approval","warn"],["Quality checklist","crit"]],
      release:"0%", held:"100%", amount:"₹0", note:"Blocked — surface prep defect open. No release." },
  ];

  const AGENTS = [
    { icon:"vision", name:"Site Vision", job:"People · PPE · machinery · safety", live:true, last:"Counted 46 workers across 4 zones · flagged 1 no-helmet at gate." },
    { icon:"quality", name:"Quality", job:"Checklists · photos · defects", live:true, last:"Verified 18 photos · 4 defect candidates queued for review." },
    { icon:"progress", name:"Progress", job:"Planned vs actual", live:true, last:"GF blockwork at 65% — 2 days behind baseline." },
    { icon:"materials", name:"Material", job:"Stock · usage · shortage", live:true, last:"Cement → 2 days left. Raised purchase suggestion." },
    { icon:"labor", name:"Labour", job:"Headcount · labour-hours", live:true, last:"Peak 48 at 12:30 · est. 312 labour-hours today." },
    { icon:"drawings", name:"Drawing", job:"Site-vs-design mismatch", live:false, last:"4 mismatches pending review. Idle — awaiting new captures." },
    { icon:"reports", name:"Report", job:"Daily / weekly summaries", live:true, last:"Daily report compiled and dispatched at 6:42 PM." },
    { icon:"alerts", name:"Alert", job:"Prioritise what matters", live:true, last:"Surfaced 3 critical, 4 medium · suppressed 11 low-noise." },
    { icon:"voice", name:"Voice", job:"Voice notes → structured", live:false, last:"Last note parsed 6:05 PM — 1 material request created." },
    { icon:"decision", name:"Decision", job:"Suggests next actions", live:true, last:"Recommends approving 50 cement bags before Saturday." },
  ];

  const ALERTS = {
    crit:[
      ["Basement raft curing missed 2 days","Honeycombing & strength risk. Curing log empty since 11 Jun.","Quality agent"],
      ["Plumbing sleeve missing before pour","Bathroom B-2 slab cast without sleeve — breakout needed.","Drawing agent"],
      ["Cement shortage in 2 days","Next pour blocked without restock.","Material agent"],
    ],
    warn:[
      ["GF blockwork 2 days behind","Mason team below planned strength.","Progress agent"],
      ["Steel short 300kg vs PO","Delivery / invoice mismatch.","Material agent"],
      ["Gate-2 camera offline 41m","Blind spot at secondary entry.","Site Vision"],
      ["Waterproofing checklist incomplete","Photo proof missing for 4 stages.","Quality agent"],
    ],
    low:[
      ["Daily report ready","Compiled at 6:42 PM.","Report agent"],
      ["Visitor pending checkout","Client representative since 5:10 PM.","Site Vision"],
      ["Rain risk tomorrow","Plan curing & cover accordingly.","Decision agent"],
    ],
  };

  /* ---------------------------------------------------------- NAV CONFIG */
  const NAV = [
    { id:"command", label:"Command Center", icon:"command", roles:["builder","client"] },
    { id:"live", label:"Live Site", icon:"live", roles:["builder"] },
    { id:"walk", label:"360° Walk", icon:"walk", roles:["builder","client"] },
    { id:"drone", label:"Drone View", icon:"drone", roles:["builder","client"] },
    { id:"progress", label:"Progress", icon:"progress", roles:["builder","client"] },
    { id:"quality", label:"Quality", icon:"quality", roles:["builder"] },
    { id:"materials", label:"Materials", icon:"materials", roles:["builder"] },
    { id:"estimate", label:"Estimate", icon:"estimate", roles:["builder"] },
    { id:"labor", label:"Labour", icon:"labor", roles:["builder"] },
    { id:"drawings", label:"Drawings", icon:"drawings", roles:["builder"] },
    { id:"issues", label:"Issues", icon:"issues", count:"5", alert:true, roles:["builder"] },
    { id:"payments", label:"Payments", icon:"payments", roles:["builder","client"] },
    { id:"gallery", label:"Approved Photos", icon:"gallery", roles:["client"] },
    { id:"reports", label:"Reports", icon:"reports", roles:["builder","client"] },
    { id:"alerts", label:"AI Alerts", icon:"alerts", count:"3", alert:true, roles:["builder"] },
  ];

  /* ---------------------------------------------------------- STATE */
  const state = { view:"command", role:"builder", problemsOnly:false, qualityTab:"process", tl:5, zone:"gf", walkScene:0, walkDate:5, walkCompare:false, walkDateA:1, walkDateB:5,
    droneScene:0, droneDate:5, droneCompare:false, droneDateA:1, droneDateB:5, qcStage:null };
  let walkRaf = null, walkYaw = 0;

  /* ---------------------------------------------------------- HELPERS */
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  // HTML-escape any backend/user-supplied value before concatenating into innerHTML.
  // App-authored markup (e.g. KPI vals carrying <span class="unit">) is NOT passed through this.
  const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  // Transient, non-blocking notice — additive UI that only appears when a persistence call fails.
  function notify(msg, tone){
    let host = $("#cpmToasts");
    if(!host){ host = document.createElement("div"); host.id = "cpmToasts"; host.className = "cpm-toasts"; document.body.appendChild(host); }
    const el = document.createElement("div");
    el.className = "cpm-toast cpm-toast--" + (tone || "warn");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => { el.classList.add("is-out"); setTimeout(() => el.remove(), 300); }, 4000);
  }
  const toneClass = t => ({crit:"pill--crit",warn:"pill--warn",ok:"pill--ok",accent:"pill--neutral",neutral:"pill--ghost",low:"pill--neutral"}[t] || "pill--neutral");
  const toneColor = t => ({crit:"var(--crit)",warn:"var(--warn)",ok:"var(--ok)",accent:"var(--accent)",low:"var(--ink-3)",neutral:"var(--ink-3)"}[t] || "var(--ink-3)");

  function gauge(v){
    const r=80, c=2*Math.PI*r, off=c*(1-v/100);
    return '<svg viewBox="0 0 184 184" style="width:184px;height:184px;transform:rotate(-90deg)">'+
      '<circle cx="92" cy="92" r="'+r+'" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="9"/>'+
      '<circle cx="92" cy="92" r="'+r+'" fill="none" stroke="var(--accent-2)" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/>'+
      '</svg>';
  }

  function ring(v, color){
    const r=22, c=2*Math.PI*r, off=c*(1-v/100);
    return '<svg viewBox="0 0 52 52" width="52" height="52" style="transform:rotate(-90deg)">'+
      '<circle cx="26" cy="26" r="'+r+'" fill="none" stroke="var(--paper-4)" stroke-width="5"/>'+
      '<circle cx="26" cy="26" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/>'+
      '</svg>';
  }

  function progressChart(){
    const planned=[0,8,22,40,58,74,88,100], actual=[0,7,20,35,52,66,78,null];
    const labels=["W1","W2","W3","W4","W5","W6","W7","W8"];
    const W=680,H=230,pad=34;
    const n=planned.length;
    const X=i=>pad+(W-pad-14)*(i/(n-1));
    const Y=v=>H-pad-(H-pad-16)*(v/100);
    const line=(arr)=>arr.map((v,i)=>v==null?null:(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).filter(Boolean).join(" ");
    const aPts=actual.filter(v=>v!=null);
    const area="M"+X(0)+" "+Y(0)+" "+actual.map((v,i)=>v==null?"":"L"+X(i).toFixed(1)+" "+Y(v).toFixed(1)+" ").join("")+"L"+X(aPts.length-1)+" "+Y(0)+" Z";
    let grid="";
    [0,25,50,75,100].forEach(g=>{ const y=Y(g); grid+='<line x1="'+pad+'" y1="'+y.toFixed(1)+'" x2="'+(W-14)+'" y2="'+y.toFixed(1)+'" stroke="var(--hair)" stroke-width="1"/><text x="'+(pad-8)+'" y="'+(y+3).toFixed(1)+'" text-anchor="end" font-family="var(--f-mono)" font-size="9" fill="var(--ink-3)">'+g+'</text>'; });
    let xl=""; labels.forEach((l,i)=>{ xl+='<text x="'+X(i).toFixed(1)+'" y="'+(H-12)+'" text-anchor="middle" font-family="var(--f-mono)" font-size="9" fill="var(--ink-3)">'+l+'</text>'; });
    const dots=actual.map((v,i)=>v==null?"":'<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="3" fill="var(--accent)"/>').join("");
    return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto">'+
      grid+xl+
      '<path d="'+area+'" fill="var(--accent-wash)"/>'+
      '<path d="'+line(planned)+'" fill="none" stroke="var(--ink-3)" stroke-width="1.4" stroke-dasharray="4 4"/>'+
      '<path d="'+line(actual)+'" fill="none" stroke="var(--accent)" stroke-width="2"/>'+
      dots+'</svg>';
  }

  const camFeed = (c, idx) => {
    if(c.off) return '<div class="cam cam--off"><div class="cam__feed"></div>'+
      '<div class="cam__offline"><b>Signal lost</b><span class="mono-label">Offline · 41 min</span></div>'+
      '<div class="cam__bottom"><span class="cam__zone">'+c.zone+'</span></div></div>';
    const boxes=(c.bbox||[]).map(b=>'<span class="cam__bbox" style="left:'+b[0]+'%;top:'+b[1]+'%;width:'+b[2]+'%;height:'+b[3]+'%"><span>person</span></span>').join("");
    return '<div class="cam"><div class="cam__feed"></div><div class="cam__scan"></div>'+
      '<div class="cam__top"><span class="cam__live"><span class="dot"></span>LIVE</span><span class="cam__time">'+c.time+'</span></div>'+
      boxes+
      '<div class="cam__bottom"><span class="cam__zone">'+c.zone+'</span><span class="cam__people">'+c.people+' detected</span></div></div>';
  };

  /* ---------------------------------------------------------- VIEWS */
  const VIEWS = {};

  // ---- Command Center (builder)
  VIEWS.command = () => {
    if(state.role==="client") return clientOverview();
    if(state.problemsOnly) return commandProblems();
    const kpis = KPIS.map((k,i)=>
      '<div class="kpi kpi--click" data-kpi="'+i+'" role="button" tabindex="0">'+
        '<span class="kpi__more">Details ›</span>'+
        '<span class="kpi__label">'+k.label+'</span>'+
        '<span class="kpi__val">'+k.val+'</span>'+
        '<span class="kpi__foot"><span class="pill '+toneClass(k.tone)+'"><span class="dot"></span></span>'+k.foot+'</span>'+
        (k.bar!=null?'<div class="kpi__bar"><i style="width:'+(k.bar*100)+'%"></i></div>':"")+
      '</div>').join("");
    return ''+
    pageHead("Command Center","Good evening, Murali. Here is what your site needs from you today.","13 June 2026 · Day 14")+
    '<div class="cc-hero">'+
      '<div class="health">'+
        '<span class="health__cap">Site Health Index</span>'+
        '<div class="health__gauge">'+gauge(PROJECT.health)+
          '<div class="health__score"><span class="health__num">'+PROJECT.health+'</span><span class="health__den">OUT OF 100</span></div>'+
        '</div>'+
        '<div class="health__delta"><b>▲ '+PROJECT.healthDelta+'</b> vs yesterday · weighted by quality, schedule & safety</div>'+
      '</div>'+
      '<div>'+
        '<div class="row-between" style="margin-bottom:12px">'+
          '<span class="eyebrow">What needs your attention</span>'+
          '<span class="mono-label">'+ATTENTION.length+' decisions</span>'+
        '</div>'+
        '<div class="attention">'+
          ATTENTION.map(a=>
            '<div class="attn-row">'+
              '<span class="attn-row__mark" style="background:'+toneColor(a.tone)+'"></span>'+
              '<div class="attn-row__body">'+
                '<div class="attn-row__t">'+a.t+'</div>'+
                '<div class="attn-row__d">'+a.d+'</div>'+
              '</div>'+
              '<div class="attn-row__actions">'+
                a.actions.map(pair=>'<button class="minibtn '+(pair[1]==="accent"?"minibtn--accent":"")+'">'+pair[0]+'</button>').join("")+
              '</div>'+
            '</div>').join("")+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="grid g-4" style="margin-bottom:22px">'+kpis+'</div>'+

    '<div class="grid g-2">'+
      '<div class="card">'+
        '<div class="card__head"><span class="card__title">Daily AI summary</span><span class="card__hint">Auto-generated · 6:42 PM</span></div>'+
        '<div class="summary">'+
          '<h4>Progress</h4>'+
          '<ul><li><b>GF slab</b> pour completed — 14.2 m³ M25.</li><li><b>Blockwork</b> 65% · plumbing rough-in started B-2.</li><li><b>Electrical</b> conduiting delayed — team understaffed.</li></ul>'+
          '<h4>Quality</h4>'+
          '<ul><li>3 new issues · <b>1 critical</b> — waterproofing surface not cleaned.</li><li>Raft curing log empty 2 days — flagged.</li></ul>'+
          '<h4>Materials</h4>'+
          '<ul><li>Cement low — <b>2 days</b> cover. Steel short 300 kg vs PO.</li><li>Sand delivery pending.</li></ul>'+
          '<h4>Tomorrow</h4>'+
          '<ul><li>Approve cement purchase · confirm curing · review waterproofing.</li></ul>'+
        '</div>'+
      '</div>'+
      '<div class="card">'+
        '<div class="card__head"><span class="card__title">What changed today</span><button class="minibtn" data-act="changed">Open feed</button></div>'+
        '<div class="feed">'+
          FEED.map(f=>'<div class="feed__row"><span class="feed__time">'+f.t+'</span><span class="feed__dot"></span><span class="feed__txt">'+f.txt+'</span></div>').join("")+
        '</div>'+
      '</div>'+
    '</div>';
  };

  function commandProblems(){
    const probs=[].concat(
      ATTENTION.map(a=>({tone:a.tone,t:a.t,d:a.d,src:"Decision"})),
      ALERTS.crit.map(a=>({tone:"crit",t:a[0],d:a[1],src:a[2]})),
      ALERTS.warn.map(a=>({tone:"warn",t:a[0],d:a[1],src:a[2]})));
    return pageHead("Problems only","Filtered to delays, quality failures, shortages, safety and approvals. Everything healthy is hidden.","13 June 2026")+
    '<div class="stack-12">'+
      probs.map(p=>'<div class="alert"><span class="alert__mark" style="background:'+toneColor(p.tone)+'"></span>'+
        '<div class="alert__body"><div class="alert__t">'+p.t+'</div><div class="alert__d">'+p.d+'</div>'+
        '<div class="alert__meta"><span>'+p.src+' agent</span><span class="pill '+toneClass(p.tone)+'"><span class="dot"></span>'+(p.tone==="crit"?"Critical":"Medium")+'</span></div></div>'+
        '<div class="alert__act"><button class="minibtn minibtn--accent">Resolve</button></div></div>').join("")+
    '</div>';
  }

  // ---- Live Site
  VIEWS.live = () => {
    const zones = ZONES.map(z=>
      '<div class="zone '+(z.id===state.zone?"is-active":"")+'" data-zone="'+z.id+'" style="left:'+z.x+'%;top:'+z.y+'%;width:'+z.w+'%;height:'+z.h+'%">'+
        '<span class="zone__name">'+z.name+'</span>'+
        '<span class="zone__count">'+z.count+'<span class="lbl">ON SITE</span></span>'+
      '</div>').join("");
    return pageHead("Live Site","Thirteen cameras with on-device people detection. Click a zone to focus the feed.","12 of 13 online")+
    '<div class="grid g-2" style="grid-template-columns:1.5fr 1fr;align-items:start">'+
      '<div><div class="cam-grid">'+CAMERAS.map(camFeed).join("")+'</div></div>'+
      '<div class="card card--flush" style="padding:18px">'+
        '<div class="card__head" style="margin-bottom:14px"><span class="card__title">Site map · live zones</span><span class="pill pill--ok"><span class="dot"></span>42 on site</span></div>'+
        '<div class="siteplan">'+zones+'</div>'+
        '<div style="margin-top:16px" class="stack-12">'+
          '<div class="row-between"><span class="mono-label">Active task in zone</span><span style="font-size:12.5px;font-weight:600">GF blockwork · bedroom 1–2</span></div>'+
          '<div class="row-between"><span class="mono-label">Subcontractor</span><span style="font-size:12.5px;font-weight:600">Sri Sai Constructions</span></div>'+
          '<div class="row-between"><span class="mono-label">Open issues here</span><span class="pill pill--warn"><span class="dot"></span>2 medium</span></div>'+
        '</div>'+
      '</div>'+
    '</div>';
  };

  // ---- Progress + timeline
  VIEWS.progress = () => {
    const day = TIMELINE[state.tl];
    return pageHead("Progress","Work-package completion and a scrubable visual record of the build — your <em>site timeline</em>.","Day 14 of 210")+
    '<div class="grid g-2" style="grid-template-columns:1.35fr 1fr;align-items:start;margin-bottom:22px">'+
      '<div class="card">'+
        '<div class="card__head"><span class="card__title">Planned vs actual</span><span class="card__hint"><span style="color:var(--accent)">━</span> Actual &nbsp; <span style="color:var(--ink-3)">┄</span> Planned</span></div>'+
        progressChart()+
      '</div>'+
      '<div class="card">'+
        '<div class="card__head"><span class="card__title">Phase mix</span><span class="card__hint">9 work packages</span></div>'+
        '<div class="stack-12" style="gap:8px">'+
          [["Complete",3,"ok"],["In progress",3,"accent"],["Delayed / risk",2,"warn"],["Not started",1,"neutral"]].map(row=>
            '<div class="hbar-row"><span class="hbar-row__lbl">'+row[0]+'</span><div class="hbar"><i style="width:'+(row[1]/9*100)+'%;background:'+toneColor(row[2])+'"></i></div><span class="hbar-row__n">'+row[1]+'</span></div>').join("")+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="card" style="margin-bottom:22px">'+
      '<div class="card__head"><span class="card__title">Work packages</span><span class="card__hint">Tap a package to open its checklist</span></div>'+
      WORKPKGS.map(w=>
        '<div class="wp-row">'+
          '<div class="wp-row__name">'+w.name+'<small>'+w.code+'</small></div>'+
          '<div class="wp-row__bar"><div class="bar '+(w.status==="ok"?"bar--ok":w.status==="warn"?"bar--warn":"")+'"><i style="width:'+w.pct+'%"></i></div></div>'+
          '<div class="wp-row__pct">'+w.pct+'%</div>'+
          '<div class="wp-row__status"><span class="pill '+toneClass(w.status)+'"><span class="dot"></span>'+w.lbl+'</span></div>'+
        '</div>').join("")+
    '</div>'+

    '<div class="card card--flush">'+
      '<div class="scrubber">'+
        '<div class="card__head"><span class="card__title">Site timeline</span><span class="card__hint">Drag to travel through the build · camera, drone & 360° per day</span></div>'+
        '<div class="scrub-track" id="scrubTrack">'+
          '<div class="scrub-line"><div class="scrub-line__fill" style="width:'+(state.tl/(TIMELINE.length-1)*100)+'%"></div></div>'+
          TIMELINE.map((d,i)=>'<div class="scrub-tick '+(i<=state.tl?"done":"")+' '+(i===state.tl?"is-active":"")+'" style="left:'+(i/(TIMELINE.length-1)*100)+'%"><span class="scrub-tick__lbl">'+d.date+'</span></div>').join("")+
        '</div>'+
        '<input type="range" class="scrub-input" id="scrub" min="0" max="'+(TIMELINE.length-1)+'" value="'+state.tl+'" />'+
      '</div>'+
      '<div style="padding:0 24px 24px" id="dayCard">'+dayCard(day)+'</div>'+
    '</div>';
  };
  function dayCard(day){
    return '<div class="daycard">'+
      '<div class="dayview"><div class="dayview__img"></div><span class="dayview__tag">360° · DRONE · CCTV</span><span class="dayview__date">'+day.date+'</span></div>'+
      '<div class="daystat">'+
        '<div class="daystat__cell"><div class="daystat__lbl">Work completed</div><div class="daystat__val" style="font-size:17px;line-height:1.3">'+day.tag+'</div><div class="daystat__note">'+day.work+'</div></div>'+
        '<div class="daystat__cell"><div class="daystat__lbl">Labour count</div><div class="daystat__val">'+day.labor+'</div><div class="daystat__note">peak on site</div></div>'+
        '<div class="daystat__cell"><div class="daystat__lbl">Material used</div><div class="daystat__val" style="font-size:18px">'+day.mat+'</div><div class="daystat__note">key consumption</div></div>'+
        '<div class="daystat__cell"><div class="daystat__lbl">Quality issues</div><div class="daystat__val">'+day.issues+'</div><div class="daystat__note">'+(day.issues===0?"clean day":"logged")+'</div></div>'+
      '</div>'+
    '</div>';
  }

  // ---- Quality (sub-tabs)
  VIEWS.quality = () => {
    const tabs=[["process","Process QC"],["checklists","Stage checklists"],["qr","QR locations"],["proof","Photo proof"],["defects","AI defects"],["pour","Concrete pour"]];
    const body={
      process: () => state.qcStage ? inspectionView(state.qcStage) : stageBoard(),
      checklists: ()=>
        '<div class="grid g-2" style="grid-template-columns:1.4fr 1fr;align-items:start">'+
          '<div class="card"><div class="card__head"><span class="card__title">Column concreting — GF C5</span><span class="pill pill--warn"><span class="dot"></span>2 pending</span></div>'+
            '<div class="chk">'+CHECKLIST.map(g=>'<div class="chk__group">'+g.group+'</div>'+g.items.map(it=>chkItem(it)).join("")).join("")+'</div>'+
          '</div>'+
          '<div class="card"><div class="card__head"><span class="card__title">Stage gates</span></div>'+
            '<div class="stack-12">'+
              [["Before pour","done","8/8 except 2 awaiting"],["During pour","done","5/5 recorded"],["After pour","todo","0/4 — start curing"]].map(row=>
                '<div class="row-between" style="padding:11px 0;border-bottom:1px solid var(--hair)"><div><div style="font-weight:600;font-size:13px">'+row[0]+'</div><div class="muted" style="font-size:11.5px;margin-top:2px">'+row[2]+'</div></div><span class="pill '+(row[1]==="done"?"pill--ok":"pill--warn")+'"><span class="dot"></span>'+(row[1]==="done"?"Cleared":"Open")+'</span></div>').join("")+
            '</div>'+
            '<div class="alert" style="margin-top:16px"><span class="alert__mark" style="background:var(--warn)"></span><div class="alert__body"><div class="alert__t">Slump test pending</div><div class="alert__d">Required on RMC arrival before pour sign-off.</div></div></div>'+
          '</div>'+
        '</div>',
      qr: ()=>
        '<div class="card" style="margin-bottom:18px;display:flex;gap:16px;align-items:center">'+
          '<div class="qrcode" style="width:60px;height:60px">'+qrSvg()+'</div>'+
          '<div><div style="font-weight:600;font-size:14px">Scan a location QR to open the right checklist</div><div class="muted" style="font-size:12.5px;margin-top:3px">Each report is bound to location · timestamp · user · photo · GPS — no fake updates.</div></div>'+
          '<button class="solidbtn" style="margin-left:auto" data-qr="QR-B2">Simulate scan · B-2</button>'+
        '</div>'+
        '<div class="qr-grid">'+QRLOCS.map(q=>
          '<div class="qrcard" data-qr="'+q.id+'">'+
            '<div class="qrcard__top"><div class="qrcode">'+qrSvg()+'</div><span class="qrcard__id">'+q.id+'</span></div>'+
            '<div class="qrcard__name">'+q.name+'</div>'+
            '<div class="qrcard__foot"><span class="mono-label">'+q.type+'</span>'+(q.pending?'<span class="pill pill--warn"><span class="dot"></span>'+q.pending+'</span>':'<span class="pill pill--ok"><span class="dot"></span>OK</span>')+'</div>'+
          '</div>').join("")+'</div>',
      proof: ()=>
        '<div class="card"><div class="card__head"><span class="card__title">Waterproofing — Bathroom B-2</span><span class="card__hint">Before · during · after, every stage</span></div>'+
          '<div class="proof-set">'+PROOF.map(p=>photoTile(p)).join("")+'</div>'+
          '<div class="alert" style="margin-top:18px"><span class="alert__mark" style="background:var(--warn)"></span><div class="alert__body"><div class="alert__t">AI photo check — reuse suspected</div><div class="alert__d">"Surface cleaning" photo matches an image from 09 Jun (different location). Re-capture required before approval.</div><div class="alert__meta"><span>Quality agent</span><span>Confidence 0.86</span></div></div><div class="alert__act"><button class="minibtn minibtn--accent">Request re-capture</button></div></div>'+
        '</div>',
      defects: ()=>
        '<div class="card"><div class="card__head"><span class="card__title">AI-assisted defect detection</span><span class="card__hint">Suggestions, not verdicts — every item routes to a human</span></div>'+
          DEFECTS.map((d,i)=>
            '<div class="defect">'+
              '<div class="defect__thumb"><i style="left:'+d.box[0]+'%;top:'+d.box[1]+'%;width:'+d.box[2]+'%;height:'+d.box[3]+'%"></i></div>'+
              '<div class="defect__body"><div class="defect__t">'+d.t+'</div><div class="defect__d">'+d.d+'</div></div>'+
              '<div class="conf"><div class="conf__bar"><i style="width:'+d.conf+'%;background:'+(d.conf>80?"var(--crit)":"var(--warn)")+'"></i></div><span class="conf__num">'+d.conf+'%</span></div>'+
              '<button class="minibtn" data-defect="'+i+'">Review</button>'+
            '</div>').join("")+
        '</div>',
      pour: ()=>pourView(),
    };
    return pageHead("Quality","Quality is checked stage by stage, not at the end. Each step is bound to proof.","5 open issues")+
      '<div class="subtabs">'+tabs.map(pair=>'<button class="subtab '+(state.qualityTab===pair[0]?"is-active":"")+'" data-subtab="quality" data-tab="'+pair[0]+'">'+pair[1]+'</button>').join("")+'</div>'+
      (body[state.qualityTab]||body.checklists)();
  };
  function chkItem(it){
    const label=it[0], st=it[1], meta=it[2];
    const box = st==="done"?'<span class="chk__box done">'+I.check+'</span>':st==="pending"?'<span class="chk__box pending"></span>':'<span class="chk__box"></span>';
    return '<div class="chk__item '+(st==="done"?"is-done":"")+'">'+box+'<span class="chk__label">'+label+'</span><span class="chk__meta">'+meta+'</span></div>';
  }
  function qcStars(rating, cls){
    return '<span class="qc-stars '+(cls||"")+'">'+[1,2,3,4,5].map(n=>'<span class="'+(rating&&n<=rating?"on":"")+'"'+(cls==="qc-stars--input"?' data-qc-star="'+n+'"':"")+'>★</span>').join("")+'</span>';
  }
  function qcRow(q){
    const tone = QC_STATUS_TONE[q.status] || "neutral";
    const fb = q.feedback ? q.feedback : '<span class="muted">No check recorded yet — tap Review to inspect & give feedback.</span>';
    return '<div class="qc-row" data-qc="'+q.id+'">'+
      '<span class="qc-row__dot" style="background:'+toneColor(tone)+'"></span>'+
      '<div class="qc-row__body"><div class="qc-row__name">'+q.name+(q.checked_at?' <small>'+q.checked_at+(q.inspector?' · '+q.inspector:"")+'</small>':"")+'</div><div class="qc-row__fb">'+fb+'</div></div>'+
      (q.rating?qcStars(q.rating):"")+
      '<span class="pill '+toneClass(tone)+'"><span class="dot"></span>'+q.status+'</span>'+
      '<button class="minibtn">Review</button>'+
    '</div>';
  }

  /* ---- Stage-gate quality system ---- */
  // a stage is locked until every earlier HOLD-POINT gate is approved/closed
  function qcLocked(stage){
    const blocker = QSTAGES.filter(s=>s.sort<stage.sort && s.is_hold_point && QC_APPROVED.indexOf(s.status)===-1)[0];
    return blocker ? blocker.name : null;
  }
  function qcScore(stageId){
    const items = QITEMS.filter(x=>x.stage_id===stageId);
    const appl = items.filter(x=>x.status!=="na");
    if(!appl.length) return 0;
    const pass = appl.filter(x=>x.status==="pass").length;
    const fail = appl.filter(x=>x.status==="fail").length;
    return Math.max(0, Math.round((pass - fail*0.5) / appl.length * 100));
  }
  function stageBoard(){
    const cleared = QSTAGES.filter(s=>QC_APPROVED.indexOf(s.status)!==-1).length;
    const review = QSTAGES.filter(s=>["Inspection Pending","Ready for Inspection","Rework Required","Rework Completed","Rejected"].indexOf(s.status)!==-1).length;
    const started = QSTAGES.filter(s=>s.status!=="Not Started");
    const health = started.length ? Math.round(started.reduce((a,s)=>a+(s.score||0),0)/started.length) : 0;
    const summary='<div class="card" style="margin-bottom:18px"><div class="card__head"><span class="card__title">Stage-gate quality</span><span class="card__hint">'+cleared+' approved · '+review+' in review · gate health '+health+'/100</span></div>'+
      '<div class="bar bar--ok" style="margin-bottom:6px"><i style="width:'+(cleared/QSTAGES.length*100)+'%"></i></div>'+
      '<div class="muted" style="font-size:11.5px">Each gate has before / during / after inspections, evidence, drawing & code refs and an approval. <b style="color:var(--accent)">Hold-point</b> gates lock the next stage until approved.</div></div>';
    const order=["Substructure","Superstructure","MEP rough-in","Finishing","MEP final","Fit-out"];
    const cards=order.filter(ph=>QSTAGES.some(s=>s.phase===ph)).map(ph=>{
      const rows=QSTAGES.filter(s=>s.phase===ph).map(s=>{
        const locked=qcLocked(s), tone=QSTATUS_TONE[s.status]||"neutral";
        return '<div class="qg-row'+(locked?" is-locked":"")+'"'+(locked?"":' data-stage="'+s.id+'"')+'>'+
          '<span class="qg-dot" style="background:'+toneColor(tone)+'"></span>'+
          '<div class="qg-body"><div class="qg-name">'+s.name+(s.is_hold_point?'<span class="qg-hold">HOLD POINT</span>':"")+'</div>'+
            '<div class="qg-sub">'+(locked?('<span style="color:var(--warn)">🔒 Locked — awaiting '+locked+' approval</span>'):(s.phase+(s.score?' · score '+s.score:"")))+'</div></div>'+
          '<span class="pill '+toneClass(tone)+'"><span class="dot"></span>'+s.status+'</span>'+
          (locked?'<span class="qg-locktag">Locked</span>':'<button class="minibtn">Inspect →</button>')+
        '</div>';
      }).join("");
      return '<div class="card" style="margin-bottom:16px"><div class="card__head"><span class="card__title" style="font-size:17px">'+ph+'</span></div>'+rows+'</div>';
    }).join("");
    return summary+cards;
  }
  function qcItemRow(x){
    const tone=QITEM_TONE[x.status]||"warn";
    const meta=[]; if(x.severity) meta.push('<span class="qi-sev qi-sev--'+x.severity+'">'+x.severity+'</span>');
    if(x.target) meta.push('<span class="qi-tag">'+x.target+(x.unit?" "+x.unit:"")+'</span>'); else if(x.unit) meta.push('<span class="qi-tag">'+x.unit+'</span>');
    if(x.photo) meta.push('<span class="qi-tag qi-tag--photo">photo</span>');
    if(x.type==="test") meta.push('<span class="qi-tag">test</span>');
    const opts=["pass","fail","na"];
    return '<div class="qi-row">'+
      '<span class="qi-dot" style="background:'+toneColor(tone)+'"></span>'+
      '<div class="qi-body"><div class="qi-name">'+x.name+'</div><div class="qi-meta">'+meta.join("")+'</div></div>'+
      (x.type==="measure"?'<input class="qc-meas" data-qc-meas="'+x.id+'" value="'+(x.value||"")+'" placeholder="'+(x.target||"value")+'">':"")+
      '<div class="qi-opts">'+opts.map(o=>'<button class="qi-opt qi-opt--'+o+(x.status===o?" is-sel":"")+'" data-qc-item="'+x.id+'" data-st="'+o+'">'+(o==="na"?"N/A":o[0].toUpperCase()+o.slice(1))+'</button>').join("")+'</div>'+
    '</div>';
  }
  function inspectionView(stageId){
    const s=QSTAGES.filter(x=>x.id===stageId)[0]; if(!s) return stageBoard();
    const locked=qcLocked(s), tone=QSTATUS_TONE[s.status]||"neutral", score=qcScore(stageId)||s.score||0;
    const items=QITEMS.filter(x=>x.stage_id===stageId);
    const groups=["Before work","During work","After work","General"].filter(g=>items.some(x=>x.grp===g));
    const ref=(k,v)=> v?'<div class="kv__row"><span class="kv__k">'+k+'</span><span class="kv__v">'+v+'</span></div>':"";
    const refs='<div class="kv" style="margin:0 0 16px">'+ref("Drawing",s.drawing_ref)+ref("Material / lot",s.material_ref)+ref("Code",s.code_ref)+ref("Approval",s.approval_role)+(s.approved_by?ref("Reviewed",s.approved_by+(s.approved_at?" · "+s.approved_at:"")):"")+'</div>';
    const groupCards=groups.map(g=>{
      const gi=items.filter(x=>x.grp===g);
      const done=gi.filter(x=>x.status!=="pending").length;
      return '<div class="card" style="margin-bottom:14px"><div class="card__head"><span class="card__title" style="font-size:15px">'+g+'</span><span class="card__hint">'+done+'/'+gi.length+' checked</span></div>'+gi.map(qcItemRow).join("")+'</div>';
    }).join("");
    if(!items.length && groupCards==="") { /* offline: no items */ }
    const evidence='<div class="card" style="margin-bottom:14px"><div class="card__head"><span class="card__title" style="font-size:15px">Evidence</span><span class="card__hint">photo / video / test reports</span></div>'+
      '<div class="proof-set">'+["Before","During","After","Test report"].map(l=>'<div class="photo"><div class="photo__img"></div><span class="photo__stage">'+l+'</span><div class="photo__empty">+ ADD</div></div>').join("")+'</div></div>';
    const actions='<div class="qc-actionbar">'+
      [["Submit for inspection","Inspection Pending",""],["Request rework","Rework Required","crit"],["Approve w/ observation","Approved with Observation","warn"],["Approve & unlock","Approved","ok"],["Close","Closed","ok"]]
        .map(a=>'<button class="qc-act '+(a[2]?"qc-act--"+a[2]:"")+'" data-act="qc-status" data-stage="'+s.id+'" data-status="'+a[1]+'">'+a[0]+'</button>').join("")+'</div>';
    return '<button class="qc-back" data-act="qc-back">‹ All stage gates</button>'+
      '<div class="qc-insp-head"><div><div class="eyebrow">'+s.phase+(s.is_hold_point?' · HOLD POINT':"")+'</div><h2 class="qc-insp-title">'+s.name+'</h2></div>'+
        '<div class="qc-insp-meta"><span class="qc-scorebig">'+score+'<small>/100</small></span><span class="pill '+toneClass(tone)+'"><span class="dot"></span>'+s.status+'</span></div></div>'+
      (locked?'<div class="alert" style="margin-bottom:14px"><span class="alert__mark" style="background:var(--warn)"></span><div class="alert__body"><div class="alert__t">Gate locked</div><div class="alert__d">This stage cannot start until <b>'+locked+'</b> is approved. Inspection is read-only until then.</div></div></div>':"")+
      (s.is_hold_point&&s.hold_rule?'<div class="qc-holdbanner">⛔ Hold point — '+s.hold_rule+'</div>':"")+
      (s.observation?'<div class="alert" style="margin-bottom:14px"><span class="alert__mark" style="background:var(--warn)"></span><div class="alert__body"><div class="alert__t">Observation</div><div class="alert__d">'+s.observation+'</div></div></div>':"")+
      refs+
      (items.length?groupCards:'<div class="card" style="margin-bottom:14px"><div class="muted" style="font-size:13px">Inspection items load from the backend — connect to view & check items.</div></div>')+
      evidence+
      actions;
  }
  function photoTile(p){
    if(p.state==="empty") return '<div class="photo"><div class="photo__img"></div><span class="photo__stage">'+p.stage+'</span><div class="photo__empty">AWAITING UPLOAD</div></div>';
    return '<div class="photo"><div class="photo__img '+(p.clean?"photo__img--clean":"")+'"></div><span class="photo__stage">'+p.stage+'</span>'+
      '<div class="photo__flag"><span class="dot" style="background:'+toneColor(p.tone)+'"></span>'+p.note+'</div></div>';
  }
  function pourView(){
    const cells=[["Pour ID",POUR.id],["Grade",POUR.grade],["Volume",POUR.vol],["RMC supplier",POUR.rmc],
      ["Trucks",POUR.trucks],["Batch / arrival",POUR.batch+" / "+POUR.arrival],["Pour start / end",POUR.start+" – "+POUR.end],
      ["Slump test",POUR.slump],["Cube samples",POUR.cubes],["Labour",POUR.labor],["Weather",POUR.weather],["Engineer approval",POUR.approval]];
    return '<div class="grid g-2" style="grid-template-columns:1.5fr 1fr;align-items:start">'+
      '<div class="card"><div class="card__head"><span class="card__title">Pour record · '+POUR.id+'</span><span class="pill pill--warn"><span class="dot"></span>Curing pending</span></div>'+
        '<div class="pour-grid">'+cells.map(c=>'<div class="pour-cell"><div class="pour-cell__lbl">'+c[0]+'</div><div class="pour-cell__val">'+c[1]+'</div></div>').join("")+'</div>'+
      '</div>'+
      '<div class="card"><div class="card__head"><span class="card__title">AI reminders</span></div>'+
        '<div class="stack-12">'+POUR.reminders.map(r=>'<div class="alert"><span class="alert__mark" style="background:'+toneColor(r[0])+'"></span><div class="alert__body"><div class="alert__t" style="font-size:12.5px">'+r[1]+'</div></div></div>').join("")+'</div>'+
        '<button class="solidbtn" style="width:100%;margin-top:16px;justify-content:center">Confirm curing started</button>'+
      '</div>'+
    '</div>';
  }

  // ---- Materials
  VIEWS.materials = () => {
    return pageHead("Materials","Track every material from PO to balance, and catch shortage, shortfall and wastage before they cost you.","2 critical alerts")+
    '<div class="card card--flush" style="margin-bottom:22px">'+
      '<table class="tbl"><thead><tr><th>Material</th><th>In stock</th><th>Cover</th><th>Burn rate</th><th>PO status</th><th class="t-r">State</th></tr></thead>'+
        '<tbody>'+MATERIALS.map(m=>'<tr>'+
          '<td class="strong">'+m.name+'</td>'+
          '<td class="num">'+m.stock+' '+m.unit+'</td>'+
          '<td class="num">'+(m.days?m.days+" days":"—")+'</td>'+
          '<td class="num">'+m.rate+'</td>'+
          '<td>'+m.po+'</td>'+
          '<td class="t-r"><span class="pill '+toneClass(m.status)+'"><span class="dot"></span>'+(m.status==="crit"?"Critical":m.status==="warn"?"Watch":"OK")+'</span></td>'+
        '</tr>').join("")+'</tbody></table>'+
    '</div>'+

    '<div class="card" style="margin-bottom:22px"><div class="card__head"><span class="card__title">Material flow — cement</span><span class="card__hint">PO → balance, with proof at the gate</span></div>'+
      '<div class="flow">'+MAT_FLOW.map((s,i)=>{const cls=i<6?"done":i===6?"current":"";return '<div class="flow__step '+cls+'"><div class="flow__node">'+(i<6?"✓":i+1)+'</div><div class="flow__lbl">'+s+'</div></div>'+(i<MAT_FLOW.length-1?'<div class="flow__link '+(i<6?"done":"")+'"></div>':"");}).join("")+'</div>'+
    '</div>'+

    '<div class="card__head"><span class="card__title" style="font-size:18px">Material intelligence</span></div>'+
    '<div class="stack-12">'+MAT_ALERTS.map(a=>alertRow(a)).join("")+'</div>';
  };
  function alertRow(a){
    return '<div class="alert"><span class="alert__mark" style="background:'+toneColor(a.tone)+'"></span>'+
      '<div class="alert__body"><div class="alert__t">'+a.t+'</div><div class="alert__d">'+a.d+'</div>'+
      '<div class="alert__meta">'+(a.meta||[]).map(m=>'<span>'+m+'</span>').join("")+'</div></div>'+
      '<div class="alert__act"><button class="minibtn minibtn--accent">'+a.act+'</button></div></div>';
  }

  // ---- Estimate (stage-wise material take-off / BOQ)
  const estNum = n => n>=1000 ? Math.round(n).toLocaleString("en-IN") : (Math.round(n*10)/10).toString();
  const estSum = pred => EST.filter(pred).reduce((a,x)=>a+(+x.total||0),0);
  const estStageStatus = name => { const s=QSTAGES.filter(q=>q.name===name)[0]; return s?s.status:null; };

  VIEWS.estimate = () => {
    const rollups = [
      ["Concrete","m³", estSum(x=>x.family==="concrete")],
      ["Steel","t", estSum(x=>x.family==="steel")/1000],
      ["Cement","bags", estSum(x=>x.family==="cement")],
      ["AAC blocks","nos", estSum(x=>x.family==="blocks")],
      ["Tiles","sqft", estSum(x=>x.family==="tiles")],
      ["Paint + primer","L", estSum(x=>x.family==="paint" && x.unit==="L")],
    ];
    const pipe = ["2D / 3D BIM model","Extract elements","Quantity take-off","Map to stage","Recipe + wastage","Stage BOQ"];
    const stageNames = QSTAGES.map(q=>q.name).filter(n=>EST.some(x=>x.stage===n));
    return pageHead("Material Estimate","Stage-wise quantity take-off — how much of each material every stage needs, with wastage and a confidence flag, ready to turn into purchase orders.","Quantity take-off · BOQ")+

    '<div class="est-src">'+
      '<span class="est-src__dot"></span>'+
      '<div class="est-src__body"><div class="est-src__t">Computed from project drawings &amp; material recipes</div>'+
        '<div class="est-src__d">No BIM model is connected yet — connect an IFC / Revit model to read geometry from the model itself instead of the drawings.</div></div>'+
      '<button class="solidbtn est-src__btn" data-est-connect>Connect BIM model</button>'+
    '</div>'+

    '<div class="card" style="margin-bottom:22px"><div class="card__head"><span class="card__title">How the estimate is built</span><span class="card__hint">Geometry → recipe → wastage → procurement-ready BOQ</span></div>'+
      '<div class="flow flow--est">'+pipe.map((s,i)=>'<div class="flow__step done"><div class="flow__node">'+(i+1)+'</div><div class="flow__lbl">'+s+'</div></div>'+(i<pipe.length-1?'<div class="flow__link done"></div>':"")).join("")+'</div>'+
    '</div>'+

    '<div class="card__head"><span class="card__title" style="font-size:18px">Whole-project requirement</span><span class="card__hint">Base + wastage, all stages</span></div>'+
    '<div class="est-roll">'+rollups.map(r=>
      '<div class="kpi"><span class="kpi__label">'+r[0]+'</span><span class="kpi__val">'+estNum(r[2])+' <small>'+r[1]+'</small></span><span class="kpi__foot">incl. wastage</span></div>').join("")+'</div>'+

    '<div class="card__head" style="margin-top:26px"><span class="card__title" style="font-size:18px">By stage</span><span class="card__hint">'+stageNames.length+' stages · '+EST.length+' line items</span></div>'+
    stageNames.map(estStageCard).join("");
  };

  function estStageCard(stageName){
    const rows = EST.filter(x=>x.stage===stageName).sort((a,b)=>a.sort-b.sort);
    const status = estStageStatus(stageName);
    const tone = status ? (QSTATUS_TONE[status]||"neutral") : "neutral";
    const approved = status && QC_APPROVED.indexOf(status)!==-1;
    const gate = status ? '<span class="pill '+toneClass(tone)+'"><span class="dot"></span>'+status+'</span>' : "";
    const note = status ? (approved
        ? '<span class="est-gatehint est-gatehint--ok">Gate approved — cleared to issue materials</span>'
        : '<span class="est-gatehint est-gatehint--hold">Gate not approved — stage &amp; verify before issuing to site</span>') : "";
    return '<div class="card est-stage">'+
      '<div class="est-stage__head"><span class="est-stage__name">'+stageName+'</span>'+gate+'</div>'+
      (note?'<div class="est-stage__note">'+note+'</div>':"")+
      '<table class="tbl est-tbl"><thead><tr><th>Material</th><th class="t-r">Base</th><th class="t-r">Wastage</th><th class="t-r">Total</th><th>Source</th><th class="t-r">Confidence</th></tr></thead><tbody>'+
        rows.map(x=>{ const fam=EST_FAM[x.family]||EST_FAM.other, ct=CONF_TONE[x.confidence]||"neutral";
          return '<tr>'+
            '<td class="strong"><span class="est-fam" style="background:'+fam[1]+'"></span>'+x.material+'</td>'+
            '<td class="num">'+estNum(x.base)+' '+x.unit+'</td>'+
            '<td class="num">'+(x.wastage?'+'+x.wastage+'%':'—')+'</td>'+
            '<td class="num strong">'+estNum(x.total)+' '+x.unit+'</td>'+
            '<td><span class="mono-label">'+x.source+'</span></td>'+
            '<td class="t-r"><span class="pill '+toneClass(ct)+'"><span class="dot"></span>'+x.confidence+'</span></td>'+
          '</tr>'; }).join("")+
      '</tbody></table>'+
    '</div>';
  }

  function estBimDrawer(){
    openDrawer(
      '<div class="drawer__head"><div><div class="drawer__eyebrow">Estimate · Data source</div><div class="drawer__title">Connect a BIM model</div></div><button class="drawer__close" data-act="close">×</button></div>'+
      '<div class="drawer__body">'+
        '<p class="muted" style="font-size:13px;line-height:1.6;margin:0 0 16px">Today these quantities come from project drawings and standard material recipes. Connecting a model replaces the geometry source with the model itself, so volumes, areas and counts are read directly.</p>'+
        '<div class="est-bim-steps">'+[
          ["IFC / Revit / DWG","Upload architectural, structural &amp; MEP models. IFC is the open ISO-16739 format and carries quantity sets."],
          ["Parse geometry","A server-side parser (IfcOpenShell, or Autodesk APS for Revit) extracts walls, slabs, columns, doors, pipes, conduits — with length, area, volume and count."],
          ["Map to stages","Element type maps to a stage: IfcSlab → Slab, IfcWall → Brick work, IfcColumn → Columns, IfcPipeSegment → Plumbing…"],
          ["Recipe + wastage","Geometry × material recipe × wastage → the same stage BOQ shown here, but model-accurate. Steel still needs the BBS."],
        ].map(s=>'<div class="est-bim-step"><div class="est-bim-step__t">'+s[0]+'</div><div class="est-bim-step__d">'+s[1]+'</div></div>').join("")+'</div>'+
        '<div class="alert" style="margin-top:18px"><span class="alert__mark" style="background:var(--warn)"></span><div class="alert__body"><div class="alert__t">Not wired in this build</div><div class="alert__d">Model upload + parsing needs a server-side service. The estimate table (cpm_estimate) already matches the parser output, so it plugs straight in.</div></div></div>'+
      '</div>'
    );
  }

  // ---- Labour
  VIEWS.labor = () => {
    const max=Math.max.apply(null,LABOR_TEAMS.map(t=>t[1]));
    return pageHead("Labour","Headcount by team and zone from camera vision, and a standing scorecard for every subcontractor.","Peak 48 today")+
    '<div class="grid g-2" style="grid-template-columns:1fr 1fr;align-items:start;margin-bottom:24px">'+
      '<div class="card"><div class="card__head"><span class="card__title">By team — today</span><span class="card__hint">Avg 39 · peak 48</span></div>'+
        LABOR_TEAMS.map(t=>'<div class="hbar-row"><span class="hbar-row__lbl">'+t[0]+'</span><div class="hbar"><i style="width:'+(t[1]/max*100)+'%"></i></div><span class="hbar-row__n">'+t[1]+'</span></div>').join("")+
      '</div>'+
      '<div class="grid g-2" style="align-content:start">'+
        [["Peak count","48","at 12:30"],["Average","39","08:00–18:00"],["Labour-hours","312","estimated"],["vs Plan","-6","below target"]].map(k=>
          '<div class="kpi"><span class="kpi__label">'+k[0]+'</span><span class="kpi__val">'+k[1]+'</span><span class="kpi__foot">'+k[2]+'</span></div>').join("")+
      '</div>'+
    '</div>'+
    '<div class="card__head"><span class="card__title" style="font-size:18px">Subcontractor scorecards</span><span class="card__hint">Whom to rehire · whom to watch</span></div>'+
    '<div class="score-grid">'+SCORECARDS.map(scoreCard).join("")+'</div>';
  };
  function scoreCard(s){
    const col = s.score>=85?"var(--ok)":s.score>=72?"var(--warn)":"var(--crit)";
    return '<div class="scorecard"><div class="scorecard__head">'+
      '<div><div class="scorecard__name">'+s.name+'</div><div class="scorecard__trade">'+s.trade+'</div></div>'+
      '<div style="display:flex;align-items:center;gap:10px"><div class="scorecard__score" style="color:'+col+'">'+s.score+'<small>/100</small></div>'+ring(s.score,col)+'</div></div>'+
      '<div class="scorecard__metrics">'+s.m.map(m=>'<div class="smetric"><span class="smetric__l">'+m[0]+'</span><span class="smetric__v">'+m[1]+'</span></div>').join("")+'</div>'+
    '</div>';
  }

  // ---- Drawings
  VIEWS.drawings = () => {
    return pageHead("Drawings","Compare site reality against the drawing and surface mismatches early — before they're buried in concrete.","4 mismatches")+
    '<div class="grid g-2" style="grid-template-columns:1.4fr 1fr;align-items:start">'+
      '<div>'+
        '<div class="cmp">'+
          '<div class="cmp__pane"><span class="cmp__tag">Drawing · A-04</span><div class="cmp__draw"></div>'+
            '<svg viewBox="0 0 100 75" style="position:absolute;inset:0;width:100%;height:100%"><rect x="18" y="14" width="64" height="46" fill="none" stroke="var(--ink-3)" stroke-width="0.8"/><line x1="50" y1="14" x2="50" y2="60" stroke="var(--ink-3)" stroke-width="0.8"/><rect x="42" y="56" width="9" height="4" fill="none" stroke="var(--accent)" stroke-width="0.8"/></svg>'+
          '</div>'+
          '<div class="cmp__pane"><span class="cmp__tag">Site · today</span><div class="cmp__site"></div><div class="cmp__mismatch" style="left:46%;top:18%;width:14%;height:60%"></div></div>'+
        '</div>'+
        '<div class="muted" style="font-size:12px;text-align:center">Overlay shows the partition built ~120mm off the drawn line.</div>'+
      '</div>'+
      '<div class="card"><div class="card__head"><span class="card__title">Detected mismatches</span></div>'+
        '<div class="stack-12">'+DRAW_MISMATCH.map(m=>'<div class="alert"><span class="alert__mark" style="background:'+toneColor(m.sev)+'"></span><div class="alert__body"><div class="alert__t" style="font-size:13px">'+m.t+'</div><div class="alert__d">'+m.d+'</div></div></div>').join("")+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="card mt-24"><div class="card__head"><span class="card__title">Drawing sets</span><span class="card__hint">Architectural · structural · MEP</span></div>'+
      '<div class="grid g-4">'+DRAW_SETS.map(d=>'<div class="kpi"><span class="kpi__label">'+d[0]+'</span><span class="kpi__val" style="font-size:16px;font-family:var(--f-mono);font-weight:600">'+d[1]+'</span><span class="kpi__foot"><span class="pill '+(d[2]==="ok"?"pill--ok":"pill--warn")+'"><span class="dot"></span>'+(d[2]==="ok"?"Current":"Update due")+'</span></span></div>').join("")+'</div>'+
    '</div>';
  };

  // ---- Issues
  VIEWS.issues = () => {
    return pageHead("Issues","Every observation is assignable, trackable and closeable — with proof, owner and a way to reach them.","5 open · 1 critical")+
    '<div class="card card--flush">'+
      '<table class="tbl"><thead><tr><th>ID</th><th>Issue</th><th>Location</th><th>Owner</th><th>Age</th><th>Severity</th><th class="t-r">Status</th></tr></thead>'+
      '<tbody>'+ISSUES.map(s=>'<tr class="clickable" data-issue="'+s.id+'">'+
        '<td class="num">'+s.id+'</td><td class="strong">'+esc(s.t)+'</td><td>'+esc(s.loc)+'</td><td>'+esc(s.who)+'</td><td class="num">'+s.age+'</td>'+
        '<td><span class="pill '+toneClass(s.sev)+'"><span class="dot"></span>'+(s.sev==="crit"?"Critical":s.sev==="warn"?"Medium":"Low")+'</span></td>'+
        '<td class="t-r"><span class="pill '+(s.status==="Closed"?"pill--ok":s.status==="In review"?"pill--neutral":"pill--ghost")+'">'+s.status+'</span></td>'+
      '</tr>').join("")+'</tbody></table>'+
    '</div>';
  };

  // ---- Payments
  VIEWS.payments = () => {
    const client = state.role==="client";
    return pageHead(client?"Milestones":"Payments","Payment follows verified progress, not verbal claims. Proof unlocks release.","Proof before payment")+
    '<div class="stack-12" style="gap:18px">'+PAYMENTS.map(p=>payCard(p,client)).join("")+'</div>';
  };
  function payCard(p,client){
    return '<div class="pay-card">'+
      '<div class="pay-card__head"><div class="pay-card__claim">'+p.contractor+'<small>'+p.milestone+' · claim '+p.claim+'</small></div><div class="pay-card__claim t-r" style="text-align:right">'+p.amount+'<small>milestone value</small></div></div>'+
      '<div class="pay-checks">'+p.checks.map(c=>'<div class="pay-check"><div class="pay-check__l">'+(c[1]==="crit"?"✕":c[1]==="warn"?"!":"✓")+' '+c[0]+'</div><div class="pay-check__s" style="color:'+toneColor(c[1]==="crit"?"crit":c[1]==="warn"?"warn":"ok")+'"><span class="statusdot '+(c[1]==="ok"?"live":"idle")+'" style="background:'+toneColor(c[1]==="crit"?"crit":c[1]==="warn"?"warn":"ok")+'"></span>'+(c[1]==="ok"?"Passed":c[1]==="warn"?"Pending":"Failed")+'</div></div>').join("")+'</div>'+
      '<div class="pay-card__foot"><div class="pay-card__release">Eligible: <b>'+p.release+'</b> &nbsp;·&nbsp; <span class="pay-card__held">held <b>'+p.held+'</b></span> &nbsp;—&nbsp; <span class="muted">'+p.note+'</span></div>'+(client?"":'<button class="solidbtn" '+(p.release==="0%"?'disabled style="opacity:.4;cursor:not-allowed"':"")+'>'+(p.release==="0%"?"Blocked":"Release "+p.release)+'</button>')+'</div>'+
    '</div>';
  }

  // ---- Reports + voice
  VIEWS.reports = () => {
    return pageHead("Reports","An automatic daily summary, and a way for supervisors to report by voice instead of forms.","Auto-generated 6:42 PM")+
    '<div class="grid g-2" style="grid-template-columns:1fr 1fr;align-items:start;margin-bottom:8px">'+
      '<div class="report">'+
        '<div class="report__date">Daily Site Summary · 13 June 2026</div>'+
        '<div class="report__title">Sky Villa, Kokapet</div>'+
        '<div class="report__rule"></div>'+
        '<h4>Progress</h4><ul><li><b>GF blockwork</b> 65% complete</li><li><b>Plumbing rough-in</b> started in bathroom 2</li><li><b>Electrical conduits</b> delayed</li></ul>'+
        '<h4>Labour</h4><ul><li>Peak <b>48</b> · average <b>39</b></li><li>Mason 14 · electrical 5 · plumbing 4</li></ul>'+
        '<h4>Quality</h4><ul><li><b>3 new issues</b> · 1 critical: waterproofing surface not cleaned</li><li>2 medium: wall alignment, debris</li></ul>'+
        '<h4>Materials</h4><ul><li>Cement low · steel sufficient · sand pending</li></ul>'+
        '<h4>Tomorrow</h4><ul><li>Approve cement · check waterproofing · confirm electrician</li></ul>'+
        '<div style="margin-top:22px;display:flex;gap:10px"><button class="ghostbtn">Download PDF</button><button class="ghostbtn">Weekly report</button><button class="solidbtn">Share with stakeholders</button></div>'+
      '</div>'+
      '<div>'+
        '<div class="row-between" style="margin-bottom:12px"><span class="eyebrow">Voice → structured report</span><span class="mono-label">Voice agent</span></div>'+
        '<div class="voice" style="grid-template-columns:1fr">'+
          '<div class="voicenote">'+
            '<div class="voicenote__head"><div class="voicenote__play">'+I.play+'</div><div><div class="voicenote__who">Ramesh · Site Supervisor</div><div class="voicenote__when">6:05 PM · 0:34 · Telugu + English</div></div></div>'+
            '<div class="waveform">'+Array.from({length:38},(_,i)=>'<i style="height:'+(20+Math.round(28*Math.abs(Math.sin(i*0.9))))+'%"></i>').join("")+'</div>'+
            '<div class="voicenote__quote">"Today we finished blockwork in bedroom 1 and 2. Plumbing team started bathroom lines. Cement stock is low, need 50 bags tomorrow."</div>'+
          '</div>'+
          '<div class="card parsed mt-18">'+
            '<h4>Work completed</h4><div style="font-size:13px;color:var(--ink-2);margin-bottom:12px">Bedroom 1 blockwork · Bedroom 2 blockwork</div>'+
            '<h4>Work started</h4><div style="font-size:13px;color:var(--ink-2);margin-bottom:12px">Bathroom 2 plumbing lines</div>'+
            '<h4>Material request</h4><div style="font-size:13px;color:var(--ink-2);margin-bottom:12px">Cement — 50 bags for tomorrow <span class="pill pill--warn" style="margin-left:6px"><span class="dot"></span>PO raised</span></div>'+
            '<h4>Issues</h4><div style="font-size:13px;color:var(--ink-2)">Cement stock low → linked to material alert</div>'+
            '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap"><span class="pill pill--neutral">Daily report ✓</span><span class="pill pill--neutral">Material request ✓</span><span class="pill pill--neutral">Task update ✓</span></div>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>';
  };

  // ---- AI Alerts + agents
  VIEWS.alerts = () => {
    const col=(title,tone,arr)=>'<div><div class="alert-col__head"><span class="statusdot live" style="background:'+toneColor(tone)+'"></span><h3 style="color:'+toneColor(tone)+'">'+title+'</h3><span class="count">'+arr.length+'</span></div>'+
      '<div class="stack-12">'+arr.map(a=>'<div class="alert"><span class="alert__mark" style="background:'+toneColor(tone)+'"></span><div class="alert__body"><div class="alert__t" style="font-size:13px">'+a[0]+'</div><div class="alert__d">'+a[1]+'</div><div class="alert__meta"><span>'+a[2]+'</span></div></div></div>').join("")+'</div></div>';
    return pageHead("AI Alerts","A backend of specialist agents watches the site so you don't get a hundred notifications — only what needs you.","3 critical · 4 medium · 3 low")+
    '<div class="alert-cols" style="margin-bottom:28px">'+
      col("Critical","crit",ALERTS.crit)+
      col("Medium","warn",ALERTS.warn)+
      col("Low","low",ALERTS.low)+
    '</div>'+
    '<div class="card__head"><span class="card__title" style="font-size:18px">Agent fleet</span><span class="card__hint">Each agent does one job</span></div>'+
    '<div class="agent-grid">'+AGENTS.map(a=>
      '<div class="agentcard"><div class="agentcard__icon">'+(I[a.icon]||I.command)+'</div>'+
        '<div class="agentcard__body"><div class="agentcard__name">'+a.name+'<span class="statusdot '+(a.live?"live":"idle")+'"></span><span class="mono-label" style="color:'+(a.live?"var(--ok)":"var(--ink-3)")+'">'+(a.live?"Active":"Idle")+'</span></div>'+
          '<div class="agentcard__job">'+a.job+'</div><div class="agentcard__last">'+a.last+'</div></div></div>').join("")+'</div>';
  };

  // ---- Client gallery (approved photos)
  VIEWS.gallery = () => {
    const shots=[["Raft pour — complete","08 Jun","clean"],["GF columns cast","12 Jun",""],["GF slab pour","13 Jun","clean"],["Blockwork — bedroom 1","13 Jun",""],["Plumbing rough-in","13 Jun","clean"],["Site overview","13 Jun",""]];
    return pageHead("Approved photos","A curated, approved record of your home as it rises. Updated as milestones complete.","Client view")+
    '<div class="cam-grid">'+shots.map(s=>'<div class="cam" style="aspect-ratio:4/3"><div class="cam__feed"></div><div class="cam__bottom"><span class="cam__zone">'+s[0]+'</span><span class="cam__people">'+s[1]+'</span></div></div>').join("")+'</div>';
  };

  function clientOverview(){
    return pageHead("Your home, in progress","A clear, calm view of your project — milestones, approved photos and what's coming next.","Sky Villa · 39% complete")+
    '<div class="grid g-4" style="margin-bottom:22px">'+
      [["Overall progress","39%","On schedule","ok"],["Current stage","GF blockwork","65% done","accent"],["Next milestone","First floor slab","est. 02 Jul","neutral"],["Quality","A","no open client issues","ok"]].map(k=>
        '<div class="kpi"><span class="kpi__label">'+k[0]+'</span><span class="kpi__val" style="font-size:'+(k[1].length>4?"22px":"34px")+'">'+k[1]+'</span><span class="kpi__foot"><span class="pill '+toneClass(k[3])+'"><span class="dot"></span></span>'+k[2]+'</span></div>').join("")+
    '</div>'+
    '<div class="grid g-2" style="align-items:start">'+
      '<div class="card"><div class="card__head"><span class="card__title">Milestone timeline</span></div>'+
        '<div class="stack-12">'+[["Foundation & basement","Complete","ok"],["Ground floor structure","Complete","ok"],["Ground floor walls & MEP","In progress","accent"],["First floor","Upcoming","neutral"],["Finishing & handover","Upcoming","neutral"]].map(m=>
          '<div class="row-between" style="padding:11px 0;border-bottom:1px solid var(--hair)"><span style="font-weight:600;font-size:13px">'+m[0]+'</span><span class="pill '+toneClass(m[2])+'"><span class="dot"></span>'+m[1]+'</span></div>').join("")+'</div>'+
      '</div>'+
      '<div class="card"><div class="card__head"><span class="card__title">Latest from site</span><button class="minibtn" data-act="goto-gallery">View all photos</button></div>'+
        '<div class="proof-set" style="grid-template-columns:1fr 1fr">'+[["GF slab","13 Jun"],["Blockwork","13 Jun"]].map(s=>'<div class="photo"><div class="photo__img"></div><span class="photo__stage">'+s[0]+' · '+s[1]+'</span></div>').join("")+'</div>'+
        '<div class="alert" style="margin-top:16px"><span class="alert__mark" style="background:var(--accent)"></span><div class="alert__body"><div class="alert__t" style="font-size:13px">A decision needs you</div><div class="alert__d">Bathroom tile selection due by 20 Jun to keep finishing on schedule.</div></div></div>'+
      '</div>'+
    '</div>';
  }

  // ---- 360° Walkthrough
  VIEWS.walk = () => {
    const n = WALK_SCENES.length;
    const sc = WALK_SCENES[state.walkScene] || WALK_SCENES[0];
    const date = TIMELINE[state.walkDate] || TIMELINE[TIMELINE.length-1];
    const media = { type:"image", src: captureFor(sc, state.walkDate) };
    const rail = WALK_SCENES.map((s,i)=>
      '<button class="walk-thumb '+(i===state.walkScene?"is-active":"")+'" data-walk-scene="'+i+'">'+
        '<div class="walk-thumb__img" data-floor="'+s.floor+'" style="background-image:url('+captureFor(s,state.walkDate).replace("/3840px-","/480px-")+');background-size:cover;background-position:center"><span class="walk-thumb__tag">360°</span>'+(s.flag?'<span class="walk-thumb__dot" style="background:'+toneColor(s.flag)+'"></span>':"")+'</div>'+
        '<div class="walk-thumb__meta"><div class="walk-thumb__name">'+s.name+'</div><div class="walk-thumb__floor">'+s.floor+'</div></div>'+
      '</button>').join("");
    const dates = TIMELINE.map((d,i)=>'<button class="walk-date '+(i===state.walkDate?"is-active":"")+'" data-walk-date="'+i+'">'+d.date+'</button>').join("");
    const mm = WALK_SCENES.map((s,i)=>'<span class="walk-map__dot '+(i===state.walkScene?"is-here":"")+'" style="left:'+s.mx+'%;top:'+s.my+'%" title="'+s.name+'"></span>').join("");

    let panoInner, ctrl, badge, sideCTA;
    if(media){
      const asset = media.type==="video"
        ? '<video id="walkmedia" autoplay loop muted playsinline crossorigin="anonymous" src="'+media.src+'"></video>'
        : '<img id="walkmedia" crossorigin="anonymous" src="'+media.src+'">';
      const sphere = media.type==="video"
        ? '<a-videosphere src="#walkmedia" rotation="0 -90 0"></a-videosphere>'
        : '<a-sky src="#walkmedia" rotation="0 -90 0"></a-sky>';
      panoInner =
        '<div class="pano__bg" data-floor="'+sc.floor+'"></div><div class="pano__bays"></div><div class="pano__floor"></div><div class="pano__vignette"></div>'+
        '<a-scene class="walk-aframe" embedded vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false" loading-screen="enabled: false" renderer="antialias: true; colorManagement: true">'+
          '<a-assets>'+asset+'</a-assets>'+sphere+
          '<a-entity camera look-controls="magicWindowTrackingEnabled: false" wasd-controls="enabled: false" position="0 0 0"></a-entity>'+
        '</a-scene>';
      ctrl = '<div class="walk-ctrl"><button id="walkPrev" data-walk-scene="'+((state.walkScene+n-1)%n)+'" title="Previous space">‹</button><button id="walkNext" data-walk-scene="'+((state.walkScene+1)%n)+'" title="Next space">›</button><button id="walkFs" title="Fullscreen">'+I.expand+'</button></div>';
      badge = media.type==="video" ? "360° VIDEO" : "360° SITE CAPTURE";
      sideCTA = '<button class="solidbtn" id="walkCTA" style="justify-content:center" data-walk-scene="'+((state.walkScene+1)%n)+'">Walk to next space →</button>';
    } else {
      const hots = [{to:(state.walkScene+1)%n,x:26,y:50},{to:(state.walkScene+2)%n,x:58,y:56},{to:(state.walkScene+n-1)%n,x:85,y:48}];
      const hotHTML = hots.map(h=>{ const t=WALK_SCENES[h.to];
        return '<button class="pano__hot" data-walk-scene="'+h.to+'" style="left:'+h.x+'%;top:'+h.y+'%"><span class="ring">'+I.warrow+'</span><span class="lbl">'+t.name+'</span></button>'; }).join("");
      panoInner = '<div class="pano__layer" id="walkLayer"><div class="pano__bg" data-floor="'+sc.floor+'"></div><div class="pano__bays"></div><div class="pano__floor"></div><div class="pano__sheen"></div><div class="pano__vignette"></div>'+hotHTML+'</div>';
      ctrl = '<div class="walk-ctrl"><button id="walkLeft" title="Look left">‹</button><button id="walkPlay" title="Auto-tour">▶</button><button id="walkRight" title="Look right">›</button><button id="walkFs" title="Fullscreen">'+I.expand+'</button></div>';
      badge = "360° · TODAY'S CAPTURE";
      sideCTA = '<button class="solidbtn" style="justify-content:center" id="walkTourBtn">Play full tour</button>';
    }

    const compare = state.walkCompare;
    const cmpPane = (side, di) => {
      const SU = side.toUpperCase();
      const dp = TIMELINE.map((dd,i)=>'<button class="walk-date '+(i===di?"is-active":"")+'" data-cmp-date="'+i+'" data-side="'+side+'">'+dd.date+'</button>').join("");
      return '<div class="cmp-pane">'+
          '<canvas class="cmp-canvas" id="cv'+SU+'"></canvas>'+
          '<div class="cmp-pane__top"><span class="cmp-pane__side">'+SU+'</span><span class="cmp-pane__date" id="cmpLabel'+SU+'">'+TIMELINE[di].date+' · '+stageLabel(sc, di)+'</span></div>'+
          '<div class="cmp-pane__dates" data-side="'+side+'">'+dp+'</div>'+
        '</div>';
    };
    const stageBlock = compare
      ? '<div class="walk-stage walk-stage--split is-media" id="walkStage">'+
          cmpPane("a", state.walkDateA)+'<div class="cmp-divider"></div>'+cmpPane("b", state.walkDateB)+
          '<div class="walk-top"><span class="walk-badge"><span class="dot"></span>360° COMPARE · <span id="cmpScene">'+sc.name+'</span></span><span class="walk-cap">drag each pane independently</span></div>'+
          '<div class="walk-cmp-ctrl"><button class="cmp-iconbtn" id="walkFs" title="Fullscreen">'+I.expand+'</button><button class="cmp-exit" data-act="walk-single">Exit compare ✕</button></div>'+
        '</div>'
      : '<div class="walk-stage'+(media?" is-media":"")+'" id="walkStage">'+
          '<div class="pano">'+panoInner+'</div>'+
          '<div class="walk-top"><span class="walk-badge"><span class="dot"></span>'+badge+'</span><span class="walk-cap">'+date.date+' 2026 · 5:30 PM</span></div>'+
          '<div class="walk-compass"><div class="walk-compass__dial"><span class="walk-compass__needle"></span></div><span class="walk-compass__lbl">N · 0°</span></div>'+
          '<div class="walk-hud"><div class="walk-hud__floor">'+sc.floor+'</div><div class="walk-hud__name">'+sc.name+'</div><div class="walk-hud__note">'+sc.note+'</div></div>'+
          '<div class="walk-hint">Drag to look around</div>'+
          ctrl+
        '</div>';
    const selectDay = compare
      ? '<div class="mono-label" style="margin-bottom:9px">Comparing days</div>'+
        '<div class="cmp-summary"><div><span class="cmp-pane__side">A</span> '+TIMELINE[state.walkDateA].date+' · '+stageLabel(sc,state.walkDateA)+'</div><div><span class="cmp-pane__side">B</span> '+TIMELINE[state.walkDateB].date+' · '+stageLabel(sc,state.walkDateB)+'</div></div>'
      : '<div class="mono-label" style="margin-bottom:9px">Select day</div><div class="walk-dates">'+dates+'</div>';
    const bottomBtns = compare
      ? '<button class="solidbtn" style="justify-content:center" data-act="walk-single">Exit compare</button>'
      : sideCTA+'<div style="display:flex;gap:8px"><button class="ghostbtn" style="flex:1;justify-content:center" data-act="walk-compare">Compare dates</button><button class="ghostbtn" style="flex:1;justify-content:center">Share with client</button></div>';

    return pageHead("360° Walkthrough", compare?"Comparing the same space across two days — drag either side and both rotate together.":"Step through today's full-site capture as if you were standing there — real construction-site 360° captures. Drag to look around; switch scenes to walk the site.", compare?("A "+TIMELINE[state.walkDateA].date+"   ·   B "+TIMELINE[state.walkDateB].date):("Captured "+date.date+" · 5:30 PM"))+
    '<div class="walk-grid">'+
      '<div>'+
        stageBlock+
        '<div class="walk-rail">'+rail+'</div>'+
      '</div>'+
      '<div class="card">'+
        '<div class="card__head"><span class="card__title">'+(compare?"Compare":"Daily capture")+'</span><span class="card__hint">'+n+' scenes</span></div>'+
        selectDay+
        '<div class="kv mt-18">'+
          '<div class="kv__row"><span class="kv__k">Captured by</span><span class="kv__v">Ramesh · pole rig</span></div>'+
          '<div class="kv__row"><span class="kv__k">Device</span><span class="kv__v">Insta360 X4</span></div>'+
          '<div class="kv__row"><span class="kv__k">Capture</span><span class="kv__v">360° site capture</span></div>'+
          '<div class="kv__row"><span class="kv__k">This scene</span><span class="kv__v" id="kvScene">'+sc.name+'</span></div>'+
          '<div class="kv__row"><span class="kv__k">Stage on day</span><span class="kv__v" id="kvStage">'+stageLabel(sc,state.walkDate)+'</span></div>'+
          '<div class="kv__row"><span class="kv__k">Linked drawing</span><span class="kv__v">'+sc.draw+'</span></div>'+
        '</div>'+
        '<div class="mono-label" style="margin:4px 0 8px">Floor plan · you are here</div>'+
        '<div class="walk-map"><div class="walk-map__grid"></div>'+mm+'</div>'+
        '<div class="stack-12" style="margin-top:16px">'+
          bottomBtns+
        '</div>'+
      '</div>'+
    '</div>';
  };

  // ---- Drone View (weekly 360° aerial; same date-select + split compare as the walk)
  VIEWS.drone = () => {
    const n = DRONE_SCENES.length;
    const sc = DRONE_SCENES[state.droneScene] || DRONE_SCENES[0];
    const date = TIMELINE[state.droneDate] || TIMELINE[TIMELINE.length-1];
    const compare = state.droneCompare;
    const rail = DRONE_SCENES.map((s,i)=>
      '<button class="walk-thumb '+(i===state.droneScene?"is-active":"")+'" data-drone-scene="'+i+'">'+
        '<div class="walk-thumb__img" style="background-image:url('+droneCapture(s,state.droneDate).replace("/3840px-","/480px-")+');background-size:cover;background-position:center"><span class="walk-thumb__tag">AERIAL</span>'+(s.flag?'<span class="walk-thumb__dot" style="background:'+toneColor(s.flag)+'"></span>':"")+'</div>'+
        '<div class="walk-thumb__meta"><div class="walk-thumb__name">'+s.name+'</div><div class="walk-thumb__floor">vantage</div></div>'+
      '</button>').join("");
    const dates = TIMELINE.map((d,i)=>'<button class="walk-date '+(i===state.droneDate?"is-active":"")+'" data-drone-date="'+i+'">'+d.date+'</button>').join("");
    const mm = DRONE_SCENES.map((s,i)=>'<span class="walk-map__dot '+(i===state.droneScene?"is-here":"")+'" style="left:'+s.mx+'%;top:'+s.my+'%" title="'+s.name+'"></span>').join("");

    const cmpPane = (side, di) => {
      const SU = side.toUpperCase();
      const dp = TIMELINE.map((dd,i)=>'<button class="walk-date '+(i===di?"is-active":"")+'" data-dcmp-date="'+i+'" data-side="'+side+'">'+dd.date+'</button>').join("");
      return '<div class="cmp-pane"><canvas class="cmp-canvas" id="dcv'+SU+'"></canvas>'+
        '<div class="cmp-pane__top"><span class="cmp-pane__side">'+SU+'</span><span class="cmp-pane__date" id="dCmpLabel'+SU+'">'+TIMELINE[di].date+' · '+droneStageLabel(sc, di)+'</span></div>'+
        '<div class="cmp-pane__dates" data-side="'+side+'">'+dp+'</div></div>';
    };
    const stageBlock = compare
      ? '<div class="walk-stage walk-stage--split is-media" id="droneStage">'+
          cmpPane("a", state.droneDateA)+'<div class="cmp-divider"></div>'+cmpPane("b", state.droneDateB)+
          '<div class="walk-top"><span class="walk-badge"><span class="dot"></span>DRONE COMPARE · <span id="dCmpScene">'+sc.name+'</span></span><span class="walk-cap">drag each pane</span></div>'+
          '<div class="walk-cmp-ctrl"><button class="cmp-iconbtn" id="droneFs" title="Fullscreen">'+I.expand+'</button><button class="cmp-exit" data-act="drone-single">Exit compare ✕</button></div>'+
        '</div>'
      : '<div class="walk-stage is-media" id="droneStage">'+
          '<canvas class="cmp-canvas" id="droneCanvas"></canvas>'+
          '<div class="walk-top"><span class="walk-badge"><span class="dot"></span>DRONE · 360° AERIAL</span><span class="walk-cap" id="droneCap">'+date.date+' 2026 · 11:00 AM</span></div>'+
          '<div class="walk-hud"><div class="walk-hud__floor">Aerial vantage</div><div class="walk-hud__name" id="droneName">'+sc.name+'</div><div class="walk-hud__note" id="droneNote">'+sc.note+'</div></div>'+
          '<div class="walk-hint">Drag to look around</div>'+
          '<div class="walk-ctrl"><button id="droneFs" title="Fullscreen">'+I.expand+'</button></div>'+
        '</div>';
    const selectDay = compare
      ? '<div class="mono-label" style="margin-bottom:9px">Comparing weeks</div>'+
        '<div class="cmp-summary"><div><span class="cmp-pane__side">A</span> '+TIMELINE[state.droneDateA].date+' · '+droneStageLabel(sc,state.droneDateA)+'</div><div><span class="cmp-pane__side">B</span> '+TIMELINE[state.droneDateB].date+' · '+droneStageLabel(sc,state.droneDateB)+'</div></div>'
      : '<div class="mono-label" style="margin-bottom:9px">Select week</div><div class="walk-dates">'+dates+'</div>';
    const bottomBtns = compare
      ? '<button class="solidbtn" style="justify-content:center" data-act="drone-single">Exit compare</button>'
      : '<button class="solidbtn" style="justify-content:center" data-act="drone-compare">Compare dates</button><div style="display:flex;gap:8px"><button class="ghostbtn" style="flex:1;justify-content:center">Download still</button><button class="ghostbtn" style="flex:1;justify-content:center">Share with client</button></div>';

    return pageHead("Drone View", compare?"Comparing the same vantage across two weeks — drag each pane on its own.":"Weekly 360° aerial sweep of the whole site. Drag to look around; switch vantage points or rewind the weeks.", compare?("A "+TIMELINE[state.droneDateA].date+"   ·   B "+TIMELINE[state.droneDateB].date):("Flown "+date.date+" · 11:00 AM"))+
    '<div class="walk-grid">'+
      '<div>'+
        stageBlock+
        '<div class="walk-rail">'+rail+'</div>'+
      '</div>'+
      '<div class="card">'+
        '<div class="card__head"><span class="card__title">'+(compare?"Compare":"Drone capture")+'</span><span class="card__hint">'+n+' vantages</span></div>'+
        selectDay+
        '<div class="kv mt-18">'+
          '<div class="kv__row"><span class="kv__k">Flown by</span><span class="kv__v">Site drone · weekly</span></div>'+
          '<div class="kv__row"><span class="kv__k">Drone</span><span class="kv__v">DJI Mavic 3 · 360 rig</span></div>'+
          '<div class="kv__row"><span class="kv__k">Altitude</span><span class="kv__v">60 m AGL</span></div>'+
          '<div class="kv__row"><span class="kv__k">Vantage</span><span class="kv__v" id="dKvScene">'+sc.name+'</span></div>'+
          '<div class="kv__row"><span class="kv__k">Stage on week</span><span class="kv__v" id="dKvStage">'+droneStageLabel(sc,state.droneDate)+'</span></div>'+
        '</div>'+
        '<div class="mono-label" style="margin:4px 0 8px">Site map · vantage</div>'+
        '<div class="walk-map"><div class="walk-map__grid"></div>'+mm+'</div>'+
        '<div class="stack-12" style="margin-top:16px">'+bottomBtns+'</div>'+
      '</div>'+
    '</div>';
  };

  function ensureAframe(){
    if(window.AFRAME || document.getElementById("aframe-lib")) return;
    var s=document.createElement("script");
    s.id="aframe-lib";
    s.src="https://aframe.io/releases/1.7.0/aframe.min.js";
    document.head.appendChild(s);
  }

  // in-place update for scene/day changes — swaps the A-Frame texture without a
  // full re-render, so look-direction continuity AND fullscreen survive the change
  function updateWalk(){
    const sky=$("a-sky");
    if(!sky){ render(); return; }
    const n=WALK_SCENES.length, sc=WALK_SCENES[state.walkScene];
    sky.setAttribute("src", captureFor(sc, state.walkDate));
    const set=(sel,txt)=>{ const el=$(sel); if(el) el.textContent=txt; };
    set(".walk-hud__floor", sc.floor); set(".walk-hud__name", sc.name); set(".walk-hud__note", sc.note);
    set(".walk-cap", TIMELINE[state.walkDate].date+" 2026 · 5:30 PM");
    set(".page-head .mono-label", "Captured "+TIMELINE[state.walkDate].date+" · 5:30 PM");
    set("#kvScene", sc.name); set("#kvStage", stageLabel(sc, state.walkDate));
    $$(".walk-thumb").forEach((el,i)=>{
      el.classList.toggle("is-active", i===state.walkScene);
      const im=el.querySelector(".walk-thumb__img");
      if(im) im.style.backgroundImage="url("+captureFor(WALK_SCENES[i], state.walkDate).replace("/3840px-","/480px-")+")";
    });
    $$(".walk-date").forEach((el,i)=>el.classList.toggle("is-active", i===state.walkDate));
    $$(".walk-map__dot").forEach((el,i)=>el.classList.toggle("is-here", i===state.walkScene));
    const next=(state.walkScene+1)%n, prev=(state.walkScene+n-1)%n;
    const pb=$("#walkPrev"); if(pb) pb.dataset.walkScene=prev;
    const nb=$("#walkNext"); if(nb) nb.dataset.walkScene=next;
    const cta=$("#walkCTA"); if(cta) cta.dataset.walkScene=next;
  }

  // split-screen compare: two independent three.js equirectangular sphere viewers
  // (uses the three.js A-Frame already bundles, so no extra library load).
  // Each pane has its own renderer + render loop + drag — fully independent.
  const cmpViewers = { a: null, b: null };
  function makeSphereViewer(canvas, url){
    const THREE = window.AFRAME.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, 1, 1, 1100);
    const geo = new THREE.SphereGeometry(500, 60, 40); geo.scale(-1, 1, 1);
    const loader = new THREE.TextureLoader(); loader.setCrossOrigin("anonymous");
    const mat = new THREE.MeshBasicMaterial({ map: loader.load(url) });
    scene.add(new THREE.Mesh(geo, mat));
    let lon = 90, lat = 0, raf = 0, disposed = false;
    function resize(){ const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    function frame(){
      if(disposed) return;
      const phi = THREE.MathUtils.degToRad(90 - lat), theta = THREE.MathUtils.degToRad(lon);
      camera.lookAt(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    resize(); frame();
    let down = false, sx = 0, sy = 0, slon = 0, slat = 0;
    canvas.style.cursor = "grab"; canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", e=>{ down=true; sx=e.clientX; sy=e.clientY; slon=lon; slat=lat; canvas.style.cursor="grabbing"; try{canvas.setPointerCapture(e.pointerId);}catch(_){} });
    canvas.addEventListener("pointermove", e=>{ if(!down) return; lon = slon - (e.clientX - sx) * 0.16; lat = Math.max(-85, Math.min(85, slat + (e.clientY - sy) * 0.16)); });
    const up = ()=>{ down=false; canvas.style.cursor="grab"; };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    window.addEventListener("resize", resize);
    return {
      setImage:(u)=>{ const t = loader.load(u); if(mat.map) mat.map.dispose(); mat.map = t; mat.needsUpdate = true; },
      resize: resize,
      destroy:()=>{ disposed = true; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); try{ renderer.dispose(); }catch(_){} }
    };
  }
  function destroyCmpViewers(){ ["a","b"].forEach(k=>{ if(cmpViewers[k]){ cmpViewers[k].destroy(); cmpViewers[k]=null; } }); }
  function initWalkCompare(){
    const wrap = $("#walkStage"); if(!wrap) return;
    if(walkRaf){ cancelAnimationFrame(walkRaf); walkRaf=null; }
    destroyCmpViewers();
    ensureAframe();
    const fsBtn = $("#walkFs");
    if(fsBtn) fsBtn.onclick = ()=>{
      if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); }
      else { (wrap.requestFullscreen||wrap.webkitRequestFullscreen).call(wrap); }
    };
    const sc = WALK_SCENES[state.walkScene] || WALK_SCENES[0];
    let tries = 0;
    (function ready(){
      const cvA = $("#cvA"), cvB = $("#cvB");
      if(window.AFRAME && window.AFRAME.THREE && cvA && cvB){
        cmpViewers.a = makeSphereViewer(cvA, captureFor(sc, state.walkDateA));
        cmpViewers.b = makeSphereViewer(cvB, captureFor(sc, state.walkDateB));
      } else if(tries++ < 250){ requestAnimationFrame(ready); }
    })();
  }
  function updateCompareScene(){
    const sc = WALK_SCENES[state.walkScene] || WALK_SCENES[0];
    if(cmpViewers.a) cmpViewers.a.setImage(captureFor(sc, state.walkDateA));
    if(cmpViewers.b) cmpViewers.b.setImage(captureFor(sc, state.walkDateB));
    const la = $("#cmpLabelA"), lb = $("#cmpLabelB"), sn = $("#cmpScene");
    if(la) la.textContent = TIMELINE[state.walkDateA].date + " · " + stageLabel(sc, state.walkDateA);
    if(lb) lb.textContent = TIMELINE[state.walkDateB].date + " · " + stageLabel(sc, state.walkDateB);
    if(sn) sn.textContent = sc.name;
    $$(".walk-thumb").forEach((el,i)=>el.classList.toggle("is-active", i===state.walkScene));
  }

  // ── Drone view controllers (three.js sphere viewers; single + split compare) ──
  let droneSingle = null;
  function destroyDroneViewers(){ if(droneSingle){ droneSingle.destroy(); droneSingle = null; } }
  function droneFullscreen(stage){ return ()=>{ if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); } else { (stage.requestFullscreen||stage.webkitRequestFullscreen).call(stage); } }; }
  function initDrone(){
    const stage = $("#droneStage"); if(!stage) return;
    destroyDroneViewers();
    ensureAframe();
    const fs = $("#droneFs"); if(fs) fs.onclick = droneFullscreen(stage);
    const sc = DRONE_SCENES[state.droneScene] || DRONE_SCENES[0];
    let tries = 0;
    (function ready(){ const cv = $("#droneCanvas");
      if(window.AFRAME && window.AFRAME.THREE && cv){ droneSingle = makeSphereViewer(cv, droneCapture(sc, state.droneDate)); }
      else if(tries++ < 250){ requestAnimationFrame(ready); } })();
  }
  function initDroneCompare(){
    const stage = $("#droneStage"); if(!stage) return;
    destroyCmpViewers();
    ensureAframe();
    const fs = $("#droneFs"); if(fs) fs.onclick = droneFullscreen(stage);
    const sc = DRONE_SCENES[state.droneScene] || DRONE_SCENES[0];
    let tries = 0;
    (function ready(){ const a = $("#dcvA"), b = $("#dcvB");
      if(window.AFRAME && window.AFRAME.THREE && a && b){ cmpViewers.a = makeSphereViewer(a, droneCapture(sc, state.droneDateA)); cmpViewers.b = makeSphereViewer(b, droneCapture(sc, state.droneDateB)); }
      else if(tries++ < 250){ requestAnimationFrame(ready); } })();
  }
  function updateDrone(){
    const sc = DRONE_SCENES[state.droneScene] || DRONE_SCENES[0];
    if(droneSingle) droneSingle.setImage(droneCapture(sc, state.droneDate));
    const set = (s,t)=>{ const e=$(s); if(e) e.textContent=t; };
    set("#droneName", sc.name); set("#droneNote", sc.note); set("#dKvScene", sc.name); set("#dKvStage", droneStageLabel(sc, state.droneDate));
    set("#droneCap", TIMELINE[state.droneDate].date + " 2026 · 11:00 AM");
    set(".page-head .mono-label", "Flown " + TIMELINE[state.droneDate].date + " · 11:00 AM");
    $$(".walk-dates .walk-date").forEach((el,i)=>el.classList.toggle("is-active", i===state.droneDate));
    $$(".walk-rail .walk-thumb").forEach((el,i)=>el.classList.toggle("is-active", i===state.droneScene));
    $$(".walk-map__dot").forEach((el,i)=>el.classList.toggle("is-here", i===state.droneScene));
  }
  function updateDroneScene(){
    const sc = DRONE_SCENES[state.droneScene] || DRONE_SCENES[0];
    if(cmpViewers.a) cmpViewers.a.setImage(droneCapture(sc, state.droneDateA));
    if(cmpViewers.b) cmpViewers.b.setImage(droneCapture(sc, state.droneDateB));
    const set = (s,t)=>{ const e=$(s); if(e) e.textContent=t; };
    set("#dCmpLabelA", TIMELINE[state.droneDateA].date + " · " + droneStageLabel(sc, state.droneDateA));
    set("#dCmpLabelB", TIMELINE[state.droneDateB].date + " · " + droneStageLabel(sc, state.droneDateB));
    set("#dCmpScene", sc.name);
    $$(".walk-thumb").forEach((el,i)=>el.classList.toggle("is-active", i===state.droneScene));
  }

  function initWalk(){
    const stage=$("#walkStage"); if(!stage) return;
    if(walkRaf){ cancelAnimationFrame(walkRaf); walkRaf=null; }
    const fsBtn=$("#walkFs");
    if(fsBtn) fsBtn.onclick=()=>{
      if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); }
      else { (stage.requestFullscreen||stage.webkitRequestFullscreen).call(stage); }
    };
    if(stage.classList.contains("is-media")){ ensureAframe(); return; }
    const pano=$(".pano"), layer=$("#walkLayer");
    if(!layer||!pano) return;
    let touring=false;
    let R=Math.max(1, layer.offsetWidth - pano.offsetWidth);
    if(walkYaw>R) walkYaw=R;
    const needle=$(".walk-compass__needle"), hlbl=$(".walk-compass__lbl");
    const card=d=>["N","NE","E","SE","S","SW","W","NW"][Math.round(d/45)%8];
    function apply(){
      layer.style.transform="translateX("+(-walkYaw)+"px)";
      const head=Math.round((walkYaw/R)*359);
      if(needle) needle.style.transform="translate(-50%,-100%) rotate("+head+"deg)";
      if(hlbl) hlbl.textContent=card(head)+" · "+head+"°";
    }
    apply();
    let down=false, sx=0, sy=0;
    layer.addEventListener("pointerdown",e=>{ if(e.target.closest(".pano__hot")) return; down=true; sx=e.clientX; sy=walkYaw; stage.classList.add("grabbing"); try{layer.setPointerCapture(e.pointerId);}catch(_){} });
    layer.addEventListener("pointermove",e=>{ if(!down) return; walkYaw=Math.max(0,Math.min(R, sy-(e.clientX-sx))); apply(); });
    const up=()=>{ down=false; stage.classList.remove("grabbing"); };
    layer.addEventListener("pointerup",up); layer.addEventListener("pointercancel",up);
    function nudge(dir){ walkYaw=Math.max(0,Math.min(R, walkYaw+dir*R*0.2)); layer.style.transition="transform .45s ease"; apply(); setTimeout(()=>{layer.style.transition="";},460); }
    function step(){ if(!touring) return; walkYaw+=Math.max(0.4, R*0.0018); if(walkYaw>=R) walkYaw=0; apply(); walkRaf=requestAnimationFrame(step); }
    const bl=$("#walkLeft"), br=$("#walkRight"), bp=$("#walkPlay"), tb=$("#walkTourBtn");
    function toggleTour(){ touring=!touring; if(bp){ bp.classList.toggle("is-on",touring); bp.textContent=touring?"❚❚":"▶"; } if(tb) tb.textContent=touring?"Pause tour":"Play full tour"; if(touring){ layer.style.transition=""; step(); } else if(walkRaf){ cancelAnimationFrame(walkRaf); walkRaf=null; } }
    if(bl) bl.onclick=()=>nudge(-1);
    if(br) br.onclick=()=>nudge(1);
    if(bp) bp.onclick=toggleTour;
    if(tb) tb.onclick=toggleTour;
  }

  /* ---------------------------------------------------------- SHARED PARTS */
  function pageHead(title, sub, tag){
    return '<div class="page-head"><div class="page-head__top">'+
      '<div><div class="eyebrow">'+(state.role==="client"?"Client Portal":"Command")+'</div><h1 class="page-title">'+title+'</h1></div>'+
      '<span class="mono-label">'+(tag||"")+'</span>'+
    '</div><p class="page-sub">'+sub+'</p><div class="page-head__rule"></div></div>';
  }
  function qrSvg(){
    const cells=[];
    const pat="1011001110010110100111010010110110010101";
    for(let y=0;y<7;y++)for(let x=0;x<7;x++){const on=pat[(y*7+x)%pat.length]==="1"||(x<3&&y<3)||(x>3&&y<3&&x+y!==6);cells.push(on?'<rect x="'+(x*7)+'" y="'+(y*7)+'" width="7" height="7"/>':"");}
    return '<svg viewBox="0 0 49 49" width="100%" height="100%" fill="var(--ink)">'+cells.join("")+'</svg>';
  }

  /* ---------------------------------------------------------- DRAWER */
  function openDrawer(html){ const d=$("#drawer"), s=$("#scrim"); d.innerHTML=html; d.hidden=false; s.hidden=false; document.body.style.overflow="hidden"; }
  function closeDrawer(){ $("#drawer").hidden=true; $("#scrim").hidden=true; document.body.style.overflow=""; }

  function issueDrawer(id){
    const s=ISSUES.filter(x=>x.id===id)[0]; if(!s)return;
    openDrawer(
      '<div class="drawer__head"><div><div class="drawer__eyebrow">'+s.id+' · '+(s.sev==="crit"?"Critical":s.sev==="warn"?"Medium":"Low")+'</div><div class="drawer__title">'+esc(s.t)+'</div></div><button class="drawer__close" data-act="close">×</button></div>'+
      '<div class="drawer__body">'+
        '<div class="drawer-photo"><span class="cam__live"><span class="dot"></span>EVIDENCE</span><i style="left:30%;top:28%;width:34%;height:46%"></i></div>'+
        '<div class="kv">'+
          '<div class="kv__row"><span class="kv__k">Location</span><span class="kv__v">'+esc(s.loc)+'</span></div>'+
          '<div class="kv__row"><span class="kv__k">Responsible</span><span class="kv__v">'+esc(s.resp)+'</span></div>'+
          '<div class="kv__row"><span class="kv__k">Drawing ref</span><span class="kv__v">'+esc(s.drawing)+'</span></div>'+
          '<div class="kv__row"><span class="kv__k">Age</span><span class="kv__v">'+s.age+'</span></div>'+
          '<div class="kv__row"><span class="kv__k">Status</span><span class="kv__v">'+s.status+'</span></div>'+
        '</div>'+
        '<div class="subhead">Checklist link</div>'+
        '<div class="chk__item"><span class="chk__box pending"></span><span class="chk__label">Surface preparation</span><span class="chk__meta">Failed</span></div>'+
        '<div class="subhead">Thread</div>'+
        '<div class="thread">'+
          '<div class="thread__msg"><div class="thread__who">Quality agent <small>auto</small></div><div class="thread__txt">Flagged from photo — confidence 0.86. Routed to '+esc(s.resp)+'.</div></div>'+
          '<div class="thread__msg"><div class="thread__who">Eng. Ramesh <small>5h ago</small></div><div class="thread__txt">Asked contractor to re-clean and re-capture before proceeding.</div></div>'+
        '</div>'+
        '<div class="subhead">Reach the owner</div>'+
        '<div class="call-row"><button class="call-btn">'+I.phone+' Call</button><button class="call-btn wa">'+I.wa+' WhatsApp</button></div>'+
      '</div>'+
      '<div class="drawer__foot"><button class="ghostbtn" data-act="close">Reassign</button><button class="solidbtn" data-act="resolve" data-id="'+s.id+'">Mark resolved</button></div>');
  }

  function qrDrawer(id){
    const q=QRLOCS.filter(x=>x.id===id)[0]||{id:id,name:id,type:"Location"};
    openDrawer(
      '<div class="drawer__head"><div><div class="drawer__eyebrow">Scanned · '+q.id+'</div><div class="drawer__title">'+q.name+'</div></div><button class="drawer__close" data-act="close">×</button></div>'+
      '<div class="drawer__body">'+
        '<div class="kv">'+
          '<div class="kv__row"><span class="kv__k">Type</span><span class="kv__v">'+q.type+'</span></div>'+
          '<div class="kv__row"><span class="kv__k">Scanned by</span><span class="kv__v">Ramesh · 6:48 PM</span></div>'+
          '<div class="kv__row"><span class="kv__k">Bound to</span><span class="kv__v">GPS · device · photo</span></div>'+
          '<div class="kv__row"><span class="kv__k">Open tasks</span><span class="kv__v">'+(q.pending||0)+'</span></div>'+
        '</div>'+
        '<div class="subhead">Checklist for this location</div>'+
        '<div class="chk">'+
          '<div class="chk__item"><span class="chk__box done">'+I.check+'</span><span class="chk__label">Surface inspected</span></div>'+
          '<div class="chk__item"><span class="chk__box pending"></span><span class="chk__label">Photo proof — before</span><span class="chk__meta">Required</span></div>'+
          '<div class="chk__item"><span class="chk__box"></span><span class="chk__label">First coat applied</span></div>'+
          '<div class="chk__item"><span class="chk__box"></span><span class="chk__label">Ponding test</span></div>'+
        '</div>'+
        '<div class="subhead">Reference</div>'+
        '<div class="muted" style="font-size:12.5px">Drawing P-03 · last issue ISS-118 · subcontractor AquaSeal.</div>'+
      '</div>'+
      '<div class="drawer__foot"><button class="ghostbtn" data-act="close">Close</button><button class="solidbtn">Add photo proof</button></div>');
  }

  function defectDrawer(i){
    const d=DEFECTS[i]; if(!d)return;
    openDrawer(
      '<div class="drawer__head"><div><div class="drawer__eyebrow">AI suggestion · '+d.conf+'% confidence</div><div class="drawer__title">'+d.t+'</div></div><button class="drawer__close" data-act="close">×</button></div>'+
      '<div class="drawer__body">'+
        '<div class="drawer-photo"><span class="cam__live"><span class="dot"></span>DETECTED</span><i style="left:'+d.box[0]+'%;top:'+d.box[1]+'%;width:'+d.box[2]+'%;height:'+d.box[3]+'%"></i></div>'+
        '<div class="kv"><div class="kv__row"><span class="kv__k">Where</span><span class="kv__v">'+d.d+'</span></div><div class="kv__row"><span class="kv__k">Confidence</span><span class="kv__v">'+d.conf+'%</span></div><div class="kv__row"><span class="kv__k">Model says</span><span class="kv__v">Possible defect</span></div></div>'+
        '<div class="alert"><span class="alert__mark" style="background:var(--warn)"></span><div class="alert__body"><div class="alert__t" style="font-size:12.5px">AI is assistive, not authoritative</div><div class="alert__d">Confirm with a human before acting. False positives happen.</div></div></div>'+
      '</div>'+
      '<div class="drawer__foot"><button class="ghostbtn" data-act="close">Dismiss</button><button class="solidbtn">Confirm → create issue</button></div>');
  }

  function changedDrawer(){
    openDrawer(
      '<div class="drawer__head"><div><div class="drawer__eyebrow">Since yesterday</div><div class="drawer__title">What changed today</div></div><button class="drawer__close" data-act="close">×</button></div>'+
      '<div class="drawer__body">'+
        '<div class="subhead">Work completed</div><div class="feed">'+FEED.slice(0,3).map(f=>'<div class="feed__row"><span class="feed__time">'+f.t+'</span><span class="feed__dot"></span><span class="feed__txt">'+f.txt+'</span></div>').join("")+'</div>'+
        '<div class="subhead">New issues</div><div class="muted" style="font-size:12.5px">3 opened · 1 critical (waterproofing). 1 closed.</div>'+
        '<div class="subhead">Materials</div><div class="muted" style="font-size:12.5px">Steel received (short 300kg). Cement issued 18 bags.</div>'+
        '<div class="subhead">Decisions needed</div><div class="stack-12 mt-18">'+ATTENTION.slice(0,2).map(a=>'<div class="alert"><span class="alert__mark" style="background:'+toneColor(a.tone)+'"></span><div class="alert__body"><div class="alert__t" style="font-size:12.5px">'+a.t+'</div></div></div>').join("")+'</div>'+
      '</div>'+
      '<div class="drawer__foot"><button class="solidbtn" data-act="close">Done</button></div>');
  }

  // drill-down behind each Command Center KPI — pulled from the live datasets
  function kpiDrawer(i){
    const k = KPIS[i]; if(!k) return;
    const L = k.label;
    let title = L, lead = k.foot, body = "", cta = null;

    if(L === "Labourers on site"){
      title = "Who is on site";
      lead = "46 of 52 planned · peak 48 at 12:30. Electrical & plumbing crews are under strength.";
      const max = Math.max.apply(null, LABOR_TEAMS.map(t=>t[1]));
      body = '<div class="subhead">By team</div>'+LABOR_TEAMS.map(t=>'<div class="hbar-row"><span class="hbar-row__lbl">'+t[0]+'</span><div class="hbar"><i style="width:'+(t[1]/max*100)+'%"></i></div><span class="hbar-row__n">'+t[1]+'</span></div>').join("");
      cta = ['Open Labour board','labor'];
    } else if(L === "Active tasks"){
      title = "Active & delayed work";
      const active = WORKPKGS.filter(w=>w.pct>0 && w.pct<100), delayed = WORKPKGS.filter(w=>w.status==="warn");
      lead = active.length+" packages in progress · "+delayed.length+" behind schedule.";
      body = '<div class="subhead">In progress</div>'+active.map(w=>'<div class="row-between" style="padding:9px 0;border-bottom:1px solid var(--hair)"><span style="font-size:13px;font-weight:600">'+w.name+' <small style="font-family:var(--f-mono);color:var(--ink-3);font-weight:400">'+w.code+'</small></span><span class="pill '+toneClass(w.status)+'"><span class="dot"></span>'+w.pct+'%</span></div>').join("")+
        '<div class="subhead">Delayed — needs attention</div>'+delayed.map(w=>'<div class="alert"><span class="alert__mark" style="background:var(--warn)"></span><div class="alert__body"><div class="alert__t" style="font-size:13px">'+w.name+' · '+w.lbl+'</div><div class="alert__d">'+w.pct+'% complete</div></div></div>').join("");
      cta = ['Open Progress','progress'];
    } else if(L === "Open quality issues"){
      title = "Open quality issues";
      const open = ISSUES.filter(x=>x.status!=="Closed"), crit = open.filter(x=>x.sev==="crit").length;
      lead = open.length+" open · "+crit+" critical. Tap an issue for evidence, owner and a way to reach them.";
      body = '<div class="stack-12">'+open.map(s=>'<div class="alert" data-issue="'+s.id+'" style="cursor:pointer"><span class="alert__mark" style="background:'+toneColor(s.sev)+'"></span><div class="alert__body"><div class="alert__t" style="font-size:13px">'+esc(s.t)+'</div><div class="alert__d">'+esc(s.loc)+' · '+esc(s.resp)+'</div><div class="alert__meta"><span>'+s.id+'</span><span class="pill '+toneClass(s.sev)+'"><span class="dot"></span>'+(s.sev==="crit"?"Critical":s.sev==="warn"?"Medium":"Low")+'</span></div></div></div>').join("")+'</div>';
      cta = ['Open Issues board','issues'];
    } else if(L === "Cameras online"){
      title = "Camera status";
      const off = CAMERAS.filter(c=>c.off);
      lead = (CAMERAS.length-off.length)+" of "+CAMERAS.length+" feeds online. "+(off.length?off.length+" offline — blind spot.":"All clear.");
      body = '<div class="stack-12">'+CAMERAS.map(c=>'<div class="row-between" style="padding:9px 0;border-bottom:1px solid var(--hair)"><span style="font-size:13px;font-weight:'+(c.off?'600':'500')+'">'+c.zone+'</span>'+(c.off?'<span class="pill pill--crit"><span class="dot"></span>Offline 41m</span>':'<span class="pill pill--ok"><span class="dot"></span>Live · '+c.people+'</span>')+'</div>').join("")+'</div>'+
        (off.length?'<div class="alert" style="margin-top:12px"><span class="alert__mark" style="background:var(--crit)"></span><div class="alert__body"><div class="alert__t" style="font-size:13px">Blind spot at secondary entry</div><div class="alert__d">Gate-2 offline 41 min — no labour-count or intrusion coverage there.</div></div></div>':'');
      cta = ['Open Live Site','live'];
    } else if(L === "Material risk"){
      title = "Material shortage risk";
      const risk = MATERIALS.filter(m=>m.status!=="ok");
      lead = "Cement covers ~2 days. "+risk.length+" materials at risk.";
      body = '<div class="subhead">At risk</div>'+risk.map(m=>'<div class="row-between" style="padding:9px 0;border-bottom:1px solid var(--hair)"><span style="font-size:13px;font-weight:600">'+m.name+'</span><span class="pill '+toneClass(m.status)+'"><span class="dot"></span>'+(m.days?m.days+'d cover':'Out of stock')+'</span></div>').join("")+
        '<div class="subhead">Why it matters</div>'+MAT_ALERTS.map(a=>'<div class="alert"><span class="alert__mark" style="background:'+toneColor(a.tone)+'"></span><div class="alert__body"><div class="alert__t" style="font-size:13px">'+a.t+'</div><div class="alert__d">'+a.d+'</div></div></div>').join("");
      cta = ['Open Materials','materials'];
    } else if(L === "Curing tasks due"){
      title = "Curing & pour follow-ups";
      lead = "Pour "+POUR.id+" ("+POUR.grade+") — curing not yet confirmed.";
      body = '<div class="subhead">Reminders</div>'+(POUR.reminders||[]).map(r=>'<div class="alert"><span class="alert__mark" style="background:'+toneColor(r[0])+'"></span><div class="alert__body"><div class="alert__t" style="font-size:12.5px">'+r[1]+'</div></div></div>').join("")+
        '<div class="kv mt-18"><div class="kv__row"><span class="kv__k">Pour</span><span class="kv__v">'+POUR.id+'</span></div><div class="kv__row"><span class="kv__k">Curing</span><span class="kv__v">'+POUR.curing+'</span></div><div class="kv__row"><span class="kv__k">Engineer approval</span><span class="kv__v">'+POUR.approval+'</span></div></div>';
      cta = ['Open Concrete Pour','quality','pour'];
    } else if(L === "Today's spend"){
      title = "Today's spend";
      lead = "₹1.84L booked today across labour and the GF slab pour.";
      const items = [["Labour (46 workers)","₹0.92L",51],["RMC concrete — GF slab","₹0.66L",37],["Steel & consumables","₹0.18L",10],["Fuel & misc","₹0.08L",4]];
      body = '<div class="subhead">Breakdown</div>'+items.map(it=>'<div class="hbar-row"><span class="hbar-row__lbl" style="flex-basis:174px">'+it[0]+'</span><div class="hbar"><i style="width:'+(it[2]/51*100)+'%"></i></div><span class="hbar-row__n" style="flex-basis:56px">'+it[1]+'</span></div>').join("");
      cta = ['Open Payments','payments'];
    } else if(L === "Supervisor report"){
      title = "Supervisor report";
      lead = "Submitted 6:10 PM by Ramesh · Site Supervisor.";
      body = '<div class="summary"><h4>Highlights</h4><ul><li>GF blockwork 65% · plumbing rough-in started B-2</li><li>3 new quality issues — 1 critical</li><li>Cement low — 2 days cover</li></ul><h4>Requests</h4><ul><li>50 cement bags for tomorrow</li><li>Confirm electrician availability</li></ul></div>';
      cta = ['Open Reports','reports'];
    } else {
      body = '<div class="muted" style="font-size:13px">'+k.foot+'</div>';
    }

    openDrawer(
      '<div class="drawer__head"><div><div class="drawer__eyebrow">'+L+'</div><div class="drawer__title">'+title+'</div></div><button class="drawer__close" data-act="close">×</button></div>'+
      '<div class="drawer__body">'+
        '<div style="display:flex;align-items:baseline;gap:13px;margin-bottom:18px"><div style="font-family:var(--f-display);font-size:40px;font-weight:600;line-height:1">'+k.val+'</div><div style="font-size:12.5px;color:var(--ink-2);line-height:1.45">'+lead+'</div></div>'+
        body+
      '</div>'+
      (cta
        ? '<div class="drawer__foot"><button class="ghostbtn" data-act="close">Close</button><button class="solidbtn" data-act="goto" data-view="'+cta[1]+'"'+(cta[2]?' data-tab="'+cta[2]+'"':'')+'>'+cta[0]+' →</button></div>'
        : '<div class="drawer__foot"><button class="solidbtn" data-act="close">Close</button></div>')
    );
  }

  /* ---------------------------------------------------------- BACKEND (Supabase) */
  // Backend identity is single-sourced in config.js (inlined first by build.mjs). See ARCH-3.
  const BACKEND = window.__SthyraConfig || {};
  let backendLive = false;
  function sb(path, opts){
    opts = opts || {};
    opts.headers = Object.assign({ apikey: BACKEND.key, Authorization: "Bearer " + BACKEND.key }, opts.headers || {});
    return fetch(BACKEND.url + path, opts);
  }
  function replaceArr(arr, rows){ if(!Array.isArray(rows)) return; arr.length = 0; rows.forEach(r => arr.push(r)); }

  // fetch all datasets, patch the in-memory data in place (render reads the same refs)
  async function loadBackend(){
    try{
      async function get(t, q){
        const r = await sb("/" + t + "?" + (q || "select=*"));
        if(!r.ok) throw new Error(t + " HTTP " + r.status);
        return r.json();
      }
      const settled = await Promise.allSettled([
        get("cpm_project","select=*&limit=1"),
        get("cpm_kpis","select=label,val,foot,bar,tone&order=sort"),
        get("cpm_attention","select=tone,t,d,actions&order=sort"),
        get("cpm_feed","select=t,txt&order=sort"),
        get("cpm_issues","select=id,t,loc,sev,who,status,age,resp,drawing&order=sort"),
        get("cpm_materials","select=name,unit,stock,days,rate,status,po&order=sort"),
        get("cpm_material_alerts","select=tone,t,d,meta,act&order=sort"),
        get("cpm_work_packages","select=name,code,pct,status,lbl&order=sort"),
        get("cpm_payments","select=contractor,milestone,claim,checks,release,held,amount,note&order=sort"),
        get("cpm_scorecards","select=name,trade,score,m&order=sort"),
        get("cpm_labor_teams","select=team,count&order=sort"),
        get("cpm_agents","select=icon,name,job,live,last&order=sort"),
        get("cpm_alerts","select=level,title,detail,agent&order=sort"),
        get("cpm_cameras","select=zone,people,time,bbox,off&order=sort"),
        get("cpm_zones","select=id,name,count,x,y,w,h&order=sort"),
        get("cpm_timeline","select=date,tag,labor,mat,work,issues&order=sort"),
        get("cpm_checklist","select=grp,items&order=sort"),
        get("cpm_qr","select=id,name,type,pending,last&order=sort"),
        get("cpm_proof","select=stage,state,note,tone,clean&order=sort"),
        get("cpm_defects","select=t,d,conf,box&order=sort"),
        get("cpm_pour","select=*&limit=1"),
        get("cpm_mat_flow","select=step&order=sort"),
        get("cpm_draw_mismatch","select=t,d,sev&order=sort"),
        get("cpm_draw_sets","select=name,rng,status&order=sort"),
        get("cpm_walk_scenes","select=name,floor,note,draw,flag,mx,my,stage&order=sort"),
        get("cpm_qc_processes","select=id,sort,name,phase,status,rating,feedback,inspector,checked_at&order=sort"),
        get("cpm_qc_stages","select=*&order=sort"),
        get("cpm_qc_items","select=*&order=stage_id,sort"),
        get("cpm_estimate","select=stage,family,material,base,unit,wastage,total,source,confidence&order=sort")
      ]);
      const d = settled.map(s => s.status === "fulfilled" ? s.value : null);
      settled.forEach((s, i) => { if(s.status === "rejected") console.error("[cpm] table #" + i + " load failed:", (s.reason && s.reason.message) || s.reason); });
      if(d[0] && d[0][0]) Object.assign(PROJECT, { name:d[0][0].name, meta:d[0][0].meta, health:d[0][0].health, healthDelta:d[0][0].health_delta });
      replaceArr(KPIS, d[1]); replaceArr(ATTENTION, d[2]); replaceArr(FEED, d[3]); replaceArr(ISSUES, d[4]);
      replaceArr(MATERIALS, d[5]); replaceArr(MAT_ALERTS, d[6]); replaceArr(WORKPKGS, d[7]); replaceArr(PAYMENTS, d[8]);
      replaceArr(SCORECARDS, d[9]); replaceArr(LABOR_TEAMS, (d[10]||[]).map(r=>[r.team, r.count])); replaceArr(AGENTS, d[11]);
      const al = d[12] || [];
      ALERTS.crit.length = 0; ALERTS.warn.length = 0; ALERTS.low.length = 0;
      al.forEach(a => { if(ALERTS[a.level]) ALERTS[a.level].push([a.title, a.detail, a.agent]); });
      replaceArr(CAMERAS, d[13]); replaceArr(ZONES, d[14]); replaceArr(TIMELINE, d[15]);
      replaceArr(CHECKLIST, (d[16]||[]).map(r => ({ group:r.grp, items:r.items })));
      replaceArr(QRLOCS, d[17]); replaceArr(PROOF, d[18]); replaceArr(DEFECTS, d[19]);
      if(d[20] && d[20][0]){ const p=d[20][0]; Object.assign(POUR, { id:p.pour_id, grade:p.grade, rmc:p.rmc, trucks:p.trucks, batch:p.batch, arrival:p.arrival, start:p.start_t, end:p.end_t, slump:p.slump, cubes:p.cubes, vol:p.vol, weather:p.weather, labor:p.labor, curing:p.curing, approval:p.approval, reminders:p.reminders }); }
      replaceArr(MAT_FLOW, (d[21]||[]).map(r => r.step));
      replaceArr(DRAW_MISMATCH, d[22]); replaceArr(DRAW_SETS, (d[23]||[]).map(r => [r.name, r.rng, r.status]));
      replaceArr(WALK_SCENES, d[24]);
      replaceArr(QC, d[25]);
      replaceArr(QSTAGES, d[26]); replaceArr(QITEMS, d[27]);
      replaceArr(EST, d[28]);
      backendLive = settled.some(s => s.status === "fulfilled");
      return backendLive;
    }catch(e){ console.error("[cpm] loadBackend failed", e); return false; }
  }

  // write-back: resolving an issue persists to Postgres
  async function resolveIssue(id){
    const it = ISSUES.filter(x => x.id === id)[0];
    const prev = it ? it.status : null;
    if(it) it.status = "Closed";
    closeDrawer();
    if(state.view === "issues") render();
    if(backendLive){
      try{
        const r = await sb("/cpm_issues?id=eq." + encodeURIComponent(id), { method:"PATCH", headers:{ "Content-Type":"application/json", "Prefer":"return=minimal" }, body: JSON.stringify({ status:"Closed" }) });
        if(!r.ok) throw new Error("HTTP " + r.status);
      }catch(e){
        if(it) it.status = prev;
        if(state.view === "issues") render();
        notify("Couldn't save — issue not resolved (" + e.message + ")", "crit");
        console.error("[cpm] resolveIssue failed", id, e);
      }
    }
  }

  // quality-check review drawer for a construction process
  function qcDrawer(id){
    const q = QC.filter(x=>x.id===+id)[0]; if(!q) return;
    const opts = ["Pass","Rework","Pending"];
    openDrawer(
      '<div class="drawer__head"><div><div class="drawer__eyebrow">Quality check · '+esc(q.phase)+'</div><div class="drawer__title">'+esc(q.name)+'</div></div><button class="drawer__close" data-act="close">×</button></div>'+
      '<div class="drawer__body" data-qc-id="'+q.id+'">'+
        '<div class="kv"><div class="kv__row"><span class="kv__k">Current</span><span class="kv__v"><span class="pill '+toneClass(QC_STATUS_TONE[q.status])+'"><span class="dot"></span>'+q.status+'</span></span></div>'+
          '<div class="kv__row"><span class="kv__k">Last reviewed</span><span class="kv__v">'+(q.checked_at?(esc(q.checked_at)+(q.inspector?" · "+esc(q.inspector):"")):"—")+'</span></div></div>'+
        '<div class="subhead">Verdict</div>'+
        '<div class="qc-opts">'+opts.map(o=>'<button class="qc-opt '+(q.status===o?"is-sel":"")+'" data-qc-status="'+o+'">'+o+'</button>').join("")+'</div>'+
        '<div class="subhead">Rating</div>'+
        qcStars(q.rating||0, "qc-stars--input")+
        '<div class="subhead">Feedback</div>'+
        '<textarea id="qcFeedback" class="qc-textarea" placeholder="What was checked, what passed, what needs rework…">'+esc(q.feedback||"")+'</textarea>'+
      '</div>'+
      '<div class="drawer__foot"><button class="ghostbtn" data-act="close">Cancel</button><button class="solidbtn" data-act="qc-submit" data-id="'+q.id+'">Submit quality check</button></div>'
    );
  }
  // write-back: submitting a quality check persists to Postgres + pushes via realtime
  async function submitQC(id){
    const q = QC.filter(x=>x.id===+id)[0]; if(!q) return;
    const selOpt = $("#drawer .qc-opt.is-sel");
    const status = selOpt ? selOpt.dataset.qcStatus : q.status;
    const rating = $$("#drawer .qc-stars--input span.on").length || null;
    const ta = $("#qcFeedback"); const feedback = ta ? ta.value.trim() : q.feedback;
    const prev = { status:q.status, rating:q.rating, feedback:q.feedback, inspector:q.inspector, checked_at:q.checked_at };
    Object.assign(q, { status:status, rating:rating, feedback:feedback, inspector:"Eng. Ramesh", checked_at:"13 Jun" });
    closeDrawer();
    render();
    if(backendLive){
      try{
        const r = await sb("/cpm_qc_processes?id=eq."+encodeURIComponent(id), { method:"PATCH", headers:{ "Content-Type":"application/json", "Prefer":"return=minimal" }, body: JSON.stringify({ status:status, rating:rating, feedback:feedback, inspector:"Eng. Ramesh", checked_at:"13 Jun" }) });
        if(!r.ok) throw new Error("HTTP " + r.status);
      }catch(e){
        Object.assign(q, prev); render();
        notify("Couldn't save the quality check (" + e.message + ")", "crit");
        console.error("[cpm] submitQC failed", id, e);
      }
    }
  }
  // stage-gate write-backs (persist to Postgres)
  async function qcPatch(table, id, patch){
    if(!backendLive) return;
    try{
      const r = await sb("/"+table+"?id=eq."+id, { method:"PATCH", headers:{ "Content-Type":"application/json", "Prefer":"return=minimal" }, body: JSON.stringify(patch) });
      if(!r.ok) throw new Error("HTTP " + r.status);
    }catch(e){
      notify("Couldn't save change to " + table.replace("cpm_","") + " (" + e.message + ")", "warn");
      console.error("[cpm] qcPatch failed", table, id, e);
    }
  }
  function setQcItem(itemId, status){
    const x=QITEMS.filter(i=>i.id===+itemId)[0]; if(!x) return;
    x.status=status;
    const st=QSTAGES.filter(s=>s.id===x.stage_id)[0]; if(st) st.score=qcScore(st.id);
    render();
    qcPatch("cpm_qc_items", x.id, { status:status });
    if(st) qcPatch("cpm_qc_stages", st.id, { score: st.score });
  }
  function setQcItemValue(itemId, value){
    const x=QITEMS.filter(i=>i.id===+itemId)[0]; if(!x) return;
    x.value=value;
    qcPatch("cpm_qc_items", x.id, { value:value });
  }
  function setQcStage(stageId, status){
    const s=QSTAGES.filter(x=>x.id===+stageId)[0]; if(!s) return;
    s.status=status; s.score=qcScore(s.id)||s.score;
    const approved=QC_APPROVED.indexOf(status)!==-1;
    if(approved){ s.approved_by="Eng. Ramesh"; s.approved_at="13 Jun"; }
    render();
    qcPatch("cpm_qc_stages", s.id, { status:status, score:s.score, approved_by: approved?"Eng. Ramesh":null, approved_at: approved?"13 Jun":null });
  }

  /* ---------------------------------------------------------- REALTIME (Supabase) */
  let realtimeOn = false, rtTimer = null, rtClient = null;
  function setFoot(kind){
    const f = $("#footStamp"); if(!f) return;
    f.textContent = kind === "update" ? "● Live · Supabase · updated just now" : "● Live · Supabase · realtime on";
  }
  function onRealtime(){
    if(rtTimer) clearTimeout(rtTimer);
    rtTimer = setTimeout(function(){
      loadBackend().then(function(ok){ if(ok){ if(state.view !== "walk") render(); setFoot("update"); } });
    }, 350);
  }
  function startRealtime(){
    if(!backendLive || window.__cpmRT) return;
    window.__cpmRT = true;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload = function(){
      try{
        rtClient = window.supabase.createClient(BACKEND.base, BACKEND.anonKey);
        const ch = rtClient.channel("cpm-live");
        ["cpm_project","cpm_kpis","cpm_attention","cpm_feed","cpm_issues","cpm_materials","cpm_material_alerts","cpm_work_packages","cpm_payments","cpm_scorecards","cpm_labor_teams","cpm_agents","cpm_alerts","cpm_qc_processes","cpm_qc_stages","cpm_qc_items"].forEach(function(t){
          ch.on("postgres_changes", { event:"*", schema:"public", table:t }, onRealtime);
        });
        ch.subscribe(function(status){ if(status === "SUBSCRIBED"){ realtimeOn = true; setFoot("on"); } });
      }catch(e){ console.error("[cpm] realtime init failed", e); }
    };
    document.head.appendChild(s);
  }

  /* ---------------------------------------------------------- RENDER */
  function buildNav(){
    const nav=$("#nav");
    const items=NAV.filter(n=>n.roles.indexOf(state.role)!==-1);
    nav.innerHTML = '<div class="nav__group-label">'+(state.role==="client"?"Your project":"Site")+'</div>' +
      items.map(n=>'<button class="nav__item '+(n.id===state.view?"is-active":"")+'" data-nav="'+n.id+'">'+(I[n.icon]||"")+'<span>'+n.label+'</span>'+(n.count?'<span class="nav__count '+(n.alert?"is-alert":"")+'">'+n.count+'</span>':"")+'</button>').join("");
  }

  function render(){
    if(walkRaf){ cancelAnimationFrame(walkRaf); walkRaf=null; }
    destroyCmpViewers();
    destroyDroneViewers();
    buildNav();
    const fn = VIEWS[state.view] || VIEWS.command;
    $("#view").innerHTML = fn();
    if(state.role==="client" && state.view!=="command"){
      $("#view").insertAdjacentHTML("afterbegin",'<div class="client-banner">● You\'re viewing the client portal — internal labour, cost and contractor detail is hidden.</div>');
    }
    if(state.view==="walk"){ if(state.walkCompare) initWalkCompare(); else initWalk(); }
    if(state.view==="drone"){ if(state.droneCompare) initDroneCompare(); else initDrone(); }
    window.scrollTo({top:0});
  }

  /* ---------------------------------------------------------- EVENTS */
  function bind(){
    $("#nav").addEventListener("click", e=>{
      const b=e.target.closest("[data-nav]"); if(!b)return;
      state.view=b.dataset.nav; render(); document.getElementById("app").classList.remove("rail-open");
    });
    $("#roleToggle").addEventListener("click", e=>{
      const b=e.target.closest("[data-role]"); if(!b)return;
      state.role=b.dataset.role;
      $$(".role__btn").forEach(x=>x.classList.toggle("is-active",x===b));
      const allowed=NAV.filter(n=>n.roles.indexOf(state.role)!==-1).map(n=>n.id);
      if(allowed.indexOf(state.view)===-1) state.view="command";
      render();
    });
    $("#problemsToggle").addEventListener("click", e=>{
      state.problemsOnly=!state.problemsOnly;
      e.currentTarget.setAttribute("aria-pressed",String(state.problemsOnly));
      if(state.problemsOnly){ state.role="builder"; state.view="command"; $$(".role__btn").forEach(x=>x.classList.toggle("is-active",x.dataset.role==="builder")); }
      render();
    });
    $("#changedBtn").addEventListener("click", changedDrawer);
    $("#bell").addEventListener("click", ()=>{ state.role="builder"; state.view="alerts"; $$(".role__btn").forEach(x=>x.classList.toggle("is-active",x.dataset.role==="builder")); render(); });
    $("#railToggle").addEventListener("click", ()=>document.getElementById("app").classList.toggle("rail-open"));
    const onFs=()=>window.dispatchEvent(new Event("resize"));
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);

    $("#view").addEventListener("click", e=>{
      const sub=e.target.closest("[data-subtab]");
      if(sub){ state[sub.dataset.subtab+"Tab"]=sub.dataset.tab; render(); return; }
      const z=e.target.closest("[data-zone]"); if(z){ state.zone=z.dataset.zone; render(); return; }
      const kp=e.target.closest("[data-kpi]"); if(kp){ kpiDrawer(+kp.dataset.kpi); return; }
      const cmpd=e.target.closest("[data-cmp-date]"); if(cmpd){ const side=cmpd.dataset.side, idx=+cmpd.dataset.cmpDate, sc=WALK_SCENES[state.walkScene]||WALK_SCENES[0];
        if(side==="a") state.walkDateA=idx; else state.walkDateB=idx;
        if(cmpViewers[side]) cmpViewers[side].setImage(captureFor(sc, idx));
        const lbl=$("#cmpLabel"+side.toUpperCase()); if(lbl) lbl.textContent=TIMELINE[idx].date+" · "+stageLabel(sc, idx);
        $$('.cmp-pane__dates[data-side="'+side+'"] .walk-date').forEach((el,i)=>el.classList.toggle("is-active", i===idx)); return; }
      const ws=e.target.closest("[data-walk-scene]"); if(ws){ state.walkScene=+ws.dataset.walkScene; walkYaw=0; if(state.walkCompare) updateCompareScene(); else updateWalk(); return; }
      const wd=e.target.closest("[data-walk-date]"); if(wd){ state.walkDate=+wd.dataset.walkDate; updateWalk(); return; }
      const dscn=e.target.closest("[data-drone-scene]"); if(dscn){ state.droneScene=+dscn.dataset.droneScene; if(state.droneCompare) updateDroneScene(); else updateDrone(); return; }
      const ddt=e.target.closest("[data-drone-date]"); if(ddt){ state.droneDate=+ddt.dataset.droneDate; updateDrone(); return; }
      const dcmp=e.target.closest("[data-dcmp-date]"); if(dcmp){ const side=dcmp.dataset.side, idx=+dcmp.dataset.dcmpDate, sc=DRONE_SCENES[state.droneScene]||DRONE_SCENES[0];
        if(side==="a") state.droneDateA=idx; else state.droneDateB=idx;
        if(cmpViewers[side]) cmpViewers[side].setImage(droneCapture(sc, idx));
        const lbl=$("#dCmpLabel"+side.toUpperCase()); if(lbl) lbl.textContent=TIMELINE[idx].date+" · "+droneStageLabel(sc, idx);
        $$('.cmp-pane__dates[data-side="'+side+'"] .walk-date').forEach((el,i)=>el.classList.toggle("is-active", i===idx)); return; }
      const sg=e.target.closest(".qg-row[data-stage]"); if(sg){ state.qcStage=+sg.dataset.stage; render(); return; }
      const qit=e.target.closest("[data-qc-item]"); if(qit){ setQcItem(qit.dataset.qcItem, qit.dataset.st); return; }
      const qcr=e.target.closest("[data-qc]"); if(qcr){ qcDrawer(qcr.dataset.qc); return; }
      const qr=e.target.closest("[data-qr]"); if(qr){ qrDrawer(qr.dataset.qr); return; }
      const iss=e.target.closest("[data-issue]"); if(iss){ issueDrawer(iss.dataset.issue); return; }
      const df=e.target.closest("[data-defect]"); if(df){ defectDrawer(+df.dataset.defect); return; }
      const eb=e.target.closest("[data-est-connect]"); if(eb){ estBimDrawer(); return; }
      const act=e.target.closest("[data-act]");
      if(act){ const a=act.dataset.act;
        if(a==="changed")changedDrawer();
        if(a==="goto-gallery"){state.view="gallery";render();}
        if(a==="walk-compare"){ state.walkCompare=true; state.walkDateB=state.walkDate; state.walkDateA=Math.max(0, state.walkDate-4); render(); }
        if(a==="walk-single"){ state.walkCompare=false; render(); }
        if(a==="drone-compare"){ state.droneCompare=true; state.droneDateB=state.droneDate; state.droneDateA=Math.max(0, state.droneDate-4); render(); }
        if(a==="drone-single"){ state.droneCompare=false; render(); }
        if(a==="qc-back"){ state.qcStage=null; render(); }
        if(a==="qc-status"){ setQcStage(act.dataset.stage, act.dataset.status); }
        return; }
    });

    $("#view").addEventListener("input", e=>{
      if(e.target.id==="scrub"){
        state.tl=+e.target.value;
        $("#dayCard").innerHTML=dayCard(TIMELINE[state.tl]);
        const fill=$(".scrub-line__fill"); if(fill)fill.style.width=(state.tl/(TIMELINE.length-1)*100)+"%";
        $$(".scrub-tick").forEach((t,i)=>{t.classList.toggle("done",i<=state.tl);t.classList.toggle("is-active",i===state.tl);});
      }
    });
    $("#view").addEventListener("change", e=>{ const m=e.target.closest("[data-qc-meas]"); if(m){ setQcItemValue(m.dataset.qcMeas, m.value); } });

    $("#scrim").addEventListener("click", closeDrawer);
    $("#drawer").addEventListener("click", e=>{
      if(e.target.closest("[data-act='close']")){ closeDrawer(); return; }
      const rb=e.target.closest("[data-act='resolve']"); if(rb){ resolveIssue(rb.dataset.id); return; }
      const qs=e.target.closest("[data-qc-status]"); if(qs){ $$("#drawer .qc-opt").forEach(x=>x.classList.toggle("is-sel", x===qs)); return; }
      const str=e.target.closest("[data-qc-star]"); if(str){ const nn=+str.dataset.qcStar; $$("#drawer .qc-stars--input span").forEach((x,i)=>x.classList.toggle("on", i<nn)); return; }
      const qsub=e.target.closest("[data-act='qc-submit']"); if(qsub){ submitQC(qsub.dataset.id); return; }
      const gb=e.target.closest("[data-act='goto']"); if(gb){ closeDrawer(); state.view=gb.dataset.view; if(gb.dataset.tab) state.qualityTab=gb.dataset.tab; render(); return; }
      const ib=e.target.closest("[data-issue]"); if(ib){ issueDrawer(ib.dataset.issue); return; }
    });
    document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeDrawer(); });
  }

  /* ---------------------------------------------------------- BOOT */
  $("#footStamp").textContent = "Connecting to backend…";
  bind();
  render();
  loadBackend().then(function(ok){
    $("#footStamp").textContent = ok ? "● Live · Supabase · synced just now" : "Offline · embedded data";
    if(ok){ render(); startRealtime(); }
  });
})();
