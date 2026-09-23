"""
SIH26057 — SAMUDRA-SURAKSHA
JEV (Judge-Evaluator-Verifier) Decision-Triage Adapter
Master Engineering Specification v2 — Section 14 & 18

Role:
- Review-effort allocation and human attention triage across large acoustic survey swaths.
- Operates strictly behind an adapter interface.
- DOES NOT replace marine-expert or hydrographer authority.
- DOES NOT output final target acceptance/rejection (strictly human-reserved).
- Respects strict Sovereign Cloud Boundary: Consumes only structured CandidateRecord metadata;
  RAW SONAR IMAGERY NEVER TRANSMITTED TO CLOUD.
- 100% Offline-First: If remote JEV service is unavailable or disabled, the local deterministic
  rule engine executes the triage evaluation without disruption.
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class JEVBoundedAnswers(BaseModel):
    requires_expert_review: bool = Field(
        ..., description="Does this candidate require senior hydrographic certifier review?"
    )
    evidence_sufficient: bool = Field(
        ..., description="Is available acoustic and metadata evidence sufficient for a reviewable decision?"
    )
    escalate_early_attention: bool = Field(
        ..., description="Should it be escalated immediately for early attention (e.g. HAZNAV in fairway)?"
    )
    orthogonal_resurvey_needed: bool = Field(
        ..., description="Is an additional orthogonal acoustic pass needed to resolve ambiguity?"
    )
    prefer_unknown_classification: bool = Field(
        ..., description="Should UNKNOWN be preferred over forcing an unverified specific class?"
    )
    triage_rationale: List[str] = Field(
        default_factory=list, description="Audit-traceable explanation for triage conclusions."
    )


class JEVTriageReport(BaseModel):
    candidate_id: str
    triage_tier: str = Field(
        ..., description="Triage priority: URGENT_ESCALATION | STANDARD_REVIEW | LOW_PRIORITY | ABSTAIN_RESURVEY"
    )
    confidence_calibration_score: float = Field(
        ..., description="Calibrated confidence score considering acoustic shadow and SNR (0-100)"
    )
    bounded_answers: JEVBoundedAnswers
    suggested_reviewer_role: str = Field(
        ..., description="Recommended human authority: SENIOR_HYDROGRAPHER | FIELD_OPERATOR | ENVIRONMENTAL_SPECIALIST"
    )
    local_fallback_active: bool = Field(
        default=True, description="True if evaluated via local deterministic rule fallback."
    )
    sovereign_boundary_guaranteed: bool = Field(
        default=True, description="Confirms zero raw sonar imagery leaves the local workstation."
    )
    evaluation_timestamp: str = Field(..., description="ISO 8601 evaluation timestamp.")


class JEVTriageAdapter:
    """
    Decoupled adapter providing structured decision-triage evaluation for CandidateRecords.
    """

    def __init__(self, enable_remote_service: bool = False, remote_endpoint: Optional[str] = None):
        self.enable_remote_service = enable_remote_service
        self.remote_endpoint = remote_endpoint

    def evaluate_candidate(self, candidate_dict: Dict[str, Any]) -> JEVTriageReport:
        """
        Executes bounded triage evaluation on a standardized CandidateRecord dict.
        Consumes ONLY structured numerical and categorical metadata.
        """
        import datetime
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Extract structured metadata (Never raw pixel imagery)
        cid = candidate_dict.get("id") or candidate_dict.get("candidate_id", "CAN-UNKNOWN")
        confidence = float(candidate_dict.get("confidence", 50.0))
        shadow_strength = float(candidate_dict.get("shadowStrength", candidate_dict.get("shadow_strength", 50.0)))
        
        # Check depth and height
        depth_val = 50.0
        depth_str = str(candidate_dict.get("depth", "50 m")).replace("m", "").strip()
        try:
            depth_val = float(depth_str)
        except ValueError:
            pass

        # Check estimated height
        height_m = 2.0
        dims = candidate_dict.get("dimensions", {})
        h_str = str(dims.get("height", "2.0 m")).replace("m", "").strip()
        try:
            height_m = float(h_str)
        except ValueError:
            pass

        ukc = max(0.0, depth_val - height_m)

        # Check uncertainty decision
        uncert = candidate_dict.get("uncertainty_decision", "ACCEPTED")
        qa_state = candidate_dict.get("qa_assessment", {}).get("status", "VALID")
        risk_level = candidate_dict.get("ecological_risk", "Moderate")

        # ─── Bounded Questions Evaluation (Deterministic Local Fallback) ──────
        rationale: List[str] = []

        # Question 1: Escalate early attention?
        # Critical if Under-Keel Clearance < 15.0m (navigational channel hazard) or CRITICAL ecological risk
        is_haznav = ukc < 15.0 and depth_val < 35.0
        escalate = is_haznav or (risk_level == "Critical")
        if is_haznav:
            rationale.append(f"Shallow navigational clearance: UKC={ukc:.1f}m (<15m statutory fairway limit).")
        if risk_level == "Critical":
            rationale.append("Ecological risk assessment flagged as Critical.")

        # Question 2: Evidence sufficient?
        evidence_suff = (qa_state in ["VALID", "WARNING"]) and (shadow_strength >= 30.0 or confidence >= 80.0)
        if not evidence_suff:
            rationale.append("Acoustic shadow deficit or degraded sonar QA — evidence requires corroboration.")

        # Question 3: Prefer Unknown classification?
        # If model is uncertain or shadow is missing where geometry demands it
        prefer_unk = (confidence < 60.0 and shadow_strength < 40.0) or (uncert == "UNKNOWN")
        if prefer_unk:
            rationale.append("Ambiguous acoustic signature — avoid forced anthropogenic assignment.")

        # Question 4: Orthogonal re-survey needed?
        resurvey = (shadow_strength < 35.0 and confidence >= 65.0) or (qa_state == "LOW_QUALITY")
        if resurvey:
            rationale.append("Contradictory backscatter vs shadow ratio; orthogonal swath pass recommended.")

        # Question 5: Requires expert review?
        # Always requires review if escalating, or if evidence is borderline
        requires_expert = escalate or (not evidence_suff) or (uncert == "REVIEW_REQUIRED")
        if requires_expert:
            rationale.append("Routing to Senior Hydrographic Certifier for formal verification.")

        # Assign Triage Tier
        if escalate:
            triage_tier = "URGENT_ESCALATION"
            rec_role = "HARBOR_MASTER / SENIOR_HYDROGRAPHER"
        elif resurvey:
            triage_tier = "ABSTAIN_RESURVEY"
            rec_role = "AUV_SORTIE_OPERATOR"
        elif requires_expert:
            triage_tier = "STANDARD_REVIEW"
            rec_role = "SENIOR_HYDROGRAPHER"
        else:
            triage_tier = "LOW_PRIORITY"
            rec_role = "FIELD_HYDROGRAPHER"

        # Calibrated score (Penalize shadow absence)
        calibrated_score = round(confidence * 0.6 + shadow_strength * 0.4, 1)

        bounded = JEVBoundedAnswers(
            requires_expert_review=requires_expert,
            evidence_sufficient=evidence_suff,
            escalate_early_attention=escalate,
            orthogonal_resurvey_needed=resurvey,
            prefer_unknown_classification=prefer_unk,
            triage_rationale=rationale,
        )

        return JEVTriageReport(
            candidate_id=cid,
            triage_tier=triage_tier,
            confidence_calibration_score=calibrated_score,
            bounded_answers=bounded,
            suggested_reviewer_role=rec_role,
            local_fallback_active=True,
            sovereign_boundary_guaranteed=True,
            evaluation_timestamp=now_iso,
        )
