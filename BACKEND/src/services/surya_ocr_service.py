"""
surya_ocr_service.py — Local OCR service using classic Surya (pre-"Surya 2").

Runs Surya's detection + recognition transformer models directly in-process
via torch — no external server (unlike Ollama, which needs `ollama serve`
running, or Surya 2, which spawns its own vLLM/llama.cpp inference server).

Model weights are downloaded automatically on first use and cached by
huggingface_hub in the usual local cache directory.
"""

import logging
import os
import time
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


def _try_import_pdf2image():
    try:
        from pdf2image import convert_from_path
        return convert_from_path
    except ImportError:
        return None


def _patch_composite_configs() -> None:
    """
    Compatibility shim: surya-ocr's composite model configs (recognition,
    layout, table_rec, texify) require `encoder`/`decoder` kwargs at init
    and never set `has_no_defaults_at_init`. Newer `transformers` versions
    added that flag specifically so PretrainedConfig.to_diff_dict() skips
    calling `cls()` with no args on such configs — without it, logging a
    freshly loaded config crashes with `KeyError: 'encoder'`.

    surya-ocr predates that flag, so we set it here rather than pinning
    to an old, hard-to-source transformers version.
    """
    module_paths = [
        ("surya.recognition.model.config", "SuryaOCRConfig"),
        ("surya.layout.model.config", "SuryaLayoutConfig"),
        ("surya.table_rec.model.config", "SuryaTableRecConfig"),
        ("surya.texify.model.config", "TexifyConfig"),
    ]
    for module_name, class_name in module_paths:
        try:
            module = __import__(module_name, fromlist=[class_name])
            config_cls = getattr(module, class_name)
        except (ImportError, AttributeError):
            continue
        config_cls.has_no_defaults_at_init = True


class SuryaOCRService:
    """OCR service backed by local Surya detection + recognition models."""

    DEFAULT_LANGS = os.getenv("SURYA_OCR_LANGS", "en").split(",")

    def __init__(self, langs: Optional[List[str]] = None):
        self.langs = langs or [l.strip() for l in self.DEFAULT_LANGS if l.strip()] or ["en"]

        from surya.recognition import RecognitionPredictor
        from surya.detection import DetectionPredictor

        _patch_composite_configs()

        logger.info("Loading Surya OCR models (first run downloads weights)...")
        t0 = time.monotonic()
        self._recognition_predictor = RecognitionPredictor()
        self._detection_predictor = DetectionPredictor()
        logger.info("Surya OCR models ready in %.1fs | langs=%s", time.monotonic() - t0, self.langs)

        self._convert_pdf = _try_import_pdf2image()

    # ------------------------------------------------------------------
    # Public API — mirrors OllamaOCRService so routes can swap in place
    # ------------------------------------------------------------------

    def process_image(self, image_path: str) -> Dict:
        """Extract text from a single image file."""
        from PIL import Image

        t0 = time.monotonic()
        image = Image.open(image_path).convert("RGB")
        text = self._run_ocr([image])[0]
        return {
            "extracted_text": text,
            "processing_time": round(time.monotonic() - t0, 3),
            "model_name": "surya-ocr",
            "ocr_engine": "surya",
        }

    def process_pdf(self, pdf_path: str) -> Dict:
        """Extract text from every page of a PDF."""
        if self._convert_pdf is None:
            raise RuntimeError("pdf2image is not installed — cannot process PDFs.")

        t0 = time.monotonic()
        poppler_path = self._find_poppler_path()
        convert_kwargs: Dict = {"dpi": 200}
        if poppler_path:
            convert_kwargs["poppler_path"] = poppler_path

        logger.info("Converting PDF to images: %s", pdf_path)
        pages = self._convert_pdf(pdf_path, **convert_kwargs)

        if not pages:
            return {
                "extracted_text": "",
                "processing_time": round(time.monotonic() - t0, 3),
                "model_name": "surya-ocr",
                "ocr_engine": "surya",
                "pages_processed": 0,
            }

        pages = [p.convert("RGB") for p in pages]
        logger.info("Running Surya OCR on %d page(s)", len(pages))
        page_texts = self._run_ocr(pages)

        combined = "\n\n--- Page Break ---\n\n".join(t for t in page_texts if t)
        return {
            "extracted_text": combined,
            "processing_time": round(time.monotonic() - t0, 3),
            "model_name": "surya-ocr",
            "ocr_engine": "surya",
            "pages_processed": len(pages),
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _run_ocr(self, images: List) -> List[str]:
        """Batch-run recognition across one or more page images."""
        predictions = self._recognition_predictor(
            images, [self.langs] * len(images), self._detection_predictor
        )
        texts = []
        for page in predictions:
            lines = [line.text.strip() for line in page.text_lines if line.text and line.text.strip()]
            texts.append("\n".join(lines))
        return texts

    @staticmethod
    def _find_poppler_path() -> Optional[str]:
        """Detect Poppler binary directory on Windows."""
        if os.name != "nt":
            return None
        candidates = [
            r"C:\Program Files\poppler\Library\bin",
            r"C:\Program Files\poppler\bin",
            r"C:\Program Files (x86)\poppler\bin",
            r"C:\poppler\bin",
        ]
        for path in candidates:
            if os.path.isdir(path):
                return path
        return None


# ---------------------------------------------------------------------------
# Lazy process-wide singleton — model loading is expensive, so both
# ocr_routes and comparison_routes share the same loaded instance.
# ---------------------------------------------------------------------------
_surya_service: Optional[SuryaOCRService] = None


def get_surya_service() -> SuryaOCRService:
    global _surya_service
    if _surya_service is None:
        _surya_service = SuryaOCRService()
    return _surya_service
