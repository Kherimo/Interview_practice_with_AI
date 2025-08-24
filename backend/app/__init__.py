import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret')

    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False,
            "max_age": 3600
        }
    })

    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.interviews import interviews_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(interviews_bp)

    from app.database import Base, engine, migrate_user_settings, migrate_interview_sessions
    with app.app_context():
        Base.metadata.create_all(bind=engine)
        migrate_user_settings()
        migrate_interview_sessions()

    @app.route("/")
    def index():
        return """<!doctype html>
        <html lang=\"vi\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">
        <title>Status</title>
        <style>html,body{height:100%;margin:0}body{display:grid;place-items:center;text-align:center;font-family:system-ui;background:#0f172a;color:#e5e7eb}</style>
        <main><h1>Interview_practice_with_AI</h1><p style=\"margin:8px 0 0\">Back-end đang chạy 🚀</p></main>
        </html>"""

    @app.route("/health")
    def health_check():
        """Health check endpoint để kiểm tra trạng thái API"""
        try:
            # Kiểm tra database connection
            from app.database import check_connection
            db_status = check_connection()
            
            # Kiểm tra environment variables
            env_status = {
                'GEMINI_API_KEY': bool(os.getenv('GEMINI_API_KEY')),
                'SUPABASE_URL': bool(os.getenv('SUPABASE_URL')),
                'SUPABASE_KEY': bool(os.getenv('SUPABASE_KEY')),
            }
            
            # Kiểm tra Gemini API
            gemini_status = False
            try:
                import requests
                api_key = os.getenv('GEMINI_API_KEY')
                if api_key:
                    response = requests.get(
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro",
                        params={"key": api_key},
                        timeout=5
                    )
                    gemini_status = response.status_code == 200
            except:
                pass
            
            return jsonify({
                'status': 'healthy' if db_status and all(env_status.values()) else 'degraded',
                'timestamp': '2024-01-01T00:00:00Z',
                'services': {
                    'database': db_status,
                    'gemini_api': gemini_status,
                    'environment': env_status
                },
                'version': '1.0.0'
            }), 200 if db_status else 503
            
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': '2024-01-01T00:00:00Z'
            }), 500

    return app