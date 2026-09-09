# SIH26057 — Automated Underwater Marine Debris & Anomaly Detection System
### Smart India Hackathon 2026 • Side-Scan Sonar Imagery Decision Support MVP

> **Core Workflow Principle:**  
> *"AI proposes • Sonar evidence supports • The human makes the final decision"*

---

## 🌊 Overview

This prototype delivers an operational, high-impact decision support dashboard for side-scan sonar (SSS) post-disaster underwater surveys. It is designed specifically for a convincing **60–90 second demonstration for judges**.

### Key Architectural Highlights
- **Branded Console:** Matches the Acoustical Surveys hydrographic survey UI standard.
- **Three-Column Operational Layout:**
  1. **Mission Control & Telemetry:** Replayed survey tracks, sensor parameters, and real-time software performance metrics (latency, FPS, VRAM).
  2. **Side-Scan Sonar Analysis:** Waterfall acoustic imagery with false-color oceanic colormap, nadir gap alignment, raw vs. CLAHE enhancement toggle, pixel-level magenta segmentation mask, and cyan acoustic shadow analysis callouts.
  3. **Decision Workflow & GIS:** Real-time Evidence Board with three working operator actions (`Confirm`, `Reject`, `Mark Unknown`), tactical GIS mini-map of the Indian Ocean (off Kanyakumari Peninsular Base), and report exporters (`JSON`, `CSV`).

---

## 🚀 Quick Start Guide

You have two ways to start the application:

### Option A: 1-Click Startup (Recommended)
Simply double-click **`start.bat`** in the project root:
```powershell
.\start.bat
```
This automatically launches both the backend (FastAPI + YOLO11-OBB) and the frontend (Vite), and opens `http://localhost:5173` in your browser.

---

### Option B: Manual Command-Line Startup

#### 1. Start the FastAPI Backend (Port 8000)
Open a terminal in the project root:
```powershell
cd "c:\Users\Mantra\OneDrive\Desktop\SIH PROTOTYPE"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API Health Status: [http://localhost:8000/health](http://localhost:8000/health)
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. Start the React + Vite Frontend (Port 5173)
Open a second terminal:
```powershell
cd "c:\Users\Mantra\OneDrive\Desktop\SIH PROTOTYPE\frontend"
npm run dev
```
- Mission Dashboard UI: **[http://localhost:5173](http://localhost:5173)**

---

## 🎯 60–90 Second Demonstration Flow for Judges

1. **Open the Dashboard:** Navigate to `http://localhost:5173`.
2. **Review Initial Detection (SSS-004):**
   - Note the **Clear Debris / Possible Ghost Net** return in the center waterfall.
   - Observe the **Pixel-Level Segmentation Mask** (purple) and the **Acoustic Shadow Callout** (cyan: "Strong").
   - Toggle between `[ Raw ]` and `[ CLAHE Enhanced ]` at the top of the center panel to show real-time contrast enhancement preserving acoustic shadow geometry.
3. **Execute Operator Decision:**
   - In the **Evidence Board** (right column), note the AI Confidence (`94%`) and Shadow Strength (`88%`).
   - Click the green **`[ ✔ Confirm ]`** button.
   - Status updates instantly to `Confirmed`.
   - The **GIS Mini-Map** pins the verified target at `7.8220° N, 77.4847° E` with an active trajectory marker in the Indian Ocean.
4. **Test Alternative Scenarios:**
   - Click the `SSS-004` dropdown in the Evidence Board to switch to **`SSS-005` (Weak Candidate)** or **`SSS-006` (Unknown Anomaly)**.
   - For `SSS-005`: Click **`[ ✖ Reject ]`** (shows "Insufficient evidence").
   - For `SSS-006`: Click **`[ ❓ Mark Unknown ]`** (shows "Queued for expert review").
5. **Export Survey Findings:**
   - Click **`JSON`** or **`CSV`** in the Reporting panel to download a structured survey report.

---

## 📁 Repository Structure

```
SIH PROTOTYPE/
├── backend/
│   ├── main.py              # FastAPI application with REST & /api/dataset_info endpoints
│   ├── yolo_obb_detector.py # YOLO11-OBB inference & acoustic shadow verification
│   ├── colormap_sonar.py    # Generates hydrographic oceanic colormaps
│   └── requirements.txt     # Python backend dependencies
├── training/                # SIH26057 AI Model & Dataset Pipeline
│   ├── dataset_aggregator.py         # Multi-repository dataset harvester & class unifier
│   ├── synthetic_debris_generator.py # Acoustic ray-tracing, shadow & Rayleigh speckle engine
│   └── train_yolo_obb.py             # Ultralytics YOLO11-OBB fine-tuning script
├── data/
│   ├── detections.json      # Ground-truth scenario specifications
│   └── sonar/               # Acoustic side-scan sonar image captures
│       ├── clear_debris_blue.jpg
│       ├── weak_candidate_blue.jpg
│       └── unknown_anomaly_blue.jpg
├── frontend/
│   ├── public/              # Static assets & sonar imagery
│   ├── src/
│   │   ├── App.tsx          # Main React dashboard component
│   │   ├── components/
│   │   │   ├── GisMiniMap.tsx   # Interactive Leaflet GIS Mini-Map (Indian Ocean Basin)
│   │   │   └── DatasetModal.tsx # SIH26057 Multi-Dataset & AI Training Architecture Console
│   │   ├── main.tsx         # React DOM root entry
│   │   └── index.css        # Tailwind directives and custom styles
│   ├── index.html           # HTML5 template
│   ├── package.json         # Node.js dependencies
│   ├── tailwind.config.js   # Tailwind design tokens
│   └── vite.config.ts       # Vite configuration with API proxy
├── start.bat                # 1-click launcher for Windows
├── yolo11n-obb.pt           # Pre-trained YOLO11 OBB neural weights
└── README.md                # Project documentation
```

---

## 🌊 SIH26057 Multi-Dataset & AI Training Architecture

### The Marine Debris Data Scarcity Bottleneck
Public side-scan sonar datasets are overwhelmingly biased toward macro-structures (shipwrecks, downed aircraft, seabed mines). Small anthropogenic marine debris (ghost nets, fragmented plastics, tires, severed cables) have faint diffuse returns and rely critically on acoustic shadow elongation.

To overcome this, our pipeline aggregates **6 open-source acoustic & multi-modal repositories (29,203 samples)** and blends them with **physics-grounded acoustic ray-tracing synthesis**:

| Repository | Source | Samples | Type | SIH26057 Role |
|---|---|---|---|---|
| **SeabedObjects-KLSG** | Kaggle SSS Challenge | 1,190 | Real Sonar | Seafloor background negative patches + macro baseline |
| **NOMBO & MILCO** | Teledyne Gavia AUV | 1,170 | Real AUV Sonar | Small bottom contacts, metallic drums & containers |
| **AI4Shipwrecks** | Maritime Robotics AUV | 286 | High-Res Sonar | Acoustic shadow geometry & structural debris fields |
| **SCTD** | Sonar Common Target | 357 | Multi-Dim Sonar | Cross-frequency acoustic signature calibration |
| **S3Simulator** | Gazebo + SAM | 1,200 | Physics Synthetic | Simulated acoustic backscatter & acoustic shadow masks |
| **DebrisVision** | Optical + Diffusion | 25,000 | Multi-Modal | Transfer-learned plastic contours adapted to sonar |

### Unified Target Class Taxonomy (5 Classes for SIH26057)
- **Class 0 — `plane`**: Downed airplanes, aircraft fuselage, detached wing sections, aeronautical debris.
- **Class 1 — `shipwreck`**: Sunken vessel hulls, historic shipwrecks, structural keels, nautical wreckage.
- **Class 2 — `container`**: Intermodal shipping containers (20ft/40ft), cargo boxes, industrial metal storage crates.
- **Class 3 — `building`**: Submerged concrete buildings, architectural ruins, underwater foundations, coastal infrastructure.
- **Class 4 — `tyre`**: Rubber automotive tyres, aircraft tyres, industrial tractor tires, discarded rubber waste.

### Acoustic Shadow Synthesis Physics
The acoustic shadow length ($L_s$) is projected away from nadir according to the grazing geometry:
$$\mathbf{L_s = \frac{h_{obj} \cdot R_s}{H_{sensor} - h_{obj}}}$$
Where:
- $h_{obj}$ is the physical debris height above the seafloor ($0.5\text{ m} - 3.0\text{ m}$).
- $R_s$ is the lateral ground range from the nadir line ($5\text{ m} - 50\text{ m}$).
- $H_{sensor}$ is the AUV flight altitude ($10\text{ m} - 20\text{ m}$).
- Seafloor reverberation is modulated with multiplicative **Rayleigh speckle noise** ($\sigma = 1.0$) characteristic of 450 kHz side-scan transducers.

### Running Data Aggregation & Training
```powershell
# 1. Run the Multi-Dataset Aggregator & Synthesize Balanced Debris Samples
python training/dataset_aggregator.py

# 2. Train YOLO11-OBB with Sonar-Tuned Hyperparameters
python training/train_yolo_obb.py --epochs 30 --batch 4 --imgsz 1024
```

---

## 🛡️ Honesty & Compliance Principles

- **No Fabricated Accuracy Claims:** The dashboard transparently displays *AI Confidence* and *Simulated Telemetry*.
- **Acoustic Shadow Integrity:** Enhancement algorithms (CLAHE) are calibrated to retain low-energy acoustic shadow information rather than artificially saturating dark zones.
- **Human-in-the-Loop:** Automated detection flags potential candidates; operators retain full authority to confirm, reject, or request domain specialist appraisal.
