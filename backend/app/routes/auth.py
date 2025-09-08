from datetime import datetime, timedelta, timezone
import os
import secrets
import smtplib
import jwt
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from app.database import get_session, User, PasswordReset
from app.utils import token_required


EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')


def send_reset_code_email(email, code):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = email
        msg['Subject'] = "🔐 PrepTalk - Reset Your Password"

        body = f"""
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Inter', Arial, sans-serif;
                    background-color: #111827;
                    color: #F9FAFB;
                    padding: 20px;
                    text-align: center;
                }}
                .container {{
                    background-color: #1F2937;
                    padding: 30px;
                    border-radius: 10px;
                    width: 80%;
                    margin: auto;
                }}
                h2 {{
                    color: #6D28D9;
                    margin-bottom: 16px;
                }}
                p {{
                    font-size: 16px;
                    color: #D1D5DB;
                    margin: 8px 0;
                }}
                .code {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #F9FAFB;
                    background: #111827;
                    padding: 10px 20px;
                    border: 2px dashed #6D28D9;
                    border-radius: 8px;
                    display: inline-block;
                    margin: 16px 0;
                }}
                .divider {{
                    margin-top: 24px;
                    border: none;
                    border-top: 1px solid #374151;
                }}
                .footer {{
                    margin-top: 20px;
                    font-size: 14px;
                    color: #9CA3AF;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🔐 Reset Your Password</h2>
                <p>Hello,</p>
                <p>You requested to reset your password on <strong>PrepTalk</strong>. Use the code below to proceed:</p>
                <div class="code">{code}</div>
                <p>This code is valid for <strong>3 minutes</strong>.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr class="divider"/>
                <p class="footer">© {datetime.now().year} PrepTalk. All rights reserved.</p>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, email, msg.as_string())

        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


def create_access_token(user_id):
    return jwt.encode(
        {'id': user_id, 'exp': datetime.now(timezone.utc) + timedelta(hours=1)},
        current_app.config['SECRET_KEY'],
        algorithm='HS256',
    )


def serialize_user(user):
    return {
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'avatar_url': user.avatar_url,
        'profession': user.profession,
        'experience_level': user.experience_level,
    }

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(force=True)
    full_name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not full_name or not email or not password:
        return jsonify({'error': 'Missing name, email, or password'}), 400

    session = get_session()
    try:
        if session.query(User).filter_by(email=email).first():
            return jsonify({'error': 'User already exists'}), 400
        user = User(
            full_name=full_name,
            email=email,
            password_hash=generate_password_hash(password),
        )
        session.add(user)
        session.commit()
        token = create_access_token(user.id)
        return jsonify({'token': token, 'user': serialize_user(user)}), 201
    finally:
        session.close()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    session = get_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            token = create_access_token(user.id)
            return jsonify({'token': token, 'user': serialize_user(user)}), 200
        return jsonify({'error': 'Invalid credentials'}), 401
    finally:
        session.close()

@auth_bp.route('/login/google', methods=['POST'])
def login_google():
    data = request.get_json(force=True)
    email = data.get('email')
    full_name = data.get('name')
    provider_id = data.get('provider_id')
    if not email or not full_name or not provider_id:
        return jsonify({'error': 'Missing provider information'}), 400

    session = get_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        if not user:
            user = User(
                full_name=full_name,
                email=email,
                password_hash=generate_password_hash(''),
                provider='google',
                provider_id=provider_id,
                email_verified_at=datetime.now(timezone.utc),
            )
            session.add(user)
            session.commit()
        else:
            user.provider = 'google'
            user.provider_id = provider_id
            session.commit()
        token = create_access_token(user.id)
        return jsonify({'token': token}), 200
    finally:
        session.close()

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json(force=True)
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    session = get_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        session.query(PasswordReset).filter_by(email=email).delete()
        token = f"{secrets.randbelow(1000000):06d}"
        session.add(PasswordReset(email=email, token=token))
        session.commit()

        if not send_reset_code_email(email, token):
            return jsonify({'error': 'Failed to send email'}), 500

        return jsonify({'message': 'Reset token sent'}), 200
    finally:
        session.close()


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json(force=True)
    email = data.get('email')
    token = data.get('token')
    new_password = data.get('password')
    if not email or not token or not new_password:
        return jsonify({'error': 'Missing email, token, or password'}), 400

    session = get_session()
    try:
        reset = session.query(PasswordReset).filter_by(email=email, token=token).first()
        if not reset:
            return jsonify({'error': 'Invalid token'}), 400
        if datetime.utcnow() - reset.created_at > timedelta(minutes=3):
            session.query(PasswordReset).filter_by(email=email, token=token).delete()
            session.commit()
            return jsonify({'error': 'Token expired'}), 400
        user = session.query(User).filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user.password_hash = generate_password_hash(new_password)
        session.query(PasswordReset).filter_by(email=email).delete()
        session.commit()
        return jsonify({'message': 'Password reset successful'}), 200
    finally:
        session.close()


@auth_bp.route('/me', methods=['GET'])
@token_required
def me(current_user):
    return jsonify({
        'id': current_user.id,
        'name': current_user.full_name,
        'email': current_user.email,
        'avatar_url': current_user.avatar_url,
        'profession': current_user.profession,
        'experience_level': current_user.experience_level,
    })