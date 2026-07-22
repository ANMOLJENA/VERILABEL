FROM python:3.11-slim

# System deps:
#   poppler-utils  - PDF -> image rasterization (pdf2image)
#   libgl1 / libglib2.0-0 - runtime libs opencv-python needs
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=5000
EXPOSE 5000

WORKDIR /app/src

# 2 workers: RapidOCR only needs ~50MB/worker (measured), so this stays well
# under a 512MB host while meaning a slow OpenRouter call in one worker
# doesn't take down health checks/OCR for the whole app. Timeout is above
# the OpenRouter service's own 45s read timeout with headroom, since
# requests' timeout guards against silent gaps, not total request duration —
# a slow-but-progressing response can still run past 45s without tripping it.
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers 2 --timeout 180 app:app"]
