from sqlalchemy import (
    Column,
    BigInteger,
    Enum,
    String,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func

from app.db import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    event_seat_id = Column(
        BigInteger,
        ForeignKey("event_seats.id", ondelete="CASCADE"),
        nullable=False
    )

    booking_status = Column(
        Enum("PENDING_PAYMENT", "CONFIRMED", "CANCELLED"),
        nullable=False,
        default="PENDING_PAYMENT"
    )

    payment_intent_id = Column(
        String(255),
        nullable=True
    )

    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.current_timestamp()
    )
