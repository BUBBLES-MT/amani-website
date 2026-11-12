# backend/app/schemas/gallery.py

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


# ============================================
# 🖼️ GALLERY BASE
# ============================================
class GalleryBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = "Nyingine"
    image_url: str = Field(min_length=1)
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    size: Optional[int] = None
    tags: Optional[str] = None
    is_featured: bool = False
    is_published: bool = True
    event_id: Optional[str] = None


# ============================================
# ➕ GALLERY CREATE
# ============================================
class GalleryCreate(GalleryBase):
    pass


# ============================================
# ✏️ GALLERY UPDATE
# ============================================
class GalleryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[str] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    event_id: Optional[str] = None


# ============================================
# 📤 GALLERY RESPONSE
# ============================================
class GalleryResponse(GalleryBase):
    id: str
    views: int = 0
    downloads: int = 0
    created_by: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator("category", mode="before")
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
            title=obj.title,
            description=obj.description,
            category=obj.category,
            image_url=obj.image_url,
            thumbnail_url=obj.thumbnail_url,
            width=obj.width,
            height=obj.height,
            size=obj.size,
            tags=obj.tags,
            is_featured=obj.is_featured or False,
            is_published=obj.is_published if obj.is_published is not None else True,
            event_id=obj.event_id,
            views=obj.views or 0,
            downloads=obj.downloads or 0,
            created_by=obj.created_by,
            created_by_name=obj.created_by_name,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )