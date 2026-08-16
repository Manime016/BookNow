import razorpay

from sqlalchemy.orm import Session

from config import settings
from app.models.payment import Payment
from app.models.booking import Booking
from app.models.event_seat import EventSeat
from app.models.seat_lock import SeatLock


razorpay_client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET
    )
)


def create_razorpay_order(
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
        raise ValueError("Booking not found")

    if booking.booking_status != "PENDING_PAYMENT":
        raise ValueError(
            "Booking is not pending payment"
        )

    event_seat = (
        db.query(EventSeat)
        .filter(
            EventSeat.id == booking.event_seat_id
        )
        .first()
    )

    if not event_seat:
        raise ValueError("Event seat not found")

    seat_lock = (
        db.query(SeatLock)
        .filter(
            SeatLock.event_seat_id == event_seat.id,
            SeatLock.user_id == user_id
        )
        .first()
    )

    if not seat_lock:
        raise ValueError(
            "You do not have a valid seat lock"
        )

    amount = event_seat.price

    razorpay_order = razorpay_client.order.create({
        "amount": int(amount * 100),
        "currency": "INR",
        "receipt": f"booking_{booking.id}",
        "notes": {
            "booking_id": str(booking.id),
            "user_id": str(user_id),
            "event_seat_id": str(event_seat.id)
        }
    })

    payment = Payment(
        booking_id=booking.id,
        payment_method="RAZORPAY",
        razorpay_order_id=razorpay_order["id"],
        amount=amount,
        status="CREATED"
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "payment_id": payment.id,
        "booking_id": booking.id,
        "razorpay_order_id": razorpay_order["id"],
        "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        "amount": amount,
        "currency": "INR"
    }


def verify_razorpay_payment(
    db: Session,
    booking_id: int,
    user_id: int,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
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
        raise ValueError("Booking not found")

    if booking.booking_status != "PENDING_PAYMENT":
        raise ValueError(
            "Booking is not pending payment"
        )

    payment = (
        db.query(Payment)
        .filter(
            Payment.booking_id == booking.id,
            Payment.razorpay_order_id == razorpay_order_id
        )
        .first()
    )

    if not payment:
        raise ValueError("Payment order not found")

    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        payment.status = "FAILED"
        db.commit()

        raise ValueError(
            "Payment signature verification failed"
        )

    event_seat = (
        db.query(EventSeat)
        .filter(
            EventSeat.id == booking.event_seat_id
        )
        .first()
    )

    if not event_seat:
        raise ValueError("Event seat not found")

    seat_lock = (
        db.query(SeatLock)
        .filter(
            SeatLock.event_seat_id == event_seat.id,
            SeatLock.user_id == user_id
        )
        .first()
    )

    if not seat_lock:
        raise ValueError(
            "Seat lock no longer exists"
        )

    payment.razorpay_payment_id = razorpay_payment_id
    payment.transaction_id = razorpay_payment_id
    payment.status = "SUCCESS"

    booking.booking_status = "CONFIRMED"

    event_seat.status = "sold"

    db.delete(seat_lock)

    db.commit()
    db.refresh(payment)
    db.refresh(booking)

    return {
        "message": "Payment verified successfully",
        "booking_id": booking.id,
        "payment_id": payment.id,
        "booking_status": booking.booking_status,
        "event_seat_status": event_seat.status
    }


def get_payment(
    db: Session,
    payment_id: int
):
    return (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )


def get_payments_by_booking(
    db: Session,
    booking_id: int
):
    return (
        db.query(Payment)
        .filter(Payment.booking_id == booking_id)
        .order_by(Payment.created_at.desc())
        .all()
    )