# BookNow — Event Ticket Booking Platform

BookNow is a full-stack event ticket booking application with a React frontend and a FastAPI backend. The backend uses SQLAlchemy and PostgreSQL and implements authentication, event/venue management, seat allocation, temporary seat locking, bookings, and Razorpay payment processing.

## Backend Stack

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- JWT authentication
- Razorpay
- Docker
- pytest

## Core Booking Flow

```text
Browse Event
    ↓
Select Seat
    ↓
Temporary Seat Lock
    ↓
Create Pending Booking
    ↓
Create Razorpay Order
    ↓
Payment Verification
    ↓
Confirm Booking
    ↓
Mark Seat Sold
```

Seat locks expire after a fixed period. Expired locks can be released so reserved seats return to the available pool.

## Main Features

- User registration and JWT authentication
- Event and venue management
- Event-specific seat inventory
- Temporary seat locking during checkout
- Booking creation and cancellation
- Razorpay payment integration
- Payment signature and provider-side verification
- Payment amount validation
- Idempotent payment verification
- Admin booking/status management
- PostgreSQL persistence with SQLAlchemy
- Alembic database migrations
- Dockerized backend

## Project Structure

```text
BookNow/
├── backend/
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── db.py         # Database setup
│   │   └── main.py       # FastAPI application
│   ├── migrations/       # Alembic migrations
│   ├── tests/            # Automated tests
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
└── frontend/
```

## Running the Backend

```bash
cd backend
python -m venv venv
```

Windows:

```bash
.\venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file from `.env.example`, configure PostgreSQL and Razorpay credentials, then run migrations:

```bash
alembic upgrade head
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

API documentation is available at:

- `/docs`
- `/redoc`

## Testing

Run:

```bash
pytest tests/
```

## Docker

Build the backend image:

```bash
docker build -t booknow-backend ./backend
```

## Engineering Notes

The booking flow is designed around temporary seat ownership rather than immediately marking a seat as sold. A booking starts in `PENDING_PAYMENT`; the seat becomes `sold` only after successful payment verification.

Payment verification checks the Razorpay signature, provider-side order/payment records, payment capture status, and the expected amount before confirming the booking. Repeated successful callbacks are handled idempotently.

## License

See [LICENSE](LICENSE).
