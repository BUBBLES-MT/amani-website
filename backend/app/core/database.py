# backend/app/core/database.py

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy import MetaData, text
from sqlalchemy.pool import NullPool
import logging
import uuid
from typing import AsyncGenerator

from app.core.config import settings

logger = logging.getLogger(__name__)

# ============================================
# METADATA & BASE
# ============================================
metadata = MetaData()
Base = declarative_base(metadata=metadata)


# ============================================
# IMPORT ALL MODELS
# ============================================
from app.models.user import User
from app.models.offering import Offering
from app.models.expense import Expense
from app.models.sermon import Sermon
from app.models.event import Event
from app.models.gallery import Gallery
from app.models.message import Message
from app.models.prayer_request import PrayerRequest
from app.models.donation import Donation
from app.models.setting import Setting
from app.models.page_visitor import PageVisitor


# ============================================
# ✅ DATABASE URL
# ============================================
DATABASE_URL = settings.get_database_url()


def _safe_host(url: str) -> str:
    try:
        if "@" in url:
            return url.split("@")[-1]
        return url
    except Exception:
        return "unknown"


logger.info("=" * 60)
logger.info("🗄️  DATABASE CONFIGURATION")
logger.info("=" * 60)
logger.info(f"📦 ENVIRONMENT: {settings.ENVIRONMENT}")
logger.info(f"📍 Host: {_safe_host(DATABASE_URL)}")
logger.info("=" * 60)


# ============================================
# ✅ ASYNC ENGINE — Supabase PgBouncer Fixes
# ============================================
if settings.ENVIRONMENT.lower() == "production":
    # ✅ Production (Supabase PgBouncer)
    engine_kwargs = {
        "echo": settings.DATABASE_ECHO,
        "poolclass": NullPool,
        "connect_args": {
            "ssl": "require",
            "timeout": 30,
            "command_timeout": 60,
            "server_settings": {"application_name": "aman_church_api"},
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0,
            "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
        },
        "execution_options": {"compiled_cache": None},
    }
else:
    # ✅ Local (PostgreSQL)
    engine_kwargs = {
        "echo": settings.DATABASE_ECHO,
        "pool_size": settings.DATABASE_POOL_SIZE,
        "max_overflow": settings.DATABASE_MAX_OVERFLOW,
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "connect_args": {
            "timeout": 30,
            "command_timeout": 60,
            "server_settings": {"application_name": "aman_church_api"},
        },
    }


async_engine = create_async_engine(DATABASE_URL, **engine_kwargs)


# ============================================
# SESSION FACTORY
# ============================================
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ============================================
# ✅ GET DB
# ============================================
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ============================================
# ✅ TEST CONNECTION
# ============================================
async def test_connection(retries: int = 3, delay: int = 2) -> bool:
    import asyncio

    for attempt in range(1, retries + 1):
        try:
            async with async_engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info(f"✅ Database connection successful (attempt {attempt})")
            return True
        except Exception as e:
            logger.warning(f"⚠️ Connection attempt {attempt} failed: {e}")
            if attempt < retries:
                await asyncio.sleep(delay)
    return False


# ============================================
# ✅ INIT DB
# ============================================
async def init_db():
    try:
        logger.info("🔄 Connecting to database...")

        if not await test_connection():
            logger.error("❌ Could not connect to database after multiple attempts")
            raise Exception("Database connection failed")

        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        logger.info("✅ Database tables created/verified successfully!")

        async with async_engine.connect() as conn:
            result = await conn.execute(
                text(
                    "SELECT table_name FROM information_schema.tables "
                    "WHERE table_schema = 'public' ORDER BY table_name"
                )
            )
            tables = [row[0] for row in result.fetchall()]
            if tables:
                logger.info(f"📋 Tables: {', '.join(tables)}")
            else:
                logger.info("📋 No tables found — they will be created.")

    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise


# ============================================
# ✅ CLOSE DB
# ============================================
async def close_db():
    await async_engine.dispose()
    logger.info("✅ Database connections closed.")


# ============================================
# EXPORTS
# ============================================
__all__ = [
    "Base",
    "async_engine",
    "AsyncSessionLocal",
    "get_db",
    "init_db",
    "close_db",
    "test_connection",
]