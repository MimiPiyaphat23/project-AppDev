from flask import Blueprint, jsonify
from db import get_connection

product_bp = Blueprint('product_bp', __name__)

# ดึงสินค้าทั้งหมดของร้านค้า
@product_bp.route('/store/<int:store_id>', methods=['GET'])
def get_products_by_store(store_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    sql = "SELECT * FROM Product WHERE store_id = %s"
    cursor.execute(sql, (store_id,))
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"success": True, "data": products})

# ดึงข้อมูลสินค้าตาม ID
@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    sql = "SELECT * FROM Product WHERE id = %s"
    cursor.execute(sql, (product_id,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    if product:
        return jsonify({"success": True, "data": product})
    return jsonify({"success": False, "message": "Product not found"}), 404