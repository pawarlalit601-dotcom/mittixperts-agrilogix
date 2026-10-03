from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AgriLogix API"
    app_env: str = "development"
    database_url: str = "sqlite:///./agrilogix.db"
    jwt_secret_key: SecretStr
    jwt_access_token_minutes: int = 43200
    cors_origins: str = "http://localhost:3000"
    google_client_id: str = ""
    gemini_api_key: SecretStr = SecretStr("")
    gemini_model: str = "gemini-3.1-flash-lite"
    produce_scan_max_bytes: int = 10 * 1024 * 1024
    kyc_encryption_key: SecretStr = SecretStr("")
    kyc_storage_dir: str = ".private/kyc"
    kyc_upload_max_bytes: int = 10 * 1024 * 1024

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def secure_cookies(self) -> bool:
        return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()