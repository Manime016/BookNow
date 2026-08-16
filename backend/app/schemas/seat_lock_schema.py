from datetime import datetime

from pydantic import BaseModel


class SeatLockCreate(BaseModel):
    event_seat_id: int


class SeatLockResponse(BaseModel):
    id: int
    event_seat_id: int
    user_id: int
    locked_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True