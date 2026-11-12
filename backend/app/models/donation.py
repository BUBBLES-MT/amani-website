# backend/app/models/donation.py
from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class DonationMethod(str, enum.Enum):
    MPESA = "mpesa"
    TIGO_PESA = "tigo_pesa"
    BANK = "bank"
    CASH = "cash"
    OTHER = "other"

class DonationStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Donation(Base):
    __tablename__ = "donations"
    
    id = Column(String, primary_key=True, index=True)
    donor_name = Column(String(100), nullable=False)
    donor_email = Column(String(100))
    donor_phone = Column(String(20))
    amount = Column(Float, nullable=False)
    
    # Method
    method = Column(Enum(DonationMethod), nullable=False)
    method_details = Column(Text)  # Transaction details
    
    # Purpose
    purpose = Column(String(200))
    message = Column(Text)
    
    # Anonymous
    is_anonymous = Column(Boolean, default=False)
    
    # Reference
    reference = Column(String(100), unique=True)
    receipt_url = Column(String(500))
    
    # Status
    status = Column(Enum(DonationStatus), default=DonationStatus.PENDING)
    
    # Timestamps
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())