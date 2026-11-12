# backend/app/schemas/expense.py

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# ============================================
# 🏗️ BASE
# ============================================
class ExpenseBase(BaseModel):
    description: str = Field(min_length=1)
    category: str
    amount: float = Field(gt=0)
    offering_id: str
    receipt_number: Optional[str] = None


# ============================================
# ➕ CREATE
# ============================================
class ExpenseCreate(ExpenseBase):
    pass


# ============================================
# ✏️ UPDATE
# ============================================
class ExpenseUpdate(BaseModel):
    status: Optional[str] = None
    withdrawal_reference: Optional[str] = None


# ============================================
# 📤 RESPONSE
# ============================================
class ExpenseResponse(ExpenseBase):
    id: str
    status: str
    requested_by: Optional[str] = None
    requested_by_name: Optional[str] = None
    approved_by: Optional[str] = None
    approved_by_name: Optional[str] = None
    approved_at: Optional[datetime] = None
    withdrawal_reference: Optional[str] = None
    withdrawn_by_name: Optional[str] = None
    withdrawn_at: Optional[datetime] = None
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
        data = {
            "id": obj.id,
            "description": obj.description,
            "category": obj.category,
            "amount": obj.amount,
            "offering_id": obj.offering_id,
            "receipt_number": obj.receipt_number,
            "status": obj.status,
            "requested_by": obj.requested_by,
            "requested_by_name": obj.requested_by_name,
            "approved_by": obj.approved_by,
            "approved_by_name": obj.approved_by_name,
            "approved_at": obj.approved_at,
            "withdrawal_reference": obj.withdrawal_reference,
            "withdrawn_by_name": obj.withdrawn_by_name,
            "withdrawn_at": obj.withdrawn_at,
            "created_at": obj.created_at,
            "updated_at": obj.updated_at,
        }
        return cls(**data)