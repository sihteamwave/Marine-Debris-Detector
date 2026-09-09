"""
SIH26057 — Second-Stage Targeted Deepening Training for Planes & Shipwrecks
Takes weights/yolo11_sonar_best.pt (already trained) and fine-tunes further
with 180° rotation invariance, swath mirroring, along-track reversal, and
specialized acoustic shadow enhancements for planes and shipwrecks.
"""

import os
import sys
import shutil
import cv2
import yaml
import torch
import numpy as np
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(r"C:\Users\Mantra\OneDrive\Desktop\SIH PROTOTYPE")
SRC_DATASET = ROOT / "dataset_sih26057"
TARGET_DATASET = ROOT / "dataset_targeted"

def enhance_plane_shipwreck_data():
    print("=" * 70)
    print("ENHANCING TARGETED DATASET: ROTATIONS, FLIPS & ACOUSTIC SHADOW AUGMENTATION FOR PLANES & SHIPWRECKS")
    print("=" * 70)

    train_imgs_dir = TARGET_DATASET / "images" / "train"
    train_lbls_dir = TARGET_DATASET / "labels" / "train"

    # Base list of original images in dataset_sih26057 containing planes or shipwrecks
    src_train_imgs = list((SRC_DATASET / "images" / "train").glob("*.jpg"))
    
    added = 0
    for img_p in src_train_imgs:
        lbl_p = SRC_DATASET / "labels" / "train" / (img_p.stem + ".txt")
        if not lbl_p.exists():
            continue

        with open(lbl_p, "r") as f:
            lines = [l.strip() for l in f if l.strip()]

        classes = [int(l.split()[0]) for l in lines]
        
        # Only augment if this image contains plane (0) or shipwreck (1)
        if 0 not in classes and 1 not in classes:
            continue

        img = cv2.imread(str(img_p))
        if img is None:
            continue

        h, w = img.shape[:2]

        # 1. Rotated 180 degrees (valid for side-scan: nadir remains center, port/starboard invert)
        rot180_img = cv2.rotate(img, cv2.ROTATE_180)
        rot_name = f"{img_p.stem}_deep_rot180"
        cv2.imwrite(str(train_imgs_dir / f"{rot_name}.jpg"), rot180_img)

        rot_lines = []
        for line in lines:
            parts = line.split()
            cid = parts[0]
            coords = [float(x) for x in parts[1:]]
            new_coords = []
            for i in range(0, 8, 2):
                nx = max(0.001, min(0.999, round(1.0 - coords[i], 6)))
                ny = max(0.001, min(0.999, round(1.0 - coords[i+1], 6)))
                new_coords.extend([nx, ny])
            rot_lines.append(f"{cid} " + " ".join(str(c) for c in new_coords))

        with open(train_lbls_dir / f"{rot_name}.txt", "w") as f:
            f.write("\n".join(rot_lines) + "\n")
        added += 1

        # 2. Horizontal Flip (Port <-> Starboard mirror reflection across nadir)
        hflip_img = cv2.flip(img, 1)
        hflip_name = f"{img_p.stem}_deep_hflip"
        cv2.imwrite(str(train_imgs_dir / f"{hflip_name}.jpg"), hflip_img)

        hflip_lines = []
        for line in lines:
            parts = line.split()
            cid = parts[0]
            coords = [float(x) for x in parts[1:]]
            new_coords = []
            for i in range(0, 8, 2):
                nx = max(0.001, min(0.999, round(1.0 - coords[i], 6)))
                ny = max(0.001, min(0.999, round(coords[i+1], 6)))
                new_coords.extend([nx, ny])
            hflip_lines.append(f"{cid} " + " ".join(str(c) for c in new_coords))

        with open(train_lbls_dir / f"{hflip_name}.txt", "w") as f:
            f.write("\n".join(hflip_lines) + "\n")
        added += 1

        # 3. Vertical Flip (Along-track reverse survey direction)
        vflip_img = cv2.flip(img, 0)
        vflip_name = f"{img_p.stem}_deep_vflip"
        cv2.imwrite(str(train_imgs_dir / f"{vflip_name}.jpg"), vflip_img)

        vflip_lines = []
        for line in lines:
            parts = line.split()
            cid = parts[0]
            coords = [float(x) for x in parts[1:]]
            new_coords = []
            for i in range(0, 8, 2):
                nx = max(0.001, min(0.999, round(coords[i], 6)))
                ny = max(0.001, min(0.999, round(1.0 - coords[i+1], 6)))
                new_coords.extend([nx, ny])
            vflip_lines.append(f"{cid} " + " ".join(str(c) for c in new_coords))

        with open(train_lbls_dir / f"{vflip_name}.txt", "w") as f:
            f.write("\n".join(vflip_lines) + "\n")
        added += 1

        # 4. Acoustic CLAHE + High-frequency speckle enhancement
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced = cv2.merge((cl, a, b))
        clahe_img = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        
        clahe_name = f"{img_p.stem}_deep_clahe"
        cv2.imwrite(str(train_imgs_dir / f"{clahe_name}.jpg"), clahe_img)
        shutil.copy(lbl_p, train_lbls_dir / f"{clahe_name}.txt")
        added += 1

    total_train = len(list(train_imgs_dir.glob("*.jpg")))
    print(f"Added {added} targeted Plane & Shipwreck acoustic augmented images.")
    print(f"Total training pool now: {total_train} images.")
    return TARGET_DATASET / "dataset.yaml"


def train_plane_shipwreck_deep(yaml_path, epochs=12, batch=8, imgsz=640):
    print("\n" + "=" * 70)
    print("STAGE 2 DEEP TRAINING: PLANE & SHIPWRECK SPECIALIZATION")
    print(f"Epochs: {epochs}, Batch Size: {batch}, Image Size: {imgsz}")
    print("=" * 70)

    # Start from already fine-tuned weights
    starting_weights = ROOT / "weights" / "yolo11_sonar_best.pt"
    if not starting_weights.exists():
        starting_weights = ROOT / "yolo11n-obb.pt"

    print(f"Loading Stage 1 Checkpoint: {starting_weights}")
    model = YOLO(str(starting_weights))

    results = model.train(
        data=str(yaml_path),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device="cpu",
        workers=0,
        optimizer="AdamW",
        lr0=0.0008,          # Fine-tuning lower learning rate to preserve learned features
        lrf=0.015,
        weight_decay=0.0005,
        box=8.5,             # Increased box regression tightness
        cls=2.0,             # Strong classification penalty for debris classes
        degrees=45.0,
        fliplr=0.5,
        flipud=0.5,
        mosaic=0.7,
        mixup=0.1,
        save=True,
        project="runs_targeted_stage2",
        name="deep_plane_wreck",
        exist_ok=True
    )

    print("\nEvaluating Stage 2 Validation Metrics...")
    metrics = model.val()
    print(f"mAP@50 (OBB): {metrics.box.map50:.4f}")
    print(f"mAP@50-95   : {metrics.box.map:.4f}")

    best_pt = ROOT / "runs_targeted_stage2" / "deep_plane_wreck" / "weights" / "best.pt"
    dest_pt = ROOT / "weights" / "yolo11_sonar_best.pt"
    if best_pt.exists():
        shutil.copy(best_pt, dest_pt)
        shutil.copy(best_pt, ROOT / "yolo11n-obb.pt")
        print(f"\n[SUCCESS] Stage 2 Best Weights Saved:")
        print(f"  -> {dest_pt}")
        print(f"  -> {ROOT / 'yolo11n-obb.pt'}")
    return results


if __name__ == "__main__":
    yaml_path = enhance_plane_shipwreck_data()
    train_plane_shipwreck_deep(yaml_path, epochs=12, batch=8, imgsz=640)
