from sqlalchemy.orm import Session

from app.models.venue import Venue
from app.models.seat import Seat
from app.schemas.venue_schema import VenueCreate


def create_venue(db: Session, venue_data: VenueCreate):
    venue = Venue(
        name=venue_data.name,
        address=venue_data.address,
        total_rows=venue_data.total_rows,
        total_cols=venue_data.total_cols
    )

    db.add(venue)
    db.commit()
    db.refresh(venue)

    for row_num in range(1, venue.total_rows + 1):
        for col_num in range(1, venue.total_cols + 1):
            db.add(Seat(
                venue_id=venue.id,
                row_num=row_num,
                col_num=col_num,
                seat_code=f"{chr(64 + row_num)}{col_num}"
            ))
    db.commit()

    return venue


def get_venue(db: Session, venue_id: int):
    return (
        db.query(Venue)
        .filter(Venue.id == venue_id)
        .first()
    )


def get_all_venues(db: Session):
    return db.query(Venue).all()


def update_venue(
    db: Session,
    venue_id: int,
    venue_data: VenueCreate
):
    venue = get_venue(db, venue_id)

    if not venue:
        return None

    venue.name = venue_data.name
    venue.address = venue_data.address
    venue.total_rows = venue_data.total_rows
    venue.total_cols = venue_data.total_cols

    db.commit()
    db.refresh(venue)

    return venue


def delete_venue(db: Session, venue_id: int):
    venue = get_venue(db, venue_id)

    if not venue:
        return None

    db.delete(venue)
    db.commit()

    return venue
