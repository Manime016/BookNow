from decimal import Decimal

from pydantic import BaseModel


class PaymentOrderCreate(BaseModel):
    booking_id: int


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    payment_method: str | None
    razorpay_order_id: str | None
    razorpay_payment_id: str | None
    transaction_id: str | None
    amount: Decimal
    status: str | None

    class Config:
        from_attributes = True