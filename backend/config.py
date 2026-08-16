from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str
    MYSQL_DATABASE: str = "booknow"
    SECRET_KEY: str
    
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()