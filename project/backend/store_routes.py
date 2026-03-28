from flask import Blueprint, request, jsonify
from db import get_connection

store_bp = Blueprint('store_bp', __name__)

# =========================
# FORMATTER
# =========================
def format_store(s):
    return {
        "id": s.get("StoreID") or s.get("id"),
        "name": s.get("StoreName") or s.get("name"),

        "floor": s.get("FloorCode") or s.get("floor_code"),
        "floor_id": s.get("FloorID") or s.get("floor_id"),

        "position": {
            "x": s.get("PosX") or s.get("map_x"),
            "y": s.get("PosY") or s.get("map_y")
        },

        "logo": s.get("LogoURL"),

        "category": {
            "name": s.get("StoreCategoryName") or s.get("category_name"),
            "icon": s.get("StoreCategoryIcon") or s.get("category_icon")
        },

        "description": s.get("Description") or s.get("description")
    }


# =========================
# 📋 GET ALL STORES
# =========================
@store_bp.route('/', methods=['GET'])
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
                f.FloorCode
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
        print(f"🔥 ERROR GET STORES: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# =========================
# ➕ CREATE STORE
# =========================
@store_bp.route('/', methods=['POST'])
def create_store():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()

    try:
        sql = """
            INSERT INTO Store (
                UserID, StoreName, StoreCategoryName, StoreCategoryID,
                Description, Phone, OpeningHours, LogoURL,
                MallID, FloorName, FloorID, PosX, PosY
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data.get('UserID'),
            data.get('StoreName'),
            data.get('StoreCategoryName'),
            data.get('StoreCategoryID'),
            data.get('Description'),
            data.get('Phone'),
            data.get('OpeningHours'),
            data.get('LogoURL'),
            data.get('MallID'),
            data.get('FloorName'),
            data.get('FloorID'),
            data.get('PosX'),
            data.get('PosY')
        )

        cursor.execute(sql, values)
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Store created successfully"
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# =========================
# 📝 UPDATE STORE
# =========================
@store_bp.route('/<int:store_id>', methods=['PUT'])
def update_store(store_id):
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()

    try:
        sql = """
            UPDATE Store SET 
                StoreName=%s,
                StoreCategoryName=%s,
                StoreCategoryID=%s,
                Description=%s,
                Phone=%s,
                OpeningHours=%s,
                LogoURL=%s,
                FloorName=%s,
                FloorID=%s,
                PosX=%s,
                PosY=%s
            WHERE StoreID=%s
        """

        values = (
            data.get('StoreName'),
            data.get('StoreCategoryName'),
            data.get('StoreCategoryID'),
            data.get('Description'),
            data.get('Phone'),
            data.get('OpeningHours'),
            data.get('LogoURL'),
            data.get('FloorName'),
            data.get('FloorID'),
            data.get('PosX'),
            data.get('PosY'),
            store_id
        )

        cursor.execute(sql, values)
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Store updated successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# =========================
# 🗑️ DELETE STORE
# =========================
@store_bp.route('/<int:store_id>', methods=['DELETE'])
def delete_store(store_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM Store WHERE StoreID = %s", (store_id,))
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Store deleted successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# =========================
# 🔍 GET STORE BY ID
# =========================
@store_bp.route('/<int:store_id>', methods=['GET'])
def get_store_by_id(store_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
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
                f.FloorCode
            FROM Store s
            JOIN Floor f ON s.FloorID = f.FloorID
            WHERE s.StoreID = %s
        """

        cursor.execute(sql, (store_id,))
        store = cursor.fetchone()

        if not store:
            return jsonify({
                "success": False,
                "message": "Store not found"
            }), 404

        return jsonify({
            "success": True,
            "data": format_store(store)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()