#sportcenter-wireframes/backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Enum, Text
from sqlalchemy.orm import relationship
from .database import Base
import enum

class IntensityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class ExperienceEnum(str, enum.Enum):
    none = "none"
    beginner = "beginner"
    amateur = "amateur"
    pro = "pro"

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class LevelEnum(str, enum.Enum):
    beginner = "beginner"
    amateur = "amateur"
    pro = "pro"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Профиль (онбординг)
    age = Column(Integer, nullable=True)
    gender = Column(Enum(GenderEnum), nullable=True)
    experience = Column(Enum(ExperienceEnum), nullable=True)
    height = Column(Integer, nullable=True)
    weight = Column(Integer, nullable=True)
    limitations = Column(Text, nullable=True)
    weeklyGoal = Column(Integer, nullable=True)
    level = Column(Enum(LevelEnum), nullable=True)  # вычисляется из experience

    diary_entries = relationship("DiaryEntry", back_populates="user")
    enrollments = relationship("Enrollment", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    schedule = Column(String, nullable=False)
    trainer = Column(String, nullable=False)
    level = Column(Enum(LevelEnum), nullable=True)  # для какого уровня подходит

    enrollments = relationship("Enrollment", back_populates="section")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    section_id = Column(Integer, ForeignKey("sections.id"))
    date = Column(Date, nullable=False)

    user = relationship("User", back_populates="enrollments")
    section = relationship("Section", back_populates="enrollments")

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    duration = Column(Integer, nullable=False)  # минуты
    intensity = Column(Enum(IntensityEnum), nullable=False)
    notes = Column(Text, nullable=True)
    feeling = Column(Integer, nullable=False)   # 1-10

    user = relationship("User", back_populates="diary_entries")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    text = Column(Text, nullable=False)
    type = Column(String, nullable=False)       # 'rest', 'increase', 'maintain'

    user = relationship("User", back_populates="recommendations")