# backend/app/api/v1/endpoints/reports.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
import logging

from app.core.database import get_db
from app.core.security import Security, oauth2_scheme
from app.models.user import User
from app.models.offering import Offering, OfferingStatus
from app.models.expense import Expense, ExpenseStatus

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# 📊 GET /reports/dashboard
# ============================================
@router.get("/dashboard")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Get dashboard statistics"""
    payload = Security.decode_token(token)

    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # ============================================
    # 💰 OFFERINGS — Jumla ya sadaka ZOTE
    # ✅ FIX: Hesabu sadaka zote (bila kujali status)
    # ============================================
    try:
        result = await db.execute(
            select(func.coalesce(func.sum(Offering.amount), 0))
        )
        total_offerings = float(result.scalar() or 0)
        logger.info(f"💰 Total offerings: TZS {total_offerings:,.0f}")
    except Exception as e:
        logger.error(f"❌ Offerings sum error: {e}")
        total_offerings = 0.0

    # ============================================
    # 💸 EXPENSES — Jumla ya matumizi YALIYOTOLEWA
    # ============================================
    try:
        result = await db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                Expense.status == ExpenseStatus.IMETOLEWA
            )
        )
        total_expenses = float(result.scalar() or 0)
    except Exception as e:
        logger.error(f"❌ Expenses sum error: {e}")
        total_expenses = 0.0

    # ============================================
    # 📊 BALANCE
    # ============================================
    balance = total_offerings - total_expenses

    # ============================================
    # 📅 WEEKLY OFFERINGS — Wiki hii
    # ✅ Hesabu sadaka zote za wiki hii
    # ============================================
    try:
        week_start = datetime.utcnow() - timedelta(days=7)
        result = await db.execute(
            select(func.coalesce(func.sum(Offering.amount), 0)).where(
                Offering.service_date >= week_start,
            )
        )
        week_offerings = float(result.scalar() or 0)
    except Exception as e:
        logger.error(f"❌ Week offerings error: {e}")
        week_offerings = 0.0

    # ============================================
    # 📅 MONTHLY OFFERINGS — Mwezi huu (siku 30)
    # ✅ Hesabu sadaka zote za mwezi huu
    # ============================================
    try:
        month_start = datetime.utcnow() - timedelta(days=30)
        result = await db.execute(
            select(func.coalesce(func.sum(Offering.amount), 0)).where(
                Offering.service_date >= month_start,
            )
        )
        month_offerings = float(result.scalar() or 0)
    except Exception as e:
        logger.error(f"❌ Month offerings error: {e}")
        month_offerings = 0.0

    # ============================================
    # 👥 TOTAL MEMBERS
    # ============================================
    try:
        result = await db.execute(
            select(func.count(User.id)).where(User.is_active == True)  # noqa: E712
        )
        total_members = result.scalar() or 0
    except Exception:
        total_members = 0

    # ============================================
    # 📋 RECENT OFFERINGS
    # ============================================
    try:
        result = await db.execute(
            select(Offering).order_by(Offering.service_date.desc()).limit(5)
        )
        recent_offerings = result.scalars().all()
    except Exception as e:
        logger.error(f"❌ Recent offerings error: {e}")
        recent_offerings = []

    recent_offerings_list = []
    for o in recent_offerings:
        try:
            recent_offerings_list.append({
                "id": str(o.id),
                "date": o.service_date.isoformat() if o.service_date else None,
                "service": o.service_type.value if o.service_type else "Ibada",
                "offering_type": o.offering_type.value if o.offering_type else "Sadaka",
                "amount": float(o.amount) if o.amount else 0,
                "status": o.status.value if o.status else "Imerekodiwa",
                "recorded_by": o.recorded_by_name or "—",
                "description": o.description or "",
            })
        except Exception as e:
            logger.warning(f"⚠️ Skipping offering: {e}")
            continue

    # ============================================
    # 📋 RECENT EXPENSES
    # ============================================
    try:
        result = await db.execute(
            select(Expense).order_by(Expense.created_at.desc()).limit(5)
        )
        recent_expenses = result.scalars().all()
    except Exception:
        recent_expenses = []

    recent_expenses_list = []
    for e in recent_expenses:
        try:
            recent_expenses_list.append({
                "id": str(e.id),
                "date": e.created_at.isoformat() if e.created_at else None,
                "category": e.category.value if e.category else "Matumizi",
                "description": e.description or "",
                "amount": float(e.amount) if e.amount else 0,
                "status": e.status.value if e.status else "Imeombwa",
                "requested_by": e.requested_by_name or "—",
            })
        except Exception:
            continue

    # ============================================
    # 📅 TOTAL EVENTS & SERMONS
    # ============================================
    total_events = 0
    try:
        from app.models.event import Event
        result = await db.execute(select(func.count(Event.id)))
        total_events = result.scalar() or 0
    except Exception:
        pass

    total_sermons = 0
    try:
        from app.models.sermon import Sermon
        result = await db.execute(select(func.count(Sermon.id)))
        total_sermons = result.scalar() or 0
    except Exception:
        pass

    # ============================================
    # 🎯 RETURN
    # ============================================
    return {
        "total_offerings": total_offerings,
        "total_expenses": total_expenses,
        "balance": balance,
        "week_offerings": week_offerings,
        "month_offerings": month_offerings,
        "currency": "TZS",
        "total_members": total_members,
        "total_events": total_events,
        "total_sermons": total_sermons,
        "recent_offerings": recent_offerings_list,
        "recent_expenses": recent_expenses_list,
    }


# ============================================
# 🌍 PUBLIC ENDPOINTS (Bila Auth)
# ============================================

@router.get("/public-stats")
async def get_public_stats(
    db: AsyncSession = Depends(get_db),
):
    """Get public statistics for homepage (no auth required)"""
    try:
        result = await db.execute(
            select(func.count(User.id)).where(User.is_active == True)  # noqa: E712
        )
        total_members = result.scalar() or 0
    except Exception:
        total_members = 0

    total_events = 0
    try:
        from app.models.event import Event
        result = await db.execute(select(func.count(Event.id)))
        total_events = result.scalar() or 0
    except Exception:
        pass

    total_sermons = 0
    try:
        from app.models.sermon import Sermon
        result = await db.execute(select(func.count(Sermon.id)))
        total_sermons = result.scalar() or 0
    except Exception:
        pass

    return {
        "total_members": total_members,
        "total_events": total_events,
        "total_sermons": total_sermons,
    }