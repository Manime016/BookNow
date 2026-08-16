from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    String,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func

from app.db import Base


class Seat(Base):
    __tablename__ = "seats"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    venue_id = Column(
        BigInteger,
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False
    )

    row_num = Column(Integer, nullable=False)

    col_num = Column(Integer, nullable=False)

    seat_code = Column(String(16), nullable=False)

    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.current_timestamp()
    )