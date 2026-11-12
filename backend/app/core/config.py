# backend/app/core/config.py

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
from typing import List, Optional
import json
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """KKKT Church - Usharika Wa Amani, Singida — Application Settings"""

    # ============================================
    # 🎯 ENVIRONMENT
    # ============================================
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # ============================================
    # 🗄️ DATABASE — Local
    # ============================================
    LOCAL_DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:Matandala%402026@localhost:5432/aman_church_db"
    )

    # ============================================
    # 🗄️ DATABASE — Production
    # ============================================
    DATABASE_URL: Optional[str] = None

    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_ECHO: bool = False

    # ============================================
    # SECURITY
    # ============================================
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    JWT_SECRET_KEY: str = "your-jwt-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 60

    # ============================================
    # ADMIN USER
    # ============================================
    ADMIN_EMAIL: str = "admin@amanichurch.com"
    ADMIN_PASSWORD: str = "Amani@2024"
    ADMIN_NAME: str = "Super Admin"

    # ============================================
    # CLOUDINARY
    # ============================================
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_URL: str = ""

    # ============================================
    # CORS
    # ============================================
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://192.168.56.1:3000",
    ]

    ALLOWED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
        "192.168.56.1",
    ]

    # ============================================
    # API SETTINGS
    # ============================================
    API_VERSION: str = "v1"
    API_PREFIX: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # ============================================
    # FRONTEND URL
    # ============================================
    FRONTEND_URL: str = "http://localhost:3000"
    FRONTEND_ADMIN_URL: str = "http://localhost:3000/admin"

    # ============================================
    # EMAIL
    # ============================================
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@amanichurch.com"
    SMTP_FROM_NAME: str = "KKKT Church - Usharika Wa Amani, Singida"

    # ============================================
    # PAYMENT
    # ============================================
    MPESA_CONSUMER_KEY: str = ""
    MPESA_CONSUMER_SECRET: str = ""
    MPESA_PASSKEY: str = ""
    MPESA_SHORTCODE: str = "174379"

    # ============================================
    # SECURITY RATE LIMITS
    # ============================================
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_LOGIN: int = 5
    RATE_LIMIT_REGISTER: int = 3

    # ============================================
    # CACHING
    # ============================================
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL: int = 3600

    # ============================================
    # LOGGING
    # ============================================
    LOG_FILE: str = "logs/app.log"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # ============================================
    # ✅ FIELD VALIDATOR
    # ============================================
    @field_validator("ALLOWED_ORIGINS", "ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_list_from_string(cls, v):
        if v is None:
            return v
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    # ============================================
    # ✅ METHOD: DATABASE URL — inamua ipi itumike
    # (sio @property — Pydantic v2 haioni @property)
    # ============================================
    def get_database_url(self) -> str:
        """
        Ikiwa ENVIRONMENT ni 'production' → tumia DATABASE_URL (Supabase)
        Ikiwa ENVIRONMENT ni 'development' → tumia LOCAL_DATABASE_URL
        """
        if self.ENVIRONMENT.lower() == "production":
            if self.DATABASE_URL:
                url = self.DATABASE_URL
                # ✅ Hakikisha inatumia asyncpg
                if url.startswith("postgresql://"):
                    url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
                return url
            print("⚠️  PRODUCTION lakini DATABASE_URL haipo — tumia local database")
            return self.LOCAL_DATABASE_URL

        return self.LOCAL_DATABASE_URL

    # ============================================
    # PYDANTIC CONFIG
    # ============================================
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


# ============================================
# CREATE SETTINGS INSTANCE
# ============================================
settings = Settings()


# ============================================
# LOG SETTINGS ON STARTUP
# ============================================
if settings.DEBUG:
    db_host = "unknown"
    try:
        db_url = settings.get_database_url()
        if "@" in db_url:
            db_host = db_url.split("@")[-1]
        else:
            db_host = db_url
    except Exception:
        db_host = "error"

    print("=" * 60)
    print("🔧 KKKT Church - Usharika Wa Amani, Singida")
    print("=" * 60)
    print(f"  📦 ENVIRONMENT: {settings.ENVIRONMENT}")
    print(f"  🗄️  DATABASE: {db_host}")
    print(f"  🌐 ALLOWED_ORIGINS: {settings.ALLOWED_ORIGINS}")
    print(f"  🐞 DEBUG: {settings.DEBUG}")
    print(f"  📊 LOG_LEVEL: {settings.LOG_LEVEL}")
    print("=" * 60)