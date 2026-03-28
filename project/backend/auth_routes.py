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
        # --- API Compliance: Use 'username', 'email', 'password' from frontend ---
        if not data or not data.get('username') or not data.get('password') or not data.get('email'):
            return jsonify({"status": "error", "message": "Username, Email, and Password are required"}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password').encode('utf-8')
        
        # --- Security Improvement: Default role is 'Customer' ---
        # Assuming RoleID for 'Customer' is 3. This prevents users from self-assigning 'Admin' roles.
        role_id = 3 

        # Hash the password using bcrypt
        hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if username or email already exists
        cursor.execute("SELECT UserID FROM `User` WHERE Username = %s OR Email = %s", (username, email))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": "Username or Email already exists"}), 409

        sql = "INSERT INTO `User` (Username, Email, PasswordHash, RoleID) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (username, email, hashed_password.decode('utf-8'), role_id))
        conn.commit()
        
        log.info(f"New user registered: {username}")
        # --- API Compliance: Return success status and message ---
        return jsonify({"success": True, "message": "User registered successfully as Customer"}), 201

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
        # --- API Compliance: Use 'email' and 'password' from frontend ---
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"status": "error", "message": "Missing email or password"}), 400

        email = data.get('email')
        password = data.get('password').encode('utf-8')

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # --- SRS Compliance: Fetch StoreID for StoreOwners, login via Email ---
        sql = """
            SELECT 
                u.UserID AS id, 
                u.Username AS username, 
                u.Email AS email, 
                u.PasswordHash AS password_hash, 
                u.StoreID AS store_id, 
                r.RoleName AS role_name
            FROM `User` u
            JOIN Role r ON u.RoleID = r.RoleID
            WHERE u.email = %s
        """
        cursor.execute(sql, (email,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password, user['password_hash'].encode('utf-8')):
            
            # --- SRS Compliance: Add StoreID to JWT payload for StoreOwners ---
            payload = {
                'user_id': user['id'],
                'role': user['role_name'],
                'exp': datetime.utcnow() + timedelta(hours=24) # Token expires in 24 hours
            }
            if user['role_name'] == 'StoreOwner' and user['store_id']:
                payload['store_id'] = user['store_id']

            token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

            # --- API Compliance: Prepare user data for the response matching frontend ---
            user_response = {
                "id": user['id'],
                "username": user['username'],
                "email": user['email'],
                "role": user['role_name']
            }
            if user['role_name'] == 'StoreOwner':
                user_response['store_id'] = user['store_id']

            log.info(f"User '{user['username']}' logged in successfully as '{user['role_name']}'.")

            # --- API Compliance: Return response structure matching frontend ---
            return jsonify({
                "success": True,
                "message": "Login successful",
                "token": token,
                "user": user_response
            })
        else:
            log.warning(f"Login failed: Incorrect password for user {email}")
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

    except Exception as e:
        log.error(f"ERROR LOGIN: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 4. Get User Profile Route
# ==========================================
@auth_bp.route('/profile', methods=['GET'])
@token_required(allowed_roles=['Admin', 'StoreOwner', 'Customer'])
def get_profile(current_user):
    """
    Retrieves the profile of the currently logged-in user using their token.
    """
    conn = None
    cursor = None
    try:
        user_id = current_user.get('user_id')
        if not user_id:
            return jsonify({"status": "error", "message": "Invalid token data"}), 400

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch user details from the database
        sql = """
            SELECT 
                u.UserID AS id, 
                u.Username AS username, 
                u.Email AS email, 
                r.RoleName AS role, 
                u.StoreID AS store_id
            FROM `User` u
            JOIN Role r ON u.RoleID = r.RoleID
            WHERE u.id = %s
        """
        cursor.execute(sql, (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        log.info(f"Fetched profile for user_id: {user_id}")
        # --- API Compliance: Return user object as 'user' ---
        return jsonify({"success": True, "user": user})

    except Exception as e:
        log.error(f"ERROR FETCHING PROFILE: {e}")
        return jsonify({"status": "error", "message": "An internal server error occurred"}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()