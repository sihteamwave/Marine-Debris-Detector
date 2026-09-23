"""
SIH26057 — Acoustic Shadow Segmenter & Evidence Engine (Gap 9)

Implements physical separation between:
1. Target Highlight Region (acoustic high-backscatter reflection from seabed object)
2. Acoustic Shadow Region (acoustic occlusion/void zone directly behind target)

Uses deterministic sonar geometry and computer vision morphology rather than
inventing ungrounded neural masks.
"""

from typing import List, Tuple, Optional, Dict, Any, Literal
import cv2
import numpy as np
import math

from backend.models.candidate_record import SonarEvidence


class AcousticShadowSegmenter:
    """
    Physically separates target highlight and acoustic shadow.
    Computes geometric alignment, contrast deficit, shadow polygon, and estimated target height.
    """

    @classmethod
    def segment_shadow(
        cls,
        gray: np.ndarray,
        target_polygon_px: List[List[float]],
        cx: float,
        cy: float,
        bw: float,
        bh: float,
        nadir_x: Optional[int] = None,
        altitude_m: float = 5.0,
        range_m: float = 50.0,
    ) -> Tuple[SonarEvidence, Optional[List[List[int]]], Optional[List[List[float]]]]:
        """
        Extracts acoustic shadow candidate polygon and physics metrics.
        Returns: (SonarEvidence, shadow_mask_px, shadow_mask_pct)
        """
        h, w = gray.shape[:2]
        if nadir_x is None:
            nadir_x = w // 2

        # 1. Determine acoustic propagation direction (away from nadir line)
        is_starboard = (cx >= nadir_x)
        # Vector points radially outward from center
        propagation_sign = 1 if is_starboard else -1

        # 2. Define Shadow Search Zone behind the target highlight
        # Shadow starts at the outer edge of target highlight and extends outwards
        probe_len = int(min(w * 0.35, max(bw * 2.2, 40.0)))
        
        if is_starboard:
            x_start = min(w - 1, int(cx + bw * 0.3))
            x_end = min(w, int(x_start + probe_len))
        else:
            x_end = max(0, int(cx - bw * 0.3))
            x_start = max(0, int(x_end - probe_len))

        y_start = max(0, int(cy - bh * 0.75))
        y_end = min(h, int(cy + bh * 0.75))

        if (x_end - x_start) < 6 or (y_end - y_start) < 6:
            # Insufficient area to extract valid acoustic shadow
            evidence = SonarEvidence(
                shadow_strength_pct=0.0,
                shadow_contrast_deficit_pct=0.0,
                shadow_presence="ABSENT",
                seabed_context="AMBIGUOUS",
                shape_consistency="AMBIGUOUS",
                target_shadow_aligned=True,
                acoustic_evidence_summary="Insufficient margin to extract acoustic shadow",
            )
            return evidence, None, None

        # 3. Extract shadow patch and determine ambient seabed vs shadow threshold
        patch = gray[y_start:y_end, x_start:x_end]
        
        # Surrounding seabed reference (sample strip slightly above and below)
        seabed_y1 = max(0, y_start - int(bh * 0.8))
        seabed_y2 = min(h, y_end + int(bh * 0.8))
        seabed_patch = gray[seabed_y1:seabed_y2, x_start:x_end]
        ambient_mean = float(np.mean(seabed_patch)) if seabed_patch.size > 0 else 120.0

        # Invert patch so darkest pixels become brightest for contour extraction
        inverted = cv2.bitwise_not(patch)
        blurred = cv2.GaussianBlur(inverted, (5, 5), 0)
        
        # Adaptive thresholding for shadow extraction
        thresh_val = max(140, int(255 - (ambient_mean * 0.65)))
        _, binary_shadow = cv2.threshold(blurred, thresh_val, 255, cv2.THRESH_BINARY)

        # 4. Find Contours of the Darkest Acoustic Void
        contours, _ = cv2.findContours(binary_shadow, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        shadow_polygon_px: Optional[List[List[int]]] = None
        shadow_polygon_pct: Optional[List[List[float]]] = None
        shadow_area = 0

        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            shadow_area = cv2.contourArea(largest_contour)

            if shadow_area >= 15:
                # Approximate polygon with epsilon
                epsilon = 0.025 * cv2.arcLength(largest_contour, True)
                approx = cv2.approxPolyDP(largest_contour, epsilon, True)
                
                # Shift contour coordinates from patch reference to full image
                shifted_pts: List[List[int]] = []
                shifted_pct: List[List[float]] = []
                for pt in approx:
                    px_x = int(pt[0][0] + x_start)
                    px_y = int(pt[0][1] + y_start)
                    shifted_pts.append([px_x, px_y])
                    shifted_pct.append([round((px_x / w) * 100.0, 2), round((px_y / h) * 100.0, 2)])

                if len(shifted_pts) >= 3:
                    shadow_polygon_px = shifted_pts
                    shadow_polygon_pct = shifted_pct

        # 5. Physics Metrics: Shadow Contrast Deficit and Strength
        target_y1 = max(0, int(cy - bh * 0.4))
        target_y2 = min(h, int(cy + bh * 0.4))
        target_x1 = max(0, int(cx - bw * 0.4))
        target_x2 = min(w, int(cx + bw * 0.4))
        target_patch = gray[target_y1:target_y2, target_x1:target_x2]

        target_intensity = float(np.mean(target_patch)) if target_patch.size > 0 else 180.0
        shadow_intensity = float(np.mean(patch)) if patch.size > 0 else 60.0

        # Contrast deficit relative to ambient seabed
        deficit = max(0.0, ambient_mean - shadow_intensity)
        contrast_deficit_pct = min(100.0, (deficit / max(ambient_mean, 10.0)) * 100.0)

        # Contrast between highlight and shadow
        hl_drop = max(0.0, target_intensity - shadow_intensity)
        shadow_strength_pct = min(100.0, max(0.0, (hl_drop / max(target_intensity, 15.0)) * 100.0))

        # Presence tier
        if shadow_strength_pct >= 55.0 and shadow_polygon_px is not None:
            shadow_presence: Literal["STRONG", "MODERATE", "WEAK", "ABSENT", "AMBIGUOUS"] = "STRONG"
        elif shadow_strength_pct >= 30.0:
            shadow_presence = "MODERATE"
        elif shadow_strength_pct >= 15.0:
            shadow_presence = "WEAK"
        elif shadow_area > 0:
            shadow_presence = "AMBIGUOUS"
        else:
            shadow_presence = "ABSENT"

        # 6. Target-Shadow Alignment Verification
        # Shadow MUST extend outward from nadir line. If the dark patch is towards nadir, it's false or misaligned!
        target_shadow_aligned = True
        if shadow_polygon_px:
            sh_mean_x = sum(p[0] for p in shadow_polygon_px) / len(shadow_polygon_px)
            if is_starboard and sh_mean_x < cx:
                target_shadow_aligned = False
            elif not is_starboard and sh_mean_x > cx:
                target_shadow_aligned = False

        # 7. Acoustic Shadow Height Equation
        # Height of target H_t = (L_shadow * H_sensor) / (R_ground + L_shadow)
        px_to_m = (range_m * 2.0) / float(w)
        shadow_length_m = (probe_len * (deficit / max(ambient_mean, 1.0))) * px_to_m
        dist_from_nadir_px = abs(cx - nadir_x)
        ground_range_m = max(1.0, (dist_from_nadir_px / (w / 2.0)) * range_m)

        debris_height_est = None
        if shadow_presence in ["STRONG", "MODERATE"] and target_shadow_aligned:
            debris_height_est = round(
                (shadow_length_m * altitude_m) / max(1.0, (ground_range_m + shadow_length_m)), 2
            )

        summary = (
            f"Acoustic shadow {shadow_presence.lower()} ({shadow_strength_pct:.0f}% strength, "
            f"{contrast_deficit_pct:.0f}% seabed deficit). "
            + (f"Estimated target acoustic relief: {debris_height_est:.1f} m." if debris_height_est else "Relief height uncertain.")
        )

        evidence = SonarEvidence(
            shadow_strength_pct=round(shadow_strength_pct, 1),
            shadow_contrast_deficit_pct=round(contrast_deficit_pct, 1),
            shadow_presence=shadow_presence,
            seabed_context="CONSISTENT" if contrast_deficit_pct > 15.0 else "AMBIGUOUS",
            shape_consistency="CONSISTENT" if target_shadow_aligned else "INCONSISTENT",
            target_shadow_aligned=target_shadow_aligned,
            estimated_debris_height_m=debris_height_est,
            shadow_length_m=round(shadow_length_m, 2),
            ground_range_m=round(ground_range_m, 2),
            acoustic_evidence_summary=summary,
        )

        return evidence, shadow_polygon_px, shadow_polygon_pct
