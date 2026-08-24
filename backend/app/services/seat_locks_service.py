from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.seat_lock import SeatLock
from app.models.event_seat import EventSeat


LOCK_DURATION_MINUTES = 10


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_seat_lock(db: Session, event_seat_id: int, user_id: int):
    now = _now()

    event_seat = (
        db.query(EventSeat)
        .filter(EventSeat.id == event_seat_id)
        .with_for_update()
        .first()
    )

    if not event_seat:
        raise ValueError("Event seat not found")

    existing_lock = (
        db.query(SeatLock)
        .filter(SeatLock.event_seat_id == event_seat_id)
        .with_for_update()
        .first()
    )

    if existing_lock:
        if existing_lock.expires_at > now:
            db.rollback()
            raise ValueError("Seat is already locked")

        db.delete(existing_lock)
        db.flush()

    if event_seat.status != "available":
        db.rollback()
        raise ValueError("Seat is not available")

    expires_at = now + timedelta(minutes=LOCK_DURATION_MINUTES)
    seat_lock = SeatLock(
        event_seat_id=event_seat_id,
        user_id=user_id,
        expires_at=expires_at,
    )

    event_seat.status = "reserved"
    db.add(seat_lock)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Seat is already locked")

    db.refresh(seat_lock)
    return seat_lock


def get_seat_lock(db: Session, event_seat_id: int):
    return (
        db.query(SeatLock)
        .filter(SeatLock.event_seat_id == event_seat_id)
        .first()
    )


def delete_seat_lock(db: Session, event_seat_id: int):
    seat_lock = get_seat_lock(db, event_seat_id)

    if not seat_lock:
        return None

    event_seat = (
        db.query(EventSeat)
        .filter(EventSeat.id == event_seat_id)
        .with_for_update()
        .first()
    )

    if event_seat and event_seat.status == "reserved":
        event_seat.status = "available"

    db.delete(seat_lock)
    db.commit()
    return seat_lock


def release_expired_locks(db: Session):
    now = _now()

    expired_locks = (
        db.query(SeatLock)
        .filter(SeatLock.expires_at <= now)
        .with_for_update()
        .all()
    )

    released_count = 0

    for lock in expired_locks:
        event_seat = (
            db.query(EventSeat)
            .filter(EventSeat.id == lock.event_seat_id)
            .with_for_update()
            .first()
        )

        if event_seat and event_seat.status == "reserved":
            event_seat.status = "available"

        db.delete(lock)
        released_count += 1

    db.commit()
    return released_count
