# backend/app/models/user.py

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum, JSON
from sqlalchemy.sql import func
import enum

from app.core.database import Base


# ============================================
# 👤 USER ROLES — FINAL (Milele)
# ============================================
class UserRole(str, enum.Enum):
    MUUMINI = "muumini"
    MZEE_KANISA = "mzee_kanisa"
    MHASIBU = "mhasibu"
    KATIBU_MKUU = "katibu_mkuu"
    MCHUNGAJI_MSAIDIZI = "mchungaji_msaidizi"
    MCHUNGAJI_KIONGOZI = "mchungaji_kiongozi"
    MWINJILIST = "mwinjilist"
    MWENYEKITI = "mwenyekiti"
    MWENYEKITI_MSAIDIZI = "mwenyekiti_msaidizi"
    IT = "it"
    SUPER_ADMIN = "super_admin"


# ============================================
# ✅ APPROVAL STATUS (Python enum — kwa code)
# ============================================
class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"        # Inasubiri idhini
    APPROVED = "approved"      # Imeidhinishwa


# ============================================
# 👤 USER MODEL
# ============================================
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))

    # ✅ role — DB ina enum `userrole` → tumia Enum()
    role = Column(
        Enum(UserRole, values_callable=lambda e: [x.value for x in UserRole]),
        default=UserRole.MUUMINI,
    )

    church_name = Column(String(100))
    church_location = Column(String(200))
    is_active = Column(Boolean, default=True)

    # ============================================
    # ✅ APPROVAL SYSTEM
    # ============================================
    is_approved = Column(Boolean, default=False)

    # ✅ approval_status — DB ina varchar(20) → tumia String()
    approval_status = Column(
        String(20),
        default=ApprovalStatus.PENDING.value,
    )

    approved_by = Column(String, nullable=True)          # user_id wa aliyeidhinisha
    approved_by_name = Column(String(100), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    team_leader = Column(Boolean, default=False)
    permissions = Column(JSON, default={})