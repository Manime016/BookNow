# BookNow Backend

FastAPI backend for an event-ticket booking system. The backend focuses on authenticated users, event and venue management, per-event seat inventory, temporary seat locks, bookings, and payment verification.

## Stack

- Python 3.11+
- FastAPI + Uvicorn
- SQLAlchemy ORM
- MySQL
- Alembic migrations
- Pydantic / pydantic-settings
- JWT authentication
- Argon2 password hashing via `pwdlib`
- Razorpay payment integration
- pytest
- Docker

## Architecture

```text
backend/
├── app/
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Request/response validation
│   ├── routes/       # HTTP endpoints
│   └── services/     # Business rules and workflows
├── migrations/       # Alembic migrations
├── tests/            # Automated tests
├── config.py         # Environment-backed settings
├── seed_admin.py     # Development admin bootstrap
├── Dockerfile
└── requirements.txt
```

HTTP handling, validation, persistence and business logic are separated so booking and payment workflows remain easier to test and maintain.

## Booking Flow

```text
Select event/seat
      ↓
Temporary seat lock
      ↓
Create pending booking
      ↓
Create payment order
      ↓
Verify payment with provider
      ↓
Confirm booking
      ↓
Mark seat sold
```

Seat locks are temporary. Failed or expired checkout must not leave inventory permanently unavailable.

## Payment Safety

Payment confirmation verifies the provider response before a booking is finalized. The workflow checks the payment signature, provider-side payment/order information, expected amount and repeated-callback/idempotency conditions.

Never put Razorpay credentials, database passwords or JWT secrets in source control. Use `.env` locally and deployment environment variables in production.

## Configuration

Create `backend/.env` from `backend/.env.example` and provide your own values.

```text
MYSQL_HOST
MYSQL_PORT
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DATABASE
MYSQL_SSL_CA
SECRET_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES
```

`MYSQL_SSL_CA` is optional for local MySQL and should point to a trusted CA file when the hosted database requires TLS.

## Run Locally

From `backend/`:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

API documentation is available at `/docs` and `/redoc`.

## Tests

```bash
pytest
```

With coverage:

```bash
pytest --cov=app
```

## Docker

From the repository root:

```bash
docker build -t booknow-backend ./backend
docker run --env-file backend/.env -p 8000:8000 booknow-backend
```

## Engineering Focus

This project is intentionally backend-focused. The main engineering problems are transactional booking workflows, inventory consistency, authentication, payment verification, database migrations and testable service-layer logic.

## Production Notes

For a real deployment, use managed secrets, HTTPS, restricted CORS, payment-provider webhooks where appropriate, structured logging, monitoring and database backups.
