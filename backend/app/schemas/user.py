# backend/app/schemas/user.py

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re


# ============================================
# BASE SCHEMAS
# ============================================
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    role: str = Field(default="muumini")  # ✅ muumini (sio muhumini)
    church_name: Optional[str] = Field(None, max_length=100)
    church_location: Optional[str] = Field(None, max_length=200)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == "":
            return v
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not cleaned.isdigit():
            raise ValueError("Namba ya simu lazima iwe na tarakimu tu")
        if len(cleaned) < 10 or len(cleaned) > 15:
            raise ValueError("Namba ya simu iwe kati ya tarakimu 10 na 15")
        return v


# ============================================
# CREATE SCHEMA (admin — super_admin)
# ============================================
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Nenosiri liwe na angalau herufi 8")
        if not any(c.isupper() for c in v):
            raise ValueError("Nenosiri liwe na herufi kubwa angalau moja")
        if not any(c.islower() for c in v):
            raise ValueError("Nenosiri liwe na herufi ndogo angalau moja")
        if not any(c.isdigit() for c in v):
            raise ValueError("Nenosiri liwe na namba angalau moja")
        return v


# ============================================
# ✅ PUBLIC REGISTER (self-registration)
# ❌ Hauruhusiwi: mchungaji_kiongozi, msaidizi, mwinjilist, super_admin
# ============================================
class UserRegister(UserBase):
    password: str = Field(..., min_length=8)

    @field_validator("role")
    @classmethod
    def validate_public_role(cls, v):
        allowed_roles = [
            "muumini",
            "mzee_kanisa",
            "mhasibu",
            "katibu_mkuu",
            "mwenyekiti",
            "mwenyekiti_msaidizi",
            "it",
        ]
        if v not in allowed_roles:
            raise ValueError(
                f"Role hii hairuhusiwi kujisajili. Tumia mojawapo ya haya: {', '.join(allowed_roles)}"
            )
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Nenosiri liwe na angalau herufi 8")
        if not any(c.isupper() for c in v):
            raise ValueError("Nenosiri liwe na herufi kubwa angalau moja")
        if not any(c.islower() for c in v):
            raise ValueError("Nenosiri liwe na herufi ndogo angalau moja")
        if not any(c.isdigit() for c in v):
            raise ValueError("Nenosiri liwe na namba angalau moja")
        return v


# ============================================
# UPDATE SCHEMA
# ============================================
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    church_name: Optional[str] = None
    church_location: Optional[str] = None


# ============================================
# ✅ APPROVAL REQUEST
# ============================================
class ApprovalRequest(BaseModel):
    rejection_reason: Optional[str] = Field(None, max_length=500)


# ============================================
# LOGIN
# ============================================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


# ============================================
# RESPONSE SCHEMA
# ============================================
class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    church_name: Optional[str] = None
    church_location: Optional[str] = None
    is_active: bool

    # ✅ Approval fields
    is_approved: bool = False
    approval_status: str = "pending"
    approved_by_name: Optional[str] = None
    approved_at: Optional[datetime] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @field_validator("role", "approval_status", mode="before")
    @classmethod
    def enum_to_value(cls, v):
        if hasattr(v, "value"):
            return v.value
        return v

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            name=obj.name,
            email=obj.email,
            phone=obj.phone,
            role=obj.role,
            church_name=obj.church_name,
            church_location=obj.church_location,
            is_active=obj.is_active,
            # ✅ Approval fields (na fallback kama hazipo — kwa users wa zamani)
            is_approved=getattr(obj, "is_approved", True),
            approval_status=getattr(obj, "approval_status", "approved"),
            approved_by_name=getattr(obj, "approved_by_name", None),
            approved_at=getattr(obj, "approved_at", None),
            created_at=obj.created_at,
            updated_at=getattr(obj, "updated_at", None),
        )


# ============================================
# TOKEN
# ============================================
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


Token.model_rebuild()