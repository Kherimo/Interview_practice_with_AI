import logging
from flask import Blueprint, request, jsonify
from app.database import get_session, InterviewSession, InterviewAnswer
from app.utils import token_required

logger = logging.getLogger(__name__)
stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    """Get comprehensive statistics for the current user's interview practice from DB."""
    db = get_session()
    try:
        # Get all sessions from DB
        all_sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == current_user.id
        ).all()
        
        completed_sessions = [s for s in all_sessions if s.status == 'hoan_thanh']
        ongoing_sessions = [s for s in all_sessions if s.status == 'dang_dien_ra']

        # Calculate statistics
        total_sessions = len(all_sessions)
        total_completed = len(completed_sessions)
        total_ongoing = len(ongoing_sessions)
        
        # Score statistics - calculate from answers
        total_score = 0
        for session in completed_sessions:
            answers = db.query(InterviewAnswer).filter_by(session_id=session.id).all()
            session_score = sum(a.score or 0 for a in answers) / len(answers) if answers else 0
            total_score += session_score
        average_score = total_score / total_completed if total_completed > 0 else 0
        
        # Field distribution
        field_stats = {}
        for session in completed_sessions:
            field = session.field
            if field not in field_stats:
                field_stats[field] = {'count': 0, 'total_score': 0}
            field_stats[field]['count'] += 1
            # Calculate session score from answers
            answers = db.query(InterviewAnswer).filter_by(session_id=session.id).all()
            session_score = sum(a.score or 0 for a in answers) / len(answers) if answers else 0
            field_stats[field]['total_score'] += session_score

        # Calculate field averages
        for field in field_stats:
            field_stats[field]['average_score'] = round(
                field_stats[field]['total_score'] / field_stats[field]['count'], 2
            )

        # Recent performance (last 5 sessions)
        recent_scores = []
        for session in completed_sessions[:5]:
            answers = db.query(InterviewAnswer).filter_by(session_id=session.id).all()
            session_score = sum(a.score or 0 for a in answers) / len(answers) if answers else 0
            recent_scores.append(session_score)

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
        logger.error(f"Error getting stats: {e}")
        return jsonify({'error': 'Không thể lấy thống kê. Vui lòng thử lại.'}), 500
    finally:
        db.close()

