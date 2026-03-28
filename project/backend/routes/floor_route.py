from flask import Blueprint, jsonify
from services.floor_service import *

floor_bp = Blueprint('floor_bp', __name__)

@floor_bp.route('/mall/<int:mall_id>', methods=['GET'])
def get_floors_by_mall(mall_id):
    try:
        data = get_floors_by_mall_service(mall_id)
        return jsonify({
            "success": True,
            "data": data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# routes/floor_route.py

from flask import Blueprint, jsonify
from db import get_connection
from utils.store_formatter import format_store

floor_bp = Blueprint('floor_bp', __name__)


@floor_bp.route('/stores', methods=['GET'])
def get_all_stores():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT s.*, f.FloorCode
            FROM Store s
            JOIN Floor f ON s.FloorID = f.FloorID
        """)
        stores = cursor.fetchall()

        return jsonify({
            "success": True,
            "data": [format_store(s) for s in stores]
        })

    finally:
        cursor.close()
        conn.close()