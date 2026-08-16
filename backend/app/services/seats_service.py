from sqlalchemy.orm import Session

from app.models.seat import Seat
from app.models.venue import Venue
from app.schemas.seat_schema import SeatCreate


def create_seat(db: Session, seat_data: SeatCreate):
    venue = (
        db.query(Venue)
        .filter(Venue.id == seat_data.venue_id)
        .first()
    )

    if not venue:
        raise ValueError("Venue not found")

    existing_seat = (
        db.query(Seat)
        .filter(
            Seat.venue_id == seat_data.venue_id,
            Seat.seat_code == seat_data.seat_code
        )
        .first()
    )

    if existing_seat:
        raise ValueError("Seat already exists")

    seat = Seat(
        venue_id=seat_data.venue_id,
        row_num=seat_data.row_num,
        col_num=seat_data.col_num,
        seat_code=seat_data.seat_code
    )

    db.add(seat)
    db.commit()
    db.refresh(seat)

    return seat


def get_seat(db: Session, seat_id: int):
    return (
        db.query(Seat)
        .filter(Seat.id == seat_id)
        .first()
    )


def get_all_seats(db: Session):
    return db.query(Seat).all()


def get_seats_by_venue(db: Session, venue_id: int):
    return (
        db.query(Seat)
        .filter(Seat.venue_id == venue_id)
        .order_by(Seat.row_num, Seat.col_num)
        .all()
    )


def update_seat(
    db: Session,
    seat_id: int,
    seat_data: SeatCreate
):
    seat = get_seat(db, seat_id)

    if not seat:
        return None

    venue = (
        db.query(Venue)
        .filter(Venue.id == seat_data.venue_id)
        .first()
    )

    if not venue:
        raise ValueError("Venue not found")

    seat.venue_id = seat_data.venue_id
    seat.row_num = seat_data.row_num
    seat.col_num = seat_data.col_num
    seat.seat_code = seat_data.seat_code

    db.commit()
    db.refresh(seat)

    return seat


def delete_seat(db: Session, seat_id: int):
    seat = get_seat(db, seat_id)

    if not seat:
        return None

    db.delete(seat)
    db.commit()

    return seat