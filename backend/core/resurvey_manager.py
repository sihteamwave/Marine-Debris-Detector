"""
SIH26057 — Targeted Re-Survey Task Management Engine (Gap 18)

Provides data structures and state management for queuing ambiguous, high-uncertainty,
or high-consequence underwater candidates for targeted re-survey missions.

Enables the closed-loop workflow:
Candidate Anomaly -> Re-survey Recommendation -> Targeted Acoustic/Optical Sortie -> Final Verification.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class ReSurveyTarget(BaseModel):
    """
    Targeted re-survey sortie task specification for AUV / ROV re-inspection.
    """
    task_id: str = Field(description="Unique re-survey task identifier, e.g. RSV-2026-001")
    candidate_id: str
    persistent_target_id: str
    target_class: str
    estimated_latitude: float
    estimated_longitude: float
    uncertainty_radius_m: Optional[float] = None
    reason: str
    priority: Literal["URGENT", "HIGH", "ROUTINE"] = "ROUTINE"
    recommended_sensor_mode: str = "High-frequency 900 kHz orthogonal swath pass"
    status: Literal["QUEUED", "SORTIE_SCHEDULED", "ACQUIRED", "COMPLETED", "CANCELLED"] = "QUEUED"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None
    notes: Optional[str] = None


class ReSurveyManager:
    """
    Manages the persistent re-survey queue.
    """

    def __init__(self, store_path: Optional[str] = None):
        if store_path is None:
            store_path = str(
                Path(__file__).resolve().parent.parent.parent / "data" / "resurvey_queue.json"
            )
        self.store_path = Path(store_path)
        self.store_path.parent.mkdir(parents=True, exist_ok=True)
        self._tasks: Dict[str, ReSurveyTarget] = {}
        self._counter: int = 1
        self._load()

    def _load(self) -> None:
        if self.store_path.exists():
            try:
                with open(self.store_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        t = ReSurveyTarget(**item)
                        self._tasks[t.task_id] = t
                        # Update counter to avoid duplicate task_ids
                        try:
                            num = int(t.task_id.split("-")[-1])
                            self._counter = max(self._counter, num + 1)
                        except Exception:
                            pass
            except Exception as e:
                print(f"[RESURVEY-MANAGER] Warning: Could not load queue: {e}")

    def _save(self) -> None:
        try:
            with open(self.store_path, "w", encoding="utf-8") as f:
                json.dump([t.model_dump() for t in self._tasks.values()], f, indent=2)
        except Exception as e:
            print(f"[RESURVEY-MANAGER] Warning: Could not save queue: {e}")

    def queue_for_resurvey(
        self,
        candidate_id: str,
        persistent_target_id: str,
        target_class: str,
        latitude: float,
        longitude: float,
        reason: str,
        priority: Literal["URGENT", "HIGH", "ROUTINE"] = "ROUTINE",
        uncertainty_radius_m: Optional[float] = None,
        recommended_sensor_mode: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> ReSurveyTarget:
        """
        Creates and queues a new re-survey mission task.
        """
        task_id = f"RSV-2026-{self._counter:04d}"
        self._counter += 1

        task = ReSurveyTarget(
            task_id=task_id,
            candidate_id=candidate_id,
            persistent_target_id=persistent_target_id,
            target_class=target_class,
            estimated_latitude=latitude,
            estimated_longitude=longitude,
            uncertainty_radius_m=uncertainty_radius_m,
            reason=reason,
            priority=priority,
            recommended_sensor_mode=recommended_sensor_mode or "High-frequency 900 kHz orthogonal swath pass",
            notes=notes,
        )

        self._tasks[task_id] = task
        self._save()
        return task

    def get_queue(self, status_filter: Optional[str] = None) -> List[ReSurveyTarget]:
        """Returns all queued re-survey tasks."""
        if status_filter:
            return [t for t in self._tasks.values() if t.status == status_filter]
        return list(self._tasks.values())

    def update_task_status(
        self,
        task_id: str,
        new_status: Literal["QUEUED", "SORTIE_SCHEDULED", "ACQUIRED", "COMPLETED", "CANCELLED"],
        notes: Optional[str] = None,
    ) -> Optional[ReSurveyTarget]:
        """Updates task state."""
        if task_id in self._tasks:
            t = self._tasks[task_id]
            t.status = new_status
            if notes:
                t.notes = f"{(t.notes or '')} | {notes}".strip(" |")
            if new_status in ["COMPLETED", "CANCELLED"]:
                t.completed_at = datetime.now(timezone.utc).isoformat()
            self._save()
            return t
        return None
