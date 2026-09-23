# -*- coding: utf-8 -*-
"""
SIH26057 - Sonar Detection Pipeline Validation Script
Runs the v2 physics engine on all images in data/sonar/ and prints a
human-readable regression report.

Usage:
    python diagnostic_output/validate_pipeline.py
"""
import os
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

import sys
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

import cv2
import numpy as np

# Load the physics engine
try:
    from backend.yolo_seg_detector import run_multi_model_analysis
except ImportError:
    from yolo_seg_detector import run_multi_model_analysis

SONAR_DIR = ROOT / "data" / "sonar"

# Benchmark expected minimum detection counts
EXPECTED = {
    "clear_debris":    3,
    "weak_candidate":  3,
    "unknown_anomaly": 3,
}

SEP = "-" * 72


def validate():
    images = sorted(
        list(SONAR_DIR.glob("*.jpg")) +
        list(SONAR_DIR.glob("*.jpeg")) +
        list(SONAR_DIR.glob("*.png"))
    )

    if not images:
        print(f"[ERROR] No images found in {SONAR_DIR}")
        sys.exit(1)

    print(SEP)
    print(f"  SIH26057 Sonar Detection Validation  |  Engine: v2")
    print(f"  Images found: {len(images)}")
    print(SEP)

    all_results = []
    all_pass = True

    for img_path in images:
        img = cv2.imread(str(img_path))
        if img is None:
            print(f"  [SKIP] {img_path.name} — could not read")
            continue

        h, w = img.shape[:2]
        try:
            result = run_multi_model_analysis(img, filename_hint=img_path.name)
        except Exception as exc:
            print(f"  [ERROR] {img_path.name} — {exc}")
            all_pass = False
            continue

        dets  = result.get("detections", [])
        mode  = result.get("mode", "")
        tiled = result.get("tiled_inference", False)

        stem = img_path.stem.lower()
        expected_n = next((v for k, v in EXPECTED.items() if k in stem), None)
        passed = (expected_n is None) or (len(dets) >= expected_n)
        if not passed:
            all_pass = False

        status_icon = "[PASS]" if passed else "[FAIL]"
        print(f"\n  {status_icon}  {img_path.name}  [{w}x{h}]"
              + ("  [TILED]" if tiled else ""))
        print(f"    Mode         : {mode}")
        print(f"    Detections   : {len(dets)}" +
              (f"  (expected >= {expected_n})" if expected_n else ""))

        for i, det in enumerate(dets):
            cls    = det.get("class", "?")
            conf   = det.get("confidence", 0)
            shadow = det.get("shadowStrength", 0)
            ev     = det.get("sonar_evidence", "?")
            poly_n = len(det.get("segmentation_mask_pct", []))
            print(f"      #{i+1:02d}  {cls:<42}  conf={conf}%  shadow={shadow}%"
                  f"  evidence={ev}  poly_pts={poly_n}")

        if expected_n and len(dets) < expected_n:
            print(f"    [WARN] Only {len(dets)}/{expected_n} detections -- "
                  "check threshold / min-area settings")

        all_results.append({
            "file":             img_path.name,
            "resolution":       f"{w}x{h}",
            "mode":             mode,
            "tiled":            tiled,
            "detections_count": len(dets),
            "expected_count":   expected_n,
            "benchmark_pass":   passed,
            "classes":          [d.get("class") for d in dets],
            "confidences":      [d.get("confidence") for d in dets],
            "shadow_scores":    [d.get("shadowStrength") for d in dets],
        })

    print(f"\n{SEP}")
    overall = "[PASS] ALL BENCHMARKS PASS" if all_pass else "[FAIL] SOME BENCHMARKS FAILED"
    print(f"  {overall}  |  {len(all_results)} images processed")
    print(SEP)

    # Write JSON summary
    out_path = ROOT / "diagnostic_output" / "validation_results.json"
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w") as f:
        json.dump({
            "engine_version":      "v2",
            "all_benchmarks_pass": all_pass,
            "images_tested":       len(all_results),
            "results":             all_results
        }, f, indent=2)
    print(f"  JSON report written -> {out_path}")
    print(SEP)

    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(validate())
