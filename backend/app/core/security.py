import hashlib
import secrets
from datetime import datetime, timedelta


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a random salt."""
    salt = secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000)
    return f"pbkdf2_sha256${salt}${derived.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against the stored hash."""
    try:
        algorithm, salt, hash_hex = password_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000)
        return derived.hex() == hash_hex
    except (ValueError, AttributeError):
        return False


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


def get_session_expiration(days: int = 7) -> datetime:
    return datetime.utcnow() + timedelta(days=days)
