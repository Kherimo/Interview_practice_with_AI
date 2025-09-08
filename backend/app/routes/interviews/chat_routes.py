import os
import logging
import requests
from flask import Blueprint, request, jsonify
from app.utils import token_required

logger = logging.getLogger(__name__)

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/chat', methods=['POST'])
@token_required
def chat_with_bot(current_user):
    """Handle chat messages by forwarding to Gemini with interview-only prompt."""
    data = request.get_json() or {}
    question = data.get('question')
    if not question:
        return jsonify({'error': 'Missing question'}), 400
    previous_answer = data.get('previousAnswer')

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        logger.error('GEMINI_API_KEY not configured')
        return jsonify({'error': 'GEMINI_API_KEY not configured'}), 500

    prompt = (
        "Bạn là một trợ lý phỏng vấn thông minh. Chỉ trả lời các câu hỏi liên quan đến "
        "phỏng vấn, tuyển dụng, CV và kỹ năng xin việc. Nếu câu hỏi nằm ngoài các "
        "chủ đề trên, hãy trả lời: 'Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi về phỏng vấn. "
        "Tôi có thể hỗ trợ về chuẩn bị CV, kỹ năng phỏng vấn và các câu hỏi tuyển dụng. "
        "Ví dụ: \"Cách trả lời điểm mạnh của bản thân?\", \"CV nên có những mục gì?\", \"Những câu hỏi phỏng vấn Java phổ biến?\"'\n"
    )
    if previous_answer:
        prompt += f"Câu trả lời trước: {previous_answer}\n"
    prompt += f"Câu hỏi: {question}\nTrả lời bằng tiếng Việt, ngắn gọn và hữu ích."

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash-lite:generateContent"
    )

    try:
        resp = requests.post(endpoint, params={"key": api_key}, json=payload, timeout=30)
        if not resp.ok:
            logger.error(f"Gemini API error: {resp.status_code} - {resp.text}")
            return jsonify({'error': 'Gemini API error'}), resp.status_code

        data = resp.json()
        answer = data["candidates"][0]["content"]["parts"][0]["text"]
        return jsonify({'answer': answer.strip()})
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error calling Gemini: {e}")
        return jsonify({'error': 'Không thể kết nối với dịch vụ AI'}), 503
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Lỗi không xác định'}), 500