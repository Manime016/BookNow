"""Create a development admin account from environment variables.

Required environment variables:
    ADMIN_EMAIL
    ADMIN_PASSWORD

Run from the backend directory with the same environment used by the API.
"""

import os

from app.db import engine
from app.models.user import Base, User
from app.services.auth_service import hash_password
from sqlalchemy.orm import sessionmaker


ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    raise RuntimeError("ADMIN_EMAIL and ADMIN_PASSWORD must be set before running seed_admin.py")

if len(ADMIN_PASSWORD) < 12:
    raise RuntimeError("ADMIN_PASSWORD must contain at least 12 characters")


Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()

    if admin:
        print(f"Admin user already exists: {ADMIN_EMAIL}")
    else:
        admin_user = User(
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role="admin",
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin user created: {ADMIN_EMAIL}")
except Exception:
    db.rollback()
    raise
finally:
    db.close()
