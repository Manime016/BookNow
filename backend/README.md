# BookNow Backend API

A FastAPI-based backend for the BookNow event ticketing and booking platform. This API handles user authentication, event management, seat allocation, bookings, and payment processing.

## Overview

The BookNow backend is built with:
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **Alembic** - Database migration tool
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Token authentication
- **Pydantic** - Data validation using Python type annotations

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── db.py                # Database connection and setup
│   ├── config.py            # Configuration management
│   ├── dependencies.py      # Dependency injection
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── event.py
│   │   ├── venue.py
│   │   ├── seat.py
│   │   ├── booking.py
│   │   ├── payment.py
│   │   ├── event_seat.py
│   │   └── seat_lock.py
│   ├── routes/              # API route handlers
│   │   ├── auth.py
│   │   ├── events.py
│   │   ├── venues.py
│   │   ├── seats.py
│   │   ├── bookings.py
│   │   ├── payments.py
│   │   ├── event_seats.py
│   │   └── seat_locks.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── user_schema.py
│   │   ├── event_schema.py
│   │   ├── venue_schema.py
│   │   ├── seat_schema.py
│   │   ├── booking_schema.py
│   │   ├── payment_schema.py
│   │   ├── event_seat_schema.py
│   │   └── seat_lock_schema.py
│   └── services/            # Business logic services
│       ├── auth_service.py
│       ├── event_service.py
│       ├── venue_service.py
│       ├── seats_service.py
│       ├── bookings_service.py
│       ├── payments_service.py
│       ├── event_seats_service.py
│       ├── seat_locks_service.py
│       └── notification_service.py
├── migrations/              # Alembic database migrations
├── tests/                   # Test files
├── requirements.txt         # Python dependencies
├── config.py               # Environment and app configuration
├── Dockerfile              # Docker image configuration
└── alembic.ini            # Alembic configuration
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   
   **Windows:**
   ```bash
   .\venv\Scripts\Activate.ps1
   ```
   
   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration (database credentials, JWT secret, etc.)

6. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

## Running the Application

### Start the Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### Events
- `GET /api/events` - List all events
- `GET /api/events/{event_id}` - Get event details
- `POST /api/events` - Create new event (admin)
- `PUT /api/events/{event_id}` - Update event (admin)
- `DELETE /api/events/{event_id}` - Delete event (admin)

### Venues
- `GET /api/venues` - List all venues
- `GET /api/venues/{venue_id}` - Get venue details
- `POST /api/venues` - Create new venue (admin)
- `PUT /api/venues/{venue_id}` - Update venue (admin)
- `DELETE /api/venues/{venue_id}` - Delete venue (admin)

### Seats
- `GET /api/seats/{event_id}` - Get seats for an event
- `GET /api/seats/{seat_id}` - Get seat details
- `POST /api/seats` - Create seat (admin)

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{booking_id}` - Get booking details
- `DELETE /api/bookings/{booking_id}` - Cancel booking

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments/{payment_id}` - Get payment details
- `GET /api/payments/booking/{booking_id}` - Get payments for booking

### Seat Locks
- `POST /api/seat-locks` - Lock seats during checkout
- `DELETE /api/seat-locks/{lock_id}` - Release seat lock

### Event Seats
- `GET /api/event-seats/{event_id}` - Get seat status for event
- `GET /api/event-seats/{event_seat_id}` - Get event seat details

## Database

### Connection

Database configuration is managed through environment variables. The application uses SQLAlchemy with SQLAlchemy's connection pooling.

### Migrations

Database schema changes are managed using Alembic:

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply pending migrations
alembic upgrade head

# Rollback to previous migration
alembic downgrade -1
```

See [migrations/README.md](./migrations/README.md) for more details.

## Services

Services contain the business logic for each feature:

- **auth_service.py** - User authentication and JWT token management
- **event_service.py** - Event management and queries
- **venue_service.py** - Venue management
- **seats_service.py** - Seat management
- **bookings_service.py** - Booking creation and management
- **payments_service.py** - Payment processing
- **event_seats_service.py** - Event-specific seat management
- **seat_locks_service.py** - Temporary seat locking during checkout
- **notification_service.py** - Email and notification sending

## Testing

Run tests using pytest:

```bash
pytest tests/
```

Run with coverage:

```bash
pytest --cov=app tests/
```

## Docker

### Build the Docker Image

```bash
docker build -t booknow-backend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- The FastAPI backend service
- A PostgreSQL database
- Any other services defined in docker-compose.yml

## Environment Variables

See `.env.example` for all available configuration options. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key for token signing
- `JWT_ALGORITHM` - Algorithm for JWT encoding (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time
- `DEBUG` - Enable debug mode

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists and credentials are correct

### Migration Issues
- Check Alembic configuration in `alembic.ini`
- Verify all models are imported in migration scripts
- Review migration files in `migrations/versions/`

### Import Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`
- Check Python path and PYTHONPATH environment variable

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure everything passes
4. Submit a pull request

## License

See LICENSE file for details.
