"""
Neurons Service — award and deduct Neurons for study actions.
"""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.neurons import NeuronsTransaction, ActionType
import uuid

# Neurons per action
NEURONS_POMODORO = 25
NEURONS_TASK_COMPLETE = 5
NEURONS_FLASHCARD_SESSION = 10
NEURONS_STREAK_3 = 50
NEURONS_STREAK_7 = 150
NEURONS_STREAK_30 = 500

NEURONS_MAP: dict[ActionType, int] = {
    ActionType.POMODORO_COMPLETE: NEURONS_POMODORO,
    ActionType.TASK_COMPLETE: NEURONS_TASK_COMPLETE,
    ActionType.FLASHCARD_SESSION: NEURONS_FLASHCARD_SESSION,
    ActionType.STREAK_3_DAY: NEURONS_STREAK_3,
    ActionType.STREAK_7_DAY: NEURONS_STREAK_7,
    ActionType.STREAK_30_DAY: NEURONS_STREAK_30,
}


async def award_neurons(
    user: User,
    action_type: ActionType,
    db: AsyncSession,
    amount: int | None = None,
) -> int:
    """
    Awards Neurons to a user for a given action.
    Returns the new balance.
    """
    pts = amount if amount is not None else NEURONS_MAP.get(action_type, 0)
    user.neurons_balance += pts
    db.add(NeuronsTransaction(
        id=uuid.uuid4(),
        user_id=user.id,
        amount=pts,
        action_type=action_type,
    ))
    await db.flush()
    return user.neurons_balance


async def deduct_neurons(
    user: User,
    amount: int,
    action_type: ActionType,
    db: AsyncSession,
) -> int:
    """
    Deducts Neurons from a user. Raises 402 if balance insufficient.
    Returns the new balance.
    """
    if user.neurons_balance < amount:
        raise HTTPException(
            status_code=402,
            detail=f"رصيدك غير كافٍ. تحتاج {amount} نيورون وعندك {user.neurons_balance}.",
        )
    user.neurons_balance -= amount
    db.add(NeuronsTransaction(
        id=uuid.uuid4(),
        user_id=user.id,
        amount=-amount,
        action_type=action_type,
    ))
    await db.flush()
    return user.neurons_balance
