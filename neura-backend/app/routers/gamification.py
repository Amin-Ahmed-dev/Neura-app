"""
Gamification Router — Neurons balance/history, leaderboard, rewards store.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from pydantic import BaseModel
from datetime import date, timedelta
from typing import Literal
import uuid, secrets

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.neurons import NeuronsTransaction, ActionType
from app.models.leaderboard import LeaderboardEntry
from app.models.reward import Reward, RewardRedemption
from app.services.neurons_service import deduct_neurons

router = APIRouter()

ACTION_LABELS: dict[str, str] = {
    "pomodoro_complete": "إتمام بومودورو",
    "task_complete": "إتمام مهمة",
    "flashcard_session": "جلسة فلاش كارد",
    "streak_3_day": "مكافأة 3 أيام متتالية 🔥",
    "streak_7_day": "مكافأة أسبوع متتالي 🏆",
    "streak_30_day": "مكافأة شهر متتالي 🌟",
    "redemption": "استبدال مكافأة",
    "streak_freeze": "تجميد السلسلة",
    "bonus": "مكافأة إضافية",
    "onboarding_complete": "إتمام الإعداد",
    "first_material": "أول مادة",
    "first_flashcard": "أول فلاش كارد",
    "grayscale_unlock": "فتح وضع الألوان",
}

# ── Neurons ───────────────────────────────────────────────────────────────────

@router.get("/balance")
async def get_balance(user: User = Depends(get_current_user)):
    return {
        "neurons_balance": user.neurons_balance,
        "streak_count": user.streak_count,
        "streak_freeze_count": user.streak_freeze_count,
        "last_active_date": user.last_active_date.isoformat() if user.last_active_date else None,
    }


@router.get("/history")
async def get_history(
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Paginated Neurons transaction history (20 per page)."""
    PAGE_SIZE = 20
    offset = (page - 1) * PAGE_SIZE

    result = await db.execute(
        select(NeuronsTransaction)
        .where(NeuronsTransaction.user_id == user.id)
        .order_by(NeuronsTransaction.created_at.desc())
        .offset(offset)
        .limit(PAGE_SIZE)
    )
    transactions = result.scalars().all()

    count_result = await db.execute(
        select(func.count(NeuronsTransaction.id)).where(NeuronsTransaction.user_id == user.id)
    )
    total = count_result.scalar() or 0

    return {
        "transactions": [
            {
                "id": str(t.id),
                "amount": t.amount,
                "action_type": t.action_type.value,
                "label": ACTION_LABELS.get(t.action_type.value, t.action_type.value),
                "created_at": t.created_at.isoformat(),
            }
            for t in transactions
        ],
        "page": page,
        "total": total,
        "has_more": offset + PAGE_SIZE < total,
    }


@router.get("/weekly-chart")
async def get_weekly_chart(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns daily Neurons earned for the last 7 days."""
    today = date.today()
    days = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        result = await db.execute(
            select(func.sum(NeuronsTransaction.amount)).where(
                and_(
                    NeuronsTransaction.user_id == user.id,
                    NeuronsTransaction.amount > 0,
                    func.date(NeuronsTransaction.created_at) == day,
                )
            )
        )
        earned = result.scalar() or 0
        days.append({"date": day.isoformat(), "neurons": earned})
    return {"days": days}


@router.post("/award")
async def award_neurons_endpoint(
    action_type: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Awards Neurons for one-time milestone actions."""
    AWARD_MAP = {
        ActionType.ONBOARDING_COMPLETE.value: 100,
        ActionType.FIRST_MATERIAL.value: 50,
        ActionType.FIRST_FLASHCARD.value: 25,
    }
    amount = AWARD_MAP.get(action_type)
    if amount is None:
        raise HTTPException(status_code=400, detail="نوع الإجراء غير صحيح")
    try:
        action = ActionType(action_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="نوع الإجراء غير صحيح")

    user.neurons_balance += amount
    db.add(NeuronsTransaction(id=uuid.uuid4(), user_id=user.id, amount=amount, action_type=action))
    await db.flush()
    return {"awarded": amount, "new_balance": user.neurons_balance}


@router.post("/spend/grayscale-unlock")
async def spend_grayscale_unlock(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_balance = await deduct_neurons(user, 50, ActionType.GRAYSCALE_UNLOCK, db)
    return {"unlocked": True, "new_balance": new_balance}


# ── Leaderboard ───────────────────────────────────────────────────────────────

@router.get("/leaderboard")
async def get_leaderboard(
    league: Literal["school", "city", "national"] = "school",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns top 50 for the current week + user's own rank."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())  # Monday

    result = await db.execute(
        select(LeaderboardEntry)
        .where(
            and_(
                LeaderboardEntry.week_start == week_start,
                LeaderboardEntry.league == league,
            )
        )
        .order_by(LeaderboardEntry.rank)
        .limit(50)
    )
    entries = result.scalars().all()

    # User's own entry
    user_entry_result = await db.execute(
        select(LeaderboardEntry).where(
            and_(
                LeaderboardEntry.user_id == user.id,
                LeaderboardEntry.week_start == week_start,
                LeaderboardEntry.league == league,
            )
        )
    )
    user_entry = user_entry_result.scalar_one_or_none()

    next_monday = week_start + timedelta(days=7)
    days_until_reset = (next_monday - today).days

    def _format_entry(e: LeaderboardEntry, is_self: bool = False) -> dict:
        display_name = (
            user.name if is_self and user.show_on_leaderboard
            else f"طالب #{str(e.user_id)[:6]}"
        )
        return {
            "rank": e.rank,
            "display_name": display_name,
            "weekly_neurons": e.weekly_neurons,
            "is_self": is_self,
        }

    return {
        "league": league,
        "week_start": week_start.isoformat(),
        "days_until_reset": days_until_reset,
        "entries": [_format_entry(e, e.user_id == user.id) for e in entries],
        "user_rank": _format_entry(user_entry, True) if user_entry else None,
    }


# ── Rewards Store ─────────────────────────────────────────────────────────────

@router.get("/rewards")
async def list_rewards(
    reward_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Lists available rewards, optionally filtered by type."""
    conditions = [Reward.is_active == True, Reward.stock_count > 0]
    if reward_type:
        conditions.append(Reward.reward_type == reward_type)

    result = await db.execute(
        select(Reward).where(and_(*conditions)).order_by(Reward.neurons_cost)
    )
    rewards = result.scalars().all()

    return {
        "rewards": [
            {
                "id": str(r.id),
                "title": r.title,
                "description": r.description,
                "neurons_cost": r.neurons_cost,
                "partner_logo_url": r.partner_logo_url,
                "expiry_date": r.expiry_date.isoformat() if r.expiry_date else None,
                "stock_count": r.stock_count,
                "reward_type": r.reward_type,
                "can_afford": user.neurons_balance >= r.neurons_cost,
            }
            for r in rewards
        ],
        "user_balance": user.neurons_balance,
    }


@router.post("/rewards/{reward_id}/redeem")
async def redeem_reward(
    reward_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Redeems a reward: deducts Neurons, decrements stock, returns code."""
    result = await db.execute(
        select(Reward).where(
            and_(Reward.id == uuid.UUID(reward_id), Reward.is_active == True)
        )
    )
    reward = result.scalar_one_or_none()
    if not reward:
        raise HTTPException(status_code=404, detail="المكافأة مش موجودة")
    if reward.stock_count <= 0:
        raise HTTPException(status_code=409, detail="المكافأة خلصت للأسف")

    await deduct_neurons(user, reward.neurons_cost, ActionType.REDEMPTION, db)

    reward.stock_count -= 1
    code = secrets.token_urlsafe(8).upper()

    db.add(RewardRedemption(
        id=uuid.uuid4(),
        user_id=user.id,
        reward_id=reward.id,
        reward_code=code,
        neurons_spent=reward.neurons_cost,
    ))
    await db.flush()

    return {
        "reward_code": code,
        "reward_title": reward.title,
        "neurons_spent": reward.neurons_cost,
        "new_balance": user.neurons_balance,
    }
