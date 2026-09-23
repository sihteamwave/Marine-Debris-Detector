"""
SIH26057 YOLO11-Seg Marine Debris Instance Segmentation Training Script
Fine-tunes YOLO11 Instance Segmentation model (yolo11n-seg.pt) on the marine
debris side-scan sonar dataset.

Features:
  - Instance segmentation masks capturing exact debris contours and shapes.
  - Acoustic-specific data augmentation (horizontal swath reflection, mosaic, mixup).
  - Preserves time-of-flight acoustic geometry (flipud=0.0).
  - Validation metrics evaluated for bounding box (mAP50-95) and mask (mAP50-95).
"""

import sys
import argparse
from pathlib import Path

def train_sih26057_seg_model(
    data_yaml: str = "dataset_sih26057/dataset.yaml",
    base_weights: str = "yolo11n-seg.pt",
    epochs: int = 50,
    imgsz: int = 1024,
    batch: int = 4,
    device: str = "cpu"
):
    """
    Executes training using Ultralytics YOLO11-Seg engine.
    """
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Ultralytics not installed. Run: pip install ultralytics")
        sys.exit(1)

    print("=" * 70)
    print("  SIH26057 — YOLO11-SEG MARINE DEBRIS TRAINING PIPELINE")
    print("=" * 70)
    print(f"Base Weights : {base_weights}")
    print(f"Dataset YAML : {data_yaml}")
    print(f"Epochs       : {epochs}")
    print(f"Image Size   : {imgsz}px")
    print(f"Batch Size   : {batch}")
    print(f"Device       : {device}")
    print("-" * 70)

    # 1. Initialize YOLO11-Seg model
    weights_path = Path(base_weights)
    if not weights_path.exists():
        parent_weights = Path("..") / base_weights
        if parent_weights.exists():
            weights_path = parent_weights

    print(f"Loading pretrained segmentation weights: {weights_path.resolve()}")
    model = YOLO(str(weights_path))

    # 2. Train with side-scan sonar hyperparameter configuration
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        task="segment",
        # Sonar-specific augmentations:
        degrees=180.0,       # Full 360 rotation invariance on seafloor
        fliplr=0.5,          # Port/starboard swath horizontal reflection
        flipud=0.0,          # Disable vertical flip (preserves acoustic time-of-flight direction)
        mosaic=1.0,          # Combines multiple acoustic patches
        mixup=0.15,          # Simulates acoustic multipath reverberation
        perspective=0.0005,  # Flat seabed perspective
        # Optimization:
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        weight_decay=0.0005,
        save=True,
        project="runs_seg",
        name="yolo11_seg_debris",
        exist_ok=True
    )

    print("\n" + "=" * 70)
    print("TRAINING COMPLETE! Evaluating validation metrics...")
    metrics = model.val()
    if hasattr(metrics, 'seg') and metrics.seg is not None:
        print(f"mAP@50 (Mask)    : {metrics.seg.map50:.4f}")
        print(f"mAP@50-95 (Mask) : {metrics.seg.map:.4f}")
    if hasattr(metrics, 'box') and metrics.box is not None:
        print(f"mAP@50 (Box)     : {metrics.box.map50:.4f}")
        print(f"mAP@50-95 (Box)  : {metrics.box.map:.4f}")
    print("Best weights saved to: runs_seg/yolo11_seg_debris/weights/best.pt")
    print("=" * 70)

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLO11-Seg for Marine Debris")
    parser.add_argument("--data", default="dataset_sih26057/dataset.yaml", help="Path to dataset.yaml")
    parser.add_argument("--weights", default="yolo11n-seg.pt", help="Pretrained weights")
    parser.add_argument("--epochs", type=int, default=30, help="Training epochs")
    parser.add_argument("--imgsz", type=int, default=1024, help="Image size")
    parser.add_argument("--batch", type=int, default=4, help="Batch size")
    parser.add_argument("--device", default="cpu", help="CUDA device or cpu")
    args = parser.parse_args()

    train_sih26057_seg_model(
        data_yaml=args.data,
        base_weights=args.weights,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device
    )
