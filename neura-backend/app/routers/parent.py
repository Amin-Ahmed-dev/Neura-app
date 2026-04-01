"""
T-15 — Parental Controls & Reports
Endpoints: link, verify, unlink, status
"""
import secrets
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.parent import ParentLink
from app.services.parent_service import send_verification_message

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class LinkRequest(BaseModel):
    contact: str          # WhatsApp number (+201xxxxxxxxx) or email
    contact_type: str     # 'whatsapp' | 'email'


class ReportPrefsUpdate(BaseModel):
    receive_reports: bool


# ── Helpers ───────────────────────────────────────────────────────────────────

def _detect_contact_type(contact: str) -> str:
    """Auto-detect if contact is email or phone."""
    return "email" if "@" in contact else "whatsapp"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/link", status_code=201)
async def link_parent(
    body: LinkRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a parent link request. Only one link allowed per student."""
    # Check existing link
    result = await db.execute(
        select(ParentLink).where(ParentLink.student_id == current_user.id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Parent link already exists")

    token = secrets.token_urlsafe(32)
    contact_type = _detect_contact_type(body.contact)

    link = ParentLink(
        student_id=current_user.id,
        parent_contact=body.contact,
        contact_type=contact_type,
        verified=False,
        verification_token=token,
        receive_reports=True,
    )
    db.add(link)
    await db.flush()

    # Send verification message (non-blocking — fire and forget)
    try:
        await send_verification_message(
            contact=body.contact,
            contact_type=contact_type,
            student_name=current_user.name,
            token=token,
        )
    except Exception as exc:
        logger.warning("Failed to send verification message: %s", exc)

    return {"link_id": str(link.id), "status": "pending"}


@router.get("/verify/{token}")
async def verify_parent_link(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint — parent clicks link in message to verify."""
    result = await db.execute(
        select(ParentLink).where(ParentLink.verification_token == token)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Invalid or expired token")

    link.verified = True
    link.verification_token = None  # consume token
    await db.flush()

    return {"status": "verified", "message": "تم ربط حساب ولي الأمر بنجاح ✅"}


@router.delete("/link", status_code=204)
async def unlink_parent(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Student unlinks their parent."""
    result = await db.execute(
        select(ParentLink).where(ParentLink.student_id == current_user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="No parent link found")

    await db.delete(link)
    await db.flush()


@router.get("/status")
async def get_parent_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return current parent link status for the student."""
    result = await db.execute(
        select(ParentLink).where(ParentLink.student_id == current_user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        return {"status": "none"}

    return {
        "status": "verified" if link.verified else "pending",
        "contact_type": link.contact_type,
        "contact_masked": _mask_contact(link.parent_contact, link.contact_type),
        "receive_reports": link.receive_reports,
    }


@router.patch("/link/prefs")
async def update_report_prefs(
    body: ReportPrefsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle weekly report delivery."""
    result = await db.execute(
        select(ParentLink).where(ParentLink.student_id == current_user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="No parent link found")

    link.receive_reports = body.receive_reports
    await db.flush()
    return {"status": "updated"}


def _mask_contact(contact: str, contact_type: str) -> str:
    """Partially mask contact for display."""
    if contact_type == "email":
        parts = contact.split("@")
        if len(parts) == 2:
            return parts[0][:2] + "***@" + parts[1]
    # phone
    return contact[:4] + "****" + contact[-3:]
