# sportcenter-wireframes/backend/app/routers/sections.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from .. import schemas, models, dependencies

router = APIRouter(prefix="/sections", tags=["sections"])

SECTION_DETAILS: Dict[str, Dict[str, Any]] = {
    "футбол": {
        "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        "image_alt": "Игроки на футбольной тренировке",
        "what_you_will_do": [
            "Разминка, беговые упражнения и работа на координацию.",
            "Передачи, контроль мяча и игровые упражнения в парах и группах.",
            "Небольшие игровые отрезки с отработкой взаимодействия в команде.",
        ],
        "exercises": [
            {
                "title": "Разминка с мячом",
                "description": "Лёгкий бег, ведение мяча, смена направления и короткие ускорения.",
                "purpose": "Подготовить суставы и мышцы к игровой нагрузке.",
            },
            {
                "title": "Передачи в движении",
                "description": "Короткие и средние передачи с перемещением по площадке.",
                "purpose": "Развить технику и взаимодействие с партнёром.",
            },
            {
                "title": "Игровой мини-матч",
                "description": "Короткая игровая серия в ограниченном пространстве.",
                "purpose": "Отработать решения в реальной игровой ситуации.",
            },
        ],
    },

    "плавание": {
        "image_url": "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=1200&q=80",
        "image_alt": "Пловец в бассейне на тренировке",
        "what_you_will_do": [
            "Суставная разминка и подготовка плечевого пояса перед заходом в воду.",
            "Отработка техники дыхания, работы ног и гребка на дорожке.",
            "Основной плавательный блок по отрезкам и спокойная заминка в конце.",
        ],
        "exercises": [
            {
                "title": "Разминка на суше",
                "description": "Мягкая активация плеч, спины и корпуса перед бассейном.",
                "purpose": "Подготовить суставы и мышцы к работе в воде.",
            },
            {
                "title": "Технические отрезки",
                "description": "Короткие серии на дыхание, положение корпуса и координацию движений.",
                "purpose": "Улучшить технику плавания и экономичность движения.",
            },
            {
                "title": "Основной блок по дистанциям",
                "description": "Плавание в заданном темпе с паузами на восстановление.",
                "purpose": "Развить выносливость и уверенность в воде.",
            },
        ],
    },
    "бассейн": {
        "image_url": "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=1200&q=80",
        "image_alt": "Пловец в бассейне на тренировке",
        "what_you_will_do": [
            "Суставная разминка и подготовка плечевого пояса перед заходом в воду.",
            "Отработка техники дыхания, работы ног и гребка на дорожке.",
            "Основной плавательный блок по отрезкам и спокойная заминка в конце.",
        ],
        "exercises": [
            {
                "title": "Разминка на суше",
                "description": "Мягкая активация плеч, спины и корпуса перед бассейном.",
                "purpose": "Подготовить суставы и мышцы к работе в воде.",
            },
            {
                "title": "Технические отрезки",
                "description": "Короткие серии на дыхание, положение корпуса и координацию движений.",
                "purpose": "Улучшить технику плавания и экономичность движения.",
            },
            {
                "title": "Основной блок по дистанциям",
                "description": "Плавание в заданном темпе с паузами на восстановление.",
                "purpose": "Развить выносливость и уверенность в воде.",
            },
        ],
    },
    "плаванье": {
        "image_url": "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=1200&q=80",
        "image_alt": "Пловец в бассейне на тренировке",
        "what_you_will_do": [
            "Суставная разминка и подготовка плечевого пояса перед заходом в воду.",
            "Отработка техники дыхания, работы ног и гребка на дорожке.",
            "Основной плавательный блок по отрезкам и спокойная заминка в конце.",
        ],
        "exercises": [
            {
                "title": "Разминка на суше",
                "description": "Мягкая активация плеч, спины и корпуса перед бассейном.",
                "purpose": "Подготовить суставы и мышцы к работе в воде.",
            },
            {
                "title": "Технические отрезки",
                "description": "Короткие серии на дыхание, положение корпуса и координацию движений.",
                "purpose": "Улучшить технику плавания и экономичность движения.",
            },
            {
                "title": "Основной блок по дистанциям",
                "description": "Плавание в заданном темпе с паузами на восстановление.",
                "purpose": "Развить выносливость и уверенность в воде.",
            },
        ],
    },
    "йога": {
        "image_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        "image_alt": "Занятие йогой в группе",
        "what_you_will_do": [
            "Спокойная суставная разминка и настройка дыхания.",
            "Последовательность базовых и средних асан с акцентом на технику.",
            "Растяжка и расслабление в конце занятия.",
        ],
        "exercises": [
            {
                "title": "Дыхательная подготовка",
                "description": "Небольшой блок на дыхание и концентрацию перед основной частью.",
                "purpose": "Снизить напряжение и подготовиться к практике.",
            },
            {
                "title": "Комплекс асан",
                "description": "Связки на мобильность, баланс и растяжку.",
                "purpose": "Улучшить гибкость и контроль тела.",
            },
            {
                "title": "Финальное расслабление",
                "description": "Спокойная заминка в конце занятия.",
                "purpose": "Помочь восстановлению после нагрузки.",
            },
        ],
    },
    "бокс": {
        "image_url": "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80",
        "image_alt": "Тренировка по боксу",
        "what_you_will_do": [
            "Кардио-разминка и работа ног.",
            "Отработка ударов, комбинаций и защиты.",
            "Работа на лапах, мешке или в парах в контролируемом темпе.",
        ],
        "exercises": [
            {
                "title": "Школа передвижений",
                "description": "Шаги, уклоны и перемещения по стойке.",
                "purpose": "Улучшить координацию и устойчивость.",
            },
            {
                "title": "Комбинации ударов",
                "description": "Базовые серии на технику и ритм.",
                "purpose": "Развить точность и чувство дистанции.",
            },
            {
                "title": "Работа на мешке",
                "description": "Короткие интервалы с контролем техники.",
                "purpose": "Закрепить комбинации в реальном темпе.",
            },
        ],
    },
    "пилатес": {
        "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        "image_alt": "Групповое занятие пилатесом",
        "what_you_will_do": [
            "Мягкая разминка и активация корпуса.",
            "Упражнения на контроль движения, стабилизацию и осанку.",
            "Спокойная заминка и растяжка.",
        ],
        "exercises": [
            {
                "title": "Активация корпуса",
                "description": "Упражнения лёжа и сидя с контролем дыхания.",
                "purpose": "Подключить мышцы кора к работе.",
            },
            {
                "title": "Стабилизация таза и спины",
                "description": "Медленные движения с удержанием позиции.",
                "purpose": "Улучшить контроль тела и осанку.",
            },
            {
                "title": "Мобильность и заминка",
                "description": "Небольшой блок на растяжку в завершение.",
                "purpose": "Снизить напряжение после тренировки.",
            },
        ],
    },
    "crossfit": {
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
        "image_alt": "Интенсивная функциональная тренировка",
        "what_you_will_do": [
            "Функциональная разминка и подготовка суставов.",
            "Отработка техники базовых движений.",
            "Основной круг или интервальный блок на время или количество повторений.",
        ],
        "exercises": [
            {
                "title": "Технический блок",
                "description": "Разбор базового движения с контролем тренера.",
                "purpose": "Подготовить технику перед основным комплексом.",
            },
            {
                "title": "Круговая работа",
                "description": "Серия упражнений на всё тело в заданном темпе.",
                "purpose": "Развить выносливость и силовую работоспособность.",
            },
            {
                "title": "Заминка",
                "description": "Восстановительный блок после интенсивной части.",
                "purpose": "Снизить нагрузку и начать восстановление.",
            },
        ],
    },
}

DEFAULT_SECTION_DETAILS: Dict[str, Any] = {
    "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    "image_alt": "Тренировка в спортивном центре",
    "what_you_will_do": [
        "Разминка перед основной частью занятия.",
        "Практика ключевых элементов секции под контролем тренера.",
        "Заминка и рекомендации по восстановлению после тренировки.",
    ],
    "exercises": [
        {
            "title": "Подготовительный блок",
            "description": "Вводная часть с разминкой и объяснением техники.",
            "purpose": "Безопасно войти в тренировку.",
        },
        {
            "title": "Основной блок",
            "description": "Главные упражнения и отработка техники по направлению секции.",
            "purpose": "Получить основную нагрузку и практику.",
        },
        {
            "title": "Заминка",
            "description": "Спокойное завершение тренировки.",
            "purpose": "Помочь восстановлению.",
        },
    ],
}


def _normalize_key(value: Optional[str]) -> str:
    return (value or "").strip().lower()



def enrich_section(section: models.Section) -> Dict[str, Any]:
    category_key = _normalize_key(section.category)
    name_key = _normalize_key(section.name)
    details = SECTION_DETAILS.get(name_key) or SECTION_DETAILS.get(category_key) or DEFAULT_SECTION_DETAILS

    return {
        "id": section.id,
        "name": section.name,
        "category": section.category,
        "description": section.description,
        "schedule": section.schedule,
        "trainer": section.trainer,
        "level": section.level,
        "image_url": details["image_url"],
        "image_alt": details["image_alt"],
        "what_you_will_do": details["what_you_will_do"],
        "exercises": details["exercises"],
    }


@router.get("/", response_model=List[schemas.Section])
def get_sections(
    category: Optional[str] = None,
    level: Optional[str] = None,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    query = db.query(models.Section)
    if category:
        query = query.filter(models.Section.category == category)
    if level:
        query = query.filter(models.Section.level == level)
    elif current_user.level:
        query = query.filter(
            (models.Section.level == current_user.level) | (models.Section.level.is_(None))
        )

    sections = query.all()
    return [enrich_section(section) for section in sections]


@router.get("/{section_id}", response_model=schemas.Section)
def get_section(
    section_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user),
):
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return enrich_section(section)


@router.post("/enroll", response_model=schemas.Enrollment)
def enroll(
    enrollment: schemas.EnrollmentCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    section = db.query(models.Section).filter(models.Section.id == enrollment.section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    new_enrollment = models.Enrollment(
        user_id=current_user.id,
        section_id=enrollment.section_id,
        date=enrollment.date
    )
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment
