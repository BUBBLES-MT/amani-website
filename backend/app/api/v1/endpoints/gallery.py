# backend/app/api/v1/endpoints/gallery.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pathlib import Path
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.gallery import Gallery, GalleryCategory
from app.schemas.gallery import GalleryCreate, GalleryResponse, GalleryUpdate

router = APIRouter()


def _match_enum(enum_class, value, field_name: str):
    if isinstance(value, enum_class):
        return value
    if value is None or str(value).strip() == "":
        return list(enum_class)[-1]

    normalized = str(value).strip().lower().replace("_", " ").replace("-", " ")
    normalized = " ".join(normalized.split())

    for member in enum_class:
        mv = " ".join(str(member.value).strip().lower().replace("_", " ").replace("-", " ").split())
        mn = " ".join(str(member.name).strip().lower().replace("_", " ").replace("-", " ").split())
        if normalized == mv or normalized == mn:
            return member

    valid = ", ".join([f'"{m.value}"' for m in enum_class])
    raise HTTPException(422, f"{field_name} si sahihi. Tumia: {valid}")


# ============================================
# 🌍 PUBLIC — GET /gallery/public
# ============================================
@router.get("/public", response_model=List[GalleryResponse])
async def get_public_gallery(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    category: str = Query(None),
):
    """Public gallery (published only, no auth)"""
    query = (
        select(Gallery)
        .where(Gallery.is_published == True)
        .order_by(Gallery.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    if category:
        try:
            cat_enum = _match_enum(GalleryCategory, category, "category")
            query = query.where(Gallery.category == cat_enum)
        except HTTPException:
            pass

    result = await db.execute(query)
    items = result.scalars().all()
    return [GalleryResponse.from_orm(g) for g in items]


# ============================================
# 📋 GET /gallery/ — Orodha (auth)
# ============================================
@router.get("/", response_model=List[GalleryResponse])
async def get_gallery(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    query = (
        select(Gallery)
        .order_by(Gallery.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    items = result.scalars().all()
    return [GalleryResponse.from_orm(g) for g in items]


# ============================================
# ➕ POST /gallery/ — Pakia picha (auth)
# ============================================
@router.post("/", response_model=GalleryResponse, status_code=status.HTTP_201_CREATED)
async def create_gallery(
    data: GalleryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category_enum = _match_enum(
        GalleryCategory, data.category or "Nyingine", "category"
    )

    payload = data.dict()
    payload.pop("category", None)

    item = Gallery(
        id=str(uuid.uuid4()),
        **payload,
        category=category_enum,
        created_by=current_user.id,
        created_by_name=current_user.name,
    )

    db.add(item)
    await db.commit()
    await db.refresh(item)
    return GalleryResponse.from_orm(item)


# ============================================
# 🔍 GET /gallery/{id} — Moja (auth)
# ============================================
@router.get("/{gallery_id}", response_model=GalleryResponse)
async def get_gallery_item(
    gallery_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Gallery).where(Gallery.id == gallery_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Picha haipatikani")
    return GalleryResponse.from_orm(item)


# ============================================
# 📥 GET /gallery/{id}/download — Pakua picha
# ⚠️ LAZIMA IWE KABLA YA GET /{id}?
# Hapana — FastAPI inaona /{id}/download kama route maalum (yenye /download)
# Kwa hiyo iko salama hapa, lakini ni bora kuweka KABLA ya /{id}
# ============================================
@router.get("/{gallery_id}/download")
async def download_gallery_image(
    gallery_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Download gallery image as attachment"""
    result = await db.execute(select(Gallery).where(Gallery.id == gallery_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Picha haipatikani")

    image_url = item.image_url or ""

    # ✅ Kama ni URL ya ndani (/uploads/...)
    if image_url.startswith("/uploads/"):
        # Pata path kamili — kutoka backend/ (ambako uploads/ ipo)
        file_path = Path(image_url.lstrip("/"))
        if not file_path.exists():
            raise HTTPException(404, "Faili haipatikani kwenye server")

        # ✅ Ongeza downloads
        item.downloads = (item.downloads or 0) + 1
        await db.commit()

        # ✅ Rudisha kama attachment
        ext = file_path.suffix.lstrip(".") or "jpg"
        safe_title = (item.title or "picha").replace(" ", "_").replace("/", "_")
        return FileResponse(
            path=file_path,
            filename=f"{safe_title}.{ext}",
            media_type="application/octet-stream",
        )

    # ✅ Kama ni URL ya nje (http...)
    elif image_url.startswith("http"):
        raise HTTPException(
            400,
            "Picha iko kwenye server ya nje — tumia browser kupakua"
        )

    raise HTTPException(404, "Picha haipatikani")


# ============================================
# ✏️ PUT /gallery/{id} — Hariri (auth)
# ============================================
@router.put("/{gallery_id}", response_model=GalleryResponse)
async def update_gallery(
    gallery_id: str,
    data: GalleryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Gallery).where(Gallery.id == gallery_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Picha haipatikani")

    update_dict = data.dict(exclude_unset=True)

    if "category" in update_dict and update_dict["category"]:
        update_dict["category"] = _match_enum(
            GalleryCategory, update_dict["category"], "category"
        )

    for key, value in update_dict.items():
        if hasattr(item, key):
            setattr(item, key, value)

    await db.commit()
    await db.refresh(item)
    return GalleryResponse.from_orm(item)


# ============================================
# 🗑️ DELETE /gallery/{id} — Futa (auth)
# ============================================
@router.delete("/{gallery_id}")
async def delete_gallery(
    gallery_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Gallery).where(Gallery.id == gallery_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Picha haipatikani")

    await db.delete(item)
    await db.commit()
    return {"message": "Picha imefutwa"}


# ============================================
# 📊 POST /gallery/{id}/view — Ongeza views
# ============================================
@router.post("/{gallery_id}/view")
async def increment_view(
    gallery_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Gallery).where(Gallery.id == gallery_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Picha haipatikani")

    item.views = (item.views or 0) + 1
    await db.commit()
    await db.refresh(item)
    return {"views": item.views}