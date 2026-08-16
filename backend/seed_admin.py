"""
Seed script to create a test admin user in the database.
Run this script once to create the admin account.

Usage:
    python seed_admin.py

Test admin credentials:
    Email: admin@booknow.com
    Password: Admin@123
"""

import sys
from app.db import get_db, engine
from app.models.user import Base
from app.models.user import User
from app.services.auth_service import hash_password
from sqlalchemy.orm import sessionmaker

# Create all tables
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Check if admin already exists
    admin = db.query(User).filter(User.email == "admin@booknow.com").first()
    
    if admin:
        print("✓ Admin user already exists: admin@booknow.com")
    else:
        # Create admin user
        hashed_password = hash_password("Admin@123")
        admin_user = User(
            email="admin@booknow.com",
            password_hash=hashed_password,
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print("✓ Admin user created successfully!")
        print("\nAdmin Credentials:")
        print("  Email: admin@booknow.com")
        print("  Password: Admin@123")
        print("\nUse these credentials to login and access the admin panel.")
    
    # Also create a test customer user
    customer = db.query(User).filter(User.email == "user@booknow.com").first()
    
    if customer:
        print("✓ Customer user already exists: user@booknow.com")
    else:
        hashed_password = hash_password("User@123")
        customer_user = User(
            email="user@booknow.com",
            password_hash=hashed_password,
            role="customer"
        )
        db.add(customer_user)
        db.commit()
        print("✓ Customer user created successfully!")
        print("\nCustomer Credentials:")
        print("  Email: user@booknow.com")
        print("  Password: User@123")

except Exception as e:
    print(f"✗ Error: {e}")
    db.rollback()
finally:
    db.close()
