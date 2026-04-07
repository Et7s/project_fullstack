#sportcenter-wireframes/backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, dependencies

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def get_current_user_profile(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.put("/me/profile", response_model=schemas.UserOut)
def update_profile(
    profile: schemas.UserProfileUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    for field, value in profile.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    if current_user.experience:
        if current_user.experience == "none" or current_user.experience == "beginner":
            current_user.level = "beginner"
        elif current_user.experience == "amateur":
            current_user.level = "amateur"
        elif current_user.experience == "pro":
            current_user.level = "pro"
    
    db.commit()
    db.refresh(current_user)
    return current_user