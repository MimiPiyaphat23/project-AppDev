from flask import Blueprint, request, jsonify
from services.store_service import *

store_bp = Blueprint('store_bp', __name__)

# routes/store_route.py

from flask import Blueprint, request, jsonify
from db import get_connection
from services.store_service import create_store_service
from utils.store_formatter import format_store

store_bp = Blueprint('store_bp', __name__)


# GET ALL
@store_bp.route('/', methods=['GET'])
def get_all_stores():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        sql = """
            SELECT 
                s.*, f.FloorCode
            FROM Store s
            JOIN Floor f ON s.FloorID = f.FloorID
            ORDER BY s.StoreName
        """
        cursor.execute(sql)
        stores = cursor.fetchall()

        return jsonify({
            "success": True,
            "data": [format_store(s) for s in stores]
        })

    finally:
        cursor.close()
        conn.close()


# CREATE (ใช้ service)
@store_bp.route('/', methods=['POST'])
def create_store():
    try:
        data = request.json
        result = create_store_service(data)

        return jsonify({
            "success": True,
            "data": result
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# DELETE
@store_bp.route('/<int:store_id>', methods=['DELETE'])
def delete_store(store_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM Store WHERE StoreID=%s", (store_id,))
        conn.commit()

        return jsonify({"success": True})

    finally:
        cursor.close()
        conn.close()

# =========================
# GET BY ID
# =========================
@store_bp.route('/<int:store_id>', methods=['GET'])
def get_store(store_id):
    try:
        data = get_store_by_id_service(store_id)
        if not data:
            return jsonify({"success": False, "message": "Not found"}), 404
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# =========================
# UPDATE
# =========================
@store_bp.route('/<int:store_id>', methods=['PUT'])
def update_store(store_id):
    try:
        update_store_service(store_id, request.json)
        return jsonify({"success": True, "message": "Updated"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

