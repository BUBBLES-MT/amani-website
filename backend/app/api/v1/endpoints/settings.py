# backend/app/api/v1/endpoints/settings.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict

from app.core.database import get_db
from app.core.dependencies import get_current_super_admin
from app.models.user import User
from app.models.setting import Setting
from app.schemas.setting import (
    SettingResponse,
    SettingUpdate,
    SettingSingleUpdate,
    SettingsGroupedResponse,
)

router = APIRouter()


# ============================================
# 🎯 DEFAULT SETTINGS — zinaundwa kama hazipo
# ============================================
DEFAULT_SETTINGS = {
    # 🏛️ Church info
    "church_name": {
        "value": "Amani Luthelani Church",
        "description": "Jina la kanisa",
        "category": "church",
    },
    "church_location": {
        "value": "Moshi, Kilimanjaro, Tanzania",
        "description": "Mahali kanisa lilipo",
        "category": "church",
    },
    "church_motto": {
        "value": "Kwa neema na amani",
        "description": "Motto ya kanisa",
        "category": "church",
    },
    "church_logo": {
        "value": "",
        "description": "Logo ya kanisa (URL)",
        "category": "church",
    },

    # 📞 Contact
    "contact_phone": {
        "value": "+255 712 345 678",
        "description": "Namba ya simu",
        "category": "contact",
    },
    "contact_email": {
        "value": "info@amanichurch.com",
        "description": "Barua pepe",
        "category": "contact",
    },
    "contact_whatsapp": {
        "value": "+255 712 345 678",
        "description": "WhatsApp",
        "category": "contact",
    },
    "contact_address": {
        "value": "Moshi, Kilimanjaro",
        "description": "Anwani kamili",
        "category": "contact",
    },

    # 🌐 Social
    "social_facebook": {
        "value": "",
        "description": "Facebook page",
        "category": "social",
    },
    "social_instagram": {
        "value": "",
        "description": "Instagram",
        "category": "social",
    },
    "social_youtube": {
        "value": "",
        "description": "YouTube channel",
        "category": "social",
    },
    "social_twitter": {
        "value": "",
        "description": "Twitter / X",
        "category": "social",
    },

    # ⚙️ System
    "service_time_sunday": {
        "value": "8:00 AM - 12:00 PM",
        "description": "Saa za ibada ya Jumapili",
        "category": "general",
    },
    "service_time_wednesday": {
        "value": "5:00 PM - 7:00 PM",
        "description": "Saa za ibada ya Jumatano",
        "category": "general",
    },
    "announcement": {
        "value": "",
        "description": "Tangazo la kanisa",
        "category": "general",
    },
}


async def _ensure_defaults(db: AsyncSession):
    """Hakikisha settings zote za default zipo kwenye database."""
    result = await db.execute(select(Setting))
    existing_keys = {s.key for s in result.scalars().all()}

    for key, meta in DEFAULT_SETTINGS.items():
        if key not in existing_keys:
            db.add(Setting(
                key=key,
                value=meta["value"],
                description=meta["description"],
                category=meta["category"],
            ))

    await db.commit()


# ============================================
# 🌍 PUBLIC — GET /settings/public
# ============================================
@router.get("/public", response_model=Dict[str, str])
async def get_public_settings(db: AsyncSession = Depends(get_db)):
    """Public settings (bila auth) — kwa frontend ya public"""
    await _ensure_defaults(db)

    result = await db.execute(select(Setting))
    items = result.scalars().all()

    # ✅ Ruhusu tu settings za public
    public_categories = {"church", "contact", "social", "general"}
    return {
        s.key: s.value or ""
        for s in items
        if (s.category or "general") in public_categories
    }


# ============================================
# 📋 GET /settings/ — Orodha (super_admin)
# ============================================
@router.get("/", response_model=List[SettingResponse])
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Get all settings (super_admin only)"""
    await _ensure_defaults(db)

    result = await db.execute(select(Setting).order_by(Setting.category, Setting.key))
    items = result.scalars().all()
    return [SettingResponse.from_orm(s) for s in items]


# ============================================
# 📊 GET /settings/grouped — Grouped by category
# ============================================
@router.get("/grouped", response_model=SettingsGroupedResponse)
async def get_grouped_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Get settings grouped by category (super_admin)"""
    await _ensure_defaults(db)

    result = await db.execute(select(Setting))
    items = result.scalars().all()

    grouped: Dict[str, Dict[str, str]] = {
        "general": {},
        "church": {},
        "contact": {},
        "social": {},
        "system": {},
    }

    for s in items:
        cat = (s.category or "general").lower()
        if cat not in grouped:
            grouped[cat] = {}
        grouped[cat][s.key] = s.value or ""

    return SettingsGroupedResponse(**grouped)


# ============================================
# ✏️ PUT /settings/ — Bulk update (super_admin)
# ============================================
@router.put("/", response_model=Dict[str, int])
async def update_settings_bulk(
    data: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    """Update multiple settings at once (super_admin)"""
    await _ensure_defaults(db)

    updated = 0
    for key, value in data.values.items():
        result = await db.execute(select(Setting).where(Setting.key == key))
        setting = result.scalar_one_or_none()

        if setting:
            setting.value = str(value)
            setting.updated_by = current_user.id
            setting.updated_by_name = current_user.name
            updated += 1
        else:
            db.add(Setting(
                key=key,
                value=str(value),
                category="general",
                updated_by=current_user.id,
                updated_by_name=current_user.name,
            ))
            updated += 1

    await db.commit()
    return {"updated": updated}


# ============================================
# 🔍 GET /settings/{key} — Moja
# ============================================
@router.get("/{key}", response_model=SettingResponse)
async def get_setting(
    key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    await _ensure_defaults(db)

    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()

    if not setting:
        raise HTTPException(404, f"Setting '{key}' haipatikani")

    return SettingResponse.from_orm(setting)


# ============================================
# ✏️ PUT /settings/{key} — Badilisha moja
# ============================================
@router.put("/{key}", response_model=SettingResponse)
async def update_setting(
    key: str,
    data: SettingSingleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_super_admin),
):
    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()

    if setting:
        setting.value = data.value
        if data.description:
            setting.description = data.description
        if data.category:
            setting.category = data.category
        setting.updated_by = current_user.id
        setting.updated_by_name = current_user.name
    else:
        setting = Setting(
            key=key,
            value=data.value,
            description=data.description or "",
            category=data.category or "general",
            updated_by=current_user.id,
            updated_by_name=current_user.name,
        )
        db.add(setting)

    await db.commit()
    await db.refresh(setting)
    return SettingResponse.from_orm(setting)