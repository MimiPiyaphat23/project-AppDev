from flask import Blueprint, jsonify
from db import get_connection

floor_bp = Blueprint('floor_bp', __name__)

# ==========================================
# FORMATTERS
# ==========================================

def format_floor(f):
    return {
        "id": f.get("FloorID"),
        "name": f.get("FloorName"),
        "mall_id": f.get("MallID"),
        "floor_code": f.get("FloorCode"),   # ⭐ ใช้ตัวนี้แทน
        "floor_order": f.get("FloorOrder"),
        "store_count": f.get("StoreCount", 0)
    }


def format_store(s):
    return {
        "id": s.get("StoreID"),
        "name": s.get("StoreName"),

        # ❌ อย่าใช้ FloorID อย่างเดียว
        # ✅ ต้องส่ง floor_code ไป frontend
        "floor": s.get("FloorCode"),

        "floor_id": s.get("FloorID"),

        "position": {
            "x": s.get("PosX"),
            "y": s.get("PosY")
        },

        "logo": s.get("LogoURL"),

        "category": {
            "name": s.get("StoreCategoryName"),
            "icon": s.get("StoreCategoryIcon")
        },

        "description": s.get("Description")
    }


# ==========================================
# 1. GET FLOORS BY MALL
# ==========================================

@floor_bp.route('/mall/<int:mall_id>', methods=['GET'])
def get_floors_by_mall(mall_id):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT 
                FloorID,
                FloorName,
                FloorCode,
                FloorOrder,
                MallID,
                StoreCount
            FROM Floor
            WHERE MallID = %s
            ORDER BY FloorOrder ASC
        """

        cursor.execute(sql, (mall_id,))
        floors = cursor.fetchall()

        formatted = [format_floor(f) for f in floors]

        return jsonify({
            "success": True,
            "data": formatted
        }), 200

    except Exception as e:
        print(f"🔥 ERROR GET FLOORS: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==========================================
# 2. GET STORES BY FLOOR (ใช้ floor_code)
# ==========================================

@floor_bp.route('/stores/', methods=['GET'])
def get_all_stores():
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT 
                s.StoreID,
                s.StoreName,
                s.FloorID,
                s.PosX,
                s.PosY,
                s.LogoURL,
                s.StoreCategoryName,
                s.StoreCategoryIcon,
                s.Description,
                f.FloorCode   -- ⭐ ตัวสำคัญ
            FROM Store s
            JOIN Floor f ON s.FloorID = f.FloorID
            ORDER BY s.StoreName ASC
        """

        cursor.execute(sql)
        stores = cursor.fetchall()

        formatted = [format_store(s) for s in stores]

        return jsonify({
            "success": True,
            "data": formatted
        }), 200

    except Exception as e:
        print(f"🔥 ERROR GET ALL STORES: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()