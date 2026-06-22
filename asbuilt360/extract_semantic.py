#!/usr/bin/env python3
"""Build location-tagged snapshot sets for semantic MEP/structural inventory.
For selected timepoints along the walkthrough, emit 4 wall views + 1 ceiling view
+ a downsized equirect (full surround). One agent later reads one timepoint folder.
"""
import cv2, numpy as np, glob, os, json, math

FRAMES="frames"; OUT="sem"; os.makedirs(OUT, exist_ok=True)
FPS=1.5; STEP=3                 # every 3rd pano @1.5fps = every 2.0s
OUTSZ=1280
WALL_FOV=100.0; CEIL_FOV=120.0
WALL_YAWS=[0,90,180,270]

def remap(eq, yaw_deg, pitch_deg, fov, outsz):
    H,W=eq.shape[:2]
    f=0.5*outsz/math.tan(math.radians(fov)/2)
    cx=cy=outsz/2
    j,i=np.meshgrid(np.arange(outsz),np.arange(outsz))
    x=(j-cx);y=(i-cy);z=np.full_like(x,f,dtype=float)
    v=np.stack([x,y,z],-1).astype(float);v/=np.linalg.norm(v,axis=-1,keepdims=True)
    yaw=math.radians(yaw_deg);pit=math.radians(pitch_deg)
    Ry=np.array([[math.cos(yaw),0,math.sin(yaw)],[0,1,0],[-math.sin(yaw),0,math.cos(yaw)]])
    Rx=np.array([[1,0,0],[0,math.cos(pit),-math.sin(pit)],[0,math.sin(pit),math.cos(pit)]])
    v=v@Ry.T@Rx.T
    lon=np.arctan2(v[...,0],v[...,2]);lat=np.arcsin(np.clip(v[...,1],-1,1))
    u=(lon/(2*math.pi)+0.5)*W;vv=(lat/math.pi+0.5)*H
    return cv2.remap(eq,u.astype(np.float32),vv.astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_WRAP)

panos=sorted(glob.glob(os.path.join(FRAMES,"pano_*.jpg")))
man={"fps":FPS,"step":STEP,"timepoints":[]}
k=0
for idx,p in enumerate(panos):
    if idx%STEP!=0: continue
    num=int(os.path.basename(p).split("_")[1].split(".")[0])
    t=(num-1)/FPS
    eq=cv2.imread(p)
    tag=f"t{k:02d}"
    d=os.path.join(OUT,tag); os.makedirs(d,exist_ok=True)
    files=[]
    # full surround (downsized)
    eqs=cv2.resize(eq,(1920,960),interpolation=cv2.INTER_AREA)
    fn=f"{tag}_equirect.jpg"; cv2.imwrite(os.path.join(d,fn),eqs,[cv2.IMWRITE_JPEG_QUALITY,90]); files.append(fn)
    for yaw in WALL_YAWS:
        fn=f"{tag}_wall_y{yaw:03d}.jpg"
        cv2.imwrite(os.path.join(d,fn),remap(eq,yaw,0,WALL_FOV,OUTSZ),[cv2.IMWRITE_JPEG_QUALITY,90]); files.append(fn)
    fn=f"{tag}_ceiling.jpg"
    cv2.imwrite(os.path.join(d,fn),remap(eq,0,-72,CEIL_FOV,OUTSZ),[cv2.IMWRITE_JPEG_QUALITY,90]); files.append(fn)
    man["timepoints"].append({"tag":tag,"pano":num,"t":round(t,2),"dir":d,"files":files})
    k+=1
    print(f"  {tag}  t={t:5.1f}s  pano{num}")
json.dump(man,open(os.path.join(OUT,"manifest.json"),"w"),indent=1)
print(f"DONE: {k} timepoints, {k*6} images -> {OUT}/")
