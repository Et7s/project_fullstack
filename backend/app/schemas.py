# sportcenter-wireframes/backend/app/schemas.py
from pydantic import BaseModel, EmailStr, validator, Field
from datetime import date
from typing import Optional, List
from enum import Enum


class IntensityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ExperienceEnum(str, Enum):
    none = "none"
    beginner = "beginner"
    amateur = "amateur"
    pro = "pro"


class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class LevelEnum(str, Enum):
    beginner = "beginner"
    amateur = "amateur"
    pro = "pro"


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[GenderEnum] = None
    experience: Optional[ExperienceEnum] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    limitations: Optional[str] = None
    weeklyGoal: Optional[int] = None


class UserOut(UserBase):
    id: int
    age: Optional[int] = None
    gender: Optional[GenderEnum] = None
    experience: Optional[ExperienceEnum] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    limitations: Optional[str] = None
    weeklyGoal: Optional[int] = None
    level: Optional[LevelEnum] = None

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class SectionExercise(BaseModel):
    title: str
    description: str
    purpose: str


class SectionBase(BaseModel):
    name: str
    category: str
    description: str
    schedule: str
    trainer: str
    level: Optional[LevelEnum] = None


class SectionCreate(SectionBase):
    pass


class Section(SectionBase):
    id: int
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    what_you_will_do: List[str] = Field(default_factory=list)
    exercises: List[SectionExercise] = Field(default_factory=list)

    class Config:
        orm_mode = True


class EnrollmentCreate(BaseModel):
    section_id: int
    date: date


class Enrollment(EnrollmentCreate):
    id: int
    user_id: int

    class Config:
        orm_mode = True


class DiaryEntryBase(BaseModel):
    date: date
    duration: int
    intensity: IntensityEnum
    notes: Optional[str] = None
    feeling: int

    @validator('date')
    def date_not_future(cls, v):
        if v > date.today():
            raise ValueError('Date cannot be in the future')
        return v

    @validator('duration')
    def duration_positive(cls, v):
        if v <= 0:
            raise ValueError('Duration must be positive')
        return v

    @validator('feeling')
    def feeling_range(cls, v):
        if v < 1 or v > 10:
            raise ValueError('Feeling must be between 1 and 10')
        return v


class DiaryEntryCreate(DiaryEntryBase):
    pass


class DiaryEntryOut(DiaryEntryBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


class RecommendationOut(BaseModel):
    id: int
    date: date
    text: str
    type: str
    title: Optional[str] = None
    summary: Optional[str] = None
    basis: List[str] = Field(default_factory=list)
    actions: List[str] = Field(default_factory=list)
    warning: Optional[str] = None

    class Config:
        orm_mode = True
