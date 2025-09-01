from datetime import datetime
import logging
from flask import Blueprint, request, jsonify
from app.database import get_session, InterviewSession, InterviewQuestion
from app.utils import token_required
from .utils import generate_question

logger = logging.getLogger(__name__)
question_bp = Blueprint('question', __name__)

@question_bp.route('/<int:session_id>/question', methods=['GET'])
@question_bp.route('/<int:session_id>/next-question', methods=['GET'])
@token_required
def get_question(current_user, session_id):
    """Get next question for interview practice session."""
    logger.info(f"Getting question for session {session_id}, user {current_user.id}")
    
    db = get_session()
    try:
        # Validate session
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session:
            logger.warning(f"Session {session_id} not found")
            return jsonify({'error': 'Phiên phỏng vấn không tồn tại'}), 404
            
        if interview_session.user_id != current_user.id:
            logger.warning(f"User {current_user.id} not authorized for session {session_id}")
            return jsonify({'error': 'Không có quyền truy cập phiên phỏng vấn này'}), 403
            
        if interview_session.status != 'dang_dien_ra':
            logger.warning(f"Session {session_id} is not active (status: {interview_session.status})")
            return jsonify({'error': 'Phiên phỏng vấn đã kết thúc'}), 400

        # Check question limit
        asked_questions = db.query(InterviewQuestion).filter_by(session_id=session_id).all()
        if interview_session.question_limit and len(asked_questions) >= interview_session.question_limit:
            logger.info(f"Question limit reached for session {session_id}")
            return jsonify({'error': 'Đã đạt giới hạn số câu hỏi'}), 400

        # Check time limit
        if interview_session.expires_at and datetime.utcnow() > interview_session.expires_at:
            logger.warning(f"Session {session_id} has expired")
            return jsonify({'error': 'Phiên phỏng vấn đã hết thời gian'}), 400

        # Generate context-aware question
        history = [q.content for q in asked_questions]
        context_prompt = (
            f"Tạo câu hỏi phỏng vấn cho vị trí "
            f"trong lĩnh vực {interview_session.field}/{interview_session.specialization} "
            f"với kinh nghiệm {interview_session.experience_level}. "
            f"Độ khó: {interview_session.difficulty_setting}."
        )
        
        if history:
            context_prompt += f"\nCác câu hỏi đã hỏi: {' | '.join(history[:3])}"  # Chỉ lấy 3 câu gần nhất

        logger.info(f"Generating question with context: {context_prompt[:200]}...")
        question_text = generate_question(context_prompt)

        # Save question to DB before returning
        question = InterviewQuestion(session_id=session_id, content=question_text)
        db.add(question)
        interview_session.questions_asked = (interview_session.questions_asked or 0) + 1
        db.commit()

        logger.info(f"Question generated and saved: {question.id}")

        return jsonify({
            'question': question_text,
            'question_id': question.id,
            'question_number': len(asked_questions) + 1,
            'total_questions': interview_session.question_limit,
        })
        
    except RuntimeError as e:
        db.rollback()
        logger.error(f"AI error in get_question: {e}")
        return jsonify({'error': 'Không thể kết nối với AI để tạo câu hỏi. Vui lòng thử lại sau.'}), 503
    except Exception as e:
        db.rollback() 
        logger.error(f"Error getting question: {e}")
        return jsonify({'error': 'Không thể lấy câu hỏi. Vui lòng thử lại.'}), 500
    finally:
        db.close()


