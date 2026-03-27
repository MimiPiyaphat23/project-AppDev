from flask import Blueprint, jsonify
from db import get_connection
from logger import log

floor_bp = Blueprint("floor_bp", __name__)

# ==========================================
# 1. Get All Floors for a Mall
# ==========================================
@floor_bp.route('/mall/<int:mall_id>', methods=['GET'])
def get_floors_by_mall(mall_id):
    """
    Gets all floors for a specific mall.
    Matches frontend API: floorAPI.getByMall(mallId)
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # This assumes a 'Floor' table with a 'MallID' foreign key and 'FloorLevel' for ordering.
        sql = "SELECT FloorID, FloorName, FloorLevel, MallID FROM Floor WHERE MallID = %s ORDER BY FloorLevel"
        cursor.execute(sql, (mall_id,))
        floors = cursor.fetchall()

        log.info(f"Fetched {len(floors)} floors for MallID: {mall_id}")
        return jsonify({"success": True, "data": floors}), 200
    except Exception as e:
        log.error(f"ERROR FETCHING FLOORS FOR MALL {mall_id}: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Get All Stores on a Floor
# ==========================================
@floor_bp.route('/<int:floor_id>/stores', methods=['GET'])
def get_stores_by_floor(floor_id):
    """
    Gets all stores on a specific floor.
    Matches frontend API: floorAPI.getStores(floorId)
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # This query joins Store with Category to provide more context.
        sql = """
            SELECT s.StoreID, s.StoreName, s.Phone, s.LogoURL, s.OpeningHours, c.CategoryName 
            FROM Store s
            LEFT JOIN StoreCategory c ON s.StoreCategoryID = c.CategoryID
            WHERE s.FloorID = %s
        """
        cursor.execute(sql, (floor_id,))
        stores = cursor.fetchall()
        
        log.info(f"Fetched {len(stores)} stores for FloorID: {floor_id}")
        return jsonify({"success": True, "data": stores}), 200
    except Exception as e:
        log.error(f"ERROR FETCHING STORES FOR FLOOR {floor_id}: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
