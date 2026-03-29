import difflib
import logging
import re
from typing import Dict, Any, List, Tuple, Optional

logger = logging.getLogger(__name__)


class ComparisonService:
    PASS_THRESHOLD = 95.0
    MIN_ACCEPTABLE_THRESHOLD = 85.0

    @staticmethod
    def normalize_text(text: Optional[str]) -> str:
        if not text:
            return ""
        return " ".join(str(text).lower().strip().split())

    @staticmethod
    def normalize_numeric_like(value: Any) -> str:
        if value is None:
            return ""
        text = str(value).strip().lower()
        text = re.sub(r"\s+", "", text)
        return text

    @staticmethod
    def safe_dict(value: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        return value if isinstance(value, dict) else {}

    @staticmethod
    def exact_match(verified_text: str, production_text: str) -> Tuple[float, List[Dict[str, Any]]]:
        verified = ComparisonService.normalize_text(verified_text)
        production = ComparisonService.normalize_text(production_text)

        if not verified or not production:
            return 0.0, [{
                "field": "extracted_text",
                "type": "TEXT_MISSING",
                "severity": "CRITICAL",
                "expected": verified_text or "",
                "found": production_text or "",
            }]

        v_words = verified.split()
        p_words = production.split()

        similarity = difflib.SequenceMatcher(None, v_words, p_words).ratio()

        deviations: List[Dict[str, Any]] = []
        diff = difflib.ndiff(v_words, p_words)

        for token in diff:
            if token.startswith("- "):
                deviations.append({
                    "field": "extracted_text",
                    "type": "TEXT_REMOVED",
                    "word": token[2:],
                    "severity": "MODERATE" if similarity < 0.90 else "MINOR",
                })
            elif token.startswith("+ "):
                deviations.append({
                    "field": "extracted_text",
                    "type": "TEXT_ADDED",
                    "word": token[2:],
                    "severity": "MODERATE" if similarity < 0.90 else "MINOR",
                })

        return similarity, deviations

    @staticmethod
    def numeric_validation(ref: Dict[str, Any], new: Dict[str, Any]) -> List[Dict[str, Any]]:
        deviations: List[Dict[str, Any]] = []

        numeric_fields = [
            "strength",
            "expiry_date",
            "manufacturing_date",
            "batch_number",
            "license_number",
        ]

        for field in numeric_fields:
            ref_val = ComparisonService.normalize_numeric_like(ref.get(field))
            new_val = ComparisonService.normalize_numeric_like(new.get(field))

            if ref_val and not new_val:
                deviations.append({
                    "field": output_field,
                    "expected": ref.get(source_field),
                    "found": None,
                    "type": "MISSING_FIELD",
                    "severity": "MODERATE" if source_field == "composition_summary" else "MINOR",
                })
                continue
            elif ref_val and not new_val:
                deviations.append({
                    "field": field,
                    "expected": ref.get(field),
                    "found": None,
                    "type": "MISSING_FIELD",
                    "severity": "CRITICAL",
                })

        return deviations

    @staticmethod
    def fuzzy_match(ref: Dict[str, Any], new: Dict[str, Any]) -> List[Dict[str, Any]]:
        deviations: List[Dict[str, Any]] = []

        ref_name = ComparisonService.normalize_text(ref.get("drug_name", ""))
        new_name = ComparisonService.normalize_text(new.get("drug_name", ""))

        if ref_name and new_name:
            similarity = difflib.SequenceMatcher(None, ref_name, new_name).ratio()
            if similarity < 0.90:
                deviations.append({
                    "field": "drug_name",
                    "expected": ref.get("drug_name"),
                    "found": new.get("drug_name"),
                    "type": "FUZZY_MISMATCH",
                    "severity": "CRITICAL",
                })
        elif ref_name and not new_name:
            deviations.append({
                "field": "drug_name",
                "expected": ref.get("drug_name"),
                "found": None,
                "type": "MISSING_FIELD",
                "severity": "CRITICAL",
            })

        return deviations

    @staticmethod
    def semantic_match(ref: Dict[str, Any], new: Dict[str, Any]) -> List[Dict[str, Any]]:
        deviations: List[Dict[str, Any]] = []

        text_fields = [
            ("composition_summary", "composition_summary"),
            ("storage_conditions", "storage_conditions"),
            ("manufacturer", "manufacturer"),
            ("marketed_by", "marketed_by"),
            ("dosage_form", "dosage_form"),
            ("package_type", "package_type"),
            ("analysis_summary", "analysis_summary"),
        ]

        for source_field, output_field in text_fields:
            ref_val = ComparisonService.normalize_text(ref.get(source_field, ""))
            new_val = ComparisonService.normalize_text(new.get(source_field, ""))

            # expected exists but new missing -> flag it
            if ref_val and not new_val:
                deviations.append({
                    "field": output_field,
                    "expected": ref.get(source_field),
                    "found": None,
                    "type": "MISSING_FIELD",
                    "severity": "MODERATE" if source_field == "composition_summary" else "MINOR",
                })
                continue

            if ref_val and new_val:
                similarity = difflib.SequenceMatcher(None, ref_val, new_val).ratio()
                threshold = 0.85 if source_field == "composition_summary" else 0.90

                if similarity < threshold:
                    deviations.append({
                        "field": output_field,
                        "expected": ref.get(source_field),
                        "found": new.get(source_field),
                        "type": "SEMANTIC_MISMATCH",
                        "severity": "MODERATE" if source_field == "composition_summary" else "MINOR",
                    })

        return deviations

    @staticmethod
    def deduplicate_deviations(deviations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen = set()
        unique: List[Dict[str, Any]] = []

        for deviation in deviations:
            key = (
                deviation.get("field"),
                deviation.get("type"),
                str(deviation.get("expected")),
                str(deviation.get("found")),
                str(deviation.get("word")),
            )
            if key not in seen:
                seen.add(key)
                unique.append(deviation)

        return unique

    @staticmethod
    def compute_structured_match_percentage(
        verified_data: Dict[str, Any],
        validation_data: Dict[str, Any],
    ) -> float:
        comparable_fields = [
            "drug_name",
            "strength",
            "dosage_form",
            "batch_number",
            "manufacturing_date",
            "expiry_date",
            "manufacturer",
            "marketed_by",
            "license_number",
            "storage_conditions",
            "composition_summary",
            "package_type",
        ]

        total = 0
        matched = 0

        for field in comparable_fields:
            ref_val = ComparisonService.normalize_text(verified_data.get(field, ""))
            new_val = ComparisonService.normalize_text(validation_data.get(field, ""))

            if ref_val:
                total += 1
                if ref_val == new_val:
                    matched += 1

        if total == 0:
            return 0.0

        return round((matched / total) * 100, 2)

    @staticmethod
    def classify(match_percentage: float, deviations: List[Dict[str, Any]]) -> Tuple[str, str]:
        critical_count = sum(1 for d in deviations if d.get("severity") == "CRITICAL")
        moderate_count = sum(1 for d in deviations if d.get("severity") == "MODERATE")

        if match_percentage < ComparisonService.MIN_ACCEPTABLE_THRESHOLD:
            return "FAIL", "REJECT"

        if critical_count > 0:
            return "FAIL", "REJECT"

        if moderate_count >= 2:
            return "FAIL", "REJECT"

        if match_percentage < ComparisonService.PASS_THRESHOLD:
            return "FAIL", "REJECT"

        return "PASS", "PASS"

    @staticmethod
    def compute_authenticity_score(match_percentage: float, deviations: List[Dict[str, Any]]) -> int:
        penalty = 0

        for deviation in deviations:
            severity = deviation.get("severity")
            if severity == "CRITICAL":
                penalty += 12
            elif severity == "MODERATE":
                penalty += 6
            else:
                penalty += 2

        score = int(round(match_percentage - penalty))
        return max(0, min(100, score))

    @staticmethod
    def run_comparison(
        verified_text: str,
        validation_data: Dict[str, Any],
        verified_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        validation_data = ComparisonService.safe_dict(validation_data)
        verified_data = ComparisonService.safe_dict(verified_data)

        extracted_text = validation_data.get("extracted_text", "") or ""

        text_similarity, exact_deviations = ComparisonService.exact_match(
            verified_text,
            extracted_text,
        )

        numeric_deviations: List[Dict[str, Any]] = []
        fuzzy_deviations: List[Dict[str, Any]] = []
        semantic_deviations: List[Dict[str, Any]] = []
        structured_match_percentage = 0.0

        if verified_data:
            numeric_deviations = ComparisonService.numeric_validation(verified_data, validation_data)
            fuzzy_deviations = ComparisonService.fuzzy_match(verified_data, validation_data)
            semantic_deviations = ComparisonService.semantic_match(verified_data, validation_data)
            structured_match_percentage = ComparisonService.compute_structured_match_percentage(
                verified_data,
                validation_data,
            )
        else:
            logger.warning(
                "ComparisonService.run_comparison called without verified_data; structured field checks were skipped."
            )

        all_deviations = (
            exact_deviations +
            numeric_deviations +
            fuzzy_deviations +
            semantic_deviations
        )
        all_deviations = ComparisonService.deduplicate_deviations(all_deviations)

        # Prefer structured score when verified structured fields exist
        if verified_data:
            match_percentage = structured_match_percentage
        else:
            match_percentage = round(text_similarity * 100, 2)

        status, final_decision = ComparisonService.classify(match_percentage, all_deviations)
        authenticity_score = ComparisonService.compute_authenticity_score(
            match_percentage,
            all_deviations,
        )

        return {
            "match_percentage": match_percentage,
            "deviations": all_deviations,
            "status": status,
            "final_decision": final_decision,
            "authenticity_score": authenticity_score,
        }