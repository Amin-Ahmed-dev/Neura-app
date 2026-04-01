import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import HTTPException
from app.config import settings


def init_firebase() -> None:
    """Initialize Firebase Admin SDK (idempotent)."""
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)


async def verify_firebase_token(id_token: str) -> dict:
    """
    Verifies a Firebase ID token and returns the decoded claims.
    Raises HTTP 401 on any failure.
    """
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired. Please log in again.")
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
