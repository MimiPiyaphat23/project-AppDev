from flask import Blueprint, request, jsonify
from db import get_connection
from auth_routes import token_required # Use the standardized auth decorator

favorite_bp = Blueprint("favorite", __name__)

# Any authenticated user can manage their own favorites.
ALLOWED_FAVORITE_ROLES = ["Admin", "StoreOwner", "Customer"]

# ==========================================
# 1. Get User's Favorite Stores
# ==========================================
@favorite_bp.route("/", methods=["GET"])
@token_required(allowed_roles=ALLOWED_FAVORITE_ROLES)
def get_favorites(current_user):
    conn = None
    cursor = None
    try:
        user_id = current_user["user_id"]
        
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Join with the Store table to get store details
        sql = """
            SELECT s.StoreID, s.StoreName, s.LogoURL
            FROM Favorite f
            JOIN Store s ON f.StoreID = s.StoreID
            WHERE f.UserID = %s
        """
        cursor.execute(sql, (user_id,))
        favorites = cursor.fetchall()
        
        return jsonify({"status": "ok", "favorites": favorites})

    except Exception as e:
        print(f"ERROR GET FAVORITES: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Add a Store to Favorites
# ==========================================
@favorite_bp.route("/", methods=["POST"])
@token_required(allowed_roles=ALLOWED_FAVORITE_ROLES)
def add_favorite(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data or not data.get("StoreID"):
            return jsonify({"status": "error", "message": "StoreID is required"}), 400

        user_id = current_user["user_id"]
        store_id = data["StoreID"]

        conn = get_connection()
        cursor = conn.cursor()

        # Use IGNORE to prevent errors if the favorite already exists
        sql = "INSERT IGNORE INTO Favorite (UserID, StoreID) VALUES (%s, %s)"
        cursor.execute(sql, (user_id, store_id))
        conn.commit()

        if cursor.rowcount > 0:
            message = "Favorite added successfully"
        else:
            message = "Favorite already exists"

        return jsonify({"status": "ok", "message": message}), 200

    except Exception as e:
        # Handle potential foreign key constraint errors if store_id doesn't exist
        if 'foreign key constraint' in str(e).lower():
            return jsonify({"status": "error", "message": "Store does not exist"}), 404
        print(f"ERROR ADD FAVORITE: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Remove a Store from Favorites
# ==========================================
@favorite_bp.route("/<int:store_id>", methods=["DELETE"])
@token_required(allowed_roles=ALLOWED_FAVORITE_ROLES)
def delete_favorite(current_user, store_id):
    conn = None
    cursor = None
    try:
        user_id = current_user["user_id"]

        conn = get_connection()
        cursor = conn.cursor()

        sql = "DELETE FROM Favorite WHERE UserID = %s AND StoreID = %s"
        cursor.execute(sql, (user_id, store_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Favorite not found"}), 404

        return jsonify({"status": "ok", "message": "Favorite removed successfully"})

    except Exception as e:
        print(f"ERROR DELETE FAVORITE: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()