# backend/app/models/setting.py

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Setting(Base):
    __tablename__ = "settings"

    # ✅ Key-value store — kila setting ina key ya kipekee
    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text)
    description = Column(String(500))
    category = Column(String(50), default="general")  # general, church, contact, social, system

    updated_by = Column(String, ForeignKey("users.id"))
    updated_by_name = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    updater = relationship("User", foreign_keys=[updated_by])