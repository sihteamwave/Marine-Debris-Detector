import os
import sys
import math
import cv2
import torch
import numpy as np
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(r"C:\Users\Mantra\OneDrive\Desktop\SIH PROTOTYPE")
DIAG_OUT = ROOT / "diagnostic_output"
DIAG_OUT.mkdir(exist_ok=True)

test_img_path = ROOT / "dataset_sih26057" / "images" / "train" / "syn_sih26057_0000.jpg"
raw_img = cv2.imread(str(test_img_path))
h, w = raw_img.shape[:2]

seg_model = YOLO(str(ROOT / "yolo11n-seg.pt"))
obb_model = YOLO(str(ROOT / "yolo11n-obb.pt"))

# ----------------------------------------------------
# STEP 6: CHECK PREPROCESSING (RAW vs PREPROCESSED)
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 6: CHECK PREPROCESSING (RAW vs PREPROCESSED)")
print("=" * 60)

def preprocess_sonar_pipeline(img_bgr):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    norm = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(norm)
    denoised = cv2.GaussianBlur(enhanced, (3, 3), 0)
    return cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)

prep_img = preprocess_sonar_pipeline(raw_img)
cv2.imwrite(str(DIAG_OUT / "step6_preprocessed_input.jpg"), prep_img)

print("Running RAW Sonar Image on YOLO11-OBB (conf=0.05)...")
res_raw_obb = obb_model.predict(raw_img, conf=0.05, verbose=False)
raw_obb_count = len(res_raw_obb[0].obb) if res_raw_obb[0].obb is not None else 0
print(f"  Detections on RAW: {raw_obb_count}")
if raw_obb_count > 0:
    for i in range(raw_obb_count):
        cid = int(res_raw_obb[0].obb.cls[i].item())
        conf = float(res_raw_obb[0].obb.conf[i].item())
        print(f"    Raw Pred: {obb_model.names[cid]}, Conf: {conf:.3f}")

print("Running PREPROCESSED Sonar Image on YOLO11-OBB (conf=0.05)...")
res_prep_obb = obb_model.predict(prep_img, conf=0.05, verbose=False)
prep_obb_count = len(res_prep_obb[0].obb) if res_prep_obb[0].obb is not None else 0
print(f"  Detections on PREPROCESSED: {prep_obb_count}")
if prep_obb_count > 0:
    for i in range(prep_obb_count):
        cid = int(res_prep_obb[0].obb.cls[i].item())
        conf = float(res_prep_obb[0].obb.conf[i].item())
        print(f"    Prep Pred: {obb_model.names[cid]}, Conf: {conf:.3f}")

print("Running RAW Sonar Image on YOLO11-Seg (conf=0.05)...")
res_raw_seg = seg_model.predict(raw_img, conf=0.05, verbose=False)
raw_seg_count = len(res_raw_seg[0].boxes)
print(f"  Detections on RAW: {raw_seg_count}")
for i in range(min(5, raw_seg_count)):
    cid = int(res_raw_seg[0].boxes.cls[i].item())
    conf = float(res_raw_seg[0].boxes.conf[i].item())
    print(f"    Raw Pred: {seg_model.names[cid]}, Conf: {conf:.3f}")

print("Running PREPROCESSED Sonar Image on YOLO11-Seg (conf=0.05)...")
res_prep_seg = seg_model.predict(prep_img, conf=0.05, verbose=False)
prep_seg_count = len(res_prep_seg[0].boxes)
print(f"  Detections on PREPROCESSED: {prep_seg_count}")
for i in range(min(5, prep_seg_count)):
    cid = int(res_prep_seg[0].boxes.cls[i].item())
    conf = float(res_prep_seg[0].boxes.conf[i].item())
    print(f"    Prep Pred: {seg_model.names[cid]}, Conf: {conf:.3f}")


# ----------------------------------------------------
# STEP 7: CHECK IMAGE CHANNELS & STATS
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 7: IMAGE CHANNELS & PIXEL STATISTICS")
print("=" * 60)

# Check all images in dataset to see their profile
all_images = list((ROOT / "dataset_sih26057" / "images").glob("**/*.jpg"))
print(f"Total dataset images sampled: {len(all_images)}")

img_stats = []
for p in all_images[:5]:
    im = cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
    ch = 1 if len(im.shape) == 2 else im.shape[2]
    is_gray_rgb = False
    if ch == 3:
        # Check if all 3 channels are identical
        diff1 = np.max(np.abs(im[:,:,0].astype(int) - im[:,:,1].astype(int)))
        diff2 = np.max(np.abs(im[:,:,1].astype(int) - im[:,:,2].astype(int)))
        is_gray_rgb = (diff1 == 0 and diff2 == 0)
    
    stat = {
        "file": p.name,
        "shape": im.shape,
        "dtype": str(im.dtype),
        "channels": ch,
        "is_gray_encoded_as_rgb": is_gray_rgb,
        "min": int(np.min(im)),
        "max": int(np.max(im)),
        "mean": float(np.mean(im)),
        "std": float(np.std(im))
    }
    img_stats.append(stat)
    print(f"[{p.name}] Shape: {im.shape}, Dtype: {im.dtype}, Channels: {ch} (Pseudo-Grayscale in RGB: {is_gray_rgb}), Min: {stat['min']}, Max: {stat['max']}, Mean: {stat['mean']:.1f}")


# ----------------------------------------------------
# STEP 8: CHECK IMAGE RESOLUTION (imgsz=640, 1024, 1280)
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 8: RESOLUTION ABLATION (imgsz=640, 1024, 1280)")
print("=" * 60)

for sz in [640, 1024, 1280]:
    r_obb = obb_model.predict(raw_img, imgsz=sz, conf=0.05, verbose=False)
    n_obb = len(r_obb[0].obb) if r_obb[0].obb is not None else 0
    
    r_seg = seg_model.predict(raw_img, imgsz=sz, conf=0.05, verbose=False)
    n_seg = len(r_seg[0].boxes)
    
    print(f"imgsz={sz:4d} | YOLO11-OBB detections: {n_obb:2d} | YOLO11-Seg detections: {n_seg:2d}")


# ----------------------------------------------------
# STEP 9: CHECK SAHI / TILING
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 9: SLICED / TILED INFERENCE (SAHI SIMULATION)")
print("=" * 60)

# Simulate 512x512 tiles with 20% overlap on 1024x512 image
tile_size = 512
overlap = 0.20
step = int(tile_size * (1 - overlap)) # 409

tiles = []
for y in range(0, max(1, h - tile_size + 1), step):
    for x in range(0, max(1, w - tile_size + 1), step):
        tile = raw_img[y:y+tile_size, x:x+tile_size]
        tiles.append((x, y, tile))

print(f"Generated {len(tiles)} tiles of size {tile_size}x{tile_size} for {w}x{h} image.")
tiled_detections_obb = 0
for idx, (tx, ty, tile) in enumerate(tiles):
    r_tile = obb_model.predict(tile, conf=0.05, verbose=False)
    cnt = len(r_tile[0].obb) if r_tile[0].obb is not None else 0
    tiled_detections_obb += cnt
    if cnt > 0:
        for k in range(cnt):
            cid = int(r_tile[0].obb.cls[k].item())
            cname = obb_model.names[cid]
            conf = float(r_tile[0].obb.conf[k].item())
            print(f"  Tile {idx+1} ({tx},{ty}) Det: {cname}, Conf: {conf:.3f}")

print(f"Total Tiled Detections with YOLO11-OBB: {tiled_detections_obb}")


# ----------------------------------------------------
# STEP 10: CONFIDENCE THRESHOLD SWEEP (0.01 to 0.50)
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 10: CONFIDENCE THRESHOLD SWEEP (ALL RAW PREDICTIONS)")
print("=" * 60)

# Run raw prediction with no threshold (conf=0.01)
res_unfiltered_obb = obb_model.predict(raw_img, conf=0.01, verbose=False)
obb_all = res_unfiltered_obb[0].obb
print(f"Total raw OBB predictions at conf=0.01: {len(obb_all) if obb_all is not None else 0}")
if obb_all is not None and len(obb_all) > 0:
    for i in range(len(obb_all)):
        cid = int(obb_all.cls[i].item())
        cname = obb_model.names[cid]
        conf = float(obb_all.conf[i].item())
        print(f"  Raw OBB #{i+1}: Class '{cname}', Conf: {conf:.4f}")

res_unfiltered_seg = seg_model.predict(raw_img, conf=0.01, verbose=False)
seg_all = res_unfiltered_seg[0].boxes
print(f"\nTotal raw SEG predictions at conf=0.01: {len(seg_all)}")
for i in range(min(10, len(seg_all))):
    cid = int(seg_all.cls[i].item())
    cname = seg_model.names[cid]
    conf = float(seg_all.conf[i].item())
    print(f"  Raw SEG #{i+1}: Class '{cname}', Conf: {conf:.4f}")

print("\nConfidence Threshold Filtering Analysis:")
for th_val in [0.10, 0.20, 0.30, 0.40, 0.50]:
    cnt_o = sum(1 for c in obb_all.conf if c >= th_val) if obb_all is not None else 0
    cnt_s = sum(1 for c in seg_all.conf if c >= th_val)
    print(f"  Conf >= {th_val:.2f} -> YOLO11-OBB: {cnt_o:2d} detections | YOLO11-Seg: {cnt_s:2d} detections")


# ----------------------------------------------------
# STEP 11: CHECK NMS & DUPLICATE DETECTIONS
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 11: NMS / DUPLICATE DETECTIONS INSPECTION")
print("=" * 60)

# Inspect Ultralytics default vs backend NMS
print(f"Ultralytics default iou: {seg_model.overrides.get('iou', 0.7)}")
print(f"Ultralytics max_det    : {seg_model.overrides.get('max_det', 300)}")
# In backend/yolo_seg_detector.py line 64:
# def apply_nms(detections, iou_thresh=0.35): ...
print("Backend apply_nms iou_thresh: 0.35")


# ----------------------------------------------------
# STEP 12 & 13: OBB COORDINATES & SEG MASK RENDERING
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 12 & 13: OBB COORDINATE MATH & SEG MASK SCALING")
print("=" * 60)

# Check Ultralytics OBB format
# Ultralytics returns xywhr (center_x, center_y, width, height, rotation_radians)
# and xyxyxyxy (4 corner vertices).
# Let's verify how backend handles it:
# In backend/yolo_obb_detector.py:
# cx_px = (cx_pct / 100.0) * img_w
# tilt_deg = rot_deg; if abs(rot_deg) > 45: tilt_deg = -(90.0 - rot_deg)...
# Notice: rot_deg vs Ultralytics radians!
print("OBB Coordinate Representation:")
print("  Ultralytics returns xywhr with rotation angle in RADIANS [-pi/2, pi/2].")
print("  Ultralytics also provides .xyxyxyxy directly with 4 precise corner points in image pixels.")
print("  In backend/yolo_obb_detector.py lines 128-135, it recalculated corners using degrees and custom trigonometry.")
print("  If angles from Ultralytics (radians) are treated as degrees, coordinates rotate wildly into wrong positions!")

# Check Segmentation Mask Scaling
# Ultralytics masks.xy returns coordinates in original image pixel space!
# backend converts to percentage: (p[0] / w) * 100, (p[1] / h) * 100.
# frontend SVG viewBox must match exactly.
print("\nSegmentation Mask Representation:")
print("  Ultralytics results[0].masks.xy returns list of polygons in ORIGINAL pixel coordinates.")
print("  Conversion to percentage: x_pct = (x / w) * 100, y_pct = (y / h) * 100.")
print("  If frontend renders using SVG viewBox='0 0 100 100', percentage coords map correctly.")
print("  However, if aspect ratio scaling (e.g. object-fit: contain) has padding bars, SVG and img will desync.")

print("\nSteps 6-13 Complete.")
