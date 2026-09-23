"""
SIH26057 — Survey Coverage & Seafloor Inspection Model (Gap 7)

Prevents 'No detection' from being falsely interpreted as 'Clean seafloor with no debris'.
Explicitly models:
1. Clean surveyed area (high QA, no candidate detected)
2. Low-quality surveyed area (degraded acoustics, false-negative risk)
3. Nadir blind zone / water column (unusable acoustic geometry directly beneath transducer)
4. Unsurveyed / gap regions
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
import math

from backend.core.qa_gate import QAResult, QAStatus
from backend.models.metadata_models import SonarMetadata, NavigationMetadata


class SwathZone(BaseModel):
    """Segment of a sonar ping or swath."""
    zone_name: str
    status: Literal[
        "SURVEYED_CLEAN",
        "SURVEYED_CANDIDATE_PRESENT",
        "LOW_QUALITY_SURVEYED",
        "NADIR_BLIND_ZONE",
        "UNSURVEYED_GAP",
        "AMBIGUOUS_COVERAGE",
    ]
    swath_fraction_pct: float
    description: str


class SurveyCoverageReport(BaseModel):
    """Complete seafloor survey coverage accounting."""
    survey_id: str
    mission_id: str
    total_swath_width_m: float
    estimated_surveyed_area_sq_m: float
    clean_surveyed_pct: float
    low_quality_pct: float
    nadir_blind_zone_pct: float
    candidate_present_pct: float
    swath_zones: List[SwathZone] = Field(default_factory=list)
    confidence_in_coverage: Literal["ESTIMATED", "PRELIMINARY", "UNAVAILABLE"] = "ESTIMATED"
    limitation_notice: str


class CoverageEngine:
    """
    Evaluates sonar frame and mission data to compute honest coverage partitions.
    """

    @classmethod
    def compute_coverage(
        cls,
        image_width: int,
        image_height: int,
        qa_result: Optional[QAResult],
        candidate_count: int,
        sonar_meta: Optional[SonarMetadata] = None,
        nav_meta: Optional[NavigationMetadata] = None,
        survey_id: str = "SURVEY-INDIAN-OCEAN-01",
        mission_id: str = "MISSION-SIH26057-DEFAULT",
    ) -> SurveyCoverageReport:
        """
        Computes survey coverage and partitions swath into clean, blind, low-quality, and detected zones.
        """
        range_m = getattr(sonar_meta, "swath_range_m", getattr(sonar_meta, "range_meters", 50.0)) if sonar_meta else 50.0
        altitude_m = getattr(sonar_meta, "altitude_m", getattr(sonar_meta, "altitude_meters", 5.0)) if sonar_meta else 5.0
        total_swath_width_m = range_m * 2.0

        # Along-track distance estimate (assuming nominal 100m frame along-track length)
        along_track_len_m = 100.0
        total_area_sq_m = total_swath_width_m * along_track_len_m

        # 1. Nadir Blind Zone / Water Column
        # Transducer altitude H dictates water column radius directly beneath towfish
        nadir_width_m = min(total_swath_width_m * 0.25, altitude_m * 2.0)
        nadir_pct = min(25.0, max(5.0, (nadir_width_m / total_swath_width_m) * 100.0))

        # 2. Quality Impact
        is_low_quality = (
            qa_result.status in [QAStatus.LOW_QUALITY, QAStatus.INVALID] if qa_result else False
        )
        has_warning = (qa_result.status == QAStatus.WARNING) if qa_result else False

        if is_low_quality:
            low_quality_pct = 70.0
            clean_pct = 0.0
        elif has_warning:
            low_quality_pct = 20.0
            clean_pct = max(0.0, 100.0 - nadir_pct - low_quality_pct - (candidate_count * 3.0))
        else:
            low_quality_pct = 0.0
            clean_pct = max(0.0, 100.0 - nadir_pct - (candidate_count * 3.0))

        candidate_pct = min(100.0, candidate_count * 3.0)

        # Build Swath Zones
        swath_zones = [
            SwathZone(
                zone_name="Port Outer Swath",
                status="LOW_QUALITY_SURVEYED" if is_low_quality else (
                    "SURVEYED_CANDIDATE_PRESENT" if candidate_count > 0 else "SURVEYED_CLEAN"
                ),
                swath_fraction_pct=round((100.0 - nadir_pct) / 2.0, 1),
                description="Port side seafloor backscatter zone (slant-range 0 to -50m)",
            ),
            SwathZone(
                zone_name="Nadir Water Column / Blind Zone",
                status="NADIR_BLIND_ZONE",
                swath_fraction_pct=round(nadir_pct, 1),
                description=f"Acoustic void directly under towfish (altitude {altitude_m:.1f}m)",
            ),
            SwathZone(
                zone_name="Starboard Outer Swath",
                status="LOW_QUALITY_SURVEYED" if is_low_quality else "SURVEYED_CLEAN",
                swath_fraction_pct=round((100.0 - nadir_pct) / 2.0, 1),
                description="Starboard side seafloor backscatter zone (slant-range 0 to +50m)",
            ),
        ]

        limitation_notice = (
            "Coverage estimated from nominal swath geometry. True bathymetric footprint requires "
            "precise towfish layback, pitch/roll dynamics, and acoustic beam spreading model."
        )

        return SurveyCoverageReport(
            survey_id=survey_id,
            mission_id=mission_id,
            total_swath_width_m=total_swath_width_m,
            estimated_surveyed_area_sq_m=total_area_sq_m,
            clean_surveyed_pct=round(clean_pct, 1),
            low_quality_pct=round(low_quality_pct, 1),
            nadir_blind_zone_pct=round(nadir_pct, 1),
            candidate_present_pct=round(candidate_pct, 1),
            swath_zones=swath_zones,
            confidence_in_coverage="ESTIMATED",
            limitation_notice=limitation_notice,
        )
