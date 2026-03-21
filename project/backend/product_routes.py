from flask import Blueprint, request, jsonify
from db import get_connection
from auth_routes import token_required
from logger import log

product_bp = Blueprint("product", __name__)

# ==========================================
# 1. Get All Products (Public)
# ==========================================
@product_bp.route("/", methods=["GET"])
def get_all_products():
    """
    Returns a list of all products from all stores.
    This route is public.
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # Select all relevant product fields as per SRS
        cursor.execute("SELECT ProductID, ProductName, Price, StockQuantity, ProductImage, StoreID FROM Product")
        products = cursor.fetchall()
        return jsonify({"status": "ok", "products": products})
    except Exception as e:
        log.error(f"ERROR GET ALL PRODUCTS: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Create Product (Admin / StoreOwner)
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
        
        # --- SRS 7.4: Data Validation ---
        errors = {}
        product_name = data.get('ProductName')
        price = data.get('Price')
        stock = data.get('StockQuantity', 0)

        if not product_name or not product_name.strip():
            errors['ProductName'] = 'ProductName cannot be empty.'
        
        try:
            if float(price) < 0:
                errors['Price'] = 'Price must be a non-negative number.'
        except (ValueError, TypeError):
            errors['Price'] = 'Price must be a valid number.'

        try:
            if int(stock) < 0:
                errors['StockQuantity'] = 'StockQuantity must be a non-negative integer.'
        except (ValueError, TypeError):
            errors['StockQuantity'] = 'StockQuantity must be a valid integer.'
            
        if errors:
            return jsonify({"status": "error", "message": "Validation failed", "errors": errors}), 400

        role = current_user.get('role')
        
        if role == 'StoreOwner':
            store_id = current_user.get('store_id')
            if not store_id:
                return jsonify({"status": "error", "message": "StoreOwner is not associated with a store"}), 403
        elif role == 'Admin':
            store_id = data.get('StoreID')
            if not store_id:
                return jsonify({"status": "error", "message": "Admin must provide a StoreID"}), 400
        else:
            return jsonify({"status": "error", "message": "Unauthorized role"}), 403

        conn = get_connection()
        cursor = conn.cursor()
        
        sql = """
            INSERT INTO Product (ProductName, Price, StockQuantity, ProductImage, StoreID)
            VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            data.get('ProductName'),
            data.get('Price'),
            data.get('StockQuantity', 0), # Default to 0 if not provided
            data.get('ProductImage'), # Can be null
            store_id
        )
        
        cursor.execute(sql, params)
        conn.commit()
        
        product_id = cursor.lastrowid
        log.info(f"User '{current_user['user_id']}' ({current_user['role']}) created new product. ProductID: {product_id}, Name: '{data.get('ProductName')}'.")
        
        return jsonify({"status": "ok", "message": "Product added successfully", "product_id": product_id}), 201

    except Exception as e:
        log.error(f"ERROR ADD PRODUCT: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Update Product (Admin / StoreOwner)
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
            return jsonify({"status": "error", "message": "No update data provided"}), 400
            
        errors = {}
        if 'ProductName' in data and (not data['ProductName'] or not data['ProductName'].strip()):
            errors['ProductName'] = 'ProductName cannot be empty.'
        
        if 'Price' in data:
            try:
                if float(data['Price']) < 0:
                    errors['Price'] = 'Price must be a non-negative number.'
            except (ValueError, TypeError):
                errors['Price'] = 'Price must be a valid number.'

        if 'StockQuantity' in data:
            try:
                if int(data['StockQuantity']) < 0:
                    errors['StockQuantity'] = 'StockQuantity must be a non-negative integer.'
            except (ValueError, TypeError):
                errors['StockQuantity'] = 'StockQuantity must be a valid integer.'

        if errors:
            return jsonify({"status": "error", "message": "Validation failed", "errors": errors}), 400

        role = current_user.get('role')
        
        # Build the query dynamically based on what's provided
        update_fields = []
        params = []
        for key in ['ProductName', 'Price', 'StockQuantity', 'ProductImage']:
            if key in data:
                update_fields.append(f"{key} = %s")
                params.append(data[key])
        
        if not update_fields:
            return jsonify({"status": "error", "message": "No valid fields to update"}), 400

        sql = f"UPDATE Product SET {', '.join(update_fields)} WHERE ProductID = %s"
        params.append(product_id)

        conn = get_connection()
        cursor = conn.cursor()

        # --- Security & SRS Logic ---
        if role == 'StoreOwner':
            store_id = current_user.get('store_id')
            if not store_id:
                return jsonify({"status": "error", "message": "StoreOwner is not associated with a store"}), 403
            sql += " AND StoreID = %s" # Add security check
            params.append(store_id)
        
        cursor.execute(sql, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Product not found or you do not have permission to edit it"}), 404
        
        log.info(f"User '{current_user['user_id']}' ({current_user['role']}) updated product. ProductID: {product_id}.")
        return jsonify({"status": "ok", "message": "Product updated successfully"})

    except Exception as e:
        log.error(f"ERROR UPDATE PRODUCT: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 4. Delete Product (Admin / StoreOwner)
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
        role = current_user.get('role')
        
        sql = "DELETE FROM Product WHERE ProductID = %s"
        params = [product_id]

        conn = get_connection()
        cursor = conn.cursor()
        
        # --- Security & SRS Logic ---
        if role == 'StoreOwner':
            store_id = current_user.get('store_id')
            if not store_id:
                return jsonify({"status": "error", "message": "StoreOwner is not associated with a store"}), 403
            sql += " AND StoreID = %s" # Add security check
            params.append(store_id)
        
        cursor.execute(sql, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Product not found or you do not have permission to delete it"}), 404

        log.info(f"User '{current_user['user_id']}' ({current_user['role']}) deleted product. ProductID: {product_id}.")
        return jsonify({"status": "ok", "message": "Product deleted successfully"})
    except Exception as e:
        log.error(f"ERROR DELETE PRODUCT: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()