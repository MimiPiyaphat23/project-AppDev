from flask import Blueprint, request, jsonify, current_app
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from db import get_connection
from logger import log # Import the logger

auth_bp = Blueprint('auth_bp', __name__)

# ==========================================
# 1. Decorator for Token and Role Verification
# ==========================================
def token_required(allowed_roles):
    """
    Decorator to protect routes by verifying a JWT token and user roles.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'message': 'Authorization header is missing or malformed!'}), 401

            token = auth_header.split(" ")[1]
            if not token:
                return jsonify({'message': 'Token is missing!'}), 401

            try:
                # Decode the token using the app's secret key
                data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
                current_user_role = data.get('role')

                # Check if the user's role is allowed to access the route
                if current_user_role not in allowed_roles:
                    return jsonify({'message': f'Access denied. Requires one of these roles: {", ".join(allowed_roles)}'}), 403
                
                # Pass the decoded token data to the decorated function
                return f(data, *args, **kwargs)

            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired!'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token!'}), 401
        return decorated_function
    return decorator

# ==========================================
# 2. User Registration Route
# ==========================================
@auth_bp.route('/register', methods=['POST'])
def register_user():
    """
    Registers a new user. For security, registration is restricted to the 'Customer' role by default.
    Admin and StoreOwner accounts should be created via a separate, secure process.
    """
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data or not data.get('UserName') or not data.get('Password'):
            return jsonify({"status": "error", "message": "Username and Password are required"}), 400

        username = data.get('UserName')
        email = data.get('Email') # Email is optional but good to have
        password = data.get('Password').encode('utf-8')
        
        # --- Security Improvement: Default role is 'Customer' ---
        # Assuming RoleID for 'Customer' is 3. This prevents users from self-assigning 'Admin' roles.
        role_id = 3 

        # Hash the password using bcrypt
        hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if username already exists
        cursor.execute("SELECT UserID FROM User WHERE UserName = %s", (username,))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": "Username already exists"}), 409

        sql = "INSERT INTO User (UserName, Email, PasswordHash, RoleID) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (username, email, hashed_password.decode('utf-8'), role_id))
        conn.commit()
        
        log.info(f"New user registered: {username}")
        return jsonify({"status": "ok", "message": "User registered successfully as Customer"}), 201

    except Exception as e:
        log.error(f"ERROR REGISTER USER: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. User Login Route
# ==========================================
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticates a user and returns a JWT token if successful.
    For StoreOwners, the token will include their StoreID.
    """
    conn = None
    cursor = None
    try:
        data = request.get_json()
        if not data or not data.get('UserName') or not data.get('Password'):
            return jsonify({"status": "error", "message": "Missing username or password"}), 400

        username = data.get('UserName')
        password = data.get('Password').encode('utf-8')

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # --- SRS Compliance: Fetch StoreID for StoreOwners ---
        sql = """
            SELECT u.UserID, u.UserName, u.PasswordHash, u.StoreID, r.RoleName
            FROM User u
            JOIN Role r ON u.RoleID = r.RoleID
            WHERE u.UserName = %s
        """
        cursor.execute(sql, (username,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password, user['PasswordHash'].encode('utf-8')):
            
            # --- SRS Compliance: Add StoreID to JWT payload for StoreOwners ---
            payload = {
                'user_id': user['UserID'],
                'role': user['RoleName'],
                'exp': datetime.utcnow() + timedelta(hours=24) # Token expires in 24 hours
            }
            if user['RoleName'] == 'StoreOwner' and user['StoreID']:
                payload['store_id'] = user['StoreID']

            token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

            # Prepare user data for the response
            user_response = {
                "UserID": user['UserID'],
                "UserName": user['UserName'],
                "Role": user['RoleName']
            }
            if user['RoleName'] == 'StoreOwner':
                user_response['StoreID'] = user['StoreID']

            log.info(f"User '{user['UserName']}' logged in successfully as '{user['RoleName']}'.")

            return jsonify({
                "status": "ok",
                "message": "Login successful",
                "token": token,
                "user": user_response
            })
        else:
            return jsonify({"status": "error", "message": "Invalid username or password"}), 401

    except Exception as e:
        log.error(f"ERROR LOGIN: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()