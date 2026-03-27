from flask import Blueprint, request, jsonify
from db import get_connection

store_bp = Blueprint('store_bp', __name__)

# ดึงร้านค้าทั้งหมดใน Mall
@store_bp.route('/mall/<int:mall_id>', methods=['GET'])
def get_stores_by_mall(mall_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    sql = """
        SELECT s.*, c.name as category_name, c.icon as category_icon, f.floor_code, f.name as floor_name
        FROM Store s
        JOIN StoreCategory c ON s.category_id = c.id
        JOIN Floor f ON s.floor_id = f.id
        WHERE s.mall_id = %s
    """
    cursor.execute(sql, (mall_id,))
    stores = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"success": True, "data": stores})

# ค้นหาร้านค้าใน Mall (Search)
@store_bp.route('/search', methods=['GET'])
def search_stores():
    mall_id = request.args.get('mall_id')
    query = request.args.get('q', '')
    
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    sql = """
        SELECT s.*, c.name as category_name, c.icon as category_icon, f.floor_code
        FROM Store s
        JOIN StoreCategory c ON s.category_id = c.id
        JOIN Floor f ON s.floor_id = f.id
        WHERE s.mall_id = %s AND (s.name LIKE %s OR c.name LIKE %s)
    """
    search_param = f"%{query}%"
    cursor.execute(sql, (mall_id, search_param, search_param))
    stores = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"success": True, "data": stores})

# ดูรายละเอียดร้านค้าตาม ID
@store_bp.route('/<int:store_id>', methods=['GET'])
def get_store_by_id(store_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    sql = """
        SELECT s.*, c.name as category_name, c.icon as category_icon, f.floor_code, f.name as floor_name
        FROM Store s
        JOIN StoreCategory c ON s.category_id = c.id
        JOIN Floor f ON s.floor_id = f.id
        WHERE s.id = %s
    """
    cursor.execute(sql, (store_id,))
    store = cursor.fetchone()
    cursor.close()
    conn.close()
    if store:
        return jsonify({"success": True, "data": store})
    return jsonify({"success": False, "message": "Store not found"}), 404