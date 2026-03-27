from flask import Blueprint, request, jsonify
from db import get_connection
from logger import log

mall_bp = Blueprint("mall_bp", __name__)

# ==========================================
# Helper: แปลง DB → Frontend format
# ==========================================
def format_mall(m):
    return {
        "id": m.get("MallID"),
        "name": m.get("MallName"),
        "location": m.get("Location"),
        "store_count": m.get("StoreCount", 0),  # กัน null
        "is_popular": m.get("IsPopular", 0)
    }

# ==========================================
# 1. Get All Malls (รองรับ search)
# GET /api/malls?search=xxx
# ==========================================
@mall_bp.route('', methods=['GET'])
@mall_bp.route('/', methods=['GET'])
def get_malls():
    conn = None
    cursor = None
    try:
        search = request.args.get('search', '')

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        if search:
            sql = """
                SELECT * FROM Mall
                WHERE MallName LIKE %s OR Location LIKE %s
            """
            params = (f"%{search}%", f"%{search}%")
            cursor.execute(sql, params)
        else:
            cursor.execute("SELECT * FROM Mall")

        malls = cursor.fetchall()
        formatted = [format_mall(m) for m in malls]

        log.info(f"Fetched {len(formatted)} malls")

        return jsonify({
            "success": True,
            "data": formatted
        }), 200

    except Exception as e:
        log.error(f"ERROR GET MALLS: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==========================================
# 2. Get Popular Malls
# GET /api/malls/popular
# ==========================================
@mall_bp.route('/popular', methods=['GET'])
def get_popular_malls():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Mall WHERE IsPopular = 1")
        malls = cursor.fetchall()

        formatted = [format_mall(m) for m in malls]

        return jsonify({
            "success": True,
            "data": formatted
        }), 200

    except Exception as e:
        log.error(f"ERROR GET POPULAR MALLS: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==========================================
# 3. Get Recent Malls (ยังไม่ใช้ token)
# GET /api/malls/recent
# ==========================================
@mall_bp.route('/recent', methods=['GET'])
def get_recent_malls():
    # 🔥 ตอนนี้ยังไม่ทำ logic จริง → return ว่าง
    return jsonify({
        "success": True,
        "data": []
    }), 200


# ==========================================
# 4. Get Mall by ID
# GET /api/malls/<id>
# ==========================================
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
            return jsonify({
                "success": False,
                "message": "Mall not found"
            }), 404

        return jsonify({
            "success": True,
            "data": format_mall(mall)
        }), 200

    except Exception as e:
        log.error(f"ERROR GET MALL BY ID {mall_id}: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

mall_bp = Blueprint('mall_bp', __name__)

@mall_bp.route('/', methods=['GET'])
def get_malls():
    search = request.args.get('search', '')
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    sql = """
        SELECT m.*, (SELECT COUNT(*) FROM Store s WHERE s.mall_id = m.id) as store_count 
        FROM Mall m
    """
    if search:
        sql += " WHERE m.name LIKE %s OR m.location LIKE %s"
        cursor.execute(sql, (f"%{search}%", f"%{search}%"))
    else:
        cursor.execute(sql)
        
    malls = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"success": True, "data": malls})

@mall_bp.route('/popular', methods=['GET'])
def get_popular_malls():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Mall WHERE is_popular = TRUE")
    malls = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"success": True, "data": malls})

@mall_bp.route('/<int:mall_id>', methods=['GET'])
def get_mall_by_id(mall_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Mall WHERE id = %s", (mall_id,))
    mall = cursor.fetchone()
    cursor.close()
    conn.close()
    if mall:
        return jsonify({"success": True, "data": mall})
    return jsonify({"success": False, "message": "Mall not found"}), 404
