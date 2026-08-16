from decimal import Decimal

from pydantic import BaseModel


class EventSeatCreate(BaseModel):
    event_id: int
    seat_id: int
    price: Decimal


class EventSeatResponse(BaseModel):
    id: int
    event_id: int
    seat_id: int
    status: str
    price: Decimal

    class Config:
        from_attributes = True