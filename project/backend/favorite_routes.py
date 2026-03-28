from flask import Blueprint, request, jsonify
from db import get_connection
from auth_routes import token_required
from logger import log

favorite_bp = Blueprint("favorite_bp", __name__) # Renamed for consistency

# Any authenticated user can manage their own favorites.
ALLOWED_ROLES = ["Admin", "StoreOwner", "Customer"]

# ==========================================
# 1. Get User's Favorite Stores
# ==========================================
@favorite_bp.route("/stores", methods=["GET"])
@token_required(allowed_roles=ALLOWED_ROLES)
def get_favorite_stores(current_user):
    """
    Gets the current user's list of favorite stores.
    Matches frontend API: favoriteAPI.getStores()
    """
    conn = None
    cursor = None
    try:
        user_id = current_user["user_id"]
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT s.StoreID AS id, s.StoreName AS name, s.LogoURL AS logo_url, s.StoreCategoryName AS category_name
            FROM FavoriteStore fs
            JOIN Store s ON fs.StoreID = s.StoreID
            WHERE fs.UserID = %s
        """
        cursor.execute(sql, (user_id,))
        stores = cursor.fetchall()
        
        log.info(f"Fetched {len(stores)} favorite stores for user {user_id}")
        return jsonify({"success": True, "data": stores})

    except Exception as e:
        log.error(f"ERROR GET FAVORITE STORES: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Add a Store to Favorites
# ==========================================
@favorite_bp.route("/stores", methods=["POST"])
@token_required(allowed_roles=ALLOWED_ROLES)
def add_favorite_store(current_user):
    """
    Adds a store to the current user's favorites.
    Matches frontend API: favoriteAPI.addStore()
    """
    conn = None
    cursor = None
    try:
        data = request.get_json()
        # --- API Compliance: Expect 'store_id' ---
        if not data or not data.get("store_id"):
            return jsonify({"success": False, "message": "store_id is required"}), 400

        user_id = current_user["user_id"]
        store_id = data["store_id"]

        conn = get_connection()
        cursor = conn.cursor()

        # Assuming the table is named FavoriteStore
        sql = "INSERT IGNORE INTO FavoriteStore (UserID, StoreID) VALUES (%s, %s)"
        cursor.execute(sql, (user_id, store_id))
        conn.commit()

        log.info(f"User {user_id} added/updated favorite store {store_id}")
        return jsonify({"success": True, "message": "Favorite added successfully"}), 200

    except Exception as e:
        if 'foreign key constraint' in str(e).lower():
            return jsonify({"success": False, "message": "Store does not exist"}), 404
        log.error(f"ERROR ADD FAVORITE STORE: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Remove a Store from Favorites
# ==========================================
@favorite_bp.route("/stores/<int:store_id>", methods=["DELETE"])
@token_required(allowed_roles=ALLOWED_ROLES)
def delete_favorite_store(current_user, store_id):
    """
    Removes a store from the current user's favorites.
    Matches frontend API: favoriteAPI.removeStore()
    """
    conn = None
    cursor = None
    try:
        user_id = current_user["user_id"]
        conn = get_connection()
        cursor = conn.cursor()

        sql = "DELETE FROM FavoriteStore WHERE UserID = %s AND StoreID = %s"
        cursor.execute(sql, (user_id, store_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Favorite not found"}), 404

        log.info(f"User {user_id} removed favorite store {store_id}")
        return jsonify({"success": True, "message": "Favorite removed successfully"})

    except Exception as e:
        log.error(f"ERROR DELETE FAVORITE STORE: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 4. Get User's Favorite Products
# ==========================================
@favorite_bp.route("/products", methods=["GET"])
@token_required(allowed_roles=ALLOWED_ROLES)
def get_favorite_products(current_user):
    """
    Gets the current user's list of favorite products.
    Matches frontend API: favoriteAPI.getProducts()
    """
    conn = None
    cursor = None
    try:
        user_id = current_user["user_id"]
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Assuming a 'FavoriteProduct' table
        sql = """
            SELECT p.ProductID AS id, p.ProductName AS name, p.Price AS price, p.ProductImageURL AS image, s.StoreName AS store_name
            FROM FavoriteProduct fp
            JOIN Product p ON fp.ProductID = p.ProductID
            JOIN Store s ON p.StoreID = s.StoreID
            WHERE fp.UserID = %s
        """
        cursor.execute(sql, (user_id,))
        products = cursor.fetchall()
        
        log.info(f"Fetched {len(products)} favorite products for user {user_id}")
        return jsonify({"success": True, "data": products})

    except Exception as e:
        log.error(f"ERROR GET FAVORITE PRODUCTS: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 5. Add a Product to Favorites
# ==========================================
@favorite_bp.route("/products", methods=["POST"])
@token_required(allowed_roles=ALLOWED_ROLES)
def add_favorite_product(current_user):
    """
    Adds a product to the current user's favorites.
    Matches frontend API: favoriteAPI.addProduct()
    """
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data or not data.get("product_id"):
            return jsonify({"success": False, "message": "product_id is required"}), 400

        user_id = current_user["user_id"]
        product_id = data["product_id"]

        conn = get_connection()
        cursor = conn.cursor()

        sql = "INSERT IGNORE INTO FavoriteProduct (UserID, ProductID) VALUES (%s, %s)"
        cursor.execute(sql, (user_id, product_id))
        conn.commit()

        log.info(f"User {user_id} added/updated favorite product {product_id}")
        return jsonify({"success": True, "message": "Favorite added successfully"}), 201

    except Exception as e:
        if 'foreign key constraint' in str(e).lower():
            return jsonify({"success": False, "message": "Product does not exist"}), 404
        log.error(f"ERROR ADD FAVORITE PRODUCT: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 6. Remove a Product from Favorites
# ==========================================
@favorite_bp.route("/products/<int:product_id>", methods=["DELETE"])
@token_required(allowed_roles=ALLOWED_ROLES)
def delete_favorite_product(current_user, product_id):
    """
    Removes a product from the current user's favorites.
    Matches frontend API: favoriteAPI.removeProduct()
    """
    conn = None
    cursor = None
    try:
        user_id = current_user["user_id"]
        conn = get_connection()
        cursor = conn.cursor()

        sql = "DELETE FROM FavoriteProduct WHERE UserID = %s AND ProductID = %s"
        cursor.execute(sql, (user_id, product_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Favorite not found"}), 404

        log.info(f"User {user_id} removed favorite product {product_id}")
        return jsonify({"success": True, "message": "Favorite removed successfully"})

    except Exception as e:
        log.error(f"ERROR DELETE FAVORITE PRODUCT: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()