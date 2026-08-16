from sqlalchemy import (
    Column,
    BigInteger,
    String,
    DECIMAL,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func

from app.db import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    booking_id = Column(
        BigInteger,
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False
    )

    payment_method = Column(
        String(64),
        nullable=True
    )

    razorpay_order_id = Column(
        String(255),
        nullable=True,
        unique=True
    )

    razorpay_payment_id = Column(
        String(255),
        nullable=True,
        unique=True
    )

    transaction_id = Column(
        String(255),
        nullable=True
    )

    amount = Column(
        DECIMAL(10, 2),
        nullable=False,
        default=0.00
    )

    status = Column(
        String(64),
        nullable=True
    )

    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.current_timestamp()
    )