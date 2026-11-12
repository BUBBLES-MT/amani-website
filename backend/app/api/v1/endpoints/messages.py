# backend/app/api/v1/endpoints/messages.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.message import Message, MessageStatus, MessageCategory
from app.schemas.message import MessageCreate, MessageUpdate, MessageResponse

router = APIRouter()


def _match_enum(enum_class, value, field_name: str):
    if isinstance(value, enum_class):
        return value
    if value is None or str(value).strip() == "":
        return list(enum_class)[-1]

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
# 🌍 PUBLIC — POST /messages/ (contact form)
# ============================================
@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Send a message (public — contact form)"""
    category_enum = _match_enum(
        MessageCategory, data.category or "Nyingine", "category"
    )

    payload = data.dict()
    payload.pop("category", None)

    msg = Message(
        id=str(uuid.uuid4()),
        **payload,
        category=category_enum,
        status=MessageStatus.NEW,
    )

    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return MessageResponse.from_orm(msg)


# ============================================
# 📋 GET /messages/ — Orodha (auth)
# ============================================
@router.get("/", response_model=List[MessageResponse])
async def get_messages(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    status_filter: str = Query(None, alias="status"),
    category: str = Query(None),
):
    query = select(Message).order_by(Message.created_at.desc())

    if status_filter:
        try:
            s_enum = _match_enum(MessageStatus, status_filter, "status")
            query = query.where(Message.status == s_enum)
        except HTTPException:
            pass

    if category:
        try:
            c_enum = _match_enum(MessageCategory, category, "category")
            query = query.where(Message.category == c_enum)
        except HTTPException:
            pass

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    return [MessageResponse.from_orm(m) for m in items]


# ============================================
# 🔍 GET /messages/{id} — Moja (auth)
# ============================================
@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(404, "Ujumbe haipatikani")

    # ✅ Mark as read automatically
    if msg.status == MessageStatus.NEW:
        msg.status = MessageStatus.READ
        await db.commit()
        await db.refresh(msg)

    return MessageResponse.from_orm(msg)


# ============================================
# ✏️ PUT /messages/{id} — Jibu / Badilisha (auth)
# ============================================
@router.put("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: str,
    data: MessageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(404, "Ujumbe haipatikani")

    update_dict = data.dict(exclude_unset=True)

    # ✅ Reply
    if update_dict.get("reply_text"):
        msg.reply_text = update_dict["reply_text"]
        msg.replied_at = datetime.utcnow()
        msg.replied_by = current_user.id
        msg.replied_by_name = current_user.name
        msg.status = MessageStatus.REPLIED
        update_dict.pop("reply_text", None)

    # ✅ Status
    if "status" in update_dict and update_dict["status"]:
        update_dict["status"] = _match_enum(MessageStatus, update_dict["status"], "status")

    # ✅ Category
    if "category" in update_dict and update_dict["category"]:
        update_dict["category"] = _match_enum(MessageCategory, update_dict["category"], "category")

    for key, value in update_dict.items():
        if hasattr(msg, key):
            setattr(msg, key, value)

    await db.commit()
    await db.refresh(msg)
    return MessageResponse.from_orm(msg)


# ============================================
# 🗑️ DELETE /messages/{id} — Futa (auth)
# ============================================
@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(404, "Ujumbe haipatikani")

    await db.delete(msg)
    await db.commit()
    return {"message": "Ujumbe umefutwa"}