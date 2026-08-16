from pydantic import BaseModel


class SeatCreate(BaseModel):
    venue_id: int
    row_num: int
    col_num: int
    seat_code: str


class SeatResponse(BaseModel):
    id: int
    venue_id: int
    row_num: int
    col_num: int
    seat_code: str

    class Config:
        from_attributes = True