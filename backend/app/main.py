from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.db import initialize_database
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

@app.on_event("startup")
def initialise_database_on_startup():
    initialize_database()

# Configure CORS for the deployed frontend and local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://book-now-sandy.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(venue_router, prefix="/api")
app.include_router(event_router, prefix="/api")
app.include_router(seat_router, prefix="/api")
app.include_router(event_seat_router, prefix="/api")
app.include_router(seat_lock_router, prefix="/api")
app.include_router(booking_router, prefix="/api")
app.include_router(payment_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "BookNow API is running"
    }
