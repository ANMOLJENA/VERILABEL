# VeriLabel Backend

Flask API for OCR extraction and medicine-label validation.

## Requirements

- Python 3.10+
- Ollama running locally with `glm-ocr:latest`
- OpenRouter API key for structured validation
- Optional on Windows: Poppler for PDF OCR

## Quick Start

1. Copy the env template.
   `copy .env.example .env` on Windows or `cp .env.example .env` on macOS/Linux
2. Update `.env` with at least `OPENROUTER_API_KEY`.
3. Start Ollama and pull the OCR model:
   `ollama serve`
   `ollama pull glm-ocr:latest`
4. Start the API:
   - Windows: `scripts\start_server.bat`
   - macOS/Linux: `bash scripts/start_server.sh`

The API defaults to [http://127.0.0.1:5000](http://127.0.0.1:5000).

## Notes For Windows

- If PDF uploads fail, install Poppler and set `POPPLER_PATH` in `.env`.
- If port `5000` is busy, change `PORT` in `.env` and update the frontend `VITE_API_BASE_URL`.
- The startup scripts create `venv` automatically if it does not exist.
