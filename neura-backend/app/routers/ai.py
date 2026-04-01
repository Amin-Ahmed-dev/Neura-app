"""
AI Router — Neura chat endpoint with Socratic guardrail.
Streaming via Server-Sent Events (SSE).
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.dependencies import get_current_user, require_pro
from app.models.user import User
from app.models.chat import ChatMessage
from app.services.ai_service import chat_stream, chat_complete
import uuid

router = APIRouter()

# Free tier: max messages per day
FREE_DAILY_LIMIT = 20


# ── Schemas ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    subject: Optional[str] = None
    stream: bool = True
    is_math_physics: bool = False  # T-08-04: triggers step-by-step hint mode


class FlashcardGenRequest(BaseModel):
    text: str
    count: int = 10
    subject: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _check_rate_limit(user: User, db: AsyncSession) -> None:
    """Enforces daily message limit for free users."""
    if user.is_pro:
        return

    from datetime import date
    from sqlalchemy import func, and_
    result = await db.execute(
        select(func.count(ChatMessage.id)).where(
            and_(
                ChatMessage.user_id == user.id,
                ChatMessage.role == "user",
                func.date(ChatMessage.created_at) == date.today(),
            )
        )
    )
    count = result.scalar() or 0
    if count >= FREE_DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"وصلت للحد اليومي ({FREE_DAILY_LIMIT} رسالة). اشترك في Pro عشان تبعت أكتر 🚀",
        )


async def _get_history(user_id: uuid.UUID, db: AsyncSession, limit: int = 20) -> list[dict]:
    """Fetches the last N messages for context."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = result.scalars().all()
    return [{"role": m.role, "content": m.content} for m in reversed(messages)]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/chat")
async def chat(
    body: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Main chat endpoint. Supports streaming (SSE) and non-streaming.
    Socratic guardrail is enforced in ai_service.chat_stream().
    """
    await _check_rate_limit(user, db)

    # Save user message
    user_msg = ChatMessage(
        id=uuid.uuid4(),
        user_id=user.id,
        role="user",
        content=body.message,
        subject=body.subject,
    )
    db.add(user_msg)
    await db.flush()

    # Build history (includes the message we just saved)
    history = await _get_history(user.id, db)

    if body.stream:
        async def event_stream():
            full_response = ""
            async for token in chat_stream(history, body.subject, body.is_math_physics):
                full_response += token
                yield f"data: {token}\n\n"

            # Save assistant response after streaming completes
            async with db.begin_nested():
                db.add(ChatMessage(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    role="assistant",
                    content=full_response,
                    subject=body.subject,
                ))

            yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )
    else:
        response_text = await chat_complete(history, body.subject, body.is_math_physics)
        db.add(ChatMessage(
            id=uuid.uuid4(),
            user_id=user.id,
            role="assistant",
            content=response_text,
            subject=body.subject,
        ))
        await db.flush()
        return {"response": response_text}


@router.get("/history")
async def get_chat_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns the last 50 chat messages. Chat is private — only the student can access it."""
    # T-15-04: Structural enforcement — this endpoint only returns data for the
    # authenticated user. Parent-linked accounts have no access to student chat.
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.asc())
        .limit(50)
    )
    messages = result.scalars().all()
    return {
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "subject": m.subject,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    }


@router.delete("/history")
async def clear_chat_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clears all chat history for the user."""
    from sqlalchemy import delete
    await db.execute(delete(ChatMessage).where(ChatMessage.user_id == user.id))
    await db.flush()
    return {"status": "cleared"}


@router.post("/generate-flashcards")
async def generate_flashcards(
    body: FlashcardGenRequest,
    user: User = Depends(get_current_user),
):
    """Generates flashcards from a text chunk using AI."""
    from app.services.ai_service import generate_flashcards as gen_fc
    cards = await gen_fc(body.text, body.count)
    return {"flashcards": cards}


# ── Everest Method — Big Goal Breakdown ───────────────────────────────────────

class EverestRequest(BaseModel):
    goal: str
    subject: str = "عام"
    target_date: Optional[str] = None  # ISO date string


@router.post("/everest")
async def everest_breakdown(
    body: EverestRequest,
    user: User = Depends(get_current_user),
):
    """
    T-06-07: Breaks a big goal into weekly micro-tasks using GPT-4o-mini.
    Returns array of { week, tasks: [{ title, estimated_minutes }] }
    """
    from app.services.ai_service import chat_complete

    prompt = f"""أنت مساعد تخطيط دراسي للطلاب المصريين.
الهدف: {body.goal}
المادة: {body.subject}
{"التاريخ المستهدف: " + body.target_date if body.target_date else ""}

قسّم هذا الهدف إلى مهام أسبوعية صغيرة وقابلة للتنفيذ.
أجب بـ JSON فقط بهذا الشكل:
{{
  "weeks": [
    {{
      "week": 1,
      "focus": "عنوان الأسبوع",
      "tasks": [
        {{"title": "اسم المهمة", "estimated_minutes": 30}},
        ...
      ]
    }},
    ...
  ]
}}
لا تضيف أي نص خارج الـ JSON. المهام بالعامية المصرية."""

    import json as _json
    try:
        raw = await chat_complete([{"role": "user", "content": prompt}], subject=body.subject)
        # Strip markdown code fences if present
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = _json.loads(clean)
        return data
    except Exception:
        # Fallback: return a simple 4-week plan
        return {
            "weeks": [
                {"week": i, "focus": f"الأسبوع {i}", "tasks": [
                    {"title": f"مراجعة {body.subject} — الجزء {i}", "estimated_minutes": 45}
                ]}
                for i in range(1, 5)
            ]
        }


# ── Voice Recall (Whisper transcription) ──────────────────────────────────────

@router.post("/voice-recall")
async def voice_recall(
    audio: UploadFile = File(...),
    context: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
):
    """
    Accepts an audio file, transcribes it via Whisper (Arabic),
    and returns the transcription text.
    """
    from app.services.ai_service import transcribe_audio

    audio_bytes = await audio.read()
    if len(audio_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="الملف كبير أوي. الحد الأقصى 10 ميجا.")

    transcription = await transcribe_audio(audio_bytes, audio.filename or "audio.m4a")
    return {"transcription": transcription, "context": context}


# ── TTS (Text-to-Speech) — Pro feature ───────────────────────────────────────

class TTSRequest(BaseModel):
    text: str


@router.post("/tts")
async def text_to_speech(
    body: TTSRequest,
    user: User = Depends(require_pro),
):
    """Converts Neura's text response to speech (Pro users only). Returns mp3 audio bytes."""

    if len(body.text) > 1000:
        raise HTTPException(status_code=400, detail="النص طويل أوي للتحويل للصوت.")

    from app.services.ai_service import synthesize_speech

    audio_bytes = await synthesize_speech(body.text)
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=neura_response.mp3"},
    )
