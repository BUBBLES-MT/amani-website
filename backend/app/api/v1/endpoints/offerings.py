# backend/app/api/v1/endpoints/offerings.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import Security, oauth2_scheme
from app.core.dependencies import (
    RECORDER_ROLES,
    OFFERING_VIEWER_ROLES,
    LEADER_ROLES,
)
from app.models.user import User
from app.models.offering import (
    Offering,
    OfferingStatus,
    ServiceType,
    OfferingType,
)
from app.models.expense import Expense, ExpenseStatus
from app.schemas.offering import OfferingCreate, OfferingResponse, OfferingUpdate

router = APIRouter()


# ============================================
# 🔐 HELPER: Pata user kutoka token (ASYNC)
# ============================================
async def _get_current_user(db: AsyncSession, token: str) -> User:
    payload = Security.decode_token(token)
    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


# ============================================
# 🎯 HELPER: Case-insensitive enum matcher
# ============================================
def _match_enum(enum_class, value, field_name: str):
    if isinstance(value, enum_class):
        return value

    if value is None or str(value).strip() == "":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} haipaswi kuwa tupu",
        )

    normalized = (
        str(value)
        .strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
    )
    normalized = " ".join(normalized.split())

    for member in enum_class:
        member_value = " ".join(
            str(member.value).strip().lower().replace("_", " ").replace("-", " ").split()
        )
        member_name = " ".join(
            str(member.name).strip().lower().replace("_", " ").replace("-", " ").split()
        )
        if normalized == member_value or normalized == member_name:
            return member

    valid = ", ".join([f'"{m.value}"' for m in enum_class])
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"{field_name} si sahihi. Tumia mojawapo ya haya: {valid}",
    )


# ============================================
# 💰 HELPER: Hesabu matumizi na salio kwa offering
# ============================================
async def _calculate_financials(db: AsyncSession, offering_id: str, amount: float):
    result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.offering_id == offering_id,
            Expense.status == ExpenseStatus.IMETOLEWA,
        )
    )
    total_expenses = float(result.scalar() or 0)
    balance = float(amount) - total_expenses
    return total_expenses, balance


# ============================================
# ➕ POST /offerings/ — Rekodi sadaka mpya
# ✅ Mzee wa Kanisa, Mhasibu, na Super Admin
# ============================================
@router.post("/", response_model=OfferingResponse)
async def create_offering(
    offering_data: OfferingCreate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Create new offering (Mzee wa Kanisa, Mhasibu, Super Admin)"""
    user = await _get_current_user(db, token)
    role = user.role.value if hasattr(user.role, "value") else str(user.role)

    # ✅ Wanaorekodi sadaka tu
    if role not in RECORDER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Huna ruhusa ya kurekodi sadaka. Roles: {', '.join(RECORDER_ROLES)}",
        )

    service_type_enum = _match_enum(
        ServiceType, offering_data.service_type, "service_type"
    )
    offering_type_enum = _match_enum(
        OfferingType, offering_data.offering_type, "offering_type"
    )

    data = offering_data.dict()
    data["service_type"] = service_type_enum
    data["offering_type"] = offering_type_enum

    team_members = data.get("team_members") or []

    offering = Offering(
        id=str(uuid.uuid4()),
        **data,
        recorded_by=user.id,
        recorded_by_name=user.name,
        status=OfferingStatus.IMEREKODIWA,
        number_of_members=len(team_members),
    )

    db.add(offering)
    await db.commit()
    await db.refresh(offering)

    resp = OfferingResponse.from_orm(offering)
    resp.total_expenses = 0.0
    resp.balance = float(offering.amount)
    return resp


# ============================================
# 📋 GET /offerings/ — Orodha ya sadaka + hesabu
# ✅ Wanaoona sadaka (bila muumini)
# ============================================
@router.get("/", response_model=List[OfferingResponse])
async def get_offerings(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
    skip: int = 0,
    limit: int = 100,
):
    """Get all offerings with financial summary"""
    user = await _get_current_user(db, token)
    role = user.role.value if hasattr(user.role, "value") else str(user.role)

    # ✅ Wanaoona sadaka tu
    if role not in OFFERING_VIEWER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Huna ruhusa ya kuona sadaka. Roles: {', '.join(OFFERING_VIEWER_ROLES)}",
        )

    query = select(Offering).order_by(Offering.service_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    offerings = result.scalars().all()

    response_list: List[OfferingResponse] = []
    for o in offerings:
        total_expenses, balance = await _calculate_financials(db, o.id, o.amount)
        resp = OfferingResponse.from_orm(o)
        resp.total_expenses = total_expenses
        resp.balance = balance
        response_list.append(resp)

    return response_list


# ============================================
# ✅ PUT /offerings/{id}/approve — Idhinisha sadaka
# ✅ Viongozi wa juu pekee
# ============================================
@router.put("/{offering_id}/approve", response_model=OfferingResponse)
async def approve_offering(
    offering_id: str,
    update_data: OfferingUpdate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Approve offering (Mhasibu, viongozi wa juu, Super Admin)"""
    user = await _get_current_user(db, token)
    role = user.role.value if hasattr(user.role, "value") else str(user.role)

    # ✅ Viongozi wa juu tu wanaweza kuidhinisha
    if role not in LEADER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Ni mhasibu au viongozi wa juu pekee wanaweza kuidhinisha. Roles: {', '.join(LEADER_ROLES)}",
        )

    result = await db.execute(select(Offering).where(Offering.id == offering_id))
    offering = result.scalar_one_or_none()

    if not offering:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offering not found",
        )

    if update_data.status:
        offering.status = _match_enum(
            OfferingStatus, update_data.status, "status"
        )

    if update_data.bank_reference:
        offering.bank_reference = update_data.bank_reference
    if update_data.deposited_at:
        offering.deposited_at = update_data.deposited_at

    offering.approved_by = user.id
    offering.approved_by_name = user.name
    offering.approved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(offering)

    total_expenses, balance = await _calculate_financials(db, offering.id, offering.amount)
    resp = OfferingResponse.from_orm(offering)
    resp.total_expenses = total_expenses
    resp.balance = balance
    return resp


# ============================================
# 🔍 GET /offerings/{id} — Sadaka moja + hesabu
# ============================================
@router.get("/{offering_id}", response_model=OfferingResponse)
async def get_offering(
    offering_id: str,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Get single offering by ID with financial summary"""
    user = await _get_current_user(db, token)
    role = user.role.value if hasattr(user.role, "value") else str(user.role)

    if role not in OFFERING_VIEWER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Huna ruhusa ya kuona sadaka. Roles: {', '.join(OFFERING_VIEWER_ROLES)}",
        )

    result = await db.execute(select(Offering).where(Offering.id == offering_id))
    offering = result.scalar_one_or_none()

    if not offering:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sadaka haipatikani",
        )

    total_expenses, balance = await _calculate_financials(db, offering.id, offering.amount)
    resp = OfferingResponse.from_orm(offering)
    resp.total_expenses = total_expenses
    resp.balance = balance
    return resp