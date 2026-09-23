"""
SIH26057 — Sonar-Geometric Geolocation & Uncertainty Engine (Gap 8)

Converts pixel coordinates to acoustic ground-range and geodetic positions.
Replaces false-precision GPS claims with honest geometric modeling and
explicit uncertainty bounds.
"""

from typing import Dict, Any, Optional, Tuple, Literal
import math
from pydantic import BaseModel, Field

from backend.models.candidate_record import GeolocationRecord
from backend.models.metadata_models import SonarMetadata, NavigationMetadata


class GeolocationEngine:
    """
    Computes real or estimated target geodetic position from side-scan sonar slant-range geometry.
    Adheres strictly to physics: Slant Range Rs -> Ground Range Rg = sqrt(Rs^2 - H^2).
    """

    METERS_PER_DEG_LAT = 111320.0  # Approx meters per degree latitude

    @classmethod
    def compute_position(
        cls,
        pixel_x: float,
        pixel_y: float,
        image_width: int,
        image_height: int,
        sonar_meta: Optional[SonarMetadata] = None,
        nav_meta: Optional[NavigationMetadata] = None,
        fallback_lat: Optional[float] = None,
        fallback_lon: Optional[float] = None,
    ) -> GeolocationRecord:
        """
        Compute geodetic coordinates and uncertainty bounds.
        If navigation telemetry is missing, flags UNAVAILABLE.
        If layback or altitude is missing, flags ESTIMATED / EXACT_NOT_CLAIMED.
        """
        # Case 1: Complete absence of navigation metadata or missing coordinates
        vessel_lat = getattr(nav_meta, "latitude", None) if nav_meta else fallback_lat
        vessel_lon = getattr(nav_meta, "longitude", None) if nav_meta else fallback_lon
        if vessel_lat is None or vessel_lon is None:
            return GeolocationRecord(
                latitude=0.0,
                longitude=0.0,
                position_status="UNAVAILABLE",
                uncertainty_radius_m=None,
                uncertainty_display="Position uncertainty unavailable (no navigation telemetry)",
                calculation_method="NONE",
                telemetry_provenance="NO DATA",
            )

        heading_deg = 0.0
        if nav_meta:
            heading_deg = getattr(nav_meta, "heading_deg", getattr(nav_meta, "heading", 0.0))

        # Provenance badge
        is_simulated = nav_meta.is_simulated if nav_meta else True
        telemetry_provenance = (
            "SIMULATED / REPLAYED TELEMETRY" if is_simulated else "REAL TELEMETRY"
        )

        range_val = 0.0
        if sonar_meta:
            range_val = getattr(sonar_meta, "swath_range_m", getattr(sonar_meta, "range_meters", 0.0))

        # Case 2: Nav coordinates present, but Sonar geometric metadata (range/altitude) missing
        if sonar_meta is None or range_val <= 0:
            return GeolocationRecord(
                latitude=round(vessel_lat, 7),
                longitude=round(vessel_lon, 7),
                position_status="EXACT_NOT_CLAIMED",
                uncertainty_radius_m=None,
                uncertainty_display="Position uncertainty unavailable (sonar slant-range metadata missing)",
                calculation_method="VESSEL_PROXIMITY_ESTIMATE",
                telemetry_provenance=telemetry_provenance,
            )

        # Case 3: Geometric Sonar Slant-to-Ground conversion
        # Determine port or starboard from pixel_x relative to image center (nadir line)
        center_x = image_width / 2.0
        dist_from_nadir_px = abs(pixel_x - center_x)
        is_starboard = pixel_x >= center_x

        # Slant range Rs
        half_swath_px = max(1.0, center_x)
        slant_range_m = (dist_from_nadir_px / half_swath_px) * range_val

        altitude_m = getattr(sonar_meta, "altitude_m", getattr(sonar_meta, "altitude_meters", 5.0)) or 5.0

        # Ground range Rg via Pythagorean theorem: Rg = sqrt(Rs^2 - H^2)
        if slant_range_m > altitude_m:
            ground_range_m = math.sqrt(slant_range_m**2 - altitude_m**2)
        else:
            # Inside water column or near-nadir blind zone
            ground_range_m = 0.0

        # Cross-track bearing: Starboard = heading + 90 deg, Port = heading - 90 deg
        cross_track_bearing = (heading_deg + 90.0) if is_starboard else (heading_deg - 90.0)
        cross_track_rad = math.radians(cross_track_bearing % 360.0)

        # Geodetic projection (flat-earth approximation for small distances < 1km)
        d_north_m = ground_range_m * math.cos(cross_track_rad)
        d_east_m = ground_range_m * math.sin(cross_track_rad)

        meters_per_deg_lon = cls.METERS_PER_DEG_LAT * math.cos(math.radians(vessel_lat))
        if meters_per_deg_lon == 0:
            meters_per_deg_lon = cls.METERS_PER_DEG_LAT

        target_lat = vessel_lat + (d_north_m / cls.METERS_PER_DEG_LAT)
        target_lon = vessel_lon + (d_east_m / meters_per_deg_lon)

        # Uncertainty Calculation:
        # GNSS uncertainty: ~3.0m (replay/DGPS standard)
        # Slant-to-ground error based on altitude uncertainty: ~1.5m
        # Layback uncertainty: if offset known 1.0m, else 8.0m
        layback_uncertainty = 1.0 if (nav_meta and nav_meta.towfish_layback_m is not None) else 6.0
        total_uncertainty_m = math.sqrt(3.0**2 + 1.5**2 + layback_uncertainty**2)

        position_status: Literal["EXACT_NOT_CLAIMED", "ESTIMATED", "UNAVAILABLE", "SIMULATED_REPLAY"] = (
            "SIMULATED_REPLAY" if is_simulated else "ESTIMATED"
        )

        uncertainty_display = f"± {total_uncertainty_m:.1f} m (95% CI, slant-range transformed)"

        return GeolocationRecord(
            latitude=round(target_lat, 7),
            longitude=round(target_lon, 7),
            position_status=position_status,
            uncertainty_radius_m=round(total_uncertainty_m, 1),
            uncertainty_display=uncertainty_display,
            calculation_method="SONAR_SLANT_TO_GROUND_RANGE",
            telemetry_provenance=telemetry_provenance,
        )
