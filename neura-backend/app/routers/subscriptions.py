"""
T-15-05 — Family Plan Backend Foundation
Endpoints for creating and managing family plans.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.family_plan import FamilyPlan, FamilyPlanMember

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class AddMemberRequest(BaseModel):
    student_id: str


class RemoveMemberRequest(BaseModel):
    student_id: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/family", status_code=201)
async def create_family_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a family plan. Parent user becomes the plan owner."""
    # Check if plan already exists
    result = await db.execute(
        select(FamilyPlan).where(
            FamilyPlan.parent_user_id == current_user.id,
            FamilyPlan.status == "active",
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Family plan already exists")

    plan = FamilyPlan(parent_user_id=current_user.id)
    db.add(plan)
    await db.flush()
    return {"plan_id": str(plan.id), "status": "active", "max_students": plan.max_students}


@router.post("/family/add-member")
async def add_family_member(
    body: AddMemberRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a student to the family plan. Grants them Pro access."""
    plan = await _get_active_plan(current_user.id, db)

    # Check capacity
    members_result = await db.execute(
        select(FamilyPlanMember).where(FamilyPlanMember.plan_id == plan.id)
    )
    members = members_result.scalars().all()
    if len(members) >= plan.max_students:
        raise HTTPException(status_code=400, detail=f"الخطة مليانة ({plan.max_students} طلاب)")

    # Check student exists
    student_result = await db.execute(
        select(User).where(User.id == body.student_id)
    )
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check not already a member
    existing = await db.execute(
        select(FamilyPlanMember).where(
            FamilyPlanMember.plan_id == plan.id,
            FamilyPlanMember.student_id == student.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Student already in plan")

    member = FamilyPlanMember(plan_id=plan.id, student_id=student.id)
    db.add(member)

    # Grant Pro access
    student.is_pro = True
    await db.flush()

    return {"status": "added", "student_id": body.student_id}


@router.delete("/family/remove-member/{student_id}", status_code=204)
async def remove_family_member(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a student from the family plan. Revokes their Pro access."""
    plan = await _get_active_plan(current_user.id, db)

    member_result = await db.execute(
        select(FamilyPlanMember).where(
            FamilyPlanMember.plan_id == plan.id,
            FamilyPlanMember.student_id == student_id,
        )
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    await db.delete(member)

    # Revoke Pro (unless they have their own subscription)
    student_result = await db.execute(select(User).where(User.id == student_id))
    student = student_result.scalar_one_or_none()
    if student:
        student.is_pro = False

    await db.flush()


@router.get("/family")
async def get_family_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current family plan and members."""
    result = await db.execute(
        select(FamilyPlan).where(
            FamilyPlan.parent_user_id == current_user.id,
            FamilyPlan.status == "active",
        )
    )
    plan = result.scalar_one_or_none()
    if not plan:
        return {"status": "none"}

    members_result = await db.execute(
        select(FamilyPlanMember).where(FamilyPlanMember.plan_id == plan.id)
    )
    members = members_result.scalars().all()

    return {
        "plan_id": str(plan.id),
        "status": plan.status,
        "max_students": plan.max_students,
        "member_count": len(members),
        "member_ids": [str(m.student_id) for m in members],
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_active_plan(user_id, db: AsyncSession) -> FamilyPlan:
    result = await db.execute(
        select(FamilyPlan).where(
            FamilyPlan.parent_user_id == user_id,
            FamilyPlan.status == "active",
        )
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="No active family plan found")
    return plan


# ── T-16-04: Paymob Payment Integration ──────────────────────────────────────

import hmac
import hashlib
import logging
from datetime import datetime, timedelta
from app.models.subscription import Subscription
from app.services.plan_service import get_usage_stats

logger = logging.getLogger(__name__)

PRO_PRICE_EGP = 99  # ~price of one tutoring session


class CreateSubscriptionRequest(BaseModel):
    plan_type: str = "pro"  # 'pro' | 'family'
    payment_method: str = "card"  # 'card' | 'vodafone_cash' | 'fawry'


class WebhookPayload(BaseModel):
    obj: dict
    type: str


@router.post("/create")
async def create_subscription(
    body: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Initiate a Paymob payment. Returns a payment URL for the frontend to open.
    """
    from app.config import settings

    paymob_key = getattr(settings, "PAYMOB_API_KEY", "")
    if not paymob_key:
        # Dev mode — return mock payment URL
        return {
            "payment_url": "https://accept.paymob.com/api/acceptance/iframes/dev-mock",
            "order_id": "dev-order-123",
            "status": "pending",
        }

    try:
        import httpx

        async with httpx.AsyncClient(timeout=15) as client:
            # Step 1: Auth token
            auth_resp = await client.post(
                "https://accept.paymob.com/api/auth/tokens",
                json={"api_key": paymob_key},
            )
            auth_resp.raise_for_status()
            auth_token = auth_resp.json()["token"]

            # Step 2: Create order
            amount_cents = PRO_PRICE_EGP * 100
            order_resp = await client.post(
                "https://accept.paymob.com/api/ecommerce/orders",
                json={
                    "auth_token": auth_token,
                    "delivery_needed": False,
                    "amount_cents": amount_cents,
                    "currency": "EGP",
                    "items": [{"name": "نيورا Pro", "amount_cents": amount_cents, "quantity": 1}],
                },
            )
            order_resp.raise_for_status()
            order_id = order_resp.json()["id"]

            # Step 3: Payment key
            integration_id = getattr(settings, "PAYMOB_INTEGRATION_ID", "")
            pk_resp = await client.post(
                "https://accept.paymob.com/api/acceptance/payment_keys",
                json={
                    "auth_token": auth_token,
                    "amount_cents": amount_cents,
                    "expiration": 3600,
                    "order_id": order_id,
                    "billing_data": {
                        "first_name": current_user.name.split()[0],
                        "last_name": current_user.name.split()[-1] if len(current_user.name.split()) > 1 else ".",
                        "email": current_user.email,
                        "phone_number": "N/A",
                        "apartment": "N/A", "floor": "N/A", "street": "N/A",
                        "building": "N/A", "shipping_method": "N/A",
                        "postal_code": "N/A", "city": "N/A",
                        "country": "EG", "state": "N/A",
                    },
                    "currency": "EGP",
                    "integration_id": integration_id,
                },
            )
            pk_resp.raise_for_status()
            payment_token = pk_resp.json()["token"]

            iframe_id = getattr(settings, "PAYMOB_IFRAME_ID", "")
            payment_url = f"https://accept.paymob.com/api/acceptance/iframes/{iframe_id}?payment_token={payment_token}"

            return {"payment_url": payment_url, "order_id": str(order_id), "status": "pending"}

    except Exception as exc:
        logger.error("[Paymob] Payment initiation failed: %s", exc)
        raise HTTPException(status_code=502, detail="فشل في بدء عملية الدفع، حاول تاني")


@router.post("/webhook")
async def paymob_webhook(
    request_body: dict,
    db: AsyncSession = Depends(get_db),
):
    """
    Paymob webhook — called after payment success/failure.
    Verifies HMAC signature and activates Pro on success.
    """
    from app.config import settings

    hmac_secret = getattr(settings, "PAYMOB_HMAC_SECRET", "")

    # Verify HMAC if secret is configured
    if hmac_secret:
        received_hmac = request_body.get("hmac", "")
        obj = request_body.get("obj", {})
        # Paymob HMAC concatenation (sorted keys)
        hmac_fields = [
            "amount_cents", "created_at", "currency", "error_occured",
            "has_parent_transaction", "id", "integration_id", "is_3d_secure",
            "is_auth", "is_capture", "is_refunded", "is_standalone_payment",
            "is_voided", "order", "owner", "pending", "source_data.pan",
            "source_data.sub_type", "source_data.type", "success",
        ]
        concat = "".join(str(obj.get(f, "")) for f in hmac_fields)
        expected = hmac.new(
            hmac_secret.encode(), concat.encode(), hashlib.sha512
        ).hexdigest()
        if not hmac.compare_digest(received_hmac, expected):
            raise HTTPException(status_code=400, detail="Invalid HMAC")

    obj = request_body.get("obj", {})
    success = obj.get("success", False)
    order_id = str(obj.get("order", {}).get("id", ""))

    if not success:
        logger.info("[Paymob] Payment failed for order %s", order_id)
        return {"status": "failed"}

    # Find user by email from billing data
    email = obj.get("order", {}).get("shipping_data", {}).get("email", "")
    if not email:
        logger.warning("[Paymob] No email in webhook payload")
        return {"status": "ok"}

    from sqlalchemy import select as sa_select
    result = await db.execute(sa_select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        logger.warning("[Paymob] User not found for email %s", email[:4] + "****")
        return {"status": "ok"}

    # Activate Pro
    user.is_pro = True
    now = datetime.utcnow()
    sub = Subscription(
        user_id=user.id,
        plan_type="pro",
        status="active",
        paymob_subscription_id=order_id,
        amount_egp=PRO_PRICE_EGP,
        billing_cycle_start=now,
        billing_cycle_end=now + timedelta(days=30),
    )
    db.add(sub)
    await db.flush()
    logger.info("[Paymob] Pro activated for user %s", str(user.id)[:8])
    return {"status": "ok"}


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel Pro subscription. is_pro stays true until billing_cycle_end."""
    from sqlalchemy import select as sa_select

    result = await db.execute(
        sa_select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status == "active",
        )
    )
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    sub.status = "cancelled"
    sub.cancelled_at = datetime.utcnow()
    await db.flush()

    return {
        "status": "cancelled",
        "active_until": sub.billing_cycle_end.isoformat() if sub.billing_cycle_end else None,
        "message": f"اشتراكك هيفضل شغال لحد {sub.billing_cycle_end.strftime('%Y-%m-%d') if sub.billing_cycle_end else 'نهاية الدورة'}",
    }


@router.get("/me")
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return current subscription details + usage stats."""
    from sqlalchemy import select as sa_select

    result = await db.execute(
        sa_select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status.in_(["active", "cancelled"]),
        ).order_by(Subscription.created_at.desc())
    )
    sub = result.scalar_one_or_none()
    usage = await get_usage_stats(str(current_user.id))

    if not sub:
        return {
            "plan": "free",
            "is_pro": current_user.is_pro,
            "usage": usage,
        }

    return {
        "plan": sub.plan_type,
        "status": sub.status,
        "is_pro": current_user.is_pro,
        "amount_egp": sub.amount_egp,
        "billing_cycle_end": sub.billing_cycle_end.isoformat() if sub.billing_cycle_end else None,
        "cancelled_at": sub.cancelled_at.isoformat() if sub.cancelled_at else None,
        "usage": usage,
    }
