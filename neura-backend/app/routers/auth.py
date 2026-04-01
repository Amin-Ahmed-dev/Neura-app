from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.services.auth_service import verify_firebase_token
from app.models.user import User
import uuid

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    studentType: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    studentType: str
    isPro: bool
    neuronsBalance: int
    streakCount: int


def _serialize(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        studentType=user.student_type,
        isPro=user.is_pro,
        neuronsBalance=user.neurons_balance,
        streakCount=user.streak_count,
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register")
async def register(
    body: RegisterRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Called after Firebase account creation on the client.
    Verifies the Firebase token and creates/upserts the user in PostgreSQL.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    decoded = await verify_firebase_token(token)

    # Upsert: create if not exists
    result = await db.execute(
        select(User).where(User.firebase_uid == decoded["uid"])
    )
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            id=uuid.uuid4(),
            firebase_uid=decoded["uid"],
            email=decoded.get("email", ""),
            name=body.name,
            student_type=body.studentType,
        )
        db.add(user)
        await db.flush()

    return {"user": _serialize(user)}


@router.post("/login")
async def login(user: User = Depends(get_current_user)):
    """
    Validates the Firebase token (via get_current_user) and returns the user profile.
    """
    return {"user": _serialize(user)}


@router.delete("/account")
async def delete_account(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Soft-deletes the account: anonymizes PII, sets deleted_at.
    The Firebase account deletion is handled on the client side.
    """
    from datetime import datetime
    import hashlib

    user.name = f"deleted_{hashlib.sha256(str(user.id).encode()).hexdigest()[:12]}"
    user.email = f"deleted_{hashlib.sha256(user.email.encode()).hexdigest()[:12]}@deleted.neura"
    user.deleted_at = datetime.utcnow()
    await db.flush()
    return {"status": "deleted"}
