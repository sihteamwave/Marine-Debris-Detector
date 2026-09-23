"""
SIH26057 — Uncertainty and Abstention Engine (Gap 5)

Evaluates candidate reliability using multi-modal acoustic evidence,
segmentation quality, QA gate outputs, and metadata status.

Replaces naive model confidence with an honest calibration and abstention mechanism.
Supports explicit decisions: ACCEPTED, REVIEW_REQUIRED, UNKNOWN.
"""

from typing import List, Dict, Any, Optional, Literal, Tuple
from backend.models.candidate_record import UncertaintyAssessment, SonarEvidence
from backend.core.qa_gate import QAResult, QAStatus


class UncertaintyEngine:
    """
    Multi-criteria uncertainty evaluator for side-scan sonar debris candidates.
    Combines deep learning perceptual cues with sonar physics and image acoustics.
    """

    def __init__(
        self,
        min_accept_confidence: float = 65.0,
        min_shadow_strength_accept: float = 30.0,
        min_mask_pixels: int = 40,
    ):
        self.min_accept_confidence = min_accept_confidence
        self.min_shadow_strength_accept = min_shadow_strength_accept
        self.min_mask_pixels = min_mask_pixels

    def evaluate(
        self,
        model_confidence: float,
        sonar_evidence: SonarEvidence,
        qa_result: Optional[QAResult] = None,
        mask_pixel_count: int = 100,
        has_nav_metadata: bool = True,
        is_simulated_nav: bool = False,
    ) -> UncertaintyAssessment:
        """
        Evaluate candidate evidence and determine whether to ACCEPT, require REVIEW, or mark UNKNOWN.
        """
        abstention_reasons: List[str] = []
        reliability_deductions: float = 0.0

        # 1. Model Confidence Check
        if model_confidence < 40.0:
            abstention_reasons.append(f"Low perceptual model confidence ({model_confidence:.1f}%)")
            reliability_deductions += 35.0
        elif model_confidence < 60.0:
            abstention_reasons.append(f"Moderate model confidence ({model_confidence:.1f}%)")
            reliability_deductions += 15.0

        # 2. Sonar Acoustic Shadow Evidence Check
        # Physical objects protruding from seabed MUST cast acoustic shadows away from nadir.
        if sonar_evidence.shadow_presence == "ABSENT":
            abstention_reasons.append("Absence of acoustic shadow behind high-reflectivity target")
            reliability_deductions += 30.0
        elif sonar_evidence.shadow_presence == "WEAK":
            abstention_reasons.append(f"Weak acoustic shadow strength ({sonar_evidence.shadow_strength_pct:.1f}%)")
            reliability_deductions += 15.0
        elif sonar_evidence.shadow_presence == "AMBIGUOUS":
            abstention_reasons.append("Ambiguous acoustic shadow boundary or low contrast deficit")
            reliability_deductions += 10.0

        if not sonar_evidence.target_shadow_aligned:
            abstention_reasons.append("Acoustic shadow vector misaligned with nadir pulse geometry")
            reliability_deductions += 25.0

        # 3. Segmentation Mask Quality
        if mask_pixel_count < self.min_mask_pixels:
            abstention_reasons.append(f"Minute mask footprint ({mask_pixel_count} px) prone to speckle noise")
            reliability_deductions += 20.0

        # 4. QA Gate Status Check
        if qa_result:
            if qa_result.status == QAStatus.INVALID:
                abstention_reasons.append("Input image QA is INVALID")
                reliability_deductions += 50.0
            elif qa_result.status == QAStatus.LOW_QUALITY:
                abstention_reasons.append(f"Low quality input sonar frame: {', '.join(qa_result.reasons[:2])}")
                reliability_deductions += 25.0
            elif qa_result.status == QAStatus.WARNING:
                reliability_deductions += 5.0

        # 5. Metadata Completeness
        if not has_nav_metadata:
            abstention_reasons.append("Navigation telemetry missing — target ungrounded in world coordinates")
            reliability_deductions += 10.0

        # Calculate calibrated reliability score (0.0 - 100.0)
        base_reliability = model_confidence
        calibrated_score = max(5.0, min(99.0, base_reliability - (reliability_deductions * 0.6)))

        # Determine Reliability Tier
        if calibrated_score >= 75.0 and len(abstention_reasons) == 0:
            reliability_tier: Literal["HIGH", "MODERATE", "LOW", "UNRELIABLE"] = "HIGH"
        elif calibrated_score >= 50.0 and len(abstention_reasons) <= 2:
            reliability_tier = "MODERATE"
        elif calibrated_score >= 30.0:
            reliability_tier = "LOW"
        else:
            reliability_tier = "UNRELIABLE"

        # Check Model-Evidence Agreement
        # If model is very confident (>75%) but shadow is completely absent and contrast is weak,
        # we have a severe model-evidence disagreement!
        model_evidence_agreement = True
        if model_confidence >= 70.0 and sonar_evidence.shadow_presence in ["ABSENT", "WEAK"]:
            model_evidence_agreement = False
            abstention_reasons.append("Severe disagreement between neural detector and acoustic shadow physics")

        # Make Honest Decision
        if qa_result and qa_result.status == QAStatus.INVALID:
            decision: Literal["ACCEPTED", "REVIEW_REQUIRED", "UNKNOWN"] = "UNKNOWN"
        elif calibrated_score < 35.0:
            # When evidence is very low, mark UNKNOWN instead of forcing false classification
            decision = "UNKNOWN"
        elif not model_evidence_agreement or calibrated_score < self.min_accept_confidence or len(abstention_reasons) > 0:
            decision = "REVIEW_REQUIRED"
        else:
            decision = "ACCEPTED"

        return UncertaintyAssessment(
            decision=decision,
            confidence_score=round(calibrated_score, 1),
            reliability_tier=reliability_tier,
            abstention_reasons=abstention_reasons,
            model_evidence_agreement=model_evidence_agreement,
        )
