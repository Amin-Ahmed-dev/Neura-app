from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/neura_db"

    # AI
    OPENAI_API_KEY: str = ""

    # Firebase Admin
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"

    # Security
    JWT_SECRET: str = "change-me-in-production-use-a-long-random-string"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage (S3 / Cloudflare R2)
    S3_BUCKET_NAME: str = "neura-materials"
    S3_ENDPOINT_URL: str = ""  # leave empty for AWS, set for R2
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"

    # Messaging
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"
    SENDGRID_API_KEY: str = ""

    # Paymob (Egyptian payment gateway)
    PAYMOB_API_KEY: str = ""
    PAYMOB_INTEGRATION_ID: str = ""
    PAYMOB_IFRAME_ID: str = ""
    PAYMOB_HMAC_SECRET: str = ""

    # App
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
