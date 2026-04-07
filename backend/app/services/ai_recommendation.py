# sportcenter-wireframes/backend/app/services/ai_recommendation.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import re


INTENSITY_LABELS = {
    "low": "низкая",
    "medium": "средняя",
    "high": "высокая",
}


WORKOUT_KEYWORDS = {
    "футбол": ["футбол"],
    "бег": ["бег", "пробеж"],
    "силовая": ["зал", "силов", "штанг", "жим", "присед", "тяга"],
    "йога": ["йог"],
    "бокс": ["бокс"],
    "плавание": ["плаван", "бассейн"],
    "велосипед": ["вел", "велосипед"],
}

PAIN_AREAS = {
    "колено": ["колен"],
    "спина": ["спин", "поясниц"],
    "плечо": ["плеч"],
    "шея": ["ше", "шейн"],
    "голеностоп": ["голеностоп", "щиколот"],
    "локоть": ["локт"],
}

FATIGUE_KEYWORDS = ["устал", "тяжел", "утом", "измот", "без сил"]
POSITIVE_KEYWORDS = ["хорош", "отличн", "нормаль", "классн", "бодр", "понравил"]
CONTACT_KEYWORDS = ["подкат", "столкнов", "груб", "удар", "контакт"]


@dataclass
class ParsedEntry:
    workout_type: Optional[str]
    pain_areas: List[str]
    fatigue: bool
    positive: bool
    contact_episode: bool
    clean_notes: str



def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()



def detect_workout_type(notes: str) -> Optional[str]:
    explicit = re.search(r"тип тренировки\s*:\s*([^\.\n]+)", notes or "", re.IGNORECASE)
    if explicit:
        return explicit.group(1).strip().capitalize()

    normalized = normalize_text(notes)
    for workout_name, keywords in WORKOUT_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return workout_name.capitalize()
    return None



def detect_pain_areas(notes: str) -> List[str]:
    normalized = normalize_text(notes)
    result: List[str] = []
    if not any(keyword in normalized for keyword in ["бол", "травм", "ноет", "тянет", "дискомфорт"]):
        return result

    for area, keywords in PAIN_AREAS.items():
        if any(keyword in normalized for keyword in keywords):
            result.append(area)

    if not result:
        result.append("проблемная зона")
    return result



def extract_clean_comment(notes: str) -> str:
    raw = (notes or "").strip()
    if not raw:
        return ""

    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    comment_lines: List[str] = []

    for line in lines:
        if re.match(r"^тип тренировки\s*:", line, re.IGNORECASE):
            continue
        if re.match(r"^комментарий\s*:", line, re.IGNORECASE):
            comment_lines.append(re.sub(r"^комментарий\s*:", "", line, flags=re.IGNORECASE).strip())
            continue
        comment_lines.append(line)

    return " ".join(part for part in comment_lines if part).strip()



def pluralize_training(count: int) -> str:
    mod10 = count % 10
    mod100 = count % 100
    if mod10 == 1 and mod100 != 11:
        return "тренировка"
    if 2 <= mod10 <= 4 and not 12 <= mod100 <= 14:
        return "тренировки"
    return "тренировок"



def parse_entry(entry: Dict[str, Any]) -> ParsedEntry:
    notes = entry.get("notes") or ""
    normalized = normalize_text(notes)
    return ParsedEntry(
        workout_type=detect_workout_type(notes),
        pain_areas=detect_pain_areas(notes),
        fatigue=any(keyword in normalized for keyword in FATIGUE_KEYWORDS) or (entry.get("feeling") or 0) <= 4,
        positive=any(keyword in normalized for keyword in POSITIVE_KEYWORDS) or (entry.get("feeling") or 0) >= 8,
        contact_episode=any(keyword in normalized for keyword in CONTACT_KEYWORDS),
        clean_notes=extract_clean_comment(notes),
    )



def safe_int(value: Optional[int], default: int) -> int:
    return value if isinstance(value, int) else default



def calculate_frequency(recent_entries: List[Dict[str, Any]]) -> int:
    week_ago = datetime.now().date() - timedelta(days=7)
    total = 0
    for entry in recent_entries:
        raw_date = entry.get("date")
        if not raw_date:
            continue
        try:
            entry_date = datetime.fromisoformat(raw_date).date()
        except ValueError:
            continue
        if entry_date >= week_ago:
            total += 1
    return total



def next_duration(last_duration: int, ratio: float) -> int:
    base = last_duration or 60
    suggested = int(round((base * ratio) / 5.0) * 5)
    return max(20, suggested)



def build_title(recommendation_type: str, pain_areas: List[str]) -> str:
    if recommendation_type == "rest" and pain_areas:
        if len(pain_areas) == 1:
            return f"Снизить нагрузку и поберечь {pain_areas[0]}"
        return "Снизить нагрузку и разгрузить проблемные зоны"
    if recommendation_type == "rest":
        return "Снизить нагрузку и дать организму восстановиться"
    if recommendation_type == "increase":
        return "Можно аккуратно добавить нагрузку"
    return "Поддерживать текущий режим"



def build_summary(
    workout_label: str,
    duration: int,
    intensity_label: str,
    feeling: int,
    parsed: ParsedEntry,
    recommendation_type: str,
) -> str:
    prefix = f"Последняя тренировка — {workout_label.lower()}, {duration} мин, интенсивность {intensity_label}, самочувствие {feeling}/10."

    if parsed.pain_areas:
        area_text = ", ".join(parsed.pain_areas)
        return f"{prefix} После тренировки есть дискомфорт в зоне: {area_text}, поэтому ближайшую нагрузку лучше сделать щадящей."

    if parsed.fatigue:
        return f"{prefix} По самочувствию видно, что организму нужен более мягкий режим, поэтому следующую тренировку лучше провести спокойнее."

    if recommendation_type == "increase":
        return f"{prefix} Нагрузка переносится хорошо, поэтому можно аккуратно прогрессировать без резкого скачка объёма."

    return f"{prefix} По этой записи нагрузка выглядит в целом рабочей, поэтому можно сохранить похожий формат и следить за восстановлением."



def build_storage_text(title: str, summary: str, actions: List[str], warning: Optional[str]) -> str:
    parts = [title, summary]
    if actions:
        parts.append("Что делать:")
        parts.extend([f"- {action}" for action in actions])
    if warning:
        parts.append(f"Важно: {warning}")
    return "\n".join(parts)



def build_recommendation(user_profile: Dict[str, Any], recent_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not recent_entries:
        summary = "Пока нет записей в дневнике, поэтому рекомендацию сформировать нельзя."
        return {
            "type": "maintain",
            "title": "Недостаточно данных для рекомендации",
            "summary": summary,
            "basis": [
                "В дневнике пока нет ни одной записи о тренировке.",
            ],
            "actions": [
                "Добавьте дату, длительность, интенсивность, самочувствие и комментарий о тренировке.",
            ],
            "warning": None,
            "text": build_storage_text("Недостаточно данных для рекомендации", summary, ["Добавьте первую запись в дневник."], None),
        }

    last_entry = recent_entries[0]
    parsed = parse_entry(last_entry)

    weekly_goal = safe_int(user_profile.get("weeklyGoal"), 3)
    frequency = calculate_frequency(recent_entries)
    duration = safe_int(last_entry.get("duration"), 0)
    feeling = safe_int(last_entry.get("feeling"), 5)
    intensity = last_entry.get("intensity") or "medium"
    intensity_label = INTENSITY_LABELS.get(intensity, intensity)
    limitations = (user_profile.get("limitations") or "").strip()

    workout_label = parsed.workout_type or "Тренировка"
    recommendation_type = "maintain"
    basis: List[str] = [
        f"Последняя тренировка: {workout_label.lower()}, {duration} мин, {intensity_label} интенсивность.",
        f"Самочувствие после тренировки: {feeling}/10.",
    ]
    actions: List[str] = []
    warning: Optional[str] = None

    if parsed.pain_areas:
        area_text = ", ".join(parsed.pain_areas)
        basis.append(f"В записи есть упоминание дискомфорта в зоне: {area_text}.")
        recommendation_type = "rest"
        reduced_duration = next_duration(duration, 0.7)
        actions.append(f"Следующую тренировку сделайте щадящей и сократите длительность примерно до {reduced_duration} мин.")
        actions.append(f"Уберите упражнения и игровые эпизоды, которые нагружают: {area_text}.")
        if parsed.contact_episode:
            actions.append("На ближайшем занятии избегайте жёстких контактов, резких разворотов и спорных игровых эпизодов.")
        warning = "Если дискомфорт не уменьшается или усиливается в движении, нагрузку лучше дополнительно снизить."

    elif parsed.fatigue:
        recommendation_type = "rest"
        reduced_duration = next_duration(duration, 0.8)
        basis.append("По записи видно выраженную усталость или низкое самочувствие после тренировки.")
        actions.append(f"Следующую тренировку проведите спокойнее и ограничьте примерно {reduced_duration} минутами.")
        actions.append("Не добавляйте новый объём, пока самочувствие не станет стабильнее.")

    else:
        if intensity == "high" and feeling <= 7:
            basis.append("Высокая интенсивность при таком самочувствии выглядит тяжеловатой.")
            actions.append("На следующем занятии лучше оставить объём примерно тем же, но снизить темп и плотность нагрузки.")
        elif intensity in {"low", "medium"} and feeling >= 8:
            recommendation_type = "increase"
            increased_duration = next_duration(duration, 1.15)
            basis.append("Самочувствие после тренировки хорошее, а запись не указывает на перегрузку.")
            actions.append(f"Можно аккуратно повысить нагрузку: например, добавить время до {increased_duration} мин или немного усложнить основной блок.")
            actions.append("Повышайте объём постепенно, без резкого скачка за одно занятие.")
        else:
            actions.append("Оставьте похожий формат тренировки и ориентируйтесь на самочувствие после следующего занятия.")

    if weekly_goal > 0:
        basis.append(f"За последние 7 дней: {frequency} {pluralize_training(frequency)} при цели {weekly_goal} в неделю.")
        if frequency < weekly_goal:
            actions.append("Добирать недельный объём лучше постепенно, без резкого увеличения нагрузки за один день.")
        elif frequency > weekly_goal + 1:
            actions.append("Сейчас важнее восстановление, чем добавление ещё одной тяжёлой тренировки.")
            if recommendation_type == "increase":
                recommendation_type = "maintain"

    if limitations:
        basis.append(f"В профиле указаны ограничения: {limitations}.")
        actions.append(f"Выбирайте упражнения, которые не усиливают дискомфорт и не перегружают зоны с ограничениями: {limitations}.")

    title = build_title(recommendation_type, parsed.pain_areas)
    summary = build_summary(workout_label, duration, intensity_label, feeling, parsed, recommendation_type)
    text = build_storage_text(title, summary, actions, warning)

    return {
        "type": recommendation_type,
        "title": title,
        "summary": summary,
        "basis": basis[:4],
        "actions": actions[:5],
        "warning": warning,
        "text": text,
    }


class RecommendationGenerator:
    def generate_recommendation(self, user_profile: Dict[str, Any], recent_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        return build_recommendation(user_profile, recent_entries)


_generator: Optional[RecommendationGenerator] = None



def get_generator() -> RecommendationGenerator:
    global _generator
    if _generator is None:
        _generator = RecommendationGenerator()
    return _generator
