# backend/app/models/offering.py

from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Enum, ForeignKey, JSON, Text
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# ============================================
# 🏛️ SERVICE TYPE — Aina ya Ibada
# ============================================
class ServiceType(str, enum.Enum):
    JUMAPILI = "Jumapili"
    JUMATANO = "Jumatano"
    IJUMA = "Ijumaa"
    JUMAMOSI = "Jumamosi"
    SADAKA_KUU = "Sadaka Kuu"
    MAALUM = "Ibada Maalum"
    NYINGINE = "Nyingine"


# ============================================
# 💰 OFFERING TYPE — Aina ya Sadaka/Mchango
# ============================================
class OfferingType(str, enum.Enum):
    # Traditional
    SADAKA_KUU = "Sadaka Kuu"
    SHUKRANI = "Shukrani"
    MSAMAHA = "Msamaha"
    ZAKA = "Zaka"
    FUNGU_LA_KUMI = "Fungu la Kumi"

    # Special events
    HARAMBEE = "Harambee"
    HARUSI = "Harusi"
    SHUKRANI_YA_PEKE = "Shukrani ya Pekee"
    SIKUKUU = "Sikukuu"
    MSIBA = "Mchango wa Msiba"

    # Ministries & groups
    SUNDAY_SCHOOL = "Sunday School"
    JUMUIYA = "Jumuiya"
    VIJANA = "Vijana"
    WANAWAKE = "Wanawake"
    WANAUME = "Wanaume"

    # Development
    UJENZI = "Ujenzi"
    MCHANGO_WA_UJENZI = "Mchango wa Ujenzi"
    MCHANGO_WA_MAGARI = "Mchango wa Magari"

    # Others
    TOLEO = "Toleo"
    MCHANGO_WA_SHUKRANI = "Mchango wa Shukrani"
    NYINGINE = "Nyingine"


# ============================================
# 📊 OFFERING STATUS — Hali ya Sadaka
# ============================================
class OfferingStatus(str, enum.Enum):
    IMEREKODIWA = "Imerekodiwa"
    IMEIDHINISHWA = "Imeidhinishwa"
    IMEPELEKWA_BANK = "Imepelekwa Bank"
    IMECHELEWESHWA = "Imecheleweshwa"
    IMEKATALIWA = "Imekataliwa"


# ============================================
# 🎯 HELPER: values_callable
# ============================================
def _enum_values(enum_cls):
    """
    Rudisha list ya .value za enum (mfano: ["Jumapili", "Jumatano", ...]).
    Hii inafanya SQLAlchemy itumie .value ("Harambee") sio .name ("HARAMBEE").
    """
    return [e.value for e in enum_cls]


# ============================================
# 🏦 OFFERING MODEL
# ============================================
class Offering(Base):
    __tablename__ = "offerings"

    id = Column(String, primary_key=True, index=True)

    # ✅ values_callable: tumia .value ("Harambee") sio .name ("HARAMBEE")
    service_type = Column(
        Enum(ServiceType, values_callable=_enum_values),
        nullable=False,
    )
    service_date = Column(DateTime(timezone=True), nullable=False)
    offering_type = Column(
        Enum(OfferingType, values_callable=_enum_values),
        nullable=False,
    )
    amount = Column(Float, nullable=False)
    description = Column(Text)

    # Team information
    team_name = Column(String(100))
    team_members = Column(JSON, default=[])
    team_leader = Column(String(100))
    number_of_members = Column(Integer, default=0)

    # Approval tracking
    recorded_by = Column(String, ForeignKey("users.id"))
    recorded_by_name = Column(String(100))
    approved_by = Column(String, ForeignKey("users.id"))
    approved_by_name = Column(String(100))
    approved_at = Column(DateTime(timezone=True))

    # Bank details
    bank_reference = Column(String(100))
    deposited_at = Column(DateTime(timezone=True))
    deposited_by = Column(String, ForeignKey("users.id"))

    # Status
    status = Column(
        Enum(OfferingStatus, values_callable=_enum_values),
        default=OfferingStatus.IMEREKODIWA,
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    recorder = relationship("User", foreign_keys=[recorded_by])
    approver = relationship("User", foreign_keys=[approved_by])
    depositor = relationship("User", foreign_keys=[deposited_by])

    # ============================================
    # ✅ PROPERTY: Idadi halisi ya wanachama
    # ============================================
    @property
    def actual_number_of_members(self) -> int:
        """
        Rudisha idadi ya wanachama kutoka team_members.

        Hii inarekebisha tatizo la sadaka za zamani ambazo
        number_of_members ilikuwa 0 kwa default, lakini
        team_members ilikuwa na wanachama halisi.
        """
        members = self.team_members or []
        if isinstance(members, list):
            return len(members)
        return 0

    # ============================================
    # ✅ AUTO-UPDATE number_of_members kabla ya save
    # ============================================
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Kama team_members imetolewa, auto-set number_of_members
        members = kwargs.get("team_members")
        if members and isinstance(members, list):
            self.number_of_members = len(members)