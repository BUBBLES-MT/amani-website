# backend/app/api/v1/endpoints/prayer_requests.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.security import Security
from app.models.user import User

router = APIRouter()

# TODO: Add prayer request endpoints