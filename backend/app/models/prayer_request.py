# backend/app/models/prayer_request.py
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class PrayerStatus(str, enum.Enum):
    PENDING = "pending"
    PRAYED = "prayed"
    ANSWERED = "answered"

class PrayerRequest(Base):
    __tablename__ = "prayer_requests"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    request = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False)
    
    # Prayer count
    pray_count = Column(Integer, default=0)
    
    # Status
    status = Column(Enum(PrayerStatus), default=PrayerStatus.PENDING)
    
    # Admin response
    admin_response = Column(Text)
    responded_at = Column(DateTime(timezone=True))
    
    # Relationships
    responded_by = Column(String, ForeignKey("users.id"))
    responded_by_name = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    responder = relationship("User", foreign_keys=[responded_by])