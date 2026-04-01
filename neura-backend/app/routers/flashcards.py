"""
Flashcards Router — deck management, spaced repetition review, Feynman check.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from pydantic import BaseModel
from datetime import date
from typing import Literal
import uuid, secrets

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.flashcard import Deck, Flashcard
from app.services.sm2_service import update_card

router = APIRouter()

FREE_MONTHLY_CARD_LIMIT = 50


# ── Schemas ───────────────────────────────────────────────────────────────────

class ReviewRequest(BaseModel):
    quality: Literal[0, 3, 5]  # Again / Hard / Easy


class CreateDeckRequest(BaseModel):
    title: str
    subject: str = "عام"


class AddCardRequest(BaseModel):
    question: str
    answer: str


class FeynmanCheckRequest(BaseModel):
    transcription: str
    correct_answer: str
    subject: str = "عام"


# ── Decks ─────────────────────────────────────────────────────────────────────

@router.get("/decks")
async def list_decks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists all decks with stats: total cards, due today, mastery %."""
    result = await db.execute(
        select(Deck).where(Deck.user_id == user.id).order_by(Deck.created_at.desc())
    )
    decks = result.scalars().all()

    today = date.today()
    deck_list = []
    for deck in decks:
        cards_result = await db.execute(
            select(Flashcard).where(Flashcard.deck_id == deck.id)
        )
        cards = cards_result.scalars().all()
        total = len(cards)
        due = sum(1 for c in cards if c.next_review_date <= today)
        mastered = sum(1 for c in cards if c.ease_factor > 2.5)
        mastery_pct = round((mastered / total * 100) if total > 0 else 0)

        deck_list.append({
            "id": str(deck.id),
            "title": deck.title,
            "subject": deck.subject,
            "material_id": str(deck.material_id) if deck.material_id else None,
            "share_token": deck.share_token,
            "total_cards": total,
            "due_today": due,
            "mastery_pct": mastery_pct,
            "created_at": deck.created_at.isoformat(),
        })

    return {"decks": deck_list}


@router.post("/decks")
async def create_deck(
    body: CreateDeckRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually create a new deck."""
    deck = Deck(
        id=uuid.uuid4(),
        user_id=user.id,
        title=body.title.strip(),
        subject=body.subject,
    )
    db.add(deck)
    await db.flush()
    return {"id": str(deck.id), "title": deck.title, "subject": deck.subject}


@router.post("/decks/{deck_id}/cards")
async def add_card(
    deck_id: str,
    body: AddCardRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually add a card to a deck."""
    deck_result = await db.execute(
        select(Deck).where(and_(Deck.id == uuid.UUID(deck_id), Deck.user_id == user.id))
    )
    deck = deck_result.scalar_one_or_none()
    if not deck:
        raise HTTPException(status_code=404, detail="الديك مش موجود")

    card = Flashcard(
        id=uuid.uuid4(),
        user_id=user.id,
        deck_id=deck.id,
        question=body.question.strip(),
        answer=body.answer.strip(),
        next_review_date=date.today(),
    )
    db.add(card)
    await db.flush()
    return {"id": str(card.id), "question": card.question, "answer": card.answer}


@router.post("/decks/{deck_id}/share")
async def share_deck(
    deck_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generates a shareable read-only token for a deck."""
    deck_result = await db.execute(
        select(Deck).where(and_(Deck.id == uuid.UUID(deck_id), Deck.user_id == user.id))
    )
    deck = deck_result.scalar_one_or_none()
    if not deck:
        raise HTTPException(status_code=404, detail="الديك مش موجود")

    if not deck.share_token:
        deck.share_token = secrets.token_urlsafe(32)
        await db.flush()

    return {"share_token": deck.share_token, "share_url": f"/flashcards/shared/{deck.share_token}"}


@router.get("/shared/{token}")
async def get_shared_deck(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint — returns a shared deck's cards (read-only)."""
    deck_result = await db.execute(select(Deck).where(Deck.share_token == token))
    deck = deck_result.scalar_one_or_none()
    if not deck:
        raise HTTPException(status_code=404, detail="الرابط ده مش صحيح أو انتهى")

    cards_result = await db.execute(select(Flashcard).where(Flashcard.deck_id == deck.id))
    cards = cards_result.scalars().all()

    return {
        "deck": {"id": str(deck.id), "title": deck.title, "subject": deck.subject},
        "cards": [{"id": str(c.id), "question": c.question, "answer": c.answer} for c in cards],
    }


@router.post("/shared/{token}/import")
async def import_shared_deck(
    token: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Imports a shared deck into the current user's account."""
    deck_result = await db.execute(select(Deck).where(Deck.share_token == token))
    source = deck_result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="الرابط ده مش صحيح أو انتهى")

    new_deck = Deck(
        id=uuid.uuid4(),
        user_id=user.id,
        title=f"{source.title} (مشترك)",
        subject=source.subject,
    )
    db.add(new_deck)
    await db.flush()

    cards_result = await db.execute(select(Flashcard).where(Flashcard.deck_id == source.id))
    for c in cards_result.scalars().all():
        db.add(Flashcard(
            id=uuid.uuid4(),
            user_id=user.id,
            deck_id=new_deck.id,
            question=c.question,
            answer=c.answer,
            next_review_date=date.today(),
        ))

    await db.flush()
    return {"id": str(new_deck.id), "title": new_deck.title}


# ── Due cards ─────────────────────────────────────────────────────────────────

@router.get("/due")
async def get_due_cards(
    deck_id: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns all cards due for review today (optionally filtered by deck)."""
    today = date.today()
    conditions = [Flashcard.user_id == user.id, Flashcard.next_review_date <= today]
    if deck_id:
        conditions.append(Flashcard.deck_id == uuid.UUID(deck_id))

    result = await db.execute(
        select(Flashcard).where(and_(*conditions)).order_by(Flashcard.next_review_date)
    )
    cards = result.scalars().all()

    return {
        "cards": [
            {
                "id": str(c.id),
                "deck_id": str(c.deck_id),
                "question": c.question,
                "answer": c.answer,
                "ease_factor": c.ease_factor,
                "interval_days": c.interval_days,
                "repetitions": c.repetitions,
                "next_review_date": c.next_review_date.isoformat(),
            }
            for c in cards
        ],
        "total": len(cards),
    }


# ── Review (SM-2) ─────────────────────────────────────────────────────────────

@router.post("/{card_id}/review")
async def review_card(
    card_id: str,
    body: ReviewRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Applies SM-2 algorithm to a card based on recall quality."""
    result = await db.execute(
        select(Flashcard).where(
            and_(Flashcard.id == uuid.UUID(card_id), Flashcard.user_id == user.id)
        )
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="البطاقة مش موجودة")

    updated = update_card(card, body.quality)
    await db.flush()

    return {
        "id": str(updated.id),
        "ease_factor": updated.ease_factor,
        "interval_days": updated.interval_days,
        "repetitions": updated.repetitions,
        "next_review_date": updated.next_review_date.isoformat(),
    }


# ── Feynman AI check ──────────────────────────────────────────────────────────

@router.post("/feynman-check")
async def feynman_check(
    body: FeynmanCheckRequest,
    user: User = Depends(get_current_user),
):
    """
    Compares a student's spoken explanation to the correct answer.
    Returns structured feedback: correct points, missing keywords, misconceptions.
    """
    from app.services.ai_service import client as ai_client
    import json

    prompt = (
        f"الإجابة الصحيحة: {body.correct_answer}\n\n"
        f"شرح الطالب: {body.transcription}\n\n"
        "قارن شرح الطالب بالإجابة الصحيحة وأرجع JSON بالشكل:\n"
        '{"correct_points": ["..."], "missing_keywords": ["..."], '
        '"misconceptions": ["..."], "encouragement": "..."}\n'
        "الرد بالعربية فقط. كن مشجعاً ولطيفاً."
    )

    try:
        response = await ai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "أنت مساعد تعليمي يقيّم فهم الطلاب بطريقة مشجعة."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            max_tokens=600,
            temperature=0.4,
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)
        return {
            "correct_points": parsed.get("correct_points", []),
            "missing_keywords": parsed.get("missing_keywords", []),
            "misconceptions": parsed.get("misconceptions", []),
            "encouragement": parsed.get("encouragement", "كمّل، إنت بتتحسن! 💪"),
        }
    except Exception:
        raise HTTPException(status_code=500, detail="فشل تقييم الإجابة، حاول تاني")
