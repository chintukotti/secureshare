import base64
import hashlib
import hmac
import os

ITERATIONS = 120_000


def hash_password(password: str) -> dict:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITERATIONS)
    return {
        'passwordSalt': base64.b64encode(salt).decode('utf-8'),
        'passwordHash': base64.b64encode(digest).decode('utf-8'),
        'passwordHashAlgorithm': f'PBKDF2_SHA256_{ITERATIONS}',
    }


def verify_password(password: str, password_salt: str, password_hash: str) -> bool:
    salt = base64.b64decode(password_salt.encode('utf-8'))
    expected = base64.b64decode(password_hash.encode('utf-8'))
    actual = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITERATIONS)
    return hmac.compare_digest(actual, expected)
