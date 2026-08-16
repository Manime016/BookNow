from sqlalchemy.orm import Session

from app.models.venue import Venue
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