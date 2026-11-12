# backend/app/schemas/message.py

from pydantic import BaseModel, Field, field_validator, EmailStr
from datetime import datetime
from typing import Optional


# ============================================
# 📩 MESSAGE BASE
# ============================================
class MessageBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    category: Optional[str] = "Nyingine"
    message: str = Field(min_length=1)


# ============================================
# ➕ MESSAGE CREATE (public — contact form)
# ============================================
class MessageCreate(MessageBase):
    pass


# ============================================
# ✏️ MESSAGE UPDATE (auth — reply/status)
# ============================================
class MessageUpdate(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    reply_text: Optional[str] = None
    is_archived: Optional[bool] = None


# ============================================
# 📤 MESSAGE RESPONSE
# ============================================
class MessageResponse(MessageBase):
    id: str
    status: str = "new"
    reply_text: Optional[str] = None
    replied_at: Optional[datetime] = None
    replied_by: Optional[str] = None
    replied_by_name: Optional[str] = None
    is_archived: bool = False
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
        return cls(
            id=obj.id,
            name=obj.name,
            email=obj.email,
            phone=obj.phone,
            subject=obj.subject,
            category=obj.category,
            message=obj.message,
            status=obj.status,
            reply_text=obj.reply_text,
            replied_at=obj.replied_at,
            replied_by=obj.replied_by,
            replied_by_name=obj.replied_by_name,
            is_archived=obj.is_archived or False,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )