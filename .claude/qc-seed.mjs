// Seeds the stage-gate quality system into Supabase via REST (upsert, idempotent).
// Run: node .claude/qc-seed.mjs
const BASE = "https://rajvfosoxgkyanwmdphq.supabase.co/rest/v1";
const KEY = process.env.SUPABASE_KEY || "sb_publishable_u3pa8Z9iEZE8A7GSZnGXOQ_dAsjUbOp";

// item tuple: [grp, name, type, required, severity, unit, target, value, status, photo]
// grp B=Before work D=During work A=After work G=General
const B="Before work", D="During work", A="After work", G="General";
const C="critical", J="major", N="minor";
const it = (grp,name,type,sev,opt={}) => ({ grp, name, type, required: opt.req!==false, severity:sev,
  unit:opt.unit||null, target:opt.target||null, value:opt.value||null, status:opt.status||"pending", photo:!!opt.photo });

const STAGES = [
  { id:1, name:"Site cleaning", phase:"Substructure", status:"Closed", score:94, role:"Site Engineer", mat:"—",
    items:[ it(G,"Site boundary identified","check",J), it(G,"Old debris & vegetation removed","check",J,{photo:1,status:"pass"}),
      it(G,"Unsafe structures removed","check",C,{status:"pass"}), it(G,"Access path created","check",N,{status:"pass"}),
      it(G,"Material storage area marked","check",N,{photo:1,status:"pass"}), it(G,"Before / after cleaning photos","photo",N,{photo:1,status:"pass"}) ] },
  { id:2, name:"Survey", phase:"Substructure", status:"Closed", score:96, role:"Site Engineer", draw:"Site plan A-01 Rev 02",
    items:[ it(G,"Plot boundary matches approved drawing","check",C,{photo:1,status:"pass"}), it(G,"Existing ground level recorded","measure",J,{unit:"m",status:"pass"}),
      it(G,"Temporary benchmark fixed","check",J,{photo:1,status:"pass"}), it(G,"Building grid marked","check",C,{status:"pass"}),
      it(G,"Diagonal measurements checked","measure",J,{unit:"mm",target:"±10",status:"pass"}), it(G,"Setbacks checked","measure",C,{unit:"m",status:"pass"}),
      it(G,"Survey report attached","test",J,{status:"pass"}), it(G,"Layout approved before excavation","check",C,{status:"pass"}) ] },
  { id:3, name:"Earth work", phase:"Substructure", status:"Approved", score:90, role:"Site Engineer", draw:"Structural S-02 Rev 04",
    items:[ it(G,"Excavation location matches footing drawing","check",C,{photo:1,status:"pass"}), it(G,"Excavation depth checked","measure",C,{unit:"mm",target:"1500",value:"1500",photo:1,status:"pass"}),
      it(G,"Excavation bottom level checked","measure",J,{status:"pass"}), it(G,"Loose soil & water removed from pit","check",J,{status:"pass"}),
      it(G,"Soil bearing condition approved","check",C,{status:"pass"}), it(G,"Anti-termite treatment","check",N,{status:"na"}),
      it(G,"PCC level prepared","check",J,{photo:1,status:"pass"}) ] },
  { id:4, name:"Footings", phase:"Substructure", status:"Approved", score:92, role:"Structural Engineer",
    hold:1, holdRule:"Footing concrete cannot be poured until reinforcement, shuttering & starter bars are approved.",
    draw:"Structural S-02 (footing) Rev 04", mat:"Fe500D steel lot SL-118 · M25 RMC (UltraTech)", code:"IS 456:2000",
    items:[ it(B,"PCC thickness checked","measure",J,{unit:"mm",target:"75",value:"75",photo:1,status:"pass"}),
      it(B,"Rebar diameter checked","measure",C,{unit:"mm",target:"16",value:"16",photo:1,status:"pass"}),
      it(B,"Rebar spacing checked","measure",C,{unit:"mm c/c",target:"150",value:"150",photo:1,status:"pass"}),
      it(B,"Cover blocks placed","check",C,{photo:1,status:"pass"}), it(B,"Column starter bars position & verticality","check",C,{photo:1,status:"pass"}),
      it(B,"Shuttering alignment checked","check",J,{status:"pass"}), it(B,"Concrete grade confirmed — M25","check",C,{status:"pass"}),
      it(D,"Slump test","measure",C,{unit:"mm",target:"100±25",value:"110",photo:1,status:"pass"}), it(D,"Cube samples taken (6)","test",C,{photo:1,status:"pass"}),
      it(D,"Vibration / compaction done","check",J,{status:"pass"}), it(A,"Curing started","check",C,{photo:1,status:"pass"}),
      it(A,"Honeycombing inspection","check",J,{status:"pass"}), it(A,"Backfilling only after approval","check",J,{status:"pass"}) ] },
  { id:5, name:"Columns", phase:"Superstructure", status:"Approved", score:88, role:"Structural Engineer",
    hold:1, holdRule:"Column concrete cannot be poured until reinforcement, cover & verticality are approved.",
    draw:"Structural S-05 (columns) Rev 04", mat:"Fe500D · M25 RMC", code:"IS 456:2000",
    obs:"C5 honeycomb on south face repaired & re-inspected.",
    items:[ it(B,"Column location checked","check",C,{photo:1,status:"pass"}), it(B,"Rebar dia & number checked","measure",C,{unit:"mm",target:"16 / 6 nos",status:"pass",photo:1}),
      it(B,"Stirrup spacing checked","measure",C,{unit:"mm c/c",target:"150 / 200",value:"150",photo:1,status:"pass"}),
      it(B,"Lap length & location checked","measure",J,{unit:"× dia",target:"50d",status:"pass"}), it(B,"Cover blocks placed","check",C,{photo:1,status:"pass"}),
      it(B,"Shuttering tightness checked","check",J,{status:"pass"}), it(B,"Verticality (plumb) checked","measure",C,{unit:"mm",target:"≤6",value:"4",photo:1,status:"pass"}),
      it(D,"Concrete grade verified","check",C,{status:"pass"}), it(D,"Vibration & pour height controlled","check",J,{status:"pass"}),
      it(A,"De-shuttering time recorded","check",N,{status:"pass"}), it(A,"Honeycombing / exposed steel check","check",C,{photo:1,status:"pass"}),
      it(A,"Curing started","check",J,{photo:1,status:"pass"}) ] },
  { id:6, name:"Slab", phase:"Superstructure", status:"Approved with Observation", score:78, role:"Structural Engineer",
    hold:1, holdRule:"Slab pour cannot start until structural + electrical + plumbing pre-pour checklist is approved.",
    draw:"Structural S-04 (GF slab) Rev 04", mat:"M25 RMC · Fe500D", code:"IS 456:2000",
    obs:"Edge honeycomb patched; B-2 plumbing sleeve missed (breakout raised, ISS-110); 7-day cube result pending.",
    items:[ it(B,"Slab shuttering level checked","measure",J,{unit:"mm",status:"pass"}), it(B,"Bottom / top rebar dia & spacing","measure",C,{unit:"mm",target:"12 @ 150",photo:1,status:"pass"}),
      it(B,"Beam reinforcement checked","check",C,{photo:1,status:"pass"}), it(B,"Chair bars & cover blocks","check",J,{photo:1,status:"pass"}),
      it(B,"Electrical conduits placed per drawing","check",J,{photo:1,status:"pass"}), it(B,"Plumbing sleeves / openings placed","check",C,{photo:1,status:"fail"}),
      it(B,"Slab thickness reference marked","measure",J,{unit:"mm",target:"125",status:"pass"}), it(D,"Slump test recorded","measure",C,{unit:"mm",target:"100±25",value:"110",photo:1,status:"pass"}),
      it(D,"Cube samples taken (6)","test",C,{photo:1,status:"pass"}), it(D,"Vibration & surface level","check",J,{status:"pass"}),
      it(A,"Curing started / ponding","check",C,{photo:1,status:"pass"}), it(A,"De-shuttering only after approval","check",J,{status:"pending"}),
      it(A,"Honeycombing / level variation check","check",J,{status:"fail"}), it(A,"7-day cube test result","test",C,{status:"pending"}) ] },
  { id:7, name:"Brick work", phase:"Superstructure", status:"Inspection Pending", score:75, role:"Site Engineer",
    draw:"Arch A-04 Rev 03", mat:"AAC blocks · 1:6 cement mortar",
    items:[ it(G,"Brick / block quality checked","check",J,{photo:1,status:"pass"}), it(G,"Wall line marked per drawing","check",J,{status:"pass"}),
      it(G,"First course level checked","measure",J,{unit:"mm",photo:1,status:"pass"}), it(G,"Mortar mix ratio recorded","check",N,{target:"1:6",status:"pass"}),
      it(G,"Wall verticality checked","measure",J,{unit:"mm",target:"≤6",value:"22",photo:1,status:"fail"}), it(G,"Door / window opening size checked","measure",J,{unit:"mm",photo:1,status:"pending"}),
      it(G,"MEP openings kept","check",J,{status:"pending"}), it(G,"Curing done","check",N,{status:"pending"}) ] },
  { id:8, name:"Electrical / plumbing rough-in", phase:"MEP rough-in", status:"Ready for Inspection", score:72, role:"MEP Engineer",
    hold:1, holdRule:"Plastering cannot start until electrical & plumbing rough-in checklists and photos are approved.",
    draw:"Electrical E-03 / Plumbing P-03 Rev 02", mat:"PVC conduit · CPVC/UPVC pipe",
    items:[ it(B,"Latest electrical drawing used","check",C,{status:"pass"}), it(B,"Switch / socket heights checked","measure",J,{unit:"mm",target:"1200 / 300",photo:1,status:"pending"}),
      it(B,"Conduit route & boxes checked","check",J,{photo:1,status:"pending"}), it(B,"Junction boxes accessible","check",N,{status:"pending"}),
      it(B,"Plumbing pipe type / diameter checked","measure",J,{unit:"mm",photo:1,status:"pending"}), it(B,"Drainage slope checked","measure",C,{unit:"%",target:"1–2",status:"pending"}),
      it(B,"Bathroom B-2 sleeve present","check",C,{photo:1,status:"fail"}), it(D,"Pressure / leak test completed","test",C,{photo:1,status:"pending"}),
      it(A,"Pre-plaster route photos taken","photo",J,{photo:1,status:"pending"}) ] },
  { id:9, name:"Plastering", phase:"Finishing", status:"Not Started", score:0, role:"Site Engineer", draw:"Arch A-04", mat:"Cement plaster 1:4 / 1:6",
    items:[ it(B,"Wall surface cleaned & chasing closed","check",J), it(B,"Mesh at RCC / blockwork joints","check",J,{photo:1}),
      it(B,"Level dots / bull marks","check",N), it(D,"Thickness checked","measure",J,{unit:"mm",target:"12–15"}),
      it(A,"No cracks / hollow patches","check",J), it(A,"Curing done","check",N) ] },
  { id:10, name:"Painting", phase:"Finishing", status:"Not Started", score:0, role:"Site Engineer", mat:"Putty · Primer · Emulsion (approved shade)",
    items:[ it(B,"Plaster fully dried / dampness checked","check",J), it(B,"Surface cracks repaired","check",J),
      it(B,"Putty applied evenly & sanded","check",N,{photo:1}), it(D,"Primer applied","check",J),
      it(D,"Approved paint shade / batch used","check",J,{photo:1}), it(A,"No patches / roller marks","check",J), it(A,"Final finish approved in daylight","check",N) ] },
  { id:11, name:"Tiles", phase:"Finishing", status:"Not Started", score:0, role:"Site Engineer",
    hold:1, holdRule:"Bathroom tiles cannot start until waterproofing and ponding / leakage test are approved.",
    draw:"Arch A-06 (tile layout)", mat:"Vitrified tile · waterproof membrane",
    items:[ it(B,"Tile brand / size / shade / batch checked","check",J,{photo:1}), it(B,"Waterproofing approved (wet areas)","check",C,{photo:1}),
      it(B,"Ponding / leakage test passed","test",C,{photo:1}), it(B,"Tile layout approved","check",N),
      it(D,"Floor slope toward drain","measure",C,{unit:"%",target:"1–1.5"}), it(A,"No hollow sound / lippage","check",J), it(A,"Grouting completed","check",N) ] },
  { id:12, name:"Door & windows", phase:"Finishing", status:"Not Started", score:0, role:"Site Engineer", draw:"Door-window schedule A-08", mat:"WPC frame · shutters · hardware",
    items:[ it(B,"Opening size checked vs schedule","measure",J,{unit:"mm",photo:1}), it(B,"Frame line / level / plumb checked","measure",J,{unit:"mm",target:"≤3",photo:1}),
      it(B,"Holdfast / anchor fixing checked","check",J), it(A,"Shutter movement smooth","check",N),
      it(A,"Hardware (lock / handle) working","check",N,{photo:1}), it(A,"Sealant applied / no damage","check",N) ] },
  { id:13, name:"Electrical wiring / switches", phase:"MEP final", status:"Not Started", score:0, role:"Electrical Engineer",
    hold:1, holdRule:"Final handover blocked until continuity, insulation, earthing & load tests pass.", draw:"Electrical E-04", mat:"FR wire · MCB/RCCB · switches",
    items:[ it(G,"Correct wire size & colour code","check",J), it(G,"Circuit labelling done","check",N),
      it(G,"Switch / socket installed & height","measure",N,{unit:"mm",photo:1}), it(G,"DB circuits labelled, MCB/RCCB per design","check",J,{photo:1}),
      it(D,"Continuity test","test",C), it(D,"Insulation resistance test","test",C), it(D,"Earthing continuity test","test",C), it(D,"Load test","test",J) ] },
  { id:14, name:"Plumbing", phase:"MEP final", status:"Not Started", score:0, role:"MEP Engineer",
    hold:1, holdRule:"Fixtures blocked until pressure & leakage tests pass.", mat:"CPVC / UPVC · traps",
    items:[ it(G,"Pipe material & diameter","check",J), it(G,"Hot / cold lines correctly placed","check",J),
      it(G,"Drainage slope maintained","measure",C,{unit:"%",target:"1–2"}), it(D,"Pressure test","test",C,{photo:1}),
      it(D,"Leakage test","test",C,{photo:1}), it(A,"Traps installed correctly","check",J), it(A,"Final flow checked","test",J,{photo:1}) ] },
  { id:15, name:"Washroom / kitchen fitting", phase:"Fit-out", status:"Not Started", score:0, role:"Site Engineer", mat:"CP fittings · sanitaryware (item-QR tagged)",
    items:[ it(B,"Fitting brand / model matches selection","check",J,{photo:1}), it(B,"Correct location, height & alignment","measure",N,{unit:"mm"}),
      it(D,"Proper sealant / no leakage","check",J,{photo:1}), it(D,"Water flow & drainage working","test",J,{photo:1}),
      it(A,"Accessories fixed firmly","check",N), it(A,"Item QR tagged (WC- / Basin-)","check",N) ] },
  { id:16, name:"Granite laying", phase:"Fit-out", status:"Not Started", score:0, role:"Site Engineer", mat:"Granite slab (lot approved)",
    items:[ it(B,"Granite colour / lot approved","check",J,{photo:1}), it(B,"Thickness checked","measure",N,{unit:"mm",target:"18"}),
      it(B,"Cutouts for sink / hob checked","measure",J,{unit:"mm",photo:1}), it(D,"Edge profile approved","check",N),
      it(D,"Level checked / joints aligned","measure",J,{unit:"mm"}), it(A,"No cracks / chips, proper support","check",J), it(A,"Final polish / cleaning done","check",N,{photo:1}) ] },
];

// flatten
const stageRows = STAGES.map((s,i)=>({
  id:s.id, sort:s.id, name:s.name, phase:s.phase,
  is_hold_point: !!s.hold, hold_rule: s.holdRule||null,
  drawing_ref: s.draw||null, material_ref: s.mat||null, code_ref: s.code||null, approval_role: s.role||null,
  status: s.status, score: (s.score||0), approved_by: (["Approved","Approved with Observation","Closed"].includes(s.status)?"Eng. Ramesh":null),
  approved_at: (["Approved","Approved with Observation","Closed"].includes(s.status)?"13 Jun":null), observation: s.obs||null
}));
let iid = 0;
const itemRows = [];
STAGES.forEach(s=> s.items.forEach((x,ix)=> itemRows.push({
  id: ++iid, stage_id: s.id, sort: ix+1, grp: x.grp, name: x.name, type: x.type, required: x.required,
  severity: x.severity, unit: x.unit, target: x.target, value: x.value, status: x.status, photo: x.photo
})));

async function up(table, rows){
  const r = await fetch(BASE+"/"+table+"?on_conflict=id", { method:"POST",
    headers:{ apikey:KEY, Authorization:"Bearer "+KEY, "Content-Type":"application/json", Prefer:"resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows) });
  if(!r.ok) throw new Error(table+" "+r.status+" "+(await r.text()));
  return r.status;
}
(async()=>{
  console.log("stages:", await up("cpm_qc_stages", stageRows), "("+stageRows.length+")");
  console.log("items:", await up("cpm_qc_items", itemRows), "("+itemRows.length+")");
})().catch(e=>{ console.error("SEED FAILED:", e.message); process.exit(1); });
