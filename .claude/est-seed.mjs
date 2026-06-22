// Seeds the stage-wise material estimate (quantity take-off → recipe → wastage → BOQ) into Supabase.
// Run: node .claude/est-seed.mjs
const BASE="https://rajvfosoxgkyanwmdphq.supabase.co/rest/v1";
const KEY="sb_publishable_u3pa8Z9iEZE8A7GSZnGXOQ_dAsjUbOp";

// [stage, family, material, base, unit, wastage%, source, confidence]
const R = [
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
 ["Painting","paint","Paintable area",3100,"m²",0,"BIM area","high"],
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
const round = (n,unit)=> unit==="nos" ? Math.round(n) : Math.round(n*10)/10;
const rows = R.map((r,i)=>{ const [stage,family,material,base,unit,w,source,conf]=r;
  return { id:i+1, sort:i+1, stage, family, material, base, unit, wastage:w, total: round(base*(1+w/100), unit), source, confidence:conf }; });

(async()=>{
  const res = await fetch(BASE+"/cpm_estimate?on_conflict=id", { method:"POST",
    headers:{ apikey:KEY, Authorization:"Bearer "+KEY, "Content-Type":"application/json", Prefer:"resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows) });
  if(!res.ok){ console.error("FAILED", res.status, await res.text()); process.exit(1); }
  console.log("estimate rows:", res.status, "("+rows.length+")");
})();
