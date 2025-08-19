from datetime import datetime, timedelta
import os
import json
import requests
from flask import Blueprint, request, jsonify

from app.database import (
    get_session,
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
)
from app.utils import token_required

interviews_bp = Blueprint('interviews', __name__, url_prefix='/interviews')


def generate_question(prompt: str) -> str:
    """Generate interview question using Gemini API, fallback to a default."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Tell me about yourself."

    try:
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        resp = requests.post(endpoint, params={"key": api_key}, json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return "Tell me about yourself."


def evaluate_answer(question: str, answer: str) -> tuple[str, float]:
    """Evaluate an answer using Gemini API, returning feedback and score."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "No feedback available", 0.0

    try:
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        )
        prompt = (
            "You are an interview evaluator. Given the question and a candidate's answer, "
            "respond with JSON containing 'feedback' and 'score' (0-5).\n"
            f"Question: {question}\nAnswer: {answer}"
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        resp = requests.post(endpoint, params={"key": api_key}, json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        try:
            parsed = json.loads(text)
            feedback = parsed.get("feedback", "")
            score = float(parsed.get("score", 0.0))
            return feedback, score
        except Exception:
            return text, 0.0
    except Exception:
        return "No feedback available", 0.0


def summarize_transcript(transcript: list[dict], session: InterviewSession | None = None) -> str:
    """Summarize the interview transcript using Gemini API."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "No summary available"

    try:
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        )
        conversation = "\n".join(
            f"Q: {t['question']}\nA: {t['answer']}" for t in transcript
        )
        intro = "Summarize the following interview."
        if session:
            intro = (
                f"Summarize the interview for a {session.role} {session.position} "
                f"in {session.field}/{session.specialization} with {session.experience_level} experience."
            )
        prompt = intro + "\n" + conversation
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        resp = requests.post(endpoint, params={"key": api_key}, json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return "No summary available"


@interviews_bp.route('/session', methods=['POST'])
@token_required
def create_session(current_user):
    data = request.get_json(force=True)
    role = data.get('role')
    position = data.get('position')
    field = data.get('field')
    specialization = data.get('specialization')
    experience = data.get('experience')
    time_limit = data.get('time_limit')
    question_limit = data.get('question_limit')
    mode = data.get('mode', 'chat')
    required = [role, position, field, specialization, experience, time_limit, question_limit]
    if any(r is None for r in required):
        return jsonify({'error': 'Missing required fields'}), 400

    expires_at = datetime.utcnow() + timedelta(minutes=int(time_limit))
    session = get_session()
    try:
        interview_session = InterviewSession(
            user_id=current_user.id,
            role=role,
            position=position,
            field=field,
            specialization=specialization,
            experience_level=experience,
            time_limit=time_limit,
            question_limit=question_limit,
            status='dang_dien_ra',
            mode=mode,
            difficulty_setting='medium',
            expires_at=expires_at,
        )
        session.add(interview_session)
        session.commit()
        return (
            jsonify(
                {
                    'session_id': interview_session.id,
                    'expires_at': expires_at.isoformat(),
                }
            ),
            201,
        )
    finally:
        session.close()


@interviews_bp.route('/<int:session_id>/question', methods=['GET'])
@token_required
def get_question(current_user, session_id):
    db = get_session()
    try:
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session or interview_session.user_id != current_user.id:
            return jsonify({'error': 'Invalid session_id'}), 404

        asked = db.query(InterviewQuestion).filter_by(session_id=session_id).all()
        if interview_session.question_limit and len(asked) >= interview_session.question_limit:
            return jsonify({'error': 'Question limit reached'}), 400
        history = [q.content for q in asked]
        prompt = (
            f"Field: {interview_session.field}, Specialization: {interview_session.specialization}, "
            f"Role: {interview_session.role}, Position: {interview_session.position}, "
            f"Experience: {interview_session.experience_level}. Generate a new interview question."
        )
        if history:
            prompt += " Previously asked: " + " | ".join(history)

        question_text = generate_question(prompt)

        question = InterviewQuestion(session_id=session_id, content=question_text)
        db.add(question)
        interview_session.questions_asked = (interview_session.questions_asked or 0) + 1
        db.commit()

        return jsonify({'question': question_text, 'question_id': question.id})
    finally:
        db.close()


@interviews_bp.route('/<int:session_id>/answer', methods=['POST'])
@token_required
def submit_answer(current_user, session_id):
    data = request.get_json(force=True)
    question_id = data.get('question_id')
    answer_text = data.get('answer')
    if not question_id or not answer_text:
        return jsonify({'error': 'Missing question_id or answer'}), 400

    db = get_session()
    try:
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session or interview_session.user_id != current_user.id:
            return jsonify({'error': 'Invalid session_id'}), 404

        question = db.get(InterviewQuestion, question_id)
        if not question or question.session_id != session_id:
            return jsonify({'error': 'Invalid question_id'}), 404
        context = (
            f"Field: {interview_session.field}, Specialization: {interview_session.specialization}, "
            f"Role: {interview_session.role}, Position: {interview_session.position}, "
            f"Experience: {interview_session.experience_level}."
        )
        full_question = context + f" Question: {question.content}"
        feedback, score = evaluate_answer(full_question, answer_text)

        answer = InterviewAnswer(
            session_id=session_id,
            question_id=question_id,
            answer=answer_text,
            feedback=feedback,
            score=score,
        )
        db.add(answer)
        db.commit()

        return jsonify({'feedback': feedback, 'score': score})
    finally:
        db.close()


@interviews_bp.route('/<int:session_id>/finish', methods=['POST'])
@token_required
def finish_session(current_user, session_id):
    db = get_session()
    try:
        interview_session = db.get(InterviewSession, session_id)
        if not interview_session or interview_session.user_id != current_user.id:
            return jsonify({'error': 'Invalid session_id'}), 404

        answers = db.query(InterviewAnswer).filter_by(session_id=session_id).all()
        total_score = sum(a.score or 0 for a in answers)
        transcript = []
        for ans in answers:
            question = db.get(InterviewQuestion, ans.question_id)
            transcript.append(
                {
                    'question': question.content if question else '',
                    'answer': ans.answer,
                    'feedback': ans.feedback,
                    'score': ans.score,
                }
            )

        summary = summarize_transcript(transcript, interview_session)

        interview_session.status = 'da_hoan_thanh'
        interview_session.overall_score = total_score
        interview_session.completed_at = datetime.utcnow()
        db.commit()

        return jsonify(
            {
                'summary': summary,
                'total_score': total_score,
                'transcript': transcript,
            }
        )
    finally:
        db.close()