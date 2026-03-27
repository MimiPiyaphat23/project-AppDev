from flask import Blueprint, jsonify
from db import get_connection

floor_bp = Blueprint('floor_bp', __name__)


# =========================
# FORMATTER
# =========================
def format_floor(f):
    return {
        "id": f.get("id"),
        "mall_id": f.get("mall_id"),
        "name": f.get("name"),
        "floor_code": f.get("floor_code"),
        "floor_order": f.get("floor_order"),
        "store_count": f.get("store_count", 0)
    }


def format_store(s):
    return {
        "id": s.get("id"),
        "name": s.get("name"),
        "floor_code": s.get("floor_code"),
        "category": {
            "name": s.get("category_name"),
            "icon": s.get("category_icon")
        }
    }


# =========================
# ROUTES
# =========================

# 🏬 ดึงชั้นทั้งหมดใน mall
@floor_bp.route('/mall/<int:mall_id>', methods=['GET'])
def get_floors_by_mall(mall_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            f.id,
            f.mall_id,
            f.name,
            f.floor_code,
            f.floor_order,
            (SELECT COUNT(*) 
             FROM Store s 
             WHERE s.floor_id = f.id) AS store_count
        FROM Floor f
        WHERE f.mall_id = %s
        ORDER BY f.floor_order ASC
    """

    cursor.execute(sql, (mall_id,))
    floors = cursor.fetchall()

    cursor.close()
    conn.close()

    # 🔥 ใช้ formatter
    formatted_floors = [format_floor(f) for f in floors]

    return jsonify({
        "success": True,
        "data": formatted_floors
    })


# 🛍️ ดึงร้านค้าตามชั้น
@floor_bp.route('/<int:floor_id>/stores', methods=['GET'])
def get_stores_by_floor(floor_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            s.id,
            s.name,
            f.floor_code,
            c.name AS category_name,
            c.icon AS category_icon
        FROM Store s
        JOIN StoreCategory c ON s.category_id = c.id
        JOIN Floor f ON s.floor_id = f.id
        WHERE s.floor_id = %s
        ORDER BY s.name ASC
    """

    cursor.execute(sql, (floor_id,))
    stores = cursor.fetchall()

    cursor.close()
    conn.close()

    # 🔥 ใช้ formatter
    formatted_stores = [format_store(s) for s in stores]

    return jsonify({
        "success": True,
        "data": formatted_stores
    })