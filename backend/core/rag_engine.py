"""
SIH26057 — Offline Authoritative Knowledge & RAG Engine (Gaps 12 & 13)

Provides scientifically grounded domain knowledge and mitigation guidelines
for candidate marine debris records using an offline, versioned knowledge repository.

Guarantees:
- RAG NEVER creates or modifies detections.
- RAG NEVER modifies segmentation masks.
- RAG NEVER overrides model confidence.
- Fully operational offline without external API dependencies.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional, List

from backend.models.candidate_record import RAGContext
from backend.models.taxonomy import TargetClassification, DebrisFamily


class OfflineRAGEngine:
    """
    Offline retrieval-augmented knowledge engine querying verified marine environmental documents.
    """

    def __init__(self, knowledge_file_path: Optional[str] = None):
        if knowledge_file_path is None:
            knowledge_file_path = str(
                Path(__file__).resolve().parent.parent / "knowledge" / "authoritative_sources.json"
            )
        self.knowledge_file_path = knowledge_file_path
        self._sources: List[Dict[str, Any]] = []
        self._load_knowledge()

    def _load_knowledge(self) -> None:
        p = Path(self.knowledge_file_path)
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._sources = data.get("documents", [])
            except Exception as e:
                print(f"[RAG-ENGINE] Warning: Could not load knowledge base: {e}")
                self._sources = []
        else:
            print(f"[RAG-ENGINE] Warning: Knowledge file not found at {self.knowledge_file_path}")
            self._sources = []

    def retrieve_context(
        self,
        classification: TargetClassification,
        uncertainty_decision: str = "ACCEPTED",
    ) -> RAGContext:
        """
        Retrieves authoritative scientific context strictly matching candidate classification.
        Returns explicit NO_DATA / INSUFFICIENT_EVIDENCE if no grounded match exists.
        """
        # If candidate anomaly classification is UNKNOWN or abstained, return insufficient evidence
        tier1 = getattr(classification, "tier1_domain", None)
        tier1_val = tier1.value if hasattr(tier1, "value") else str(tier1)
        if uncertainty_decision == "UNKNOWN" or tier1_val == "UNKNOWN":
            return RAGContext(
                relevant_knowledge_found=False,
                scientific_summary="Insufficient supporting knowledge — candidate anomaly is unclassified or acoustic evidence is ambiguous.",
                potential_hazards=[],
                material_degradation_profile="Unknown / unclassified",
                recommended_mitigation="Execute targeted visual/acoustic re-survey prior to physical intervention.",
                authoritative_sources=[],
                retrieval_status="INSUFFICIENT_EVIDENCE",
            )

        target_class_str = getattr(classification, "tier3_specific", "").strip().lower()
        raw_name = getattr(classification, "raw_class_name", "").strip().lower()
        tier2 = getattr(classification, "tier2_family", None)
        family_str = tier2.value if hasattr(tier2, "value") else str(tier2)

        # Search for exact or closest authoritative document
        matched_doc = None
        for doc in self._sources:
            doc_type = doc.get("debris_type", "").lower()
            if (
                (raw_name and (raw_name in doc_type or doc_type in raw_name))
                or (target_class_str and (doc_type in target_class_str or target_class_str in doc_type))
            ):
                matched_doc = doc
                break

        # Fallback search by Debris Family
        if not matched_doc:
            for doc in self._sources:
                if doc.get("debris_family") == family_str:
                    matched_doc = doc
                    break

        if not matched_doc:
            cls_display = getattr(classification, "tier3_specific", getattr(classification, "raw_class_name", "unknown"))
            return RAGContext(
                relevant_knowledge_found=False,
                scientific_summary=f"No authoritative scientific documentation found for class '{cls_display}'.",
                potential_hazards=[],
                material_degradation_profile="Unavailable in local knowledge base",
                recommended_mitigation="Verify object identity with secondary acoustic pass.",
                authoritative_sources=[],
                retrieval_status="NO_DATA",
            )

        # Build auditable sources attribution
        source_attribution = [
            {
                "source_id": matched_doc.get("source_id", "UNKNOWN"),
                "title": matched_doc.get("title", ""),
                "organization": matched_doc.get("organization", ""),
                "authority": matched_doc.get("authority", ""),
                "publication_date": matched_doc.get("publication_date", ""),
                "version": matched_doc.get("version", ""),
                "reference": matched_doc.get("source_reference", ""),
            }
        ]

        summary = (
            f"{matched_doc.get('title')} ({matched_doc.get('organization')}, {matched_doc.get('publication_date')}). "
            f"Key environmental concern: {matched_doc.get('topic')}."
        )

        return RAGContext(
            relevant_knowledge_found=True,
            scientific_summary=summary,
            potential_hazards=matched_doc.get("impact_mechanisms", []),
            material_degradation_profile=matched_doc.get("material_degradation_profile", "Unknown"),
            recommended_mitigation=matched_doc.get(
                "recommended_mitigation", "Visual / acoustic inspection recommended."
            ),
            authoritative_sources=source_attribution,
            retrieval_status="LOCAL_KNOWLEDGE",
        )
