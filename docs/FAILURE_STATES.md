# SIH26057 — Explicit Failure States & Graceful Degradation Catalog

**Problem Statement 57:** AI-Powered Automated Underwater Marine Debris and Anomaly Detection System using Side-Scan Sonar Imagery  
**Document Reference:** `docs/FAILURE_STATES.md`  
**Revision:** 1.0 (Audit Baseline)

---

## 1. Principle of Honest Degradation

In marine robotics and computer vision, systems frequently mask sensor dropouts or algorithmic uncertainty by:
- Inventing a 95% confidence number for an unidentifiable speckle.
- Outputting 0.0000° N, 0.0000° E or vessel GPS as an exact target coordinate.
- Displaying a green "Clean Seafloor" indicator when image saturation blinded the detector.

**Core Rule:** *Never hide a missing capability, missing metadata, or degraded sensor signal behind a synthetic default or fabricated metric.*

The SIH26057 pipeline defines 10 standardized, structured failure states.

---

## 2. Standardized Failure States Catalog

| Failure State Code | Trigger Condition | System Behavior & Pipeline Response | Dashboard Display Label |
|---|---|---|---|
| `NO_METADATA` | Input image lacks accompanying `.json` or `.csv` sonar/nav metadata file. | Pipeline falls back to simulated/replayed telemetry flags. Explicitly prohibits centimeter-grade geolocation claims. | `METADATA: UNAVAILABLE (SIMULATED REPLAY)` |
| `LOW_IMAGE_QUALITY` | Input image exhibits $>20\%$ pixel saturation (clipping) or standard deviation $<10$ (washed out). | QA gate emits `LOW_QUALITY` or `INVALID`. Disables auto-acceptance; forces `decision: "REVIEW_REQUIRED"` or rejects unprocessable pings. | `QA: LOW QUALITY (SATURATED / SPECKLE)` |
| `INSUFFICIENT_COVERAGE` | Nadir blind zone, extreme towfish crab angle, or missing swath overlap between adjacent tracks. | Coverage engine marks swath zone as `NADIR_BLIND_ZONE` or `UNSURVEYED_GAP`. Prevents reporting "Zero debris detected". | `COVERAGE: BLIND ZONE / GAP DETECTED` |
| `LOCATION_UNAVAILABLE` | Vessel GPS offline, acoustic transponder tracking lost, or dead-reckoning uncalibrated. | Sets `latitude: 0.0, longitude: 0.0`, `position_status: "UNAVAILABLE"`, uncertainty `"Position uncertainty unavailable"`. | `POSITION: UNAVAILABLE` |
| `LOCATION_ESTIMATED` | Navigation telemetry present, but towfish layback distance or bathymetric altitude unrecorded. | Computes approximate position via vessel track and slant-range; flags status as `ESTIMATED` / `EXACT_NOT_CLAIMED`. | `POSITION: ESTIMATED (± 7.0 m)` |
| `WEAK_ACOUSTIC_EVIDENCE` | Neural network predicts debris highlight, but no acoustic shadow exists radially outward from nadir. | Reduces calibrated confidence score; marks `sonar_evidence.shadow_presence: "WEAK"` or `"ABSENT"`. | `EVIDENCE: WEAK ACOUSTIC SHADOW` |
| `CONFLICTING_EVIDENCE` | Multi-pass observations or high model confidence contradicts flat acoustic seabed profile. | Marks `uncertainty.decision: "UNKNOWN"`, flags `model_evidence_agreement: false`. | `EVIDENCE: CONFLICTING (UNKNOWN)` |
| `REVIEW_REQUIRED` | Calibrated reliability $<65\%$, boundary ambiguous, or high environmental sensitivity area. | Routes candidate to human review queue; suppresses automated salvage dispatch. | `STATUS: REVIEW REQUIRED` |
| `INSUFFICIENT_ENVIRONMENTAL_CONTEXT` | Benthic habitat map or marine protected area (MPA) boundaries unavailable for current coordinates. | Returns `ecological_risk.status: "INSUFFICIENT_EVIDENCE"`; outputs `"Risk incomplete — insufficient evidence"`. | `ECO RISK: INSUFFICIENT CONTEXT` |
| `NO_RELEVANT_RAG_EVIDENCE` | Anomaly classified as `UNCLASSIFIED_ANOMALY` or unrepresented in authoritative scientific literature. | RAG engine returns `relevant_knowledge_found: false`, `retrieval_status: "NO_DATA"`; suppresses LLM hallucination. | `KNOWLEDGE: NO AUTHORITATIVE DATA` |

---

## 3. Schema Encoding

All failure states are exposed through the unified `CandidateRecord` and its sub-schemas (`QAResult`, `UncertaintyAssessment`, `GeolocationRecord`, `EcologicalRiskAssessment`, `RAGContext`). 

Clients consuming the REST API can reliably inspect the `reasons` arrays and status enums to dynamically tailor operator warnings without parsing free-form strings.

---

## 4. Runtime Code Reference & API Payload Examples

### 4.1 Pre-Inference QA Gate Output (`qa_gate.py`)
```json
{
  "status": "LOW_QUALITY",
  "reasons": [
    "Acoustic saturation exceeds 15% threshold (measured: 18.4%)",
    "Acoustic contrast deficit (std dev < 12.0)"
  ],
  "usable_sonar_coverage_pct": 54.2,
  "saturation_pct": 18.4,
  "blackout_pct": 8.1,
  "qa_state": "LOW_QUALITY"
}
```

### 4.2 Uncertainty & Abstention Engine Output (`uncertainty_engine.py`)
```json
{
  "uncertainty_decision": "UNKNOWN",
  "decision_rationale": [
    "Acoustic highlight detected but shadow presence score is 18% (threshold: 40%)",
    "Model confidence (64%) indicates high class boundary ambiguity",
    "Seabed ripple similarity score is 82% (ripple false positive risk)"
  ],
  "calibrated_confidence": 42.5,
  "reliability_tier": "Low",
  "abstain_from_class_forcing": true,
  "assigned_tier2_class": "UNKNOWN_ANOMALY"
}
```

### 4.3 Honest Geolocation Fallback (`geolocation_engine.py`)
```json
{
  "latitude": "Uncalibrated",
  "longitude": "Uncalibrated",
  "position_status": "EXACT_NOT_CLAIMED",
  "uncertainty_ellipse": {
    "semi_major_m": null,
    "semi_minor_m": null,
    "azimuth_deg": null
  },
  "telemetry_calibrated": false,
  "position_note": "Uncalibrated waterfall scan — geographic coordinates withheld to prevent false precision"
}
```

