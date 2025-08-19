import os
from flask import Flask
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

    return app