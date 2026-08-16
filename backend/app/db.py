import os
import pymysql
from pymysql.err import OperationalError

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
            try:
                cursor.execute(statement)
            except OperationalError as error:
                # MySQL versions used locally do not all support CREATE INDEX
                # IF NOT EXISTS. Re-running startup must not fail merely
                # because the schema's named indexes are already present.
                if error.args[0] != 1061:
                    raise

    # Keep databases created by earlier versions compatible with the current
    # booking/payment models.  CREATE TABLE IF NOT EXISTS does not alter them.
    cursor.execute("ALTER TABLE bookings MODIFY booking_status ENUM('PENDING_PAYMENT','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT'")
    cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=%s AND TABLE_NAME='payments' AND COLUMN_NAME='razorpay_order_id'", (settings.MYSQL_DATABASE,))
    if cursor.fetchone()[0] == 0:
        cursor.execute("ALTER TABLE payments ADD COLUMN razorpay_order_id VARCHAR(255) UNIQUE NULL")
    cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=%s AND TABLE_NAME='payments' AND COLUMN_NAME='razorpay_payment_id'", (settings.MYSQL_DATABASE,))
    if cursor.fetchone()[0] == 0:
        cursor.execute("ALTER TABLE payments ADD COLUMN razorpay_payment_id VARCHAR(255) UNIQUE NULL")

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
