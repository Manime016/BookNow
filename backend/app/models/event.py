from sqlalchemy import Column, BigInteger, String, DateTime, JSON, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func

from app.db import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(BigInteger, primary_key=True, autoincrement=True)

    venue_id = Column(
        BigInteger,
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False
    )

    title = Column(String(255), nullable=False)

    start_time = Column(DateTime, nullable=False)

    end_time = Column(DateTime, nullable=True)

    event_metadata = Column("metadata", JSON, nullable=True)
    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.current_timestamp()
    )