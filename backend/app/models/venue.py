from sqlalchemy import Column, BigInteger, String, Text, Integer, TIMESTAMP
from sqlalchemy.sql import func

from app.db import Base


class Venue(Base):
    __tablename__ = "venues"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    total_rows = Column(Integer, nullable=False)
    total_cols = Column(Integer, nullable=False)
    created_at = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.current_timestamp()
    )