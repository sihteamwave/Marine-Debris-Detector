"""
SIH26057 YOLO11-OBB Marine Debris Training Script
Fine-tunes YOLO11 Oriented Bounding Box model (yolo11n-obb.pt) on the aggregated
real + synthetic marine debris side-scan sonar dataset.

Features:
  - Acoustic-specific data augmentation (no vertical flipping across waterfall time-axis).
  - Rotated bounding box regression to capture elongated acoustic shadows and diagonal debris.
  - Export to PyTorch, ONNX, and TensorRT formats for real-time edge deployment on AUVs.
"""

import sys
from pathlib import Path

def train_sih26057_model(
    data_yaml: str = "dataset_sih26057/dataset.yaml",
    base_weights: str = "yolo11n-obb.pt",
    epochs: int = 50,
    imgsz: int = 1024,
    batch: int = 8,
    device: str = "0"
):
    """
    Executes training using Ultralytics YOLO11-OBB engine.
    """
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Ultralytics not installed. Run: pip install ultralytics")
        sys.exit(1)

    print("=" * 70)
    print("  SIH26057 — YOLO11-OBB MARINE DEBRIS TRAINING PIPELINE")
    print("=" * 70)
    print(f"Base Weights : {base_weights}")
    print(f"Dataset YAML : {data_yaml}")
    print(f"Epochs       : {epochs}")
    print(f"Image Size   : {imgsz}px")
    print(f"Batch Size   : {batch}")
    print("-" * 70)

    # 1. Initialize YOLO11-OBB model
    weights_path = Path(base_weights)
    if not weights_path.exists():
        # Check parent directory
        parent_weights = Path("..") / base_weights
        if parent_weights.exists():
            weights_path = parent_weights

    print(f"Loading pretrained weights from: {weights_path.resolve()}")
    model = YOLO(str(weights_path))

    # 2. Train with side-scan sonar hyperparameter configuration
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
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
        project="runs_sih26057",
        name="yolo11_obb_debris"
    )

    print("\n" + "=" * 70)
    print("TRAINING COMPLETE! Evaluating validation metrics...")
    metrics = model.val()
    print(f"mAP@50 (OBB)     : {metrics.box.map50:.4f}")
    print(f"mAP@50-95 (OBB)  : {metrics.box.map:.4f}")
    print("Best weights saved to: runs_sih26057/yolo11_obb_debris/weights/best.pt")
    print("=" * 70)

    # 3. Export to ONNX for embedded AUV mission computers
    print("Exporting model to ONNX for edge AUV deployment (NVIDIA Jetson / Intel Orin)...")
    onnx_path = model.export(format="onnx", dynamic=True, simplify=True)
    print(f"ONNX Model saved to: {onnx_path}")
    return results


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train YOLO11-OBB for Marine Debris")
    parser.add_argument("--data", default="dataset_sih26057/dataset.yaml", help="Path to dataset.yaml")
    parser.add_argument("--weights", default="yolo11n-obb.pt", help="Pretrained weights")
    parser.add_argument("--epochs", type=int, default=30, help="Training epochs")
    parser.add_argument("--imgsz", type=int, default=1024, help="Image size")
    parser.add_argument("--batch", type=int, default=4, help="Batch size")
    parser.add_argument("--device", default="cpu", help="CUDA device or cpu")
    args = parser.parse_args()

    train_sih26057_model(
        data_yaml=args.data,
        base_weights=args.weights,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device
    )
