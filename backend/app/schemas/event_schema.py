from datetime import datetime
from typing import Any

from pydantic import BaseModel


class EventCreate(BaseModel):
    venue_id: int
    title: str
    start_time: datetime
    end_time: datetime | None = None
    metadata: dict[str, Any] | None = None


class EventResponse(BaseModel):
    id: int
    venue_id: int
    title: str
    start_time: datetime
    end_time: datetime | None
    metadata: dict[str, Any] | None

    class Config:
        from_attributes = True