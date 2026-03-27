from flask import Blueprint, request, jsonify
from db import get_connection
from logger import log

mall_bp = Blueprint("mall_bp", __name__)


# =========================
# FORMATTER
# =========================
def format_mall(m):
    return {
        "id": m.get("id"),
        "name": m.get("name"),
        "location": m.get("location"),
        "store_count": m.get("store_count", 0),
        "is_popular": m.get("is_popular", 0)
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

        sql = """
            SELECT 
                m.id,
                m.name,
                m.location,
                m.is_popular,
                (SELECT COUNT(*) 
                 FROM Store s 
                 WHERE s.mall_id = m.id) AS store_count
            FROM Mall m
        """

        if search:
            sql += " WHERE m.name LIKE %s OR m.location LIKE %s"
            cursor.execute(sql, (f"%{search}%", f"%{search}%"))
        else:
            cursor.execute(sql)

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

        cursor.execute("""
            SELECT 
                id,
                name,
                location,
                is_popular,
                0 AS store_count
            FROM Mall
            WHERE is_popular = 1
        """)

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

        cursor.execute("""
            SELECT 
                id,
                name,
                location,
                is_popular,
                (SELECT COUNT(*) 
                 FROM Store s 
                 WHERE s.mall_id = Mall.id) AS store_count
            FROM Mall
            WHERE id = %s
        """, (mall_id,))

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