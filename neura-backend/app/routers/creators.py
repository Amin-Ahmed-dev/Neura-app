"""
T-17 — Tutor Creators & B2B
Creator registration, content upload, affiliate codes, sponsored events.
"""
import json
import secrets
import string
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.creator import (
    CreatorProfile, CreatorContent, AffiliateCode,
    AffiliateRedemption, SponsoredEvent,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class CreatorApplyRequest(BaseModel):
    display_name: str
    bio: Optional[str] = None
    subjects: List[str] = []
    credentials_url: Optional[str] = None


class ContentUploadRequest(BaseModel):
    content_type: str   # 'flashcard_deck' | 'quiz' | 'pdf'
    title: str
    subject: str = "عام"
    visibility: str = "public"
    content_json: Optional[str] = None  # JSON payload


class RedeemCodeRequest(BaseModel):
    code: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _gen_code() -> str:
    """Generate a unique 8-char alphanumeric code."""
    chars = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(chars) for _ in range(8))


async def _get_creator_profile(user: User, db: AsyncSession) -> CreatorProfile:
    result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    if profile.verification_status != "verified":
        raise HTTPException(status_code=403, detail="حسابك لسه بيتراجع من الفريق")
    return profile


# ── T-17-01: Creator Registration ─────────────────────────────────────────────

@router.post("/apply", status_code=201)
async def apply_as_creator(
    body: CreatorApplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a creator application."""
    existing = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == current_user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Application already submitted")

    import hashlib
    profile = CreatorProfile(
        user_id=current_user.id,
        display_name=body.display_name,
        bio=body.bio,
        subjects=json.dumps(body.subjects, ensure_ascii=False),
        credentials_url=body.credentials_url,
        verification_status="pending",
    )
    db.add(profile)
    await db.flush()
    return {"profile_id": str(profile.id), "status": "pending"}


@router.get("/status")
async def get_creator_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return creator application status."""
    result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return {"status": "none"}
    return {
        "status": profile.verification_status,
        "display_name": profile.display_name,
        "subjects": json.loads(profile.subjects or "[]"),
    }


# ── T-17-02: Creator Content ───────────────────────────────────────────────────

@router.post("/content", status_code=201)
async def upload_content(
    body: ContentUploadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload creator content (flashcard deck, quiz, or PDF summary)."""
    profile = await _get_creator_profile(current_user, db)

    content = CreatorContent(
        creator_id=profile.id,
        content_type=body.content_type,
        title=body.title,
        subject=body.subject,
        visibility=body.visibility,
        status="pending_review",
        content_json=body.content_json,
    )
    db.add(content)
    await db.flush()
    return {"content_id": str(content.id), "status": "pending_review"}


@router.get("/content")
async def list_my_content(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all content uploaded by this creator."""
    result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return {"content": []}

    content_result = await db.execute(
        select(CreatorContent)
        .where(CreatorContent.creator_id == profile.id)
        .order_by(CreatorContent.created_at.desc())
    )
    items = content_result.scalars().all()
    return {
        "content": [
            {
                "id": str(c.id),
                "type": c.content_type,
                "title": c.title,
                "subject": c.subject,
                "visibility": c.visibility,
                "status": c.status,
                "created_at": c.created_at.isoformat(),
            }
            for c in items
        ]
    }


# ── T-17-03: Affiliate Codes ───────────────────────────────────────────────────

@router.post("/affiliate-code", status_code=201)
async def generate_affiliate_code(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a unique affiliate code for the creator."""
    profile = await _get_creator_profile(current_user, db)

    # Try up to 5 times to get a unique code
    for _ in range(5):
        code_str = _gen_code()
        existing = await db.execute(
            select(AffiliateCode).where(AffiliateCode.code == code_str)
        )
        if not existing.scalar_one_or_none():
            break
    else:
        raise HTTPException(status_code=500, detail="Failed to generate unique code")

    code = AffiliateCode(creator_id=profile.id, code=code_str)
    db.add(code)
    await db.flush()
    return {"code": code_str, "code_id": str(code.id)}


@router.get("/affiliate-stats")
async def get_affiliate_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return affiliate code usage stats for the creator."""
    result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return {"codes": []}

    codes_result = await db.execute(
        select(AffiliateCode)
        .where(AffiliateCode.creator_id == profile.id)
        .order_by(AffiliateCode.created_at.desc())
    )
    codes = codes_result.scalars().all()
    return {
        "codes": [
            {"code": c.code, "uses_count": c.uses_count, "created_at": c.created_at.isoformat()}
            for c in codes
        ]
    }


@router.post("/students/redeem-code")
async def redeem_affiliate_code(
    body: RedeemCodeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Student redeems a creator's affiliate code to access private content."""
    code_result = await db.execute(
        select(AffiliateCode).where(AffiliateCode.code == body.code.upper())
    )
    code = code_result.scalar_one_or_none()
    if not code:
        raise HTTPException(status_code=404, detail="الكود مش صح، تأكد منه وحاول تاني")

    # Check not already redeemed
    existing = await db.execute(
        select(AffiliateRedemption).where(
            AffiliateRedemption.code_id == code.id,
            AffiliateRedemption.student_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="استخدمت الكود ده قبل كده")

    # Get creator display name
    creator_result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.id == code.creator_id)
    )
    creator = creator_result.scalar_one_or_none()
    creator_name = creator.display_name if creator else "المدرس"

    redemption = AffiliateRedemption(code_id=code.id, student_id=current_user.id)
    db.add(redemption)
    code.uses_count += 1
    await db.flush()

    return {
        "status": "redeemed",
        "creator_name": creator_name,
        "message": f"اتضافت مواد {creator_name} لحسابك ✅",
    }


# ── T-17-04: Sponsored Events ──────────────────────────────────────────────────

@router.get("/events")
async def get_events(
    subject: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Return active sponsored events, optionally filtered by subject and city."""
    result = await db.execute(
        select(SponsoredEvent).where(SponsoredEvent.active == True)
        .order_by(SponsoredEvent.event_date.asc())
    )
    events = result.scalars().all()

    filtered = []
    for e in events:
        target_subjects = json.loads(e.target_subjects or "[]")
        target_cities = json.loads(e.target_cities or "[]")

        # Apply filters if provided
        if subject and target_subjects and subject not in target_subjects:
            continue
        if city and target_cities and city not in target_cities:
            continue

        filtered.append({
            "id": str(e.id),
            "sponsor_name": e.sponsor_name,
            "title": e.title,
            "description": e.description,
            "event_date": e.event_date.isoformat() if e.event_date else None,
            "location": e.location,
            "registration_url": e.registration_url,
            "logo_url": e.logo_url,
            "target_subjects": target_subjects,
            "target_cities": target_cities,
        })

    return {"events": filtered}


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.post("/admin/creators/{profile_id}/verify")
async def admin_verify_creator(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: verify a creator application."""
    if current_user.account_type != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    import uuid as _uuid
    result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.id == _uuid.UUID(profile_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.verification_status = "verified"

    # Upgrade user account type
    user_result = await db.execute(select(User).where(User.id == profile.user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user.account_type = "creator"
        # Send notification
        if user.push_token:
            from app.services.notification_service import send_push
            await send_push(
                user.push_token,
                "تم التحقق من حسابك! ✅",
                "أنت دلوقتي Creator على نيورا، ابدأ رفع المحتوى",
                {"screen": "creator/dashboard"},
            )

    await db.flush()
    return {"status": "verified"}


@router.post("/admin/content/{content_id}/approve")
async def admin_approve_content(
    content_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: approve creator content."""
    if current_user.account_type != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    import uuid as _uuid
    result = await db.execute(
        select(CreatorContent).where(CreatorContent.id == _uuid.UUID(content_id))
    )
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    content.status = "approved"
    await db.flush()
    return {"status": "approved"}


@router.get("/admin/content/pending")
async def admin_list_pending_content(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: list all content pending review."""
    if current_user.account_type != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    result = await db.execute(
        select(CreatorContent)
        .where(CreatorContent.status == "pending_review")
        .order_by(CreatorContent.created_at.asc())
    )
    items = result.scalars().all()
    return {
        "pending": [
            {"id": str(c.id), "type": c.content_type, "title": c.title, "subject": c.subject}
            for c in items
        ]
    }


@router.post("/admin/events", status_code=201)
async def admin_create_event(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: create a sponsored event."""
    if current_user.account_type != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    from datetime import datetime as dt
    event = SponsoredEvent(
        sponsor_name=body.get("sponsor_name", ""),
        title=body.get("title", ""),
        description=body.get("description"),
        event_date=dt.fromisoformat(body["event_date"]) if body.get("event_date") else None,
        location=body.get("location"),
        registration_url=body.get("registration_url", ""),
        target_subjects=json.dumps(body.get("target_subjects", []), ensure_ascii=False),
        target_cities=json.dumps(body.get("target_cities", []), ensure_ascii=False),
        logo_url=body.get("logo_url"),
        active=True,
    )
    db.add(event)
    await db.flush()
    return {"event_id": str(event.id), "status": "created"}
