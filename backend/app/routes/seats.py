from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.seat_schema import SeatCreate, SeatResponse
from app.services.seats_service import (
    create_seat,
    get_seat,
    get_all_seats,
    get_seats_by_venue,
    update_seat,
    delete_seat
)


router = APIRouter(
    prefix="/seats",
    tags=["Seats"]
)


@router.post(
    "",
    response_model=SeatResponse,
    status_code=201
)
def create(
    seat_data: SeatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    try:
        return create_seat(db, seat_data)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get(
    "",
    response_model=list[SeatResponse]
)
def get_all(
    db: Session = Depends(get_db)
):
    return get_all_seats(db)


@router.get(
    "/venue/{venue_id}",
    response_model=list[SeatResponse]
)
def get_by_venue(
    venue_id: int,
    db: Session = Depends(get_db)
):
    return get_seats_by_venue(db, venue_id)


@router.get(
    "/{seat_id}",
    response_model=SeatResponse
)
def get_one(
    seat_id: int,
    db: Session = Depends(get_db)
):
    seat = get_seat(db, seat_id)

    if not seat:
        raise HTTPException(
            status_code=404,
            detail="Seat not found"
        )

    return seat


@router.put(
    "/{seat_id}",
    response_model=SeatResponse
)
def update(
    seat_id: int,
    seat_data: SeatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    try:
        seat = update_seat(
            db,
            seat_id,
            seat_data
        )

        if not seat:
            raise HTTPException(
                status_code=404,
                detail="Seat not found"
            )

        return seat

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.delete(
    "/{seat_id}"
)
def delete(
    seat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    seat = delete_seat(db, seat_id)

    if not seat:
        raise HTTPException(
            status_code=404,
            detail="Seat not found"
        )

    return {
        "message": "Seat deleted successfully"
    }