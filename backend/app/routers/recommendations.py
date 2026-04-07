# sportcenter-wireframes/backend/app/routers/recommendations.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date
from .. import schemas, models, dependencies
from ..services.ai_recommendation import get_generator
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/", response_model=List[schemas.RecommendationOut])
def get_recommendations(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    recent_entries = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == current_user.id
    ).order_by(models.DiaryEntry.date.desc()).limit(30).all()

    if not recent_entries:
        return []

    entries_data = [
        {
            "date": e.date.isoformat(),
            "duration": e.duration,
            "intensity": e.intensity.value if hasattr(e.intensity, "value") else str(e.intensity),
            "feeling": e.feeling,
            "notes": e.notes or "",
        }
        for e in recent_entries
    ]

    user_profile = {
        "age": current_user.age,
        "gender": current_user.gender.value if current_user.gender else None,
        "experience": current_user.experience.value if current_user.experience else None,
        "height": current_user.height,
        "weight": current_user.weight,
        "limitations": current_user.limitations,
        "weeklyGoal": current_user.weeklyGoal,
    }

    try:
        generator = get_generator()
        recommendation_result: Dict[str, Any] = generator.generate_recommendation(user_profile, entries_data)
        recommendation_text = recommendation_result["text"]
        recommendation_type = recommendation_result["type"]
    except Exception:
        logger.exception("Ошибка генерации рекомендации")
        recommendation_result = {
            "type": "maintain",
            "title": "Не удалось подготовить рекомендацию",
            "summary": "Проверьте, что в дневнике есть последняя запись с описанием тренировки и самочувствия.",
            "basis": [],
            "actions": ["Попробуйте обновить страницу после сохранения записи в дневник."],
            "warning": None,
            "text": "Не удалось сгенерировать рекомендацию. Проверьте, что в дневнике есть последняя запись и описание тренировки.",
        }
        recommendation_text = recommendation_result["text"]
        recommendation_type = recommendation_result["type"]

    today = date.today()
    existing = db.query(models.Recommendation).filter(
        models.Recommendation.user_id == current_user.id,
        models.Recommendation.date == today
    ).first()

    if existing:
        existing.text = recommendation_text
        existing.type = recommendation_type
        db.commit()
        db.refresh(existing)
        recommendation_id = existing.id
        recommendation_date = existing.date
    else:
        new_rec = models.Recommendation(
            user_id=current_user.id,
            date=today,
            text=recommendation_text,
            type=recommendation_type,
        )
        db.add(new_rec)
        db.commit()
        db.refresh(new_rec)
        recommendation_id = new_rec.id
        recommendation_date = new_rec.date

    return [{
        "id": recommendation_id,
        "date": recommendation_date,
        "text": recommendation_text,
        "type": recommendation_type,
        "title": recommendation_result.get("title"),
        "summary": recommendation_result.get("summary"),
        "basis": recommendation_result.get("basis", []),
        "actions": recommendation_result.get("actions", []),
        "warning": recommendation_result.get("warning"),
    }]
