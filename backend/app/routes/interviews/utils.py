import os
import json
import requests
import logging
from datetime import datetime, timedelta
from app.database import InterviewSession, InterviewQuestion, InterviewAnswer

logger = logging.getLogger(__name__)

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


def evaluate_audio_answer(question_text: str, audio_url: str) -> dict:
    """Send prompt to Gemini to evaluate an audio answer. Returns strict JSON dict."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
    )

    prompt = f"""
Bạn là một chuyên gia phỏng vấn. Hãy nghe file audio câu trả lời của ứng viên ở URL sau và đánh giá dựa trên câu hỏi.

Câu hỏi: {question_text}
Audio URL: {audio_url}

Yêu cầu:
- Tạo transcript văn bản tiếng Việt của câu trả lời trong file audio.
- Chấm điểm tổng thể theo thang 0-10.
- Chấm chi tiết theo 3 tiêu chí (0-10): speaking, content, relevance.
- Viết phần feedback ngắn gọn, súc tích.
- Liệt kê strengths (3-5 điểm mạnh) và improvements (3-5 điểm cần cải thiện).

BẮT BUỘC TRẢ VỀ JSON HỢP LỆ, ĐÚNG CHUẨN, KHÔNG THÊM GIẢI THÍCH, VỚI CẤU TRÚC:
{{
  "transcript": "văn bản transcript tiếng Việt",
  "score": 8.5,
  "breakdown": {{ 
    "speaking": 8.0, 
    "content": 9.0, 
    "relevance": 8.5 
  }},
  "feedback": "feedback ngắn gọn về câu trả lời",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
  "improvements": ["điểm cần cải thiện 1", "điểm cần cải thiện 2", "điểm cần cải thiện 3"]
}}

Lưu ý: Chỉ trả về JSON thuần túy, không bọc trong markdown code blocks, không thêm text nào khác.
"""

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    logger.info(f"📤 Sending request to Gemini API...")
    logger.info(f"📝 Prompt length: {len(prompt)} characters")
    logger.info(f"📋 Prompt preview: {prompt[:200]}...")
    
    try:
        resp = requests.post(endpoint, params={"key": api_key}, json=payload, timeout=60)
        logger.info(f"📥 Gemini API response status: {resp.status_code}")
        
        if not resp.ok:
            logger.error(f"❌ Gemini API error: {resp.status_code} - {resp.text}")
            raise RuntimeError(f"Gemini API returned {resp.status_code}: {resp.text}")
        
        data = resp.json()
        logger.info(f"📋 Gemini raw response data: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
        # Extract text from response
        if "candidates" not in data or not data["candidates"]:
            logger.error(f"❌ No candidates in Gemini response: {data}")
            raise RuntimeError("No candidates in Gemini response")
            
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        logger.info(f"📝 Gemini response text: {text}")
        
        # Clean text - remove markdown code blocks if present
        cleaned_text = text.strip()
        if cleaned_text.startswith("```json"):
            # Remove ```json and ``` markers
            cleaned_text = cleaned_text.replace("```json", "").replace("```", "").strip()
        elif cleaned_text.startswith("```"):
            # Remove ``` markers
            cleaned_text = cleaned_text.replace("```", "").strip()
        
        logger.info(f"🧹 Cleaned text for JSON parsing: {cleaned_text[:200]}...")
        
        # Parse JSON from cleaned text
        parsed = json.loads(cleaned_text)
        logger.info(f"✅ Successfully parsed Gemini JSON: {json.dumps(parsed, indent=2, ensure_ascii=False)}")
        
        # Validate required fields
        required_fields = ['transcript', 'score', 'breakdown', 'feedback', 'strengths', 'improvements']
        missing_fields = [field for field in required_fields if field not in parsed]
        if missing_fields:
            logger.warning(f"⚠️ Missing fields in Gemini response: {missing_fields}")
        
        # Log detailed evaluation results
        logger.info(f"🎯 Evaluation Results:")
        logger.info(f"   📝 Transcript: {parsed.get('transcript', 'N/A')[:100]}...")
        logger.info(f"   ⭐ Overall Score: {parsed.get('score', 'N/A')}")
        logger.info(f"   🗣️ Speaking Score: {parsed.get('breakdown', {}).get('speaking', 'N/A')}")
        logger.info(f"   📚 Content Score: {parsed.get('breakdown', {}).get('content', 'N/A')}")
        logger.info(f"   🎯 Relevance Score: {parsed.get('breakdown', {}).get('relevance', 'N/A')}")
        logger.info(f"   💬 Feedback: {parsed.get('feedback', 'N/A')[:100]}...")
        logger.info(f"   ✅ Strengths: {parsed.get('strengths', [])}")
        logger.info(f"   🔧 Improvements: {parsed.get('improvements', [])}")
        
        return parsed
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parsing error: {e}")
        logger.error(f"📝 Raw text that failed to parse: {text}")
        logger.error(f"🧹 Cleaned text that failed to parse: {cleaned_text}")
        raise
    except Exception as e:
        logger.error(f"❌ Gemini audio evaluation error: {e}")
        raise


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


