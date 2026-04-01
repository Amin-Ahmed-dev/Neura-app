"""
Material Service — PDF processing pipeline for Neura.
Handles: upload → hash check → semantic chunking → subject detection → flashcard generation → cache.
"""
import hashlib
import json
import uuid
from typing import BinaryIO
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.material import Material, MaterialChunk, MaterialCache, ProcessingStatus
from app.models.flashcard import Deck, Flashcard
from app.services.ai_service import generate_flashcards, client as ai_client


async def compute_file_hash(file: BinaryIO) -> str:
    """Computes SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    for chunk in iter(lambda: file.read(8192), b""):
        sha256.update(chunk)
    file.seek(0)
    return sha256.hexdigest()


async def check_cache(file_hash: str, db: AsyncSession) -> MaterialCache | None:
    """Returns cached processing result if this file was seen before."""
    result = await db.execute(
        select(MaterialCache).where(MaterialCache.file_hash == file_hash)
    )
    return result.scalar_one_or_none()


async def extract_raw_text(file: BinaryIO) -> tuple[str, int]:
    """
    Extracts raw text from a PDF. Returns (full_text, page_count).
    """
    try:
        from pypdf import PdfReader
        reader = PdfReader(file)
        pages_text = []
        for page in reader.pages:
            pages_text.append(page.extract_text() or "")
        return "\n\n".join(pages_text), len(reader.pages)
    except Exception as e:
        return f"[خطأ في استخراج النص: {e}]", 0


async def semantic_chunk_text(text: str, title: str) -> list[dict]:
    """
    Uses GPT-4o-mini to split text into semantic study chunks.
    Falls back to fixed-size chunking if AI fails.
    """
    # Truncate to avoid token limits (~12k chars ≈ 3k tokens)
    truncated = text[:12000]

    try:
        response = await ai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "أنت مساعد تعليمي متخصص في تقسيم المحتوى الدراسي.",
                },
                {
                    "role": "user",
                    "content": (
                        "قسّم هذا النص إلى أجزاء دراسية منطقية بناءً على المعنى والموضوع.\n"
                        "لكل جزء: عنوان واضح بالعربية + المحتوى.\n"
                        "أرجع JSON فقط بالشكل: "
                        '[{"title": "...", "content": "..."}]\n\n'
                        f"النص:\n{truncated}"
                    ),
                },
            ],
            response_format={"type": "json_object"},
            max_tokens=2000,
            temperature=0.3,
        )
        raw = response.choices[0].message.content or "[]"
        parsed = json.loads(raw)
        # Handle both {"chunks": [...]} and direct array
        chunks_list = parsed if isinstance(parsed, list) else parsed.get("chunks", parsed.get("parts", []))
        if chunks_list:
            return [
                {"title": c.get("title", f"{title} — جزء {i+1}"), "content": c.get("content", ""), "order_index": i}
                for i, c in enumerate(chunks_list)
            ]
    except Exception:
        pass

    # Fallback: fixed-size chunking
    CHUNK_SIZE = 1500
    chunks = []
    idx = 0
    while idx * CHUNK_SIZE < len(text):
        chunk_text = text[idx * CHUNK_SIZE: (idx + 1) * CHUNK_SIZE].strip()
        if chunk_text:
            chunks.append({"title": f"{title} — جزء {idx + 1}", "content": chunk_text, "order_index": idx})
        idx += 1
    return chunks or [{"title": title, "content": text[:1500], "order_index": 0}]


MATH_PHYSICS_SUBJECTS = {"رياضيات", "فيزياء"}


async def detect_chunk_subject(chunk_title: str, chunk_preview: str) -> tuple[str, bool]:
    """
    Classifies a chunk's subject using GPT-4o-mini.
    Returns (subject_label, is_math_physics).
    """
    try:
        response = await ai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"ما هو موضوع هذا النص؟ أجب بكلمة واحدة فقط من: "
                        "رياضيات / فيزياء / كيمياء / أحياء / تاريخ / جغرافيا / لغة عربية / أخرى\n\n"
                        f"العنوان: {chunk_title}\n"
                        f"المحتوى: {chunk_preview[:200]}"
                    ),
                }
            ],
            max_tokens=10,
            temperature=0,
        )
        subject = (response.choices[0].message.content or "أخرى").strip()
        is_math_physics = subject in MATH_PHYSICS_SUBJECTS
        return subject, is_math_physics
    except Exception:
        return "أخرى", False


async def process_material(
    material: Material,
    file: BinaryIO,
    db: AsyncSession,
    generate_cards: bool = True,
    is_image: bool = False,
) -> Material:
    """
    Full processing pipeline:
    1. Check cache by file hash
    2. Extract text + semantic chunking
    3. Subject detection per chunk (T-08-04)
    4. Save chunks to DB
    5. Generate flashcards
    6. Cache results
    """
    material.processing_status = ProcessingStatus.CHUNKING
    await db.flush()

    # 1. Check cache
    cached = await check_cache(material.file_hash, db)
    if cached:
        chunks_data = json.loads(cached.chunks_json)
        flashcards_data = json.loads(cached.flashcards_json)
        material.processing_status = ProcessingStatus.CACHED
    else:
        # 2. Extract text
        if is_image:
            # Images go through OCR endpoint separately; treat as single chunk
            chunks_data = [{"title": material.title, "content": "[صورة — يرجى استخدام OCR أولاً]", "order_index": 0}]
            page_count = 1
        else:
            raw_text, page_count = await extract_raw_text(file)
            material.page_count = page_count
            # Semantic chunking via GPT-4o-mini
            chunks_data = await semantic_chunk_text(raw_text, material.title)

        # 3. Subject detection for each chunk (T-08-04)
        for chunk in chunks_data:
            subject, is_mp = await detect_chunk_subject(
                chunk.get("title", ""), chunk.get("content", "")
            )
            chunk["subject"] = subject
            chunk["is_math_physics"] = is_mp

        # 4. Generate flashcards from first 3 chunks
        flashcards_data = []
        if generate_cards and chunks_data:
            combined_text = "\n\n".join(c["content"] for c in chunks_data[:3])
            flashcards_data = await generate_flashcards(combined_text, count=15)

        # 6. Cache results
        db.add(MaterialCache(
            file_hash=material.file_hash,
            chunks_json=json.dumps(chunks_data, ensure_ascii=False),
            flashcards_json=json.dumps(flashcards_data, ensure_ascii=False),
        ))

    # Save chunks to DB
    for chunk_data in chunks_data:
        db.add(MaterialChunk(
            id=uuid.uuid4(),
            material_id=material.id,
            title=chunk_data["title"],
            content=chunk_data["content"],
            order_index=chunk_data["order_index"],
            subject=chunk_data.get("subject"),
            is_math_physics=chunk_data.get("is_math_physics", False),
        ))

    # Create deck + flashcards
    if flashcards_data:
        deck = Deck(
            id=uuid.uuid4(),
            user_id=material.user_id,
            material_id=material.id,
            title=f"بطاقات: {material.title}",
            subject=material.subject,
        )
        db.add(deck)
        await db.flush()

        for card_data in flashcards_data:
            if card_data.get("question") and card_data.get("answer"):
                from datetime import date, timedelta
                db.add(Flashcard(
                    id=uuid.uuid4(),
                    user_id=material.user_id,
                    deck_id=deck.id,
                    question=card_data["question"],
                    answer=card_data["answer"],
                    next_review_date=date.today() + timedelta(days=1),
                ))

    material.processing_status = ProcessingStatus.COMPLETE
    await db.flush()

    # T-11-05: Send push notification that material is ready
    try:
        from app.services.cron_jobs import send_material_ready_notification
        import asyncio
        asyncio.create_task(
            send_material_ready_notification(str(material.user_id), str(material.id), material.title)
        )
    except Exception:
        pass

    return material
