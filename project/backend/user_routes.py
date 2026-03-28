from flask import Blueprint

from api_utils import fail, ok
from auth_routes import token_required
from db import get_connection
from logger import log

user_bp = Blueprint("user_bp", __name__)


@user_bp.route("/", methods=["GET"])
@token_required(["Admin"])
def get_users(current_user):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT u.UserID, u.UserName, u.Email, r.RoleName
            FROM `User` u
            JOIN Role r ON r.RoleID = u.RoleID
            ORDER BY u.UserID ASC
            """
        )
        users = [
            {
                "id": row["UserID"],
                "username": row["UserName"],
                "email": row["Email"],
                "role": row["RoleName"],
            }
            for row in cursor.fetchall()
        ]
        return ok(users)
    except Exception as e:
        log.error("ERROR GET USERS: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
