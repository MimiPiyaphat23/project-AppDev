from flask import Blueprint, request, jsonify
import bcrypt
from db import get_connection
from auth_routes import token_required
from logger import log

user_bp = Blueprint('user_bp', __name__)

# ==========================================
# 1. Get All Users (Admin Only)
# ==========================================
@user_bp.route('/', methods=['GET'])
@token_required(allowed_roles=['Admin'])
def get_users(current_user):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Join with Role and Store table to get more descriptive data
        sql = """
            SELECT u.UserID, u.UserName, u.Email, r.RoleName, s.StoreName
            FROM User u
            JOIN Role r ON u.RoleID = r.RoleID
            LEFT JOIN Store s ON u.StoreID = s.StoreID
            ORDER BY u.UserID
        """
        cursor.execute(sql)
        users = cursor.fetchall()
        
        return jsonify({"status": "ok", "users": users})

    except Exception as e:
        log.error(f"ERROR GET USERS: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Create a new StoreOwner (Admin Only)
# ==========================================
@user_bp.route('/store-owner', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def create_store_owner(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        
        errors = {}
        username = data.get('UserName')
        password = data.get('Password')
        store_id = data.get('StoreID')

        if not username or not username.strip():
            errors['UserName'] = 'UserName cannot be empty.'
        if not password or not password.strip():
            errors['Password'] = 'Password cannot be empty.'
        if not store_id:
            errors['StoreID'] = 'StoreID is required.'
        
        if errors:
            return jsonify({"status": "error", "message": "Validation failed", "errors": errors}), 400

        email = data.get('Email') # Optional

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if username already exists
        cursor.execute("SELECT UserID FROM User WHERE UserName = %s", (username,))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": "Username already exists"}), 409

        # Check if store exists and is not already assigned
        cursor.execute("SELECT UserID FROM User WHERE StoreID = %s", (store_id,))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": "Store is already assigned to another user"}), 409

        # RoleID for 'StoreOwner' is assumed to be 2
        role_id = 2
        
        sql = """
            INSERT INTO User (UserName, Email, PasswordHash, RoleID, StoreID)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (username, email, hashed_password.decode('utf-8'), role_id, store_id))
        conn.commit()
        
        log.info(f"Admin '{current_user['user_id']}' created new StoreOwner. UserName: {username}, StoreID: {store_id}.")
        return jsonify({"status": "ok", "message": "StoreOwner created successfully"}), 201

    except Exception as e:
        log.error(f"ERROR CREATE STORE OWNER: {e}")
        # A more specific error for foreign key constraint failure
        if 'foreign key constraint fails' in str(e).lower():
            return jsonify({"status": "error", "message": f"Invalid StoreID: {store_id} does not exist."}), 400
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Update User (Admin Only)
# ==========================================
@user_bp.route('/<int:user_id>', methods=['PUT'])
@token_required(allowed_roles=['Admin'])
def update_user(current_user, user_id):
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No update data provided"}), 400

        update_fields = []
        params = []
        
        # Allowed fields to be updated by an Admin
        if 'Email' in data:
            update_fields.append("Email = %s")
            params.append(data['Email'])
        
        if 'RoleID' in data:
            update_fields.append("RoleID = %s")
            params.append(data['RoleID'])
            # If role is changed away from StoreOwner, nullify StoreID
            if data['RoleID'] != 2: # Assuming 2 is StoreOwner
                 update_fields.append("StoreID = NULL")

        if 'StoreID' in data:
            update_fields.append("StoreID = %s")
            params.append(data['StoreID'])

        if not update_fields:
            return jsonify({"status": "error", "message": "No valid fields to update"}), 400

        params.append(user_id)
        sql = f"UPDATE User SET {', '.join(update_fields)} WHERE UserID = %s"

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        log.info(f"Admin '{current_user['user_id']}' updated user. UserID: {user_id}.")
        return jsonify({"status": "ok", "message": "User updated successfully"})
    except Exception as e:
        log.error(f"ERROR UPDATE USER: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==========================================
# 4. Delete User (Admin Only)
# ==========================================
@user_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required(allowed_roles=['Admin'])
def delete_user(current_user, user_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Prevent admin from deleting themselves
        if user_id == current_user.get('user_id'):
            return jsonify({"status": "error", "message": "Admin cannot delete themselves"}), 403

        cursor.execute("DELETE FROM User WHERE UserID = %s", (user_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        log.info(f"Admin '{current_user['user_id']}' deleted user. UserID: {user_id}.")
        return jsonify({"status": "ok", "message": "User deleted successfully"}), 200
    except Exception as e:
        log.error(f"ERROR DELETE USER: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
