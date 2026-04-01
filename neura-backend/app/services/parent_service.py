"""
Parent notification service — sends verification messages and weekly reports.
Uses Twilio for WhatsApp, SendGrid for email.
"""
import logging
from app.config import settings

logger = logging.getLogger(__name__)

APP_BASE_URL = "https://neura.app"  # update with real domain


async def send_verification_message(
    contact: str,
    contact_type: str,
    student_name: str,
    token: str,
) -> None:
    """Send parent verification link via WhatsApp or email."""
    verify_url = f"{APP_BASE_URL}/parent/verify/{token}"
    message = (
        f"ابنك/بنتك {student_name} بيربطك بتطبيق نيورا للمذاكرة. "
        f"وافق على الربط: {verify_url}"
    )

    if contact_type == "whatsapp":
        await _send_whatsapp(contact, message)
    else:
        await _send_email(contact, "طلب ربط حساب نيورا", message)


async def send_weekly_report(
    contact: str,
    contact_type: str,
    student_name: str,
    total_focused_hours: float,
    streak_days: int,
    neurons_earned: int,
    money_saved: int,
) -> None:
    """Send weekly saver report to parent."""
    report = (
        f"تقرير نيورا الأسبوعي لـ {student_name} 📊\n\n"
        f"⏱️ ساعات التركيز: {total_focused_hours:.1f} ساعة\n"
        f"🔥 السلسلة: {streak_days} يوم\n"
        f"⚡ النيورونز المكتسبة: {neurons_earned}\n"
        f"💰 المال اللي وفرته: ~{money_saved} جنيه (مقارنة بالدروس الخصوصية)\n\n"
        f"نيورا بيساعد {student_name} يذاكر بشكل منتظم ومستقل 💪"
    )

    if contact_type == "whatsapp":
        await _send_whatsapp(contact, report)
    else:
        await _send_email(contact, f"تقرير نيورا الأسبوعي — {student_name}", report)


async def _send_whatsapp(to: str, message: str) -> None:
    """Send WhatsApp message via Twilio."""
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning("[ParentService] Twilio not configured — skipping WhatsApp send")
        return

    try:
        from twilio.rest import Client  # type: ignore
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        # Normalize number
        to_number = to if to.startswith("+") else f"+{to}"
        client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{to_number}",
            body=message,
        )
        logger.info("[ParentService] WhatsApp sent to %s", to_number[:6] + "****")
    except ImportError:
        logger.error("[ParentService] twilio package not installed")
    except Exception as exc:
        logger.error("[ParentService] WhatsApp send failed: %s", exc)
        raise


async def _send_email(to: str, subject: str, body: str) -> None:
    """Send email via SendGrid."""
    sendgrid_key = getattr(settings, "SENDGRID_API_KEY", "")
    if not sendgrid_key:
        logger.warning("[ParentService] SendGrid not configured — skipping email send")
        return

    try:
        import httpx
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {sendgrid_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to}]}],
                    "from": {"email": "noreply@neura.app", "name": "نيورا"},
                    "subject": subject,
                    "content": [{"type": "text/plain", "value": body}],
                },
            )
            resp.raise_for_status()
            logger.info("[ParentService] Email sent to %s", to[:4] + "****")
    except Exception as exc:
        logger.error("[ParentService] Email send failed: %s", exc)
        raise
