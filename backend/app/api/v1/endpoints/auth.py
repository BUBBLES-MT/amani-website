# backend/app/api/v1/endpoints/auth.py

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid

from app.core.database import get_db
from app.core.security import Security
from app.models.user import User, UserRole, ApprovalStatus
from app.schemas.user import (
    UserCreate,
    UserRegister,
    UserResponse,
    Token,
    LoginRequest,
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ============================================
# 🔐 POST /login
# ✅ ZUIA user asiyekuwa approved
# ============================================
@router.post("/login", response_model=Token)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login user and return access token"""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Barua pepe au nenosiri si sahihi",
        )

    if not Security.verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Barua pepe au nenosiri si sahihi",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akaunti yako imezimwa",
        )

    # ✅ ZUIA user asiyekuwa approved
    if not getattr(user, "is_approved", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akaunti yako bado haijaidhinishwa na viongozi wa kanisa. Tafadhali subiri.",
        )

    # Create access token
    role_value = user.role.value if hasattr(user.role, "value") else str(user.role)
    access_token = Security.create_access_token(
        data={"sub": user.id, "email": user.email, "role": role_value}
    )
    refresh_token = Security.create_refresh_token(
        data={"sub": user.id, "email": user.email}
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.from_orm(user),
    )


# ============================================
# 🆕 POST /register — PUBLIC REGISTRATION
# ✅ Inatumia UserRegister (roles 7 tu)
# ✅ Inahitaji approval (is_approved=False)
# ============================================
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    """
    Kujisajili kwa umma.
    - Roles zinazoruhusiwa: muumini, mzee_kanisa, mhasibu, katibu_mkuu,
      mwenyekiti, mwenyekiti_msaidizi, it
    - ❌ Hauruhusiwi: mchungaji_kiongozi, mchungaji_msaidizi, mwinjilist, super_admin
    - User anabaki pending (is_approved=False, approval_status='pending')
    """
    # Check email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Barua pepe tayari imesajiliwa",
        )

    # ✅ Validate role
    forbidden_roles = [
        "mchungaji_kiongozi",
        "mchungaji_msaidizi",
        "mwinjilist",
        "super_admin",
    ]
    if user_data.role in forbidden_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{user_data.role}' hairuhusiwi kujisajili. Wasiliana na Super Admin.",
        )

    try:
        role_enum = UserRole(user_data.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Role '{user_data.role}' si sahihi",
        )

    # ✅ Unda user — pending approval
    user = User(
        id=str(uuid.uuid4()),
        name=user_data.name,
        email=user_data.email,
        password=Security.get_password_hash(user_data.password),
        phone=user_data.phone,
        role=role_enum,
        church_name=user_data.church_name,
        church_location=user_data.church_location,
        is_active=True,
        is_approved=False,
        approval_status=ApprovalStatus.PENDING,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserResponse.from_orm(user)


# ============================================
# 📤 POST /logout
# ============================================
@router.post("/logout")
async def logout():
    """Logout user"""
    return {"message": "Logged out successfully"}


# ============================================
# 👤 GET /me — current user
# ============================================
@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user"""
    payload = Security.decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    return UserResponse.from_orm(user)


# ============================================
# 🔄 POST /refresh
# ============================================
@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token"""
    payload = Security.decode_token(refresh_token)
    token_type = payload.get("type")

    if token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    role_value = user.role.value if hasattr(user.role, "value") else str(user.role)
    access_token = Security.create_access_token(
        data={"sub": user.id, "email": user.email, "role": role_value}
    )

    return {"access_token": access_token, "token_type": "bearer"}