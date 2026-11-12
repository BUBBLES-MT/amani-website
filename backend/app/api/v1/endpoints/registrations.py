# backend/app/api/v1/endpoints/registrations.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User, UserRole, ApprovalStatus
from app.schemas.user import UserResponse, ApprovalRequest

router = APIRouter()


# ============================================
# ✅ ROLES ZINAZORUHUSIWA KUDHIBITISHA
# ============================================
APPROVER_ROLES = [
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "super_admin",
]


def _role_str(user: User) -> str:
    return user.role.value if hasattr(user.role, "value") else str(user.role)


# ============================================
# 📋 GET /registrations/ — Orodha ya pending
# ✅ Viongozi watatu pekee + super_admin
# ============================================
@router.get("/", response_model=List[UserResponse])
async def get_pending_registrations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
):
    """
    Orodha ya maombi yanayosubiri idhini.
    Inaonekana tu kwa viongozi watatu (mchungaji_kiongozi, msaidizi, mwinjilist)
    na super_admin.
    """
    role = _role_str(current_user)

    if role not in APPROVER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Ni viongozi pekee wanaweza kuona maombi. Roles: {', '.join(APPROVER_ROLES)}",
        )

    result = await db.execute(
        select(User)
        .where(User.is_approved == False)
        .where(User.approval_status == ApprovalStatus.PENDING)
        .where(User.role != UserRole.SUPER_ADMIN)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return [UserResponse.from_orm(u) for u in users]


# ============================================
# 🔍 GET /registrations/{user_id} — Moja
# ============================================
@router.get("/{user_id}", response_model=UserResponse)
async def get_registration(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Ona maelezo ya usajili mmoja"""
    role = _role_str(current_user)

    if role not in APPROVER_ROLES:
        raise HTTPException(403, "Huna ruhusa ya kuona usajili huu")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(404, "Mtumiaji haipatikani")

    return UserResponse.from_orm(user)


# ============================================
# ✅ POST /registrations/approve/{user_id} — Idhinisha
# ============================================
@router.post("/approve/{user_id}", response_model=UserResponse)
async def approve_registration(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Idhinisha usajili wa mtumiaji"""
    role = _role_str(current_user)

    if role not in APPROVER_ROLES:
        raise HTTPException(403, "Ni viongozi pekee wanaweza kuidhinisha")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(404, "Mtumiaji haipatikani")

    if getattr(user, "is_approved", False):
        raise HTTPException(400, "Mtumiaji huyu ameshaidhinishwa")

    user.is_approved = True
    user.approval_status = ApprovalStatus.APPROVED
    user.approved_by = current_user.id
    user.approved_by_name = current_user.name
    user.approved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(user)
    return UserResponse.from_orm(user)


# ============================================
# ❌ POST /registrations/reject/{user_id} — Kataa
# ✅ User anafutwa moja kwa moja kwenye database
# ============================================
@router.post("/reject/{user_id}")
async def reject_registration(
    user_id: str,
    data: ApprovalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Kataa usajili wa mtumiaji — anafutwa moja kwa moja.
    Sababu (rejection_reason) inarudishwa kwenye response kwa rekodi.
    """
    role = _role_str(current_user)

    if role not in APPROVER_ROLES:
        raise HTTPException(403, "Ni viongozi pekee wanaweza kukataa")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(404, "Mtumiaji haipatikani")

    if getattr(user, "is_approved", False):
        raise HTTPException(400, "Mtumiaji huyu ameshaidhinishwa — hawezi kukataliwa")

    # ✅ Hifadhi jina kwa ajili ya response (kabla ya kufuta)
    user_name = user.name
    user_email = user.email
    reason = data.rejection_reason or "Hakuna sababu iliyotolewa"
    rejected_by = current_user.name

    # ✅ FUTA user moja kwa moja kwenye database
    await db.delete(user)
    await db.commit()

    return {
        "message": f"Usajili wa '{user_name}' umekataliwa na umefutwa.",
        "user_name": user_name,
        "user_email": user_email,
        "rejection_reason": reason,
        "rejected_by": rejected_by,
    }


# ============================================
# 📊 GET /registrations/stats/summary — Takwimu
# ============================================
@router.get("/stats/summary")
async def get_registration_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Takwimu za usajili"""
    role = _role_str(current_user)

    if role not in APPROVER_ROLES:
        raise HTTPException(403, "Huna ruhusa ya kuona takwimu hizi")

    result = await db.execute(
        select(User)
        .where(User.is_approved == False)
        .where(User.approval_status == ApprovalStatus.PENDING)
        .where(User.role != UserRole.SUPER_ADMIN)
    )
    pending = result.scalars().all()

    # Hesabu kwa role
    by_role: dict = {}
    for u in pending:
        r = u.role.value if hasattr(u.role, "value") else str(u.role)
        by_role[r] = by_role.get(r, 0) + 1

    return {
        "total_pending": len(pending),
        "by_role": by_role,
    }