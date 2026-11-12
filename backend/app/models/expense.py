# backend/app/models/expense.py

from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# ============================================
# 🏷️ EXPENSE CATEGORY — Aina ya Matumizi
# ============================================
class ExpenseCategory(str, enum.Enum):
    UNUNUZI = "Ununuzi"
    MATENGENEZO = "Matengenezo"
    MISHAHARA = "Mishahara"
    KARATASI = "Karatasi"
    USAFIRI = "Usafiri"
    NYINGINE = "Nyingine"


# ============================================
# 📊 EXPENSE STATUS — Hali ya Matumizi
# ============================================
class ExpenseStatus(str, enum.Enum):
    IMEOMBWA = "Imeombwa"
    IMEIDHINISHWA = "Imeidhinishwa"
    IMETOLEWA = "Imetolewa"


# ============================================
# 🎯 HELPER: values_callable
# ============================================
def _enum_values(enum_cls):
    return [e.value for e in enum_cls]


# ============================================
# 💸 EXPENSE MODEL
# ============================================
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    category = Column(
        Enum(ExpenseCategory, values_callable=_enum_values),
        nullable=False,
    )
    amount = Column(Float, nullable=False)

    # Must be linked to an offering
    offering_id = Column(String, ForeignKey("offerings.id"), nullable=False)

    # Approval tracking
    requested_by = Column(String, ForeignKey("users.id"))
    requested_by_name = Column(String(100))
    approved_by = Column(String, ForeignKey("users.id"))
    approved_by_name = Column(String(100))
    approved_at = Column(DateTime(timezone=True))

    # Withdrawal details
    withdrawn_by = Column(String, ForeignKey("users.id"))
    withdrawn_by_name = Column(String(100))
    withdrawal_reference = Column(String(100))
    withdrawn_at = Column(DateTime(timezone=True))

    # Proof
    receipt_image = Column(String(255))
    receipt_number = Column(String(100))

    # Status
    status = Column(
        Enum(ExpenseStatus, values_callable=_enum_values),
        default=ExpenseStatus.IMEOMBWA,
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    offering = relationship("Offering")
    requester = relationship("User", foreign_keys=[requested_by])
    approver = relationship("User", foreign_keys=[approved_by])
    withdrawer = relationship("User", foreign_keys=[withdrawn_by])