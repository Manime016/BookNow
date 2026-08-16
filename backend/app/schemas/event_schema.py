from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


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
    # SQLAlchemy reserves ``metadata`` on declarative models, so the model
    # exposes the database column as ``event_metadata``. Map it back to the
    # public API field here.
    metadata: dict[str, Any] | None = Field(validation_alias="event_metadata")

    class Config:
        from_attributes = True
