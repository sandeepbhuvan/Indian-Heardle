from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Indian Heardle API"
    API_V1_STR: str = "/api"
    # Default to SQLite for quick plug-and-play, override with postgresql://user:pass@localhost:5432/heardle
    DATABASE_URL: str = "sqlite:///./heardle.db"
    CORS_ORIGINS: List[str] = [
        "http://localhost:4200",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:3000",
        "*"
    ]
    # YouTube Data API Key for optional playlist curation
    YOUTUBE_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
