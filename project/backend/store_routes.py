from flask import Blueprint, request, jsonify
from db import get_connection
from auth_routes import token_required

store_bp = Blueprint("store", __name__)

# ==========================================
# 1. Get All Stores (Public)
# ==========================================
@store_bp.route("/", methods=["GET"])
def get_stores():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # Note: The DB schema uses fields like StoreCategoryID, LogoURL, FloorID.
        # The SRS specifies Category, OpeningHours, Logo. This implementation follows the DB schema.
        sql = """
        SELECT StoreID, UserID, StoreName, StoreCategoryID, Phone, LogoURL, FloorID, PosX, PosY, OpeningHours
        FROM Store
        """
        cursor.execute(sql)
        stores = cursor.fetchall()

        return jsonify({"status": "ok", "stores": stores}), 200
    except Exception as e:
        print(f"ERROR GET STORES: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Create Store (Admin Only)
# ==========================================
@store_bp.route("/", methods=["POST"])
@token_required(allowed_roles=["Admin"])
def create_store(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data or not data.get("StoreName"):
            return jsonify({"status": "error", "message": "StoreName is a required field"}), 400

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

        return jsonify({
            "status": "ok", 
            "message": "Store created successfully",
            "store_id": cursor.lastrowid
        }), 201
    except Exception as e:
        print(f"ERROR CREATE STORE: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Update Store (Admin Only) - NEW
# ==========================================
@store_bp.route("/<int:store_id>", methods=["PUT"])
@token_required(allowed_roles=["Admin"])
def update_store(current_user, store_id):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No update data provided"}), 400

        update_fields = []
        params = []
        # Add all possible fields from the 'Store' table that an Admin can update
        for key in ["UserID", "StoreName", "StoreCategoryID", "Phone", "LogoURL", "FloorID", "PosX", "PosY", "OpeningHours"]:
            if key in data:
                update_fields.append(f"{key} = %s")
                params.append(data[key])
        
        if not update_fields:
            return jsonify({"status": "error", "message": "No valid fields to update"}), 400

        params.append(store_id)
        sql = f"UPDATE Store SET {', '.join(update_fields)} WHERE StoreID = %s"

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Store not found"}), 404
        
        return jsonify({"status": "ok", "message": "Store updated successfully"})
    except Exception as e:
        print(f"ERROR UPDATE STORE: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 4. Delete Store (Admin Only)
# ==========================================
@store_bp.route("/<int:store_id>", methods=["DELETE"])
@token_required(allowed_roles=["Admin"])
def delete_store(current_user, store_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # It's good practice to delete referencing entities first if ON DELETE CASCADE is not set
        cursor.execute("DELETE FROM Product WHERE StoreID=%s", (store_id,))
        cursor.execute("DELETE FROM Store WHERE StoreID=%s", (store_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Store not found or was already deleted"}), 404

        return jsonify({"status": "ok", "message": "Store and associated products deleted successfully"}), 200
    except Exception as e:
        print(f"ERROR DELETE STORE: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()