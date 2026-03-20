from flask import Blueprint, request, jsonify
from db import get_connection
from auth_routes import token_required

category_bp = Blueprint('category_bp', __name__)

# ==========================================
# 1. Get All Categories (Public)
# ==========================================
@category_bp.route('/', methods=['GET'])
def get_categories():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT StoreCategoryID, CategoryName FROM StoreCategory ORDER BY CategoryName")
        categories = cursor.fetchall()
        return jsonify({"status": "ok", "categories": categories})
    except Exception as e:
        print(f"ERROR GET CATEGORIES: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Create Category (Admin Only)
# ==========================================
@category_bp.route('/', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def create_category(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data or not data.get('CategoryName'):
            return jsonify({"status": "error", "message": "CategoryName is required"}), 400

        category_name = data.get('CategoryName')

        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("INSERT INTO StoreCategory (CategoryName) VALUES (%s)", (category_name,))
        conn.commit()
        
        return jsonify({"status": "ok", "message": "Category created successfully", "id": cursor.lastrowid}), 201
    except Exception as e:
        print(f"ERROR CREATE CATEGORY: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Update Category (Admin Only)
# ==========================================
@category_bp.route('/<int:category_id>', methods=['PUT'])
@token_required(allowed_roles=['Admin'])
def update_category(current_user, category_id):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data or not data.get('CategoryName'):
            return jsonify({"status": "error", "message": "CategoryName is required"}), 400

        category_name = data.get('CategoryName')

        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE StoreCategory SET CategoryName = %s WHERE StoreCategoryID = %s", (category_name, category_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Category not found"}), 404
        
        return jsonify({"status": "ok", "message": "Category updated successfully"})
    except Exception as e:
        print(f"ERROR UPDATE CATEGORY: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 4. Delete Category (Admin Only)
# ==========================================
@category_bp.route('/<int:category_id>', methods=['DELETE'])
@token_required(allowed_roles=['Admin'])
def delete_category(current_user, category_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Note: This will fail if a store is currently using this category,
        # which is good for data integrity (foreign key constraint).
        # A more user-friendly approach would be to check first.
        cursor.execute("DELETE FROM StoreCategory WHERE StoreCategoryID = %s", (category_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "Category not found"}), 404

        return jsonify({"status": "ok", "message": "Category deleted successfully"})
    except Exception as e:
        print(f"ERROR DELETE CATEGORY: {e}")
        if 'foreign key constraint fails' in str(e).lower():
            return jsonify({"status": "error", "message": "Cannot delete category as it is currently in use by one or more stores."}), 409
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
