import json

from sqlalchemy.orm import Session

from app.models.venue import Venue
from app.models.seat import Seat
from app.schemas.venue_schema import VenueCreate


def _normalize_layout(layout, total_rows, total_cols):
    if not layout:
        return None

    rows = layout.get("rows", [])
    if not isinstance(rows, list) or len(rows) != total_rows:
        raise ValueError("Layout must contain exactly one row configuration per venue row")

    normalized_rows = []
    for index, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            raise ValueError("Each row configuration must be an object")
        offset = float(row.get("offset", 0))
        price = float(row.get("price", 0))
        if offset < -total_cols or offset > total_cols:
            raise ValueError("Row offset is outside the allowed range")
        if price < 0 or price > 1000000:
            raise ValueError("Seat price is outside the allowed range")
        normalized_rows.append({"row": index, "offset": offset, "price": price})

    return {
        "screen": bool(layout.get("screen", True)),
        "rows": normalized_rows,
        "seat_gap": max(0.25, min(float(layout.get("seat_gap", 1)), 3)),
    }


def create_venue(db: Session, venue_data: VenueCreate):
    layout = _normalize_layout(venue_data.layout, venue_data.total_rows, venue_data.total_cols)
    venue = Venue(
        name=venue_data.name,
        address=venue_data.address,
        total_rows=venue_data.total_rows,
        total_cols=venue_data.total_cols,
        layout_json=json.dumps(layout) if layout else None,
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
    return db.query(Venue).filter(Venue.id == venue_id).first()


def get_all_venues(db: Session):
    return db.query(Venue).all()


def update_venue(db: Session, venue_id: int, venue_data: VenueCreate):
    venue = get_venue(db, venue_id)
    if not venue:
        return None

    layout = _normalize_layout(venue_data.layout, venue.total_rows, venue.total_cols)
    venue.name = venue_data.name
    venue.address = venue_data.address
    if layout is not None:
        venue.layout_json = json.dumps(layout)

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
