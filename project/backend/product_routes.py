from flask import Blueprint, request, jsonify
from db import get_connection
from auth_routes import token_required
from logger import log

product_bp = Blueprint("product_bp", __name__) # Renamed for consistency

# ==========================================
# 1. Get Products by Store ID (Public)
# ==========================================
@product_bp.route("/store/<int:store_id>", methods=["GET"])
def get_products_by_store(store_id):
    """
    Returns a list of all products for a specific store.
    Matches frontend API: productAPI.getByStore(storeId)
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if the store exists first
        cursor.execute("SELECT StoreID FROM Store WHERE StoreID = %s", (store_id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Store not found"}), 404
            
        sql = "SELECT * FROM Product WHERE StoreID = %s"
        cursor.execute(sql, (store_id,))
        products = cursor.fetchall()
        
        log.info(f"Fetched {len(products)} products for StoreID {store_id}")
        return jsonify({"success": True, "data": products})
        
    except Exception as e:
        log.error(f"ERROR GET PRODUCTS BY STORE: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Get Product by ID (Public)
# ==========================================
@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    """
    Returns details for a single product.
    Matches frontend API: productAPI.getById(id)
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM Product WHERE ProductID = %s"
        cursor.execute(sql, (product_id,))
        product = cursor.fetchone()

        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404

        log.info(f"Fetched details for ProductID {product_id}")
        return jsonify({"success": True, "data": product})
    except Exception as e:
        log.error(f"ERROR GETTING PRODUCT BY ID: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Create Product (Admin / StoreOwner)
# ==========================================
@product_bp.route("/", methods=["POST"])
@token_required(allowed_roles=["Admin", "StoreOwner"])
def add_product(current_user):
    """
    Adds a new product.
    - StoreOwner can only add products to their own store.
    - Admin can add products to any store by specifying a 'StoreID'.
    """
    conn = None
    cursor = None
    try:
        data = request.get_json()
        
        errors = {}
        product_name = data.get('ProductName')
        price = data.get('Price')
        
        if not product_name or not product_name.strip():
            errors['ProductName'] = 'ProductName cannot be empty.'
        try:
            if float(price) < 0: errors['Price'] = 'Price must be non-negative.'
        except (ValueError, TypeError):
            errors['Price'] = 'Price must be a valid number.'

        if errors:
            return jsonify({"success": False, "message": "Validation failed", "errors": errors}), 400

        role = current_user.get('role')
        
        if role == 'StoreOwner':
            store_id = current_user.get('store_id')
            if not store_id:
                return jsonify({"success": False, "message": "StoreOwner is not associated with a store"}), 403
        elif role == 'Admin':
            store_id = data.get('StoreID')
            if not store_id:
                return jsonify({"success": False, "message": "Admin must provide a StoreID"}), 400
        else:
            return jsonify({"success": False, "message": "Unauthorized role"}), 403

        conn = get_connection()
        cursor = conn.cursor()
        
        sql = "INSERT INTO Product (ProductName, Price, StockQuantity, ProductImage, StoreID) VALUES (%s, %s, %s, %s, %s)"
        params = (data.get('ProductName'), data.get('Price'), data.get('StockQuantity', 0), data.get('ProductImage'), store_id)
        
        cursor.execute(sql, params)
        conn.commit()
        
        product_id = cursor.lastrowid
        log.info(f"User '{current_user['user_id']}' created new product {product_id}")
        return jsonify({"success": True, "message": "Product added successfully", "product_id": product_id}), 201

    except Exception as e:
        log.error(f"ERROR ADD PRODUCT: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 4. Update Product (Admin / StoreOwner)
# ==========================================
@product_bp.route("/<int:product_id>", methods=["PUT"])
@token_required(allowed_roles=["Admin", "StoreOwner"])
def update_product(current_user, product_id):
    """
    Updates an existing product.
    - StoreOwner can only update products in their own store.
    - Admin can update any product.
    """
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No update data provided"}), 400
            
        update_fields = []
        params = []
        for key in ['ProductName', 'Price', 'StockQuantity', 'ProductImage']:
            if key in data:
                update_fields.append(f"{key} = %s")
                params.append(data[key])
        
        if not update_fields:
            return jsonify({"success": False, "message": "No valid fields to update"}), 400

        sql = f"UPDATE Product SET {', '.join(update_fields)} WHERE ProductID = %s"
        params.append(product_id)

        conn = get_connection()
        cursor = conn.cursor()

        if current_user.get('role') == 'StoreOwner':
            store_id = current_user.get('store_id')
            if not store_id:
                return jsonify({"success": False, "message": "StoreOwner is not associated with a store"}), 403
            sql += " AND StoreID = %s"
            params.append(store_id)
        
        cursor.execute(sql, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Product not found or you do not have permission to edit it"}), 404
        
        log.info(f"User '{current_user['user_id']}' updated product {product_id}")
        return jsonify({"success": True, "message": "Product updated successfully"})

    except Exception as e:
        log.error(f"ERROR UPDATE PRODUCT: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 5. Delete Product (Admin / StoreOwner)
# ==========================================
@product_bp.route("/<int:product_id>", methods=["DELETE"])
@token_required(allowed_roles=["Admin", "StoreOwner"])
def delete_product(current_user, product_id):
    """
    Deletes a product.
    - StoreOwner can only delete products from their own store.
    - Admin can delete any product.
    """
    conn = None
    cursor = None
    try:
        sql = "DELETE FROM Product WHERE ProductID = %s"
        params = [product_id]

        conn = get_connection()
        cursor = conn.cursor()
        
        if current_user.get('role') == 'StoreOwner':
            store_id = current_user.get('store_id')
            if not store_id:
                return jsonify({"success": False, "message": "StoreOwner is not associated with a store"}), 403
            sql += " AND StoreID = %s"
            params.append(store_id)
        
        cursor.execute(sql, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Product not found or you do not have permission to delete it"}), 404

        log.info(f"User '{current_user['user_id']}' deleted product {product_id}")
        return jsonify({"success": True, "message": "Product deleted successfully"})
    except Exception as e:
        log.error(f"ERROR DELETE PRODUCT: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()