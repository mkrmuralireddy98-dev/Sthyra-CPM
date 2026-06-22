#!/usr/bin/env python3
"""Post-process COLMAP sparse model -> camera trajectory (walked path) + top-down map.
Monocular SfM is up-to-scale; metric scale is recovered later by registering to the
floor plan. Outputs trajectory_2d.json and a top-down preview PNG.
"""
import os, json, glob, numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

SP = "colmap/sparse"

def find_model():
    if os.path.exists(os.path.join(SP, "images.txt")):
        return SP
    for d in sorted(glob.glob(os.path.join(SP, "*"))):
        if os.path.exists(os.path.join(d, "images.txt")):
            return d
    return None

def qvec2rot(q):
    w,x,y,z = q
    return np.array([
        [1-2*(y*y+z*z), 2*(x*y-z*w),   2*(x*z+y*w)],
        [2*(x*y+z*w),   1-2*(x*x+z*z), 2*(y*z-x*w)],
        [2*(x*z-y*w),   2*(y*z+x*w),   1-2*(x*x+y*y)]])

def read_images(path):
    imgs = {}
    with open(path) as f:
        lines = [l for l in f if not l.startswith("#")]
    i = 0
    while i < len(lines):
        e = lines[i].split()
        if len(e) < 10:
            i += 1; continue
        iid = int(e[0]); q = list(map(float, e[1:5])); t = np.array(list(map(float, e[5:8])))
        name = e[9]
        R = qvec2rot(q); C = -R.T @ t           # camera centre in world coords
        imgs[name] = {"id": iid, "C": C, "R": R}
        i += 2                                    # skip the 2D-points line
    return imgs

def read_points(path):
    pts, cols, errs, tlen = [], [], [], []
    with open(path) as f:
        for l in f:
            if l.startswith("#"): continue
            e = l.split()
            if len(e) < 8: continue
            pts.append(list(map(float, e[1:4])))
            cols.append(list(map(int, e[4:7])))
            errs.append(float(e[7]))
            tlen.append((len(e) - 8) // 2)
    return np.array(pts), np.array(cols), np.array(errs), np.array(tlen)

def main():
    m = find_model()
    if not m:
        print("NO_MODEL"); return
    imgs = read_images(os.path.join(m, "images.txt"))
    print(f"registered views: {len(imgs)} / 318")
    # group the 6 yaw-faces per pano -> one position per timepoint
    panos = {}
    for name, d in imgs.items():
        pno = int(name[1:5]); panos.setdefault(pno, []).append(d["C"])
    pano_ids = sorted(panos)
    centers = np.array([np.mean(panos[p], axis=0) for p in pano_ids])
    print(f"panos with a position: {len(pano_ids)}  range {pano_ids[0]}..{pano_ids[-1]}")

    pts, cols, errs, tlen = read_points(os.path.join(m, "points3D.txt"))
    print(f"sparse points: {len(pts)}")

    # gravity / floor-plane estimate: the walk is ~horizontal, so the normal of the
    # best plane through the camera centres ~ vertical. PCA: smallest-variance axis.
    ref = centers if len(centers) >= 3 else pts
    c0 = ref.mean(0); U,S,Vt = np.linalg.svd(ref - c0)
    normal = Vt[2]                      # vertical
    basis_u = Vt[0]; basis_v = Vt[1]    # horizontal plane basis
    def to2d(P):
        d = P - c0
        return np.stack([d @ basis_u, d @ basis_v], -1)
    traj2d = to2d(centers)
    pts2d  = to2d(pts) if len(pts) else np.zeros((0,2))
    height = (pts - c0) @ normal if len(pts) else np.zeros(0)

    # keep well-triangulated points for the wall map
    if len(pts):
        good = (tlen >= 3) & (errs < np.percentile(errs, 80))
    else:
        good = np.zeros(0, bool)

    out = {
        "registered_views": len(imgs),
        "n_panos": len(pano_ids),
        "pano_ids": pano_ids,
        "fps": 1.5,
        "trajectory_uv": [[round(float(a),5), round(float(b),5)] for a,b in traj2d],
        "scale": "ARBITRARY (monocular) - recover via plan registration",
        "plane_normal": [float(x) for x in normal],
    }
    json.dump(out, open("out/trajectory_2d.json","w"), indent=1)
    np.save("out/points2d.npy", pts2d)
    np.save("out/points_good.npy", good)

    # preview
    fig, ax = plt.subplots(figsize=(9,9))
    if good.any():
        ax.scatter(pts2d[good,0], pts2d[good,1], s=1, c="#888", alpha=0.35, label="sparse points")
    ax.plot(traj2d[:,0], traj2d[:,1], "-o", ms=3, lw=1.4, c="#b03050", label="walked path")
    ax.scatter([traj2d[0,0]],[traj2d[0,1]], c="green", s=60, zorder=5, label="start")
    ax.scatter([traj2d[-1,0]],[traj2d[-1,1]], c="red", s=60, zorder=5, label="end")
    for i,p in enumerate(pano_ids):
        if i % 4 == 0:
            ax.annotate(f"{(p-1)/1.5:.0f}s", traj2d[i], fontsize=6, color="#444")
    ax.set_aspect("equal"); ax.legend(fontsize=8)
    ax.set_title(f"As-built top-down (SfM) — {len(imgs)} views, {len(pano_ids)} stops")
    fig.savefig("out/topdown_preview.png", dpi=130, bbox_inches="tight")
    print("WROTE out/trajectory_2d.json, out/topdown_preview.png")

if __name__ == "__main__":
    main()
