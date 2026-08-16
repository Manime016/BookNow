from sqlalchemy import (
    Column,
    BigInteger,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func

from app.db import Base


class SeatLock(Base):
    __tablename__ = "seat_locks"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    event_seat_id = Column(
        BigInteger,
        ForeignKey("event_seats.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    locked_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.current_timestamp()
    )

    expires_at = Column(
        TIMESTAMP,
        nullable=False
    )