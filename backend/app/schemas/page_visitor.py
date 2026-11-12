# backend/app/schemas/page_visitor.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ============================================
# 👣 TRACK VISIT REQUEST
# ============================================
class TrackVisitRequest(BaseModel):
    page: str
    path: str
    referrer: Optional[str] = None


# ============================================
# 📊 VISITOR STATS RESPONSE
# ============================================
class VisitorStatsResponse(BaseModel):
    total_visitors: int
    total_views: int
    unique_visitors_today: int
    unique_visitors_week: int
    unique_visitors_month: int
    total_members: int  # Users wa kanisa