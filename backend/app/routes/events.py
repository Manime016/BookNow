from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.event_schema import EventCreate, EventResponse
from app.services.event_service import (
    create_event,
    get_event,
    get_all_events,
    get_events_by_venue,
    update_event,
    delete_event
)


router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


@router.post(
    "",
    response_model=EventResponse,
    status_code=201
)
def create(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    try:
        return create_event(db, event_data)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get(
    "",
    response_model=list[EventResponse]
)
def get_all(
    db: Session = Depends(get_db)
):
    return get_all_events(db)


@router.get(
    "/{event_id}",
    response_model=EventResponse
)
def get_one(
    event_id: int,
    db: Session = Depends(get_db)
):
    event = get_event(db, event_id)

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return event


@router.get(
    "/venue/{venue_id}",
    response_model=list[EventResponse]
)
def get_by_venue(
    venue_id: int,
    db: Session = Depends(get_db)
):
    return get_events_by_venue(db, venue_id)


@router.put(
    "/{event_id}",
    response_model=EventResponse
)
def update(
    event_id: int,
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    try:
        event = update_event(
            db,
            event_id,
            event_data
        )

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )

        return event

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.delete(
    "/{event_id}"
)
def delete(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    event = delete_event(db, event_id)

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return {
        "message": "Event deleted successfully"
    }