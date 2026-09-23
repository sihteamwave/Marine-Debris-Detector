"""
SIH26057 — Cross-Frame / Cross-Swath Fusion & Target Tracker (Gap 6)

Maintains persistent target identities across consecutive sonar pings, frames, and swaths.
Prevents multiple observations of the same physical underwater anomaly from being
counted as duplicate targets.
"""

from typing import List, Dict, Any, Optional, Literal, Tuple
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import math


class TargetObservation(BaseModel):
    """Snapshot of an individual detection candidate associated with a persistent target."""
    candidate_id: str
    frame_id: Optional[str] = None
    timestamp: str
    class_label: str
    confidence: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pixel_center: Tuple[float, float]
    shadow_strength_pct: float = 0.0


class PersistentTarget(BaseModel):
    """
    Physical anomaly entity tracked across multiple sonar frames or swaths.
    """
    target_id: str = Field(description="Persistent target ID, e.g. TGT-2026-001")
    first_observed_timestamp: str
    last_observed_timestamp: str
    observation_count: int = 1
    observations: List[TargetObservation] = Field(default_factory=list)
    
    # Consensus State
    consensus_class: str
    consensus_family: str
    consensus_confidence: float
    association_quality: Literal["CERTAIN", "TENTATIVE", "AMBIGUOUS"] = "CERTAIN"
    
    # Spatial Centroid (if georeferenced)
    estimated_lat: Optional[float] = None
    estimated_lon: Optional[float] = None
    uncertainty_radius_m: Optional[float] = None
    
    # Review & Lifecycle
    verification_status: Literal["PENDING", "CONFIRMED", "REJECTED", "UNKNOWN"] = "PENDING"
    resurvey_recommended: bool = False


class CrossFrameFusionTracker:
    """
    Maintains persistent target state and associates incoming candidates.
    Uses geodetic proximity (Haversine) when lat/lon are available, or
    normalized frame proximity when only relative frame coordinates exist.
    """

    def __init__(
        self,
        geo_distance_threshold_m: float = 8.0,
        pixel_normalized_threshold: float = 0.15,
    ):
        self.geo_distance_threshold_m = geo_distance_threshold_m
        self.pixel_normalized_threshold = pixel_normalized_threshold
        self._targets: Dict[str, PersistentTarget] = {}
        self._target_counter: int = 1

    @staticmethod
    def _haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Computes great-circle distance between two GPS coordinates in meters."""
        r_earth = 6371000.0  # meters
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)

        a = (
            math.sin(dphi / 2.0) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return r_earth * c

    def associate_candidate(
        self,
        candidate_id: str,
        frame_id: Optional[str],
        timestamp: str,
        class_label: str,
        family_name: str,
        confidence: float,
        pixel_cx_pct: float,
        pixel_cy_pct: float,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        shadow_strength: float = 0.0,
    ) -> Tuple[str, Literal["CERTAIN", "TENTATIVE", "AMBIGUOUS"]]:
        """
        Associates an incoming candidate observation with an existing target or creates a new one.
        Returns: (persistent_target_id, association_quality)
        """
        best_match_id: Optional[str] = None
        best_distance: float = float("inf")
        association_quality: Literal["CERTAIN", "TENTATIVE", "AMBIGUOUS"] = "CERTAIN"

        # Search for closest existing target
        for target_id, target in self._targets.items():
            # Check 1: Geodetic distance (if GPS available for both)
            if (
                latitude is not None
                and longitude is not None
                and target.estimated_lat is not None
                and target.estimated_lon is not None
            ):
                dist_m = self._haversine_distance_m(
                    latitude, longitude, target.estimated_lat, target.estimated_lon
                )
                if dist_m <= self.geo_distance_threshold_m and dist_m < best_distance:
                    best_distance = dist_m
                    best_match_id = target_id
                    if dist_m > (self.geo_distance_threshold_m * 0.7):
                        association_quality = "TENTATIVE"
                    else:
                        association_quality = "CERTAIN"

            # Check 2: Relative pixel normalized proximity (if same frame or consecutive frame without GPS)
            elif target.observations:
                last_obs = target.observations[-1]
                # If within consecutive frames and close in normalized frame coordinates
                dx = pixel_cx_pct - (last_obs.pixel_center[0] / 100.0 if last_obs.pixel_center[0] > 1.0 else last_obs.pixel_center[0])
                dy = pixel_cy_pct - (last_obs.pixel_center[1] / 100.0 if last_obs.pixel_center[1] > 1.0 else last_obs.pixel_center[1])
                norm_dist = math.sqrt(dx * dx + dy * dy)

                if norm_dist <= self.pixel_normalized_threshold and norm_dist < best_distance:
                    best_distance = norm_dist
                    best_match_id = target_id
                    association_quality = "TENTATIVE"

        # Check for conflicting class identity
        if best_match_id:
            target = self._targets[best_match_id]
            if target.consensus_class != class_label and confidence > 50.0 and target.consensus_confidence > 50.0:
                # Same spatial location but conflicting classes (e.g. tyre vs drum)
                association_quality = "AMBIGUOUS"

            # Update existing target
            obs = TargetObservation(
                candidate_id=candidate_id,
                frame_id=frame_id,
                timestamp=timestamp,
                class_label=class_label,
                confidence=confidence,
                latitude=latitude,
                longitude=longitude,
                pixel_center=(pixel_cx_pct, pixel_cy_pct),
                shadow_strength_pct=shadow_strength,
            )
            target.observations.append(obs)
            target.observation_count += 1
            target.last_observed_timestamp = timestamp
            target.association_quality = association_quality

            # Update weighted consensus confidence and position
            n = float(target.observation_count)
            target.consensus_confidence = round(
                ((target.consensus_confidence * (n - 1.0)) + confidence) / n, 1
            )
            if latitude is not None and longitude is not None:
                if target.estimated_lat is not None and target.estimated_lon is not None:
                    target.estimated_lat = round(((target.estimated_lat * (n - 1.0)) + latitude) / n, 7)
                    target.estimated_lon = round(((target.estimated_lon * (n - 1.0)) + longitude) / n, 7)
                else:
                    target.estimated_lat = latitude
                    target.estimated_lon = longitude

            return target.target_id, association_quality

        # Otherwise, spawn new target
        new_target_id = f"TGT-2026-{self._target_counter:04d}"
        self._target_counter += 1

        new_obs = TargetObservation(
            candidate_id=candidate_id,
            frame_id=frame_id,
            timestamp=timestamp,
            class_label=class_label,
            confidence=confidence,
            latitude=latitude,
            longitude=longitude,
            pixel_center=(pixel_cx_pct, pixel_cy_pct),
            shadow_strength_pct=shadow_strength,
        )

        new_target = PersistentTarget(
            target_id=new_target_id,
            first_observed_timestamp=timestamp,
            last_observed_timestamp=timestamp,
            observation_count=1,
            observations=[new_obs],
            consensus_class=class_label,
            consensus_family=family_name,
            consensus_confidence=round(confidence, 1),
            association_quality="CERTAIN",
            estimated_lat=latitude,
            estimated_lon=longitude,
        )

        self._targets[new_target_id] = new_target
        return new_target_id, "CERTAIN"

    def get_target(self, target_id: str) -> Optional[PersistentTarget]:
        return self._targets.get(target_id)

    def get_all_targets(self) -> List[PersistentTarget]:
        return list(self._targets.values())

    def reset(self) -> None:
        """Clears in-memory tracker state for new survey."""
        self._targets.clear()
        self._target_counter = 1
