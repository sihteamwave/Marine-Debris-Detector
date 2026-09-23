"""
SIH26057 — Data-Driven 3-Tier Marine Taxonomy (Gap 17)
Enforces a hierarchical classification model so uncertainty is naturally accommodated
without forcing ambiguous returns into unsupported granular classes.
"""

from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class DomainTier(str, Enum):
    """Level 1: Primary Origin Tier"""
    ANTHROPOGENIC = "ANTHROPOGENIC"
    NATURAL_GEOLOGICAL = "NATURAL_GEOLOGICAL"
    UNKNOWN = "UNKNOWN"


class DebrisFamily(str, Enum):
    """Level 2: Anthropogenic & Marine Anomaly Functional Family"""
    CONTAINER_CARGO = "CONTAINER_CARGO"
    SUNKEN_VESSEL = "SUNKEN_VESSEL"
    AIRCRAFT_WRECKAGE = "AIRCRAFT_WRECKAGE"
    STRUCTURAL_SUBMERGED = "STRUCTURAL_SUBMERGED"
    RUBBER_AUTOMOTIVE = "RUBBER_AUTOMOTIVE"
    DISCARDED_GEAR = "DISCARDED_GEAR"
    PLASTIC_ACCUMULATION = "PLASTIC_ACCUMULATION"
    METALLIC_DEBRIS = "METALLIC_DEBRIS"
    SEABED_FORMATION = "SEABED_FORMATION"
    UNIDENTIFIED_ANOMALY = "UNIDENTIFIED_ANOMALY"


# Mapping from supported dataset classes to 3-tier taxonomy
TAXONOMY_MAP: Dict[str, Dict[str, Any]] = {
    "plane": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.AIRCRAFT_WRECKAGE,
        "tier3": "Downed Aircraft Fuselage Section",
        "description": "Aeronautical structural debris, aluminum/alloy fuselage or swept wing assemblies."
    },
    "shipwreck": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.SUNKEN_VESSEL,
        "tier3": "Sunken Vessel / Keel Ruin",
        "description": "Marine vessel hull, historic wreckage, keel ribbing, or maritime structures."
    },
    "container": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.CONTAINER_CARGO,
        "tier3": "Intermodal Freight Unit",
        "description": "Standard 20ft/40ft shipping containers, steel cargo units, or industrial storage boxes."
    },
    "building": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.STRUCTURAL_SUBMERGED,
        "tier3": "Submerged Structure / Ruin",
        "description": "Submerged concrete foundations, coastal breakwater debris, or architectural ruins."
    },
    "tyre": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.RUBBER_AUTOMOTIVE,
        "tier3": "Submerged Automotive Debris",
        "description": "Automotive, industrial, or aircraft rubber tires, persistent seabed rubber clutter."
    },
    "cable": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.DISCARDED_GEAR,
        "tier3": "Subsea Cable / Line",
        "description": "Severed subsea telecommunication/power cables or heavy towing hawser."
    },
    "plastic_waste": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.PLASTIC_ACCUMULATION,
        "tier3": "Polymer Waste Cluster",
        "description": "Aggregated marine plastic waste, ghost netting bundles, or synthetic polymer clutter."
    },
    "mud_covered_debris": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.METALLIC_DEBRIS,
        "tier3": "Partially Buried Anthropogenic Target",
        "description": "Anthropogenic debris with sediment overburden causing diffuse acoustic edges."
    },
    "metal_drum": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.METALLIC_DEBRIS,
        "tier3": "Submerged 55-Gallon Drum",
        "description": "Cylindrical industrial chemical/oil drum container."
    },
    "wooden_crate": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.CONTAINER_CARGO,
        "tier3": "Maritime Wooden Cargo Crate",
        "description": "Low-acoustic-impedance rectangular cargo crate."
    },
    "unexploded_ordnance": {
        "tier1": DomainTier.ANTHROPOGENIC,
        "tier2": DebrisFamily.METALLIC_DEBRIS,
        "tier3": "UXO / Mine-Like Object",
        "description": "Submerged historical naval ordnance or cylindrical metal contact."
    },
    "unknown_anomaly": {
        "tier1": DomainTier.UNKNOWN,
        "tier2": DebrisFamily.UNIDENTIFIED_ANOMALY,
        "tier3": "Acoustic Void / Unverified Return",
        "description": "Acoustic backscatter perturbation with ambiguous shadow geometry."
    },
    "natural_seabed": {
        "tier1": DomainTier.NATURAL_GEOLOGICAL,
        "tier2": DebrisFamily.SEABED_FORMATION,
        "tier3": "Geological Formation / Rock Outcrop",
        "description": "Natural sand ripples, rocky reef, biogenic seabed features, or acoustic artefacts."
    }
}


class TargetClassification(BaseModel):
    """Encapsulates the 3-tier classification of a detection."""
    tier1_domain: DomainTier = DomainTier.UNKNOWN
    tier2_family: DebrisFamily = DebrisFamily.UNIDENTIFIED_ANOMALY
    tier3_specific: str = "Possible Debris (Unverified)"
    raw_class_name: str = "unknown_anomaly"
    confidence_pct: float = Field(default=50.0, ge=0.0, le=100.0)
    classification_notes: str = ""

    @classmethod
    def from_class_name(cls, class_name: str, confidence_pct: float = 50.0) -> "TargetClassification":
        key = class_name.lower().strip()
        # Find matching key
        matched_key = None
        for k in TAXONOMY_MAP:
            if k in key:
                matched_key = k
                break

        if matched_key and matched_key in TAXONOMY_MAP:
            info = TAXONOMY_MAP[matched_key]
            return cls(
                tier1_domain=info["tier1"],
                tier2_family=info["tier2"],
                tier3_specific=info["tier3"],
                raw_class_name=matched_key,
                confidence_pct=confidence_pct,
                classification_notes=info["description"]
            )
        else:
            return cls(
                tier1_domain=DomainTier.UNKNOWN,
                tier2_family=DebrisFamily.UNIDENTIFIED_ANOMALY,
                tier3_specific=class_name or "Possible Debris",
                raw_class_name="unknown",
                confidence_pct=confidence_pct,
                classification_notes="Class not in core dataset taxonomy; marked as uncertain."
            )
