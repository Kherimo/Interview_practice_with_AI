# database.py (Fixed to be compatible with frontend requirements)
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
    UniqueConstraint,
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


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
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
    mode = Column(Enum("chat", "voice", name="session_mode"), nullable=False, default="voice")
    difficulty_setting = Column(String(50), nullable=False, default="medium")
    questions_asked = Column(Integer, server_default=text("0"))
    started_at = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())  # Added for frontend compatibility
    expires_at = Column(DateTime)


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
    feedback = Column(Text)
    score = Column(Float)
    user_answer_audio_url = Column(String(255))
    # Extended evaluation fields for detailed result view
    transcript_text = Column(Text)
    speaking_score = Column(Float)
    content_score = Column(Float)
    relevance_score = Column(Float)
    strengths = Column(JSON)
    improvements = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())



class QuestionNote(Base):
    __tablename__ = "question_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(
        Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "question_id", name="uq_question_note"),
    )


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
        if "created_at" not in existing:
            add_col("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        if "mode" not in existing:
            add_col("mode", "VARCHAR(20) DEFAULT 'voice'")
        if "difficulty_setting" not in existing:
            add_col("difficulty_setting", "VARCHAR(50) DEFAULT 'medium'")
        # Drop old columns if they exist
        if "topic_id" in existing:
            try:
                conn.execute(text("ALTER TABLE interview_sessions DROP COLUMN topic_id"))
            except Exception:
                pass
        if "role" in existing:
            try:
                conn.execute(text("ALTER TABLE interview_sessions DROP COLUMN role"))
            except Exception:
                pass
        if "position" in existing:
            try:
                conn.execute(text("ALTER TABLE interview_sessions DROP COLUMN position"))
            except Exception:
                pass

def migrate_interview_answers():
    """Ensure new evaluation columns exist on interview_answers."""
    inspector = inspect(engine)
    if not inspector.has_table("interview_answers"):
        return
    existing = {col["name"] for col in inspector.get_columns("interview_answers")}
    with engine.begin() as conn:
        def add_col(name, coltype):
            conn.execute(text(f"ALTER TABLE interview_answers ADD COLUMN {name} {coltype}"))

        if "transcript_text" not in existing:
            add_col("transcript_text", "TEXT")
        if "speaking_score" not in existing:
            add_col("speaking_score", "FLOAT")
        if "content_score" not in existing:
            add_col("content_score", "FLOAT")
        if "relevance_score" not in existing:
            add_col("relevance_score", "FLOAT")
        if "strengths" not in existing:
            add_col("strengths", "JSON")
        if "improvements" not in existing:
            add_col("improvements", "JSON")
        # Drop legacy 'answer' column if exists to avoid duplication with transcript_text
        if "answer" in existing:
            try:
                conn.execute(text("ALTER TABLE interview_answers DROP COLUMN answer"))
            except Exception:
                pass


def migrate_remove_session_columns():
    """Remove overall_score and completed_at columns from interview_sessions."""
    inspector = inspect(engine)
    if not inspector.has_table("interview_sessions"):
        return
    existing = {col["name"] for col in inspector.get_columns("interview_sessions")}
    with engine.begin() as conn:
        # Remove overall_score column if it exists
        if "overall_score" in existing:
            try:
                conn.execute(text("ALTER TABLE interview_sessions DROP COLUMN overall_score"))
                print("Removed overall_score column from interview_sessions")
            except Exception as e:
                print(f"Error removing overall_score column: {e}")
        
        # Remove completed_at column if it exists
        if "completed_at" in existing:
            try:
                conn.execute(text("ALTER TABLE interview_sessions DROP COLUMN completed_at"))
                print("Removed completed_at column from interview_sessions")
            except Exception as e:
                print(f"Error removing completed_at column: {e}")

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
