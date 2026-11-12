# backend/app/models/page_visitor.py

from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.sql import func

from app.core.database import Base


# ============================================
# 👣 PAGE VISITOR MODEL
# Kila mtu anayetembelea website — kumbukumbu
# ============================================
class PageVisitor(Base):
    __tablename__ = "page_visitors"

    id = Column(String, primary_key=True, index=True)

    # ✅ Identity
    ip_address = Column(String(45), nullable=True)        # IPv4 au IPv6
    user_agent = Column(String(500), nullable=True)       # Browser info
    session_id = Column(String(100), nullable=True)       # Session ya browser
    visitor_id = Column(String(100), nullable=True)       # Unique fingerprint

    # ✅ Ukurasa uliotembelewa
    page = Column(String(200), nullable=False)
    path = Column(String(500), nullable=False)

    # ✅ Metadata
    referrer = Column(String(500), nullable=True)
    country = Column(String(100), nullable=True)
    is_unique = Column(Boolean, default=True)

    # ✅ Timestamps
    visited_at = Column(DateTime(timezone=True), server_default=func.now())