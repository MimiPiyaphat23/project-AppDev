from flask import Blueprint, jsonify
from db import get_connection # Use standardized connection

map_bp = Blueprint("map", __name__)

@map_bp.route("/map/stores", methods=["GET"])
def get_map_stores():
    """
    Fetches store data specifically for map display.
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Query aligned with SRS data model and other files
        cursor.execute("SELECT StoreID AS id, StoreName AS name, PosX AS pos_x, PosY AS pos_y FROM Store")
        stores = cursor.fetchall()

        return jsonify({"status": "ok", "stores": stores})

    except Exception as e:
        print(f"ERROR GET MAP STORES: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()