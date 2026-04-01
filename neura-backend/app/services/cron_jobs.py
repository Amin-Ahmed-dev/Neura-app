"""
Background cron jobs for Neura.
Scheduled via APScheduler on app startup.
"""
import logging
import random
from datetime import date, datetime
import zoneinfo

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.flashcard import Flashcard
from app.services.notification_service import send_push, send_push_batch, _get_pref, _in_quiet_hours

logger = logging.getLogger(__name__)
CAIRO = zoneinfo.ZoneInfo("Africa/Cairo")

STUDY_REMINDER_MESSAGES = [
    ("نيورا بتستناك! 📚", "يلا نذاكر شوية؟"),
    ("السلسلة بتاعتك في خطر 🔥", "ادخل وعمل جلسة صغيرة دلوقتي"),
    ("يلا نذاكر شوية؟ 🧠", "دقيقة واحدة تفرق!"),
    ("دقيقة واحدة تفرق! ⏱️", "ابدأ جلسة صغيرة دلوقتي"),
]


async def job_daily_study_reminder() -> None:
    """Daily at 19:00 Cairo — remind users who haven't studied today."""
    today = date.today()
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(
                User.push_token.isnot(None),
                User.deleted_at.is_(None),
                (User.last_active_date < today) | User.last_active_date.is_(None),
            )
        )
        users = result.scalars().all()

        messages = []
        for user in users:
            if not _get_pref(user, "study_reminder"):
                continue
            title, body = random.choice(STUDY_REMINDER_MESSAGES)
            messages.append({
                "to": user.push_token,
                "title": title,
                "body": body,
                "sound": "default",
                "data": {"screen": "focus"},
            })

        await send_push_batch(messages)
        logger.info("Study reminder sent to %d users", len(messages))


async def job_streak_at_risk() -> None:
    """Daily at 21:00 Cairo — warn users whose streak will break tonight."""
    today = date.today()
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(
                User.push_token.isnot(None),
                User.deleted_at.is_(None),
                User.streak_count >= 2,
                (User.last_active_date < today) | User.last_active_date.is_(None),
            )
        )
        users = result.scalars().all()

        messages = []
        for user in users:
            if not _get_pref(user, "streak_alert"):
                continue
            messages.append({
                "to": user.push_token,
                "title": "سلسلتك هتنكسر في 3 ساعات! 🔥",
                "body": "عمل جلسة صغيرة دلوقتي عشان تحافظ على سلسلتك",
                "sound": "default",
                "data": {"screen": "focus", "autoStart": True},
            })

        await send_push_batch(messages)
        logger.info("Streak-at-risk alert sent to %d users", len(messages))


async def job_flashcard_due_reminder() -> None:
    """Daily at 10:00 Cairo — remind users with 5+ due flashcards."""
    today = date.today()
    async with AsyncSessionLocal() as db:
        # Count due cards per user
        result = await db.execute(
            select(Flashcard.user_id, func.count(Flashcard.id).label("due_count"))
            .where(Flashcard.next_review_date <= today)
            .group_by(Flashcard.user_id)
            .having(func.count(Flashcard.id) >= 5)
        )
        rows = result.all()

        messages = []
        for row in rows:
            user_result = await db.execute(
                select(User).where(User.id == row.user_id, User.push_token.isnot(None))
            )
            user = user_result.scalar_one_or_none()
            if not user or not _get_pref(user, "flashcard_due"):
                continue
            messages.append({
                "to": user.push_token,
                "title": f"عندك {row.due_count} كارت للمراجعة النهارده 🧠",
                "body": "راجع الفلاش كارد دلوقتي عشان ما تنساش",
                "sound": "default",
                "data": {"screen": "flashcards"},
            })

        await send_push_batch(messages)
        logger.info("Flashcard due reminder sent to %d users", len(messages))


async def send_material_ready_notification(user_id: str, material_id: str, title: str) -> None:
    """Called after material processing completes (T-08)."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.push_token:
            return
        if not _get_pref(user, "material_ready"):
            return
        await send_push(
            user.push_token,
            "موادك جاهزة! ✨",
            "الفلاش كارد اتعملت، ابدأ المراجعة دلوقتي",
            {"screen": "materials", "material_id": material_id},
        )


async def send_streak_milestone_notification(user_id: str, streak: int, neurons_awarded: int) -> None:
    """Called from streak engine after milestone is hit (T-10)."""
    milestone_msgs = {
        3:  ("3 أيام متتالية! 🔥", f"كسبت {neurons_awarded} نيورون إضافي"),
        7:  ("أسبوع كامل! 🏆", f"كسبت {neurons_awarded} نيورون إضافي"),
        30: ("شهر كامل! 🌟", "أنت بطل!"),
    }
    if streak not in milestone_msgs:
        return
    title, body = milestone_msgs[streak]
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.push_token:
            return
        await send_push(user.push_token, title, body, {"screen": "home"})


async def send_leaderboard_result_notifications(
    promoted_ids: list, demoted_ids: list, top3_ids: list
) -> None:
    """Called from leaderboard cron after weekly rank calculation (T-10)."""
    async with AsyncSessionLocal() as db:
        messages = []

        async def _add(user_id, title, body):
            r = await db.execute(select(User).where(User.id == user_id, User.push_token.isnot(None)))
            u = r.scalar_one_or_none()
            if u and _get_pref(u, "leaderboard"):
                messages.append({
                    "to": u.push_token,
                    "title": title,
                    "body": body,
                    "sound": "default",
                    "data": {"screen": "leaderboard"},
                })

        for uid in promoted_ids:
            await _add(uid, "🏆 اتترقيت للدوري الجديد!", "استمر كده وحافظ على مكانك")
        for uid in demoted_ids:
            await _add(uid, "حافظ على مكانك الأسبوع الجاي 💪", "ذاكر أكتر عشان ترجع للمراكز الأولى")
        for uid in top3_ids:
            await _add(uid, "🥇 أنت في المراكز الأولى!", "رائع، استمر كده")

        await send_push_batch(messages)


async def job_weekly_parent_report() -> None:
    """Every Sunday at 09:00 Cairo — send weekly saver report to verified parents."""
    from datetime import timedelta
    from sqlalchemy import and_
    from app.models.parent import ParentLink
    from app.models.neurons import NeuronsTransaction
    from app.services.parent_service import send_weekly_report

    week_ago = datetime.now(CAIRO).date() - timedelta(days=7)

    async with AsyncSessionLocal() as db:
        # Get all students with verified parent links that want reports
        result = await db.execute(
            select(ParentLink).where(
                and_(
                    ParentLink.verified == True,
                    ParentLink.receive_reports == True,
                )
            )
        )
        links = result.scalars().all()

        for link in links:
            try:
                student_result = await db.execute(
                    select(User).where(User.id == link.student_id, User.deleted_at.is_(None))
                )
                student = student_result.scalar_one_or_none()
                if not student:
                    continue

                # Weekly focused hours
                from app.models.study_session import StudySession
                sessions_result = await db.execute(
                    select(StudySession).where(
                        StudySession.user_id == student.id,
                        StudySession.completed == True,
                        StudySession.created_at >= datetime.combine(week_ago, datetime.min.time()),
                    )
                )
                sessions = sessions_result.scalars().all()
                total_minutes = sum(s.duration_minutes for s in sessions)
                total_hours = round(total_minutes / 60, 1)

                # Weekly neurons earned
                neurons_result = await db.execute(
                    select(func.sum(NeuronsTransaction.amount)).where(
                        NeuronsTransaction.user_id == student.id,
                        NeuronsTransaction.amount > 0,
                        NeuronsTransaction.created_at >= datetime.combine(week_ago, datetime.min.time()),
                    )
                )
                neurons_earned = neurons_result.scalar() or 0

                # Money saved: 150 EGP per hour (avg tutoring cost)
                money_saved = int(total_hours * 150)

                await send_weekly_report(
                    contact=link.parent_contact,
                    contact_type=link.contact_type,
                    student_name=student.name,
                    total_focused_hours=total_hours,
                    streak_days=student.streak_count,
                    neurons_earned=neurons_earned,
                    money_saved=money_saved,
                )
                logger.info("[WeeklyReport] Sent report for student %s", str(student.id)[:8])

            except Exception as exc:
                logger.error("[WeeklyReport] Failed for link %s: %s", str(link.id)[:8], exc)


async def job_subscription_renewal_check() -> None:
    """Daily at 02:00 Cairo — expire cancelled/ended subscriptions."""
    from app.models.subscription import Subscription

    now = datetime.now(CAIRO)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Subscription).where(
                Subscription.status.in_(["active", "cancelled"]),
                Subscription.billing_cycle_end <= now,
            )
        )
        expired_subs = result.scalars().all()

        for sub in expired_subs:
            sub.status = "expired"
            # Revoke Pro if no other active subscription
            student_result = await db.execute(
                select(User).where(User.id == sub.user_id)
            )
            user = student_result.scalar_one_or_none()
            if user:
                user.is_pro = False
            logger.info("[Renewal] Subscription expired for user %s", str(sub.user_id)[:8])

        await db.commit()
        logger.info("[Renewal] Processed %d expired subscriptions", len(expired_subs))
