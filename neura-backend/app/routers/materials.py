"""
Materials Router — PDF upload, processing, and retrieval.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.material import Material, MaterialChunk, MaterialCache, ProcessingStatus
from app.services.material_service import compute_file_hash, process_material
import uuid
import io

router = APIRouter()

MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


class RenameRequest(BaseModel):
    title: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_material(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: str = Form("عام"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Uploads a PDF or image material. Processing happens in the background.
    Returns immediately with material ID and PENDING status.
    """
    filename = file.filename or ""
    is_pdf = filename.lower().endswith(".pdf")
    is_image = file.content_type in ALLOWED_IMAGE_TYPES or filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))

    if not is_pdf and not is_image:
        raise HTTPException(status_code=400, detail="يرجى رفع ملف PDF أو صورة (jpg/png/webp) فقط")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"حجم الملف أكبر من {MAX_FILE_SIZE_MB}MB",
        )

    file_obj = io.BytesIO(content)
    file_hash = await compute_file_hash(file_obj)

    # Check cache first (T-08-02)
    cached = await db.execute(
        select(MaterialCache).where(MaterialCache.file_hash == file_hash)
    )
    cache_hit = cached.scalar_one_or_none()

    # Check if user already uploaded this exact file
    existing = await db.execute(
        select(Material).where(
            and_(Material.user_id == user.id, Material.file_hash == file_hash)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="رفعت الملف ده قبل كده بالفعل")

    material = Material(
        id=uuid.uuid4(),
        user_id=user.id,
        title=title,
        file_hash=file_hash,
        subject=subject,
        processing_status=ProcessingStatus.CACHED if cache_hit else ProcessingStatus.PENDING,
    )
    db.add(material)
    await db.flush()

    if cache_hit:
        # Instant result from cache
        background_tasks.add_task(_apply_cache_in_background, material.id, cache_hit.file_hash)
        return {
            "material_id": str(material.id),
            "status": "cached",
            "instant": True,
            "message": "تم التحميل فوراً ✨",
        }

    # Process in background
    material_id = material.id
    background_tasks.add_task(_process_in_background, material_id, content, subject, is_image)

    return {
        "material_id": str(material.id),
        "status": ProcessingStatus.PENDING.value,
        "message": "جاري معالجة الملف، هيبقى جاهز خلال دقيقة 📄",
    }


async def _apply_cache_in_background(material_id: uuid.UUID, file_hash: str):
    """Apply cached chunks/flashcards to a newly created material."""
    import json
    from app.database import AsyncSessionLocal
    from app.models.flashcard import Deck, Flashcard
    from datetime import date, timedelta

    async with AsyncSessionLocal() as db:
        try:
            mat_result = await db.execute(select(Material).where(Material.id == material_id))
            material = mat_result.scalar_one_or_none()
            if not material:
                return

            cache_result = await db.execute(
                select(MaterialCache).where(MaterialCache.file_hash == file_hash)
            )
            cached = cache_result.scalar_one_or_none()
            if not cached:
                return

            chunks_data = json.loads(cached.chunks_json)
            flashcards_data = json.loads(cached.flashcards_json)

            for chunk_data in chunks_data:
                db.add(MaterialChunk(
                    id=uuid.uuid4(),
                    material_id=material.id,
                    title=chunk_data.get("title", ""),
                    content=chunk_data.get("content", ""),
                    order_index=chunk_data.get("order_index", 0),
                    subject=chunk_data.get("subject"),
                    is_math_physics=chunk_data.get("is_math_physics", False),
                ))

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
                for card in flashcards_data:
                    if card.get("question") and card.get("answer"):
                        db.add(Flashcard(
                            id=uuid.uuid4(),
                            user_id=material.user_id,
                            deck_id=deck.id,
                            question=card["question"],
                            answer=card["answer"],
                            next_review_date=date.today() + timedelta(days=1),
                        ))

            material.processing_status = ProcessingStatus.COMPLETE
            await db.commit()
        except Exception:
            await db.rollback()


async def _process_in_background(material_id: uuid.UUID, content: bytes, subject: str, is_image: bool = False):
    """Background task: runs the full processing pipeline."""
    from app.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Material).where(Material.id == material_id))
            material = result.scalar_one_or_none()
            if not material:
                return
            file_obj = io.BytesIO(content)
            await process_material(material, file_obj, db, is_image=is_image)
            await db.commit()
        except Exception as e:
            await db.rollback()
            async with AsyncSessionLocal() as db2:
                result = await db2.execute(select(Material).where(Material.id == material_id))
                mat = result.scalar_one_or_none()
                if mat:
                    mat.processing_status = ProcessingStatus.FAILED
                    await db2.commit()


@router.get("/")
async def list_materials(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns all materials for the user."""
    result = await db.execute(
        select(Material)
        .where(Material.user_id == user.id)
        .order_by(Material.created_at.desc())
    )
    materials = result.scalars().all()
    return {
        "materials": [
            {
                "id": str(m.id),
                "title": m.title,
                "subject": m.subject,
                "page_count": m.page_count,
                "processing_status": m.processing_status.value,
                "created_at": m.created_at.isoformat(),
            }
            for m in materials
        ]
    }


@router.get("/{material_id}")
async def get_material(
    material_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns a material with its chunks."""
    result = await db.execute(
        select(Material).where(
            and_(Material.id == uuid.UUID(material_id), Material.user_id == user.id)
        )
    )
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="المادة مش موجودة")

    chunks_result = await db.execute(
        select(MaterialChunk)
        .where(MaterialChunk.material_id == material.id)
        .order_by(MaterialChunk.order_index)
    )
    chunks = chunks_result.scalars().all()

    return {
        "id": str(material.id),
        "title": material.title,
        "subject": material.subject,
        "page_count": material.page_count,
        "processing_status": material.processing_status.value,
        "created_at": material.created_at.isoformat(),
        "chunks": [
            {"id": str(c.id), "title": c.title, "content": c.content, "order_index": c.order_index}
            for c in chunks
        ],
    }


@router.delete("/{material_id}")
async def delete_material(
    material_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deletes a material and all its chunks."""
    result = await db.execute(
        select(Material).where(
            and_(Material.id == uuid.UUID(material_id), Material.user_id == user.id)
        )
    )
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="المادة مش موجودة")

    await db.delete(material)
    await db.flush()
    return {"status": "deleted"}


@router.patch("/{material_id}")
async def rename_material(
    material_id: str,
    body: RenameRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Renames a material."""
    result = await db.execute(
        select(Material).where(
            and_(Material.id == uuid.UUID(material_id), Material.user_id == user.id)
        )
    )
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="المادة مش موجودة")

    material.title = body.title.strip()
    await db.flush()
    return {"status": "updated", "title": material.title}


@router.post("/ocr")
async def ocr_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """
    Extracts text from a handwritten image using Google Cloud Vision OCR.
    Returns extracted text and confidence score.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="يرجى رفع صورة (jpg/png/webp) فقط")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"حجم الصورة أكبر من {MAX_FILE_SIZE_MB}MB")

    try:
        from google.cloud import vision
        import base64

        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=content)
        response = client.document_text_detection(image=image)

        if response.error.message:
            raise HTTPException(status_code=500, detail="فشل في قراءة الصورة، حاول تاني")

        full_text = response.full_text_annotation.text or ""
        # Compute average confidence from pages
        confidence = 0.0
        pages = response.full_text_annotation.pages
        if pages:
            all_confs = [
                word.confidence
                for page in pages
                for block in page.blocks
                for para in block.paragraphs
                for word in para.words
                if word.confidence > 0
            ]
            confidence = sum(all_confs) / len(all_confs) if all_confs else 0.0

        return {"extracted_text": full_text, "confidence": round(confidence, 2)}

    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="خدمة OCR مش متاحة دلوقتي، حاول تاني بعدين",
        )


# ── Admin endpoints ────────────────────────────────────────────────────────────

class CacheMaterialRequest(BaseModel):
    file_hash: str
    chunks: list[dict]
    flashcards: list[dict]


@router.post("/admin/cache-material")
async def admin_cache_material(
    body: CacheMaterialRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Admin endpoint: manually add a textbook to the cache.
    Used for seeding Egyptian ministry textbooks.
    """
    import json

    existing = await db.execute(
        select(MaterialCache).where(MaterialCache.file_hash == body.file_hash)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="الملف ده موجود في الكاش بالفعل")

    db.add(MaterialCache(
        file_hash=body.file_hash,
        chunks_json=json.dumps(body.chunks, ensure_ascii=False),
        flashcards_json=json.dumps(body.flashcards, ensure_ascii=False),
    ))
    await db.flush()
    return {"status": "cached", "file_hash": body.file_hash}


# ── Concept Map (Pro) ──────────────────────────────────────────────────────────

@router.post("/{material_id}/concept-map")
async def get_concept_map(
    material_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates a concept map from a material's chunks (Pro users only).
    Returns nodes and edges for a force-directed graph.
    """
    if not user.is_pro:
        raise HTTPException(
            status_code=403,
            detail="خريطة المفاهيم متاحة لمشتركي Pro فقط ⚡",
        )

    result = await db.execute(
        select(Material).where(
            and_(Material.id == uuid.UUID(material_id), Material.user_id == user.id)
        )
    )
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="المادة مش موجودة")

    chunks_result = await db.execute(
        select(MaterialChunk)
        .where(MaterialChunk.material_id == material.id)
        .order_by(MaterialChunk.order_index)
    )
    chunks = chunks_result.scalars().all()
    if not chunks:
        raise HTTPException(status_code=422, detail="المادة لسه بتتعالج")

    import json
    from app.services.ai_service import client as ai_client

    summaries = "\n".join(
        f"- {c.title}: {c.content[:150]}" for c in chunks[:20]
    )

    try:
        response = await ai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "أنت مساعد تعليمي متخصص في إنشاء خرائط المفاهيم."},
                {
                    "role": "user",
                    "content": (
                        "اصنع خريطة مفاهيم تربط هذه الموضوعات الدراسية.\n"
                        'أرجع JSON فقط: {"nodes": [{"id": "...", "label": "..."}], '
                        '"edges": [{"source": "...", "target": "...", "label": "..."}]}\n\n'
                        f"الموضوعات:\n{summaries}"
                    ),
                },
            ],
            response_format={"type": "json_object"},
            max_tokens=1000,
            temperature=0.3,
        )
        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)
        return {
            "material_id": material_id,
            "nodes": parsed.get("nodes", []),
            "edges": parsed.get("edges", []),
        }
    except Exception:
        raise HTTPException(status_code=500, detail="فشل إنشاء خريطة المفاهيم")
