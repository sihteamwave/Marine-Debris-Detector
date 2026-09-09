import os
import sys
import json
import cv2
import torch
import numpy as np
from pathlib import Path
from ultralytics import YOLO

print("=" * 80)
print("SIH26057 SONAR MODEL DIAGNOSTIC PROTOCOL — STEP 1 TO 13")
print("=" * 80)

ROOT = Path(r"C:\Users\Mantra\OneDrive\Desktop\SIH PROTOTYPE")
DIAG_OUT = ROOT / "diagnostic_output"
DIAG_OUT.mkdir(exist_ok=True)

# ----------------------------------------------------
# STEP 1: VERIFY THE TRAINED MODELS
# ----------------------------------------------------
print("\n" + "=" * 50)
print("STEP 1: VERIFYING TRAINED MODELS (.pt files)")
print("=" * 50)

models_to_check = [
    ("YOLO11-Seg", ROOT / "yolo11n-seg.pt"),
    ("YOLO11-OBB", ROOT / "yolo11n-obb.pt")
]

step1_results = {}

for name, p in models_to_check:
    print(f"\n--- Checking {name} ---")
    if not p.exists():
        print(f"ERROR: File not found at {p}")
        continue
    
    size_mb = p.stat().st_size / (1024 * 1024)
    print(f"Model Path       : {p}")
    print(f"File Size        : {size_mb:.2f} MB")
    
    try:
        # Load via PyTorch inspect
        ckpt = torch.load(str(p), map_location="cpu", weights_only=False)
        train_args = ckpt.get("train_args", {})
        task = ckpt.get("task", "unknown")
        epoch = ckpt.get("epoch", "unknown")
        date = ckpt.get("date", "unknown")
        
        # Load via Ultralytics
        yolo_m = YOLO(str(p))
        num_classes = len(yolo_m.names)
        input_sz = yolo_m.overrides.get("imgsz", 640)
        
        info = {
            "path": str(p),
            "size_mb": round(size_mb, 2),
            "task": task,
            "epoch": epoch,
            "date": str(date),
            "num_classes": num_classes,
            "classes": yolo_m.names,
            "imgsz": input_sz,
            "train_args_data": train_args.get("data", "None"),
            "train_args_model": train_args.get("model", "None"),
        }
        step1_results[name] = info
        
        print(f"Model Type / Task: {task}")
        print(f"Checkpoint Epoch : {epoch}")
        print(f"Training Date    : {date}")
        print(f"Training Dataset : {train_args.get('data', 'N/A (Pretrained)')}")
        print(f"Input Image Size : {input_sz}")
        print(f"Number of Classes: {num_classes}")
        print(f"model.names      : {dict(list(yolo_m.names.items())[:10])}{'...' if num_classes > 10 else ''}")
        
    except Exception as e:
        print(f"Error loading {name}: {e}")

# Save Step 1 json
with open(DIAG_OUT / "step1_model_verification.json", "w") as f:
    json.dump(step1_results, f, indent=2)

print("\nStep 1 Complete.")
