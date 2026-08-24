from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.db import initialize_database, SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password
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

    # Temporary production bootstrap: ensure the known admin credentials
    # exist in the deployed database. Remove this block after the first
    # successful admin login and keep admin creation as an explicit operation.
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@booknow.com").first()
        password_hash = hash_password("Admin@123")

        if admin:
            admin.password_hash = password_hash
            admin.role = "admin"
        else:
            db.add(
                User(
                    email="admin@booknow.com",
                    password_hash=password_hash,
                    role="admin"
                )
            )

        db.commit()
        print("Admin account bootstrapped successfully.")
    finally:
        db.close()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins like ["https://yourdomain.com"]
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
