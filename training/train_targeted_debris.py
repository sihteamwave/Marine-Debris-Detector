"""
SIH26057 — Targeted Marine Debris Dataset Augmentation & Training Pipeline
Specialized for High-Accuracy Detection of Downed Aircraft (Planes) & Sunken Shipwrecks.

Features:
1. Filters and oversamples images with 'plane' (class 0) and 'shipwreck' (class 1).
2. Applies acoustic-accurate augmentations:
   - Horizontal swath reflection (Port/Starboard inversion with coordinate flip)
   - Acoustic Time-Varying Gain (TVG) contrast perturbations
   - Rayleigh reverberation speckle injection
   - 180° rotation invariance on flat seafloor
3. Fine-tunes YOLO11-Seg (yolo11n-seg.pt) on CPU/GPU.
4. Validates metrics (mask mAP@50) for Plane and Shipwreck.
"""

import os
import sys
import shutil
import random
import cv2
import yaml
import torch
import numpy as np
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(__file__).parent.parent.resolve()
SRC_DATASET = ROOT / "dataset_sih26057"
TARGET_DATASET = ROOT / "dataset_targeted"

def rotate_polygon_coords(pts, angle_deg, img_w, img_h):
    """Rotates normalized polygon points by 180 or horizontal flip."""
    # pts: list of (x, y) in [0, 1]
    # For horizontal flip (fliplr): x' = 1 - x, y' = y
    return [(1.0 - p[0], p[1]) for p in pts]

def generate_targeted_dataset():
    print("=" * 70)
    print("STEP 1: CREATING TARGETED DATASET (BOOSTING PLANE & SHIPWRECK)")
    print("=" * 70)
    
    # Setup directories
    for split in ["train", "val"]:
        (TARGET_DATASET / "images" / split).mkdir(parents=True, exist_ok=True)
        (TARGET_DATASET / "labels" / split).mkdir(parents=True, exist_ok=True)

    src_train_imgs = sorted(list((SRC_DATASET / "images" / "train").glob("*.jpg")))
    src_train_lbls = SRC_DATASET / "labels" / "train"

    # Copy val split directly
    for v_img in (SRC_DATASET / "images" / "val").glob("*.jpg"):
        shutil.copy(v_img, TARGET_DATASET / "images" / "val" / v_img.name)
        v_lbl = SRC_DATASET / "labels" / "val" / (v_img.stem + ".txt")
        if v_lbl.exists():
            shutil.copy(v_lbl, TARGET_DATASET / "labels" / "val" / v_lbl.name)

    sample_counter = 0

    for img_p in src_train_imgs:
        lbl_p = src_train_lbls / (img_p.stem + ".txt")
        if not lbl_p.exists():
            continue

        with open(lbl_p, "r") as f:
            lines = [l.strip() for l in f if l.strip()]

        classes_in_img = [int(l.split()[0]) for l in lines]
        has_plane = 0 in classes_in_img
        has_wreck = 1 in classes_in_img

        # 1. Always copy original sample
        new_name = f"tgt_{sample_counter:04d}"
        sample_counter += 1
        shutil.copy(img_p, TARGET_DATASET / "images" / "train" / f"{new_name}.jpg")
        with open(TARGET_DATASET / "labels" / "train" / f"{new_name}.txt", "w") as f:
            f.write("\n".join(lines) + "\n")

        # 2. If it contains Plane or Shipwreck, generate acoustic augmentations
        if has_plane or has_wreck:
            img = cv2.imread(str(img_p))
            ih, iw = img.shape[:2]

            # Augmentation A: Horizontal Swath Reflection (Port <-> Starboard)
            flip_img = cv2.flip(img, 1)
            flip_name = f"tgt_{sample_counter:04d}_flip"
            sample_counter += 1
            cv2.imwrite(str(TARGET_DATASET / "images" / "train" / f"{flip_name}.jpg"), flip_img)

            flip_lines = []
            for line in lines:
                parts = line.split()
                cid = parts[0]
                coords = [float(x) for x in parts[1:]]
                # 8 coords: x1 y1 x2 y2 x3 y4 x4 y4
                new_coords = []
                for i in range(0, 8, 2):
                    nx = round(1.0 - coords[i], 6)
                    ny = round(coords[i+1], 6)
                    new_coords.extend([nx, ny])
                flip_lines.append(f"{cid} " + " ".join(str(c) for c in new_coords))

            with open(TARGET_DATASET / "labels" / "train" / f"{flip_name}.txt", "w") as f:
                f.write("\n".join(flip_lines) + "\n")

            # Augmentation B: TVG Acoustic Contrast Adjustment (Sonar Gain)
            # High gain contrast
            gain_img = cv2.convertScaleAbs(img, alpha=1.28, beta=8)
            gain_name = f"tgt_{sample_counter:04d}_gain"
            sample_counter += 1
            cv2.imwrite(str(TARGET_DATASET / "images" / "train" / f"{gain_name}.jpg"), gain_img)
            with open(TARGET_DATASET / "labels" / "train" / f"{gain_name}.txt", "w") as f:
                f.write("\n".join(lines) + "\n")

            # Augmentation C: Rayleigh speckle perturbation
            speckle = np.random.rayleigh(scale=12.0, size=img.shape).astype(np.uint8)
            speckle_img = cv2.add(img, speckle)
            speckle_name = f"tgt_{sample_counter:04d}_speckle"
            sample_counter += 1
            cv2.imwrite(str(TARGET_DATASET / "images" / "train" / f"{speckle_name}.jpg"), speckle_img)
            with open(TARGET_DATASET / "labels" / "train" / f"{speckle_name}.txt", "w") as f:
                f.write("\n".join(lines) + "\n")

    # Create target YAML
    yaml_dict = {
        "path": str(TARGET_DATASET.resolve()),
        "train": "images/train",
        "val": "images/val",
        "names": {
            0: "plane",
            1: "shipwreck",
            2: "container",
            3: "building",
            4: "tyre"
        },
        "nc": 5
    }
    with open(TARGET_DATASET / "dataset.yaml", "w") as f:
        yaml.dump(yaml_dict, f)

    train_total = len(list((TARGET_DATASET / "images" / "train").glob("*.jpg")))
    val_total = len(list((TARGET_DATASET / "images" / "val").glob("*.jpg")))
    print(f"Targeted Dataset Created successfully:")
    print(f"  Training Samples   : {train_total} images (Heavily augmented for Plane & Shipwreck)")
    print(f"  Validation Samples : {val_total} images")
    print(f"  YAML Config        : {TARGET_DATASET / 'dataset.yaml'}")
    return TARGET_DATASET / "dataset.yaml"

def run_targeted_training(yaml_path, epochs=12, imgsz=640, batch=4):
    print("\n" + "=" * 70)
    print("STEP 2: TRAINING MODEL FOR PLANE AND SHIPWRECK")
    print("=" * 70)

    weights_dir = ROOT / "weights"
    weights_dir.mkdir(exist_ok=True)

    base_weights = ROOT / "yolo11n-seg.pt"
    print(f"Starting weights: {base_weights}")
    model = YOLO(str(base_weights))

    print(f"Training on: {yaml_path}")
    print(f"Configuration: {epochs} epochs, imgsz={imgsz}, batch={batch}")

    results = model.train(
        data=str(yaml_path),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device="cpu",
        workers=0,
        task="segment",
        optimizer="AdamW",
        lr0=0.0015,
        lrf=0.01,
        weight_decay=0.0005,
        box=7.5,
        cls=1.2,           # Increased classification loss weight for debris accuracy
        dfl=1.5,
        degrees=180.0,     # Flat seafloor rotational invariance
        fliplr=0.5,        # Swath reflection
        flipud=0.0,        # Preserves acoustic time-of-flight direction
        mosaic=1.0,
        save=True,
        project="runs_targeted",
        name="plane_shipwreck_boost"
    )

    print("\nEvaluating trained model on validation set...")
    metrics = model.val()
    if hasattr(metrics, 'seg') and metrics.seg is not None:
        print(f"mAP@50 (Mask): {metrics.seg.map50:.4f}")
        print(f"mAP@50-95 (Mask): {metrics.seg.map:.4f}")
    if hasattr(metrics, 'box') and metrics.box is not None:
        print(f"mAP@50 (Box): {metrics.box.map50:.4f}")
        print(f"mAP@50-95 (Box): {metrics.box.map:.4f}")

    # Copy best weights
    best_pt = ROOT / "runs_targeted" / "plane_shipwreck_boost" / "weights" / "best.pt"
    dest_pt = weights_dir / "yolo11_seg_best.pt"
    if best_pt.exists():
        shutil.copy(best_pt, dest_pt)
        print(f"\n[SUCCESS] Best trained weights saved to:")
        print(f"  -> {dest_pt}")
    else:
        last_pt = ROOT / "runs_targeted" / "plane_shipwreck_boost" / "weights" / "last.pt"
        if last_pt.exists():
            shutil.copy(last_pt, dest_pt)
            print(f"[SUCCESS] Trained weights (last.pt) saved to: {dest_pt}")

    return results

if __name__ == "__main__":
    data_yaml = generate_targeted_dataset()
    run_targeted_training(data_yaml, epochs=12, imgsz=640, batch=4)
