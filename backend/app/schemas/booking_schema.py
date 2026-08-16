from pydantic import BaseModel


class BookingCreate(BaseModel):
    event_seat_id: int


class BookingResponse(BaseModel):
    id: int
    user_id: int
    event_seat_id: int
    booking_status: str
    payment_intent_id: str | None = None

    class Config:
        from_attributes = True