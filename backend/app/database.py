# database.py (No major changes needed, but added some comments and ensured migrations handle new fields if any)
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
    inspect,
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
    reminders_on = Column(Boolean, nullable=False, default=True, server_default=text('true'))
    practice_reminders = Column(Boolean, nullable=False, default=True, server_default=text('true'))
    new_features = Column(Boolean, nullable=False, default=True, server_default=text('true'))
    feedback_requests = Column(Boolean, nullable=False, default=True, server_default=text('true'))
    practice_results = Column(Boolean, nullable=False, default=True, server_default=text('true'))
    email_notifications = Column(Boolean, nullable=False, default=True, server_default=text('true'))


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
    role = Column(String(100))
    position = Column(String(100))
    field = Column(String(100))
    specialization = Column(String(100))
    experience_level = Column(String(50))
    time_limit = Column(Integer)
    question_limit = Column(Integer)
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
    expires_at = Column(DateTime)
    completed_at = Column(DateTime)


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False
    )
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False
    )
    question_id = Column(
        Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False
    )
    answer = Column(Text, nullable=False)
    feedback = Column(Text)
    score = Column(Float)
    user_answer_audio_url = Column(String(255))  # Thêm field này
    created_at = Column(DateTime, server_default=func.now())


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


def migrate_user_settings():
    """Ensure all expected columns exist on user_settings."""
    inspector = inspect(engine)
    if not inspector.has_table("user_settings"):
        return
    existing = {col["name"] for col in inspector.get_columns("user_settings")}
    with engine.begin() as conn:
        def add_column(name):
            conn.execute(
                text(
                    f"ALTER TABLE user_settings ADD COLUMN {name} BOOLEAN NOT NULL DEFAULT true"
                )
            )

        if "practice_reminders" not in existing:
            add_column("practice_reminders")
        if "new_features" not in existing:
            add_column("new_features")
        if "feedback_requests" not in existing:
            add_column("feedback_requests")
        if "practice_results" not in existing:
            add_column("practice_results")
        if "email_notifications" not in existing:
            add_column("email_notifications")


def migrate_interview_sessions():
    """Ensure new metadata columns exist on interview_sessions."""
    inspector = inspect(engine)
    if not inspector.has_table("interview_sessions"):
        return
    existing = {col["name"] for col in inspector.get_columns("interview_sessions")}
    with engine.begin() as conn:
        def add_col(name, coltype):
            conn.execute(text(f"ALTER TABLE interview_sessions ADD COLUMN {name} {coltype}"))

        if "field" not in existing:
            add_col("field", "VARCHAR(100)")
        if "specialization" not in existing:
            add_col("specialization", "VARCHAR(100)")
        if "experience_level" not in existing:
            add_col("experience_level", "VARCHAR(50)")
        if "time_limit" not in existing:
            add_col("time_limit", "INTEGER")
        if "question_limit" not in existing:
            add_col("question_limit", "INTEGER")

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
    