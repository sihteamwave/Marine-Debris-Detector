"""
SIH26057 — Sonar and Navigation Metadata Data Models (Gap 1)
Defines typed, validated data structures for acoustic sensor parameters
and navigational telemetry.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class SonarMetadata(BaseModel):
    """
    Physical and operational acoustic parameters of the Side-Scan Sonar survey.
    """
    sonar_id: str = Field(default="SSS-EDGETECH-4200", description="Identifier of the sonar sensor payload")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    ping_id: Optional[str] = Field(default=None, description="Acoustic ping / sequence identifier")
    frequency_khz: float = Field(default=450.0, description="Operating acoustic transducer frequency in kHz")
    swath_range_m: float = Field(default=50.0, description="Max lateral slant/ground swath range per channel in meters")
    altitude_m: float = Field(default=12.0, description="Vehicle/towfish altitude above seafloor in meters")
    channel: Literal["PORT", "STARBOARD", "DUAL", "UNKNOWN"] = Field(default="DUAL", description="Sonar transceiver channel")
    pixel_range_scale_m: float = Field(default=0.08, description="Metric ground resolution (meters per pixel)")
    pulse_length_us: Optional[float] = Field(default=25.0, description="Acoustic transmit pulse length in microseconds")
    beam_width_horiz_deg: Optional[float] = Field(default=0.5, description="Horizontal acoustic beam angle in degrees")
    beam_width_vert_deg: Optional[float] = Field(default=50.0, description="Vertical acoustic beam spread in degrees")
    is_simulated: bool = Field(default=True, description="True if synthetic, replayed, or uncalibrated test data")
    metadata_source: str = Field(default="DEFAULT_MISSION_CONFIG", description="Origin of metadata parameters")


class NavigationMetadata(BaseModel):
    """
    Spatial positioning and navigational telemetry of the survey platform (AUV / Towfish).
    """
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    latitude: Optional[float] = Field(default=None, description="Geographic latitude in decimal degrees")
    longitude: Optional[float] = Field(default=None, description="Geographic longitude in decimal degrees")
    heading_deg: float = Field(default=142.0, description="Platform true heading in degrees (0-360)")
    speed_knots: float = Field(default=3.2, description="Platform speed over ground in knots")
    depth_m: float = Field(default=112.0, description="Sensor water depth in meters")
    towfish_layback_m: float = Field(default=0.0, description="Acoustic layback distance behind surface GPS antenna in meters")
    navigation_quality: Literal["SURVEY_GRADE_RTK", "DVL_INS", "USBL_ESTIMATED", "DEAD_RECKONING", "SIMULATED_REPLAY", "UNAVAILABLE"] = Field(
        default="SIMULATED_REPLAY",
        description="Confidence tier of positioning telemetry"
    )
    telemetry_source: Literal["REAL_TELEMETRY", "SIMULATED / REPLAYED TELEMETRY", "ESTIMATED", "UNAVAILABLE"] = Field(
        default="SIMULATED / REPLAYED TELEMETRY",
        description="Human-readable attribution of navigational coordinates"
    )
    is_simulated: bool = Field(default=True, description="Flag indicating simulated or replayed telemetry")
    position_uncertainty_m: Optional[float] = Field(default=None, description="Calculated 1-sigma spatial uncertainty circle in meters")
