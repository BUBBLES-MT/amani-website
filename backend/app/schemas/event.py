# backend/app/schemas/event.py

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


# ============================================
# 📅 EVENT BASE
# ============================================
class EventBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    category: str
    start_date: datetime
    end_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    location: Optional[str] = None
    is_online: bool = False
    meeting_link: Optional[str] = None
    organizer: Optional[str] = None
    organizer_contact: Optional[str] = None
    organizer_email: Optional[str] = None
    max_attendees: Optional[int] = None
    image_url: Optional[str] = None
    # ✅ Media mpya
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    pdf_url: Optional[str] = None


# ============================================
# ➕ EVENT CREATE
# ============================================
class EventCreate(EventBase):
    status: Optional[str] = "upcoming"


# ============================================
# ✏️ EVENT UPDATE
# ============================================
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    location: Optional[str] = None
    is_online: Optional[bool] = None
    meeting_link: Optional[str] = None
    organizer: Optional[str] = None
    organizer_contact: Optional[str] = None
    organizer_email: Optional[str] = None
    max_attendees: Optional[int] = None
    image_url: Optional[str] = None
    # ✅ Media mpya
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    pdf_url: Optional[str] = None
    status: Optional[str] = None


# ============================================
# 📤 EVENT RESPONSE
# ============================================
class EventResponse(EventBase):
    id: str
    status: str = "upcoming"
    current_attendees: int = 0
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator("category", "status", mode="before")
    @classmethod
    def enum_to_value(cls, v):
        if hasattr(v, "value"):
            return v.value
        return v

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            title=obj.title,
            description=obj.description,
            category=obj.category,
            start_date=obj.start_date,
            end_date=obj.end_date,
            start_time=obj.start_time,
            end_time=obj.end_time,
            venue=obj.venue,
            location=obj.location,
            is_online=obj.is_online or False,
            meeting_link=obj.meeting_link,
            organizer=obj.organizer,
            organizer_contact=obj.organizer_contact,
            organizer_email=obj.organizer_email,
            max_attendees=obj.max_attendees,
            current_attendees=obj.current_attendees or 0,
            image_url=obj.image_url,
            # ✅ Media mpya
            video_url=obj.video_url,
            audio_url=obj.audio_url,
            pdf_url=obj.pdf_url,
            status=obj.status,
            created_by=obj.created_by,
            created_by_name=obj.created_by_name,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )