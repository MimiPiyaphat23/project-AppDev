from flask import Blueprint

from api_utils import fail, ok
from db import get_connection
from logger import log

product_bp = Blueprint("product_bp", __name__)


def format_product(row):
    return {
        "id": row["ProductID"],
        "store_id": row["StoreID"],
        "name": row["ProductName"],
        "price": float(row.get("Price") or 0),
        "stock": int(row.get("StockQuantity") or 0),
        "image": row.get("ProductImageURL"),
        "is_active": bool(row.get("IsActive", 1)),
    }


@product_bp.route("/store/<int:store_id>", methods=["GET"])
def get_products_by_store(store_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT ProductID, StoreID, ProductName, Price, StockQuantity, ProductImageURL, IsActive FROM Product WHERE StoreID = %s ORDER BY ProductName ASC",
            (store_id,),
        )
        return ok([format_product(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR GET PRODUCTS BY STORE: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT ProductID, StoreID, ProductName, Price, StockQuantity, ProductImageURL, IsActive FROM Product WHERE ProductID = %s LIMIT 1",
            (product_id,),
        )
        row = cursor.fetchone()
        if not row:
            return fail("Product not found", 404)
        return ok(format_product(row))
    except Exception as e:
        log.error("ERROR GET PRODUCT BY ID: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
