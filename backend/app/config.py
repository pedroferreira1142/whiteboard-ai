from pydantic_settings import BaseSettings
import os

database_url = os.environ.get("DATABASE_URL")

class Settings(BaseSettings):
    DATABASE_URL: str = database_url


    class Config:
        env_file = ".env"


settings = Settings()