# backend/app/api/v1/endpoints/sermons.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import uuid
import logging

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.sermon import Sermon, SermonStatus
from app.schemas.sermon import SermonCreate, SermonResponse, SermonUpdate

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# 🎯 ROLES ZINAZORUHUSIWA KUSIMAMIA MAHUBIRI
# ============================================
ALLOWED_ROLES = [
    "super_admin",
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "katibu_mkuu",
    "mzee_kanisa",
    "it",
]


def _check_sermon_permission(current_user: User):
    """Check kama user ana ruhusa ya kusimamia mahubiri."""
    role = (
        current_user.role.value
        if hasattr(current_user.role, "value")
        else str(current_user.role)
    )
    if role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Huna ruhusa ya kusimamia mahubiri. Roles: {', '.join(ALLOWED_ROLES)}",
        )
    return role


# ============================================
# 🎯 HELPER: Case-insensitive enum matcher
# ============================================
def _match_enum(enum_class, value, field_name: str):
    """Match value against enum — case-insensitive, inakubali underscores/spaces."""
    if isinstance(value, enum_class):
        return value
    if value is None or str(value).strip() == "":
        raise HTTPException(422, f"{field_name} haipaswi kuwa tupu")

    normalized = str(value).strip().lower().replace("_", " ").replace("-", " ")
    normalized = " ".join(normalized.split())

    for member in enum_class:
        mv = " ".join(
            str(member.value).strip().lower().replace("_", " ").replace("-", " ").split()
        )
        mn = " ".join(
            str(member.name).strip().lower().replace("_", " ").replace("-", " ").split()
        )
        if normalized == mv or normalized == mn:
            return member

    valid = ", ".join([f'"{m.value}"' for m in enum_class])
    raise HTTPException(422, f"{field_name} si sahihi. Tumia: {valid}")


# ============================================
# 🎯 HELPER: Pydantic v1/v2 compatible dict
# ============================================
def _to_dict(model, exclude_unset=False):
    """Pydantic v1 na v2 compatible."""
    try:
        return model.model_dump(exclude_unset=exclude_unset)  # v2
    except AttributeError:
        return model.dict(exclude_unset=exclude_unset)  # v1


# ============================================
# 🌍 PUBLIC — GET /sermons/public
# ============================================
@router.get("/public", response_model=List[SermonResponse])
async def get_public_sermons(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
):
    """Public sermons (published only, no auth)"""
    try:
        query = (
            select(Sermon)
            .where(Sermon.status == SermonStatus.PUBLISHED)
            .order_by(Sermon.date.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        sermons = result.scalars().all()
        return [SermonResponse.from_orm(s) for s in sermons]
    except Exception as e:
        logger.error(f"❌ Public sermons error: {e}")
        raise HTTPException(500, "Imeshindwa kupata mahubiri")


# ============================================
# 🌍 PUBLIC — GET /sermons/public/{id}
# ✅ Inaongeza views automatically
# ============================================
@router.get("/public/{sermon_id}", response_model=SermonResponse)
async def get_public_sermon(
    sermon_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get single published sermon (no auth, increments view)"""
    try:
        result = await db.execute(select(Sermon).where(Sermon.id == sermon_id))
        sermon = result.scalar_one_or_none()

        if not sermon or sermon.status != SermonStatus.PUBLISHED:
            raise HTTPException(404, "Mahubiri haipatikani")

        sermon.views = (sermon.views or 0) + 1
        await db.commit()
        await db.refresh(sermon)

        return SermonResponse.from_orm(sermon)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Public sermon detail error: {e}")
        raise HTTPException(500, "Imeshindwa kupata mahubiri")


# ============================================
# ✅ PUBLIC — POST /sermons/{id}/view
# ============================================
@router.post("/{sermon_id}/view")
async def increment_view(
    sermon_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Increment view count (public)"""
    try:
        result = await db.execute(select(Sermon).where(Sermon.id == sermon_id))
        sermon = result.scalar_one_or_none()

        if not sermon:
            raise HTTPException(404, "Mahubiri haipatikani")

        sermon.views = (sermon.views or 0) + 1
        await db.commit()
        await db.refresh(sermon)

        return {"views": sermon.views}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Increment view error: {e}")
        raise HTTPException(500, "Imeshindwa kuongeza views")


# ============================================
# ✅ PUBLIC — POST /sermons/{id}/download
# ============================================
@router.post("/{sermon_id}/download")
async def increment_download(
    sermon_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Increment download count (public)"""
    try:
        result = await db.execute(select(Sermon).where(Sermon.id == sermon_id))
        sermon = result.scalar_one_or_none()

        if not sermon:
            raise HTTPException(404, "Mahubiri haipatikani")

        sermon.downloads = (sermon.downloads or 0) + 1
        await db.commit()
        await db.refresh(sermon)

        return {"downloads": sermon.downloads}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Increment download error: {e}")
        raise HTTPException(500, "Imeshindwa kuongeza downloads")


# ============================================
# ✅ PUBLIC — POST /sermons/{id}/like
# ============================================
@router.post("/{sermon_id}/like")
async def increment_like(
    sermon_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Increment like count (public)"""
    try:
        result = await db.execute(select(Sermon).where(Sermon.id == sermon_id))
        sermon = result.scalar_one_or_none()

        if not sermon:
            raise HTTPException(404, "Mahubiri haipatikani")

        sermon.likes = (sermon.likes or 0) + 1
        await db.commit()
        await db.refresh(sermon)

        return {"likes": sermon.likes}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Increment like error: {e}")
        raise HTTPException(500, "Imeshindwa kuongeza likes")


# ============================================
# 📋 GET /sermons/ — Orodha (auth)
# ============================================
@router.get("/", response_model=List[SermonResponse])
async def get_sermons(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    """Get all sermons (auth required)"""
    try:
        query = (
            select(Sermon)
            .order_by(Sermon.date.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        sermons = result.scalars().all()
        return [SermonResponse.from_orm(s) for s in sermons]
    except Exception as e:
        logger.error(f"❌ Get sermons error: {e}")
        raise HTTPException(500, "Imeshindwa kupata mahubiri")


# ============================================
# ➕ POST /sermons/ — Unda (auth + role check)
# ============================================
@router.post("/", response_model=SermonResponse, status_code=status.HTTP_201_CREATED)
async def create_sermon(
    sermon_data: SermonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create new sermon (auth + role required)"""
    _check_sermon_permission(current_user)

    try:
        # ✅ Match status
        status_enum = _match_enum(
            SermonStatus, sermon_data.status or "draft", "status"
        )

        # ✅ Pydantic v1/v2 compatible
        data = _to_dict(sermon_data)
        data.pop("status", None)
        date_value = data.pop("date", None)

        if not date_value:
            raise HTTPException(422, "Tarehe ya mahubiri inahitajika")

        # ✅ Unda sermon
        sermon = Sermon(
            id=str(uuid.uuid4()),
            **data,
            date=date_value,
            status=status_enum,
            created_by=current_user.id,
            created_by_name=current_user.name,
        )

        db.add(sermon)
        await db.commit()
        await db.refresh(sermon)

        logger.info(f"✅ Sermon created: {sermon.id} by {current_user.name}")
        return SermonResponse.from_orm(sermon)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Create sermon error: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(500, f"Imeshindwa kuunda mahubiri: {str(e)}")


# ============================================
# 🔍 GET /sermons/{id} — Moja (auth)
# ⚠️ LAZIMA IWE MWISHO
# ============================================
@router.get("/{sermon_id}", response_model=SermonResponse)
async def get_sermon(
    sermon_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single sermon (auth)"""
    try:
        result = await db.execute(select(Sermon).where(Sermon.id == sermon_id))
        sermon = result.scalar_one_or_none()
        if not sermon:
            raise HTTPException(404, "Mahubiri haipatikani")
        return SermonResponse.from_orm(sermon)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get sermon error: {e}")
        raise HTTPException(500, "Imeshindwa kupata mahubiri")


# ============================================
# ✏️ PUT /sermons/{id} — Hariri (auth + role check)
# ============================================
@router.put("/{sermon_id}", response_model=SermonResponse)
async def update_sermon(
    sermon_id: str,
    sermon_data: SermonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update sermon (auth + role required)"""
    _check_sermon_permission(current_user)

    try:
        result = await db.execute(select(Sermon).where(Sermon.id == sermon_id))
        sermon = result.scalar_one_or_none()
        if not sermon:
            raise HTTPException(404, "Mahubiri haipatikani")

        # ✅ Pydantic v1/v2 compatible
        data = _to_dict(sermon_data, exclude_unset=True)

        if "status" in data and data["status"]:
            data["status"] = _match_enum(SermonStatus, data["status"], "status")

        for key, value in data.items():
            if hasattr(sermon, key):
                setattr(sermon, key, value)

        await db.commit()
        await db.refresh(sermon)

        logger.info(f"✅ Sermon updated: {sermon.id} by {current_user.name}")
        return SermonResponse.from_orm(sermon)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Update sermon error: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(500, f"Imeshindwa kuhariri mahubiri: {str(e)}")


# ============================================
# 🗑️ DELETE /sermons/{id} (auth + role check)
# ============================================
@router.delete("/{sermon_id}")
async def delete_sermon(
    sermon_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete sermon (auth + role required)"""
    _check_sermon_permission(current_user)

    try:
        result = await db.execute(select(Sermon).where(Sermon.id == sermon_id))
        sermon = result.scalar_one_or_none()
        if not sermon:
            raise HTTPException(404, "Mahubiri haipatikani")

        title = sermon.title
        await db.delete(sermon)
        await db.commit()

        logger.info(f"✅ Sermon deleted: {sermon_id} ({title}) by {current_user.name}")
        return {"message": f"Mahubiri '{title}' yamefutwa"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Delete sermon error: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(500, f"Imeshindwa kufuta mahubiri: {str(e)}")