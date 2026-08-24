from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.booking_schema import BookingCreate, BookingResponse
from app.services.bookings_service import (
    create_booking,
    get_booking,
    get_user_bookings,
    get_all_bookings,
    cancel_booking,
)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


@router.get("", response_model=list[BookingResponse])
def get_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all bookings")
    return get_all_bookings(db)


@router.post("", response_model=BookingResponse, status_code=201)
def create(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_booking(db, booking_data.event_seat_id, current_user.id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/my", response_model=list[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_bookings(db, current_user.id)


@router.get("/{booking_id}", response_model=BookingResponse)
def get_one(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You cannot access this booking")
    return booking


@router.delete("/{booking_id}")
def cancel(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        booking = cancel_booking(db, booking_id, current_user.id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {"message": "Booking cancelled successfully"}
