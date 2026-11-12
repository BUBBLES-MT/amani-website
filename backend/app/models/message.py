# backend/app/models/message.py

from sqlalchemy import (
    Column, String, Integer, DateTime, Enum, ForeignKey, Text, Boolean
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# ============================================
# 📩 MESSAGE STATUS
# ============================================
class MessageStatus(str, enum.Enum):
    NEW = "new"
    READ = "read"
    REPLIED = "replied"
    ARCHIVED = "archived"


# ============================================
# 📩 MESSAGE CATEGORY
# ============================================
class MessageCategory(str, enum.Enum):
    SWALI = "Swali"
    MAOMBI = "Maombi"
    USHAURI = "Ushauri"
    MALALAMIKO = "Malalamiko"
    PONGEZI = "Pongezi"
    NYINGINE = "Nyingine"


# ============================================
# 🎯 HELPER: values_callable
# ============================================
def _enum_values(enum_cls):
    return [e.value for e in enum_cls]


# ============================================
# 📩 MESSAGE MODEL
# ============================================
class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(20))
    subject = Column(String(200))

    category = Column(
        Enum(MessageCategory, values_callable=_enum_values),
        default=MessageCategory.NYINGINE,
    )

    message = Column(Text, nullable=False)

    # Status
    status = Column(
        Enum(MessageStatus, values_callable=_enum_values),
        default=MessageStatus.NEW,
    )

    # Reply
    reply_text = Column(Text)
    replied_at = Column(DateTime(timezone=True))
    replied_by = Column(String, ForeignKey("users.id"))
    replied_by_name = Column(String(100))

    # Archive
    is_archived = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    replier = relationship("User", foreign_keys=[replied_by])