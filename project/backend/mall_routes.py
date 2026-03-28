from flask import Blueprint, request, jsonify
from db import get_connection
from logger import log

mall_bp = Blueprint('mall_bp', __name__)


# =========================
# FORMATTER
# =========================
def format_mall(m):
    return {
        "id": m.get("MallID"),
        "name": m.get("MallName"),
        "location": m.get("Location"),
        "store_count": m.get("StoreCount", 0),
        "image": m.get("MallImageURL"),
        "is_popular": bool(m.get("IsPopular", 0))
    }


# =========================
# GET ALL MALLS
# =========================
@mall_bp.route('/', methods=['GET'])
def get_malls():
    conn = None
    cursor = None

    try:
        search = request.args.get('search', '').strip()
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        if search and search != "undefined":
            sql = "SELECT * FROM Mall WHERE MallName LIKE %s OR Location LIKE %s ORDER BY MallName ASC"
            param = f"%{search}%"
            cursor.execute(sql, (param, param))
        else:
            sql = "SELECT * FROM Mall ORDER BY MallName ASC"
            cursor.execute(sql)

            
        malls = cursor.fetchall()
        formatted = [format_mall(m) for m in malls]

        log.info(f"Fetched {len(formatted)} malls")

        return jsonify({
            "success": True,
            "data": formatted
        }), 200

        return jsonify({"success": True, "data": formatted})
    except Exception as e:
        log.error(f"ERROR GET MALLS: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
        cursor.close()
        conn.close()


# =========================
# GET POPULAR
# =========================
@mall_bp.route('/popular', methods=['GET'])
def get_popular_malls():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Mall WHERE IsPopular = 1 LIMIT 5")
        malls = cursor.fetchall()
        return jsonify({"success": True, "data": [format_mall(m) for m in malls]})
    except Exception as e:
        log.error(f"ERROR GET POPULAR: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@mall_bp.route('/recent/', methods=['GET'])
def get_recent_malls():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Mall ORDER BY MallID DESC LIMIT 3")
        malls = cursor.fetchall()
        return jsonify({"success": True, "data": [format_mall(m) for m in malls]})
    except Exception as e:
        log.error(f"ERROR GET RECENT: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# =========================
# GET BY ID
# =========================
@mall_bp.route('/<int:mall_id>', methods=['GET'])
def get_mall_by_id(mall_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Mall WHERE MallID = %s", (mall_id,))
        mall = cursor.fetchone()
        if not mall:
            return jsonify({"success": False, "message": "Mall not found"}), 404
        return jsonify({"success": True, "data": format_mall(mall)})
    except Exception as e:
        log.error(f"ERROR GET MALL BY ID {mall_id}: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()