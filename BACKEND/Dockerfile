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

# Install the CPU-only torch build first so surya-ocr's dependency resolution
# picks it up instead of pulling the much larger CUDA wheels — this host has
# no GPU, and the CUDA wheels alone are >2GB.
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=5000
EXPOSE 5000

WORKDIR /app/src

# gunicorn imports app.py's module-level `app` Flask instance. One worker
# keeps memory bounded since Surya's torch models are loaded per-process and
# are large; scale via Render's instance size, not extra workers.
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers 1 --timeout 120 app:app"]
