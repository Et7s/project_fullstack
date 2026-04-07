#sportcenter-wireframes/backend/app/routers/diary.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, dependencies
from ..exceptions import NotFoundError

router = APIRouter(prefix="/diary", tags=["diary"])

@router.get("/", response_model=List[schemas.DiaryEntryOut])
def get_diary_entries(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    entries = db.query(models.DiaryEntry).filter(models.DiaryEntry.user_id == current_user.id).order_by(models.DiaryEntry.date.desc()).all()
    return entries

@router.post("/", response_model=schemas.DiaryEntryOut)
def create_diary_entry(
    entry: schemas.DiaryEntryCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    new_entry = models.DiaryEntry(
        user_id=current_user.id,
        **entry.dict()
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.get("/{entry_id}", response_model=schemas.DiaryEntryOut)
def get_diary_entry(
    entry_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """Получить конкретную запись дневника (дополнительно)"""
    entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id,
        models.DiaryEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise NotFoundError("Entry not found")
    return entry

@router.put("/{entry_id}", response_model=schemas.DiaryEntryOut)
def update_diary_entry(
    entry_id: int,
    entry_update: schemas.DiaryEntryCreate,  # используем ту же схему для обновления
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """Обновить существующую запись дневника (только свою)"""
    entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id,
        models.DiaryEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise NotFoundError("Entry not found")

    # Обновляем поля
    for field, value in entry_update.dict().items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diary_entry(
    entry_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """Удалить запись дневника (только свою)"""
    entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.id == entry_id,
        models.DiaryEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise NotFoundError("Entry not found")

    db.delete(entry)
    db.commit()
    return None  # 204 No Content