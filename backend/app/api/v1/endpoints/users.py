# backend/app/api/v1/endpoints/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.core.database import get_db
from app.core.security import Security
from app.core.dependencies import (
    get_current_user,
    get_current_active_user,
    get_current_super_admin,
    PUBLIC_LEADER_ROLES,
)
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter()


# ============================================
# ✅ ROLES ZINAZORUHUSIWA KUONA WATUMIAJI
# ============================================
USER_VIEWER_ROLES = [
    "super_admin",
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "katibu_mkuu",
    "mzee_kanisa",
    "mhasibu",
    "it",
]


# ============================================
# 🎯 HELPER: Case-insensitive role matcher
# ============================================
def _match_role(value: str) -> UserRole:
    if isinstance(value, UserRole):
        return value
    if value is None or str(value).strip() == "":
        return UserRole.MUUMINI

    normalized = str(value).strip().lower().replace("_", " ").replace("-", " ")
    normalized = " ".join(normalized.split())

    for member in UserRole:
        mv = " ".join(str(member.value).strip().lower().replace("_", " ").replace("-", " ").split())
        mn = " ".join(str(member.name).strip().lower().replace("_", " ").replace("-", " ").split())
        if normalized == mv or normalized == mn:
            return member

    valid = ", ".join([f'"{m.value}"' for m in UserRole])
    raise HTTPException(422, f"role si sahihi. Tumia: {valid}")


def _role_str(user: User) -> str:
    return user.role.value if hasattr(user.role, "value") else str(user.role)


# ============================================
# 🌍 PUBLIC — GET /users/public/leaders
# ============================================
@router.get("/public/leaders", response_model=List[UserResponse])
async def get_public_leaders(
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
):
    """Public leaders for about page (no auth required)"""
    leader_roles = [
        UserRole.MCHUNGAJI_KIONGOZI,
        UserRole.MCHUNGAJI_MSAIDIZI,
        UserRole.MWENYEKITI,
        UserRole.MWENYEKITI_MSAIDIZI,
        UserRole.MWINJILIST,
        UserRole.MZEE_KANISA,
        UserRole.MHASIBU,
        UserRole.KATIBU_MKUU,
    ]

    result = await db.execute(
        select(User)
        .where(User.is_active == True)
        .where(User.role.in_(leader_roles))
        .order_by(User.role.asc())
        .limit(limit)
    )
    users = result.scalars().all()
    return [UserResponse.from_orm(u) for u in users]


# ============================================
# 📋 GET /users/ — Orodha
# ✅ Viongozi wanaweza kuona (bila super_admin)
# ============================================
@router.get("/", response_model=List[UserResponse])
async def get_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),  # ✅ Badilisha
    skip: int = 0,
    limit: int = 100,
):
    """
    Get all users.
    ✅ Viongozi wanaweza kuona — super_admin, mchungaji_kiongozi, n.k.
    ✅ Super Admin HAONEKANI kwenye orodha.
    """
    # ✅ Kagua ruhusa
    role = _role_str(current_user)
    if role not in USER_VIEWER_ROLES:
        raise HTTPException(
            403,
            f"Huna ruhusa ya kuona watumiaji. Roles: {', '.join(USER_VIEWER_ROLES)}",
        )

    result = await db.execute(
        select(User)
        .where(User.role != UserRole.SUPER_ADMIN)  # ✅ Ficha super_admin
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return [UserResponse.from_orm(u) for u in users]


# ============================================
# 🔍 GET /users/{id} — Moja
# ============================================
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # ✅ Kagua ruhusa
    role = _role_str(current_user)
    if role not in USER_VIEWER_ROLES:
        raise HTTPException(403, "Huna ruhusa ya kuona mtumiaji huyu")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Mtumiaji haipatikani")

    user_role = _role_str(user)
    current_role = _role_str(current_user)

    # ✅ Super admin haonekani kwa wengine
    if user_role == "super_admin" and user.id != current_user.id:
        raise HTTPException(404, "Mtumiaji haipatikani")

    return UserResponse.from_orm(user)


# ============================================
# ➕ POST /users/ — Unda (super_admin pekee)
# ============================================
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),  # ✅ Super admin pekee
):
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(400, "Barua pepe tayari imesajiliwa")

    role_enum = _match_role(user_data.role or "muumini")

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
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.from_orm(user)


# ============================================
# ✏️ PUT /users/{id} — Hariri
# ============================================
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Mtumiaji haipatikani")

    user_role = _role_str(user)
    current_role = _role_str(current_user)

    # ✅ Super admin hawezi kubadilishwa na mtu mwingine
    if user_role == "super_admin" and user.id != current_user.id:
        raise HTTPException(403, "Hauwezi kubadilisha super admin")

    # ✅ Kubadilisha role — super_admin pekee
    data = user_data.dict(exclude_unset=True)

    if "role" in data and data["role"]:
        if current_role != "super_admin":
            raise HTTPException(403, "Ni super admin pekee anayeweza kubadilisha roles")
        data["role"] = _match_role(data["role"])

    if "password" in data and data["password"]:
        user.password = Security.get_password_hash(data.pop("password"))
    else:
        data.pop("password", None)

    for key, value in data.items():
        if hasattr(user, key):
            setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return UserResponse.from_orm(user)


# ============================================
# 🗑️ DELETE /users/{id} — Futa (super_admin pekee)
# ============================================
@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),  # ✅ Super admin pekee
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Mtumiaji haipatikani")

    # ✅ Hauwezi kujifuta mwenyewe
    if user.id == current_user.id:
        raise HTTPException(400, "Hauwezi kujifuta mwenyewe")

    # ✅ Super admin hawezi kufutwa
    user_role = _role_str(user)
    if user_role == "super_admin":
        raise HTTPException(403, "Hauwezi kufuta super admin")

    await db.delete(user)
    await db.commit()
    return {"message": "Mtumiaji amefutwa"}