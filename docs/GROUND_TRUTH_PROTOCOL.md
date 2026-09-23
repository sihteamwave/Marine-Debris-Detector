# SIH26057 — Ground-Truth Annotation & Provenance Protocol

**Problem Statement 57:** AI-Powered Automated Underwater Marine Debris and Anomaly Detection System using Side-Scan Sonar Imagery  
**Document Reference:** `docs/GROUND_TRUTH_PROTOCOL.md`  
**Revision:** 1.0 (Audit Baseline)

---

## 1. Executive Summary & Core Principle

In marine acoustic remote sensing, optical verification is rarely available simultaneously with side-scan sonar (SSS) passes. Historically, datasets have labeled acoustic highlights as "debris" without ground-truthing, contaminating benchmarks with unverified assumptions.

**Core Rule:** *An uncertain acoustic label must never be treated as ground-truth certainty in training or evaluation.*

This protocol defines the strict tiered taxonomy, annotation provenance metadata, and verification levels required for all training, validation, and benchmark datasets within the SIH26057 pipeline.

---

## 2. Verification Levels (Confirmation Hierarchy)

Every annotation record in the ground-truth store MUST be categorized under one of the following four confirmation levels:

| Level | Identifier | Description | Evidence Requirement |
|---|---|---|---|
| **Tier 1** | `CONFIRMED` | Physically retrieved or visually inspected by ROV/AUV optical camera or diver inspection. | Co-registered optical photograph, diver log, or recovery manifest. |
| **Tier 2** | `EXPERT_VERIFIED` | Reviewed and confirmed by certified hydrographic surveyor or marine geophysicist with multi-aspect acoustic evidence. | Verified across $\ge 2$ independent survey passes or dual-frequency sonar records showing consistent highlight and shadow geometry. |
| **Tier 3** | `SONAR_ANNOTATED` | Single-pass acoustic highlight and shadow annotated by trained operator according to geometric rules. | Standard synthetic or single-pass real sonar dataset annotation. Subject to false-positive risk. |
| **Tier 4** | `UNCERTAIN` | Ambiguous acoustic anomaly; shadow absent, weak, or morphology indistinguishable from natural seabed feature (rock outcrop, sand dune ripple). | Flagged for expert review or targeted re-survey. **Excluded from high-confidence training splits.** |

---

## 3. Annotation Provenance Schema

Every polygon or bounding box annotation must be stored with the following metadata structure:

```json
{
  "annotation_id": "ANN-2026-00412",
  "dataset_version": "sih26057-sonar-v1.0",
  "source_image": "survey_pass_04_starboard_0112.png",
  "target_class": "Tyre",
  "debris_family": "SYNTHETIC_POLYMER",
  "confirmation_level": "EXPERT_VERIFIED",
  "annotation_confidence_pct": 88.0,
  "annotator_id": "SURVEYOR-HYDRO-04",
  "annotation_timestamp": "2026-09-15T14:20:00Z",
  "acoustic_criteria_met": {
    "highlight_contrast_validated": true,
    "directional_shadow_present": true,
    "shadow_aligned_with_nadir": true,
    "multi_pass_confirmed": true
  },
  "physical_sample_linked": false,
  "notes": "Clear toroidal acoustic signature with directional shadow extending 2.4m away from nadir."
}
```

---

## 4. Separation of Target Highlight vs. Shadow Annotations

To support **Gap 9** (separation of acoustic highlight from acoustic shadow):
1. Annotators must **never** draw a single loose bounding polygon that encompasses both the object highlight and its shadow.
2. The primary label `target_mask` represents exclusively the high-reflectivity acoustic backscatter face of the physical object.
3. The supporting label `shadow_mask` represents exclusively the acoustic void / occlusion zone immediately behind the object.
4. If an existing legacy dataset contains merged highlight-shadow masks, it must be flagged with `confirmation_level: "UNCERTAIN"` and re-segmented prior to model fine-tuning.

---

## 5. Dataset Split Curation Rules

When splitting data into `train`, `val`, and `test`:

1. **Benchmark Test Set (`test`):**
   - Must contain **only** `CONFIRMED` and `EXPERT_VERIFIED` annotations.
   - Any `UNCERTAIN` sample included in evaluation must be reported separately in an "Abstention Benchmark", never in the primary precision/recall calculation.
2. **Training Set (`train`):**
   - Can include `CONFIRMED`, `EXPERT_VERIFIED`, and high-confidence `SONAR_ANNOTATED` data.
   - All `UNCERTAIN` annotations must be isolated in a dedicated active-learning / review queue.
3. **Multi-Aspect Consistency:**
   - Observations of the same physical target across multiple overlapping survey tracks must be grouped into the same split (grouped k-fold) to prevent data leakage between train and test.

---

## 6. Audit & Retraining Governance (Gap 14)

Reviewer feedback from the dashboard (Confirm / Reject / Unknown) does **not** trigger automatic retraining:
1. Reviewer actions are logged into `data/annotations/feedback_store.jsonl`.
2. Staged annotations must accumulate in a staging batch until reviewed by a hydrographer.
3. A formal dataset version (e.g. `sih26057-v1.1`) is tagged with an immutable cryptographic hash.
4. Retraining must run in an offline reproducible container (`training/train_sonar_baseline.py`).
5. The resulting weights must pass all automated regression gates before deployment to `weights/yolo11_seg_best.pt`.
