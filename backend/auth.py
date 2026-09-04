import random
import secrets

otp_store = {}
session_store = {}


def generate_otp():
    return str(random.randint(100000, 999999))


def save_otp(email, otp):
    otp_store[email] = otp


def verify_otp(email, otp):
    return otp_store.get(email) == otp


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