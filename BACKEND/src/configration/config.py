"""
Configuration settings for the Flask application
"""

import os
from dotenv import load_dotenv

load_dotenv()


def _normalized_database_url() -> str:
    """
    Neon/Heroku-style providers hand out `postgres://` URLs, but SQLAlchemy 2.x
    only accepts the `postgresql://` scheme. Rewrite it so DATABASE_URL can be
    pasted in verbatim from the provider dashboard.
    """
    url = os.getenv("DATABASE_URL", "sqlite:///label_verification.db")
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    return url


class Config:
    """Base configuration"""

    # ---------------------------------------------------
    # Core App
    # ---------------------------------------------------
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-in-production"
    )

    # ---------------------------------------------------
    # Database
    # ---------------------------------------------------
    SQLALCHEMY_DATABASE_URI = _normalized_database_url()

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---------------------------------------------------
    # Upload Settings
    # ---------------------------------------------------
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")

    MAX_CONTENT_LENGTH = int(
        os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)
    )

    ALLOWED_EXTENSIONS = {
        "png", "jpg", "jpeg", "pdf", "tiff", "bmp"
    }

    # ---------------------------------------------------
    # Surya OCR Configuration
    # ---------------------------------------------------
    SURYA_OCR_LANGS = os.getenv(
        "SURYA_OCR_LANGS",
        "en"
    )

    # ---------------------------------------------------
    # Offline Mode
    # ---------------------------------------------------
    OFFLINE_MODE = os.getenv(
        "OFFLINE_MODE",
        "false"
    ).lower() == "true"


# =====================================================
# Environment Configurations
# =====================================================

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

    # Force secure secret in production
    SECRET_KEY = os.getenv("SECRET_KEY")


class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///label_verification.db"


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}