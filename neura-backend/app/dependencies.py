from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.services.auth_service import verify_firebase_token
from app.models.user import User


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validates the Firebase Bearer token and returns the User ORM object.
    Raises 401 if token is missing, invalid, or user not found.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = authorization.removeprefix("Bearer ").strip()
    decoded = await verify_firebase_token(token)

    result = await db.execute(
        select(User).where(User.firebase_uid == decoded["uid"])
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found. Please register first.")

    if user.deleted_at is not None:
        raise HTTPException(status_code=403, detail="Account has been deleted.")

    return user


async def require_pro(user: User = Depends(get_current_user)) -> User:
    """Raises 403 if the user is not on a Pro plan."""
    if not user.is_pro:
        raise HTTPException(
            status_code=403,
            detail="هذه الميزة متاحة لمشتركي Pro فقط ⚡",
        )
    return user
