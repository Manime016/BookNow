from sqlalchemy import (
    Column,
    BigInteger,
    Enum,
    DECIMAL,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func

from app.db import Base


class EventSeat(Base):
    __tablename__ = "event_seats"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    event_id = Column(
        BigInteger,
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False
    )

    seat_id = Column(
        BigInteger,
        ForeignKey("seats.id", ondelete="CASCADE"),
        nullable=False
    )

    status = Column(
        Enum("available", "reserved", "sold"),
        nullable=False,
        default="available"
    )

    price = Column(
        DECIMAL(10, 2),
        nullable=False,
        default=0.00
    )

    version = Column(
        BigInteger,
        nullable=False,
        default=0
    )

    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.current_timestamp()
    )

    updated_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )