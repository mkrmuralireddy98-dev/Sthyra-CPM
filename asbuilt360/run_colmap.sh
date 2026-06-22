#!/bin/bash
# Sparse SfM reconstruction of the office 360 walkthrough (modern COLMAP API).
# Produces camera trajectory (walked path) + sparse 3D point cloud (up to scale).
set -e
cd "$(dirname "$0")"
DB=colmap/database.db
IMG=persp
SPARSE=colmap/sparse
mkdir -p colmap "$SPARSE"
rm -f "$DB"; rm -rf "$SPARSE"/*

PARAMS="512.0,512.0,512.0,512.0"
if [ -f cube_manifest.json ]; then
  read FX CX CY < <(python3 -c "import json;d=json.load(open('cube_manifest.json'));p=d['pinhole_params'];print(round(p[0],4),p[1],p[2])")
  PARAMS="${FX},${FX},${CX},${CY}"
fi
echo "[colmap] intrinsics PINHOLE params=$PARAMS  images=$(ls $IMG | wc -l)"

echo "[colmap] 1/4 feature_extractor (SIFT, affine+DSP, 8192)"
colmap feature_extractor \
  --database_path "$DB" --image_path "$IMG" \
  --FeatureExtraction.type SIFT --FeatureExtraction.use_gpu 1 \
  --SiftExtraction.estimate_affine_shape 1 \
  --SiftExtraction.domain_size_pooling 1 \
  --SiftExtraction.max_num_features 8192 \
  --ImageReader.camera_model PINHOLE \
  --ImageReader.single_camera 1 \
  --ImageReader.camera_params "$PARAMS" 2>&1 | tail -2

echo "[colmap] 2/4 exhaustive_matcher (guided)"
colmap exhaustive_matcher \
  --database_path "$DB" \
  --FeatureMatching.type SIFT_BRUTEFORCE \
  --FeatureMatching.use_gpu 1 \
  --FeatureMatching.guided_matching 1 2>&1 | tail -2

echo "[colmap] match stats:"
python3 -c "
import sqlite3;c=sqlite3.connect('$DB');q=c.cursor()
q.execute('select count(*) from two_view_geometries where rows>0');print('  verified image pairs =',q.fetchone()[0])
q.execute('select count(*) from keypoints where rows>30');print('  views with >30 kp   =',q.fetchone()[0])
"

echo "[colmap] 3/4 mapper"
colmap mapper \
  --database_path "$DB" --image_path "$IMG" --output_path "$SPARSE" \
  --Mapper.ba_refine_principal_point 0 \
  --Mapper.min_num_matches 12 \
  --Mapper.init_min_num_inliers 50 \
  --Mapper.abs_pose_min_num_inliers 12 \
  --Mapper.multiple_models 1 2>&1 | tail -6

echo "[colmap] 4/4 convert best model -> TXT + PLY"
BEST=""; BESTN=0
for d in "$SPARSE"/*/; do
  [ -f "$d/images.bin" ] || continue
  n=$(python3 -c "
import struct
f=open('$d/images.bin','rb');import sys
n=struct.unpack('<Q',f.read(8))[0];print(n)" 2>/dev/null || echo 0)
  if [ "${n:-0}" -gt "$BESTN" ]; then BESTN=$n; BEST="$d"; fi
done
if [ -n "$BEST" ]; then
  colmap model_converter --input_path "$BEST" --output_path "$SPARSE" --output_type TXT
  colmap model_converter --input_path "$BEST" --output_path colmap/points.ply --output_type PLY
  echo "[colmap] DONE. best model=$BEST  registered images=$BESTN"
  colmap model_analyzer --path "$BEST" 2>&1 | grep -iE "Cameras|Images|Points|Observations|Mean|reproj" | head
else
  echo "[colmap] !! mapper produced NO usable model."
fi
echo "[colmap] ALL_DONE"
