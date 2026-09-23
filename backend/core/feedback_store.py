"""
SIH26057 — Human Feedback Store & Audit Trail (Gap 14)

Records operator review decisions (Confirm / Reject / Unknown) with full provenance.
Ensures human corrections are safely staged for batch active-learning rather
than triggering unsafe online automatic retraining.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class FeedbackEntry(BaseModel):
    """Immutable audit record of human review on a candidate detection."""
    feedback_id: str
    candidate_id: str
    persistent_target_id: Optional[str] = None
    action: Literal["CONFIRMED", "REJECTED", "UNKNOWN"]
    reviewer_id: str = "OPERATOR-DEFAULT"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    original_class: str
    corrected_class: Optional[str] = None
    reviewer_note: Optional[str] = None
    target_mask_validated: bool = True
    staged_for_retraining: bool = True


class HumanFeedbackStore:
    """
    Manages local append-only feedback storage and staging.
    """

    def __init__(self, store_path: Optional[str] = None):
        if store_path is None:
            store_path = str(
                Path(__file__).resolve().parent.parent.parent / "data" / "annotations" / "feedback_store.jsonl"
            )
        self.store_path = Path(store_path)
        self.store_path.parent.mkdir(parents=True, exist_ok=True)

    def record_feedback(
        self,
        candidate_id: str,
        action: Literal["CONFIRMED", "REJECTED", "UNKNOWN"],
        original_class: str,
        persistent_target_id: Optional[str] = None,
        reviewer_id: str = "OPERATOR-HYDRO-01",
        corrected_class: Optional[str] = None,
        reviewer_note: Optional[str] = None,
        target_mask_validated: bool = True,
    ) -> FeedbackEntry:
        """
        Appends an operator review record to the immutable audit store.
        """
        feedback_id = f"FB-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{candidate_id[-4:]}"
        entry = FeedbackEntry(
            feedback_id=feedback_id,
            candidate_id=candidate_id,
            persistent_target_id=persistent_target_id,
            action=action,
            reviewer_id=reviewer_id,
            original_class=original_class,
            corrected_class=corrected_class or original_class,
            reviewer_note=reviewer_note,
            target_mask_validated=target_mask_validated,
            staged_for_retraining=(action == "CONFIRMED"),
        )

        # Append to JSONL file
        with open(self.store_path, "a", encoding="utf-8") as f:
            f.write(entry.model_dump_json() + "\n")

        return entry

    def get_feedback_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Reads recent feedback entries."""
        if not self.store_path.exists():
            return []

        entries = []
        with open(self.store_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        entries.append(json.loads(line))
                    except Exception:
                        continue
        return entries[-limit:]

    def get_summary(self) -> Dict[str, Any]:
        """Returns statistics on human review actions."""
        history = self.get_feedback_history(limit=5000)
        total = len(history)
        confirmed = sum(1 for e in history if e.get("action") == "CONFIRMED")
        rejected = sum(1 for e in history if e.get("action") == "REJECTED")
        unknown = sum(1 for e in history if e.get("action") == "UNKNOWN")
        staged = sum(1 for e in history if e.get("staged_for_retraining"))

        return {
            "total_reviews": total,
            "confirmed_count": confirmed,
            "rejected_count": rejected,
            "unknown_count": unknown,
            "staged_for_dataset_release": staged,
            "audit_file": str(self.store_path),
        }
