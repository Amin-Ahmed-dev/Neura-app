from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.config import settings
from app.routers import auth, ai, materials, study, tasks, gamification, notifications, users, flashcards, health, parent, subscriptions, creators

scheduler = AsyncIOScheduler(timezone="Africa/Cairo")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    from app.services.auth_service import init_firebase
    from app.services.cron_jobs import (
        job_daily_study_reminder,
        job_streak_at_risk,
        job_flashcard_due_reminder,
        job_weekly_parent_report,
        job_subscription_renewal_check,
    )
    init_firebase()

    scheduler.add_job(job_daily_study_reminder,       CronTrigger(hour=19, minute=0))
    scheduler.add_job(job_streak_at_risk,             CronTrigger(hour=21, minute=0))
    scheduler.add_job(job_flashcard_due_reminder,     CronTrigger(hour=10, minute=0))
    scheduler.add_job(job_weekly_parent_report,       CronTrigger(day_of_week="sun", hour=9, minute=0))
    scheduler.add_job(job_subscription_renewal_check, CronTrigger(hour=2, minute=0))
    scheduler.start()

    yield

    scheduler.shutdown(wait=False)


app = FastAPI(
    title="Neura API",
    version="1.0.0",
    description="AI Study Companion for Egyptian Students",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,          prefix="/api/v1/auth",          tags=["auth"])
app.include_router(users.router,         prefix="/api/v1/users",         tags=["users"])
app.include_router(ai.router,            prefix="/api/v1/ai",            tags=["ai"])
app.include_router(materials.router,     prefix="/api/v1/materials",     tags=["materials"])
app.include_router(study.router,         prefix="/api/v1/study",         tags=["study"])
app.include_router(tasks.router,         prefix="/api/v1/tasks",         tags=["tasks"])
app.include_router(gamification.router,  prefix="/api/v1/gamification",  tags=["gamification"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(flashcards.router,    prefix="/api/v1/flashcards",    tags=["flashcards"])
app.include_router(health.router,          prefix="/api/v1/health",          tags=["health-sleep"])
app.include_router(parent.router,          prefix="/api/v1/parent",          tags=["parental"])
app.include_router(subscriptions.router,   prefix="/api/v1/subscriptions",   tags=["subscriptions"])
app.include_router(creators.router,        prefix="/api/v1/creators",         tags=["creators"])


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "Neura API", "version": "1.0.0"}
