from datetime import datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.event_seat import EventSeat
from app.models.seat_lock import SeatLock
from app.models.payment import Payment
from app.models.user import User
from app.services.payments_service import refund_payment


def create_booking(db: Session, event_seat_id: int, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    event_seat = db.query(EventSeat).filter(EventSeat.id == event_seat_id).with_for_update().first()
    if not event_seat:
        raise ValueError("Event seat not found")

    if event_seat.status != "reserved":
        raise ValueError("Seat is not reserved")

    seat_lock = (
        db.query(SeatLock)
        .filter(SeatLock.event_seat_id == event_seat_id, SeatLock.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not seat_lock:
        raise ValueError("You do not have a lock on this seat")

    if seat_lock.expires_at <= datetime.utcnow():
        event_seat.status = "available"
        db.delete(seat_lock)
        db.commit()
        raise ValueError("Seat lock has expired")

    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.event_seat_id == event_seat_id,
            Booking.booking_status.in_(["PENDING_PAYMENT", "CONFIRMED"]),
        )
        .first()
    )
    if existing_booking:
        raise ValueError("A booking already exists for this seat")

    booking = Booking(
        user_id=user_id,
        event_seat_id=event_seat_id,
        booking_status="PENDING_PAYMENT",
    )
    db.add(booking)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("This seat is already being booked")

    db.refresh(booking)
    return booking


def get_booking(db: Session, booking_id: int):
    return db.query(Booking).filter(Booking.id == booking_id).first()


def get_user_bookings(db: Session, user_id: int):
    return (
        db.query(Booking)
        .filter(Booking.user_id == user_id)
        .order_by(Booking.created_at.desc())
        .all()
    )


def cancel_booking(db: Session, booking_id: int, user_id: int):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not booking:
        return None

    if booking.booking_status == "CANCELLED":
        raise ValueError("Booking is already cancelled")

    if booking.booking_status not in {"PENDING_PAYMENT", "CONFIRMED"}:
        raise ValueError("Booking cannot be cancelled")

    payment = (
        db.query(Payment)
        .filter(Payment.booking_id == booking.id, Payment.status == "SUCCESS")
        .order_by(Payment.created_at.desc())
        .first()
    )

    # A confirmed booking has already been paid. Never release the seat
    # unless Razorpay has successfully accepted the refund first.
    if booking.booking_status == "CONFIRMED":
        if not payment or not payment.razorpay_payment_id:
            raise ValueError("Paid booking cannot be cancelled because its payment record is missing")
        refund_payment(payment)
        payment.status = "REFUNDED"

    booking.booking_status = "CANCELLED"
    event_seat = db.query(EventSeat).filter(EventSeat.id == booking.event_seat_id).with_for_update().first()
    seat_lock = db.query(SeatLock).filter(SeatLock.event_seat_id == booking.event_seat_id).first()

    if event_seat:
        event_seat.status = "available"
    if seat_lock:
        db.delete(seat_lock)

    db.commit()
    db.refresh(booking)
    return booking


def get_all_bookings(db: Session):
    return db.query(Booking).order_by(Booking.created_at.desc()).all()
