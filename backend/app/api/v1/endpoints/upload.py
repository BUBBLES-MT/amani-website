# backend/app/api/v1/endpoints/upload.py

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from pathlib import Path
import uuid
import shutil
from datetime import datetime

from app.core.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()

# ============================================
# 📁 FOLDERS — Hifadhi faili
# ============================================
UPLOAD_DIR = Path("uploads")
AUDIO_DIR = UPLOAD_DIR / "audio"
VIDEO_DIR = UPLOAD_DIR / "video"
IMAGE_DIR = UPLOAD_DIR / "image"
PDF_DIR = UPLOAD_DIR / "pdf"

# Unda folders zote
for d in [AUDIO_DIR, VIDEO_DIR, IMAGE_DIR, PDF_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ============================================
# ✅ ALLOWED TYPES & SIZE LIMITS
# ============================================
ALLOWED_AUDIO = {".mp3", ".wav", ".m4a", ".ogg", ".aac"}
ALLOWED_VIDEO = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
ALLOWED_IMAGE = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_PDF = {".pdf"}

MAX_AUDIO_SIZE = 50 * 1024 * 1024    # 50 MB
MAX_VIDEO_SIZE = 500 * 1024 * 1024   # 500 MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024    # 10 MB
MAX_PDF_SIZE = 20 * 1024 * 1024      # 20 MB


# ============================================
# 🎯 HELPER: Hifadhi faili
# ============================================
async def _save_file(file: UploadFile, folder: Path, allowed_exts: set, max_size: int):
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Aina ya faili si sahihi. Inaruhusiwa: {', '.join(allowed_exts)}",
        )

    # ✅ Unda jina la kipekee
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = folder / filename

    # ✅ Hifadhi faili
    try:
        with filepath.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Imeshindwa kuhifadhi faili: {str(e)}",
        )
    finally:
        await file.close()

    # ✅ Angalia ukubwa baada ya kuhifadhi
    size = filepath.stat().st_size
    if size > max_size:
        filepath.unlink()  # futa
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faili ni kubwa mno. Ukubwa wa juu: {max_size // (1024*1024)} MB",
        )

    # ✅ Rudisha URL
    relative_path = filepath.relative_to(UPLOAD_DIR).as_posix()
    return f"/uploads/{relative_path}", size


# ============================================
# 🎵 POST /upload/audio
# ============================================
@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Pakia audio (mp3, wav, m4a, ogg, aac)"""
    url, size = await _save_file(file, AUDIO_DIR, ALLOWED_AUDIO, MAX_AUDIO_SIZE)
    return {
        "url": url,
        "filename": file.filename,
        "size": size,
        "type": "audio",
    }


# ============================================
# 🎬 POST /upload/video
# ============================================
@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Pakia video (mp4, mov, avi, mkv, webm)"""
    url, size = await _save_file(file, VIDEO_DIR, ALLOWED_VIDEO, MAX_VIDEO_SIZE)
    return {
        "url": url,
        "filename": file.filename,
        "size": size,
        "type": "video",
    }


# ============================================
# 🖼️ POST /upload/image
# ============================================
@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Pakia picha (jpg, png, webp, gif)"""
    url, size = await _save_file(file, IMAGE_DIR, ALLOWED_IMAGE, MAX_IMAGE_SIZE)
    return {
        "url": url,
        "filename": file.filename,
        "size": size,
        "type": "image",
    }


# ============================================
# 📄 POST /upload/pdf
# ============================================
@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Pakia PDF"""
    url, size = await _save_file(file, PDF_DIR, ALLOWED_PDF, MAX_PDF_SIZE)
    return {
        "url": url,
        "filename": file.filename,
        "size": size,
        "type": "pdf",
    }