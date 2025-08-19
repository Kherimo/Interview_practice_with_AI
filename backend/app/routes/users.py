from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

from app.database import get_session, UserSettings, User
from app.utils import token_required


users_bp = Blueprint('users', __name__, url_prefix='/users')


@users_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update the authenticated user's profile information.

    Expected JSON body::

        {
            "name" or "full_name": "New Name",
            "email": "new@example.com",
            "avatar_url": "...",
            "profession": "...",
            "experience_level": "..."
        }
    """
    data = request.get_json(force=True)
    session = get_session()
    try:
        # Update name/full_name
        if 'name' in data or 'full_name' in data:
            current_user.full_name = data.get('name') or data.get('full_name')

        # Update email with uniqueness check
        if 'email' in data and data['email'] != current_user.email:
            if session.query(User).filter(User.email == data['email'], User.id != current_user.id).first():
                return jsonify({'error': 'Email already in use'}), 400
            current_user.email = data['email']

        if 'avatar_url' in data:
            current_user.avatar_url = data['avatar_url']
        if 'profession' in data:
            current_user.profession = data['profession']
        if 'experience_level' in data:
            current_user.experience_level = data['experience_level']
        session.merge(current_user)
        session.commit()
        return jsonify({'message': 'Profile updated'}), 200
    finally:
        session.close()


@users_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password(current_user):
    """Change the authenticated user's password.

    Accepts both snake_case and camelCase keys::

        {
            "current_password" or "currentPassword": "old_pass",
            "new_password" or "newPassword": "new_pass"
        }
    """
    data = request.get_json(force=True)
    current_password = data.get('current_password') or data.get('currentPassword')
    new_password = data.get('new_password') or data.get('newPassword')
    if not current_password or not new_password:
        return jsonify({'error': 'Missing current or new password'}), 400
    if not check_password_hash(current_user.password_hash, current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400
    session = get_session()
    try:
        current_user.password_hash = generate_password_hash(new_password)
        session.merge(current_user)
        session.commit()
        return jsonify({'message': 'Password changed'}), 200
    finally:
        session.close()


@users_bp.route('/settings', methods=['GET'])
@token_required
def get_settings(current_user):
    """Retrieve the authenticated user's settings."""
    session = get_session()
    try:
        settings = session.get(UserSettings, current_user.id)
        if not settings:
            settings = UserSettings(user_id=current_user.id)
            session.add(settings)
            session.commit()
        return jsonify({
            'notifications_on': settings.notifications_on,
            'reminders_on': settings.reminders_on,
            'practice_reminders': settings.practice_reminders,
            'new_features': settings.new_features,
            'feedback_requests': settings.feedback_requests,
            'practice_results': settings.practice_results,
            'email_notifications': settings.email_notifications,
        }), 200
    finally:
        session.close()


@users_bp.route('/settings', methods=['PUT'])
@token_required
def update_settings(current_user):
    """Update the authenticated user's settings."""
    data = request.get_json(force=True)
    session = get_session()
    try:
        settings = session.get(UserSettings, current_user.id)
        if not settings:
            settings = UserSettings(user_id=current_user.id)
            session.add(settings)
        if 'notifications_on' in data:
            settings.notifications_on = bool(data['notifications_on'])
        if 'reminders_on' in data:
            settings.reminders_on = bool(data['reminders_on'])
        if 'practice_reminders' in data:
            settings.practice_reminders = bool(data['practice_reminders'])
        if 'new_features' in data:
            settings.new_features = bool(data['new_features'])
        if 'feedback_requests' in data:
            settings.feedback_requests = bool(data['feedback_requests'])
        if 'practice_results' in data:
            settings.practice_results = bool(data['practice_results'])
        if 'email_notifications' in data:
            settings.email_notifications = bool(data['email_notifications'])
        session.commit()
        return jsonify({'message': 'Settings updated'}), 200
    finally:
        session.close()