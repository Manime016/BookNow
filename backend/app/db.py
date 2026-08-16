import os
import pymysql

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings


def initialize_database():

    connection = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD
    )

    cursor = connection.cursor()

    cursor.execute(
        f"CREATE DATABASE IF NOT EXISTS `{settings.MYSQL_DATABASE}`"
    )

    cursor.close()
    connection.close()

    connection = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE
    )

    cursor = connection.cursor()

    schema_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "../../db/schema.sql"
        )
    )

    with open(schema_path, "r", encoding="utf-8") as file:
        sql = file.read()

    statements = sql.split(";")

    for statement in statements:
        statement = statement.strip()

        if statement:
            cursor.execute(statement)

    connection.commit()

    cursor.close()
    connection.close()

    print("Database initialized successfully.")


# SQLAlchemy connection
DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=settings.MYSQL_USER,
    password=settings.MYSQL_PASSWORD,
    host=settings.MYSQL_HOST,
    port=settings.MYSQL_PORT,
    database=settings.MYSQL_DATABASE,
)


engine = create_engine(
    DATABASE_URL,
    echo=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# Database session for API routes/services
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    initialize_database()