import os
import sys
import yaml
import cv2
import torch
import numpy as np
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(r"C:\Users\Mantra\OneDrive\Desktop\SIH PROTOTYPE")
DIAG_OUT = ROOT / "diagnostic_output"
DIAG_OUT.mkdir(exist_ok=True)

# ----------------------------------------------------
# STEP 4: VERIFY DATASET LABELS & CONFIGURATION
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 4: VERIFY DATASET CONFIGURATION & LABELS")
print("=" * 60)

yaml_path = ROOT / "dataset_sih26057" / "dataset.yaml"
with open(yaml_path, "r") as f:
    ds_cfg = yaml.safe_load(f)

print(f"Dataset YAML Path : {yaml_path}")
print(f"Base Path         : {ds_cfg.get('path')}")
print(f"Train Subdir      : {ds_cfg.get('train')}")
print(f"Val Subdir        : {ds_cfg.get('val')}")
print(f"Number of Classes : {ds_cfg.get('nc')}")
print(f"Class Names       : {ds_cfg.get('names')}")

train_img_dir = ROOT / "dataset_sih26057" / "images" / "train"
train_lbl_dir = ROOT / "dataset_sih26057" / "labels" / "train"
val_img_dir = ROOT / "dataset_sih26057" / "images" / "val"
val_lbl_dir = ROOT / "dataset_sih26057" / "labels" / "val"

train_images = sorted(list(train_img_dir.glob("*.jpg")))
val_images = sorted(list(val_img_dir.glob("*.jpg")))
print(f"Train Image Count : {len(train_images)}")
print(f"Val Image Count   : {len(val_images)}")

# Color map for 5 SIH classes (BGR)
CLASS_COLORS = {
    0: (255, 180, 0),    # Plane: Cyan/Sky Blue
    1: (0, 165, 255),    # Shipwreck: Orange
    2: (50, 230, 50),    # Container: Bright Green
    3: (200, 50, 230),   # Building: Magenta
    4: (0, 255, 255)     # Tyre: Yellow
}
CLASS_NAMES = ds_cfg.get("names", {})

def parse_obb_label(lbl_path, w, h):
    targets = []
    if not lbl_path.exists():
        return targets
    with open(lbl_path, "r") as f:
        for line_no, line in enumerate(f):
            parts = line.strip().split()
            if not parts:
                continue
            cls_id = int(parts[0])
            coords = [float(x) for x in parts[1:]]
            
            # Check coordinate count
            if len(coords) == 8:
                # OBB format: 4 vertices (x1, y1, x2, y2, x3, y4, x4, y4)
                pts_norm = [(coords[i], coords[i+1]) for i in range(0, 8, 2)]
                pts_px = [(int(p[0] * w), int(p[1] * h)) for p in pts_norm]
                
                # Verify bounds
                out_of_bounds = any(p[0] < 0 or p[0] > 1.05 or p[1] < 0 or p[1] > 1.05 for p in pts_norm)
                
                targets.append({
                    "line": line_no + 1,
                    "cls_id": cls_id,
                    "cls_name": CLASS_NAMES.get(cls_id, f"Unknown_{cls_id}"),
                    "pts_norm": pts_norm,
                    "pts_px": pts_px,
                    "out_of_bounds": out_of_bounds
                })
            elif len(coords) == 4:
                # Standard bbox (cx, cy, bw, bh)
                cx, cy, bw, bh = coords
                x1 = int((cx - bw/2) * w)
                y1 = int((cy - bh/2) * h)
                x2 = int((cx + bw/2) * w)
                y2 = int((cy + bh/2) * h)
                targets.append({
                    "line": line_no + 1,
                    "cls_id": cls_id,
                    "cls_name": CLASS_NAMES.get(cls_id, f"Unknown_{cls_id}"),
                    "bbox": (x1, y1, x2, y2),
                    "pts_px": [(x1, y1), (x2, y1), (x2, y2), (x1, y2)]
                })
            elif len(coords) > 8:
                # Polygon format
                pts_norm = [(coords[i], coords[i+1]) for i in range(0, len(coords), 2)]
                pts_px = [(int(p[0] * w), int(p[1] * h)) for p in pts_norm]
                targets.append({
                    "line": line_no + 1,
                    "cls_id": cls_id,
                    "cls_name": CLASS_NAMES.get(cls_id, f"Unknown_{cls_id}"),
                    "pts_norm": pts_norm,
                    "pts_px": pts_px
                })
    return targets

# Inspect first 10 training images and check labels
print("\n--- Inspecting First 10 Training Samples & Checking Label Validity ---")
contact_sheet_items = []
all_samples = train_images[:8] + val_images[:2]

for img_p in all_samples:
    lbl_p = (train_lbl_dir if "train" in str(img_p) else val_lbl_dir) / (img_p.stem + ".txt")
    img = cv2.imread(str(img_p))
    h, w = img.shape[:2]
    targets = parse_obb_label(lbl_p, w, h)
    
    target_summary = [f"{t['cls_name']} (ID {t['cls_id']})" for t in targets]
    oob_count = sum(1 for t in targets if t.get("out_of_bounds"))
    print(f"[{img_p.name}] {w}x{h}px | Objects: {len(targets)} -> {', '.join(target_summary)} | OOB: {oob_count}")
    
    # Draw GT on image for contact sheet
    vis = img.copy()
    for t in targets:
        poly = np.array(t["pts_px"], dtype=np.int32)
        color = CLASS_COLORS.get(t["cls_id"], (0, 255, 0))
        cv2.polylines(vis, [poly], isClosed=True, color=color, thickness=2)
        cv2.fillPoly(vis, [poly], (color[0]//4, color[1]//4, color[2]//4))
        # Label text
        lx, ly = t["pts_px"][0]
        label_txt = f"GT: {t['cls_name']}"
        cv2.putText(vis, label_txt, (max(5, lx), max(20, ly - 5)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
        
    cv2.putText(vis, f"{img_p.name}", (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv2.LINE_AA)
    contact_sheet_items.append(vis)

# Build a 2x5 contact sheet (10 images total)
thumb_w, thumb_h = 360, 360
resized_thumbs = [cv2.resize(im, (thumb_w, thumb_h)) for im in contact_sheet_items]
row1 = np.hstack(resized_thumbs[:5])
row2 = np.hstack(resized_thumbs[5:10])
contact_sheet = np.vstack([row1, row2])
contact_sheet_path = DIAG_OUT / "step4_ground_truth_contact_sheet.jpg"
cv2.imwrite(str(contact_sheet_path), contact_sheet)
print(f"\n[SAVED] Contact sheet saved to: {contact_sheet_path}")


# ----------------------------------------------------
# STEP 5: CHECK CLASS MAPPING
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 5: CLASS MAPPING COMPARISON")
print("=" * 60)

seg_model = YOLO(str(ROOT / "yolo11n-seg.pt"))
obb_model = YOLO(str(ROOT / "yolo11n-obb.pt"))

print("\n--- Dataset YAML Classes ---")
for cid, cname in sorted(CLASS_NAMES.items()):
    print(f"  ID {cid}: {cname}")

print(f"\n--- YOLO11-Seg (Loaded Model) Classes ({len(seg_model.names)} total) ---")
for cid in range(min(10, len(seg_model.names))):
    print(f"  ID {cid}: {seg_model.names[cid]}")
print("  ...")

print(f"\n--- YOLO11-OBB (Loaded Model) Classes ({len(obb_model.names)} total) ---")
for cid, cname in sorted(obb_model.names.items()):
    print(f"  ID {cid}: {cname}")

# Check overlap
ds_class_set = set(CLASS_NAMES.values())
seg_class_set = set(seg_model.names.values())
obb_class_set = set(obb_model.names.values())

print("\n--- Overlap Analysis ---")
print(f"Dataset classes in YOLO11-Seg : {ds_class_set.intersection(seg_class_set)}")
print(f"Dataset classes in YOLO11-OBB : {ds_class_set.intersection(obb_class_set)}")
print(f"Missing from YOLO11-Seg       : {ds_class_set - seg_class_set}")
print(f"Missing from YOLO11-OBB       : {ds_class_set - obb_class_set}")


# ----------------------------------------------------
# STEP 2 & 3: TEST THE MODEL OUTSIDE THE UI ON A TRAINING IMAGE
# ----------------------------------------------------
print("\n" + "=" * 60)
print("STEP 2 & 3: TEST MODELS DIRECTLY IN PYTHON (OUTSIDE UI)")
print("=" * 60)

test_img_path = train_images[0] # syn_sih26057_0000.jpg
test_lbl_path = train_lbl_dir / (test_img_path.stem + ".txt")
test_img = cv2.imread(str(test_img_path))
th, tw = test_img.shape[:2]

gt_targets = parse_obb_label(test_lbl_path, tw, th)
print(f"Testing on Image : {test_img_path.name} ({tw}x{th})")
print(f"Ground Truth     : {[t['cls_name'] for t in gt_targets]}")

# 1. Run YOLO11-Seg
print("\nRunning YOLO11-Seg outside UI (conf=0.10)...")
res_seg = seg_model.predict(test_img, conf=0.10, verbose=False)
boxes_seg = res_seg[0].boxes
masks_seg = res_seg[0].masks
print(f"YOLO11-Seg Detected: {len(boxes_seg)} objects")
if len(boxes_seg) > 0:
    for i, b in enumerate(boxes_seg):
        cid = int(b.cls[0].item())
        conf = float(b.conf[0].item())
        cname = seg_model.names.get(cid, "Unknown")
        print(f"  Det {i+1}: {cname} (ID {cid}), Conf: {conf:.3f}")
else:
    print("  NO DETECTIONS with YOLO11-Seg at conf=0.10")

# Save YOLO11-Seg annotated
seg_annotated = res_seg[0].plot()
cv2.imwrite(str(DIAG_OUT / "step2_yolo11_seg_prediction.jpg"), seg_annotated)

# 2. Run YOLO11-OBB
print("\nRunning YOLO11-OBB outside UI (conf=0.10)...")
res_obb = obb_model.predict(test_img, conf=0.10, verbose=False)
obb_dets = res_obb[0].obb
print(f"YOLO11-OBB Detected: {len(obb_dets) if obb_dets is not None else 0} objects")
if obb_dets is not None and len(obb_dets) > 0:
    for i in range(len(obb_dets)):
        cid = int(obb_dets.cls[i].item())
        conf = float(obb_dets.conf[i].item())
        cname = obb_model.names.get(cid, "Unknown")
        xywhr = obb_dets.xywhr[i].tolist()
        print(f"  Det {i+1}: {cname} (ID {cid}), Conf: {conf:.3f}, xywhr: {[round(x,1) for x in xywhr]}")
else:
    print("  NO DETECTIONS with YOLO11-OBB at conf=0.10")

# Save YOLO11-OBB annotated
obb_annotated = res_obb[0].plot()
cv2.imwrite(str(DIAG_OUT / "step2_yolo11_obb_prediction.jpg"), obb_annotated)

# 3. Step 3: Ground Truth vs Prediction Comparison Overlay
print("\n--- Generating Step 3 GT vs Prediction Comparison Image ---")
comp_img = test_img.copy()

# Draw Ground Truth (GREEN)
for t in gt_targets:
    poly = np.array(t["pts_px"], dtype=np.int32)
    cv2.polylines(comp_img, [poly], isClosed=True, color=(0, 255, 0), thickness=3)
    lx, ly = t["pts_px"][0]
    cv2.putText(comp_img, f"GT: {t['cls_name']}", (lx, max(20, ly - 8)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2, cv2.LINE_AA)

# Draw YOLO11-OBB Predictions (RED)
if obb_dets is not None and len(obb_dets) > 0:
    for i in range(len(obb_dets)):
        cid = int(obb_dets.cls[i].item())
        conf = float(obb_dets.conf[i].item())
        cname = obb_model.names.get(cid, "Unknown")
        poly = obb_dets.xyxyxyxy[i].cpu().numpy().astype(np.int32)
        cv2.polylines(comp_img, [poly], isClosed=True, color=(0, 0, 255), thickness=2)
        px, py = poly[0]
        cv2.putText(comp_img, f"PRED: {cname} ({conf:.2f})", (px, max(40, py - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2, cv2.LINE_AA)

# Legend
cv2.rectangle(comp_img, (10, 10), (320, 75), (0, 0, 0), -1)
cv2.putText(comp_img, "GREEN = GROUND TRUTH (Sonar Debris)", (15, 35),
            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1, cv2.LINE_AA)
cv2.putText(comp_img, "RED   = MODEL PREDICTION", (15, 60),
            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1, cv2.LINE_AA)

comp_path = DIAG_OUT / "step3_gt_vs_prediction.jpg"
cv2.imwrite(str(comp_path), comp_img)
print(f"[SAVED] Step 3 comparison saved to: {comp_path}")

print("\nSteps 2, 3, 4, 5 Complete.")
