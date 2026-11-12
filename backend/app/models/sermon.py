# backend/app/models/sermon.py

from sqlalchemy import (
    Column, String, Integer, DateTime, Enum, ForeignKey, Text
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# ============================================
# 📊 SERMON STATUS
# ============================================
class SermonStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# ============================================
# 🎯 HELPER: values_callable
# ============================================
def _enum_values(enum_cls):
    return [e.value for e in enum_cls]


# ============================================
# 📖 SERMON MODEL
# ============================================
class Sermon(Base):
    __tablename__ = "sermons"

    id = Column(String, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    preacher = Column(String(100), nullable=False)
    description = Column(Text)
    scripture = Column(Text)  # Bible verses
    content = Column(Text)  # Full sermon text

    # Media
    audio_url = Column(String(500))
    video_url = Column(String(500))
    pdf_url = Column(String(500))
    thumbnail_url = Column(String(500))

    # Metadata
    duration = Column(Integer)  # In seconds
    views = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    likes = Column(Integer, default=0)

    # ✅ Status — tumia .value ("draft") sio .name ("DRAFT")
    status = Column(
        Enum(SermonStatus, values_callable=_enum_values),
        default=SermonStatus.DRAFT,
    )

    # ✅ Tarehe — column halisi kwenye database ni `date`
    date = Column(DateTime(timezone=True))

    # Relationships
    created_by = Column(String, ForeignKey("users.id"))
    created_by_name = Column(String(100))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    creator = relationship("User", foreign_keys=[created_by])