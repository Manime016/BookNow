from pydantic import BaseModel, Field
from typing import Any


class VenueCreate(BaseModel):
    name: str
    address: str | None = None
    total_rows: int = Field(ge=1, le=100)
    total_cols: int = Field(ge=1, le=100)
    layout: dict[str, Any] | None = None


class VenueResponse(BaseModel):
    id: int
    name: str
    address: str | None
    total_rows: int
    total_cols: int
    layout: dict[str, Any] | None = None

    class Config:
        from_attributes = True
