from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.event import Event
from app.models.payment import Payment
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_events = db.query(func.count(Event.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0

    total_revenue = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.status == "SUCCESS")
        .scalar()
        or Decimal("0")
    )

    upcoming_events = (
        db.query(func.count(Event.id))
        .filter(Event.start_time >= now)
        .scalar()
        or 0
    )

    pending_bookings = (
        db.query(func.count(Booking.id))
        .filter(Booking.booking_status == "PENDING_PAYMENT")
        .scalar()
        or 0
    )

    new_users_this_month = (
        db.query(func.count(User.id))
        .filter(User.created_at >= month_start)
        .scalar()
        or 0
    )

    revenue_this_month = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            Payment.status == "SUCCESS",
            Payment.created_at >= month_start,
        )
        .scalar()
        or Decimal("0")
    )

    # These are intentionally calculated from current database records rather
    # than hard-coded percentages. With no historical period comparison yet,
    # the API returns null for trends instead of inventing a number.
    return {
        "totalEvents": int(total_events),
        "totalBookings": int(total_bookings),
        "totalUsers": int(total_users),
        "totalRevenue": float(total_revenue),
        "upcomingEvents": int(upcoming_events),
        "pendingBookings": int(pending_bookings),
        "newUsersThisMonth": int(new_users_this_month),
        "revenueThisMonth": float(revenue_this_month),
        "bookingTrend": None,
        "revenueTrend": None,
        "generatedAt": now.isoformat(),
    }
