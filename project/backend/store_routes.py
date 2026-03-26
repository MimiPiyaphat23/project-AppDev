from flask import Blueprint, request, jsonify
from db import get_connection
from auth_routes import token_required
from logger import log

store_bp = Blueprint("store_bp", __name__) # Renamed for consistency

# ==========================================
# 1. Get Stores by Mall ID (Public)
# ==========================================
@store_bp.route("/mall/<int:mall_id>", methods=["GET"])
def get_stores_by_mall(mall_id):
    """
    Returns a list of all stores for a specific mall.
    Matches frontend API: storeAPI.getByMall(mallId)
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # This assumes the Floor table has a MallID. We join through Floor to get to Mall.
        # This provides a basic list of stores in the mall.
        sql = """
            SELECT s.StoreID, s.StoreName, s.LogoURL, s.FloorID
            FROM Store s
            JOIN Floor f ON s.FloorID = f.FloorID
            WHERE f.MallID = %s
        """
        cursor.execute(sql, (mall_id,))
        stores = cursor.fetchall()
        
        log.info(f"Fetched {len(stores)} stores for MallID {mall_id}")
        return jsonify({"success": True, "data": stores})
    except Exception as e:
        log.error(f"ERROR GET STORES BY MALL: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Search Stores in a Mall (Public)
# ==========================================
@store_bp.route("/search", methods=["GET"])
def search_stores():
    """
    Searches for stores within a specific mall by name or category.
    Matches frontend API: storeAPI.search(mallId, q)
    """
    conn = None
    cursor = None
    try:
        mall_id = request.args.get('mall_id', type=int)
        query = request.args.get('q', '')

        if not mall_id:
            return jsonify({"success": False, "message": "mall_id is a required query parameter."}), 400

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Joins with Floor to filter by mall, and with Category to search by category name.
        sql = """
            SELECT s.StoreID, s.StoreName, s.LogoURL, c.CategoryName
            FROM Store s
            JOIN Floor f ON s.FloorID = f.FloorID
            LEFT JOIN StoreCategory c ON s.StoreCategoryID = c.CategoryID
            WHERE f.MallID = %s AND (s.StoreName LIKE %s OR c.CategoryName LIKE %s)
        """
        params = (mall_id, f"%{query}%", f"%{query}%")
        cursor.execute(sql, params)
        stores = cursor.fetchall()

        log.info(f"Found {len(stores)} stores in MallID {mall_id} for search query '{query}'")
        return jsonify({"success": True, "data": stores})
    except Exception as e:
        log.error(f"ERROR SEARCHING STORES: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Get Store by ID (Public)
# ==========================================
@store_bp.route("/<int:store_id>", methods=["GET"])
def get_store_by_id(store_id):
    """
    Returns details for a single store.
    Matches frontend API: storeAPI.getById(id)
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # This query joins multiple tables to provide comprehensive details for the store page.
        sql = """
            SELECT s.StoreID, s.StoreName, s.Phone, s.LogoURL, s.OpeningHours, 
                   c.CategoryName, f.FloorName, m.MallName
            FROM Store s
            LEFT JOIN StoreCategory c ON s.StoreCategoryID = c.CategoryID
            LEFT JOIN Floor f ON s.FloorID = f.FloorID
            LEFT JOIN Mall m ON f.MallID = m.MallID
            WHERE s.StoreID = %s
        """
        cursor.execute(sql, (store_id,))
        store = cursor.fetchone()

        if not store:
            return jsonify({"success": False, "message": "Store not found"}), 404

        log.info(f"Fetched details for StoreID {store_id}")
        return jsonify({"success": True, "data": store})
    except Exception as e:
        log.error(f"ERROR GETTING STORE BY ID: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 4. Create Store (Admin Only)
# ==========================================
@store_bp.route("/", methods=["POST"])
@token_required(allowed_roles=["Admin"])
def create_store(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        
        store_name = data.get("StoreName")
        if not store_name or not store_name.strip():
            return jsonify({"success": False, "message": "Validation failed", "errors": { "StoreName": "StoreName cannot be empty." }}), 400

        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        INSERT INTO Store
        (UserID, StoreName, StoreCategoryID, Phone, LogoURL, FloorID, PosX, PosY, OpeningHours)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            data.get("UserID"),
            data.get("StoreName"),
            data.get("StoreCategoryID"),
            data.get("Phone"),
            data.get("LogoURL"),
            data.get("FloorID"),
            data.get("PosX"),
            data.get("PosY"),
            data.get("OpeningHours")
        )
        cursor.execute(sql, params)
        conn.commit()

        store_id = cursor.lastrowid
        log.info(f"Admin '{current_user['user_id']}' created new store. StoreID: {store_id}, Name: '{data.get('StoreName')}'.")

        return jsonify({
            "success": True, 
            "message": "Store created successfully",
            "store_id": store_id
        }), 201
    except Exception as e:
        log.error(f"ERROR CREATE STORE: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 5. Update Store (Admin Only)
# ==========================================
@store_bp.route("/<int:store_id>", methods=["PUT"])
@token_required(allowed_roles=["Admin"])
def update_store(current_user, store_id):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No update data provided"}), 400
            
        if 'StoreName' in data and (not data['StoreName'] or not data['StoreName'].strip()):
            return jsonify({"success": False, "message": "Validation failed", "errors": { "StoreName": "StoreName cannot be empty." }}), 400

        update_fields = []
        params = []
        for key in ["UserID", "StoreName", "StoreCategoryID", "Phone", "LogoURL", "FloorID", "PosX", "PosY", "OpeningHours"]:
            if key in data:
                update_fields.append(f"{key} = %s")
                params.append(data[key])
        
        if not update_fields:
            return jsonify({"success": False, "message": "No valid fields to update"}), 400

        params.append(store_id)
        sql = f"UPDATE Store SET {', '.join(update_fields)} WHERE StoreID = %s"

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Store not found"}), 404
        
        log.info(f"Admin '{current_user['user_id']}' updated store. StoreID: {store_id}.")
        return jsonify({"success": True, "message": "Store updated successfully"})
    except Exception as e:
        log.error(f"ERROR UPDATE STORE: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 6. Delete Store (Admin Only)
# ==========================================
@store_bp.route("/<int:store_id>", methods=["DELETE"])
@token_required(allowed_roles=["Admin"])
def delete_store(current_user, store_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM Product WHERE StoreID=%s", (store_id,))
        cursor.execute("DELETE FROM Store WHERE StoreID=%s", (store_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Store not found or was already deleted"}), 404

        log.info(f"Admin '{current_user['user_id']}' deleted store. StoreID: {store_id}.")
        return jsonify({"success": True, "message": "Store and associated products deleted successfully"}), 200
    except Exception as e:
        log.error(f"ERROR DELETE STORE: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
