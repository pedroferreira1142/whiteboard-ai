from pydantic_settings import BaseSettings
import os

database_url = "postgresql://my_user:my_password@db:5432/my_database"

class Settings(BaseSettings):
    DATABASE_URL: str = database_url


    class Config:
        env_file = ".env"


settings = Settings()