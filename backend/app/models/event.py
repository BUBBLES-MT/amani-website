# backend/app/models/event.py

from sqlalchemy import (
    Column, String, Integer, DateTime, Enum, ForeignKey, Text, Boolean
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# ============================================
# 📅 EVENT CATEGORY
# ============================================
class EventCategory(str, enum.Enum):
    IBADA = "Ibada"
    VIJANA = "Vijana"
    WANAWAKE = "Wanawake"
    MAFUNZO = "Mafunzo"
    HUDUMA = "Huduma"
    NYINGINE = "Nyingine"


# ============================================
# 📅 EVENT STATUS
# ============================================
class EventStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ============================================
# 🎯 HELPER: values_callable
# ============================================
def _enum_values(enum_cls):
    return [e.value for e in enum_cls]


# ============================================
# 📅 EVENT MODEL
# ============================================
class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)

    # ✅ values_callable — tumia .value ("Ibada") sio .name ("IBADA")
    category = Column(
        Enum(EventCategory, values_callable=_enum_values),
        nullable=False,
    )

    # Date & Time
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    start_time = Column(String(20))
    end_time = Column(String(20))

    # Location
    venue = Column(String(200))
    location = Column(String(200))
    is_online = Column(Boolean, default=False)
    meeting_link = Column(String(500))

    # Details
    organizer = Column(String(100))
    organizer_contact = Column(String(20))
    organizer_email = Column(String(100))

    # Capacity
    max_attendees = Column(Integer)
    current_attendees = Column(Integer, default=0)

    # ✅ Media
    image_url = Column(String(500))
    video_url = Column(String(500))    # ✅ Mpya — video ya tukio
    audio_url = Column(String(500))    # ✅ Mpya — audio ya tukio
    pdf_url = Column(String(500))      # ✅ Mpya — PDF ya tukio

    # ✅ values_callable — tumia .value ("upcoming") sio .name ("UPCOMING")
    status = Column(
        Enum(EventStatus, values_callable=_enum_values),
        default=EventStatus.UPCOMING,
    )

    # Relationships
    created_by = Column(String, ForeignKey("users.id"))
    created_by_name = Column(String(100))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    creator = relationship("User", foreign_keys=[created_by])