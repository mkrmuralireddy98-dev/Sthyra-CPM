#!/usr/bin/env python3
"""As-built structural geometry / construction-quality analysis from the COLMAP model.
Extracts: gravity 'up', metric scale (plan-calibrated), floor/ceiling planes + height,
dominant wall planes -> verticality (plumb), corner squareness, floor/ceiling level.
Scale-INDEPENDENT metrics (angles) are robust; metric dims are screening-grade.
"""
import os, json, glob, numpy as np, cv2
np.random.seed(0)

# ---------- IO ----------
def find_model():
    for p in ["colmap/sparse"]+sorted(glob.glob("colmap/sparse/*")):
        if os.path.exists(os.path.join(p,"images.txt")): return p
    return None
def qvec2rot(q):
    w,x,y,z=q
    return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],
                     [2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],
                     [2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def read_images(p):
    imgs={}; L=[l for l in open(p) if not l.startswith("#")]
    i=0
    while i<len(L):
        e=L[i].split()
        if len(e)<10: i+=1; continue
        q=list(map(float,e[1:5])); t=np.array(list(map(float,e[5:8]))); R=qvec2rot(q)
        imgs[e[9]]={"C":-R.T@t}; i+=2
    return imgs
def read_points(p):
    P,err,tl=[],[],[]
    for l in open(p):
        if l.startswith("#"): continue
        e=l.split()
        if len(e)<8: continue
        P.append(list(map(float,e[1:4]))); err.append(float(e[7])); tl.append((len(e)-8)//2)
    return np.array(P),np.array(err),np.array(tl)

# ---------- RANSAC plane ----------
def ransac_plane(P, thr, iters=600, min_inl=80):
    best=None; bestc=0
    n=len(P)
    if n<min_inl: return None
    for _ in range(iters):
        idx=np.random.choice(n,3,replace=False)
        a,b,c=P[idx]
        nrm=np.cross(b-a,c-a); ln=np.linalg.norm(nrm)
        if ln<1e-9: continue
        nrm/=ln; d=-nrm@a
        dist=np.abs(P@nrm+d)
        cnt=int((dist<thr).sum())
        if cnt>bestc: bestc=cnt; best=(nrm,d)
    if best is None: return None
    nrm,d=best; inl=np.abs(P@nrm+d)<thr
    # refit via SVD on inliers
    Q=P[inl]; cen=Q.mean(0); _,_,Vt=np.linalg.svd(Q-cen); nrm=Vt[2]; d=-nrm@cen
    inl=np.abs(P@nrm+d)<thr
    return nrm,d,inl

def ang_between(u,v):
    u=u/np.linalg.norm(u); v=v/np.linalg.norm(v)
    return np.degrees(np.arccos(np.clip(abs(u@v),-1,1)))

# ---------- plan px/m calibration (detect outer walls) ----------
def plan_px_per_m():
    im=cv2.imread("plan/plan_clean.png",cv2.IMREAD_GRAYSCALE)
    H,W=im.shape
    dark=(im<110).astype(np.float32)
    col=dark.sum(0); row=dark.sum(1)
    # outer building walls = the OUTERMOST long continuous lines (near-full-height/width runs)
    def outer(proj, lo, hi, n, span_min):
        seg=proj.copy(); seg[:int(lo*n)]=0; seg[int(hi*n):]=0
        idx=np.where(seg>span_min)[0]           # only long lines (walls), not short furniture marks
        if len(idx)<2: return None,None
        return int(idx.min()),int(idx.max())
    # a wall line spans most of the perpendicular dimension; require run length > 45% of it
    x0,x1=outer(col,0.18,0.97,W,0.45*H)
    y0,y1=outer(row,0.08,0.93,H,0.45*W)
    out={}
    if x0 is not None: out["x"]=(x1-x0)/13.97          # 45'10" overall width
    if y0 is not None: out["y"]=(y1-y0)/20.07          # 65'10" overall height
    return out

# ---------- registration scale (SfM 2D -> plan px), reuse register anchors ----------
def reg_scale():
    traj=json.load(open("out/trajectory_2d.json"))
    man=json.load(open("sem/manifest.json")); locs=json.load(open("out/asbuilt_locations.json"))
    im=cv2.imread("plan/plan_clean.png"); PH,PW=im.shape[:2]
    PLAN_AREA={"reception":(0.45,0.77),"workspace":(0.45,0.40),"cabin":(0.82,0.50),"corridor":(0.52,0.55)}
    def topx(fr): return np.array([fr[0]*PW,fr[1]*PH])
    tag_pano={tp["tag"]:tp["pano"] for tp in man["timepoints"]}
    tag_area={l["tag"]:l["area"] for l in locs}
    tj=traj["pano_ids"]; uv=np.array(traj["trajectory_uv"])
    def uvp(p): return uv[int(np.argmin([abs(p-q) for q in tj]))]
    from collections import defaultdict
    ap=defaultdict(list)
    for tag,pno in tag_pano.items():
        a=tag_area.get(tag);
        if a in PLAN_AREA: ap[a].append(uvp(pno))
    src=[];dst=[]
    for a,ps in ap.items(): src.append(np.mean(ps,0)); dst.append(topx(PLAN_AREA[a]))
    for _ in range(4): src.append(uv[0]); dst.append(topx((0.70,0.74)))
    src=np.array(src,np.float32); dst=np.array(dst,np.float32)
    def fit(s):
        M,_=cv2.estimateAffinePartial2D(s.reshape(-1,1,2),dst.reshape(-1,1,2),method=cv2.LMEDS)
        return M
    M=fit(src); sR=src.copy(); sR[:,1]*=-1; M2=fit(sR)
    def res(M,s):
        pr=(s@M[:,:2].T)+M[:,2]; return np.mean(np.linalg.norm(pr-dst,1))
    s_px=np.sqrt(M[0,0]**2+M[0,1]**2)        # plan px per SfM unit
    return s_px

# ================= MAIN =================
m=find_model()
imgs=read_images(os.path.join(m,"images.txt"))
P,err,tl=read_points(os.path.join(m,"points3D.txt"))
cams=np.array([v["C"] for v in imgs.values()])
print(f"cameras={len(cams)} points={len(P)}")

# clip outlier halo around the walked region
cc=cams.mean(0); cr=np.linalg.norm(cams-cc,axis=1)
Rwalk=np.percentile(cr,95)
keep=(np.linalg.norm(P-cc,axis=1) < 3.0*Rwalk) & (tl>=3) & (err<np.percentile(err,85))
Pc=P[keep]
print(f"interior points after clip: {len(Pc)}  (walk radius~{Rwalk:.2f} sfm)")

# ---- up estimate: PCA of cameras (walk plane) ----
_,_,Vt=np.linalg.svd(cams-cams.mean(0)); up=Vt[2]
# orient up so ceiling (more points above cameras) is +; use cameras vs points
h_pts=(Pc-cc)@up; h_cam=(cams-cc)@up
if np.median(h_pts)<np.median(h_cam): up=-up; h_pts=-h_pts; h_cam=-h_cam
print(f"up(PCA)={up.round(3)}  cam height spread={np.std(h_cam):.3f}")

# ---- floor & ceiling via extreme horizontal planes ----
sfm_scale_guess=Rwalk
thr=0.02*Rwalk
order=np.argsort(h_pts)
floor_band=Pc[order[:max(200,len(Pc)//12)]]
ceil_band =Pc[order[-max(200,len(Pc)//12):]]
fp=ransac_plane(floor_band,thr*2) ; cp=ransac_plane(ceil_band,thr*2)
res={"model":m,"n_cameras":len(cams),"n_points":int(len(P))}
if fp and cp:
    nf,df,inlf=fp; nc,dc,inlc=cp
    res["floor_rms_sfm"]=float(np.sqrt(np.mean((floor_band[inlf]@nf+df)**2)))
    res["ceiling_rms_sfm"]=float(np.sqrt(np.mean((ceil_band[inlc]@nc+dc)**2)))
    # refine up as mean of floor/ceiling normals (aligned upward)
    if nf@up<0: nf=-nf
    if nc@up<0: nc=-nc
    up=(nf+nc); up/=np.linalg.norm(up)
    floor_tilt=ang_between(nf,up); ceil_tilt=ang_between(nc,up); par=ang_between(nf,nc)
    # ceiling height (SfM units) = mean signed gap along up between planes
    def plane_h(nrm,d): return -d/(nrm@up)*(nrm@up)  # not used; compute via point heights
    h_floor=np.median((floor_band-cc)@up); h_ceil=np.median((ceil_band-cc)@up)
    ceil_h_sfm=h_ceil-h_floor
    cam_above_floor_sfm=np.median(h_cam)-h_floor
    res.update(dict(floor_tilt_deg=round(float(floor_tilt),2),
                    ceiling_tilt_deg=round(float(ceil_tilt),2),
                    floor_ceiling_parallax_deg=round(float(par),2),
                    ceiling_height_sfm=float(ceil_h_sfm),
                    cam_above_floor_sfm=float(cam_above_floor_sfm)))
    print(f"floor tilt={floor_tilt:.2f}deg ceil tilt={ceil_tilt:.2f}deg parallel-off={par:.2f}deg")
    print(f"ceiling height (sfm)={ceil_h_sfm:.3f}  cam-above-floor(sfm)={cam_above_floor_sfm:.3f}")

# ---- remove floor/ceiling points from full cloud, then hunt vertical walls ----
Pw=Pc.copy()
if fp and cp:
    nf2,df2,_=fp; nc2,dc2,_=cp
    fc_thr=thr*2.5
    Pw=Pw[(np.abs(Pw@nf2+df2)>fc_thr) & (np.abs(Pw@nc2+dc2)>fc_thr)]
print(f"points after removing floor/ceiling: {len(Pw)}")
walls=[]; Premain=Pw.copy()
WALL_THR=0.012*Rwalk                 # tighter ~ a few cm
for k in range(14):
    if len(Premain)<200: break
    r=ransac_plane(Premain, WALL_THR, iters=700, min_inl=140)
    if r is None: break
    nrm,d,inl=r
    ni=int(inl.sum())
    if ni<140: Premain=Premain[~inl]; continue
    vert=ang_between(nrm,up)
    if vert>62:                      # near-vertical => wall
        walls.append({"normal":[round(x,4) for x in nrm.tolist()],"n_inliers":ni,
                      "plumb_off_deg":round(float(abs(90-vert)),2)})
    Premain=Premain[~inl]
walls=sorted(walls,key=lambda w:-w["n_inliers"])[:8]
res["walls"]=walls
res["wall_planes_found"]=len(walls)
res["wall_geometry_recoverable"]=len(walls)>0
res["dominant_planes_all_horizontal"]=len(walls)==0
print(f"\nwall planes found: {len(walls)}")
for w in walls: print(f"  inliers={w['n_inliers']:5d}  plumb_off={w['plumb_off_deg']}deg")

# ---- corner squareness: angles between dominant wall normals ----
if len(walls)>=2:
    norms=[np.array(w["normal"]) for w in walls[:6]]
    pairs=[]
    for i in range(len(norms)):
        for j in range(i+1,len(norms)):
            a=ang_between(norms[i],norms[j])
            # walls are either ~parallel(0) or ~perpendicular(90); report deviation from nearest
            dev=min(a, abs(90-a))
            pairs.append({"i":i,"j":j,"angle":round(float(a),1),"dev_from_ortho_or_par":round(float(min(abs(a-0),abs(a-90),abs(a-180))),2)})
    res["wall_pair_angles"]=pairs
    sq=[p["dev_from_ortho_or_par"] for p in pairs if abs(p["angle"]-90)<30]
    if sq: res["median_corner_squareness_off_deg"]=round(float(np.median(sq)),2)

# ---- metric scale ----
try:
    s_px=float(reg_scale())                 # plan px per SfM unit
    ppm_d=plan_px_per_m()                    # {'x':..,'y':..} plan px per metre
    vals=[v for v in ppm_d.values() if v and v>20]
    ppm=float(np.median(vals)) if vals else None
    res["plan_px_per_m"]={k:round(float(v),1) for k,v in ppm_d.items()}
    print(f"\nreg scale s_px={s_px:.2f} plan-px/SfM   plan px/m={ppm_d}  -> use ppm={ppm}")
    if ppm:
        m_per_sfm=s_px/ppm
        # scale cross-check from camera eye-height assumption (selfie ~1.45 m)
        cam_h_sfm=res.get("cam_above_floor_sfm")
        res["scale_m_per_sfm_planreg"]=round(m_per_sfm,4)
        if cam_h_sfm and cam_h_sfm>0:
            res["scale_m_per_sfm_camH1p45"]=round(1.45/cam_h_sfm,4)
        if "ceiling_height_sfm" in res:
            res["ceiling_height_m"]=round(res["ceiling_height_sfm"]*m_per_sfm,2)
            res["cam_above_floor_m"]=round(res["cam_above_floor_sfm"]*m_per_sfm,2)
            print(f"=> ceiling/slab height ~{res['ceiling_height_m']} m  camera ~{res['cam_above_floor_m']} m  (plan-reg scale)")
        if "floor_rms_sfm" in res:
            res["floor_flatness_mm"]=round(res["floor_rms_sfm"]*m_per_sfm*1000,1)
            res["ceiling_flatness_mm"]=round(res["ceiling_rms_sfm"]*m_per_sfm*1000,1)
            print(f"=> floor flatness RMS ~{res['floor_flatness_mm']} mm  ceiling RMS ~{res['ceiling_flatness_mm']} mm (screening)")
except Exception as e:
    import traceback; print("scale calc failed:",e); traceback.print_exc()

json.dump(res,open("out/quality_metrics.json","w"),indent=1)
print("\nWROTE out/quality_metrics.json")
