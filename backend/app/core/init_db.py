# backend/app/core/init_db.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.core.security import Security
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def check_admin_exists():
    """Check if any admin exists in the system"""
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(User).where(User.role == UserRole.SUPER_ADMIN)
            )
            admin = result.scalar_one_or_none()
            return admin is not None
    except Exception as e:
        logger.error(f"❌ Admin check failed: {e}")
        return False

async def create_admin_manually(email: str, password: str, name: str = "Super Admin"):
    """
    Create admin manually - call this function when you want to create an admin
    
    Args:
        email: Admin email
        password: Admin password (min 8 characters)
        name: Admin full name
    """
    try:
        async with AsyncSessionLocal() as session:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.email == email)
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                logger.warning(f"⚠️ User with email {email} already exists!")
                return False
            
            import uuid
            admin = User(
                id=str(uuid.uuid4()),
                name=name,
                email=email,
                password=Security.get_password_hash(password),
                role=UserRole.SUPER_ADMIN,
                is_active=True
            )
            session.add(admin)
            await session.commit()
            logger.info(f"✅ Admin created successfully!")
            logger.info(f"   👤 Email: {email}")
            logger.info(f"   🔑 Password: {password}")
            return True
    except Exception as e:
        logger.error(f"❌ Admin creation failed: {e}")
        await session.rollback()
        return False

async def init_database():
    """
    Initialize database - checks if admin exists and gives instruction
    """
    logger.info("🔄 Initializing database...")
    
    admin_exists = await check_admin_exists()
    
    if admin_exists:
        logger.info("✅ Super admin already exists in the system!")
    else:
        logger.warning("⚠️ No super admin found in the system!")
        logger.info("📝 To create an admin, use one of these methods:")
        logger.info("   1. POST /api/v1/auth/register with role='super_admin'")
        logger.info("   2. Insert directly via Supabase Table Editor")
        logger.info("   3. Call create_admin_manually() function")
        logger.info("")
        logger.info("🔧 Example API call:")
        logger.info("   curl -X POST http://localhost:8000/api/v1/auth/register \\")
        logger.info("   -H 'Content-Type: application/json' \\")
        logger.info("   -d '{\"name\":\"Super Admin\",\"email\":\"admin@amanichurch.com\",\"password\":\"Admin@123\",\"role\":\"super_admin\"}'")
    
    logger.info("✅ Database initialization complete!")