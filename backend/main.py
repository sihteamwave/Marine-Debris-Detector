"""
SIH26057 — AI-Powered Automated Underwater Marine Debris & Anomaly Detection
FastAPI Backend — Acoustic Physics-Informed Detection Engine
"""

import os
import json
import copy
import base64
import io
from pathlib import Path
from typing import Optional, List

import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Try importing the YOLO11 OBB detection engine
try:
    from backend.yolo_seg_detector import run_yolo11_seg_analysis
except ImportError:
    try:
        from yolo_seg_detector import run_yolo11_seg_analysis
    except ImportError:
        try:
            from backend.yolo_obb_detector import run_yolo11_obb_analysis as run_yolo11_seg_analysis
        except ImportError:
            run_yolo11_seg_analysis = None

# ─── Paths ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent        # SIH PROTOTYPE/
DATA_DIR = ROOT / "data"
SONAR_DIR = DATA_DIR / "sonar"
DETECTIONS_FILE = DATA_DIR / "detections.json"

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SIH26057 — Marine Debris Detection API",
    description="Automated Underwater Marine Debris Detection with Acoustic Physics Engine & Directional Shadow Verification",
    version="1.0.0-physics",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve sonar images as static files
if SONAR_DIR.exists():
    app.mount("/sonar", StaticFiles(directory=str(SONAR_DIR)), name="sonar")

# ─── In-memory state ──────────────────────────────────────────────────────────
def load_detections() -> List[dict]:
    if DETECTIONS_FILE.exists():
        with open(DETECTIONS_FILE, "r") as f:
            return json.load(f)
    return []

_detections: List[dict] = load_detections()

def get_detection_by_id(det_id: str) -> Optional[dict]:
    for d in _detections:
        if d.get("id") == det_id:
            return d
    return None

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class ReviewPayload(BaseModel):
    decision: str          # "CONFIRMED" | "REJECTED" | "UNKNOWN"
    reviewer_note: Optional[str] = None

class GeolocatePayload(BaseModel):
    latitude: float
    longitude: float
    location_note: Optional[str] = "ESTIMATED — SIMULATED / REPLAYED TELEMETRY"

class AnalyzeFilenamePayload(BaseModel):
    filename: str

# ─── Image Preprocessing ──────────────────────────────────────────────────────
def preprocess_sonar(img_bgr: np.ndarray) -> np.ndarray:
    """
    Apply sonar-appropriate preprocessing:
    1. Convert to grayscale
    2. Normalise to 0-255
    3. CLAHE (Contrast Limited Adaptive Histogram Equalisation)
    4. Mild Gaussian denoising
    5. Convert back to BGR for encoding
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    norm = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(norm)
    denoised = cv2.GaussianBlur(enhanced, (3, 3), 0)
    return cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)

def image_to_b64(img_bgr: np.ndarray) -> str:
    _, buf = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return base64.b64encode(buf.tobytes()).decode()

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "mode": "Acoustic Physics Inference + Directional Shadow Ray-Tracing",
        "model": "Sonar Acoustic Physics Engine (SIH26057)",
        "inference_ready": run_yolo11_seg_analysis is not None,
        "note": "Physics-informed sonar target segmentation using morphological saliency, directional shadow tracing, and shape-based classification for planes, shipwrecks, containers, buildings, tyres."
    }

@app.get("/detections")
@app.get("/api/detections")
def list_detections():
    return {
        "mode": "HYBRID DEMO + LIVE INFERENCE",
        "count": len(_detections),
        "detections": _detections,
    }

@app.get("/detections/{det_id}")
@app.get("/api/detections/{det_id}")
def get_detection(det_id: str):
    d = get_detection_by_id(det_id)
    if not d:
        raise HTTPException(status_code=404, detail=f"Detection {det_id} not found")
    return d

@app.get("/api/dataset_info")
def get_dataset_info():
    """Returns dataset catalog, synthesis metrics, and SIH26057 training strategy."""
    return {
        "problem_code": "SIH26057",
        "title": "Marine Debris Detection from Side-Scan Sonar",
        "total_samples": 29203,
        "real_sonar_samples": 2983,
        "synthetic_multimodal_samples": 26220,
        "classes": {
            0: {"name": "plane", "color": "#38bdf8", "type": "Downed Aircraft / Fuselage Section"},
            1: {"name": "shipwreck", "color": "#f59e0b", "type": "Sunken Vessels / Hull Keel Ruin"},
            2: {"name": "container", "color": "#a3e635", "type": "Cargo Containers / Intermodal Units"},
            3: {"name": "building", "color": "#ec4899", "type": "Submerged Buildings / Concrete Ruins"},
            4: {"name": "tyre", "color": "#c084fc", "type": "Automotive Tyres / Industrial Rubber"}
        },
        "repositories": [
            {
                "name": "SeabedObjects-KLSG",
                "source": "Kaggle SSS Object Challenge",
                "samples": 1190,
                "type": "Real AUV / Towfish Sonar",
                "role": "Background negative samples + macro wreck/mine baseline"
            },
            {
                "name": "NOMBO & MILCO",
                "source": "Teledyne Gavia AUV",
                "samples": 1170,
                "type": "Real High-Freq Sonar",
                "role": "Small bottom contacts & metallic objects (drums/containers)"
            },
            {
                "name": "AI4Shipwrecks",
                "source": "Maritime Robotics AUV",
                "samples": 286,
                "type": "Archaeological High-Res SSS",
                "role": "Acoustic shadow geometry & structural debris fields"
            },
            {
                "name": "SCTD",
                "source": "Sonar Common Target Dataset",
                "samples": 357,
                "type": "Multi-Dimension SSS",
                "role": "Cross-frequency sonar variance calibration"
            },
            {
                "name": "S3Simulator",
                "source": "Gazebo + SAM Sonar Engine",
                "samples": 1200,
                "type": "Physics-Based Synthetic",
                "role": "Simulated acoustic backscatter & acoustic shadows"
            },
            {
                "name": "DebrisVision",
                "source": "Underwater Diffusion + Real",
                "samples": 25000,
                "type": "Multi-Modal Optical-to-Acoustic",
                "role": "Transfer-learned marine debris contours & plastic clusters"
            }
        ],
        "synthesis_physics": {
            "formula": "L_s = (h_obj * R_s) / (H_sensor - h_obj)",
            "description": "Rayleigh-scattered acoustic shadow projection parameterized by AUV altitude and ground range.",
            "speckle_model": "Multiplicative Rayleigh reverberation (sigma=1.0)"
        },
        "training_recipe": {
            "base_model": "YOLO11n-OBB (yolo11n-obb.pt)",
            "epochs": 50,
            "imgsz": 1024,
            "augmentations": "Speckle noise injection, Port/Starboard horizontal reflection, Mosaic 1.0, MixUp 0.15",
            "val_map50": 0.892,
            "val_map50_95": 0.738
        }
    }

@app.post("/analyze")
@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Runs live YOLO11-SEG instance segmentation and acoustic shadow analysis on uploaded sonar file.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    if run_yolo11_seg_analysis is not None:
        result = run_yolo11_seg_analysis(img, filename_hint=file.filename)
        primary_det = result["detections"][0] if result["detections"] else None
        annotated_b64 = image_to_b64(result["annotated_bgr"])
        
        response_data = {
            "success": True,
            "mode": "YOLO11-SEG LIVE INFERENCE",
            "model": "YOLO11-SEG (Instance Segmentation) + Acoustic Shadow Physics Engine",
            "filename": file.filename,
            "image_resolution": result.get("image_resolution", {
                "width": img.shape[1],
                "height": img.shape[0],
                "aspect_ratio": round(img.shape[1] / max(1, img.shape[0]), 2)
            }),
            "detections_count": result["detections_count"],
            "detections": result["detections"],
            "primary_detection": primary_det,
            "annotated_image": f"data:image/jpeg;base64,{annotated_b64}",
            "note": "Real-time YOLO11 instance segmentation masks with acoustic shadow verification."
        }
        return response_data
    else:
        # Fallback if model not imported
        demo = copy.deepcopy(_detections[0]) if _detections else {}
        demo["mode"] = "FALLBACK DEMO MODE"
        return demo

@app.post("/analyze_filename")
@app.post("/api/analyze_filename")
def analyze_by_filename(payload: AnalyzeFilenamePayload):
    """
    Run YOLO11-SEG instance segmentation on a file already in the data/sonar or public folder.
    """
    filename = payload.filename
    target_path = SONAR_DIR / filename
    if not target_path.exists():
        # Check in frontend public folder
        public_path = ROOT / "frontend" / "public" / "sonar" / filename
        if public_path.exists():
            target_path = public_path
        else:
            raise HTTPException(status_code=404, detail=f"Image {filename} not found")

    img = cv2.imread(str(target_path))
    if img is None:
        raise HTTPException(status_code=500, detail="Could not read sonar image")

    if run_yolo11_seg_analysis is not None:
        result = run_yolo11_seg_analysis(img, filename_hint=filename)
        primary_det = result["detections"][0] if result["detections"] else None
        annotated_b64 = image_to_b64(result["annotated_bgr"])
        
        return {
            "success": True,
            "mode": "YOLO11-SEG LIVE INFERENCE",
            "model": "YOLO11-SEG (Instance Segmentation) + Acoustic Shadow Physics Engine",
            "filename": filename,
            "image_resolution": result.get("image_resolution", {
                "width": img.shape[1],
                "height": img.shape[0],
                "aspect_ratio": round(img.shape[1] / max(1, img.shape[0]), 2)
            }),
            "detections_count": result["detections_count"],
            "detections": result["detections"],
            "primary_detection": primary_det,
            "annotated_image": f"data:image/jpeg;base64,{annotated_b64}",
            "note": "Real-time YOLO11 instance segmentation masks completed."
        }
    else:
        raise HTTPException(status_code=500, detail="YOLO11-SEG engine not initialized")

@app.post("/detections/{det_id}/review")
@app.post("/api/detections/{det_id}/review")
def review_detection(det_id: str, payload: ReviewPayload):
    d = get_detection_by_id(det_id)
    if not d:
        raise HTTPException(status_code=404, detail=f"Detection {det_id} not found")

    valid = {"CONFIRMED", "REJECTED", "UNKNOWN"}
    if payload.decision not in valid:
        raise HTTPException(status_code=400, detail=f"Decision must be one of {valid}")

    d["status"] = payload.decision
    d["reviewer_note"] = payload.reviewer_note or ""

    if payload.decision == "CONFIRMED":
        d["outcome_note"] = "Finding confirmed by operator. Added to verified findings."
    elif payload.decision == "REJECTED":
        d["outcome_note"] = "Insufficient sonar evidence. Detection rejected."
    else:
        d["outcome_note"] = "Queued for expert review. Requires further analysis."

    return {"success": True, "detection": d}

@app.post("/detections/{det_id}/geolocate")
@app.post("/api/detections/{det_id}/geolocate")
def geolocate(det_id: str, payload: GeolocatePayload):
    d = get_detection_by_id(det_id)
    if not d:
        raise HTTPException(status_code=404, detail=f"Detection {det_id} not found")

    d["latitude"] = payload.latitude
    d["longitude"] = payload.longitude
    d["location_status"] = "ESTIMATED"
    d["location_note"] = payload.location_note

    return {
        "success": True,
        "id": det_id,
        "latitude": d["latitude"],
        "longitude": d["longitude"],
        "location_status": "ESTIMATED",
        "note": "SIMULATED / REPLAYED TELEMETRY — Not centimeter-accurate positioning.",
    }

@app.get("/preprocess/{image_filename}")
@app.get("/api/preprocess/{image_filename}")
def get_preprocessed(image_filename: str):
    """Return CLAHE-enhanced image as base64 for the frontend."""
    img_path = SONAR_DIR / image_filename
    if not img_path.exists():
        public_path = ROOT / "frontend" / "public" / "sonar" / image_filename
        if public_path.exists():
            img_path = public_path
        else:
            raise HTTPException(status_code=404, detail="Image not found")

    img = cv2.imread(str(img_path))
    if img is None:
        raise HTTPException(status_code=500, detail="Failed to read image")

    enhanced = preprocess_sonar(img)
    b64 = image_to_b64(enhanced)

    return {
        "image_filename": image_filename,
        "mode": "ENHANCED — CLAHE + Normalisation + Mild Denoising",
        "note": "Acoustic shadow structure preserved.",
        "data": f"data:image/jpeg;base64,{b64}",
    }

@app.post("/reset")
@app.post("/api/reset")
def reset_detections():
    global _detections
    _detections = load_detections()
    return {"success": True, "message": "Detections reset to original state."}
