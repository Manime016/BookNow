from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Local development defaults. Production should provide these through
    # deployment environment variables (for example, Aiven MySQL).
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str
    MYSQL_DATABASE: str = "defaultdb"

    # Aiven requires TLS. Set MYSQL_SSL_CA to the provider CA certificate path
    # in production. Leave it empty for local MySQL development.
    MYSQL_SSL_CA: str | None = None

    SECRET_KEY: str
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
