"""
SIH26057 — Ecological Risk vs Operational Removal Priority Engine (Gap 4)

Decouples environmental consequence (Ecological Risk) from operational field action (Removal Priority).
Uses transparent, deterministic mathematical formulas with auditable component contributions.

Rules:
- No LLM hallucination of scores.
- Missing evidence returns "Risk incomplete — insufficient evidence" rather than guessing.
"""

from typing import Dict, Any, Optional, Tuple, Literal
from pydantic import BaseModel, Field

from backend.models.candidate_record import EcologicalRiskAssessment, OperationalPriorityAssessment
from backend.models.taxonomy import DebrisFamily, TargetClassification, DomainTier


class DeterministicRiskPriorityEngine:
    """
    Deterministic scoring engine for environmental consequence and operational salvage priority.
    """

    # Hazard & Persistence profiles by Debris Family (0 to 100)
    FAMILY_HAZARD_PROFILES: Dict[str, Dict[str, float]] = {
        DebrisFamily.CONTAINER_CARGO.value: {
            "persistence": 85.0,
            "entanglement": 25.0,
            "chemical_toxicity": 60.0,
            "leachate_risk": 70.0,
        },
        DebrisFamily.SUNKEN_VESSEL.value: {
            "persistence": 90.0,
            "entanglement": 45.0,
            "chemical_toxicity": 70.0,
            "leachate_risk": 75.0,
        },
        DebrisFamily.AIRCRAFT_WRECKAGE.value: {
            "persistence": 90.0,
            "entanglement": 35.0,
            "chemical_toxicity": 75.0,
            "leachate_risk": 80.0,
        },
        DebrisFamily.STRUCTURAL_SUBMERGED.value: {
            "persistence": 95.0,
            "entanglement": 15.0,
            "chemical_toxicity": 15.0,
            "leachate_risk": 15.0,
        },
        DebrisFamily.RUBBER_AUTOMOTIVE.value: {
            "persistence": 95.0,
            "entanglement": 60.0,
            "chemical_toxicity": 55.0,
            "leachate_risk": 65.0,
        },
        DebrisFamily.DISCARDED_GEAR.value: {
            "persistence": 95.0,
            "entanglement": 95.0,
            "chemical_toxicity": 30.0,
            "leachate_risk": 40.0,
        },
        DebrisFamily.PLASTIC_ACCUMULATION.value: {
            "persistence": 95.0,
            "entanglement": 85.0,
            "chemical_toxicity": 40.0,
            "leachate_risk": 50.0,
        },
        DebrisFamily.METALLIC_DEBRIS.value: {
            "persistence": 80.0,
            "entanglement": 25.0,
            "chemical_toxicity": 55.0,
            "leachate_risk": 65.0,
        },
        DebrisFamily.SEABED_FORMATION.value: {
            "persistence": 0.0,
            "entanglement": 0.0,
            "chemical_toxicity": 0.0,
            "leachate_risk": 0.0,
        },
        DebrisFamily.UNIDENTIFIED_ANOMALY.value: {
            "persistence": 50.0,
            "entanglement": 30.0,
            "chemical_toxicity": 30.0,
            "leachate_risk": 30.0,
        },
    }

    @classmethod
    def evaluate_ecological_risk(
        cls,
        classification: TargetClassification,
        estimated_area_m2: Optional[float] = None,
        habitat_sensitivity: Literal["CORAL_REEF", "MPA_PROTECTED", "BENTHIC_SAND", "UNKNOWN"] = "UNKNOWN",
        uncertainty_decision: str = "ACCEPTED",
    ) -> EcologicalRiskAssessment:
        """
        Calculates Ecological Risk = Environmental consequence (persistence, chemical hazard, entanglement).
        """
        # If anomaly is natural or completely ungrounded, risk is zero or insufficient evidence
        if getattr(classification, "tier1_domain", None) == DomainTier.NATURAL_GEOLOGICAL:
            return EcologicalRiskAssessment(
                risk_score=0.0,
                risk_level="LOW",
                status="ESTIMATED",
                component_scores={"persistence": 0.0, "hazard": 0.0, "habitat": 0.0},
                rationale="Natural geological seafloor feature — negligible ecological risk.",
            )

        if uncertainty_decision == "UNKNOWN":
            return EcologicalRiskAssessment(
                risk_score=None,
                risk_level="UNKNOWN",
                status="INSUFFICIENT_EVIDENCE",
                component_scores={},
                rationale="Risk incomplete — insufficient evidence (candidate anomaly classification unknown).",
            )

        family = getattr(classification, "tier2_family", DebrisFamily.UNIDENTIFIED_ANOMALY)
        family_val = family.value if hasattr(family, "value") else str(family)
        profile = cls.FAMILY_HAZARD_PROFILES.get(
            family_val, cls.FAMILY_HAZARD_PROFILES[DebrisFamily.UNIDENTIFIED_ANOMALY.value]
        )

        # Habitat sensitivity multiplier
        habitat_multiplier = {
            "CORAL_REEF": 1.5,
            "MPA_PROTECTED": 1.4,
            "BENTHIC_SAND": 0.8,
            "UNKNOWN": 1.0,
        }.get(habitat_sensitivity, 1.0)

        # Size factor (larger debris = higher footprint)
        size_factor = 1.0
        if estimated_area_m2 is not None:
            if estimated_area_m2 > 25.0:
                size_factor = 1.35
            elif estimated_area_m2 < 1.0:
                size_factor = 0.85

        # Weighted ecological formula
        # Persistence (35%), Chemical/Toxicity (35%), Entanglement (30%)
        base_hazard = (
            (profile["persistence"] * 0.35)
            + (profile["chemical_toxicity"] * 0.35)
            + (profile["entanglement"] * 0.30)
        )

        composite_risk = min(100.0, max(0.0, base_hazard * habitat_multiplier * size_factor))

        if composite_risk >= 80.0:
            level = "CRITICAL"
        elif composite_risk >= 60.0:
            level = "HIGH"
        elif composite_risk >= 35.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        rationale = (
            f"Ecological consequence evaluated: {family} ({profile['persistence']:.0f}% persistence, "
            f"{profile['chemical_toxicity']:.0f}% chemical hazard). Habitat factor: {habitat_sensitivity}."
        )

        return EcologicalRiskAssessment(
            risk_score=round(composite_risk, 1),
            risk_level=level,
            status="ESTIMATED",
            component_scores={
                "persistence_score": profile["persistence"],
                "chemical_toxicity_score": profile["chemical_toxicity"],
                "entanglement_score": profile["entanglement"],
                "habitat_sensitivity_multiplier": habitat_multiplier,
            },
            rationale=rationale,
        )

    @classmethod
    def evaluate_operational_priority(
        cls,
        ecological_risk: EcologicalRiskAssessment,
        water_depth_m: Optional[float] = 112.0,
        navigation_hazard: bool = False,
        uncertainty_decision: str = "ACCEPTED",
    ) -> OperationalPriorityAssessment:
        """
        Calculates Operational Removal Priority = Urgency of intervention considering
        logistics, depth, navigation hazards, and recovery feasibility.
        """
        # If ecological risk is incomplete, operational priority must state review
        if ecological_risk.status == "INSUFFICIENT_EVIDENCE" or ecological_risk.risk_score is None:
            return OperationalPriorityAssessment(
                priority_level="REVIEW",
                priority_score=None,
                component_weights={},
                rationale="Queued for expert inspection — operational priority cannot be determined without valid evidence.",
            )

        eco_score = ecological_risk.risk_score

        # Navigation hazard contribution (0 to 100)
        nav_score = 90.0 if navigation_hazard else 10.0
        if water_depth_m is not None and water_depth_m < 15.0:
            # Shallow water: debris creates immediate vessel hull collision hazard
            nav_score = max(nav_score, 85.0)

        # Removal feasibility penalty (salvage at >100m depth requires deep ROV; high logistical cost)
        feasibility_penalty = 0.0
        if water_depth_m is not None:
            if water_depth_m > 200.0:
                feasibility_penalty = -25.0
            elif water_depth_m > 80.0:
                feasibility_penalty = -10.0

        # If candidate uncertainty is REVIEW_REQUIRED, penalize deployment priority until confirmed!
        uncertainty_penalty = -20.0 if uncertainty_decision == "REVIEW_REQUIRED" else 0.0

        # Composite Operational Formula:
        # 45% Ecological Risk + 35% Navigation Hazard + Feasibility + Uncertainty
        raw_priority = (eco_score * 0.45) + (nav_score * 0.35) + feasibility_penalty + uncertainty_penalty
        priority_score = min(100.0, max(5.0, raw_priority))

        if priority_score >= 80.0:
            p_level = "CRITICAL"
        elif priority_score >= 60.0:
            p_level = "HIGH"
        elif priority_score >= 40.0:
            p_level = "MEDIUM"
        else:
            p_level = "LOW"

        if uncertainty_decision == "REVIEW_REQUIRED":
            p_level = "REVIEW"

        rationale = (
            f"Removal priority calculated: Eco weight ({eco_score:.0f} * 0.45), "
            f"Nav hazard ({nav_score:.0f} * 0.35). Depth penalty: {feasibility_penalty} pts."
        )

        return OperationalPriorityAssessment(
            priority_level=p_level,
            priority_score=round(priority_score, 1),
            component_weights={
                "ecological_risk_contribution": round(eco_score * 0.45, 1),
                "navigation_hazard_contribution": round(nav_score * 0.35, 1),
                "depth_feasibility_adjustment": feasibility_penalty,
                "uncertainty_adjustment": uncertainty_penalty,
            },
            rationale=rationale,
        )
