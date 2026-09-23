"""
SIH26057 — Pre-Inference Sonar Data Quality & QA Gate (Gap 2)
Inspects incoming sonar imagery and metadata BEFORE preprocessing or model execution.
Produces an honest, non-fabricated quality assessment (VALID, WARNING, LOW_QUALITY, INVALID).
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
import cv2
import numpy as np

from backend.models.metadata_models import SonarMetadata, NavigationMetadata


from enum import Enum


class QAStatus(str, Enum):
    VALID = "VALID"
    WARNING = "WARNING"
    LOW_QUALITY = "LOW_QUALITY"
    INVALID = "INVALID"


class DataQAResult(BaseModel):
    """
    Structured outcome of the pre-inference data-quality evaluation.
    """
    status: Literal["VALID", "WARNING", "LOW_QUALITY", "INVALID"]
    is_processable: bool = Field(description="True if image can be safely passed to inference pipeline")
    reasons: List[str] = Field(default_factory=list, description="Explicit failure/warning reasons")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Measured backend numerical checks")
    recommendation: str = "Proceed with inference"


# Backward-compatible alias
QAResult = DataQAResult


class SonarQAGate:
    """
    Performs rigorous physical and statistical quality checks on side-scan sonar arrays.
    """

    MIN_WIDTH: int = 256
    MIN_HEIGHT: int = 128
    MAX_SATURATION_PCT: float = 20.0       # > 20% pixels at 255 indicates receiver acoustic clipping
    MAX_BLACKOUT_PCT: float = 65.0         # > 65% zero pixels indicates signal loss or incomplete ping
    MIN_STD_CONTRAST: float = 10.0         # < 10 indicates uninformative washed out or flat signal

    @classmethod
    def evaluate(
        cls,
        img: np.ndarray,
        sonar_meta: Optional[SonarMetadata] = None,
        nav_meta: Optional[NavigationMetadata] = None
    ) -> DataQAResult:
        reasons: List[str] = []
        metrics: Dict[str, Any] = {}

        # 1. Structural validity checks
        if img is None or not isinstance(img, np.ndarray) or img.size == 0:
            return DataQAResult(
                status="INVALID",
                is_processable=False,
                reasons=["Input image buffer is null, corrupted, or non-decodable"],
                metrics={"size_bytes": 0},
                recommendation="Reject file. Verify sonar image encoding and format."
            )

        h, w = img.shape[:2]
        metrics["resolution"] = f"{w}x{h}"
        metrics["channels"] = 1 if img.ndim == 2 else img.shape[2]

        if w < cls.MIN_WIDTH or h < cls.MIN_HEIGHT:
            reasons.append(f"Image resolution {w}x{h} is below minimum operational threshold ({cls.MIN_WIDTH}x{cls.MIN_HEIGHT})")
            return DataQAResult(
                status="INVALID",
                is_processable=False,
                reasons=reasons,
                metrics=metrics,
                recommendation="Insufficient spatial resolution for debris detection. Minimum 256x128 required."
            )

        # 2. Photometric & acoustic intensity checks
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img.ndim == 3 else img.copy()
        total_pixels = float(gray.size)

        # Saturation (receiver blooming / acoustic reflection saturation)
        saturated_pixels = int(np.count_nonzero(gray >= 254))
        sat_pct = round((saturated_pixels / total_pixels) * 100.0, 2)
        metrics["saturation_pct"] = sat_pct

        # Blackout / signal loss (excluding typical nadir blind zone)
        # Nadir is typically the central ~5% of swath
        center_x = w // 2
        nadir_margin = max(4, int(w * 0.03))
        mask_non_nadir = np.ones_like(gray, dtype=bool)
        mask_non_nadir[:, max(0, center_x - nadir_margin): min(w, center_x + nadir_margin)] = False

        non_nadir_pixels = float(np.count_nonzero(mask_non_nadir))
        dark_pixels = int(np.count_nonzero((gray < 6) & mask_non_nadir))
        dark_pct = round((dark_pixels / max(1.0, non_nadir_pixels)) * 100.0, 2)
        metrics["non_nadir_dark_pct"] = dark_pct

        # Contrast / usable dynamic range
        std_contrast = round(float(np.std(gray)), 2)
        mean_intensity = round(float(np.mean(gray)), 2)
        metrics["mean_intensity"] = mean_intensity
        metrics["contrast_std"] = std_contrast

        # 3. Evaluate criteria
        is_invalid = False
        is_low_quality = False
        is_warning = False

        if sat_pct > cls.MAX_SATURATION_PCT:
            reasons.append(f"Excessive acoustic saturation ({sat_pct}% pixels >= 254) — potential transducer clipping")
            is_low_quality = True

        if dark_pct > cls.MAX_BLACKOUT_PCT:
            reasons.append(f"Severe signal blackout ({dark_pct}% pixels dark outside nadir) — possible transducer attenuation or incomplete ping swath")
            is_low_quality = True

        if std_contrast < cls.MIN_STD_CONTRAST:
            reasons.append(f"Very low acoustic dynamic range (std={std_contrast} < {cls.MIN_STD_CONTRAST}) — insufficient contrast for shadow delineation")
            is_low_quality = True

        # 4. Metadata Completeness Checks
        if sonar_meta is None:
            reasons.append("Sonar acquisition metadata unavailable (range/frequency unknown)")
            is_warning = True
        elif sonar_meta.is_simulated:
            reasons.append("Sonar parameters are simulated / default estimates")
            is_warning = True

        if nav_meta is None:
            reasons.append("Navigation telemetry unavailable (coordinates uncalibrated)")
            is_warning = True
        elif nav_meta.is_simulated:
            reasons.append("Navigation coordinates from simulated / replayed telemetry")
            is_warning = True

        # 5. Determine final QA status
        if is_invalid:
            status = "INVALID"
            processable = False
            rec = "Reject input. Re-acquire sonar swath."
        elif is_low_quality:
            status = "LOW_QUALITY"
            processable = True
            rec = "Quality compromised. Detections will be flagged with mandatory REVIEW_REQUIRED."
        elif is_warning:
            status = "WARNING"
            processable = True
            rec = "Image valid. Proceeding with simulated/uncalibrated telemetry flags."
        else:
            status = "VALID"
            processable = True
            rec = "Data quality certified. Proceed with standard inference."

        return DataQAResult(
            status=status,
            is_processable=processable,
            reasons=reasons,
            metrics=metrics,
            recommendation=rec
        )
