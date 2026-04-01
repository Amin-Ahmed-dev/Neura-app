"""
T-16-01 — Plan enforcement service.
Tracks monthly usage in Redis and enforces Free plan limits.
"""
import logging
from datetime import datetime
from fastapi import HTTPException
from app.config import settings

logger = logging.getLogger(__name__)

# Free plan limits
FREE_PDF_PAGES_PER_MONTH = 50
FREE_CHAT_MESSAGES_PER_DAY = 20
FREE_FLASHCARDS_PER_MONTH = 50


def _redis_key(user_id: str, metric: str, period: str) -> str:
    return f"usage:{user_id}:{metric}:{period}"


def _month_key() -> str:
    return datetime.utcnow().strftime("%Y-%m")


def _day_key() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d")


async def _get_redis():
    """Lazy Redis connection."""
    import redis.asyncio as aioredis
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


async def check_pdf_page_limit(user_id: str, new_pages: int) -> None:
    """Raises 429 if Free user would exceed 50 PDF pages/month."""
    try:
        r = await _get_redis()
        key = _redis_key(user_id, "pdf_pages", _month_key())
        current = int(await r.get(key) or 0)
        if current + new_pages > FREE_PDF_PAGES_PER_MONTH:
            raise HTTPException(
                status_code=429,
                detail=f"وصلت للحد الشهري ({FREE_PDF_PAGES_PER_MONTH} صفحة). اشترك في Pro ⚡",
            )
        # Increment and set TTL to end of month (35 days max)
        pipe = r.pipeline()
        pipe.incrby(key, new_pages)
        pipe.expire(key, 35 * 24 * 3600)
        await pipe.execute()
        await r.aclose()
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("[PlanService] Redis unavailable, skipping limit check: %s", exc)


async def record_pdf_pages(user_id: str, pages: int) -> None:
    """Record PDF pages used (called after successful upload)."""
    try:
        r = await _get_redis()
        key = _redis_key(user_id, "pdf_pages", _month_key())
        pipe = r.pipeline()
        pipe.incrby(key, pages)
        pipe.expire(key, 35 * 24 * 3600)
        await pipe.execute()
        await r.aclose()
    except Exception as exc:
        logger.warning("[PlanService] Failed to record PDF pages: %s", exc)


async def check_chat_rate_limit(user_id: str) -> None:
    """Raises 429 if Free user exceeds 20 chat messages/day."""
    try:
        r = await _get_redis()
        key = _redis_key(user_id, "chat_messages", _day_key())
        current = int(await r.get(key) or 0)
        if current >= FREE_CHAT_MESSAGES_PER_DAY:
            raise HTTPException(
                status_code=429,
                detail=f"وصلت للحد اليومي ({FREE_CHAT_MESSAGES_PER_DAY} رسالة). اشترك في Pro ⚡",
            )
        pipe = r.pipeline()
        pipe.incr(key)
        pipe.expire(key, 25 * 3600)  # 25h TTL
        await pipe.execute()
        await r.aclose()
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("[PlanService] Redis unavailable, skipping chat limit: %s", exc)


async def check_flashcard_limit(user_id: str) -> None:
    """Raises 429 if Free user exceeds 50 flashcards/month."""
    try:
        r = await _get_redis()
        key = _redis_key(user_id, "flashcards", _month_key())
        current = int(await r.get(key) or 0)
        if current >= FREE_FLASHCARDS_PER_MONTH:
            raise HTTPException(
                status_code=429,
                detail=f"وصلت للحد الشهري ({FREE_FLASHCARDS_PER_MONTH} بطاقة). اشترك في Pro ⚡",
            )
        pipe = r.pipeline()
        pipe.incr(key)
        pipe.expire(key, 35 * 24 * 3600)
        await pipe.execute()
        await r.aclose()
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("[PlanService] Redis unavailable, skipping flashcard limit: %s", exc)


async def get_usage_stats(user_id: str) -> dict:
    """Return current month usage for display in the app."""
    try:
        r = await _get_redis()
        pdf_key = _redis_key(user_id, "pdf_pages", _month_key())
        chat_key = _redis_key(user_id, "chat_messages", _day_key())
        fc_key = _redis_key(user_id, "flashcards", _month_key())

        pdf_used, chat_used, fc_used = await r.mget(pdf_key, chat_key, fc_key)
        await r.aclose()

        return {
            "pdf_pages": {"used": int(pdf_used or 0), "limit": FREE_PDF_PAGES_PER_MONTH},
            "chat_messages": {"used": int(chat_used or 0), "limit": FREE_CHAT_MESSAGES_PER_DAY},
            "flashcards": {"used": int(fc_used or 0), "limit": FREE_FLASHCARDS_PER_MONTH},
        }
    except Exception:
        return {
            "pdf_pages": {"used": 0, "limit": FREE_PDF_PAGES_PER_MONTH},
            "chat_messages": {"used": 0, "limit": FREE_CHAT_MESSAGES_PER_DAY},
            "flashcards": {"used": 0, "limit": FREE_FLASHCARDS_PER_MONTH},
        }
