from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.db import get_db
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, ProfileUpdate
from app.services.auth_service import register_user, authenticate_user, create_access_token, update_profile

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        return register_user(db, user_data)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_access_token(user.id, user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
        },
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_user_profile(profile_data: ProfileUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return update_profile(db, current_user, profile_data)
