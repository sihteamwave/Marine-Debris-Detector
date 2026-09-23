"""
SIH26057 — Unified CandidateRecord Data Model (Gap 15)
Serves as the central, authoritative schema connecting perceptions, acoustic evidence,
uncertainty, geolocation, environmental context, lineage, and human verification.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone

from backend.models.taxonomy import TargetClassification
from backend.models.metadata_models import SonarMetadata, NavigationMetadata


class BoundingBox(BaseModel):
    """Oriented and axis-aligned geometric parameters."""
    cx: float
    cy: float
    width: float
    height: float
    cx_pct: float
    cy_pct: float
    w_pct: float
    h_pct: float
    left_pct: float
    top_pct: float
    angle_deg: float = 0.0


class SonarEvidence(BaseModel):
    """Detailed acoustic physics supporting evidence."""
    shadow_strength_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    shadow_contrast_deficit_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    shadow_presence: Literal["STRONG", "MODERATE", "WEAK", "ABSENT", "AMBIGUOUS"] = "AMBIGUOUS"
    seabed_context: Literal["CONSISTENT", "AMBIGUOUS", "INCONSISTENT"] = "CONSISTENT"
    shape_consistency: Literal["CONSISTENT", "AMBIGUOUS", "INCONSISTENT"] = "CONSISTENT"
    target_shadow_aligned: bool = Field(default=True, description="True if shadow direction strictly opposes nadir acoustic pulse")
    estimated_debris_height_m: Optional[float] = None
    shadow_length_m: Optional[float] = None
    ground_range_m: Optional[float] = None
    acoustic_evidence_summary: str = ""


class UncertaintyAssessment(BaseModel):
    """Explicit uncertainty quantification and abstention layer (Gap 5)."""
    decision: Literal["ACCEPTED", "REVIEW_REQUIRED", "UNKNOWN"] = "REVIEW_REQUIRED"
    confidence_score: float = Field(default=50.0, ge=0.0, le=100.0)
    reliability_tier: Literal["HIGH", "MODERATE", "LOW", "UNRELIABLE"] = "MODERATE"
    abstention_reasons: List[str] = Field(default_factory=list)
    model_evidence_agreement: bool = True


class GeolocationRecord(BaseModel):
    """Acoustic-geometric position estimate with honest uncertainty (Gap 8)."""
    latitude: float
    longitude: float
    position_status: Literal["EXACT_NOT_CLAIMED", "ESTIMATED", "UNAVAILABLE", "SIMULATED_REPLAY"] = "ESTIMATED"
    uncertainty_radius_m: Optional[float] = None
    uncertainty_display: str = "Position uncertainty unavailable"
    calculation_method: str = "SLANT_TO_GROUND_RANGE_REPLAY"
    telemetry_provenance: str = "SIMULATED / REPLAYED TELEMETRY"


class EcologicalRiskAssessment(BaseModel):
    """Deterministic ecological risk quantification (Gap 4)."""
    risk_score: Optional[float] = None
    risk_level: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"] = "UNKNOWN"
    status: Literal["ESTIMATED", "PROTOTYPE_ASSESSMENT", "INSUFFICIENT_EVIDENCE", "UNAVAILABLE"] = "PROTOTYPE_ASSESSMENT"
    component_scores: Dict[str, float] = Field(default_factory=dict)
    rationale: str = "Prototype assessment — requires domain validation"


class OperationalPriorityAssessment(BaseModel):
    """Deterministic field action and removal prioritization (Gap 4)."""
    priority_level: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "REVIEW"] = "REVIEW"
    priority_score: Optional[float] = None
    component_weights: Dict[str, float] = Field(default_factory=dict)
    rationale: str = "Queued for expert inspection"


class RAGContext(BaseModel):
    """Authoritative scientific and domain context (Gaps 12 & 13)."""
    relevant_knowledge_found: bool = False
    scientific_summary: str = "No authoritative scientific context retrieved"
    potential_hazards: List[str] = Field(default_factory=list)
    material_degradation_profile: str = "Unknown"
    recommended_mitigation: str = "Visual / acoustic re-survey before physical disturbance"
    authoritative_sources: List[Dict[str, str]] = Field(default_factory=list)
    retrieval_status: Literal["LOCAL_KNOWLEDGE", "LIVE_EXTERNAL_DATA", "NO_DATA", "INSUFFICIENT_EVIDENCE"] = "NO_DATA"


class ModelLineage(BaseModel):
    """Auditable data and model provenance (Gap 15)."""
    model_name: str = "YOLO11-Seg (Ultralytics)"
    model_version: str = "yolo11n-seg-v1.0"
    model_weights_hash: str = "coco-base-6.18mb"
    dataset_version: str = "sih26057-v1.0"
    preprocessing_version: str = "clahe-norm-median-v2"
    sahi_active: bool = False
    sahi_slice_resolution: Optional[str] = None
    inference_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CandidateRecord(BaseModel):
    """
    Master candidate record connecting all system stages.
    """
    candidate_id: str = Field(description="Unique observation identifier, e.g., CAN-20260917-001")
    persistent_target_id: str = Field(description="Persistent target ID associated across multiple pings/swaths")
    mission_id: str = Field(default="MISSION-SIH26057-DEFAULT")
    survey_id: str = Field(default="SURVEY-INDIAN-OCEAN-01")
    sonar_file: str
    frame_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    
    # Classification & Perceptual Output
    classification: TargetClassification
    confidence: float = Field(default=50.0, description="Model confidence in %")
    
    # Masks & Geometry (Separated Target vs Shadow, Gap 9)
    target_mask: List[List[float]] = Field(default_factory=list, description="Polygon vertices in pixel coordinates [[x,y],...]")
    target_mask_pct: List[List[float]] = Field(default_factory=list, description="Polygon vertices in normalized percentage [[x,y],...]")
    shadow_mask: Optional[List[List[float]]] = Field(default=None, description="Acoustic shadow candidate vertices in pixels")
    shadow_mask_pct: Optional[List[List[float]]] = Field(default=None, description="Acoustic shadow candidate vertices in percentage")
    bounding_box: BoundingBox
    
    # Evidence, Uncertainty & Geolocation
    sonar_evidence: SonarEvidence
    uncertainty: UncertaintyAssessment
    geolocation: GeolocationRecord
    
    # Downstream Context & Actionability
    ecological_risk: EcologicalRiskAssessment
    operational_priority: OperationalPriorityAssessment
    rag_context: Optional[RAGContext] = None
    
    # Sensor Metadata Reference
    sonar_metadata: Optional[SonarMetadata] = None
    navigation_metadata: Optional[NavigationMetadata] = None
    
    # Lineage, Review & Workflow
    lineage: ModelLineage
    review_status: Literal["PENDING", "CONFIRMED", "REJECTED", "UNKNOWN"] = "PENDING"
    reviewer_note: Optional[str] = None
    resurvey_recommended: bool = False
    resurvey_reason: Optional[str] = None

    def to_legacy_dict(self) -> Dict[str, Any]:
        """
        Maintains complete backward compatibility with existing frontend expectations.
        """
        poly_pct = self.target_mask_pct or []
        poly_px = self.target_mask or []
        bbox = self.bounding_box
        
        return {
            "id": self.candidate_id,
            "target_id": self.persistent_target_id,
            "class": self.classification.tier3_specific,
            "class_type": self.classification.tier1_domain.value,
            "confidence": int(round(self.confidence)),
            "model": self.lineage.model_name,
            "sonar_evidence": self.sonar_evidence.shadow_presence.capitalize(),
            "shadowStrength": int(round(self.sonar_evidence.shadow_strength_pct)),
            "anthropogenic_likelihood": int(round(self.uncertainty.confidence_score)),
            "ecological_risk": self.ecological_risk.risk_level.capitalize(),
            "removal_priority": self.operational_priority.priority_level.capitalize(),
            "uncertainty_decision": self.uncertainty.decision,
            "reliability": self.uncertainty.reliability_tier.capitalize(),
            "status": self.review_status.capitalize(),
            "position": {
                "lat": f"{self.geolocation.latitude:.4f}° N",
                "lon": f"{self.geolocation.longitude:.4f}° E"
            },
            "location_status": self.geolocation.position_status,
            "location_note": self.geolocation.uncertainty_display,
            "heading": f"{int(self.bounding_box.angle_deg) % 360}°",
            "depth": f"{self.navigation_metadata.depth_m if self.navigation_metadata else 112} m",
            "speed": f"{self.navigation_metadata.speed_knots if self.navigation_metadata else 3.2} knots",
            "shadowNote": self.sonar_evidence.acoustic_evidence_summary,
            "telemetry_calibrated": not (self.navigation_metadata and self.navigation_metadata.is_simulated),
            "telemetry_source": self.geolocation.telemetry_provenance,
            "segmentation_mask_pct": poly_pct,
            "segmentation_mask": poly_px,
            "target_mask_pct": self.target_mask_pct,
            "shadow_mask_pct": self.shadow_mask_pct,
            "sahi_active": self.lineage.sahi_active,
            "resurvey_recommended": self.resurvey_recommended,
            "rag_summary": self.rag_context.scientific_summary if self.rag_context else None,
            "rag_sources": self.rag_context.authoritative_sources if self.rag_context else [],
            "uncertainty_assessment": self.uncertainty.model_dump(),
            "ecological_risk_assessment": self.ecological_risk.model_dump(),
            "operational_priority_assessment": self.operational_priority.model_dump(),
            "rag_context_details": self.rag_context.model_dump() if self.rag_context else None,
            "sonar_evidence_details": self.sonar_evidence.model_dump(),
            "geolocation_details": self.geolocation.model_dump(),
            "obb": {
                "cx": bbox.cx,
                "cy": bbox.cy,
                "width": bbox.width,
                "height": bbox.height,
                "cx_pct": bbox.cx_pct,
                "cy_pct": bbox.cy_pct,
                "w_pct": bbox.w_pct,
                "h_pct": bbox.h_pct,
                "left_pct": bbox.left_pct,
                "top_pct": bbox.top_pct,
                "angle_deg": bbox.angle_deg,
                "polygon": poly_px,
                "polygon_pct": poly_pct
            }
        }
