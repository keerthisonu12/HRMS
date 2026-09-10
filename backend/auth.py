import random
import secrets
from datetime import datetime, timedelta, timezone

otp_store = {}
session_store = {}
reset_request_store = {}


def generate_otp():
    return str(random.randint(100000, 999999))


def save_otp(email, otp):
    otp_store[email] = {
        "otp": otp,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=24)
    }


def verify_otp(email, otp):
    data = otp_store.get(email)

    if not data:
        return False

    if datetime.now(timezone.utc) > data["expires_at"]:
        otp_store.pop(email, None)
        return False

    if data["otp"] != otp:
        return False

    otp_store.pop(email, None)
    return True


def create_reset_request(email):
    token = secrets.token_urlsafe(32)

    reset_request_store[token] = {
        "email": email,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=24)
    }

    return token


def get_reset_request(token):
    data = reset_request_store.get(token)

    if not data:
        return None

    if datetime.now(timezone.utc) > data["expires_at"]:
        reset_request_store.pop(token, None)
        return None

    return data


def delete_reset_request(token):
    reset_request_store.pop(token, None)


def create_session(email, role):
    token = secrets.token_urlsafe(32)

    session_store[token] = {
        "email": email,
        "role": role
    }

    return token


def get_session(token):
    return session_store.get(token)


def delete_session(token):
    session_store.pop(token, None)