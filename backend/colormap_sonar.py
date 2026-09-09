"""
Apply oceanic side-scan sonar colormap (deep navy -> electric cyan -> white)
matching hydrographic survey waterfall displays.
"""
import cv2
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data" / "sonar"

def process_images():
    lut_b = np.zeros(256, dtype=np.uint8)
    lut_g = np.zeros(256, dtype=np.uint8)
    lut_r = np.zeros(256, dtype=np.uint8)

    for i in range(256):
        t = i / 255.0
        if t < 0.2:
            k = t / 0.2
            lut_b[i] = int(25 * (1 - k) + 75 * k)
            lut_g[i] = int(10 * (1 - k) + 45 * k)
            lut_r[i] = int(5 * (1 - k) + 12 * k)
        elif t < 0.5:
            k = (t - 0.2) / 0.3
            lut_b[i] = int(75 * (1 - k) + 175 * k)
            lut_g[i] = int(45 * (1 - k) + 125 * k)
            lut_r[i] = int(12 * (1 - k) + 26 * k)
        elif t < 0.8:
            k = (t - 0.5) / 0.3
            lut_b[i] = int(175 * (1 - k) + 240 * k)
            lut_g[i] = int(125 * (1 - k) + 215 * k)
            lut_r[i] = int(26 * (1 - k) + 85 * k)
        else:
            k = (t - 0.8) / 0.2
            lut_b[i] = int(240 * (1 - k) + 255 * k)
            lut_g[i] = int(215 * (1 - k) + 255 * k)
            lut_r[i] = int(85 * (1 - k) + 255 * k)

    for filename in ["clear_debris.jpg", "weak_candidate.jpg", "unknown_anomaly.jpg"]:
        p = DATA_DIR / filename
        if not p.exists():
            continue
        img = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        
        b = cv2.LUT(img, lut_b)
        g = cv2.LUT(img, lut_g)
        r = cv2.LUT(img, lut_r)
        colored = cv2.merge([b, g, r])

        out_name = p.stem + "_blue.jpg"
        cv2.imwrite(str(DATA_DIR / out_name), colored)
        print(f"Generated {out_name}")

if __name__ == "__main__":
    process_images()
