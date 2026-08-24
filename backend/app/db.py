import os
import ssl
import pymysql
from pymysql.err import OperationalError

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings


def _ssl_kwargs():
    """Return PyMySQL TLS settings when a CA certificate is configured."""
    if not settings.MYSQL_SSL_CA:
        return {}
    return {
        "ssl": {
            "ca": settings.MYSQL_SSL_CA,
            "cert_reqs": ssl.CERT_REQUIRED,
            "check_hostname": True,
        }
    }


def _add_column_if_missing(cursor, table_name, column_name, definition):
    cursor.execute(
        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS "
        "WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s AND COLUMN_NAME=%s",
        (settings.MYSQL_DATABASE, table_name, column_name),
    )
    if cursor.fetchone()[0] == 0:
        cursor.execute(f"ALTER TABLE `{table_name}` ADD COLUMN `{column_name}` {definition}")


def _replace_unique_index_with_non_unique(cursor, table_name, unique_index_name, replacement_index_name, column_name):
    """Replace a unique index without temporarily removing the FK-supporting index."""
    cursor.execute(
        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS "
        "WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s AND INDEX_NAME=%s",
        (settings.MYSQL_DATABASE, table_name, unique_index_name),
    )
    if cursor.fetchone()[0] == 0:
        return

    cursor.execute(
        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS "
        "WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s AND INDEX_NAME=%s",
        (settings.MYSQL_DATABASE, table_name, replacement_index_name),
    )
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            f"ALTER TABLE `{table_name}` ADD INDEX `{replacement_index_name}` (`{column_name}`)"
        )

    cursor.execute(f"ALTER TABLE `{table_name}` DROP INDEX `{unique_index_name}`")


def initialize_database():
    connection = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        **_ssl_kwargs(),
    )
    cursor = connection.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.MYSQL_DATABASE}`")
    cursor.close()
    connection.close()

    connection = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE,
        **_ssl_kwargs(),
    )
    cursor = connection.cursor()

    schema_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../db/schema.sql"))
    with open(schema_path, "r", encoding="utf-8") as file:
        sql = file.read()

    for statement in sql.split(";"):
        statement = statement.strip()
        if statement:
            try:
                cursor.execute(statement)
            except OperationalError as error:
                if error.args[0] != 1061:
                    raise

    _add_column_if_missing(cursor, "users", "full_name", "VARCHAR(255) NULL")
    _add_column_if_missing(cursor, "users", "phone", "VARCHAR(30) NULL")
    _add_column_if_missing(cursor, "venues", "layout_json", "TEXT NULL")

    cursor.execute("ALTER TABLE bookings MODIFY booking_status ENUM('PENDING_PAYMENT','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT'")

    # MySQL may use the old unique index to satisfy the bookings -> event_seats
    # foreign key. Add a replacement non-unique index first, then remove the
    # uniqueness constraint so a cancelled seat can be booked again.
    _replace_unique_index_with_non_unique(
        cursor,
        "bookings",
        "uq_booking_eventseat",
        "idx_bookings_event_seat",
        "event_seat_id",
    )

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


DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=settings.MYSQL_USER,
    password=settings.MYSQL_PASSWORD,
    host=settings.MYSQL_HOST,
    port=settings.MYSQL_PORT,
    database=settings.MYSQL_DATABASE,
)

engine_kwargs = {"echo": True}
if settings.MYSQL_SSL_CA:
    engine_kwargs["connect_args"] = _ssl_kwargs()

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    initialize_database()
