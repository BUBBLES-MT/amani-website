# backend/app/api/v1/endpoints/visitors.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from typing import Optional
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.page_visitor import PageVisitor
from app.schemas.page_visitor import TrackVisitRequest, VisitorStatsResponse

router = APIRouter()


# ============================================
# 👣 POST /visitors/track — Rekodi tembeleo
# ✅ Public — bila auth
# ============================================
@router.post("/track")
async def track_visit(
    data: TrackVisitRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Rekodi tembeleo la mtumiaji.
    - Inatumika kwenye kila ukurasa wa public
    - Inahesabu unique visitors kwa kutumia session_id
    """
    # ✅ Pata IP na user agent
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]
    referrer = data.referrer or request.headers.get("referer", "")

    # ✅ Pata au tengeneza session_id
    session_id = request.cookies.get("visitor_session")
    is_unique = False

    if not session_id:
        session_id = str(uuid.uuid4())
        is_unique = True

    # ✅ Angalia kama session hii imeshatembelea ukurasa huu leo
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    if not is_unique:
        result = await db.execute(
            select(PageVisitor).where(
                PageVisitor.session_id == session_id,
                PageVisitor.path == data.path,
                PageVisitor.visited_at >= today_start,
            ).limit(1)
        )
        existing = result.scalar_one_or_none()
        if not existing:
            is_unique = True

    # ✅ Unda visitor record
    visitor = PageVisitor(
        id=str(uuid.uuid4()),
        ip_address=ip_address,
        user_agent=user_agent,
        session_id=session_id,
        visitor_id=session_id,  # kwa sasa tumia session
        page=data.page,
        path=data.path,
        referrer=referrer,
        is_unique=is_unique,
    )

    db.add(visitor)
    await db.commit()

    return {
        "success": True,
        "session_id": session_id,
        "is_unique": is_unique,
    }


# ============================================
# 📊 GET /visitors/stats — Takwimu za umma
# ✅ Public — bila auth
# ============================================
@router.get("/stats", response_model=VisitorStatsResponse)
async def get_visitor_stats(
    db: AsyncSession = Depends(get_db),
):
    """
    Takwimu za umma:
    - Total visitors (unique sessions)
    - Total views (kila tembeleo)
    - Today / Week / Month unique
    """
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    # Total unique visitors (sessions)
    result = await db.execute(
        select(func.count(distinct(PageVisitor.session_id)))
    )
    total_visitors = result.scalar() or 0

    # Total views
    result = await db.execute(select(func.count(PageVisitor.id)))
    total_views = result.scalar() or 0

    # Unique today
    result = await db.execute(
        select(func.count(distinct(PageVisitor.session_id))).where(
            PageVisitor.visited_at >= today_start
        )
    )
    unique_today = result.scalar() or 0

    # Unique week
    result = await db.execute(
        select(func.count(distinct(PageVisitor.session_id))).where(
            PageVisitor.visited_at >= week_start
        )
    )
    unique_week = result.scalar() or 0

    # Unique month
    result = await db.execute(
        select(func.count(distinct(PageVisitor.session_id))).where(
            PageVisitor.visited_at >= month_start
        )
    )
    unique_month = result.scalar() or 0

    # Total members (users wa kanisa)
    result = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    total_members = result.scalar() or 0

    return VisitorStatsResponse(
        total_visitors=total_visitors,
        total_views=total_views,
        unique_visitors_today=unique_today,
        unique_visitors_week=unique_week,
        unique_visitors_month=unique_month,
        total_members=total_members,
    )


# ============================================
# 📊 GET /visitors/stats/admin — Takwimu za admin
# ✅ Auth — kwa viongozi
# ============================================
@router.get("/stats/admin")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Takwimu za kina kwa admin panel"""
    role_value = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)

    allowed = [
        "mchungaji_kiongozi", "mchungaji_msaidizi", "mwinjilist",
        "mwenyekiti", "mwenyekiti_msaidizi", "katibu_mkuu",
        "mzee_kanisa", "mhasibu", "it", "super_admin",
    ]
    if role_value not in allowed:
        raise HTTPException(403, "Huna ruhusa ya kuona takwimu hizi")

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Total visitors (unique sessions)
    result = await db.execute(
        select(func.count(distinct(PageVisitor.session_id)))
    )
    total_visitors = result.scalar() or 0

    # Total views
    result = await db.execute(select(func.count(PageVisitor.id)))
    total_views = result.scalar() or 0

    # Unique today
    result = await db.execute(
        select(func.count(distinct(PageVisitor.session_id))).where(
            PageVisitor.visited_at >= today_start
        )
    )
    unique_today = result.scalar() or 0

    # Top pages
    result = await db.execute(
        select(
            PageVisitor.page,
            func.count(PageVisitor.id).label("views"),
        )
        .group_by(PageVisitor.page)
        .order_by(func.count(PageVisitor.id).desc())
        .limit(10)
    )
    top_pages = [
        {"page": row[0], "views": row[1]}
        for row in result.all()
    ]

    # Recent visitors
    result = await db.execute(
        select(PageVisitor)
        .order_by(PageVisitor.visited_at.desc())
        .limit(20)
    )
    recent = result.scalars().all()

    return {
        "total_visitors": total_visitors,
        "total_views": total_views,
        "unique_today": unique_today,
        "top_pages": top_pages,
        "recent": [
            {
                "id": v.id,
                "page": v.page,
                "path": v.path,
                "ip_address": v.ip_address,
                "user_agent": v.user_agent,
                "is_unique": v.is_unique,
                "visited_at": v.visited_at.isoformat() if v.visited_at else None,
            }
            for v in recent
        ],
    }