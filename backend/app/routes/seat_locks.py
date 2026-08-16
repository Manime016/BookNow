from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.seat_lock_schema import (
    SeatLockCreate,
    SeatLockResponse
)
from app.services.seat_locks_service import (
    create_seat_lock,
    get_seat_lock,
    delete_seat_lock,
    release_expired_locks
)


router = APIRouter(
    prefix="/seat-locks",
    tags=["Seat Locks"]
)


@router.post(
    "",
    response_model=SeatLockResponse,
    status_code=201
)
def create(
    lock_data: SeatLockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return create_seat_lock(
            db,
            lock_data.event_seat_id,
            current_user.id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get(
    "/{event_seat_id}",
    response_model=SeatLockResponse
)
def get_one(
    event_seat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seat_lock = get_seat_lock(
        db,
        event_seat_id
    )

    if not seat_lock:
        raise HTTPException(
            status_code=404,
            detail="Seat lock not found"
        )

    return seat_lock


@router.delete(
    "/{event_seat_id}"
)
def delete(
    event_seat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seat_lock = get_seat_lock(
        db,
        event_seat_id
    )

    if not seat_lock:
        raise HTTPException(
            status_code=404,
            detail="Seat lock not found"
        )

    if seat_lock.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot release another user's seat lock"
        )

    delete_seat_lock(
        db,
        event_seat_id
    )

    return {
        "message": "Seat lock released successfully"
    }


@router.post(
    "/release-expired"
)
def release_expired(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    count = release_expired_locks(db)

    return {
        "released_count": count
    }