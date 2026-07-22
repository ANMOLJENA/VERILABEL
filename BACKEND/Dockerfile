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

# One worker keeps memory bounded; scale via instance size, not extra workers.
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers 1 --timeout 120 app:app"]
