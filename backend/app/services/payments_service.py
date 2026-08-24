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
    from datetime import datetime, timezone

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
        raise ValueError("Booking is not pending payment")

    event_seat = (
        db.query(EventSeat)
        .filter(EventSeat.id == booking.event_seat_id)
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
        raise ValueError("You do not have a valid seat lock")

    if seat_lock.expires_at <= datetime.now(timezone.utc):
        event_seat.status = "available"
        db.delete(seat_lock)
        db.commit()
        raise ValueError("Seat lock has expired")

    amount = float(event_seat.price)
    if amount <= 0:
        raise ValueError("Invalid seat price")

    # Reuse an existing provider order when the client retries before payment.
    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.booking_id == booking.id,
            Payment.status == "CREATED"
        )
        .order_by(Payment.created_at.desc())
        .first()
    )

    if existing_payment:
        return {
            "payment_id": existing_payment.id,
            "booking_id": booking.id,
            "razorpay_order_id": existing_payment.razorpay_order_id,
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "amount": amount,
            "currency": "INR"
        }

    razorpay_order = razorpay_client.order.create({
        "amount": int(round(amount * 100)),
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
    from datetime import datetime, timezone

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

    # Make verification idempotent. A repeated browser callback should not
    # create a second booking state transition.
    if payment.status == "SUCCESS":
        if payment.razorpay_payment_id != razorpay_payment_id:
            raise ValueError("Payment does not match the recorded transaction")
        return {
            "message": "Payment already verified",
            "booking_id": booking.id,
            "payment_id": payment.id,
            "booking_status": booking.booking_status,
            "event_seat_status": "sold"
        }

    if booking.booking_status != "PENDING_PAYMENT":
        raise ValueError("Booking is not pending payment")

    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        payment.status = "FAILED"
        db.commit()
        raise ValueError("Payment signature verification failed")

    try:
        razorpay_order = razorpay_client.order.fetch(razorpay_order_id)
        razorpay_payment = razorpay_client.payment.fetch(razorpay_payment_id)
    except Exception:
        raise ValueError("Unable to verify payment with Razorpay")

    if str(razorpay_order.get("id")) != str(razorpay_order_id):
        raise ValueError("Invalid Razorpay order")

    if str(razorpay_payment.get("order_id")) != str(razorpay_order_id):
        raise ValueError("Payment does not belong to this Razorpay order")

    if razorpay_payment.get("status") != "captured":
        payment.status = "FAILED"
        db.commit()
        raise ValueError("Payment has not been captured")

    expected_amount = int(round(float(payment.amount) * 100))
    if int(razorpay_order.get("amount", 0)) != expected_amount:
        payment.status = "FAILED"
        db.commit()
        raise ValueError("Razorpay order amount does not match booking amount")

    if int(razorpay_payment.get("amount", 0)) != expected_amount:
        payment.status = "FAILED"
        db.commit()
        raise ValueError("Captured payment amount does not match booking amount")

    event_seat = (
        db.query(EventSeat)
        .filter(EventSeat.id == booking.event_seat_id)
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
        # Do not turn a paid booking into SOLD unless the seat was still
        # reserved by this user. Manual reconciliation/refund is required.
        raise ValueError("Seat lock no longer exists; payment requires reconciliation")

    if seat_lock.expires_at <= datetime.now(timezone.utc):
        raise ValueError("Seat lock has expired; payment requires reconciliation")

    if event_seat.status != "reserved":
        raise ValueError("Seat is no longer reserved")

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


def get_payment(db: Session, payment_id: int):
    return db.query(Payment).filter(Payment.id == payment_id).first()


def get_payments_by_booking(db: Session, booking_id: int):
    return (
        db.query(Payment)
        .filter(Payment.booking_id == booking_id)
        .order_by(Payment.created_at.desc())
        .all()
    )
