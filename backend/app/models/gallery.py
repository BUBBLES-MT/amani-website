# backend/app/models/gallery.py

from sqlalchemy import (
    Column, String, Integer, DateTime, Enum, ForeignKey, Text, Boolean
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# ============================================
# 🖼️ GALLERY CATEGORY
# ============================================
class GalleryCategory(str, enum.Enum):
    IBADA = "Ibada"
    MATUKIO = "Matukio"
    VIKUNDI = "Vikundi"
    HUDUMA = "Huduma"
    NYINGINE = "Nyingine"


# ============================================
# 🎯 HELPER: values_callable
# ============================================
def _enum_values(enum_cls):
    return [e.value for e in enum_cls]


# ============================================
# 🖼️ GALLERY MODEL
# ============================================
class Gallery(Base):
    __tablename__ = "gallery"

    id = Column(String, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)

    # ✅ values_callable — tumia .value ("Ibada") sio .name ("IBADA")
    category = Column(
        Enum(GalleryCategory, values_callable=_enum_values),
        default=GalleryCategory.NYINGINE,
    )

    # Image
    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))

    # Metadata
    width = Column(Integer)
    height = Column(Integer)
    size = Column(Integer)

    # Tags
    tags = Column(Text)

    # Views
    views = Column(Integer, default=0)
    downloads = Column(Integer, default=0)

    # Status
    is_featured = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True)

    # Event
    event_id = Column(String, ForeignKey("events.id"))

    # Relationships
    created_by = Column(String, ForeignKey("users.id"))
    created_by_name = Column(String(100))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    event = relationship("Event", foreign_keys=[event_id])