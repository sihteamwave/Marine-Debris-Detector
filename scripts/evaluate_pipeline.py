"""
SIH26057 — Automated Mission-Level Pipeline Evaluation Script (Gap 11)

Evaluates the complete end-to-end pipeline across:
1. Perception (Detection counts, confidence distribution)
2. Reliability & Abstention (QA pass rate, abstention/review rate)
3. Geolocation Usability (Position availability, uncertainty bounding)
4. Operational Workload (Duplicate target suppression via fusion tracker)

Does NOT fabricate scores or synthetic benchmark numbers.
Operates on actual image inputs and real pipeline outputs.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional

# Ensure project root is in python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import cv2
import numpy as np

from backend.core.qa_gate import SonarQAGate, QAStatus
from backend.core.shadow_segmenter import AcousticShadowSegmenter
from backend.core.uncertainty_engine import UncertaintyEngine
from backend.core.geolocation_engine import GeolocationEngine
from backend.core.target_tracker import CrossFrameFusionTracker
from backend.core.coverage_engine import CoverageEngine
from backend.models.metadata_models import SonarMetadata, NavigationMetadata


def run_evaluation(
    image_paths: List[str],
    ground_truth_path: Optional[str] = None,
    output_report_path: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Executes full pipeline evaluation across test images.
    """
    qa_gate = SonarQAGate()
    uncertainty_engine = UncertaintyEngine()
    tracker = CrossFrameFusionTracker()

    total_images = len(image_paths)
    if total_images == 0:
        return {"error": "No images provided for evaluation"}

    print(f"\n=======================================================")
    print(f"SIH26057 PIPELINE EVALUATION — {total_images} TEST IMAGES")
    print(f"=======================================================")

    qa_counts = {"VALID": 0, "WARNING": 0, "LOW_QUALITY": 0, "INVALID": 0}
    decision_counts = {"ACCEPTED": 0, "REVIEW_REQUIRED": 0, "UNKNOWN": 0}
    shadow_presence_counts = {"STRONG": 0, "MODERATE": 0, "WEAK": 0, "ABSENT": 0, "AMBIGUOUS": 0}

    total_raw_detections = 0
    usable_positions_count = 0
    inference_times_ms: List[float] = []

    # Process each image through the real pipeline
    for idx, img_path in enumerate(image_paths, 1):
        filename = Path(img_path).name
        t0 = time.perf_counter()

        img_bgr = cv2.imread(img_path)
        if img_bgr is None:
            qa_counts["INVALID"] += 1
            continue

        h, w = img_bgr.shape[:2]
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # 1. QA Gate Evaluation
        qa_result = qa_gate.evaluate(img_bgr)
        qa_status_str = qa_result.status.value if hasattr(qa_result.status, "value") else str(qa_result.status)
        qa_counts[qa_status_str] += 1

        # 2. Heuristic/Perceptual candidate generation (Top-Hat + Saliency)
        # Using native OpenCV morphology for reproducible baseline
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19))
        tophat = cv2.morphologyEx(enhanced, cv2.MORPH_TOPHAT, kernel)
        _, thresh = cv2.threshold(tophat, int(np.percentile(tophat, 95)), 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        frame_candidates = []
        for c in contours:
            area = cv2.contourArea(c)
            if area < (w * h * 0.0002) or area > (w * h * 0.15):
                continue

            x, y, bw, bh = cv2.boundingRect(c)
            cx, cy = x + bw / 2.0, y + bh / 2.0
            conf = min(95.0, max(45.0, 50.0 + (area / (w * h * 0.001)) * 10.0))

            # Approximate highlight polygon
            poly = [[int(pt[0][0]), int(pt[0][1])] for pt in cv2.approxPolyDP(c, 2.0, True)]

            # 3. Acoustic Shadow Separation (Gap 9)
            sonar_evidence, sh_px, sh_pct = AcousticShadowSegmenter.segment_shadow(
                gray=enhanced,
                target_polygon_px=poly,
                cx=cx,
                cy=cy,
                bw=bw,
                bh=bh,
            )
            shadow_presence_counts[sonar_evidence.shadow_presence] += 1

            # 4. Uncertainty & Abstention (Gap 5)
            uncert = uncertainty_engine.evaluate(
                model_confidence=conf,
                sonar_evidence=sonar_evidence,
                qa_result=qa_result,
                mask_pixel_count=int(area),
            )
            decision_counts[uncert.decision] += 1

            # 5. Geolocation Modeling (Gap 8)
            # Replayed nav metadata
            sim_nav = NavigationMetadata(
                latitude=7.8220 + (idx * 0.0005),
                longitude=77.4847 + (idx * 0.0005),
                heading=45.0,
                is_simulated=True,
            )
            sim_sonar = SonarMetadata(
                sonar_id="SSS-EDGETECH-4200",
                range_meters=50.0,
                altitude_meters=6.0,
                frequency_khz=400.0,
            )
            geo = GeolocationEngine.compute_position(
                pixel_x=cx,
                pixel_y=cy,
                image_width=w,
                image_height=h,
                sonar_meta=sim_sonar,
                nav_meta=sim_nav,
            )
            if geo.position_status in ["ESTIMATED", "SIMULATED_REPLAY"]:
                usable_positions_count += 1

            # 6. Target Fusion Tracker (Gap 6)
            can_id = f"CAN-EVAL-{idx:03d}-{len(frame_candidates)+1:02d}"
            tgt_id, assoc_q = tracker.associate_candidate(
                candidate_id=can_id,
                frame_id=filename,
                timestamp="2026-09-17T12:00:00Z",
                class_label="Possible Debris",
                family_name="UNCLASSIFIED_ANOMALY",
                confidence=conf,
                pixel_cx_pct=(cx / w) * 100.0,
                pixel_cy_pct=(cy / h) * 100.0,
                latitude=geo.latitude,
                longitude=geo.longitude,
                shadow_strength=sonar_evidence.shadow_strength_pct,
            )
            frame_candidates.append(can_id)

        t1 = time.perf_counter()
        inference_times_ms.append((t1 - t0) * 1000.0)
        total_raw_detections += len(frame_candidates)

    tracked_targets = tracker.get_all_targets()
    unique_targets_count = len(tracked_targets)

    duplicate_reduction_pct = 0.0
    if total_raw_detections > 0:
        duplicate_reduction_pct = round(
            (1.0 - (unique_targets_count / float(total_raw_detections))) * 100.0, 1
        )

    usable_position_rate_pct = 0.0
    if total_raw_detections > 0:
        usable_position_rate_pct = round(
            (usable_positions_count / float(total_raw_detections)) * 100.0, 1
        )

    abstention_rate_pct = 0.0
    if total_raw_detections > 0:
        abstention_rate_pct = round(
            ((decision_counts["REVIEW_REQUIRED"] + decision_counts["UNKNOWN"]) / float(total_raw_detections)) * 100.0,
            1,
        )

    mean_latency_ms = round(float(np.mean(inference_times_ms)), 1) if inference_times_ms else 0.0

    report = {
        "evaluation_summary": {
            "total_frames_evaluated": total_images,
            "total_raw_candidates_generated": total_raw_detections,
            "unique_persistent_targets": unique_targets_count,
            "duplicate_reduction_pct": duplicate_reduction_pct,
            "mean_processing_latency_ms_per_frame": mean_latency_ms,
        },
        "perception_metrics": {
            "total_detections": total_raw_detections,
            "mean_detections_per_frame": round(total_raw_detections / max(1, total_images), 2),
            "shadow_presence_distribution": shadow_presence_counts,
        },
        "reliability_and_abstention": {
            "qa_status_breakdown": qa_counts,
            "uncertainty_decisions": decision_counts,
            "system_abstention_rate_pct": abstention_rate_pct,
            "honest_unknown_rate_pct": round(
                (decision_counts["UNKNOWN"] / max(1, total_raw_detections)) * 100.0, 1
            ),
        },
        "geolocation_metrics": {
            "usable_position_rate_pct": usable_position_rate_pct,
            "method": "SONAR_SLANT_TO_GROUND_RANGE (Simulated/Replayed)",
            "precision_claim": "EXACT_NOT_CLAIMED — bounded by slant geometry uncertainty",
        },
        "operational_impact": {
            "raw_review_burden_candidates": total_raw_detections,
            "consolidated_review_burden_targets": unique_targets_count,
            "operator_load_reduction_pct": duplicate_reduction_pct,
        },
    }

    # Print summary table
    print("\n--- RESULTS SUMMARY ---")
    print(f"Frames Evaluated:        {total_images}")
    print(f"Raw Candidates:          {total_raw_detections}")
    print(f"Persistent Targets:      {unique_targets_count} ({duplicate_reduction_pct}% duplicate reduction)")
    print(f"System Abstention Rate:  {abstention_rate_pct}% (Flagged for Review / Unknown)")
    print(f"Mean Pipeline Latency:   {mean_latency_ms} ms/frame")
    print(f"QA Gate Passes:          VALID: {qa_counts['VALID']}, WARNING: {qa_counts['WARNING']}, LOW_QA: {qa_counts['LOW_QUALITY']}, INVALID: {qa_counts['INVALID']}")

    if output_report_path:
        out_p = Path(output_report_path)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        with open(out_p, "w") as f:
            json.dump(report, f, indent=2)
        print(f"\nDetailed report written to: {output_report_path}")

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SIH26057 Mission Pipeline Evaluation")
    parser.add_argument("--image_dir", type=str, default="data/samples", help="Directory of test images")
    parser.add_argument("--output", type=str, default="reports/mission_evaluation_report.json", help="Output JSON report")
    args = parser.parse_args()

    # Find test images
    img_dir = Path(ROOT_DIR) / args.image_dir
    images = []
    if img_dir.exists():
        for ext in ["*.png", "*.jpg", "*.jpeg"]:
            images.extend([str(p) for p in img_dir.glob(ext)])

    # Fallback to diagnostic_output or any test images if sample dir is empty
    if not images:
        fallback_dirs = [
            Path(ROOT_DIR) / "diagnostic_output",
            Path(ROOT_DIR) / "data",
        ]
        for fd in fallback_dirs:
            if fd.exists():
                for ext in ["*.png", "*.jpg"]:
                    images.extend([str(p) for p in fd.glob(ext)])
            if images:
                break

    if images:
        run_evaluation(image_paths=images[:10], output_report_path=args.output)
    else:
        print(f"No test images found in {args.image_dir}. Create sample images first.")
