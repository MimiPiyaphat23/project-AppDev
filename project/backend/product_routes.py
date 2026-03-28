from flask import Blueprint, jsonify
from db import get_connection

product_bp = Blueprint('product_bp', __name__)


# =========================
# FORMATTER
# =========================
def format_product(p):
    return {
        "id": p.get("id"),
        "store_id": p.get("store_id"),
        "name": p.get("name"),
        "price": float(p.get("price") or 0),
        "stock": p.get("stock", 0),
        "image": p.get("image")
    }


# =========================
# ROUTES
# =========================

# 🛍️ ดึงสินค้าทั้งหมดของร้านค้า
@product_bp.route('/store/<int:store_id>', methods=['GET'])
def get_products_by_store(store_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            ProductID AS id,
            StoreID AS store_id,
            ProductName AS name,
            Price AS price,
            StockQuantity AS stock,
            ProductImageURL AS image
        FROM Product
        WHERE StoreID = %s
        ORDER BY ProductName ASC
    """

    cursor.execute(sql, (store_id,))
    products = cursor.fetchall()

    cursor.close()
    conn.close()

    # 🔥 ใช้ formatter
    formatted_products = [format_product(p) for p in products]

    return jsonify({
        "success": True,
        "data": formatted_products
    })


# 🔍 ดึงข้อมูลสินค้าตาม ID
@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            ProductID AS id,
            StoreID AS store_id,
            ProductName AS name,
            Price AS price,
            StockQuantity AS stock,
            ProductImageURL AS image
        FROM Product
        WHERE ProductID = %s
    """

    cursor.execute(sql, (product_id,))
    product = cursor.fetchone()

    cursor.close()
    conn.close()

    if not product:
        return jsonify({
            "success": False,
            "message": "Product not found"
        }), 404

    # 🔥 ใช้ formatter
    formatted_product = format_product(product)

    return jsonify({
        "success": True,
        "data": formatted_product
    })