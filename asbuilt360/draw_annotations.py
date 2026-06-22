#!/usr/bin/env python3
"""Draw defect bounding boxes + numbered callouts onto the chosen frame per room.
Reads out/annot_rooms.json -> writes out/annotated/<tag>.jpg.
"""
import json, os, glob
from PIL import Image, ImageDraw, ImageFont

os.makedirs("out/annotated", exist_ok=True)
rooms=json.load(open("out/annot_rooms.json"))
SEV={"snag":(192,57,43),"minor":(230,126,34),"cosmetic":(212,160,23),"good":(47,125,79)}
def font(sz):
    for p in ["/System/Library/Fonts/Supplemental/Arial Bold.ttf","/System/Library/Fonts/Helvetica.ttc"]:
        if os.path.exists(p):
            try: return ImageFont.truetype(p,sz)
            except: pass
    return ImageFont.load_default()

def find_frame(tag, chosen):
    d=f"sem/{tag}"
    cand=os.path.join(d, chosen or "")
    if os.path.exists(cand): return cand
    # fallback: equirect
    eq=os.path.join(d, f"{tag}_equirect.jpg")
    return eq if os.path.exists(eq) else None

for r in rooms:
    tag=r["tag"]; fp=find_frame(tag, r.get("chosen_file"))
    if not fp: print("no frame for",tag); continue
    im=Image.open(fp).convert("RGB"); W,H=im.size
    d=ImageDraw.Draw(im,"RGBA")
    fL=font(max(22,W//42)); fN=font(max(20,W//48))
    for i,mk in enumerate(r.get("markings",[]),1):
        col=SEV.get((mk.get("severity") or "minor").lower(),(230,126,34))
        x=max(0,mk["x"])*W; y=max(0,mk["y"])*H; w=mk["w"]*W; h=mk["h"]*H
        x2=min(W,x+w); y2=min(H,y+h)
        # box
        for t in range(4): d.rectangle([x-t,y-t,x2+t,y2+t],outline=col+(255,))
        d.rectangle([x,y,x2,y2],outline=col+(255,),width=4)
        # number badge top-left of box
        bw=max(34,W//30)
        bx,by=x, max(0,y-bw)
        d.rectangle([bx,by,bx+bw,by+bw],fill=col+(255,))
        d.text((bx+bw*0.30,by+bw*0.12),str(i),fill=(255,255,255),font=fN)
    # legend strip at bottom
    pad=int(W*0.012); lh=int(H*0.045)
    items=r.get("markings",[])
    boxh=lh*(len(items))+pad*2
    d.rectangle([0,H-boxh,W,H],fill=(20,18,15,205))
    yy=H-boxh+pad
    for i,mk in enumerate(items,1):
        col=SEV.get((mk.get("severity") or "minor").lower(),(230,126,34))
        d.rectangle([pad,yy+lh*0.15,pad+lh*0.6,yy+lh*0.85],fill=col+(255,))
        d.text((pad+lh*0.8,yy+lh*0.18),f"{i}. {mk.get('label','')}  ({mk.get('severity','')})",fill=(245,242,233),font=fL)
        yy+=lh
    im.save(f"out/annotated/{tag}.jpg",quality=88)
    print(f"{tag}: {len(items)} marks on {os.path.basename(fp)} -> out/annotated/{tag}.jpg")
print("done")
