from flask import Blueprint, request, jsonify
from db import get_connection

store_bp = Blueprint('store_bp', __name__)


# =========================
# Helper: floor code
# =========================
def get_floor_code(name):
    if not name:
        return ""
    if "Lower" in name:
        return "LG"
    if "Ground" in name:
        return "G"
    return name.split()[-1]  # "Floor 1" → "1"


# =========================
# Helper: category icon (fallback)
# =========================
ICON_MAP = {
    "Food & Beverage": "🍔",
    "Clothing": "👕",
    "Electronics": "💻",
    "Beauty": "💄",
    "Sports": "⚽"
}


# =========================
# FORMATTER
# =========================
def format_store(s):
    return {
        "id": s.get("id"),
        "floor_id": s.get("floor_id"),
        "mall_id": s.get("mall_id"),
        "name": s.get("name"),
        "description": s.get("description", ""),
        "category_name": s.get("category_name"),
        "category_icon": s.get("category_icon") or ICON_MAP.get(s.get("category_name"), "🏬"),
        "floor_name": s.get("floor_name"),
        "floor_code": s.get("floor_code") or get_floor_code(s.get("floor_name")),
        "map_x": s.get("map_x"),
        "map_y": s.get("map_y")
    }


# =========================
# ROUTES
# =========================

# 🏬 ดึงร้านค้าทั้งหมดใน Mall
@store_bp.route('/mall/<int:mall_id>', methods=['GET'])
def get_stores_by_mall(mall_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            s.id,
            s.floor_id,
            s.mall_id,
            s.name,
            s.description,
            s.pos_x AS map_x,
            s.pos_y AS map_y,
            c.name AS category_name,
            c.icon AS category_icon,
            f.name AS floor_name,
            f.floor_code
        FROM Store s
        JOIN StoreCategory c ON s.category_id = c.id
        JOIN Floor f ON s.floor_id = f.id
        WHERE s.mall_id = %s
        ORDER BY s.name ASC
    """

    cursor.execute(sql, (mall_id,))
    stores = cursor.fetchall()

    cursor.close()
    conn.close()

    formatted = [format_store(s) for s in stores]

    return jsonify({
        "success": True,
        "data": formatted
    })


# 🔍 ค้นหาร้านค้าใน Mall
@store_bp.route('/search', methods=['GET'])
def search_stores():
    mall_id = request.args.get('mall_id')
    query = request.args.get('q', '').strip()

    if not mall_id:
        return jsonify({
            "success": False,
            "message": "mall_id is required"
        }), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            s.id,
            s.floor_id,
            s.mall_id,
            s.name,
            s.description,
            s.pos_x AS map_x,
            s.pos_y AS map_y,
            c.name AS category_name,
            c.icon AS category_icon,
            f.name AS floor_name,
            f.floor_code
        FROM Store s
        JOIN StoreCategory c ON s.category_id = c.id
        JOIN Floor f ON s.floor_id = f.id
        WHERE s.mall_id = %s 
          AND (s.name LIKE %s OR c.name LIKE %s)
        ORDER BY s.name ASC
    """

    search_param = f"%{query}%"
    cursor.execute(sql, (mall_id, search_param, search_param))

    stores = cursor.fetchall()

    cursor.close()
    conn.close()

    formatted = [format_store(s) for s in stores]

    return jsonify({
        "success": True,
        "data": formatted
    })


# 🔍 ดูรายละเอียดร้านค้าตาม ID
@store_bp.route('/<int:store_id>', methods=['GET'])
def get_store_by_id(store_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            s.id,
            s.floor_id,
            s.mall_id,
            s.name,
            s.description,
            s.pos_x AS map_x,
            s.pos_y AS map_y,
            c.name AS category_name,
            c.icon AS category_icon,
            f.name AS floor_name,
            f.floor_code
        FROM Store s
        JOIN StoreCategory c ON s.category_id = c.id
        JOIN Floor f ON s.floor_id = f.id
        WHERE s.id = %s
    """

    cursor.execute(sql, (store_id,))
    store = cursor.fetchone()

    cursor.close()
    conn.close()

    if not store:
        return jsonify({
            "success": False,
            "message": "Store not found"
        }), 404

    return jsonify({
        "success": True,
        "data": format_store(store)
    })