from flask import Blueprint, request

from api_utils import fail, ok
from auth_routes import token_required
from db import get_connection
from logger import log

category_bp = Blueprint("category_bp", __name__)


@category_bp.route("/", methods=["GET"])
def get_categories():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT StoreCategoryID, StoreCategoryName FROM StoreCategory ORDER BY StoreCategoryName ASC")
        data = [
            {"id": row["StoreCategoryID"], "name": row["StoreCategoryName"]}
            for row in cursor.fetchall()
        ]
        return ok(data)
    except Exception as e:
        log.error("ERROR GET CATEGORIES: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@category_bp.route("/", methods=["POST"])
@token_required(["Admin"])
def create_category(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get("StoreCategoryName") or data.get("CategoryName") or "").strip()
        if not name:
            return fail("StoreCategoryName is required", 400)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO StoreCategory (StoreCategoryName) VALUES (%s)", (name,))
        conn.commit()
        return ok({"id": cursor.lastrowid, "name": name}, message="Category created successfully", status=201)
    except Exception as e:
        log.error("ERROR CREATE CATEGORY: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@category_bp.route("/<int:category_id>", methods=["PUT"])
@token_required(["Admin"])
def update_category(current_user, category_id):
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get("StoreCategoryName") or data.get("CategoryName") or "").strip()
        if not name:
            return fail("StoreCategoryName is required", 400)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE StoreCategory SET StoreCategoryName = %s WHERE StoreCategoryID = %s", (name, category_id))
        conn.commit()
        if cursor.rowcount == 0:
            return fail("Category not found", 404)
        return ok(message="Category updated successfully")
    except Exception as e:
        log.error("ERROR UPDATE CATEGORY: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@category_bp.route("/<int:category_id>", methods=["DELETE"])
@token_required(["Admin"])
def delete_category(current_user, category_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM StoreCategory WHERE StoreCategoryID = %s", (category_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return fail("Category not found", 404)
        return ok(message="Category deleted successfully")
    except Exception as e:
        log.error("ERROR DELETE CATEGORY: %s", e)
        if "foreign key" in str(e).lower():
            return fail("Cannot delete category because it is in use", 409)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
