# backend/app/schemas/offering.py

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


# ============================================
# 🏗️ BASE — Pokea string (case-insensitive)
# ============================================
class OfferingBase(BaseModel):
    service_type: str
    service_date: datetime
    offering_type: str
    amount: float = Field(gt=0, description="Kiasi lazima kiwe zaidi ya 0")
    description: Optional[str] = None
    team_name: str = Field(min_length=1)
    team_members: List[str] = Field(min_length=1)
    team_leader: str = Field(min_length=1)


# ============================================
# ➕ CREATE — Pokea string yoyote
# ============================================
class OfferingCreate(OfferingBase):
    pass


# ============================================
# ✏️ UPDATE — Kwa approve
# ============================================
class OfferingUpdate(BaseModel):
    status: Optional[str] = None
    bank_reference: Optional[str] = None
    deposited_at: Optional[datetime] = None


# ============================================
# 📤 RESPONSE — Rudisha kwa frontend
# ============================================
class OfferingResponse(OfferingBase):
    id: str
    status: str
    number_of_members: int = 0

    # ============================================
    # ✅ HESABU — Jumla ya matumizi na salio
    # ============================================
    total_expenses: float = 0
    balance: float = 0

    recorded_by: Optional[str] = None
    recorded_by_name: Optional[str] = None
    approved_by: Optional[str] = None
    approved_by_name: Optional[str] = None
    approved_at: Optional[datetime] = None
    bank_reference: Optional[str] = None
    deposited_at: Optional[datetime] = None
    deposited_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    # ============================================
    # ✅ VALIDATOR: Enum → .value (Kiswahili)
    # ============================================
    @field_validator("service_type", "offering_type", "status", mode="before")
    @classmethod
    def enum_to_value(cls, v):
        """Kama ni enum, rudisha .value — sio .name"""
        if hasattr(v, "value"):
            return v.value
        return v

    class Config:
        from_attributes = True

    # ============================================
    # ✅ FROM_ORM: Tumia actual_number_of_members
    # ============================================
    @classmethod
    def from_orm(cls, obj):
        """
        Custom from_orm: inatumia `actual_number_of_members`
        (property ya model) badala ya `number_of_members` column.

        Hii inarekebisha tatizo la sadaka za zamani ambazo
        number_of_members ilikuwa 0 (default), lakini
        team_members ilikuwa na wanachama halisi.

        ✅ `total_expenses` na `balance` zinawekwa 0 hapa —
        endpoint ndio inazijaza baada ya kuhesabu.
        """
        data = {
            "id": obj.id,
            "service_date": obj.service_date,
            "service_type": obj.service_type,
            "offering_type": obj.offering_type,
            "amount": obj.amount,
            "description": obj.description,
            "team_name": obj.team_name,
            "team_members": obj.team_members or [],
            "team_leader": obj.team_leader,
            # ✅ Tumia property — sio column
            "number_of_members": obj.actual_number_of_members,
            # ✅ Default 0 — endpoint itajaza
            "total_expenses": 0.0,
            "balance": float(obj.amount) if obj.amount else 0.0,
            "recorded_by": obj.recorded_by,
            "recorded_by_name": obj.recorded_by_name,
            "approved_by": obj.approved_by,
            "approved_by_name": obj.approved_by_name,
            "approved_at": obj.approved_at,
            "bank_reference": obj.bank_reference,
            "deposited_at": obj.deposited_at,
            "deposited_by": obj.deposited_by,
            "status": obj.status,
            "created_at": obj.created_at,
            "updated_at": obj.updated_at,
        }
        return cls(**data)