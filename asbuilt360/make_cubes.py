#!/usr/bin/env python3
"""Convert equirectangular 360 panos -> overlapping perspective views for COLMAP SfM.
Each pano (3840x1920 equirect) is cut into N yaw views at a fixed FOV so adjacent
views overlap (good for feature matching). All views share identical PINHOLE intrinsics.
"""
import cv2, numpy as np, glob, os, json, math

FRAMES = "frames"          # input equirect panos
OUT    = "persp"           # output perspective views
os.makedirs(OUT, exist_ok=True)

FOV   = 90.0               # deg per perspective view
OUTSZ = 1024              # px (square)
YAWS  = [0, 60, 120, 180, 240, 300]   # 6 views, 30deg overlap each side
PITCH = 0.0
STEP  = 2                  # use every STEP-th pano to keep COLMAP tractable
FPS   = 1.5               # extraction fps (for timestamp mapping)

f = 0.5 * OUTSZ / math.tan(math.radians(FOV) / 2.0)
cx = cy = OUTSZ / 2.0
print(f"PINHOLE intrinsics: f={f:.3f} cx={cx} cy={cy}  (params: {f:.4f},{cx},{cy})")

# precompute ray directions for the base (yaw=0,pitch=0) view
j, i = np.meshgrid(np.arange(OUTSZ), np.arange(OUTSZ))
x = (j - cx); y = (i - cy); z = np.full_like(x, f, dtype=float)
base = np.stack([x, y, z], -1).astype(float)
base /= np.linalg.norm(base, axis=-1, keepdims=True)

def remap_view(eq, yaw_deg, pitch_deg):
    H, W = eq.shape[:2]
    yaw = math.radians(yaw_deg); pit = math.radians(pitch_deg)
    Ry = np.array([[ math.cos(yaw),0,math.sin(yaw)],[0,1,0],[-math.sin(yaw),0,math.cos(yaw)]])
    Rx = np.array([[1,0,0],[0,math.cos(pit),-math.sin(pit)],[0,math.sin(pit),math.cos(pit)]])
    v = base @ Ry.T @ Rx.T
    lon = np.arctan2(v[...,0], v[...,2]); lat = np.arcsin(np.clip(v[...,1],-1,1))
    u = (lon/(2*math.pi)+0.5)*W; vv = (lat/math.pi+0.5)*H
    return cv2.remap(eq, u.astype(np.float32), vv.astype(np.float32),
                     cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)

panos = sorted(glob.glob(os.path.join(FRAMES, "pano_*.jpg")))
manifest = {"fov": FOV, "outsz": OUTSZ, "yaws": YAWS, "pinhole_params": [f, cx, cy],
            "fps": FPS, "step": STEP, "views": []}
n = 0
for idx, p in enumerate(panos):
    if idx % STEP != 0:
        continue
    pano_num = int(os.path.basename(p).split("_")[1].split(".")[0])
    t = (pano_num - 1) / FPS
    eq = cv2.imread(p)
    for yaw in YAWS:
        view = remap_view(eq, yaw, PITCH)
        name = f"p{pano_num:04d}_y{yaw:03d}.jpg"
        cv2.imwrite(os.path.join(OUT, name), view, [cv2.IMWRITE_JPEG_QUALITY, 92])
        manifest["views"].append({"file": name, "pano": pano_num, "t": round(t,3), "yaw": yaw})
        n += 1
    print(f"  pano {pano_num:4d}  t={t:6.2f}s -> {len(YAWS)} views", end="\r")
json.dump(manifest, open("cube_manifest.json","w"), indent=0)
print(f"\nDONE: {n} perspective views from {len(panos)//STEP + (1 if (len(panos)-1)%STEP==0 else 0)} panos -> {OUT}/")
