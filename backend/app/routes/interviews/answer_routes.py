import os
import uuid
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

try:
    import cloudinary
    import cloudinary.uploader
except Exception as e:
    logging.warning(f"Cloudinary not available: {e}")
    cloudinary = None

from app.database import get_session, InterviewSession, InterviewQuestion, InterviewAnswer
from app.utils import token_required
from .utils import evaluate_audio_answer, evaluate_text_answer

logger = logging.getLogger(__name__)
answer_bp = Blueprint('answer', __name__)

# Cloudinary configuration
Cloud_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
Cloud_API_KEY = os.getenv("CLOUDINARY_API_KEY")
Cloud_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
Cloud_FOLDER = os.getenv("CLOUDINARY_AUDIO_FOLDER", "interview-audio")

if cloudinary and Cloud_NAME and Cloud_API_KEY and Cloud_API_SECRET:
    try:
        cloudinary.config(
            cloud_name=Cloud_NAME,
            api_key=Cloud_API_KEY,
            api_secret=Cloud_API_SECRET,
            secure=True,
        )
        logger.info("Cloudinary configured successfully")
    except Exception as e:
        logger.error(f"Failed to configure Cloudinary: {e}")

@answer_bp.route('/<int:session_id>/answer', methods=['POST'])
@token_required
def submit_answer(current_user, session_id):
    """Upload user's audio answer and evaluate with AI."""
    logger.info(f"🎤 Starting audio answer submission for session {session_id} by user {current_user.id}")
    db = get_session()
    try:
        # Validate session
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session or interview_session.user_id != current_user.id:
            logger.error(f"❌ Invalid session {session_id} for user {current_user.id}")
            return jsonify({'error': 'Phiên phỏng vấn không hợp lệ'}), 404

        if interview_session.status != 'dang_dien_ra':
            logger.warning(f"⚠️ Session {session_id} is not active (status: {interview_session.status})")
            return jsonify({'error': 'Phiên phỏng vấn đã kết thúc'}), 400

        # Get data from request
        data = request.form if request.form else {}
        question_id = int(data.get('question_id')) if data.get('question_id') else None
        audio_file = request.files.get('audio')
        text_answer = data.get('text_answer')

        logger.info(
            f"📋 Request data: question_id={question_id}, audio_file={'present' if audio_file else 'missing'}, text_answer={'present' if text_answer else 'missing'}"
        )

        if not question_id:
            logger.error("❌ Missing question_id in request")
            return jsonify({'error': 'Thiếu ID câu hỏi'}), 400
        if not audio_file and not text_answer:
            logger.error("❌ Missing audio file and text answer in request")
            return jsonify({'error': 'Thiếu dữ liệu câu trả lời'}), 400

        # Validate question
        question = db.get(InterviewQuestion, question_id)
        if not question or question.session_id != session_id:
            logger.error(f"❌ Invalid question {question_id} for session {session_id}")
            return jsonify({'error': 'Câu hỏi không hợp lệ'}), 404

        logger.info(f"✅ Question validation passed: {question_id}")

        audio_url = None
        eval_json = {}
        question_text = question.content if question else ''

        if audio_file:
            if not cloudinary or not Cloud_NAME:
                logger.warning("Cloudinary not configured")
                return jsonify({'error': 'Cloudinary chưa được cấu hình'}), 500
            try:
                if not audio_file.filename:
                    logger.warning("Audio file has no filename")
                else:
                    audio_file.seek(0, 2)
                    file_size = audio_file.tell()
                    audio_file.seek(0)

                    if file_size > 50 * 1024 * 1024:
                        logger.warning(f"Audio file too large: {file_size} bytes")
                        return jsonify({'error': 'File audio quá lớn (tối đa 50MB)'}), 400

                    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                    public_id = f"answer_{session_id}_{question_id}_{timestamp}_{uuid.uuid4().hex[:8]}"

                    logger.info(f"Uploading audio to Cloudinary: {public_id} ({file_size} bytes)")

                    upload_result = cloudinary.uploader.upload(
                        audio_file,
                        resource_type="video",
                        folder=Cloud_FOLDER,
                        public_id=public_id,
                        overwrite=True,
                    )

                    audio_url = upload_result.get('secure_url') or upload_result.get('url')
                    if not audio_url:
                        logger.error("❌ Cloudinary upload returned no URL")
                        return jsonify({'error': 'Upload audio thất bại'}), 500
                    logger.info(f"✅ Audio uploaded to Cloudinary: {audio_url}")

                logger.info(f"🎯 Starting evaluation for question ID: {question_id}")
                eval_json = evaluate_audio_answer(question_text, audio_url)
                logger.info("✅ Gemini evaluation completed successfully")
            except Exception as e:
                logger.error(f"❌ Error handling audio submission: {e}")
                return jsonify({'error': 'Không thể xử lý file audio'}), 500
        else:
            # Text answer path (e.g., skipped question)
            try:
                logger.info(f"🎯 Evaluating text answer for question ID: {question_id}")
                eval_json = evaluate_text_answer(question_text, text_answer)
                logger.info("✅ Text evaluation completed successfully")
            except Exception as e:
                logger.error(f"❌ Gemini evaluation failed: {e}")
                eval_json = {
                    'transcript': text_answer or '',
                    'score': 0,
                    'breakdown': {'speaking': 0, 'content': 0, 'relevance': 0},
                    'feedback': '',
                    'strengths': [],
                    'improvements': []
                }
                logger.warning(f"⚠️ Using fallback evaluation data: {eval_json}")

        logger.info("💾 Saving evaluation results to database...")
        
        # Extract and log scores
        overall_score = float(eval_json.get('score') or 0)
        speaking_score = float((eval_json.get('breakdown') or {}).get('speaking') or 0)
        content_score = float((eval_json.get('breakdown') or {}).get('content') or 0)
        relevance_score = float((eval_json.get('breakdown') or {}).get('relevance') or 0)
        
        logger.info(f"📊 Scores to save:")
        logger.info(f"   ⭐ Overall: {overall_score}")
        logger.info(f"   🗣️ Speaking: {speaking_score}")
        logger.info(f"   📚 Content: {content_score}")
        logger.info(f"   🎯 Relevance: {relevance_score}")
        
        answer = InterviewAnswer(
            session_id=session_id,
            question_id=question_id,
            feedback=eval_json.get('feedback') or None,
            score=overall_score,
            user_answer_audio_url=audio_url,
            transcript_text=eval_json.get('transcript') or None,
            speaking_score=speaking_score,
            content_score=content_score,
            relevance_score=relevance_score,
            strengths=eval_json.get('strengths') or [],
            improvements=eval_json.get('improvements') or [],
        )
        db.add(answer)
        db.commit()
        logger.info(f"✅ Answer saved to database successfully")

        response_data = {
            'audio_url': audio_url,
            'evaluation': eval_json,
            'message': 'Đã tải lên và đánh giá câu trả lời thành công',
            'next_question_available': interview_session.questions_asked < interview_session.question_limit
        }
        
        logger.info(f"🎉 Audio answer submission completed successfully")
        logger.info(f"📤 Returning response: {response_data}")
        
        return jsonify(response_data)
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error submitting audio answer: {e}")
        logger.error(f"🔍 Error details: {type(e).__name__}: {str(e)}")
        return jsonify({'error': 'Không thể gửi audio. Vui lòng thử lại.'}), 500
    finally:
        logger.info(f"🔒 Closing database connection for audio submission")
        db.close()


@answer_bp.route('/<int:session_id>/questions-answers', methods=['GET'])
@token_required
def get_questions_answers(current_user, session_id):
    """API trả về danh sách câu hỏi và câu trả lời chi tiết cho một session."""
    db = get_session()
    try:
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session or interview_session.user_id != current_user.id:
            return jsonify({'error': 'Phiên phỏng vấn không hợp lệ'}), 404

        questions = db.query(InterviewQuestion).filter_by(session_id=session_id).all()
        answers = db.query(InterviewAnswer).filter_by(session_id=session_id).all()
        answers_map = {a.question_id: a for a in answers}

        result = []
        for q in questions:
            a = answers_map.get(q.id)
            result.append({
                'question_id': q.id,
                'question': q.content,
                'answer': a.transcript_text if a else None,
                'feedback': a.feedback if a else None,
                'score': a.score if a else None,
                'audio_url': a.user_answer_audio_url if a else None,
                'created_at': q.created_at.isoformat() if q.created_at else None,
            })

        return jsonify({
            'questions_answers': result,
            'message': 'Lấy danh sách câu hỏi và câu trả lời thành công'
        })
    except Exception as e:
        logger.error(f"Error get_questions_answers: {e}")
        return jsonify({'error': 'Không thể lấy danh sách câu hỏi/câu trả lời'}), 500
    finally:
        db.close()




@answer_bp.route('/test-audio-upload', methods=['POST'])
def test_audio_upload():
    """Test endpoint để kiểm tra upload audio vào Cloudinary"""
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({'error': 'Không có file audio được gửi'}), 400
        if not cloudinary or not (Cloud_NAME and Cloud_API_KEY and Cloud_API_SECRET):
            return jsonify({'error': 'Cloudinary chưa được cấu hình'}), 500

        # Validate file
        if not audio_file.filename:
            return jsonify({'error': 'File không có tên'}), 400

        # Check file size
        audio_file.seek(0, 2)
        file_size = audio_file.tell()
        audio_file.seek(0)
        if file_size > 50 * 1024 * 1024:  # 50MB
            return jsonify({'error': f'File quá lớn: {file_size} bytes'}), 400

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        public_id = f"test_audio_{timestamp}_{uuid.uuid4().hex[:8]}"
        logger.info(f"Testing Cloudinary audio upload: {public_id} ({file_size} bytes)")

        result = cloudinary.uploader.upload(
            audio_file,
            resource_type="video",
            folder=Cloud_FOLDER,
            public_id=public_id,
            overwrite=True,
        )
        audio_url = result.get('secure_url') or result.get('url')
        if not audio_url:
            return jsonify({'error': 'Upload thất bại - không có URL trả về'}), 500

        return jsonify({
            'success': True,
            'message': 'Upload audio thành công',
            'public_id': result.get('public_id'),
            'file_size': file_size,
            'audio_url': audio_url,
            'duration': result.get('duration'),
            'format': result.get('format'),
        }), 200
    except Exception as e:
        logger.error(f"Error in test audio upload: {e}")
        return jsonify({'error': f'Lỗi upload: {str(e)}'}), 500
