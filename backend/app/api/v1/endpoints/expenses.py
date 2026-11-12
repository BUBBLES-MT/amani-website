# backend/app/api/v1/endpoints/expenses.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime
import uuid
import logging

from app.core.database import get_db
from app.core.security import Security, oauth2_scheme
from app.core.dependencies import (
    EXPENSE_VIEWER_ROLES,
    EXPENSE_REQUESTER_ROLES,
    EXPENSE_APPROVER_ROLES,
    EXPENSE_WITHDRAWER_ROLES,
)
from app.models.user import User
from app.models.offering import Offering
from app.models.expense import Expense, ExpenseCategory, ExpenseStatus
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate

logger = logging.getLogger(__name__)

router = APIRouter()


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


def _role_value(user: User) -> str:
    return user.role.value if hasattr(user.role, "value") else str(user.role)


def _match_enum(enum_class, value, field_name: str):
    if isinstance(value, enum_class):
        return value
    if value is None or str(value).strip() == "":
        raise HTTPException(422, f"{field_name} haipaswi kuwa tupu")

    normalized = str(value).strip().lower().replace("_", " ").replace("-", " ")
    normalized = " ".join(normalized.split())

    for member in enum_class:
        mv = " ".join(str(member.value).strip().lower().replace("_", " ").replace("-", " ").split())
        mn = " ".join(str(member.name).strip().lower().replace("_", " ").replace("-", " ").split())
        if normalized == mv or normalized == mn:
            return member

    valid = ", ".join([f'"{m.value}"' for m in enum_class])
    raise HTTPException(422, f"{field_name} si sahihi. Tumia mojawapo ya haya: {valid}")


# ============================================
# ➕ POST /expenses/ — Omba matumizi
# ✅ Mhasibu, viongozi wa juu wanaweza kuomba
# ❌ Mzee wa Kanisa HAWEZI kuomba
# ============================================
@router.post("/", response_model=ExpenseResponse)
async def create_expense(
    expense_data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    user = await _get_current_user(db, token)
    role = _role_value(user)

    if role not in EXPENSE_REQUESTER_ROLES:
        raise HTTPException(
            403,
            f"Huna ruhusa ya kuomba matumizi. Roles: {', '.join(EXPENSE_REQUESTER_ROLES)}",
        )

    # ✅ Check offering exists
    result = await db.execute(
        select(Offering).where(Offering.id == expense_data.offering_id)
    )
    offering = result.scalar_one_or_none()
    if not offering:
        raise HTTPException(404, "Sadaka haipatikani")

    # ✅ Check available funds
    result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.offering_id == expense_data.offering_id,
            Expense.status == ExpenseStatus.IMETOLEWA,
        )
    )
    total_used = result.scalar() or 0
    available = float(offering.amount) - float(total_used)

    if expense_data.amount > available:
        raise HTTPException(
            400,
            f"Fedha hazitoshi. Zinazopatikana: TZS {available:,.0f}",
        )

    category_enum = _match_enum(
        ExpenseCategory, expense_data.category, "category"
    )

    data = expense_data.dict()
    data["category"] = category_enum

    expense = Expense(
        id=str(uuid.uuid4()),
        **data,
        requested_by=user.id,
        requested_by_name=user.name,
        status=ExpenseStatus.IMEOMBWA,
    )

    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    logger.info(f"✅ Expense created: {expense.id} by {user.name}")
    return ExpenseResponse.from_orm(expense)


# ============================================
# 📋 GET /expenses/ — Orodha
# ✅ Wanaoona matumizi tu
# ============================================
@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
    skip: int = 0,
    limit: int = 100,
):
    user = await _get_current_user(db, token)
    role = _role_value(user)

    if role not in EXPENSE_VIEWER_ROLES:
        raise HTTPException(
            403,
            f"Huna ruhusa ya kuona matumizi. Roles: {', '.join(EXPENSE_VIEWER_ROLES)}",
        )

    result = await db.execute(
        select(Expense)
        .order_by(Expense.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    expenses = result.scalars().all()

    return [ExpenseResponse.from_orm(e) for e in expenses]


# ============================================
# ✅ PUT /expenses/{id}/approve — Idhinisha
# ⚠️ MUHIMU: mhasibu HAWEZI kuidhinisha!
# ✅ Ni mchungaji_kiongozi, msaidizi, mwinjilist, mwenyekiti, katibu, super_admin
# ❌ Mtu HAWEZI kuidhinisha matumizi yake mwenyewe
# ============================================
@router.put("/{expense_id}/approve", response_model=ExpenseResponse)
async def approve_expense(
    expense_id: str,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    user = await _get_current_user(db, token)
    role = _role_value(user)

    # ✅ TUMIA EXPENSE_APPROVER_ROLES (sio LEADER_ROLES)
    # mhasibu HAYUPO — internal control!
    if role not in EXPENSE_APPROVER_ROLES:
        raise HTTPException(
            403,
            f"Huna ruhusa ya kuidhinisha matumizi. Roles: {', '.join(EXPENSE_APPROVER_ROLES)}",
        )

    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(404, "Matumizi haipatikani")

    # ✅ Kagua: mtu HAWEZI kuidhinisha matumizi aliyoomba mwenyewe
    if expense.requested_by == user.id:
        raise HTTPException(
            403,
            "Hauwezi kuidhinisha matumizi uliyoomba mwenyewe. Internal control.",
        )

    # ✅ Kagua: status lazima iwe IMEOMBWA
    if expense.status != ExpenseStatus.IMEOMBWA:
        raise HTTPException(
            400,
            f"Matumizi haya yameshaidhinishwa au yametolewa (status: {expense.status.value})",
        )

    expense.status = ExpenseStatus.IMEIDHINISHWA
    expense.approved_by = user.id
    expense.approved_by_name = user.name
    expense.approved_at = datetime.utcnow()

    await db.commit()
    await db.refresh(expense)
    logger.info(f"✅ Expense approved: {expense_id} by {user.name}")
    return ExpenseResponse.from_orm(expense)


# ============================================
# 💰 PUT /expenses/{id}/withdraw — Toa fedha
# ✅ Mhasibu, mchungaji_kiongozi, katibu_mkuu, super_admin
# ✅ Mhasibu NDYE anatoa fedha (baada ya idhini)
# ============================================
@router.put("/{expense_id}/withdraw", response_model=ExpenseResponse)
async def withdraw_expense(
    expense_id: str,
    update_data: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    user = await _get_current_user(db, token)
    role = _role_value(user)

    # ✅ TUMIA EXPENSE_WITHDRAWER_ROLES
    if role not in EXPENSE_WITHDRAWER_ROLES:
        raise HTTPException(
            403,
            f"Huna ruhusa ya kutoa fedha. Roles: {', '.join(EXPENSE_WITHDRAWER_ROLES)}",
        )

    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(404, "Matumizi haipatikani")

    if expense.status != ExpenseStatus.IMEIDHINISHWA:
        raise HTTPException(400, "Matumizi hayajaidhinishwa bado")

    expense.status = ExpenseStatus.IMETOLEWA
    expense.withdrawn_by = user.id
    expense.withdrawn_by_name = user.name
    expense.withdrawn_at = datetime.utcnow()
    if update_data.withdrawal_reference:
        expense.withdrawal_reference = update_data.withdrawal_reference

    await db.commit()
    await db.refresh(expense)
    logger.info(f"✅ Expense withdrawn: {expense_id} by {user.name}")
    return ExpenseResponse.from_orm(expense)


# ============================================
# 🔍 GET /expenses/{id} — Moja
# ✅ Wanaoona matumizi tu
# ============================================
@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: str,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    user = await _get_current_user(db, token)
    role = _role_value(user)

    if role not in EXPENSE_VIEWER_ROLES:
        raise HTTPException(
            403,
            f"Huna ruhusa ya kuona matumizi. Roles: {', '.join(EXPENSE_VIEWER_ROLES)}",
        )

    result = await db.execute(select(Expense).where(Expense.id == expense_id))
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(404, "Matumizi haipatikani")
    return ExpenseResponse.from_orm(expense)