# backend/app/api/v1/endpoints/events.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.event import Event, EventStatus, EventCategory
from app.schemas.event import EventCreate, EventResponse, EventUpdate

router = APIRouter()


# ============================================
# 🎯 HELPER: Case-insensitive enum matcher
# ============================================
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
    raise HTTPException(422, f"{field_name} si sahihi. Tumia: {valid}")


# ============================================
# 🌍 PUBLIC — GET /events/public
# ✅ Sasa inarudisha UPCOMING, ONGOING, na COMPLETED
# Kwa sababu matukio yaliyopita (completed) yana video/audio/pdf
# ============================================
@router.get("/public", response_model=List[EventResponse])
async def get_public_events(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    include_completed: bool = Query(True),
):
    """
    Public events (no auth required).
    - Kama include_completed=True (default): inarudisha UPCOMING, ONGOING, COMPLETED
    - Kama include_completed=False: inarudisha UPCOMING, ONGOING tu
    """
    if include_completed:
        status_filter = [
            EventStatus.UPCOMING,
            EventStatus.ONGOING,
            EventStatus.COMPLETED,
        ]
    else:
        status_filter = [EventStatus.UPCOMING, EventStatus.ONGOING]

    query = (
        select(Event)
        .where(Event.status.in_(status_filter))
        .order_by(Event.start_date.desc())   # ✅ Mpya zaidi kwanza (ili video za hivi karibuni zionekane)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    events = result.scalars().all()
    return [EventResponse.from_orm(e) for e in events]


# ============================================
# 📋 GET /events/ — Orodha (auth)
# ============================================
@router.get("/", response_model=List[EventResponse])
async def get_events(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    query = (
        select(Event)
        .order_by(Event.start_date.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    events = result.scalars().all()
    return [EventResponse.from_orm(e) for e in events]


# ============================================
# ➕ POST /events/ — Unda (auth)
# ============================================
@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category_enum = _match_enum(
        EventCategory, event_data.category, "category"
    )
    status_enum = _match_enum(
        EventStatus, event_data.status or "upcoming", "status"
    )

    data = event_data.dict()
    data.pop("category", None)
    data.pop("status", None)

    event = Event(
        id=str(uuid.uuid4()),
        **data,
        category=category_enum,
        status=status_enum,
        created_by=current_user.id,
        created_by_name=current_user.name,
    )

    db.add(event)
    await db.commit()
    await db.refresh(event)
    return EventResponse.from_orm(event)


# ============================================
# 🔍 GET /events/{id} — Moja (auth)
# ============================================
@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(404, "Tukio haipatikani")
    return EventResponse.from_orm(event)


# ============================================
# ✏️ PUT /events/{id} — Hariri (auth)
# ============================================
@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(404, "Tukio haipatikani")

    data = event_data.dict(exclude_unset=True)

    if "status" in data and data["status"]:
        data["status"] = _match_enum(EventStatus, data["status"], "status")
    if "category" in data and data["category"]:
        data["category"] = _match_enum(EventCategory, data["category"], "category")

    for key, value in data.items():
        if hasattr(event, key):
            setattr(event, key, value)

    await db.commit()
    await db.refresh(event)
    return EventResponse.from_orm(event)


# ============================================
# 🗑️ DELETE /events/{id} — Futa (auth)
# ============================================
@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(404, "Tukio haipatikani")

    await db.delete(event)
    await db.commit()
    return {"message": "Tukio limefutwa"}