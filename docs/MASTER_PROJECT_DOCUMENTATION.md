# SAMUDRA-SURAKSHA (समुद्र-सुरक्षा)
## National Hydrographic Debris & Underwater Anomaly Intelligence System
### Master System Architecture, Acoustic Physics, AI Model Specification & Operational Government Blueprint

```
========================================================================================
GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES (MoES)
In Operational Collaboration With:
  - Indian Coast Guard (ICG) — Directorate of Marine Environment & SAR
  - National Institute of Ocean Technology (NIOT) — Deep Ocean Mission
  - National Hydrographic Office (NHO) — Indian Navy
  - Directorate General of Shipping — Ministry of Ports, Shipping and Waterways
========================================================================================
Classification : RESTRICTED — OFFICIAL HYDROGRAPHIC & COASTAL SURVEILLANCE USE ONLY
Standard Ref   : IHO S-44 Edition 6.2.0 (Order 1a) • IMO MARPOL Annex V • Merchant Shipping Act 1958
System Codename: SAMUDRA-SURAKSHA (SIH26057 Architectural Baseline)
Date           : 23 September 2026
========================================================================================
```

---

## 1. Executive Vision & Problem Statement

### 1.1 The Critical Oceanic Challenge
Marine debris, lost cargo containers, derelict fishing gear (ghost nets), and submerged wreckage pose severe dual threats across India's 7,516 km coastline and 2.3 million km² Exclusive Economic Zone (EEZ):
1. **Navigational Hazards (HAZNAV)**: Submerged shipping containers (TEUs), discarded dredge pipes, and unchartered shallow shipwrecks in navigation corridors and port approach fairways (Traffic Separation Schemes - TSS) cause catastrophic hull punctures and rudder/propeller fouling for commercial vessels and naval craft.
2. **Ecological Devastation**: Abandoned, Lost or Otherwise Discarded Fishing Gear (ALDFG) continues "ghost fishing" for decades, killing endangered marine megafauna (turtles, dolphins, dugongs) and smothering fragile coral reefs in the Gulf of Mannar, Andaman Sea, and Lakshadweep. Heavy industrial tyres and plastic polymers leach toxic chemical stabilizers (e.g., 6PPD-quinone) into benthic food chains.

### 1.2 The Sonar Data Scarcity Bottleneck
Unlike terrestrial RGB computer vision, underwater acoustic imagery acquired by Side-Scan Sonar (SSS) suffers from:
- Multiplicative **Rayleigh reverberation speckle noise**.
- Range-dependent transmission loss and acoustic attenuation.
- Beam pattern non-uniformities and non-linear slant-range distortion.
- Nadir blind zones beneath the sensor towfish.
- Extreme data scarcity: Public sonar datasets are biased toward macro-structures (mines, shipwrecks); small anthropogenic debris (nets, tyres, fragmented plastics) produce diffuse, faint backscatter and rely almost entirely on **acoustic shadow geometry**.

### 1.3 Core Operational Principle
> *"AI proposes candidates • Sonar physics verifies acoustic evidence • Local statutory knowledge guides triage • The human hydrographer retains sovereign authority • Every ping, weight hash, and decision is cryptographically audited."*

---

## 2. End-to-End System Architecture

SAMUDRA-SURAKSHA implements a modular 15-stage pipeline connecting sensor ingestion to statutory action dispatch:

```
[Side-Scan Sonar Waterfall (Raw / XTF / GeoTIFF)] + [Navigation Telemetry (GNSS/INS)]
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 1] Ingestion & Header Metadata Extraction │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 2] Sonar Data Quality QA Gate             │
             │   - Nadir contamination / water column check     │
             │   - Saturation clipping & SNR assessment         │
             │   - States: VALID / WARNING / LOW_QUALITY / INV  │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 3] Sonar Preprocessing Engine             │
             │   - Slant-range to ground-range projection       │
             │   - Contrast-Limited Adaptive Histogram (CLAHE)  │
             │   - Median speckle suppression (3x3 kernel)      │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 4] Dual-Stage Neural Perception Engine    │
             │   - YOLO11-Seg baseline / Sonar-tuned weights    │
             │   - Multiscale feature pyramid detection         │
             │   - Output: Specular Target Highlight Polygon    │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 5] Acoustic Shadow & Height Inversion     │
             │   - Directional ray tracing away from nadir line │
             │   - Acoustic shadow segmentation mask            │
             │   - Relief formula: h = (Ls * H) / (Rs + Ls)     │
             │   - Under-Keel Clearance: UKC = Depth - h        │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 6] Canonical CandidateRecord Constructor  │
             │   - Unique Candidate ID (CAN-XXX)                │
             │   - SHA-256 weight hash & preprocessing recipe   │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 7] Cross-Frame & Cross-Swath Fusion       │
             │   - Spatial/temporal target tracking             │
             │   - Persistent Target ID (TGT-YYYY-XXXX)         │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 8] Uncertainty Calibration & Abstention   │
             │   - Highlight vs Shadow consistency gate         │
             │   - States: ACCEPTED / REVIEW_REQUIRED / UNKNOWN │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 9] Local Statutory RAG Knowledge Engine   │
             │   - IHO S-44, MoES, Merchant Shipping Act, CPCB  │
             │   - Grounded citations & legal provenance        │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 10] Deterministic Risk & HAZNAV Engine    │
             │   - Ecological Hazard Index (decoupled)          │
             │   - Operational Clearance Priority (HAZNAV)      │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 11] JEV (Judge-Evaluator-Verifier) Triage │
             │   - Metadata-bounded review effort allocation    │
             │   - Isolated adapter with offline fallback       │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 12] Human-in-the-Loop Review Console      │
             │   - Official decisions: CONFIRM / REJECT / UNK   │
             │   - Digital signature & reviewer attribution     │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 13] Slant-to-Ground Geolocation & GIS     │
             │   - Ray-traced geographic coordinates (WGS84)    │
             │   - Positional uncertainty error ellipse (95%)   │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 14] SOP Action Dispatch                   │
             │   - Automated Notice to Mariners (NOTMAR)        │
             │   - Coast Guard Salvage Tasking Order (ICGS)     │
             │   - Autonomous ROV Micro-Dive Waypoints          │
             │   - MoES-CPCB Marine Litter Cleanup Requisition  │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │ [Stage 15] Statutory Reporting & Audit Vault     │
             │   - IHO S-44 Order 1a Survey Certificate         │
             │   - Printable Official Government Gazette        │
             │   - Append-only SHA-256 Cryptographic Audit Log  │
             │   - Linked Re-Survey Queue (Before/After)        │
             └──────────────────────────────────────────────────┘
```

---

## 3. Acoustic Physics & Mathematical Formulation

### 3.1 Grazing Angle Geometry & Physical Height Inversion
Side-scan sonar operates by emitting an acoustic fan-beam perpendicular to the survey track. An object elevated above the seabed blocks the acoustic ray, casting an acoustic shadow in the direction away from the nadir line.

```
 Towfish Sensor
  [H_sensor]
      │ \
      │  \
      │   \ Incident Acoustic Ray
      │    \
══════╪═════[Object h_obj]════════════════════════════════════ Seafloor
    Nadir   │◄─── R_s ───►│◄────── L_s (Shadow) ──────►│
    Line    Ground Range
```

The geometric relationship between the acoustic shadow length ($L_s$), sensor altitude ($H_{sensor}$), ground range to target ($R_s$), and physical debris height ($h_{obj}$) is derived from similar triangles:
$$\frac{h_{obj}}{H_{sensor}} = \frac{L_s}{R_s + L_s}$$

Solving for physical debris height off the seabed:
$$\mathbf{h_{obj} = \frac{L_s \cdot H_{sensor}}{R_s + L_s}}$$

Where:
- $h_{obj}$: Estimated physical debris height above seafloor (meters).
- $L_s$: Acoustic shadow length along the propagation vector (meters).
- $H_{sensor}$: Towfish altitude above seafloor (meters, measured via altimeter / bathymetry).
- $R_s$: Ground range from nadir track to the acoustic highlight (meters).

### 3.2 Under-Keel Clearance (UKC) & HAZNAV Determination
The navigational safety clearance for commercial shipping is calculated:
$$\mathbf{UKC = Depth_{water} - h_{obj}}$$

If $UKC < \text{Maximum Commercial Vessel Draft}$ (standardized at **$14.5\text{ m}$** for container vessels and **$8.5\text{ m}$** for coastal vessels in port fairways), the system automatically triggers an immediate **`CRITICAL_HAZNAV` Alert** for the Harbor Master and generates a **Notice to Mariners (NOTMAR)** draft.

---

## 4. Hierarchical Debris Taxonomy (3 Tiers)

To prevent forced, unscientific classifications, SAMUDRA-SURAKSHA uses an evidence-constrained 3-tier taxonomy:

| Tier | Category | Classes / Subtypes | Verification Evidence |
|---|---|---|---|
| **Tier 1** | **Anthropogenic vs Natural** | `MAN_MADE`, `NATURAL_SEABED`, `UNKNOWN` | Specular reflection, geometric symmetry, planar boundary |
| **Tier 2** | **Debris Family** | `CONTAINER_CARGO`, `DISCARDED_GEAR`, `RUBBER_AUTOMOTIVE`, `SUNKEN_VESSEL`, `AIRCRAFT_WRECKAGE`, `SUBMERGED_INFRASTRUCTURE`, `UNKNOWN_ANOMALY` | Aspect ratio, shadow sharpness, acoustic texture |
| **Tier 3** | **Specific Target Class** | • `Container` (20ft/40ft TEU intermodal unit)<br>• `Tyre` (Automotive/aircraft/tractor tyre)<br>• `Shipwreck` (Vessel hull, structural keel, ribbing)<br>• `Plane` (Fuselage section, swept wing)<br>• `Building` (Concrete foundation, coastal ruin)<br>• `Possible Debris` (Unclassified anthropogenic cluster) | High-resolution acoustic contour matching |

---

## 5. Local Statutory RAG Knowledge Engine

SAMUDRA-SURAKSHA operates 100% offline at sea. The RAG system links real-time detections with authoritative statutory and hydrographic documents:

1. **IHO S-44 Edition 6.2.0 (October 2024)**:
   - International Hydrographic Organization standards for bathymetric surveys.
   - Mandates Order 1a Total Horizontal Uncertainty: $THU \le 5\text{ m} + 5\%\text{ depth}$.
   - Mandates feature detection capability for cubic features $> 2\text{ m}$ in depths up to $40\text{ m}$.
2. **Ministry of Earth Sciences (MoES) & NCCR Protocol (2022)**:
   - National Marine Litter Assessment and Monitoring Protocol for Indian Coastal Waters.
   - Guides micro-, meso-, and macro-litter categorization along the 9 coastal states of India.
3. **Merchant Shipping Act, 1958 (Part XIII: Wreck & Salvage)**:
   - Statutory provisions under the Directorate General of Shipping governing reported navigational hazards, wreck custody, and immediate radio safety broadcasts (NOTMAR).
4. **Indian Coast Guard (ICG) NOS-DCP (2023)**:
   - National Oil Spill Disaster Contingency Plan & Marine Pollution Response Manual for hazardous container ruptures, chemical drums, and derelict vessel fuel bunkers.
5. **Central Pollution Control Board (CPCB) Guidelines (2024)**:
   - Marine Litter and Ghost Gear Remediation under Plastic Waste Management Rules (2021/2024).
6. **Maritime Zones of India Act, 1976**:
   - Legal jurisdiction over sovereign exploration, exploitation, and seabed salvage within India's 200 nautical mile Exclusive Economic Zone (EEZ).
7. **IMO MARPOL Annex V & Resolution MEPC.310(73)**:
   - Regulations for the Prevention of Pollution by Garbage from Ships and mandatory container loss reporting.

---

## 6. JEV (Judge-Evaluator-Verifier) Decision-Triage Layer

### 6.1 Architectural Role
JEV is an isolated, optional decision-triage adapter. Its purpose is **review-effort allocation** across large survey sorties, preventing hydrographer cognitive overload while maintaining human authority.

### 6.2 Bounded Questions
1. *Does this candidate represent a critical Hazard to Navigation (HAZNAV) in a designated shipping fairway (TSS) with Under-Keel Clearance < 15 m?*
2. *Is the acoustic evidence clear and unambiguous, or does it require priority escalation to a Senior Hydrographic Certifier?*
3. *Is the candidate supported by directional acoustic shadow and acceptable SNR, or does it exhibit contradictory evidence?*
4. *Should the system abstain and recommend an orthogonal acoustic pass on a future AUV sortie?*
5. *Should `UNKNOWN_ANOMALY` be preferred to a specific class to avoid hallucinating an anthropogenic label?*

### 6.3 Sovereign Data Boundary
- **Zero Raw Sonar Upload**: Raw side-scan waterfall imagery is strictly confined to the local vessel workstation.
- If JEV is enabled, it consumes only structured JSON metadata from the `CandidateRecord`.
- If offline, the local deterministic Python rule engines (`qa_gate.py`, `uncertainty_engine.py`, `risk_priority_engine.py`) maintain the full triage queue seamlessly.

---

## 7. Role-Based Access Control (RBAC) & Government Consoles

SAMUDRA-SURAKSHA provides 4 dedicated operational profiles:

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ 👨‍✈️ 1. FIELD HYDROGRAPHER /      │   │ 🔍 2. SENIOR HYDROGRAPHIC       │
│      AUV SORTIE OPERATOR        │   │      CERTIFIER / AUDITOR        │
│ • Live SSS waterfall stream     │   │ • Full evidence inspection      │
│ • Ping QA Gate & SNR monitoring │   │ • Shadow ray verification       │
│ • Transducer frequency control  │   │ • Uncertainty resolution        │
│ • Raw / CLAHE enhancement       │   │ • Digital cryptographic sign-off│
└─────────────────────────────────┘   └─────────────────────────────────┘

┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ ⚓ 3. HARBOR MASTER / VTS       │   │ 🌿 4. MARINE ENVIRONMENT        │
│      MARITIME SAFETY AUTHORITY  │   │      DIRECTORATE (MoES / CPCB)  │
│ • Navigational Hazard (HAZNAV)  │   │ • National debris density map   │
│ • Under-keel clearance alerts   │   │ • Plastic & ghost net metrics   │
│ • Automated NOTMAR broadcast    │   │ • Ecological risk assessment    │
│ • Shipping channel clearance    │   │ • Cleanup work order allocation │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 8. Standard Operating Procedures (SOP) Action Dispatch

The platform automates the end-to-end statutory action lifecycle:

1. **Notice to Mariners (NOTMAR) Navigational Warning**:
   - Generates radio safety notice compliant with NAVAREA VIII / Indian Notice to Mariners standards.
   - Includes exact sounding clearance, obstruction coordinates, depth, and recommended vessel exclusion radius.
2. **Coast Guard Salvage Tasking Order (ICGS)**:
   - Official patrol vessel tasking requisition with target geometry, estimated tonnage, crane lifting capacity, and required salvage gear.
3. **Autonomous ROV Micro-Dive Waypoint Requisition**:
   - Creates orthogonal survey waypoints for optical and high-frequency acoustic inspection.
4. **MoES-CPCB Ecological Litter Removal Order**:
   - Requisition for derelict fishing gear or plastics specifying disposal protocol, recycling class, and ecological sensitivity index.

---

## 9. Pan-India Strategic Coastal Surveillance Grid

The GIS module covers 6 strategic maritime sectors of national importance:

```
[Sector Bravo: Mumbai & JNPT Deepwater]          [Sector Echo: Visakhapatnam Naval Anchorage]
(18.9220° N, 72.8347° E)                          (17.6868° N, 83.2185° E)
High-density container approach fairway           Deepwater naval base & offshore asset security
           │                                                   │
           ├───────────────────────────────┬───────────────────┤
           │                               │                   │
[Sector Charlie: Cochin Port Fairway]    [Sector Alpha: Gulf of Mannar]   [Sector Delta: Chennai Outer Roads]
(9.9312° N, 76.2673° E)                   (7.8220° N, 77.4847° E)          (13.0827° N, 80.2707° E)
Malabar coast fishing & merchant corridor Biosphere reserve & ghost nets   Industrial anchorage & cyclone debris
                                           │
                                           ▼
                       [Sector Foxtrot: Andaman & Nicobar Chokepoint]
                       (11.6234° N, 92.7265° E)
                       Ten Degree Channel / Malacca Strait international shipping lane
```

---

## 10. Data Contracts & Model Lineage

Every observation produces an immutable, versioned **`CandidateRecord`**:
- **Candidate ID**: `CAN-XXX`
- **Persistent Target ID**: `TGT-YYYY-XXXX` (fused across consecutive swaths)
- **Model Lineage**: Model version, neural weight SHA-256 hash, dataset version, preprocessing recipe.
- **Acoustic Evidence**: Specular target mask, acoustic shadow mask, grazing angle, shadow strength, estimated height ($m$), Under-Keel Clearance ($m$).
- **Uncertainty State**: `ACCEPTED`, `REVIEW_REQUIRED`, `UNKNOWN`.
- **Geolocation**: WGS-84 coordinates, slant-to-ground method, positional uncertainty ellipse ($95\%$).
- **Audit Event**: Actor ID, action taken, before/after state, ISO 8601 timestamp, SHA-256 integrity hash.

---

## 11. Verification & Compliance Matrix

| Standard / Protocol | Requirement | SAMUDRA-SURAKSHA Implementation |
|---|---|---|
| **IHO S-44 Order 1a** | Horizontal Uncertainty $\le 5\text{ m} + 5\%\text{ depth}$ | Slant-to-ground range ray tracing with calibrated layback |
| **IHO S-44 Order 1a** | Feature Detection: $2\text{ m}$ cube in $\le 40\text{ m}$ depth | YOLO11-Seg + multiscale Top-Hat SSS feature extractor |
| **IMO MARPOL Annex V** | Reporting of lost cargo containers & gear | Automated NOTMAR & DG Shipping incident dispatch |
| **MoES / NCCR Protocol** | Benthic marine litter density mapping | Multi-sector GIS density heatmap & tonnage estimator |
| **Evidence Admissibility** | Legal chain of custody for salvage courts | Append-only SHA-256 cryptographic audit vault |

---

## 12. Active Government REST Endpoints & Decision-Support Gateway

The FastAPI backend exposes dedicated REST endpoints for government authorities and hydrographic operators:

| HTTP Method | Route | Description & Sovereign Authority Role |
|---|---|---|
| `GET` | `/api/government/status` | Platform identity, security classification (`RESTRICTED`), model validation metrics (`weights/yolo11_seg_best.pt`), and active statutory frameworks. |
| `GET` | `/api/government/sectors` | Spatial boundary polygons, depth ranges, and hazard profiles for the 6 strategic Pan-India maritime sectors. |
| `POST` | `/api/government/sop/notmar` | Drafts a formal National Hydrographic Office (NHO) NAVAREA VIII Notice to Mariners with least depth, obstacle height ($h_{obj}$), and Under-Keel Clearance ($UKC$). |
| `POST` | `/api/government/sop/tasking` | Generates an Indian Coast Guard MRCC Interdiction Task Package for ROV optical ground-truthing and diver safety advisories. |
| `POST` | `/api/government/sop/workorder` | Generates a CPCB / MoES Environmental Remediation Work Order for salvage crane barge deployment and EPR waste recycling. |
| `GET` | `/api/government/certificate/iho` | Evaluates sounding density and Total Vertical Uncertainty (TVU) to issue an automated IHO S-44 Edition 6.2.0 Order 1a compliance certificate. |
| `GET` | `/api/government/audit_vault` | Returns tamper-evident SHA-256 audit ledger records tracking model inferences, operator reviews, and SOP dispatches. |
| `POST` | `/api/triage/jev` | Bounded Judge-Evaluator-Verifier decision-triage adapter evaluating candidate review priority under strict Sovereign Cloud Boundary (metadata only, zero raw image uploads). |

