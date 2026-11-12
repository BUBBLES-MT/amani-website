# backend/app/schemas/setting.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List


# ============================================
# 📤 SETTING RESPONSE
# ============================================
class SettingResponse(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None
    category: str = "general"
    updated_by_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        return cls(
            key=obj.key,
            value=obj.value,
            description=obj.description,
            category=obj.category or "general",
            updated_by_name=obj.updated_by_name,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )


# ============================================
# ✏️ SETTING UPDATE — bulk (kama dict)
# ============================================
class SettingUpdate(BaseModel):
    values: Dict[str, str] = Field(..., description="Key-value pairs za settings")


# ============================================
# 🎯 SETTING SINGLE UPDATE
# ============================================
class SettingSingleUpdate(BaseModel):
    value: str
    description: Optional[str] = None
    category: Optional[str] = "general"


# ============================================
# 📊 SETTINGS GROUPED
# ============================================
class SettingsGroupedResponse(BaseModel):
    general: Dict[str, str] = {}
    church: Dict[str, str] = {}
    contact: Dict[str, str] = {}
    social: Dict[str, str] = {}
    system: Dict[str, str] = {}