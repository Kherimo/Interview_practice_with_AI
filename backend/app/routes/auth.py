from datetime import datetime, timedelta, timezone
import secrets
import jwt
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from app.database import get_session, User, PasswordReset
from app.utils import token_required


auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


def create_access_token(user_id):
    return jwt.encode(
        {'id': user_id, 'exp': datetime.now(timezone.utc) + timedelta(hours=1)},
        current_app.config['SECRET_KEY'],
        algorithm='HS256',
    )

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
        return jsonify({'message': 'User registered successfully'}), 201
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
            return jsonify({'token': token}), 200
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
        print(f'Password reset token for {email}: {token}')
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


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json(force=True)
    session = get_session()
    try:
        if 'profession' in data:
            current_user.profession = data['profession']
        if 'experience_level' in data:
            current_user.experience_level = data['experience_level']
        if 'avatar_url' in data:
            current_user.avatar_url = data['avatar_url']
        session.merge(current_user)
        session.commit()
        return jsonify({'message': 'Profile updated'}), 200
    finally:
        session.close()