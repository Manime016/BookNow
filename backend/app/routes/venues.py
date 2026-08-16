from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.venue_schema import VenueCreate, VenueResponse
from app.services.venue_service import (
    create_venue,
    get_venue,
    get_all_venues,
    update_venue,
    delete_venue
)


router = APIRouter(
    prefix="/venues",
    tags=["Venues"]
)


@router.post(
    "",
    response_model=VenueResponse,
    status_code=201
)
def create(
    venue_data: VenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return create_venue(db, venue_data)


@router.get(
    "",
    response_model=list[VenueResponse]
)
def get_all(
    db: Session = Depends(get_db)
):
    return get_all_venues(db)


@router.get(
    "/{venue_id}",
    response_model=VenueResponse
)
def get_one(
    venue_id: int,
    db: Session = Depends(get_db)
):
    venue = get_venue(db, venue_id)

    if not venue:
        raise HTTPException(
            status_code=404,
            detail="Venue not found"
        )

    return venue


@router.put(
    "/{venue_id}",
    response_model=VenueResponse
)
def update(
    venue_id: int,
    venue_data: VenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    venue = update_venue(
        db,
        venue_id,
        venue_data
    )

    if not venue:
        raise HTTPException(
            status_code=404,
            detail="Venue not found"
        )

    return venue


@router.delete(
    "/{venue_id}"
)
def delete(
    venue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    venue = delete_venue(db, venue_id)

    if not venue:
        raise HTTPException(
            status_code=404,
            detail="Venue not found"
        )

    return {
        "message": "Venue deleted successfully"
    }