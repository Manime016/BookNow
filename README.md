# BookNow

Backend-focused event ticket booking platform built with **FastAPI and MySQL**, with a React client for demonstration.

The project is designed around the backend problems that matter in a booking system: authentication, event and venue management, event-specific seat inventory, temporary seat locks, booking state transitions and payment verification.

## Backend

- Python + FastAPI
- SQLAlchemy
- MySQL
- Alembic
- Pydantic / pydantic-settings
- JWT authentication
- Argon2 password hashing
- Razorpay integration
- pytest
- Docker

## Booking Workflow

```text
Browse event → Select seat → Temporary lock → Pending booking
→ Payment order → Provider verification → Confirm booking → Seat sold
```

Temporary locks prevent an in-progress checkout from permanently consuming inventory. Payment confirmation is separated from initial booking creation so the backend can validate the provider response before marking the booking complete.

## Repository Layout

```text
BookNow/
├── backend/      # FastAPI application and database layer
└── frontend/     # React client used to exercise the API
```

The backend has its own README with setup, configuration, testing and Docker instructions.

## Why This Project

BookNow is primarily a backend engineering project. The goal is to demonstrate API design, relational data modeling, authentication, transactional workflows, inventory consistency, payment integration, migrations and testing rather than frontend complexity.

## Running the Backend

```bash
cd backend
python -m venv .venv
```

Install dependencies and configure `backend/.env` from `backend/.env.example`, then run:

```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Open `/docs` for the interactive API documentation.

## Testing

```bash
cd backend
pytest
```

## Status

Portfolio project under active refinement. Production deployment would additionally require managed secrets, HTTPS, restricted CORS, monitoring, backups and production payment webhooks.
