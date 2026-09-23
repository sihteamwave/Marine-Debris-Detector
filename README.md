# SAMUDRA-SURAKSHA (समुद्र-सुरक्षा) v2
## National Marine Debris & Hydrographic Intelligence Decision-Support Platform
### Developed for the Ministry of Earth Sciences (MoES), Indian Coast Guard (ICG), NIOT & National Hydrographic Office (NHO)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB.svg?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.4-EE4C2C.svg?logo=pytorch)](https://pytorch.org)
[![Ultralytics YOLO11-Seg](https://img.shields.io/badge/YOLO11--Seg-Fine--Tuned-00FFFF.svg)](https://ultralytics.com)
[![React 18 + Vite](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB.svg?logo=react)](https://vitejs.dev)
[![IHO S-44 Ed 6.2.0](https://img.shields.io/badge/Standard-IHO_S--44_Ed_6.2.0-00C853.svg)](https://iho.int)

> **Core Operating Principle:**  
> *"AI proposes candidates • Sonar evidence assesses acoustic validity • Uncertainty controls automation • Human hydrographers make the final decision."*

---

## 🌊 Executive Overview

**SAMUDRA-SURAKSHA (समुद्र-सुरक्षा)** is an offline-first, sovereign decision-support platform designed to ingest raw high-frequency side-scan sonar (SSS) imagery and bathymetric navigation telemetry, detect and segment underwater marine debris and navigational hazards, invert acoustic shadow grazing geometry to calculate physical obstacle relief off the seafloor ($h_{obj}$), and generate standard inter-agency tasking packages for India's maritime authorities.

The platform is strictly an **operational decision-support system**, not an autonomous statutory authority. It maintains an unbroken chain of custody between neural detection proposals, acoustic physics verification, geospatial uncertainty footprints, and authorized human sign-off.

### Stakeholder Alignment:
- **Ministry of Earth Sciences (MoES) / NCCR:** National marine plastic debris assessment, benthic habitat conservation, and Deep Ocean Mission environmental monitoring.
- **Indian Coast Guard (ICG) / MoD:** Search, rescue, and salvage ground-truthing (NOS-DCP 2023), fairway obstruction verification, and ROV/diver tasking packages.
- **National Institute of Ocean Technology (NIOT), Chennai:** Deep-sea AUV/towfish acoustic data processing and subsea infrastructure inspection.
- **National Hydrographic Office (NHO), Dehradun / Indian Navy:** Navigational safety certification under IHO S-44 Edition 6.2.0 (Order 1a / Special Order) and NAVAREA VIII Notice to Mariners (NOTMAR) drafting.

---

## 🏛️ System Architecture

```
SSS Waterfall (.xtf / .jsf / .jpg) + GNSS/INS Telemetry
               │
               ▼
┌──────────────────────────────────────────────┐
│  STAGE 1: Data Ingestion & Metadata Contract │ ──> SonarMetadata & NavigationMetadata
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 2: Pre-Inference Sonar QA Gate        │ ──> VALID / WARNING / LOW_QUALITY / INVALID
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 3: Sonar-Aware Preprocessing          │ ──> Multi-Scale Top-Hat + CLAHE Equalization
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 4: Neural Perception Engine           │ ──> YOLO11-Seg (Fine-Tuned Sonar Baseline)
└──────────────────────┬───────────────────────┘     Mask mAP@50: 31.85% | Box mAP@50: 33.12%
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 5: Directional Acoustic Shadow Engine │ ──> h_obj = (Ls · Hsensor) / (Rs + Ls)
└──────────────────────┬───────────────────────┘     Under-Keel Clearance: UKC = Depth - h_obj
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 6: Cross-Frame / Cross-Swath Fusion   │ ──> Persistent Target IDs (TGT-001, TGT-002)
└──────────────────────┬───────────────────────┘     Duplicate Alert Suppression
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 7: Uncertainty & Explicit Abstention  │ ──> ACCEPTED / REVIEW_REQUIRED / UNKNOWN
└──────────────────────┬───────────────────────┘     Calibrated Brier / ECE Reliability Scoring
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 8: Local Offline Statutory RAG        │ ──> 7 Authoritative Frameworks (IHO, MoES,
└──────────────────────┬───────────────────────┘     Merchant Shipping Act, CPCB, ICG NOS-DCP)
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 9: JEV Decision-Triage Adapter        │ ──> Bounded Review Effort Triage
└──────────────────────┬───────────────────────┘     Sovereign Boundary (Metadata Only)
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 10: Human-in-the-Loop Verification    │ ──> CONFIRM / REJECT / UNKNOWN
└──────────────────────┬───────────────────────┘     Role-Based Access (4 Authority Profiles)
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 11: Geolocation & Coverage GIS Engine │ ──> WGS84 + Layback + Covariance Ellipse
└──────────────────────┬───────────────────────┘     5 Coverage States (Nadir Blind-Zone Model)
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 12: Inter-Agency Action Dispatch      │ ──> NHO NOTMAR Draft, ICG ROV Tasking,
└──────────────────────┬───────────────────────┘     CPCB Environmental Remediation Order
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  STAGE 13: Re-Survey Queue & Audit Vault     │ ──> Orthogonal Survey Queue & SHA-256 Vault
└──────────────────────────────────────────────┘
```

---

## 🔬 Genuine Perception Engine & Model Lineage

Unlike prototypes relying on COCO-pretrained weights or synthetic demo bypasses, SAMUDRA-SURAKSHA executes genuine neural tensor inference:

- **Active Weights Checkpoint:** `weights/yolo11_seg_best.pt` (6.0 MB, Ultralytics YOLO11-Seg)
- **Training Dataset:** `dataset_targeted` (144 sonar images, 5 marine classes)
- **Validation Metrics (`weights/training_metrics.json`):**
  - **Mask mAP@50:** `0.3185` (31.85%)
  - **Mask mAP@50-95:** `0.2299` (22.99%)
  - **Box mAP@50:** `0.3312` (33.12%)
  - **Epochs Trained:** 3 epochs on PyTorch 2.4.0
- **Acoustic Physics Fusion:** Neural segmentations are combined with directional shadow ray-tracing, multi-scale CLAHE, Top-Hat morphology, and Otsu highlight sweeps.
- **Zero Demo Bypasses:** Hardcoded filename branches (`if "clear_debris" in hint:`) have been completely removed. All 10 benchmark sonar sets pass automated neural regression testing.

---

## ⚡ Key Capabilities

### 1. Acoustic Height-from-Shadow Inversion ($h_{obj}$) & UKC Gauge
Calculates physical obstacle relief off the seabed:
$$h_{obj} = \frac{L_s \cdot H_{sensor}}{R_s + L_s}$$
- Computes **Under-Keel Clearance ($UKC = \text{Depth} - h_{obj}$)** in real time.
- Triggers **`CRITICAL_HAZNAV`** navigational warnings when $UKC < 15.0\text{ m}$ in active shipping lanes.

### 2. JEV (Judge-Evaluator-Verifier) Decision-Triage Layer
- **Sovereign Cloud Boundary:** Consumes only structured `CandidateRecord` metadata; raw sonar waterfall imagery never leaves the local environment.
- **5 Bounded Questions:** Evaluates expert review necessity, evidence sufficiency, early hazard escalation, orthogonal re-survey needs, and UNKNOWN classification preference.
- **100% Offline-First:** Deterministic local fallback executes without interruption if remote services are unreachable.

### 3. Authoritative Statutory RAG Engine
Offline retrieval from 7 versioned maritime statutory frameworks:
1. **IHO S-44 Edition 6.2.0:** Standards for Hydrographic Surveys (Order 1a / Special Order allowable TVU/THU).
2. **Merchant Shipping Act, 1958 §354:** Statutory duty to report dangers to navigation and wrecks.
3. **ICG NOS-DCP 2023:** Indian Coast Guard National Oil Spill & Debris Contingency Plan.
4. **MoES/NCCR National Marine Litter Assessment Protocol (2022):** Macro/micro-debris classification.
5. **CPCB Plastic Waste Management Amendment Rules (2024):** EPR salvage compliance.
6. **Maritime Zones of India Act, 1976:** Territorial waters, Contiguous Zone, EEZ jurisdiction.
7. **IMO MARPOL 73/78 Annex V:** Prevention of pollution by marine garbage.

### 4. Inter-Agency SOP Action Dispatch Console
1-click operational draft generation:
- **NHO Notice to Mariners (NOTMAR):** Standard NAVAREA VIII radio navigational warning text with least depth, obstacle height, and WGS84 coordinates.
- **Indian Coast Guard Task Package:** MRCC dispatch orders for ROV optical ground-truthing and diver safety advisories (entanglement risk).
- **CPCB Environmental Remediation Order:** Salvage crane barge tasking, containment boom directives, and EPR recycling manifests.

### 5. Multi-Role RBAC & 6 Strategic Pan-India Sectors
- **Roles:** `CHIEF_CERTIFIER` (NHO), `FIELD_HYDROGRAPHER` (AUV/ROV), `HARBOR_MASTER` (Port VTS), `ENVIRONMENT_DIRECTOR` (MoES/CPCB).
- **Sectors:** Western Offshore (Mumbai High), Gulf of Khambhat (Gujarat), Palk Strait & Gulf of Mannar, Eastern Seaboard (Chennai Outer Roads), Andaman & Nicobar (Ten Degree Channel), and Lakshadweep Sea (Nine Degree Channel).

---

## 🚀 Quick Start Guide

### Option A: 1-Click Startup (Recommended)
Double-click **`start.bat`** in the project root:
```powershell
.\start.bat
```
This launches:
1. **FastAPI Backend:** `http://127.0.0.1:8000`
2. **Vite React Frontend:** `http://localhost:5173`
3. Automatically opens the National Maritime Command Cockpit in your default browser.

---

### Option B: Manual Command-Line Startup

#### 1. Start the FastAPI Backend (Port 8000)
```powershell
# Open Terminal 1
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Health Status: `http://127.0.0.1:8000/api/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Platform Government Status: `http://127.0.0.1:8000/api/government/status`

#### 2. Start the React + Vite Frontend (Port 5173)
```powershell
# Open Terminal 2
cd frontend
npm run dev
```
- Command Center UI: `http://localhost:5173`

---

## 🧪 Pipeline Validation & Regression Suite

Run the automated mission pipeline regression test on all benchmark sonar sets:
```powershell
python diagnostic_output/validate_pipeline.py
```
**Expected Output:**
```text
------------------------------------------------------------------------
  [PASS] ALL BENCHMARKS PASS  |  10 images processed
------------------------------------------------------------------------
  JSON report written -> diagnostic_output/validation_results.json
------------------------------------------------------------------------
```

Verify frontend TypeScript compilation:
```powershell
cd frontend
npx tsc --noEmit
npm run build
```

---

## 📁 Repository Structure

```
SIH PROTOTYPE/
├── backend/
│   ├── main.py                  # FastAPI server with 42 REST endpoints & Government SOPs
│   ├── yolo_seg_detector.py     # Fine-tuned YOLO11-Seg + acoustic shadow physics engine
│   ├── colormap_sonar.py        # Hydrographic oceanic colormap generator
│   ├── core/                    # Core Architectural Modules (Gaps 1-18)
│   │   ├── qa_gate.py           # Pre-inference Sonar QA Gate (VALID, WARNING, LOW_QUALITY, INVALID)
│   │   ├── uncertainty_engine.py# Calibrated uncertainty & explicit abstention (ACCEPTED, REVIEW, UNKNOWN)
│   │   ├── target_tracker.py    # Cross-frame/cross-swath fusion & persistent Target IDs
│   │   ├── geolocation_engine.py# Slant-to-ground conversion, layback & covariance ellipses
│   │   ├── shadow_segmenter.py  # Target vs. shadow mask separation & h_obj calculation
│   │   ├── coverage_engine.py   # Survey coverage model (Nadir blind-zone geometry)
│   │   ├── risk_priority_engine.py # Decoupled ecological risk & operational removal priority
│   │   ├── rag_engine.py        # Local offline statutory RAG engine
│   │   ├── jev_adapter.py       # JEV Decision-Triage Adapter (Sovereign Cloud Boundary)
│   │   ├── feedback_store.py    # Immutable human review feedback store
│   │   └── resurvey_manager.py  # Targeted orthogonal re-survey queue manager
│   ├── knowledge/               # Statutory RAG Knowledge Base
│   │   └── authoritative_sources.json # 7 Indian & International statutory frameworks
│   └── models/                  # Typed Pydantic Schemas
│       ├── candidate_record.py  # Canonical 17-field CandidateRecord with ModelLineage
│       ├── metadata_models.py   # Typed SonarMetadata & NavigationMetadata
│       └── taxonomy.py          # 3-Tier evidence-constrained taxonomy
├── data/
│   ├── annotations/             # Polygonal ground-truth annotations
│   ├── detections.json          # Master detection targets
│   ├── resurvey_queue.json      # Persistent orthogonal re-survey queue
│   └── sonar/                   # Benchmark side-scan sonar image captures
├── dataset_targeted/            # 144-image targeted sonar fine-tuning dataset
├── docs/                        # Authoritative Specifications & Audit Protocols
│   ├── MASTER_PROJECT_DOCUMENTATION.md      # Master engineering specification
│   ├── SYSTEM_FLAW_AND_GAP_AUDIT_RESOLUTION.md # Full flaw resolution matrix
│   ├── MODEL_AUDIT.md                       # Model fine-tuning & inference audit
│   ├── DATA_LINEAGE.md                      # Data provenance & CandidateRecord lineage
│   ├── EVALUATION_PROTOCOL.md               # 4-dimension mission evaluation protocol
│   ├── FAILURE_STATES.md                    # 9 standardized explicit failure states
│   └── GROUND_TRUTH_PROTOCOL.md             # 4-tier ground-truth governance
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main command center workspace
│   │   ├── components/
│   │   │   ├── GovernmentHeader.tsx      # Security banner, RBAC profiles & sector selector
│   │   │   ├── HeightInversionWidget.tsx # Real-time h_obj & Under-Keel Clearance gauge
│   │   │   ├── EvidenceInspector.tsx     # Acoustic highlight vs. shadow evidence card
│   │   │   ├── RiskPriorityCard.tsx      # Decoupled ecological risk & removal priority
│   │   │   ├── RAGKnowledgeCard.tsx      # Statutory guidance & citation card
│   │   │   ├── HumanReviewBar.tsx        # CONFIRM / REJECT / UNKNOWN review actions
│   │   │   ├── GisMiniMap.tsx            # Leaflet GIS map with trajectory tracking
│   │   │   ├── Sidebar.tsx               # macOS-inspired translucent sidebar
│   │   │   └── AppWindow.tsx             # Master application window frame
│   │   └── views/
│   │       ├── SonarAnalysisView.tsx     # Waterfall analysis with 1:1 overlay co-registration
│   │       ├── ActionDispatchView.tsx    # SOP Console: NOTMAR, ICG tasking, CPCB orders
│   │       ├── OverviewView.tsx          # National Maritime Command Cockpit
│   │       ├── DetectionsView.tsx        # Multi-target fleet table
│   │       ├── GisView.tsx               # Full-screen GIS hydrographic spatial view
│   │       ├── RAGView.tsx               # Interactive statutory knowledge search
│   │       ├── ReviewQueueView.tsx       # Senior hydrographer audit queue
│   │       └── ReportsView.tsx           # Formal IHO S-44 & mission export view
├── training/
│   ├── train_sonar_baseline.py  # YOLO11-Seg genuine fine-tuning script
│   └── dataset_aggregator.py    # Multi-repository dataset harvester
├── weights/
│   ├── yolo11_seg_best.pt       # Fine-tuned YOLO11-Seg production weights (6.0 MB)
│   └── training_metrics.json    # Verified validation metrics manifest
└── start.bat                    # 1-click startup batch script
```

---

## 🛡️ Git Configuration & Attribution

- **Repository:** [`https://github.com/sihteamwave/Marine-Debris-Detector.git`](https://github.com/sihteamwave/Marine-Debris-Detector.git)
- **User:** `sihteamwave`
- **Email:** `sihteamwave@gmail.com`
