from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.event_seat_schema import (
    EventSeatCreate,
    EventSeatResponse
)
from app.services.event_seats_service import (
    create_event_seat,
    get_event_seat,
    get_event_seats,
    get_available_event_seats,
    update_event_seat_price,
    generate_event_seats
)
from app.services.event_seats_service import (
    create_event_seat,
    get_event_seat,
    get_event_seats,
    get_available_event_seats,
    update_event_seat_price
)


router = APIRouter(
    prefix="/event-seats",
    tags=["Event Seats"]
)


@router.post(
    "",
    response_model=EventSeatResponse,
    status_code=201
)
def create(
    event_seat_data: EventSeatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    try:
        return create_event_seat(
            db,
            event_seat_data
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get(
    "/event/{event_id}",
    response_model=list[EventSeatResponse]
)
def get_by_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    return get_event_seats(
        db,
        event_id
    )


@router.get(
    "/event/{event_id}/available",
    response_model=list[EventSeatResponse]
)
def get_available(
    event_id: int,
    db: Session = Depends(get_db)
):
    return get_available_event_seats(
        db,
        event_id
    )


@router.get(
    "/{event_seat_id}",
    response_model=EventSeatResponse
)
def get_one(
    event_seat_id: int,
    db: Session = Depends(get_db)
):
    event_seat = get_event_seat(
        db,
        event_seat_id
    )

    if not event_seat:
        raise HTTPException(
            status_code=404,
            detail="Event seat not found"
        )

    return event_seat


@router.put(
    "/{event_seat_id}/price",
    response_model=EventSeatResponse
)
def update_price(
    event_seat_id: int,
    price: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    event_seat = update_event_seat_price(
        db,
        event_seat_id,
        price
    )

    if not event_seat:
        raise HTTPException(
            status_code=404,
            detail="Event seat not found"
        )

    return event_seat

@router.post(
    "/event/{event_id}/generate"
)

def generate(
    event_id: int,
    price: float | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    try:
        created_count = generate_event_seats(
            db,
            event_id,
            price
        )

        return {
            "message": "Event seats generated successfully",
            "created_count": created_count
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
