#!/usr/bin/env python3
"""Vertical-section view of the sparse cloud: height (m) vs horizontal distance (m).
Shows why walls aren't measurable — points cluster in horizontal layers (floor, desk
tops, multi-level false ceiling), with almost none on the vertical wall planes.
"""
import os, json, glob, numpy as np
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
exec(open("geometry_quality.py").read().split("# ================= MAIN")[0])  # helpers

m=find_model(); imgs=read_images(os.path.join(m,"images.txt"))
P,err,tl=read_points(os.path.join(m,"points3D.txt"))
cams=np.array([v["C"] for v in imgs.values()])
cc=cams.mean(0); cr=np.linalg.norm(cams-cc,axis=1); Rw=np.percentile(cr,95)
keep=(np.linalg.norm(P-cc,axis=1)<3*Rw)&(tl>=3)&(err<np.percentile(err,85)); Pc=P[keep]
_,_,Vt=np.linalg.svd(cams-cams.mean(0)); up=Vt[2]
if np.median((Pc-cc)@up)<np.median((cams-cc)@up): up=-up
Q=json.load(open("out/quality_metrics.json")); s=Q.get("scale_m_per_sfm_planreg",1.0)

h=((Pc-cc)@up); h=h-np.percentile(h,1)          # floor ~ 0
hm=h*s                                            # metres
# horizontal coord: principal horizontal axis
e1=Vt[0]-(Vt[0]@up)*up; e1/=np.linalg.norm(e1)
x=((Pc-cc)@e1)*s
camh=(((cams-cc)@up)-np.percentile((Pc-cc)@up,1))*s
camx=((cams-cc)@e1)*s

slab=Q.get("ceiling_height_m",3.3)
mask=(hm>-0.3)&(hm<slab+0.6)
fig,ax=plt.subplots(figsize=(11,4.4))
ax.hist(hm[mask],bins=90,color="#7aa6c2",edgecolor="none")
ax.axvspan(1.4,2.3,color="#b0641f",alpha=0.10)
ax.text(1.85,ax.get_ylim()[1]*0.55,"wall-height zone\nfew points\n(blank walls)",color="#8a4a16",ha="center",fontsize=8.5,weight="bold")
for y,lab,col in [(0,"floor","#2f7d4f"),(0.9,"furniture / desks","#9a6a1f"),
                  (slab,f"slab/ceiling ~{slab:.2f} m","#7a1320")]:
    ax.axvline(y,ls="--",lw=1.3,c=col); ax.text(y,ax.get_ylim()[1]*0.96,"  "+lab,color=col,rotation=90,va="top",fontsize=8.5)
ax.set_xlabel("height above floor (m)"); ax.set_ylabel("reconstructed point count")
ax.set_title("Where the 3D points live — strong HORIZONTAL layers (floor, desks, false ceiling); bare vertical walls produced almost none",fontsize=10.5,weight="bold")
ax.grid(alpha=0.12)
fig.savefig("out/section_view.png",dpi=140,bbox_inches="tight")
print("WROTE out/section_view.png  (slab height ~%.2fm, scale %.3f m/sfm)"%(Q.get("ceiling_height_m",0),s))
