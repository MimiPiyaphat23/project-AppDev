from flask import Blueprint, jsonify, request
from db import get_connection # Use standardized connection

mall_bp = Blueprint("mall", __name__)

# Gets all malls
@mall_bp.route('/', methods=['GET'])
def get_malls():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # Assuming the table is 'Mall', not 'malls'
        cursor.execute("SELECT * FROM Mall")
        malls = cursor.fetchall()
        return jsonify({"status": "ok", "data": malls}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# Gets a single mall by ID
@mall_bp.route('/<int:mall_id>', methods=['GET'])
def get_mall_by_id(mall_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # Assuming the PK is 'MallID'
        cursor.execute("SELECT * FROM Mall WHERE MallID = %s", (mall_id,))
        mall = cursor.fetchone()
        if mall:
            return jsonify({"status": "ok", "data": mall}), 200
        return jsonify({"status": "error", "message": "Mall not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()