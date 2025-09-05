from flask import Blueprint
from .session_routes import session_bp
from .question_routes import question_bp
from .answer_routes import answer_bp
from .history_routes import history_bp
from .stats_routes import stats_bp

# Tạo blueprint chính
interviews_bp = Blueprint('interviews', __name__, url_prefix='/interviews')

# Đăng ký các blueprint con
interviews_bp.register_blueprint(session_bp)
interviews_bp.register_blueprint(question_bp)
interviews_bp.register_blueprint(answer_bp)
interviews_bp.register_blueprint(history_bp)
interviews_bp.register_blueprint(stats_bp)



