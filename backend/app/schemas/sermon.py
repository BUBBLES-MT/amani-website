# backend/app/schemas/sermon.py

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


# ============================================
# 📖 SERMON BASE
# ============================================
class SermonBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    preacher: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    scripture: Optional[str] = None
    content: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None


# ============================================
# ➕ SERMON CREATE — Pokea `date`
# ============================================
class SermonCreate(SermonBase):
    date: datetime
    status: Optional[str] = "draft"


# ============================================
# ✏️ SERMON UPDATE
# ============================================
class SermonUpdate(BaseModel):
    title: Optional[str] = None
    preacher: Optional[str] = None
    description: Optional[str] = None
    scripture: Optional[str] = None
    content: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None
    date: Optional[datetime] = None
    status: Optional[str] = None


# ============================================
# 📤 SERMON RESPONSE — Tumia `date`
# ============================================
class SermonResponse(SermonBase):
    id: str
    date: datetime                          # ← frontend inatumia hii
    status: str = "draft"
    views: int = 0
    downloads: int = 0
    likes: int = 0
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    # ============================================
    # ✅ VALIDATOR: Enum → .value
    # ============================================
    @field_validator("status", mode="before")
    @classmethod
    def enum_to_value(cls, v):
        """Kama ni enum, rudisha .value — sio .name"""
        if hasattr(v, "value"):
            return v.value
        return v

    class Config:
        from_attributes = True

    # ============================================
    # ✅ FROM_ORM: Tumia `obj.date` (sio `preached_date`)
    # ============================================
    @classmethod
    def from_orm(cls, obj):
        """
        Custom from_orm: inasoma `date` (model column)
        na kuonyesha kama `date` (frontend).
        """
        data = {
            "id": obj.id,
            "title": obj.title,
            "preacher": obj.preacher,
            "description": obj.description,
            "scripture": obj.scripture,
            "content": obj.content,
            "audio_url": obj.audio_url,
            "video_url": obj.video_url,
            "pdf_url": obj.pdf_url,
            "thumbnail_url": obj.thumbnail_url,
            "duration": obj.duration,
            # ✅ Tumia `obj.date` — sio `obj.preached_date`
            "date": obj.date or obj.created_at,
            "status": obj.status,
            "views": obj.views or 0,
            "downloads": obj.downloads or 0,
            "likes": obj.likes or 0,
            "created_by": obj.created_by,
            "created_by_name": obj.created_by_name,
            "created_at": obj.created_at,
            "updated_at": obj.updated_at,
        }
        return cls(**data)