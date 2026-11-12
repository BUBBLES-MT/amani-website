# backend/app/core/dependencies.py

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import Security, oauth2_scheme, TokenType
from app.models.user import User, UserRole


# ============================================
# 🎯 HELPER: role value
# ============================================
def _role_value(user: User) -> str:
    return user.role.value if hasattr(user.role, "value") else str(user.role)


# ============================================
# 🎯 ROLE GROUPS
# ============================================

# 👥 Viongozi wa kanisa (wanaonekana public)
PUBLIC_LEADER_ROLES = [
    "mzee_kanisa",
    "mhasibu",
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "katibu_mkuu",
]

# 👑 Viongozi wa juu (wanaweza kuidhinisha/toa fedha)
# ⚠️ MUHIMU: mhasibu HAYUPO hapa — hawezi kuidhinisha!
LEADER_ROLES = [
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "katibu_mkuu",
    "super_admin",
]

# ✅ IT wa Kanisa — anasimamia matangazo
IT_ROLES = [
    "it",
    "super_admin",
]

# 📝 Wanaorekodi sadaka
RECORDER_ROLES = [
    "mzee_kanisa",
    "mhasibu",
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "katibu_mkuu",
    "super_admin",
]

# 💸 Wanaoona matumizi
EXPENSE_VIEWER_ROLES = [
    "mhasibu",
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "katibu_mkuu",
    "super_admin",
]

# 📝 Wanaoomba matumizi
EXPENSE_REQUESTER_ROLES = [
    "mhasibu",
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "katibu_mkuu",
    "super_admin",
]

# ✅✅ MPYA: Wanaweza KUIDHINISHA matumizi
# ⚠️ mhasibu HAYUPO — internal control!
EXPENSE_APPROVER_ROLES = [
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "katibu_mkuu",
    "super_admin",
]

# 💰 Wanaweza KUTOA fedha (baada ya idhini)
EXPENSE_WITHDRAWER_ROLES = [
    "mhasibu",
    "mchungaji_kiongozi",
    "katibu_mkuu",
    "super_admin",
]

# 💰 Wanaoona sadaka
OFFERING_VIEWER_ROLES = [
    "mzee_kanisa",
    "mhasibu",
    "katibu_mkuu",
    "mchungaji_kiongozi",
    "mchungaji_msaidizi",
    "mwinjilist",
    "mwenyekiti",
    "mwenyekiti_msaidizi",
    "it",
    "super_admin",
]


# ============================================
# 🔐 get_current_user
# ============================================
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = Security.decode_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(401, "Invalid token: user_id not found")

    token_type = payload.get("type")
    if token_type != TokenType.ACCESS:
        raise HTTPException(401, "Invalid token type")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(401, "User not found")

    if not user.is_active:
        raise HTTPException(403, "Account is deactivated")

    return user


# ============================================
# ✅ get_current_active_user
# ============================================
async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(403, "Account is deactivated")
    return current_user


# ============================================
# 👑 get_current_super_admin
# ============================================
async def get_current_super_admin(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if _role_value(current_user) != UserRole.SUPER_ADMIN.value:
        raise HTTPException(403, "Super admin access required")
    return current_user


# ============================================
# 👑 get_current_leader
# ============================================
async def get_current_leader(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if _role_value(current_user) not in LEADER_ROLES:
        raise HTTPException(
            403,
            f"Ruhusa ya kiongozi wa juu inahitajika. Roles: {', '.join(LEADER_ROLES)}",
        )
    return current_user


# ============================================
# 📝 get_current_recorder
# ============================================
async def get_current_recorder(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if _role_value(current_user) not in RECORDER_ROLES:
        raise HTTPException(
            403,
            f"Ruhusa ya kurekodi sadaka inahitajika. Roles: {', '.join(RECORDER_ROLES)}",
        )
    return current_user


# ============================================
# ✅ get_current_it_or_leader
# ============================================
async def get_current_it_or_leader(
    current_user: User = Depends(get_current_active_user),
) -> User:
    allowed = IT_ROLES + LEADER_ROLES
    if _role_value(current_user) not in allowed:
        raise HTTPException(
            403,
            f"Ruhusa inahitajika: IT au viongozi wa juu. Roles: {', '.join(allowed)}",
        )
    return current_user


# ============================================
# ✅✅ MPYA: get_current_expense_approver
# ⚠️ mhasibu HAYUPO — internal control!
# ============================================
async def get_current_expense_approver(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Mtu anayeruhusiwa kuidhinisha matumizi (sio mhasibu)."""
    if _role_value(current_user) not in EXPENSE_APPROVER_ROLES:
        raise HTTPException(
            403,
            f"Huna ruhusa ya kuidhinisha matumizi. Roles: {', '.join(EXPENSE_APPROVER_ROLES)}",
        )
    return current_user


# ============================================
# ✅✅ MPYA: get_current_expense_withdrawer
# ============================================
async def get_current_expense_withdrawer(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Mtu anayeruhusiwa kutoa fedha baada ya idhini."""
    if _role_value(current_user) not in EXPENSE_WITHDRAWER_ROLES:
        raise HTTPException(
            403,
            f"Huna ruhusa ya kutoa fedha. Roles: {', '.join(EXPENSE_WITHDRAWER_ROLES)}",
        )
    return current_user


# ============================================
# 🎯 require_role
# ============================================
def require_role(required_roles: List[str]):
    async def role_checker(
        current_user: User = Depends(get_current_active_user),
    ):
        if _role_value(current_user) not in required_roles:
            raise HTTPException(
                403,
                f"Ruhusa inahitajika: {', '.join(required_roles)}",
            )
        return current_user

    return role_checker