from flask import Blueprint, request

from api_utils import fail, ok
from auth_routes import token_required
from db import get_connection
from logger import log

favorite_bp = Blueprint("favorite_bp", __name__)
ALLOWED = ["Admin", "StoreOwner", "Customer"]


@favorite_bp.route("/stores", methods=["GET"])
@token_required(ALLOWED)
def get_favorite_stores(current_user):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT s.StoreID, s.StoreName, s.LogoURL, s.StoreCategoryName
            FROM FavoriteStore fs
            JOIN Store s ON s.StoreID = fs.StoreID
            WHERE fs.UserID = %s
            ORDER BY s.StoreName ASC
            """,
            (current_user["user_id"],),
        )
        data = [
            {
                "id": row["StoreID"],
                "name": row["StoreName"],
                "logo_url": row.get("LogoURL"),
                "category_name": row.get("StoreCategoryName"),
            }
            for row in cursor.fetchall()
        ]
        return ok(data)
    except Exception as e:
        log.error("ERROR GET FAVORITE STORES: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@favorite_bp.route("/stores", methods=["POST"])
@token_required(ALLOWED)
def add_favorite_store(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        store_id = data.get("store_id")
        if not store_id:
            return fail("store_id is required", 400)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT IGNORE INTO FavoriteStore (UserID, StoreID) VALUES (%s, %s)", (current_user["user_id"], store_id))
        conn.commit()
        return ok(message="Favorite added successfully")
    except Exception as e:
        log.error("ERROR ADD FAVORITE STORE: %s", e)
        if "foreign key" in str(e).lower():
            return fail("Store does not exist", 404)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@favorite_bp.route("/stores/<int:store_id>", methods=["DELETE"])
@token_required(ALLOWED)
def remove_favorite_store(current_user, store_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM FavoriteStore WHERE UserID = %s AND StoreID = %s", (current_user["user_id"], store_id))
        conn.commit()
        if cursor.rowcount == 0:
            return fail("Favorite not found", 404)
        return ok(message="Favorite removed successfully")
    except Exception as e:
        log.error("ERROR REMOVE FAVORITE STORE: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@favorite_bp.route("/products", methods=["GET"])
@token_required(ALLOWED)
def get_favorite_products(current_user):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT p.ProductID, p.ProductName, p.Price, p.ProductImageURL, s.StoreName
            FROM FavoriteProduct fp
            JOIN Product p ON p.ProductID = fp.ProductID
            JOIN Store s ON s.StoreID = p.StoreID
            WHERE fp.UserID = %s
            ORDER BY p.ProductName ASC
            """,
            (current_user["user_id"],),
        )
        data = [
            {
                "id": row["ProductID"],
                "name": row["ProductName"],
                "price": float(row.get("Price") or 0),
                "image": row.get("ProductImageURL"),
                "store_name": row.get("StoreName"),
            }
            for row in cursor.fetchall()
        ]
        return ok(data)
    except Exception as e:
        log.error("ERROR GET FAVORITE PRODUCTS: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@favorite_bp.route("/products", methods=["POST"])
@token_required(ALLOWED)
def add_favorite_product(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        product_id = data.get("product_id")
        if not product_id:
            return fail("product_id is required", 400)
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT IGNORE INTO FavoriteProduct (UserID, ProductID) VALUES (%s, %s)", (current_user["user_id"], product_id))
        conn.commit()
        return ok(message="Favorite added successfully")
    except Exception as e:
        log.error("ERROR ADD FAVORITE PRODUCT: %s", e)
        if "foreign key" in str(e).lower():
            return fail("Product does not exist", 404)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@favorite_bp.route("/products/<int:product_id>", methods=["DELETE"])
@token_required(ALLOWED)
def remove_favorite_product(current_user, product_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM FavoriteProduct WHERE UserID = %s AND ProductID = %s", (current_user["user_id"], product_id))
        conn.commit()
        if cursor.rowcount == 0:
            return fail("Favorite not found", 404)
        return ok(message="Favorite removed successfully")
    except Exception as e:
        log.error("ERROR REMOVE FAVORITE PRODUCT: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
