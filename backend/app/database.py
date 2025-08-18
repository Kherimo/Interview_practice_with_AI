import os
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Float,
    Enum,
    JSON,
    Index,
    text,
)
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import func
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(255))
    profession = Column(String(255))
    experience_level = Column(String(100))
    provider = Column(String(50))
    provider_id = Column(String(255))
    email_verified_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    notifications_on = Column(Boolean, nullable=False, default=True, server_default=text('true'))
    reminders_on     = Column(Boolean, nullable=False, default=True, server_default=text('true'))


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    image_url = Column(String(255))
    question_count = Column(Integer, server_default=text("0"))


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    difficulty = Column(String(50), nullable=False)
    suggested_answer = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True, server_default=text('true'))


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="SET NULL"))
    status = Column(
        Enum("dang_dien_ra", "da_hoan_thanh", "da_huy", name="session_status"),
        nullable=False,
        server_default="dang_dien_ra",
    )
    mode = Column(Enum("chat", "voice", name="session_mode"), nullable=False)
    difficulty_setting = Column(String(50), nullable=False)
    questions_asked = Column(Integer, server_default=text("0"))
    overall_score = Column(Float)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime)


class SessionDetail(Base):
    __tablename__ = "session_details"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False
    )
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="SET NULL"))
    user_answer_text = Column(Text)
    user_answer_audio_url = Column(String(255))
    ai_feedback = Column(JSON)
    score = Column(Float)
    answered_at = Column(DateTime, server_default=func.now())


class SavedQuestion(Base):
    __tablename__ = "saved_questions"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    question_id = Column(
        Integer, ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True
    )
    saved_at = Column(DateTime, server_default=func.now())


class PasswordReset(Base):
    __tablename__ = "password_resets"

    email = Column(String(255), primary_key=True)
    token = Column(String(255), primary_key=True)
    created_at = Column(DateTime, server_default=func.now())


Index("idx_password_resets_token", PasswordReset.token)


def get_session():
    return SessionLocal()


def check_connection():
    """Return True if the database connection succeeds, else False."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        print(f"Database connection failed: {exc}")
        return False
