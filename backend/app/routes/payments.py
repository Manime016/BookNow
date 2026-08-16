from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.payment_schema import (
    PaymentOrderCreate,
    PaymentVerify,
    PaymentResponse
)
from app.services.payments_service import (
    create_razorpay_order,
    verify_razorpay_payment,
    get_payment,
    get_payments_by_booking
)


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/order")
def create_order(
    payment_data: PaymentOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return create_razorpay_order(
            db,
            payment_data.booking_id,
            current_user.id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.post("/verify")
def verify_payment(
    payment_data: PaymentVerify,
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return verify_razorpay_payment(
            db,
            booking_id,
            current_user.id,
            payment_data.razorpay_order_id,
            payment_data.razorpay_payment_id,
            payment_data.razorpay_signature
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get(
    "/{payment_id}",
    response_model=PaymentResponse
)
def get_one(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment = get_payment(
        db,
        payment_id
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    if current_user.role != "admin":
        from app.models.booking import Booking

        booking = (
            db.query(Booking)
            .filter(Booking.id == payment.booking_id)
            .first()
        )

        if not booking or booking.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You cannot access this payment"
            )

    return payment

@router.get(
    "/booking/{booking_id}",
    response_model=list[PaymentResponse]
)
def get_by_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.booking import Booking

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if (
        booking.user_id != current_user.id
        and current_user.role != "admin"
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot access these payments"
        )

    return get_payments_by_booking(
        db,
        booking_id
    )