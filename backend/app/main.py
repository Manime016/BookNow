from fastapi import FastAPI

from app.routes.auth import router as auth_router
from app.routes.venues import router as venue_router
from app.routes.events import router as event_router
from app.routes.seats import router as seat_router
from app.routes.event_seats import router as event_seat_router
from app.routes.seat_locks import router as seat_lock_router
from app.routes.bookings import router as booking_router
from app.routes.payments import router as payment_router

app = FastAPI(
    title="BookNow API",
    version="1.0.0"
)


app.include_router(auth_router)
app.include_router(venue_router)
app.include_router(event_router)
app.include_router(seat_router)
app.include_router(event_seat_router)
app.include_router(seat_lock_router)
app.include_router(booking_router)
app.include_router(payment_router)

@app.get("/")
def root():
    return {
        "message": "BookNow API is running"
    }