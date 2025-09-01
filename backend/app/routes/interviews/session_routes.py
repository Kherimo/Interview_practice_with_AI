from datetime import datetime, timedelta
import logging
from flask import Blueprint, request, jsonify
from app.database import get_session, InterviewSession
from app.utils import token_required
from .utils import summarize_transcript

logger = logging.getLogger(__name__)
session_bp = Blueprint('session', __name__)

@session_bp.route('/session', methods=['POST'])
@session_bp.route('/start', methods=['POST'])
@token_required
def create_session(current_user):
    """Create a new interview practice session."""
    logger.info(f"Creating session for user {current_user.id}")
    
    try:
        data = request.get_json(force=True)
        logger.info(f"Session creation data: {data}")
    except Exception as e:
        logger.error(f"Error parsing JSON data: {e}")
        return jsonify({'error': 'Dữ liệu không hợp lệ'}), 400
    
    # Normalize keys to support snake_case from mobile client
    normalized = {
        'field': data.get('field'),
        'specialization': data.get('specialization'),
        'experience_level': data.get('experience_level') or data.get('experience'),
        'time_limit': data.get('time_limit'),
        'question_limit': data.get('question_limit'),
        'mode': data.get('mode', 'voice'),
        'difficulty_setting': data.get('difficulty_setting') or data.get('difficulty') or 'medium',
    }

    # Validate required fields (mobile sends field, specialization, experience_level, time_limit, question_limit)
    required_fields = ['field', 'specialization', 'experience_level', 'time_limit', 'question_limit']
    missing_fields = [field for field in required_fields if not normalized.get(field)]
    
    if missing_fields:
        logger.warning(f"Missing required fields: {missing_fields}")
        return jsonify({
            'error': 'Thiếu thông tin bắt buộc',
            'missing_fields': missing_fields
        }), 400

    # Validate data types and ranges
    try:
        time_limit = int(normalized.get('time_limit'))
        question_limit = int(normalized.get('question_limit'))
        
        if time_limit < 5 or time_limit > 120:
            logger.warning(f"Invalid time_limit: {time_limit}")
            return jsonify({'error': 'Thời gian phỏng vấn phải từ 5-120 phút'}), 400
        
        if question_limit < 1 or question_limit > 20:
            logger.warning(f"Invalid question_limit: {question_limit}")
            return jsonify({'error': 'Số câu hỏi phải từ 1-20'}), 400
            
    except (ValueError, TypeError) as e:
        logger.error(f"Data type validation error: {e}")
        return jsonify({'error': 'Thời gian và số câu hỏi phải là số nguyên'}), 400

    expires_at = datetime.utcnow() + timedelta(minutes=time_limit)
    db = get_session()
    
    try:
        interview_session = InterviewSession(
            user_id=current_user.id,
            field=normalized.get('field'),
            specialization=normalized.get('specialization'),
            experience_level=normalized.get('experience_level'),
            time_limit=time_limit,
            question_limit=question_limit,
            status='dang_dien_ra',
            mode=normalized.get('mode') or 'voice',  # Default to voice mode for mobile app
            difficulty_setting=normalized.get('difficulty_setting') or 'medium',
            expires_at=expires_at,
            created_at=datetime.utcnow(),  # Ensure created_at is set
        )
        
        db.add(interview_session)
        db.commit()
        
        logger.info(f"Session created successfully: {interview_session.id}")
        
        return jsonify({
            'session_id': interview_session.id,
            'expires_at': expires_at.isoformat(),
            'message': 'Tạo phiên phỏng vấn thành công'
        }), 201
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating session: {e}")
        return jsonify({'error': 'Không thể tạo phiên phỏng vấn. Vui lòng thử lại.'}), 500
    finally:
        db.close()


@session_bp.route('/<int:session_id>/finish', methods=['POST'])
@token_required
def finish_session(current_user, session_id):
    """Finish interview practice session and generate comprehensive results."""
    db = get_session()
    try:
        # Validate session
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session or interview_session.user_id != current_user.id:
            return jsonify({'error': 'Phiên phỏng vấn không hợp lệ'}), 404

        # Get all answers and questions from DB
        answers = db.query(InterviewAnswer).filter_by(session_id=session_id).all()
        if not answers:
            return jsonify({'error': 'Không có câu trả lời nào để đánh giá'}), 400

        # Calculate scores and statistics
        total_score = sum(a.score or 0 for a in answers)
        max_possible_score = len(answers) * 5
        average_score = total_score / len(answers) if answers else 0
        score_percentage = (total_score / max_possible_score) * 100 if max_possible_score > 0 else 0

        # Create detailed transcript from DB
        transcript = []
        for ans in answers:
            question = db.get(InterviewQuestion, ans.question_id)
            transcript.append({
                'question_id': ans.question_id,
                'question': question.content if question else '',
                'answer': ans.answer,
                'feedback': ans.feedback,
                'score': ans.score,
                'audio_url': ans.user_answer_audio_url,
            })

        # Generate comprehensive summary using AI
        summary = summarize_transcript(transcript, interview_session)

        # Determine performance level
        if score_percentage >= 90:
            performance_level = "Xuất sắc (A+)"
        elif score_percentage >= 80:
            performance_level = "Tốt (A)"
        elif score_percentage >= 70:
            performance_level = "Khá (B+)"
        elif score_percentage >= 60:
            performance_level = "Trung bình khá (B)"
        elif score_percentage >= 50:
            performance_level = "Trung bình (C)"
        else:
            performance_level = "Cần cải thiện (D)"

        # Update session in DB before returning
        interview_session.status = 'da_hoan_thanh'
        db.commit()

        return jsonify({
            'session_id': interview_session.id,
            'summary': summary,
            'total_score': total_score,
            'max_possible_score': max_possible_score,
            'average_score': round(average_score, 2),
            'score_percentage': round(score_percentage, 1),
            'performance_level': performance_level,
            'transcript': transcript,
            'session_stats': {
                'total_questions': len(answers),
                'questions_asked': interview_session.questions_asked,
                'time_limit': interview_session.time_limit,
                'field': interview_session.field,
                'specialization': interview_session.specialization,
                'experience_level': interview_session.experience_level,
                'difficulty': interview_session.difficulty_setting
            },
            'message': 'Hoàn thành phiên phỏng vấn thành công'
        })
        
    except RuntimeError as e:
        db.rollback()
        logger.error(f"AI error: {e}")
        return jsonify({'error': 'Không thể kết nối với AI để tóm tắt kết quả. Vui lòng thử lại sau.'}), 503
    except Exception as e:
        db.rollback()
        logger.error(f"Error finishing session: {e}")
        return jsonify({'error': 'Không thể hoàn thành phiên phỏng vấn. Vui lòng thử lại.'}), 500
    finally:
        db.close()


@session_bp.route('/<int:session_id>', methods=['GET'])
@token_required
def get_session_details(current_user, session_id):
    """Get detailed information about a specific interview session from DB."""
    db = get_session()
    try:
        # Get session from DB
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session or interview_session.user_id != current_user.id:
            return jsonify({'error': 'Phiên phỏng vấn không hợp lệ'}), 404

        # Get questions and answers from DB
        questions = db.query(InterviewQuestion).filter_by(session_id=session_id).all()
        answers = db.query(InterviewAnswer).filter_by(session_id=session_id).all()

        # Create detailed session info
        session_details = {
            'id': interview_session.id,
            'field': interview_session.field,
            'specialization': interview_session.specialization,
            'experience_level': interview_session.experience_level,
            'time_limit': interview_session.time_limit,
            'question_limit': interview_session.question_limit,
            'status': interview_session.status,
            'created_at': interview_session.created_at.isoformat() if interview_session.created_at else None,
            'expires_at': interview_session.expires_at.isoformat() if interview_session.expires_at else None,
            'difficulty_setting': interview_session.difficulty_setting,
            'mode': interview_session.mode,
            'questions': [
                {
                    'id': q.id,
                    'content': q.content,
                    'answer': next((a for a in answers if a.question_id == q.id), None)
                }
                for q in questions
            ]
        }

        return jsonify({
            'session': session_details,
            'message': 'Lấy thông tin phiên phỏng vấn thành công'
        })
        
    except Exception as e:
        logger.error(f"Error getting session details: {e}")
        return jsonify({'error': 'Không thể lấy thông tin phiên phỏng vấn. Vui lòng thử lại.'}), 500
    finally:
        db.close()
