import logging
from flask import Blueprint, jsonify
from app.database import (
    get_session,
    InterviewQuestion,
    QuestionNote,
    InterviewAnswer,
    InterviewSession,
)
from app.utils import token_required

logger = logging.getLogger(__name__)

note_bp = Blueprint('note', __name__, url_prefix='/questions')

@note_bp.route('/<int:question_id>/note', methods=['GET'])
@token_required
def check_note(current_user, question_id):
    """Check if a question is saved by current user"""
    db = get_session()
    try:
        saved = db.query(QuestionNote).filter_by(user_id=current_user.id, question_id=question_id).first()
        return jsonify({'saved': bool(saved)})
    except Exception as e:
        logger.error(f"Error checking note: {e}")
        return jsonify({'error': 'Không thể kiểm tra trạng thái'}), 500
    finally:
        db.close()

@note_bp.route('/<int:question_id>/note', methods=['POST'])
@token_required
def save_note(current_user, question_id):
    """Save question for current user"""
    db = get_session()
    try:
        question = db.get(InterviewQuestion, question_id)
        if not question:
            return jsonify({'error': 'Câu hỏi không tồn tại'}), 404
        existing = db.query(QuestionNote).filter_by(user_id=current_user.id, question_id=question_id).first()
        if not existing:
            note = QuestionNote(user_id=current_user.id, question_id=question_id)
            db.add(note)
            db.commit()
        return jsonify({'saved': True})
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving note: {e}")
        return jsonify({'error': 'Không thể lưu câu hỏi'}), 500
    finally:
        db.close()

@note_bp.route('/<int:question_id>/note', methods=['DELETE'])
@token_required
def delete_note(current_user, question_id):
    """Remove saved question"""
    db = get_session()
    try:
        note = db.query(QuestionNote).filter_by(user_id=current_user.id, question_id=question_id).first()
        if note:
            db.delete(note)
            db.commit()
        return jsonify({'saved': False})
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting note: {e}")
        return jsonify({'error': 'Không thể xóa câu hỏi đã lưu'}), 500
    finally:
        db.close()


@note_bp.route('/notes', methods=['GET'])
@token_required
def list_notes(current_user):
    """List all saved questions for current user"""
    db = get_session()
    try:
        query = (
            db.query(QuestionNote, InterviewQuestion, InterviewAnswer, InterviewSession)
            .join(InterviewQuestion, QuestionNote.question_id == InterviewQuestion.id)
            .outerjoin(InterviewAnswer, InterviewAnswer.question_id == InterviewQuestion.id)
            .join(InterviewSession, InterviewQuestion.session_id == InterviewSession.id)
            .filter(QuestionNote.user_id == current_user.id)
            .order_by(QuestionNote.created_at.desc())
        )
        results = []
        for note, question, answer, session in query.all():
            results.append({
                'id': question.id,
                'question': question.content,
                'category': session.field,
                'saved_at': note.created_at.isoformat() if note.created_at else None,
                'excerpt': (answer.answer or '')[:200] if answer else None,
                'score': answer.score if answer else None,
            })
        return jsonify({'saved': results})
    except Exception as e:
        logger.error(f"Error listing notes: {e}")
        return jsonify({'error': 'Không thể lấy danh sách câu hỏi đã lưu'}), 500
    finally:
        db.close()