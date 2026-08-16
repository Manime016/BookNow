from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.event_seat import EventSeat
from app.models.seat_lock import SeatLock
from app.models.user import User
from app.schemas.booking_schema import BookingCreate


from datetime import datetime, timezone


def create_booking(
    db: Session,
    event_seat_id: int,
    user_id: int
):
    # Check user
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise ValueError("User not found")

    # Get event seat
    event_seat = (
        db.query(EventSeat)
        .filter(EventSeat.id == event_seat_id)
        .first()
    )

    if not event_seat:
        raise ValueError("Event seat not found")

    # Seat must currently be reserved
    if event_seat.status != "reserved":
        raise ValueError("Seat is not reserved")

    # Check user's lock
    seat_lock = (
        db.query(SeatLock)
        .filter(
            SeatLock.event_seat_id == event_seat_id,
            SeatLock.user_id == user_id
        )
        .first()
    )

    if not seat_lock:
        raise ValueError(
            "You do not have a lock on this seat"
        )

    # Check whether lock has expired
    if seat_lock.expires_at <= datetime.now(timezone.utc):
        event_seat.status = "available"

        db.delete(seat_lock)
        db.commit()

        raise ValueError("Seat lock has expired")

    # Check whether an active booking already exists
    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.event_seat_id == event_seat_id,
            Booking.booking_status.in_([
                "PENDING_PAYMENT",
                "CONFIRMED"
            ])
        )
        .first()
    )

    if existing_booking:
        raise ValueError(
            "A booking already exists for this seat"
        )

    # Create pending booking
    booking = Booking(
        user_id=user_id,
        event_seat_id=event_seat_id,
        booking_status="PENDING_PAYMENT"
    )

    # IMPORTANT:
    # Keep the seat reserved.
    # Do NOT mark it as sold yet.
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

def get_booking(
    db: Session,
    booking_id: int
):
    return (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )


def get_user_bookings(
    db: Session,
    user_id: int
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == user_id)
        .order_by(Booking.created_at.desc())
        .all()
    )


def cancel_booking(
    db: Session,
    booking_id: int,
    user_id: int
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.user_id == user_id
        )
        .first()
    )

    if not booking:
        return None

    if booking.booking_status == "CANCELLED":
        raise ValueError("Booking is already cancelled")

    booking.booking_status = "CANCELLED"

    event_seat = (
        db.query(EventSeat)
        .filter(EventSeat.id == booking.event_seat_id)
        .first()
    )

    if event_seat:
        event_seat.status = "available"

    db.commit()
    db.refresh(booking)

    return booking