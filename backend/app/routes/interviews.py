# interviews.py (Modified to remove fallbacks, handle AI errors properly, ensure data is stored in DB before returning, and fetch from DB for display)
from datetime import datetime, timedelta
import os
import json
import uuid
import requests
import logging
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:  # pragma: no cover - optional dependency
    from supabase import create_client
except Exception as e:  # pragma: no cover
    logger.warning(f"Supabase client not available: {e}")
    create_client = None

from app.database import (
    get_session,
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
)
from app.utils import token_required

interviews_bp = Blueprint('interviews', __name__, url_prefix='/interviews')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_AUDIO_BUCKET", "interview-audio")

# Log configuration status
logger.info(f"Supabase URL configured: {bool(SUPABASE_URL)}")
logger.info(f"Supabase Key configured: {bool(SUPABASE_KEY)}")
logger.info(f"Gemini API Key configured: {bool(os.getenv('GEMINI_API_KEY'))}")

supabase = None
if SUPABASE_URL and SUPABASE_KEY and create_client:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        supabase = None


def generate_question(prompt: str) -> str:
    """Generate interview question using Gemini API, optimized for interview practice."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment variables")
        raise ValueError("GEMINI_API_KEY not found in environment variables")

    try:
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
        )
        
        # Prompt được tối ưu cho luyện phỏng vấn
        enhanced_prompt = f"""
Bạn là một chuyên gia phỏng vấn giàu kinh nghiệm. Hãy tạo ra một câu hỏi phỏng vấn phù hợp với ngữ cảnh sau:

{prompt}

Yêu cầu:
- Câu hỏi phải rõ ràng, dễ hiểu và phù hợp với vị trí ứng tuyển
- Tập trung vào kỹ năng thực tế và kinh nghiệm làm việc
- Độ khó phù hợp với mức kinh nghiệm
- Câu hỏi mở để ứng viên có thể trình bày chi tiết
- Phù hợp với văn hóa doanh nghiệp Việt Nam

Chỉ trả về câu hỏi, không cần giải thích thêm.
"""
        
        payload = {"contents": [{"parts": [{"text": enhanced_prompt}]}]}
        
        logger.info(f"Calling Gemini API with prompt length: {len(enhanced_prompt)}")
        logger.info(f"API Endpoint: {endpoint}")
        
        resp = requests.post(endpoint, params={"key": api_key}, json=payload, timeout=30)
        
        logger.info(f"Gemini API response status: {resp.status_code}")
        
        if not resp.ok:
            logger.error(f"Gemini API error: {resp.status_code} - {resp.text}")
            raise RuntimeError(f"Gemini API returned {resp.status_code}: {resp.text}")
        
        data = resp.json()
        logger.info(f"Gemini API response structure: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
        
        if "candidates" not in data or not data["candidates"]:
            logger.error(f"Unexpected Gemini API response format: {data}")
            raise RuntimeError("Unexpected response format from Gemini API")
        
        question_text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        # Làm sạch text từ AI
        question_text = question_text.strip()
        if question_text.startswith('"') and question_text.endswith('"'):
            question_text = question_text[1:-1]
        
        logger.info(f"Generated question: {question_text[:100]}...")
        return question_text
        
    except requests.exceptions.Timeout:
        logger.error("Gemini API request timed out")
        raise RuntimeError("Request to Gemini API timed out. Please try again.")
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to Gemini API")
        raise RuntimeError("Failed to connect to Gemini API. Please check your internet connection.")
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {e}")
        raise RuntimeError(f"Network error: {e}")
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        raise RuntimeError("Invalid response from Gemini API")
    except KeyError as e:
        logger.error(f"Missing key in response: {e}")
        raise RuntimeError("Unexpected response format from Gemini API")
    except Exception as e:
        logger.error(f"Unexpected error generating question: {e}")
        raise RuntimeError(f"Error generating question: {e}")


def evaluate_answer(question: str, answer: str) -> tuple[str, float]:
    """Evaluate an answer using Gemini API with detailed criteria for interview practice."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment variables")
        raise ValueError("GEMINI_API_KEY not found in environment variables")

    try:
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
        )
        
        # Prompt đánh giá chi tiết cho luyện phỏng vấn
        evaluation_prompt = f"""
Bạn là một chuyên gia đánh giá phỏng vấn. Hãy đánh giá câu trả lời của ứng viên dựa trên các tiêu chí sau:

Câu hỏi: {question}
Câu trả lời: {answer}

Tiêu chí đánh giá (0-5 điểm):
- **Nội dung (1 điểm)**: Câu trả lời có đầy đủ thông tin, logic rõ ràng
- **Cấu trúc (1 điểm)**: Trình bày có tổ chức, dễ hiểu
- **Kinh nghiệm (1 điểm)**: Có ví dụ cụ thể, kinh nghiệm thực tế
- **Kỹ năng giao tiếp (1 điểm)**: Diễn đạt rõ ràng, tự tin
- **Phù hợp với vị trí (1 điểm)**: Câu trả lời liên quan đến yêu cầu công việc

Hãy trả về JSON với format:
{{
    "feedback": "Phản hồi chi tiết bằng tiếng Việt",
    "score": điểm_tổng,
    "breakdown": {{
        "content": điểm_nội_dung,
        "structure": điểm_cấu_trúc,
        "experience": điểm_kinh_nghiệm,
        "communication": điểm_giao_tiếp,
        "relevance": điểm_phù_hợp
    }},
    "suggestions": "Gợi ý cải thiện bằng tiếng Việt"
}}
"""
        
        payload = {"contents": [{"parts": [{"text": evaluation_prompt}]}]}
        
        logger.info(f"Calling Gemini API for evaluation with answer length: {len(answer)}")
        
        resp = requests.post(endpoint, params={"key": api_key}, json=payload, timeout=30)
        
        logger.info(f"Gemini API evaluation response status: {resp.status_code}")
        
        if not resp.ok:
            logger.error(f"Gemini API evaluation error: {resp.status_code} - {resp.text}")
            raise RuntimeError(f"Gemini API returned {resp.status_code}: {resp.text}")
        
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        try:
            parsed = json.loads(text)
            feedback = parsed.get("feedback", "Phản hồi đánh giá")
            score = float(parsed.get("score", 0.0))
            breakdown = parsed.get("breakdown", {})
            suggestions = parsed.get("suggestions", "")
            
            # Tạo feedback chi tiết
            detailed_feedback = f"{feedback}\n\nĐiểm chi tiết:\n"
            if breakdown:
                for key, value in breakdown.items():
                    key_names = {
                        "content": "Nội dung",
                        "structure": "Cấu trúc", 
                        "experience": "Kinh nghiệm",
                        "communication": "Giao tiếp",
                        "relevance": "Phù hợp vị trí"
                    }
                    detailed_feedback += f"- {key_names.get(key, key)}: {value}/1 điểm\n"
            
            if suggestions:
                detailed_feedback += f"\nGợi ý cải thiện:\n{suggestions}"
            
            logger.info(f"Evaluation completed - Score: {score}")
            return detailed_feedback, score
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error in evaluation response: {e}")
            logger.error(f"Raw response text: {text}")
            raise RuntimeError(f"Error parsing evaluation response: {e}")
            
    except requests.exceptions.Timeout:
        logger.error("Gemini API evaluation request timed out")
        raise RuntimeError("Request to Gemini API timed out. Please try again.")
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to Gemini API for evaluation")
        raise RuntimeError("Failed to connect to Gemini API. Please check your internet connection.")
    except requests.exceptions.RequestException as e:
        logger.error(f"Evaluation request error: {e}")
        raise RuntimeError(f"Network error during evaluation: {e}")
    except Exception as e:
        logger.error(f"Unexpected error evaluating answer: {e}")
        raise RuntimeError(f"Error evaluating answer: {e}")


def summarize_transcript(transcript: list[dict], session: InterviewSession | None = None) -> str:
    """Summarize the interview transcript using Gemini API with focus on learning outcomes."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment variables")
        raise ValueError("GEMINI_API_KEY not found in environment variables")

    try:
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
        )
        
        conversation = "\n".join(
            f"Câu hỏi {i+1}: {t['question']}\nTrả lời: {t['answer']}\nĐiểm: {t['score']}/5\nPhản hồi: {t['feedback']}\n" 
            for i, t in enumerate(transcript)
        )
        
        # Prompt tóm tắt tập trung vào kết quả học tập
        summary_prompt = f"""
Bạn là một chuyên gia tư vấn nghề nghiệp. Hãy tóm tắt buổi phỏng vấn luyện tập này:

Thông tin phiên phỏng vấn:
- Vị trí: {session.role if session else 'N/A'} - {session.position if session else 'N/A'}
- Lĩnh vực: {session.field if session else 'N/A'} / {session.specialization if session else 'N/A'}
- Kinh nghiệm: {session.experience_level if session else 'N/A'}

Nội dung phỏng vấn:
{conversation}

Hãy tóm tắt:
1. **Tổng quan**: Đánh giá tổng thể về buổi phỏng vấn
2. **Điểm mạnh**: Những điểm tốt của ứng viên
3. **Điểm cần cải thiện**: Những lĩnh vực cần phát triển
4. **Khuyến nghị**: Gợi ý cụ thể để cải thiện kỹ năng phỏng vấn
5. **Đánh giá tổng thể**: Xếp loại từ A+ đến D

Trả về tóm tắt bằng tiếng Việt, ngắn gọn nhưng đầy đủ thông tin.
"""
        
        payload = {"contents": [{"parts": [{"text": summary_prompt}]}]}
        resp = requests.post(endpoint, params={"key": api_key}, json=payload, timeout=30)
        
        logger.info(f"Gemini API summary response status: {resp.status_code}")
        
        if not resp.ok:
            logger.error(f"Gemini API summary error: {resp.status_code} - {resp.text}")
            raise RuntimeError(f"Gemini API returned {resp.status_code}: {resp.text}")
        
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
        
    except requests.exceptions.Timeout:
        logger.error("Gemini API summary request timed out")
        raise RuntimeError("Request to Gemini API timed out. Please try again.")
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to Gemini API for summary")
        raise RuntimeError("Failed to connect to Gemini API. Please check your internet connection.")
    except Exception as e:
        logger.error(f"Error summarizing transcript: {e}")
        raise RuntimeError(f"Error summarizing transcript: {e}")


@interviews_bp.route('/session', methods=['POST'])
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
    
    # Validate required fields
    required_fields = ['role', 'position', 'field', 'specialization', 'experience', 'time_limit', 'question_limit']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        logger.warning(f"Missing required fields: {missing_fields}")
        return jsonify({
            'error': 'Thiếu thông tin bắt buộc',
            'missing_fields': missing_fields
        }), 400

    # Validate data types and ranges
    try:
        time_limit = int(data.get('time_limit'))
        question_limit = int(data.get('question_limit'))
        
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
            role=data.get('role'),
            position=data.get('position'),
            field=data.get('field'),
            specialization=data.get('specialization'),
            experience_level=data.get('experience'),
            time_limit=time_limit,
            question_limit=question_limit,
            status='dang_dien_ra',
            mode=data.get('mode', 'voice'),  # Default to voice mode for mobile app
            difficulty_setting=data.get('difficulty', 'medium'),
            expires_at=expires_at,
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


@interviews_bp.route('/<int:session_id>/question', methods=['GET'])
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
            f"Tạo câu hỏi phỏng vấn cho vị trí {interview_session.role} - {interview_session.position} "
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


@interviews_bp.route('/<int:session_id>/answer', methods=['POST'])
@token_required
def submit_answer(current_user, session_id):
    """Submit answer for a question in the interview session."""
    db = get_session()
    try:
        # Validate session
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session or interview_session.user_id != current_user.id:
            return jsonify({'error': 'Phiên phỏng vấn không hợp lệ'}), 404

        if interview_session.status != 'dang_dien_ra':
            return jsonify({'error': 'Phiên phỏng vấn đã kết thúc'}), 400

        # Get data from request
        data = request.form if request.form else {}
        answer_text = data.get('answer')
        question_id = int(data.get('question_id')) if data.get('question_id') else None
        audio_file = request.files.get('audio')

        if not answer_text or not question_id:
            return jsonify({'error': 'Thiếu câu trả lời hoặc ID câu hỏi'}), 400

        # Get question
        question = db.get(InterviewQuestion, question_id)
        if not question or question.session_id != session_id:
            return jsonify({'error': 'Câu hỏi không hợp lệ'}), 404

        # Create context for evaluation
        context = (
            f"Vị trí: {interview_session.role} - {interview_session.position}\n"
            f"Lĩnh vực: {interview_session.field}/{interview_session.specialization}\n"
            f"Kinh nghiệm: {interview_session.experience_level}\n"
            f"Độ khó: {interview_session.difficulty_setting}"
        )
        full_question = f"{context}\n\nCâu hỏi: {question.content}"
        
        # Evaluate answer using AI
        feedback, score = evaluate_answer(full_question, answer_text)

        # Handle audio file upload
        audio_url = None
        if audio_file:
            if supabase:
                try:
                    # Validate audio file
                    if not audio_file.filename:
                        logger.warning("Audio file has no filename")
                        audio_url = None
                    else:
                        # Validate file size (max 50MB)
                        audio_file.seek(0, 2)  # Seek to end
                        file_size = audio_file.tell()
                        audio_file.seek(0)  # Reset to beginning
                        
                        if file_size > 50 * 1024 * 1024:  # 50MB limit
                            logger.warning(f"Audio file too large: {file_size} bytes")
                            audio_url = None
                        else:
                            # Generate unique filename with timestamp
                            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                            file_extension = os.path.splitext(audio_file.filename)[1] or '.m4a'
                            filename = f"answer_{session_id}_{question_id}_{timestamp}_{uuid.uuid4().hex[:8]}{file_extension}"
                            
                            logger.info(f"Uploading audio file: {filename} ({file_size} bytes)")
                            
                            # Read file content
                            file_content = audio_file.read()
                            
                            # Upload to Supabase with proper content type
                            content_type = audio_file.content_type or "audio/m4a"
                            if not content_type.startswith('audio/'):
                                content_type = "audio/m4a"
                            
                            # Upload with metadata
                            upload_result = supabase.storage.from_(SUPABASE_BUCKET).upload(
                                filename,
                                file_content,
                                {
                                    "content-type": content_type,
                                    "cache-control": "public, max-age=31536000",
                                    "x-upsert": "true"  # Overwrite if exists
                                }
                            )
                            
                            if upload_result:
                                # Get public URL
                                audio_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(filename)
                                logger.info(f"✅ Audio uploaded successfully: {audio_url}")
                                
                                # Verify upload by checking if file exists
                                try:
                                    file_info = supabase.storage.from_(SUPABASE_BUCKET).list(path="", search=filename)
                                    if not file_info or len(file_info) == 0:
                                        logger.error(f"❌ File not found after upload: {filename}")
                                        audio_url = None
                                except Exception as verify_error:
                                    logger.error(f"❌ Error verifying upload: {verify_error}")
                                    audio_url = None
                            else:
                                logger.error("❌ Upload result is empty")
                                audio_url = None

                except Exception as e:
                    logger.error(f"❌ Error uploading audio: {e}")
                    # Continue without audio if upload fails
                    audio_url = None
            else:
                logger.warning("Supabase not configured, skipping audio upload")
                audio_url = None

        # Save answer to DB before returning
        answer = InterviewAnswer(
            session_id=session_id,
            question_id=question_id,
            answer=answer_text,
            feedback=feedback,
            score=score,
            user_answer_audio_url=audio_url,
        )
        db.add(answer)
        db.commit()

        return jsonify({
            'feedback': feedback,
            'score': score,
            'audio_url': audio_url,
            'message': 'Gửi câu trả lời thành công',
            'next_question_available': interview_session.questions_asked < interview_session.question_limit
        })
        
    except RuntimeError as e:
        db.rollback()
        print(f"AI error: {e}")
        return jsonify({'error': 'Không thể kết nối với AI để đánh giá câu trả lời. Vui lòng thử lại sau.'}), 503
    except Exception as e:
        db.rollback()
        print(f"Error submitting answer: {e}")
        return jsonify({'error': 'Không thể gửi câu trả lời. Vui lòng thử lại.'}), 500
    finally:
        db.close()


@interviews_bp.route('/<int:session_id>/finish', methods=['POST'])
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
        interview_session.overall_score = total_score
        interview_session.completed_at = datetime.utcnow()
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
                'role': interview_session.role,
                'position': interview_session.position,
                'experience_level': interview_session.experience_level,
                'difficulty': interview_session.difficulty_setting
            },
            'message': 'Hoàn thành phiên phỏng vấn thành công'
        })
        
    except RuntimeError as e:
        db.rollback()
        print(f"AI error: {e}")
        return jsonify({'error': 'Không thể kết nối với AI để tóm tắt kết quả. Vui lòng thử lại sau.'}), 503
    except Exception as e:
        db.rollback()
        print(f"Error finishing session: {e}")
        return jsonify({'error': 'Không thể hoàn thành phiên phỏng vấn. Vui lòng thử lại.'}), 500
    finally:
        db.close()


@interviews_bp.route('/history', methods=['GET'])
@token_required
def get_interview_history(current_user):
    """Get interview practice history for the current user from DB."""
    db = get_session()
    try:
        # Get all completed sessions from DB
        sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == 'da_hoan_thanh'
        ).order_by(InterviewSession.completed_at.desc()).all()

        history = []
        for session in sessions:
            # Get basic session info
            session_info = {
                'id': session.id,
                'role': session.role,
                'position': session.position,
                'field': session.field,
                'specialization': session.specialization,
                'experience_level': session.experience_level,
                'time_limit': session.time_limit,
                'question_limit': session.question_limit,
                'overall_score': session.overall_score,
                'completed_at': session.completed_at.isoformat() if session.completed_at else None,
                'difficulty_setting': session.difficulty_setting,
                'mode': session.mode
            }

            # Get question count from DB
            question_count = db.query(InterviewQuestion).filter_by(session_id=session.id).count()
            session_info['questions_answered'] = question_count

            # Calculate average score if available
            if session.overall_score and question_count > 0:
                session_info['average_score'] = round(session.overall_score / question_count, 2)
                session_info['score_percentage'] = round((session.overall_score / (question_count * 5)) * 100, 1)
            else:
                session_info['average_score'] = 0
                session_info['score_percentage'] = 0

            history.append(session_info)

        return jsonify({
            'history': history,
            'total_sessions': len(history),
            'message': 'Lấy lịch sử phỏng vấn thành công'
        })
        
    except Exception as e:
        print(f"Error getting history: {e}")
        return jsonify({'error': 'Không thể lấy lịch sử phỏng vấn. Vui lòng thử lại.'}), 500
    finally:
        db.close()


@interviews_bp.route('/<int:session_id>', methods=['GET'])
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
            'role': interview_session.role,
            'position': interview_session.position,
            'field': interview_session.field,
            'specialization': interview_session.specialization,
            'experience_level': interview_session.experience_level,
            'time_limit': interview_session.time_limit,
            'question_limit': interview_session.question_limit,
            'status': interview_session.status,
            'overall_score': interview_session.overall_score,
            'created_at': interview_session.created_at.isoformat() if interview_session.created_at else None,
            'expires_at': interview_session.expires_at.isoformat() if interview_session.expires_at else None,
            'completed_at': interview_session.completed_at.isoformat() if interview_session.completed_at else None,
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
        print(f"Error getting session details: {e}")
        return jsonify({'error': 'Không thể lấy thông tin phiên phỏng vấn. Vui lòng thử lại.'}), 500
    finally:
        db.close()


@interviews_bp.route('/test-audio-upload', methods=['POST'])
def test_audio_upload():
    """Test endpoint để kiểm tra upload audio vào Supabase"""
    try:
        audio_file = request.files.get('audio')
        
        if not audio_file:
            return jsonify({'error': 'Không có file audio được gửi'}), 400
        
        if not supabase:
            return jsonify({'error': 'Supabase chưa được cấu hình'}), 500
        
        # Validate file
        if not audio_file.filename:
            return jsonify({'error': 'File không có tên'}), 400
        
        # Check file size
        audio_file.seek(0, 2)
        file_size = audio_file.tell()
        audio_file.seek(0)
        
        if file_size > 50 * 1024 * 1024:  # 50MB
            return jsonify({'error': f'File quá lớn: {file_size} bytes'}), 400
        
        # Generate test filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(audio_file.filename)[1] or '.m4a'
        filename = f"test_audio_{timestamp}_{uuid.uuid4().hex[:8]}{file_extension}"
        
        logger.info(f"Testing audio upload: {filename} ({file_size} bytes)")
        
        # Read file content
        file_content = audio_file.read()
        
        # Upload to Supabase
        content_type = audio_file.content_type or "audio/m4a"
        if not content_type.startswith('audio/'):
            content_type = "audio/m4a"
        
        upload_result = supabase.storage.from_(SUPABASE_BUCKET).upload(
            filename,
            file_content,
            {
                "content-type": content_type,
                "cache-control": "public, max-age=31536000"
            }
        )
        
        if upload_result:
            # Get public URL
            audio_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(filename)
            
            # Verify upload
            try:
                file_info = supabase.storage.from_(SUPABASE_BUCKET).list(path="", search=filename)
                if file_info and len(file_info) > 0:
                    return jsonify({
                        'success': True,
                        'message': 'Upload audio thành công',
                        'filename': filename,
                        'file_size': file_size,
                        'audio_url': audio_url,
                        'content_type': content_type
                    }), 200
                else:
                    return jsonify({'error': 'Không thể xác minh file sau khi upload'}), 500
            except Exception as verify_error:
                logger.error(f"Error verifying upload: {verify_error}")
                return jsonify({'error': f'Lỗi xác minh upload: {verify_error}'}), 500
        else:
            return jsonify({'error': 'Upload thất bại - không có kết quả'}), 500
            
    except Exception as e:
        logger.error(f"Error in test audio upload: {e}")
        return jsonify({'error': f'Lỗi upload: {str(e)}'}), 500


@interviews_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    """Get comprehensive statistics for the current user's interview practice from DB."""
    db = get_session()
    try:
        # Get all sessions from DB
        all_sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == current_user.id
        ).all()
        
        completed_sessions = [s for s in all_sessions if s.status == 'da_hoan_thanh']
        ongoing_sessions = [s for s in all_sessions if s.status == 'dang_dien_ra']

        # Calculate statistics
        total_sessions = len(all_sessions)
        total_completed = len(completed_sessions)
        total_ongoing = len(ongoing_sessions)
        
        # Score statistics
        total_score = sum(s.overall_score or 0 for s in completed_sessions)
        average_score = total_score / total_completed if total_completed > 0 else 0
        
        # Field distribution
        field_stats = {}
        for session in completed_sessions:
            field = session.field
            if field not in field_stats:
                field_stats[field] = {'count': 0, 'total_score': 0}
            field_stats[field]['count'] += 1
            field_stats[field]['total_score'] += session.overall_score or 0

        # Calculate field averages
        for field in field_stats:
            field_stats[field]['average_score'] = round(
                field_stats[field]['total_score'] / field_stats[field]['count'], 2
            )

        # Recent performance (last 5 sessions)
        recent_scores = [
            s.overall_score or 0 for s in completed_sessions[:5]
        ] if completed_sessions else []

        stats = {
            'total_sessions': total_sessions,
            'completed_sessions': total_completed,
            'ongoing_sessions': total_ongoing,
            'completion_rate': round((total_completed / total_sessions * 100) if total_sessions > 0 else 0, 1),
            'total_score': total_score,
            'average_score': round(average_score, 2),
            'field_distribution': field_stats,
            'recent_performance': recent_scores,
            'performance_trend': 'improving' if len(recent_scores) >= 2 and recent_scores[0] > recent_scores[-1] else 'stable'
        }

        return jsonify({
            'stats': stats,
            'message': 'Lấy thống kê thành công'
        })
        
    except Exception as e:
        print(f"Error getting stats: {e}")
        return jsonify({'error': 'Không thể lấy thống kê. Vui lòng thử lại.'}), 500
    finally:
        db.close()