from sqlalchemy.orm import Session

from app.models.event_seat import EventSeat
from app.models.event import Event
from app.models.seat import Seat
from app.schemas.event_seat_schema import EventSeatCreate
from app.services.seat_locks_service import release_expired_locks


def create_event_seat(db: Session, event_seat_data: EventSeatCreate):
    event = db.query(Event).filter(Event.id == event_seat_data.event_id).first()
    if not event:
        raise ValueError("Event not found")

    seat = db.query(Seat).filter(Seat.id == event_seat_data.seat_id).first()
    if not seat:
        raise ValueError("Seat not found")
    if seat.venue_id != event.venue_id:
        raise ValueError("Seat does not belong to event venue")

    existing = db.query(EventSeat).filter(EventSeat.event_id == event_seat_data.event_id, EventSeat.seat_id == event_seat_data.seat_id).first()
    if existing:
        raise ValueError("Event seat already exists")

    event_seat = EventSeat(event_id=event_seat_data.event_id, seat_id=event_seat_data.seat_id, price=event_seat_data.price, status="available")
    db.add(event_seat)
    db.commit()
    db.refresh(event_seat)
    return event_seat


def get_event_seat(db: Session, event_seat_id: int):
    return db.query(EventSeat).filter(EventSeat.id == event_seat_id).first()


def get_event_seats(db: Session, event_id: int):
    release_expired_locks(db)
    return (
        db.query(EventSeat)
        .filter(EventSeat.event_id == event_id)
        .join(Seat, EventSeat.seat_id == Seat.id)
        .order_by(Seat.row_num, Seat.col_num)
        .all()
    )


def get_available_event_seats(db: Session, event_id: int):
    release_expired_locks(db)
    return (
        db.query(EventSeat)
        .filter(EventSeat.event_id == event_id, EventSeat.status == "available")
        .join(Seat, EventSeat.seat_id == Seat.id)
        .order_by(Seat.row_num, Seat.col_num)
        .all()
    )


def update_event_seat_price(db: Session, event_seat_id: int, price):
    event_seat = get_event_seat(db, event_seat_id)
    if not event_seat:
        return None
    event_seat.price = price
    db.commit()
    db.refresh(event_seat)
    return event_seat


def generate_event_seats(db: Session, event_id: int, price: float | None = None):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise ValueError("Event not found")

    seats = db.query(Seat).filter(Seat.venue_id == event.venue_id).order_by(Seat.row_num, Seat.col_num).all()
    if not seats:
        raise ValueError("No seats found for event venue")

    created_count = 0
    for seat in seats:
        existing = db.query(EventSeat).filter(EventSeat.event_id == event_id, EventSeat.seat_id == seat.id).first()
        if existing:
            continue
        if price is not None:
            seat_price = price
        elif seat.row_num <= 4:
            seat_price = 120.00
        elif seat.row_num <= 8:
            seat_price = 180.00
        else:
            seat_price = 240.00
        db.add(EventSeat(event_id=event_id, seat_id=seat.id, status="available", price=seat_price))
        created_count += 1

    db.commit()
    return created_count
