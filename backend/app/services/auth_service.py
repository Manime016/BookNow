from pwdlib import PasswordHash
from jose import jwt
from config import settings
from app.models.user import User
from app.schemas.user_schema import UserCreate


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, password_hash_value: str) -> bool:
    return password_hash.verify(password, password_hash_value)


def register_user(db, user_data: UserCreate):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise ValueError("Email already registered")

    hashed_password = hash_password(user_data.password)

    user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role="customer"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def authenticate_user(db, email: str, password: str):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def create_access_token(user_id: int, role: str):
    payload = {
        "sub": str(user_id),
        "role": role
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )