from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import jwt
from flask import Blueprint, current_app, request

from api_utils import fail, ok
from db import get_connection
from logger import log

auth_bp = Blueprint("auth_bp", __name__)

ROLE_NAMES = {
    "admin": "Admin",
    "storeowner": "StoreOwner",
    "seller": "StoreOwner",
    "customer": "Customer",
    "user": "Customer",
}


def normalize_role(role_name):
    if not role_name:
        return role_name
    return ROLE_NAMES.get(str(role_name).strip().lower(), role_name)


def fetch_user_by_email(cursor, email):
    sql = """
        SELECT
            u.UserID AS id,
            u.UserName AS username,
            u.Email AS email,
            u.PasswordHash AS password_hash,
            r.RoleName AS role_name,
            s.StoreID AS store_id,
            s.StoreName AS store_name
        FROM `User` u
        JOIN Role r ON u.RoleID = r.RoleID
        LEFT JOIN Store s ON s.UserID = u.UserID
        WHERE u.Email = %s
        LIMIT 1
    """
    cursor.execute(sql, (email,))
    user = cursor.fetchone()
    if user:
        user["role_name"] = normalize_role(user.get("role_name"))
    return user


def fetch_user_by_id(cursor, user_id):
    sql = """
        SELECT
            u.UserID AS id,
            u.UserName AS username,
            u.Email AS email,
            r.RoleName AS role,
            s.StoreID AS store_id,
            s.StoreName AS store_name
        FROM `User` u
        JOIN Role r ON u.RoleID = r.RoleID
        LEFT JOIN Store s ON s.UserID = u.UserID
        WHERE u.UserID = %s
        LIMIT 1
    """
    cursor.execute(sql, (user_id,))
    user = cursor.fetchone()
    if user:
        user["role"] = normalize_role(user.get("role"))
    return user


def build_user_payload(user):
    payload = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": normalize_role(user.get("role") or user.get("role_name")),
    }
    if user.get("store_id"):
        payload["store_id"] = user["store_id"]
    if user.get("store_name"):
        payload["store_name"] = user["store_name"]
    return payload


def token_required(allowed_roles=None):
    allowed_roles = allowed_roles or []

    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return fail("Authorization header is missing or malformed", 401)

            token = auth_header.split(" ", 1)[1].strip()
            if not token:
                return fail("Token is missing", 401)

            try:
                decoded = jwt.decode(
                    token,
                    current_app.config["SECRET_KEY"],
                    algorithms=["HS256"],
                )
                decoded["role"] = normalize_role(decoded.get("role"))
            except jwt.ExpiredSignatureError:
                return fail("Token has expired", 401)
            except jwt.InvalidTokenError:
                return fail("Invalid token", 401)

            if allowed_roles and decoded.get("role") not in allowed_roles:
                return fail("Access denied", 403)

            return f(decoded, *args, **kwargs)

        return wrapped

    return decorator


@auth_bp.route("/register", methods=["POST"])
def register_user():
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not username or not email or not password:
            return fail("Username, email, and password are required", 400)

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT UserID FROM `User` WHERE UserName = %s OR Email = %s LIMIT 1",
            (username, email),
        )
        if cursor.fetchone():
            return fail("Username or email already exists", 409)

        cursor.execute(
            "SELECT RoleID FROM Role WHERE LOWER(RoleName) IN ('customer', 'user') ORDER BY RoleID LIMIT 1"
        )
        role_row = cursor.fetchone()
        if not role_row:
            return fail("Customer role is missing in database", 500)

        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cursor.execute(
            "INSERT INTO `User` (UserName, Email, PasswordHash, RoleID) VALUES (%s, %s, %s, %s)",
            (username, email, hashed_password, role_row["RoleID"]),
        )
        conn.commit()
        log.info("Registered user %s", email)
        return ok(message="User registered successfully", status=201)
    except Exception as e:
        log.error("ERROR REGISTER USER: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return fail("Email and password are required", 400)

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        user = fetch_user_by_email(cursor, email)

        if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return fail("Invalid email or password", 401)

        payload = {
            "user_id": user["id"],
            "role": user["role_name"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        }
        if user.get("store_id"):
            payload["store_id"] = user["store_id"]

        token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
        return ok(build_user_payload(user), message="Login successful", token=token)
    except Exception as e:
        log.error("ERROR LOGIN: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@auth_bp.route("/profile", methods=["GET"])
@token_required(["Admin", "StoreOwner", "Customer"])
def get_profile(current_user):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        user = fetch_user_by_id(cursor, current_user["user_id"])
        if not user:
            return fail("User not found", 404)
        return ok(build_user_payload(user), user=build_user_payload(user))
    except Exception as e:
        log.error("ERROR PROFILE: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
