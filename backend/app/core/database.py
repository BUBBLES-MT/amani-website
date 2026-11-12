# backend/app/core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import MetaData, create_engine, text
import logging
from typing import AsyncGenerator
import socket
import subprocess
import time

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
from app.models.prayer_request import PrayerRequest
from app.models.donation import Donation

# ============================================
# GET LOCAL IP ADDRESS
# ============================================
def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        try:
            result = subprocess.run(['ipconfig'], capture_output=True, text=True)
            lines = result.stdout.split('\n')
            for line in lines:
                if 'IPv4 Address' in line:
                    parts = line.split(':')
                    if len(parts) > 1:
                        ip = parts[1].strip()
                        if ip.startswith('192.168.') or ip.startswith('10.') or ip.startswith('172.'):
                            return ip
        except:
            pass
    return 'localhost'

# ============================================
# GET DATABASE HOSTS TO TRY
# ============================================
def get_hosts_to_try():
    """Get list of hosts to try for database connection"""
    hosts = []
    
    # 1. Local IP (halisi)
    local_ip = get_local_ip()
    if local_ip and local_ip != 'localhost':
        hosts.append(local_ip)
    
    # 2. localhost
    hosts.append('localhost')
    
    # 3. 127.0.0.1
    hosts.append('127.0.0.1')
    
    # 4. Computer name
    try:
        computer_name = socket.gethostname()
        if computer_name:
            hosts.append(computer_name)
    except:
        pass
    
    # Remove duplicates
    seen = set()
    unique_hosts = []
    for host in hosts:
        if host not in seen:
            seen.add(host)
            unique_hosts.append(host)
    
    return unique_hosts

# ============================================
# SMART DATABASE URL GENERATION
# ============================================
def get_database_url():
    """Generate database URL with proper password encoding"""
    
    # ✅ MUHIMU: Password encoding - @ inakuwa %40
    DB_USER = "postgres"
    DB_PASSWORD_RAW = "Matandala@2026"
    DB_PASSWORD_ENCODED = "Matandala%402026"  # ✅ @ → %40
    DB_PORT = "5432"
    DB_NAME = "aman_church_db"
    
    # Jaribu hosts mbalimbali
    hosts_to_try = get_hosts_to_try()
    
    for host in hosts_to_try:
        try:
            # Test if host resolves
            socket.gethostbyname(host)
            
            # Build URL with encoded password
            async_url = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD_ENCODED}@{host}:{DB_PORT}/{DB_NAME}"
            sync_url = f"postgresql://{DB_USER}:{DB_PASSWORD_ENCODED}@{host}:{DB_PORT}/{DB_NAME}"
            
            logger.info(f"✅ Using database host: {host}")
            return async_url, sync_url, host
            
        except Exception as e:
            logger.debug(f"❌ Host {host} failed: {e}")
            continue
    
    # Fallback - tumia localhost
    logger.warning("⚠️ No working host found, using localhost")
    async_url = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD_ENCODED}@localhost:{DB_PORT}/{DB_NAME}"
    sync_url = f"postgresql://{DB_USER}:{DB_PASSWORD_ENCODED}@localhost:{DB_PORT}/{DB_NAME}"
    return async_url, sync_url, 'localhost'

# ============================================
# GENERATE DATABASE URLS
# ============================================
async_database_url, sync_database_url, DB_HOST = get_database_url()

logger.info("=" * 60)
logger.info("🗄️  DATABASE CONFIGURATION")
logger.info("=" * 60)
logger.info(f"📍 Host: {DB_HOST}")
logger.info(f"📦 Database: aman_church_db")
logger.info(f"👤 User: postgres")
logger.info(f"🔗 Async URL: {async_database_url.replace('Matandala%402026', '*****')}")
logger.info("=" * 60)

# ============================================
# ASYNC ENGINE
# ============================================
async_engine = create_async_engine(
    async_database_url,
    echo=settings.DATABASE_ECHO,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "timeout": 30,
        "command_timeout": 60,
        "server_settings": {
            "application_name": "aman_church_api"
        },
        "ssl": False,
    }
)

# ============================================
# SYNC ENGINE
# ============================================
sync_engine = create_engine(
    sync_database_url,
    echo=settings.DATABASE_ECHO,
    pool_size=1,
    max_overflow=0,
    pool_pre_ping=True,
    connect_args={
        "sslmode": "disable"
    }
)

# ============================================
# SESSION FACTORIES
# ============================================
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

SyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine,
)

# ============================================
# DEPENDENCIES
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

def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================
# RETRY CONNECTION HELPER
# ============================================
async def test_connection(retries: int = 3, delay: int = 2):
    """Test database connection with retries"""
    for attempt in range(1, retries + 1):
        try:
            async with async_engine.connect() as conn:
                result = await conn.execute(text("SELECT 1"))
                await conn.commit()
                logger.info(f"✅ Database connection successful (attempt {attempt})")
                return True
        except Exception as e:
            logger.warning(f"⚠️ Connection attempt {attempt} failed: {e}")
            if attempt < retries:
                time.sleep(delay)
    return False

# ============================================
# DATABASE INITIALIZATION
# ============================================
async def init_db():
    try:
        logger.info("🔄 Connecting to PostgreSQL database...")
        
        # Test connection first
        if not await test_connection():
            logger.error("❌ Could not connect to database after multiple attempts")
            logger.error("💡 Please check:")
            logger.error("   1. PostgreSQL is running")
            logger.error("   2. Database 'aman_church_db' exists")
            logger.error("   3. Username and password are correct")
            logger.error("   4. Password uses %40 instead of @")
            raise Exception("Database connection failed")
        
        # Create tables
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified successfully!")
        
        # List all tables
        async with async_engine.connect() as conn:
            result = await conn.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
            )
            tables = [row[0] for row in result.fetchall()]
            if tables:
                logger.info(f"📋 Tables in database: {', '.join(tables)}")
            else:
                logger.info("📋 No tables found yet. They will be created automatically.")
            
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        logger.error("💡 MUHIMU: Hakikisha password imeandikwa sahihi!")
        logger.error("   ✅ Matandala%402026 (encoded)")
        logger.error("   ❌ Matandala@2026 (raw - haikubaliki)")
        raise

async def close_db():
    await async_engine.dispose()
    logger.info("✅ Database connections closed.")

# ============================================
# EXPORTS
# ============================================
__all__ = [
    "Base",
    "async_engine",
    "sync_engine",
    "AsyncSessionLocal",
    "SyncSessionLocal",
    "get_db",
    "get_sync_db",
    "init_db",
    "close_db",
    "test_connection",
]