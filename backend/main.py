# backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import time
from datetime import datetime
from pathlib import Path

from app.core.config import settings
from app.core.database import async_engine, Base, init_db, close_db
from app.api.v1.endpoints import (
    auth, users, offerings, expenses, reports,
    sermons, events, gallery, messages,
    settings as settings_endpoints,
    registrations,
    visitors,  # ✅ Mpya
    prayer_requests, donations, upload,
)

# ============================================
# LOGGING
# ============================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================
# UPLOAD FOLDERS
# ============================================
UPLOAD_DIR = Path("uploads")
for subdir in ["audio", "video", "image", "pdf"]:
    (UPLOAD_DIR / subdir).mkdir(parents=True, exist_ok=True)

logger.info(f"📁 Upload folder: {UPLOAD_DIR.resolve()}")

# ============================================
# LIFESPAN
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 50)
    logger.info("🚀 Starting Amani Luthelani Church API...")
    logger.info(f"📦 Environment: {settings.ENVIRONMENT}")
    logger.info("=" * 50)

    await init_db()

    logger.info("ℹ️  No default admin created. Register via /api/v1/auth/register")
    logger.info("✅ API is ready to serve requests!")
    yield

    logger.info("🔄 Shutting down...")
    await close_db()
    logger.info("✅ Database connections closed.")

# ============================================
# FASTAPI APP
# ============================================
app = FastAPI(
    title="Amani Luthelani Church API",
    description="Church Management System API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ============================================
# STATIC FILES
# ============================================
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ============================================
# MIDDLEWARE
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# ============================================
# REQUEST LOGGER
# ============================================
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    logger.info(f"📥 {request.method} {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"📤 {request.method} {request.url.path} → {response.status_code} ({process_time:.2f}s)")
    response.headers["X-Process-Time"] = str(process_time)
    return response

# ============================================
# EXCEPTION HANDLERS
# ============================================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"❌ HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"❌ Unhandled Exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else "An error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ============================================
# ROOT
# ============================================
@app.get("/")
async def root():
    return {
        "name": "Amani Luthelani Church API",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "documentation": "/api/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if async_engine else "disconnected"
    }

# ============================================
# REGISTER ROUTERS
# ============================================
app.include_router(auth.router, prefix="/api/v1/auth", tags=["🔐 Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["👥 Users"])
app.include_router(offerings.router, prefix="/api/v1/offerings", tags=["💰 Offerings"])
app.include_router(expenses.router, prefix="/api/v1/expenses", tags=["💸 Expenses"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["📊 Reports"])
app.include_router(sermons.router, prefix="/api/v1/sermons", tags=["📖 Sermons"])
app.include_router(events.router, prefix="/api/v1/events", tags=["📅 Events"])
app.include_router(gallery.router, prefix="/api/v1/gallery", tags=["🖼️ Gallery"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["📩 Messages"])
app.include_router(settings_endpoints.router, prefix="/api/v1/settings", tags=["⚙️ Settings"])
app.include_router(registrations.router, prefix="/api/v1/registrations", tags=["✅ Registrations"])
app.include_router(visitors.router, prefix="/api/v1/visitors", tags=["👣 Visitors"])  # ✅ Mpya
app.include_router(prayer_requests.router, prefix="/api/v1/prayer-requests", tags=["🙏 Prayer Requests"])
app.include_router(donations.router, prefix="/api/v1/donations", tags=["💳 Donations"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["📤 Upload"])

# ============================================
# RUN
# ============================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )