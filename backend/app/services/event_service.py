from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.venue import Venue
from app.models.event_seat import EventSeat
from app.schemas.event_schema import EventCreate


def create_event(db: Session, event_data: EventCreate):
    venue = (
        db.query(Venue)
        .filter(Venue.id == event_data.venue_id)
        .first()
    )

    if not venue:
        raise ValueError("Venue not found")

    event = Event(
        venue_id=event_data.venue_id,
        title=event_data.title,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        event_metadata=event_data.metadata
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def get_event(db: Session, event_id: int):
    return (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )


def get_all_events(db: Session):
    return db.query(Event).all()


def get_events_by_venue(db: Session, venue_id: int):
    return (
        db.query(Event)
        .filter(Event.venue_id == venue_id)
        .all()
    )


def update_event(
    db: Session,
    event_id: int,
    event_data: EventCreate
):
    event = get_event(db, event_id)

    if not event:
        return None

    venue = (
        db.query(Venue)
        .filter(Venue.id == event_data.venue_id)
        .first()
    )

    if not venue:
        raise ValueError("Venue not found")

    event.venue_id = event_data.venue_id
    event.title = event_data.title
    event.start_time = event_data.start_time
    event.end_time = event_data.end_time
    event.event_metadata = event_data.metadata

    # Keep the amount shown by the admin form in sync with seats that already
    # exist for this event. New events receive their seats separately.
    if event_data.metadata and event_data.metadata.get("price") is not None:
        db.query(EventSeat).filter(EventSeat.event_id == event_id).update(
            {EventSeat.price: event_data.metadata["price"]},
            synchronize_session=False
        )

    db.commit()
    db.refresh(event)

    return event


def delete_event(db: Session, event_id: int):
    event = get_event(db, event_id)

    if not event:
        return None

    db.delete(event)
    db.commit()

    return event
