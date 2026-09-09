"""
SIH26057 Marine Debris Synthetic Sonar Engine
Combines optical/synthetic contours (DebrisVision / S3Simulator) with acoustic physics:
  1. Grazing angle acoustic backscatter: near-range highlight reflection.
  2. Acoustic shadow projection: L_s = (h * R_s) / (H_sensor - h)
  3. Rayleigh multiplicative speckle noise characteristic of underwater acoustic reverberation.
  4. Nadir blind-zone beam pattern attenuation.
  5. Automatic YOLO11-OBB annotation export ([cls, x1, y1, x2, y2, x3, y4, x5, y6, x7, x8]).
"""

import math
import random
from pathlib import Path
from typing import List, Tuple, Dict, Any
import cv2
import numpy as np


class SyntheticSonarDebrisGenerator:
    def __init__(self, sensor_altitude_m: float = 15.0, swath_range_m: float = 50.0):
        """
        :param sensor_altitude_m: Altitude of the AUV above seafloor (typically 10-20m).
        :param swath_range_m: Max lateral sonar swath range per port/starboard channel (m).
        """
        self.h_sensor = sensor_altitude_m
        self.swath_range = swath_range_m

    def generate_seafloor_background(self, width: int = 1024, height: int = 512,
                                     sand_ripple_freq: float = 0.03) -> np.ndarray:
        """
        Generates realistic ambient seafloor reverberation with sand ripples and speckle noise.
        """
        # Base seafloor intensity gradient (beam falloff away from nadir)
        x_coords = np.linspace(0, 1, width)
        y_coords = np.linspace(0, 1, height)
        xx, yy = np.meshgrid(x_coords, y_coords)

        # Nadir is typically in the center (x ~ 0.5)
        dist_from_nadir = np.abs(xx - 0.5) * 2.0  # 0 at center, 1 at edge
        # Grazing angle backscatter curve (Lambert's law approximation)
        grazing_factor = np.sin(np.arctan(self.h_sensor / (dist_from_nadir * self.swath_range + 0.1)))
        base_intensity = 70.0 * grazing_factor + 30.0

        # Add acoustic sand ripples
        ripples = 12.0 * np.sin(2.0 * math.pi * xx * width * sand_ripple_freq) * np.cos(yy * 4.0)

        # Multiplicative Rayleigh-like speckle noise (characteristic of coherent acoustic sonar)
        rayleigh_noise = np.random.rayleigh(scale=1.0, size=(height, width))
        seafloor = (base_intensity + ripples) * rayleigh_noise

        # Nadir altitude blind zone (dark strip in the middle)
        nadir_strip_width = int(width * 0.04)
        center_x = width // 2
        seafloor[:, center_x - nadir_strip_width: center_x + nadir_strip_width] *= 0.15

        return np.clip(seafloor, 0, 255).astype(np.uint8)

    def calculate_shadow_length(self, object_height_m: float, ground_range_m: float) -> float:
        """
        Computes acoustic shadow length L_s:
        L_s = (h_obj * R_s) / (H_sensor - h_obj)
        """
        denom = max(self.h_sensor - object_height_m, 0.5)
        return (object_height_m * ground_range_m) / denom

    def inject_debris_object(
        self,
        canvas: np.ndarray,
        debris_type: str = "ghost_net",
        pos_x: int = 350,
        pos_y: int = 240,
        size_m: Tuple[float, float, float] = (3.5, 2.0, 1.2),  # (length, width, height)
        orientation_deg: float = 35.0
    ) -> Dict[str, Any]:
        """
        Renders a debris object with acoustic highlight + projected acoustic shadow.
        Returns oriented bounding box vertices for YOLO-OBB annotation.
        """
        h_canvas, w_canvas = canvas.shape[:2]
        center_x = w_canvas // 2
        is_starboard = pos_x >= center_x

        # Ground range from nadir
        dx_px = abs(pos_x - center_x)
        ground_range_m = (dx_px / (w_canvas / 2)) * self.swath_range
        obj_len_m, obj_wid_m, obj_hgt_m = size_m

        # Compute shadow length in meters & pixels
        shadow_len_m = self.calculate_shadow_length(obj_hgt_m, ground_range_m)
        m_to_px = (w_canvas / 2) / self.swath_range
        shadow_len_px = int(shadow_len_m * m_to_px)
        obj_len_px = int(obj_len_m * m_to_px)
        obj_wid_px = int(obj_wid_m * m_to_px)

        # Shadow direction is directly away from nadir
        shadow_dir_x = 1 if is_starboard else -1

        # 1. Draw Acoustic Shadow (Near Zero return zone behind object)
        shadow_start_x = pos_x
        shadow_end_x = int(pos_x + shadow_dir_x * shadow_len_px)
        
        # Rotated rectangle for the shadow
        shadow_center = ((pos_x + shadow_end_x) // 2, pos_y)
        shadow_size = (abs(shadow_end_x - shadow_start_x) + obj_len_px, obj_wid_px)
        shadow_rect = (shadow_center, shadow_size, orientation_deg * 0.3)
        shadow_box = cv2.boxPoints(shadow_rect).astype(np.int32)

        # Draw deep acoustic shadow (values 5-20)
        shadow_mask = np.zeros_like(canvas, dtype=np.uint8)
        cv2.fillPoly(shadow_mask, [shadow_box], 255)
        canvas[shadow_mask > 0] = np.random.randint(5, 22, size=canvas[shadow_mask > 0].shape, dtype=np.uint8)

        # 2. Draw Acoustic Highlight (Specular return on front-facing surface)
        highlight_mask = np.zeros_like(canvas, dtype=np.uint8)
        obj_center = (pos_x, pos_y)
        obj_rect = (obj_center, (obj_len_px, obj_wid_px), orientation_deg)
        obj_box = cv2.boxPoints(obj_rect).astype(np.int32)
        cv2.fillPoly(highlight_mask, [obj_box], 255)

        # Textural highlight with speckle tailored to each class
        if debris_type == "plane":
            # Aluminum aerodynamic fuselage and wing return
            highlight_vals = np.random.normal(235, 18, size=canvas[highlight_mask > 0].shape)
        elif debris_type == "shipwreck":
            # Massive metallic/wooden vessel hull with ribbing
            highlight_vals = np.random.normal(220, 25, size=canvas[highlight_mask > 0].shape)
        elif debris_type == "container":
            # Crisp, saturated steel intermodal container return
            highlight_vals = np.random.normal(245, 10, size=canvas[highlight_mask > 0].shape)
        elif debris_type == "building":
            # Rough concrete/masonry foundation with multi-edge reflection
            highlight_vals = np.random.normal(205, 30, size=canvas[highlight_mask > 0].shape)
        elif debris_type == "tyre":
            # Dense synthetic rubber return with hollow core
            highlight_vals = np.random.normal(190, 22, size=canvas[highlight_mask > 0].shape)
        else:
            highlight_vals = np.random.normal(200, 30, size=canvas[highlight_mask > 0].shape)

        canvas[highlight_mask > 0] = np.clip(highlight_vals, 0, 255).astype(np.uint8)

        # 3. Format YOLO-OBB annotation: [cls, x1, y1, x2, y2, x3, y4, x4, y4] normalized
        class_map = {
            "plane": 0,
            "shipwreck": 1,
            "container": 2,
            "building": 3,
            "tyre": 4
        }
        cls_id = class_map.get(debris_type, 2)
        normalized_corners = []
        for pt in obj_box:
            nx = max(0.0, min(1.0, pt[0] / w_canvas))
            ny = max(0.0, min(1.0, pt[1] / h_canvas))
            normalized_corners.extend([round(nx, 6), round(ny, 6)])

        return {
            "class_id": cls_id,
            "debris_type": debris_type,
            "yolo_obb_format": f"{cls_id} " + " ".join(map(str, normalized_corners)),
            "corners_px": obj_box.tolist(),
            "shadow_len_m": round(shadow_len_m, 2),
            "ground_range_m": round(ground_range_m, 2),
            "object_height_m": obj_hgt_m
        }

    def generate_synthetic_scene(self, output_img_path: Path, output_txt_path: Path,
                                 num_debris: int = 2) -> Dict[str, Any]:
        """
        Generates a complete side-scan sonar image and saves YOLO-OBB ground-truth label.
        """
        w, h = 1024, 512
        canvas = self.generate_seafloor_background(w, h)
        annotations = []

        debris_choices = ["plane", "shipwreck", "container", "building", "tyre"]
        for _ in range(num_debris):
            dtype = random.choice(debris_choices)
            # Pick a position away from nadir
            px = random.choice([random.randint(80, 430), random.randint(594, 944)])
            py = random.randint(80, 430)
            
            # Dimension distributions based on class
            if dtype == "plane":
                dim = (random.uniform(8.0, 18.0), random.uniform(3.0, 6.0), random.uniform(2.0, 4.5))
            elif dtype == "shipwreck":
                dim = (random.uniform(15.0, 35.0), random.uniform(5.0, 10.0), random.uniform(3.0, 7.0))
            elif dtype == "container":
                dim = (random.uniform(6.0, 12.2), random.uniform(2.4, 2.6), random.uniform(2.5, 2.9))
            elif dtype == "building":
                dim = (random.uniform(12.0, 25.0), random.uniform(8.0, 16.0), random.uniform(3.0, 8.0))
            else: # tyre
                dim = (random.uniform(0.9, 2.0), random.uniform(0.9, 2.0), random.uniform(0.4, 0.9))

            angle = random.uniform(0.0, 180.0)
            det_info = self.inject_debris_object(canvas, dtype, px, py, dim, angle)
            annotations.append(det_info)

        # Apply final sonar sensor blurring & colormap ready encoding
        canvas = cv2.GaussianBlur(canvas, (3, 3), 0.5)
        
        # Save image
        output_img_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(output_img_path), canvas)

        # Save YOLO-OBB annotation text
        output_txt_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_txt_path, "w", encoding="utf-8") as f:
            for ann in annotations:
                f.write(ann["yolo_obb_format"] + "\n")

        return {
            "image_path": str(output_img_path),
            "label_path": str(output_txt_path),
            "annotations": annotations
        }


if __name__ == "__main__":
    generator = SyntheticSonarDebrisGenerator(sensor_altitude_m=12.0, swath_range_m=50.0)
    out_dir = Path("./training/synthetic_samples")
    out_dir.mkdir(parents=True, exist_ok=True)
    res = generator.generate_synthetic_scene(
        out_dir / "synthetic_sonar_001.jpg",
        out_dir / "synthetic_sonar_001.txt",
        num_debris=3
    )
    print(f"Synthesized acoustic scene saved with {len(res['annotations'])} debris targets.")
