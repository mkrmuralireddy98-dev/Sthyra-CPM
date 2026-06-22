#!/usr/bin/env python3
"""Register the SfM walked path + point cloud onto the architectural plan using the
semantic AREA labels as anchors (reception / workspace / cabins), then render an
annotated overlay: path, coverage, unvisited (hatched) zones, and finding markers.
"""
import json, numpy as np, cv2, os
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from collections import defaultdict

PLAN = "plan/plan_clean.png"
traj = json.load(open("out/trajectory_2d.json"))
man  = json.load(open("sem/manifest.json"))
locs = json.load(open("out/asbuilt_locations.json"))
pts2d = np.load("out/points2d.npy"); good = np.load("out/points_good.npy")

plan_img = cv2.cvtColor(cv2.imread(PLAN), cv2.COLOR_BGR2RGB)
PH, PW = plan_img.shape[:2]                      # 6174 x 2828

# --- plan anchor points (normalised fractions of plan_clean) ---
PLAN_AREA = {                                    # (x_frac, y_frac)
  "reception": (0.45, 0.77),
  "workspace": (0.45, 0.40),
  "cabin":     (0.82, 0.50),
  "corridor":  (0.52, 0.55),
}
UNVISITED = {                                    # zones the camera never entered
  "Men's / Women's\ntoilets": (0.74, 0.33),
  "Pantry": (0.66, 0.43),
  "Lift /\nstaircase core": (0.82, 0.73),
}
def to_px(fr): return np.array([fr[0]*PW, fr[1]*PH])

# --- SfM uv per timepoint via nearest pano ---
tag_pano = {tp["tag"]: tp["pano"] for tp in man["timepoints"]}
tag_t    = {tp["tag"]: tp["t"] for tp in man["timepoints"]}
tag_area = {l["tag"]: l["area"] for l in locs}
traj_pano = traj["pano_ids"]; traj_uv = np.array(traj["trajectory_uv"])
def uv_for_pano(p):
    i = int(np.argmin([abs(p-q) for q in traj_pano])); return traj_uv[i]
tp_uv   = {tag: uv_for_pano(pno) for tag, pno in tag_pano.items()}

# --- SfM area centroids ---
area_pts = defaultdict(list)
for tag, uv in tp_uv.items():
    a = tag_area.get(tag, "unknown")
    a = a if a in PLAN_AREA else ("cabin" if a=="cabin" else a)
    if a in PLAN_AREA: area_pts[a].append(uv)
src, dst = [], []
for a, ps in area_pts.items():
    src.append(np.mean(ps, axis=0)); dst.append(to_px(PLAN_AREA[a]))
# USER-GIVEN hard anchor: the walk starts at the stair-core doorway (red dot).
START_FRAC = (0.70, 0.74)
start_uv = traj_uv[0]                 # pano 1 = t=0 = first stop
for _ in range(4):                    # weight the known start so it dominates translation
    src.append(start_uv); dst.append(to_px(START_FRAC))
src = np.array(src, np.float32); dst = np.array(dst, np.float32)
print("anchor areas used:", list(area_pts.keys()), "counts:", {a:len(p) for a,p in area_pts.items()},
      " + hard START anchor at", START_FRAC)

# --- fit similarity, allowing reflection (try both, keep lower residual) ---
def fit(srcM):
    M,_ = cv2.estimateAffinePartial2D(srcM.reshape(-1,1,2), dst.reshape(-1,1,2), method=cv2.LMEDS)
    if M is None: return None, 1e18
    pr = (srcM @ M[:,:2].T) + M[:,2]
    return M, float(np.mean(np.linalg.norm(pr-dst, axis=1)))
Ma, ea = fit(src)
srcR = src.copy(); srcR[:,1]*=-1                 # reflected
Mb, eb = fit(srcR)
reflect = eb < ea
M = Mb if reflect else Ma
print(f"fit residual no-reflect={ea:.0f}px reflect={eb:.0f}px -> {'REFLECT' if reflect else 'direct'}")
def xform(P):
    P = np.array(P, float).reshape(-1,2).copy()
    if reflect: P[:,1]*=-1
    return (P @ M[:,:2].T) + M[:,2]

path_px = xform(traj_uv)
_sd = float(np.linalg.norm(path_px[0]-to_px(START_FRAC)))
print(f"start pinned: path[0]={path_px[0].round(0)} vs given={to_px(START_FRAC).round(0)}  off={_sd:.0f}px (~{_sd/(PH/20.07):.2f} m)")
# point cloud: robust clip then transform, keep those landing on/near the plan
P = pts2d[good]
med = np.median(P,0); mad = np.median(np.abs(P-med),0)+1e-9
keep = np.all(np.abs(P-med) < 6*mad, axis=1)
cloud_px = xform(P[keep])
inb = (cloud_px[:,0]>-0.05*PW)&(cloud_px[:,0]<1.05*PW)&(cloud_px[:,1]>-0.05*PH)&(cloud_px[:,1]<1.05*PH)
cloud_px = cloud_px[inb]
print("path pts:", len(path_px), " cloud pts on plan:", len(cloud_px))

# --- finding markers (representative plan position per key finding) ---
def pos_for_tags(tags, fallback=None):
    ps=[path_px[int(np.argmin([abs(tag_pano[t]-q) for q in traj_pano]))] for t in tags if t in tag_pano]
    return np.mean(ps,axis=0) if ps else (to_px(fallback) if fallback else None)
MARKERS = [
  ("P-1", "crit", "Wet-area fixtures\nunverified", to_px((0.74,0.33))),
  ("E-2", "maj",  "No exit/emergency\nsignage seen", pos_for_tags(["t16","t24"],(0.45,0.40))),
  ("S-1", "maj",  "Glass guard height\nunverified", pos_for_tags(["t01","t04"],(0.40,0.80))),
  ("S-3", "maj",  "Raw plaster at\nlift-door jamb", pos_for_tags(["t00"],(0.55,0.74))),
  ("E-1", "min",  "Unterminated\nceiling wiring", pos_for_tags(["t05","t15","t29"],(0.45,0.45))),
  ("S-4", "ok",   "Accent wall\nbuilt as drawn", pos_for_tags(["t05","t08"],(0.42,0.66))),
  ("S-5", "ok",   "Cabins/glazing\nbuilt as drawn", pos_for_tags(["t32","t33"],(0.82,0.50))),
]
SEVCOL={"crit":"#7a1320","maj":"#c0531f","min":"#b08a17","ok":"#2f7d4f"}

# --- render ---
fig, ax = plt.subplots(figsize=(11, 11*PH/PW))
ax.imshow(plan_img, extent=[0,PW,PH,0])
if len(cloud_px):
    ax.scatter(cloud_px[:,0], cloud_px[:,1], s=1.4, c="#9bbcd6", alpha=0.08, linewidths=0, zorder=2)
# path coloured by time
ax.plot(path_px[:,0], path_px[:,1], "-", lw=2.4, c="#8a1f33", alpha=0.9, zorder=4)
ax.scatter(path_px[:,0], path_px[:,1], s=10, c=np.arange(len(path_px)), cmap="autumn", zorder=5)
ax.scatter(*to_px(START_FRAC), s=420, marker="*", facecolor="none", edgecolor="#1f7a3d", lw=2.2, zorder=7)  # user-given start
ax.scatter(*path_px[0], s=120, marker="o", c="#1f7a3d", edgecolor="w", lw=1.5, zorder=6)
ax.scatter(*path_px[-1], s=120, marker="s", c="#7a1320", edgecolor="w", lw=1.5, zorder=6)
ax.annotate("START", path_px[0], color="#1f7a3d", fontsize=9, weight="bold", xytext=(8,8), textcoords="offset points")
ax.annotate("END", path_px[-1], color="#7a1320", fontsize=9, weight="bold", xytext=(8,8), textcoords="offset points")
# unvisited zones (hatched)
for name,fr in UNVISITED.items():
    c=to_px(fr)
    ax.add_patch(plt.Rectangle((c[0]-0.07*PW,c[1]-0.05*PH),0.14*PW,0.10*PH, fill=True,
                 facecolor="#b0641f", alpha=0.16, hatch="xxxx", edgecolor="#8a4a16", lw=1.3, zorder=7))
    ax.annotate(name, c, color="#7a3d12", fontsize=7.6, ha="center", va="center", weight="bold", zorder=8)
# finding markers
for fid,sev,label,pos in MARKERS:
    if pos is None: continue
    col=SEVCOL[sev]
    ax.scatter(*pos, s=240, marker="o", c=col, edgecolor="w", lw=1.6, zorder=8)
    ax.annotate(fid, pos, color="w", fontsize=7, weight="bold", ha="center", va="center", zorder=9)
    ax.annotate(label, pos, color=col, fontsize=7.2, ha="center", va="top",
                xytext=(0,-14), textcoords="offset points", zorder=9,
                bbox=dict(boxstyle="round,pad=0.2", fc="white", ec=col, lw=0.6, alpha=0.85))
ax.set_xlim(0,PW); ax.set_ylim(PH,0); ax.axis("off")
ax.set_title("As-built walkthrough registered to plan — path, coverage & findings", fontsize=13, weight="bold")
leg=[Patch(fc="#7a1320",label="critical/safety"),Patch(fc="#c0531f",label="major"),
     Patch(fc="#b08a17",label="minor"),Patch(fc="#2f7d4f",label="built as drawn"),
     Patch(fc="#999",alpha=0.3,hatch="////",label="not filmed")]
ax.legend(handles=leg, loc="upper right", fontsize=8, framealpha=0.9)
fig.savefig("out/overlay_annotated.png", dpi=150, bbox_inches="tight")
print("WROTE out/overlay_annotated.png")
