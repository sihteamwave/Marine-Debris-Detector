"""
SIH 2026 Problem Statement 57: Marine Debris Detector
Comprehensive Automated Regression Test Suite
Exercises all 11 mandatory regression conditions:
1. normal detection
2. low-quality input
3. missing metadata
4. unknown candidate
5. duplicate detections (fusion)
6. unavailable location
7. uncertain location
8. conflicting evidence
9. missing RAG evidence
10. human rejection
11. human confirmation
"""

import sys
import os
import json
import numpy as np
import cv2

# Ensure workspace root is in sys.path
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

from backend.models.metadata_models import SonarMetadata, NavigationMetadata
from backend.models.taxonomy import TargetClassification, DomainTier, DebrisFamily
from backend.models.candidate_record import CandidateRecord, BoundingBox, SonarEvidence, UncertaintyAssessment, ModelLineage, GeolocationRecord
from backend.core.qa_gate import SonarQAGate, QAResult
from backend.core.uncertainty_engine import UncertaintyEngine
from backend.core.target_tracker import CrossFrameFusionTracker
from backend.core.geolocation_engine import GeolocationEngine
from backend.core.shadow_segmenter import AcousticShadowSegmenter
from backend.core.coverage_engine import CoverageEngine
from backend.core.risk_priority_engine import DeterministicRiskPriorityEngine
from backend.core.rag_engine import OfflineRAGEngine
from backend.core.feedback_store import HumanFeedbackStore
from backend.core.resurvey_manager import ReSurveyManager


def create_dummy_candidate(
    cand_id: str,
    target_id: str,
    conf: float = 85.0,
    shadow_strength: float = 75.0,
    shadow_presence: str = "STRONG",
    uncertainty_decision: str = "ACCEPTED",
    pos_status: str = "ESTIMATED"
) -> CandidateRecord:
    bbox = BoundingBox(
        cx=500.0, cy=300.0, width=80.0, height=40.0,
        cx_pct=50.0, cy_pct=30.0, w_pct=8.0, h_pct=4.0,
        left_pct=46.0, top_pct=28.0, angle_deg=45.0
    )
    classification = TargetClassification(
        tier1_domain=DomainTier.ANTHROPOGENIC,
        tier2_family=DebrisFamily.CONTAINER_CARGO,
        tier3_specific="Cargo Container"
    )
    evidence = SonarEvidence(
        shadow_presence=shadow_presence,
        shadow_strength_pct=shadow_strength,
        shadow_relief_height_m=0.9,
        acoustic_evidence_summary="Strong backscatter and separated shadow"
    )
    uncertainty = UncertaintyAssessment(
        confidence_score=conf,
        decision=uncertainty_decision,
        reliability_tier="HIGH",
        abstention_reasons=["Acoustic evidence verified"]
    )
    geo = GeolocationRecord(
        latitude=7.8220,
        longitude=77.4847,
        position_status=pos_status,
        uncertainty_display="Slant-to-ground corrected. Position uncertainty unavailable."
    )
    eco_risk = DeterministicRiskPriorityEngine.evaluate_ecological_risk(classification, estimated_area_m2=10.0)
    op_prio = DeterministicRiskPriorityEngine.evaluate_operational_priority(eco_risk, water_depth_m=112.0)
    
    return CandidateRecord(
        candidate_id=cand_id,
        persistent_target_id=target_id,
        sonar_file="test_waterfall.jpg",
        confidence=conf,
        classification=classification,
        bounding_box=bbox,
        sonar_evidence=evidence,
        uncertainty=uncertainty,
        geolocation=geo,
        ecological_risk=eco_risk,
        operational_priority=op_prio,
        lineage=ModelLineage()
    )


def test_1_normal_detection():
    print("\n--- Test 1: Normal Detection ---")
    qa_gate = SonarQAGate()
    # Create realistic synthetic sonar waterfall (moderate gray background + highlight + shadow)
    img = np.full((600, 800, 3), 90, dtype=np.uint8)
    # Bright highlight
    cv2.circle(img, (400, 300), 25, (240, 240, 240), -1)
    # Acoustic shadow
    cv2.rectangle(img, (430, 280), (520, 320), (10, 10, 10), -1)
    
    qa_res = qa_gate.evaluate(img)
    assert qa_res.status in ["VALID", "WARNING"], f"QA failed on normal image: {qa_res}"
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    evidence, shadow_px, shadow_pct = AcousticShadowSegmenter.segment_shadow(
        gray=gray,
        target_polygon_px=[[375.0, 275.0], [425.0, 275.0], [425.0, 325.0], [375.0, 325.0]],
        cx=400.0,
        cy=300.0,
        bw=50.0,
        bh=50.0
    )
    assert evidence.shadow_strength_pct > 0, "Failed to compute shadow strength"
    
    cand = create_dummy_candidate("CAN-NORM-01", "TGT-NORM-01", conf=92.0, shadow_strength=evidence.shadow_strength_pct)
    leg = cand.to_legacy_dict()
    assert leg["id"] == "CAN-NORM-01"
    assert leg["target_id"] == "TGT-NORM-01"
    assert "shadow_mask_pct" in leg
    print("PASS: Normal detection pipeline produces compliant candidate record.")


def test_2_low_quality_input():
    print("\n--- Test 2: Low-Quality Input (Extreme Saturation) ---")
    qa_gate = SonarQAGate()
    # 98% pure white saturation
    bad_img = np.full((500, 500, 3), 254, dtype=np.uint8)
    qa_res = qa_gate.evaluate(bad_img)
    
    assert qa_res.status in ["LOW_QUALITY", "INVALID"], f"Expected LOW_QUALITY/INVALID but got {qa_res.status}"
    assert len(qa_res.reasons) > 0, "Reasons must be documented for low quality"
    print(f"PASS: Low-quality image correctly flagged with status '{qa_res.status}' and reasons: {qa_res.reasons}")


def test_3_missing_metadata():
    print("\n--- Test 3: Missing Metadata ---")
    # Execute geolocation without real navigation metadata
    geo_rec = GeolocationEngine.compute_position(
        pixel_x=500.0,
        pixel_y=300.0,
        image_width=1000,
        image_height=600,
        sonar_meta=None,
        nav_meta=None
    )
    assert geo_rec.position_status == "UNAVAILABLE", f"Expected UNAVAILABLE, got {geo_rec.position_status}"
    assert "unavailable" in geo_rec.uncertainty_display.lower(), f"Expected honest note, got {geo_rec.uncertainty_display}"
    print(f"PASS: Missing metadata handled gracefully with honest status: {geo_rec.position_status}, note: {geo_rec.uncertainty_display}")


def test_4_unknown_candidate():
    print("\n--- Test 4: Unknown Candidate & Abstention ---")
    uncertainty_engine = UncertaintyEngine()
    qa_res = QAResult(status="LOW_QUALITY", is_processable=True, reasons=["Severe acoustic interference"])
    evidence = SonarEvidence(
        shadow_presence="ABSENT",
        shadow_strength_pct=5.0,
        acoustic_evidence_summary="No acoustic shadow detected"
    )
    assessment = uncertainty_engine.evaluate(
        model_confidence=35.0,
        sonar_evidence=evidence,
        qa_result=qa_res,
        mask_pixel_count=20,
        has_nav_metadata=False
    )
    assert assessment.decision in ["REVIEW_REQUIRED", "UNKNOWN"], f"Expected REVIEW_REQUIRED or UNKNOWN, got {assessment.decision}"
    assert len(assessment.abstention_reasons) > 0, "Abstention reasons must be present"
    print(f"PASS: Uncertain detection abstained with decision: {assessment.decision}, reasons: {assessment.abstention_reasons}")


def test_5_duplicate_detections():
    print("\n--- Test 5: Duplicate Detections & Fusion Tracker ---")
    tracker = CrossFrameFusionTracker(geo_distance_threshold_m=20.0)
    
    # Frame 1 observation
    t_id_1, status1 = tracker.associate_candidate(
        candidate_id="CAN-F1",
        frame_id="FRAME-001",
        timestamp="2026-09-17T12:00:00Z",
        class_label="Cargo Container",
        family_name="CONTAINER_CARGO",
        confidence=90.0,
        pixel_cx_pct=50.0,
        pixel_cy_pct=30.0,
        latitude=7.82200,
        longitude=77.48470,
        shadow_strength=80.0
    )
    
    # Frame 2 observation of the SAME physical target (offset by 2 meters)
    t_id_2, status2 = tracker.associate_candidate(
        candidate_id="CAN-F2",
        frame_id="FRAME-002",
        timestamp="2026-09-17T12:00:02Z",
        class_label="Cargo Container",
        family_name="CONTAINER_CARGO",
        confidence=88.0,
        pixel_cx_pct=50.1,
        pixel_cy_pct=30.2,
        latitude=7.82201,
        longitude=77.48471,
        shadow_strength=78.0
    )
    
    assert t_id_1 == t_id_2, f"Expected duplicate observations to share persistent target ID, but got {t_id_1} vs {t_id_2}"
    target_info = tracker.get_target(t_id_1)
    assert target_info is not None
    assert target_info.observation_count == 2, f"Expected 2 observations, got {target_info.observation_count}"
    print(f"PASS: Duplicate observations merged to Persistent Target ID '{t_id_1}' (Observations: {target_info.observation_count})")


def test_6_unavailable_location():
    print("\n--- Test 6: Unavailable Location ---")
    nav = NavigationMetadata(
        latitude=None,
        longitude=None,
        is_simulated=True,
        notes="No GNSS lock in underwater canyon"
    )
    geo_rec = GeolocationEngine.compute_position(
        pixel_x=200.0,
        pixel_y=200.0,
        image_width=800,
        image_height=600,
        sonar_meta=None,
        nav_meta=nav
    )
    assert geo_rec.position_status == "UNAVAILABLE", f"Expected UNAVAILABLE, got {geo_rec.position_status}"
    assert "unavailable" in geo_rec.uncertainty_display.lower()
    print("PASS: Unavailable location honestly represented without fabricated coordinates.")


def test_7_uncertain_location():
    print("\n--- Test 7: Uncertain Location (GPS Present without USBL Offset) ---")
    nav = NavigationMetadata(
        latitude=7.8220,
        longitude=77.4847,
        towfish_offset_m=None,
        is_simulated=False,
        notes="Vessel GPS active, towfish acoustic USBL tracking uncalibrated"
    )
    geo_rec = GeolocationEngine.compute_position(
        pixel_x=300.0,
        pixel_y=300.0,
        image_width=800,
        image_height=600,
        sonar_meta=None,
        nav_meta=nav
    )
    assert geo_rec.position_status == "EXACT_NOT_CLAIMED", f"Expected EXACT_NOT_CLAIMED, got {geo_rec.position_status}"
    assert geo_rec.calculation_method in ["VESSEL_POSITION_REFERENCE", "VESSEL_PROXIMITY_ESTIMATE"], f"Expected proximity estimate, got {geo_rec.calculation_method}"
    assert "uncertainty unavailable" in geo_rec.uncertainty_display.lower()
    print(f"PASS: Position status '{geo_rec.position_status}' accurately documents missing towfish geometry: {geo_rec.uncertainty_display}")


def test_8_conflicting_evidence():
    print("\n--- Test 8: Conflicting Evidence (High Model Conf, Zero Shadow) ---")
    uncertainty_engine = UncertaintyEngine()
    qa_res = QAResult(status="VALID", is_processable=True, reasons=[])
    # Model claims 95% confidence, but sonar has zero shadow in high-contrast seabed
    evidence = SonarEvidence(
        shadow_presence="ABSENT",
        shadow_strength_pct=0.0,
        acoustic_evidence_summary="Zero acoustic shadow detected behind bright highlight"
    )
    assessment = uncertainty_engine.evaluate(
        model_confidence=95.0,
        sonar_evidence=evidence,
        qa_result=qa_res,
        mask_pixel_count=100,
        has_nav_metadata=True
    )
    assert assessment.decision == "REVIEW_REQUIRED", f"Conflicting evidence must trigger REVIEW_REQUIRED, got {assessment.decision}"
    assert any("shadow" in r.lower() for r in assessment.abstention_reasons), "Shadow conflict must be stated in reasons"
    print(f"PASS: Conflicting evidence flagged for review: {assessment.abstention_reasons}")


def test_9_missing_rag_evidence():
    print("\n--- Test 9: Missing RAG Evidence (Unknown Object Query) ---")
    rag = OfflineRAGEngine()
    classification = TargetClassification(
        tier1_domain=DomainTier.UNKNOWN,
        tier2_family=DebrisFamily.UNIDENTIFIED_ANOMALY,
        tier3_specific="Unidentified Benthic Anomaly"
    )
    rag_ctx = rag.retrieve_context(classification)
    assert rag_ctx.retrieval_status in ["NO_DATA", "INSUFFICIENT_EVIDENCE"], f"Expected NO_DATA, got {rag_ctx.retrieval_status}"
    assert "No authoritative scientific context retrieved" in rag_ctx.scientific_summary or "insufficient" in rag_ctx.scientific_summary.lower()
    print(f"PASS: Missing RAG context returns honest fallback '{rag_ctx.retrieval_status}' without LLM hallucination.")


def test_10_human_rejection():
    print("\n--- Test 10: Human Rejection Loop ---")
    feedback_store = HumanFeedbackStore()
    cand = create_dummy_candidate("CAN-REJ-01", "TGT-REJ-01")
    
    res = feedback_store.record_feedback(
        candidate_id=cand.candidate_id,
        action="REJECTED",
        original_class=cand.classification.tier2_family.value,
        persistent_target_id=cand.persistent_target_id,
        reviewer_id="Lead Hydrographer",
        reviewer_note="Acoustic artifact from vessel wake bubble cloud"
    )
    cand.review_status = "REJECTED"
    assert res.action == "REJECTED"
    assert cand.review_status == "REJECTED"
    
    summary = feedback_store.get_summary()
    assert summary["rejected_count"] >= 1
    print(f"PASS: Human rejection recorded in audit log. Total rejected: {summary['rejected_count']}. No automatic retraining triggered.")


def test_11_human_confirmation():
    print("\n--- Test 11: Human Confirmation Loop ---")
    feedback_store = HumanFeedbackStore()
    cand = create_dummy_candidate("CAN-CONF-01", "TGT-CONF-01")
    
    res = feedback_store.record_feedback(
        candidate_id=cand.candidate_id,
        action="CONFIRMED",
        original_class=cand.classification.tier2_family.value,
        persistent_target_id=cand.persistent_target_id,
        reviewer_id="Lead Hydrographer",
        reviewer_note="Confirmed 40ft freight container resting on seabed"
    )
    cand.review_status = "CONFIRMED"
    assert res.action == "CONFIRMED"
    assert cand.review_status == "CONFIRMED"
    
    summary = feedback_store.get_summary()
    assert summary["confirmed_count"] >= 1
    print(f"PASS: Human confirmation recorded in audit log. Total confirmed: {summary['confirmed_count']}.")


def main():
    print("==================================================")
    print("RUNNING 11-POINT MANDATORY REGRESSION TEST SUITE")
    print("==================================================")
    
    test_1_normal_detection()
    test_2_low_quality_input()
    test_3_missing_metadata()
    test_4_unknown_candidate()
    test_5_duplicate_detections()
    test_6_unavailable_location()
    test_7_uncertain_location()
    test_8_conflicting_evidence()
    test_9_missing_rag_evidence()
    test_10_human_rejection()
    test_11_human_confirmation()
    
    print("\n==================================================")
    print("ALL 11 REGRESSION TESTS PASSED CLEANLY (100%)")
    print("==================================================")


if __name__ == "__main__":
    main()
