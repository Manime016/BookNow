from pydantic import BaseModel


class VenueCreate(BaseModel):
    name: str
    address: str | None = None
    total_rows: int
    total_cols: int


class VenueResponse(BaseModel):
    id: int
    name: str
    address: str | None
    total_rows: int
    total_cols: int

    class Config:
        from_attributes = True