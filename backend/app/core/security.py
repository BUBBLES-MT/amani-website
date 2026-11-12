# backend/app/core/security.py

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import logging

from app.core.config import settings

# ✅ WERKZEUG SECURITY
from werkzeug.security import generate_password_hash, check_password_hash

logger = logging.getLogger(__name__)

# ============================================
# OAUTH2 SCHEME
# ============================================
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=True
)


# ============================================
# TOKEN TYPES
# ============================================
class TokenType:
    ACCESS = "access"
    REFRESH = "refresh"
    RESET = "reset"
    VERIFICATION = "verification"


# ============================================
# SECURITY CLASS
# ============================================
class Security:
    """Security utilities for authentication and authorization"""

    # ============================================
    # PASSWORD METHODS
    # ============================================
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        if not hashed_password:
            return False
        try:
            return check_password_hash(hashed_password, plain_password)
        except Exception as e:
            logger.error(f"❌ Password verification error: {e}")
            if len(hashed_password) < 60:
                return plain_password == hashed_password
            return False

    @staticmethod
    def get_password_hash(password: str) -> str:
        return generate_password_hash(password)

    # ============================================
    # TOKEN CREATION
    # ============================================
    @staticmethod
    def create_access_token(
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        to_encode.update({
            "exp": expire,
            "type": TokenType.ACCESS,
            "iat": datetime.utcnow()
        })
        return jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )

    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        to_encode.update({
            "exp": expire,
            "type": TokenType.REFRESH,
            "iat": datetime.utcnow()
        })
        return jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )

    @staticmethod
    def create_reset_token(email: str) -> str:
        data = {"sub": email, "type": TokenType.RESET}
        expire = datetime.utcnow() + timedelta(
            minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        )
        to_encode = data.copy()
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        return jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )

    @staticmethod
    def create_verification_token(email: str) -> str:
        data = {"sub": email, "type": TokenType.VERIFICATION}
        expire = datetime.utcnow() + timedelta(
            minutes=settings.VERIFICATION_TOKEN_EXPIRE_MINUTES
        )
        to_encode = data.copy()
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        return jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )

    # ============================================
    # TOKEN DECODING
    # ============================================
    @staticmethod
    def decode_token(token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("❌ Token expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except JWTError as e:
            logger.warning(f"❌ Invalid token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    @staticmethod
    def verify_token_type(token: str, expected_type: str) -> Dict[str, Any]:
        payload = Security.decode_token(token)
        token_type = payload.get("type")
        if token_type != expected_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected: {expected_type}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload

    # ============================================
    # ✅ USER AUTHENTICATION METHODS
    # ============================================
    # NOTE: get_current_user, get_current_active_user, get_current_super_admin
    # zimehamishwa kwenda app/core/dependencies.py
    # security.py HAI-IMPORT get_db wala User model
    # Hii inazuia circular import

    # ============================================
    # ROLE PERMISSIONS (Helper - inatumika na dependencies.py)
    # ============================================
    @staticmethod
    def check_role(user, required_roles: list):
        """Check if user has required role - helper for dependencies.py"""
        if user.role.value not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role required: {', '.join(required_roles)}",
            )
        return user

    # ============================================
    # PASSWORD VALIDATION
    # ============================================
    @staticmethod
    def validate_password_strength(password: str) -> bool:
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        if not any(c.isupper() for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter"
            )
        if not any(c.islower() for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one lowercase letter"
            )
        if not any(c.isdigit() for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one number"
            )
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one special character"
            )
        return True


# ============================================
# SHORTCUT FUNCTIONS
# ============================================
def get_password_hash(password: str) -> str:
    return Security.get_password_hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return Security.verify_password(plain, hashed)

def create_access_token(data: Dict[str, Any]) -> str:
    return Security.create_access_token(data)