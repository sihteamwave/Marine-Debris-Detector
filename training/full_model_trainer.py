"""
SIH26057 — Full Multi-Dataset Marine Debris Master Training Pipeline
Unifies all available real side-scan sonar datasets, targeted acoustic augmentations,
and synthetic ray-traced acoustic debris scenes across 5 core categories:
  0: plane
  1: shipwreck
  2: container
  3: building
  4: tyre

Trains YOLO11-Seg (Instance Segmentation) for high-precision debris boundary delineation.
"""

import os
import sys
import shutil
import random
import yaml
from pathlib import Path
import numpy as np
import cv2

ROOT = Path(__file__).parent.parent.resolve()
UNIFIED_DIR = ROOT / "dataset_unified"

def setup_unified_dataset(num_synthetic: int = 120):
    print("=" * 75)
    print("  SIH26057 — UNIFIED DATASET AGGREGATION & SYNTHETIC BALANCING")
    print("=" * 75)

    train_img_dir = UNIFIED_DIR / "images" / "train"
    train_lbl_dir = UNIFIED_DIR / "labels" / "train"
    val_img_dir = UNIFIED_DIR / "images" / "val"
    val_lbl_dir = UNIFIED_DIR / "labels" / "val"

    for d in [train_img_dir, train_lbl_dir, val_img_dir, val_lbl_dir]:
        d.mkdir(parents=True, exist_ok=True)

    img_counter = 0

    # 1. Aggregate real & augmented samples from dataset_sih26057 & dataset_targeted
    source_dirs = [ROOT / "dataset_sih26057", ROOT / "dataset_targeted"]
    for src_dir in source_dirs:
        if not src_dir.exists():
            continue

        for split in ["train", "val"]:
            src_imgs = list((src_dir / "images" / split).glob("*.jpg")) + list((src_dir / "images" / split).glob("*.png"))
            for img_path in src_imgs:
                lbl_path = src_dir / "labels" / split / (img_path.stem + ".txt")
                if not lbl_path.exists():
                    continue

                target_img_dir = train_img_dir if split == "train" else val_img_dir
                target_lbl_dir = train_lbl_dir if split == "train" else val_lbl_dir

                dst_name = f"uni_{img_counter:05d}"
                img_counter += 1

                shutil.copy(img_path, target_img_dir / f"{dst_name}.jpg")
                shutil.copy(lbl_path, target_lbl_dir / f"{dst_name}.txt")

    print(f"[AGGREGATION] Collected {img_counter} images from existing datasets.")

    # 2. Synthesize ray-traced acoustic side-scan scenes for balanced representation
    print(f"[SYNTHESIS] Generating {num_synthetic} synthetic acoustic debris scenes with ray-traced shadow physics...")
    try:
        from training.synthetic_debris_generator import SyntheticSonarDebrisGenerator
    except ImportError:
        sys.path.insert(0, str(ROOT / "training"))
        from synthetic_debris_generator import SyntheticSonarDebrisGenerator

    generator = SyntheticSonarDebrisGenerator(sensor_altitude_m=14.0, swath_range_m=50.0)

    val_split_count = max(5, int(num_synthetic * 0.15))
    for i in range(num_synthetic):
        is_val = i < val_split_count
        t_img_dir = val_img_dir if is_val else train_img_dir
        t_lbl_dir = val_lbl_dir if is_val else train_lbl_dir

        dst_name = f"uni_syn_{i:04d}"
        img_p = t_img_dir / f"{dst_name}.jpg"
        lbl_p = t_lbl_dir / f"{dst_name}.txt"

        generator.generate_synthetic_scene(
            output_img_path=img_p,
            output_txt_path=lbl_p,
            num_debris=random.randint(1, 4)
        )

    # 3. Export dataset.yaml
    yaml_data = {
        "path": str(UNIFIED_DIR.resolve()),
        "train": "images/train",
        "val": "images/val",
        "names": {
            0: "plane",
            1: "shipwreck",
            2: "container",
            3: "building",
            4: "tyre",
            5: "cable",
            6: "plastic_waste",
            7: "mud_covered_debris",
            8: "metal_drum",
            9: "wooden_crate",
            10: "unexploded_ordnance",
            11: "unknown_anomaly"
        },
        "nc": 12
    }

    yaml_path = UNIFIED_DIR / "dataset.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(yaml_data, f, default_flow_style=False, sort_keys=False)

    train_total = len(list(train_img_dir.glob("*.jpg")))
    val_total = len(list(val_img_dir.glob("*.jpg")))
    print(f"[SUCCESS] Unified Dataset Built:")
    print(f"  - Training Set   : {train_total} images")
    print(f"  - Validation Set : {val_total} images")
    print(f"  - Config YAML    : {yaml_path}")
    return yaml_path

def train_full_model(data_yaml: Path, epochs: int = 25, batch: int = 4, imgsz: int = 640):
    print("\n" + "=" * 75)
    print("  SIH26057 — FULL MASTER MODEL TRAINING (YOLO11-Seg)")
    print(f"  Epochs: {epochs} | Batch: {batch} | Image Size: {imgsz}px | Device: CPU")
    print("=" * 75)

    from ultralytics import YOLO

    # Determine starting weights
    best_existing = ROOT / "weights" / "yolo11_seg_best.pt"
    base_weights = ROOT / "yolo11n-seg.pt"

    if best_existing.exists():
        start_weights = best_existing
    elif base_weights.exists():
        start_weights = base_weights
    else:
        start_weights = "yolo11n-seg.pt"

    print(f"Loading base weights: {start_weights}")
    model = YOLO(str(start_weights))

    # Acoustic-optimized training hyperparameters
    results = model.train(
        data=str(data_yaml),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device="cpu",
        workers=0,
        task="segment",
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        weight_decay=0.0005,
        box=7.5,
        cls=1.5,
        dfl=1.5,
        degrees=180.0,    # 360° rotational invariance on seabed
        fliplr=0.5,       # Port/starboard swath horizontal reflection
        flipud=0.0,       # Preserves acoustic time-of-flight direction
        mosaic=1.0,       # Patch blending
        mixup=0.15,       # Multi-path reverberation simulation
        save=True,
        project="runs_unified",
        name="yolo11_seg_full",
        exist_ok=True
    )

    print("\nEvaluating Master Model on Unified Validation Set...")
    metrics = model.val()
    print("-" * 55)
    if hasattr(metrics, 'seg') and metrics.seg is not None:
        print(f"  mAP@50 (Mask)   : {metrics.seg.map50:.4f}")
        print(f"  mAP@50-95 (Mask): {metrics.seg.map:.4f}")
    if hasattr(metrics, 'box') and metrics.box is not None:
        print(f"  mAP@50 (Box)    : {metrics.box.map50:.4f}")
        print(f"  mAP@50-95 (Box) : {metrics.box.map:.4f}")
    print("-" * 55)

    # Save trained weights
    weights_dir = ROOT / "weights"
    weights_dir.mkdir(exist_ok=True)
    trained_best = ROOT / "runs_unified" / "yolo11_seg_full" / "weights" / "best.pt"

    if trained_best.exists():
        shutil.copy(trained_best, weights_dir / "yolo11_seg_best.pt")
        print(f"\n[SUCCESS] Fine-tuned master weights updated successfully:")
        print(f"  -> {weights_dir / 'yolo11_seg_best.pt'}")
    else:
        last_pt = ROOT / "runs_unified" / "yolo11_seg_full" / "weights" / "last.pt"
        if last_pt.exists():
            shutil.copy(last_pt, weights_dir / "yolo11_seg_best.pt")
            print(f"\n[SUCCESS] Master weights (last.pt) updated successfully.")

    return results

if __name__ == "__main__":
    data_yaml = setup_unified_dataset(num_synthetic=200)
    train_full_model(data_yaml, epochs=25, batch=4, imgsz=640)
