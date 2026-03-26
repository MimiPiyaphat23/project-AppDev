from flask import Blueprint, jsonify, request
from db import get_connection
from logger import log
from auth_routes import token_required # Import token_required for user-specific data

mall_bp = Blueprint("mall_bp", __name__) # Renamed to mall_bp for consistency

# ==========================================
# 1. Get All Malls (with Search)
# ==========================================
@mall_bp.route('/', methods=['GET'])
def get_malls():
    """
    Gets all malls, with an option to search by name or location.
    Matches frontend API: mallAPI.getAll(search)
    """
    conn = None
    cursor = None
    try:
        search_query = request.args.get('search', '') # Get search parameter
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        if search_query:
            # --- API Compliance: Add search functionality ---
            sql = "SELECT * FROM Mall WHERE MallName LIKE %s OR Location LIKE %s"
            params = (f"%{search_query}%", f"%{search_query}%")
            cursor.execute(sql, params)
        else:
            cursor.execute("SELECT * FROM Mall")

        malls = cursor.fetchall()
        log.info(f"Fetched {len(malls)} malls with search term: '{search_query}'")
        # --- API Compliance: Return { success: true, data: ... } ---
        return jsonify({"success": True, "data": malls}), 200
    except Exception as e:
        log.error(f"ERROR FETCHING MALLS: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 2. Get Popular Malls
# ==========================================
@mall_bp.route('/popular', methods=['GET'])
def get_popular_malls():
    """
    Gets all malls marked as 'popular'.
    Matches frontend API: mallAPI.getPopular()
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # --- API Compliance: Assumes 'IsPopular' column exists based on frontend mock ---
        cursor.execute("SELECT * FROM Mall WHERE IsPopular = 1")
        malls = cursor.fetchall()
        log.info(f"Fetched {len(malls)} popular malls.")
        return jsonify({"success": True, "data": malls}), 200
    except Exception as e:
        log.error(f"ERROR FETCHING POPULAR MALLS: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================
# 3. Get Recent Malls (Placeholder)
# ==========================================
@mall_bp.route('/recent', methods=['GET'])
@token_required(allowed_roles=['Customer']) # Recent malls are user-specific
def get_recent_malls(current_user):
    """
    Gets malls recently visited by the user.
    Matches frontend API: mallAPI.getRecent()
    NOTE: This is a placeholder and requires a user history tracking implementation.
    """
    user_id = current_user.get('user_id')
    # TODO: Implement logic to fetch recent malls for the given user_id.
    # For now, returning an empty list to satisfy the API contract.
    log.warning(f"Accessed /recent endpoint for user_id {user_id}, which is not fully implemented.")
    return jsonify({"success": True, "data": []}), 200

# ==========================================
# 4. Get Mall by ID
# ==========================================
@mall_bp.route('/<int:mall_id>', methods=['GET'])
def get_mall_by_id(mall_id):
    """
    Gets a single mall by its ID.
    Matches frontend API: mallAPI.getById(id)
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Mall WHERE MallID = %s", (mall_id,))
        mall = cursor.fetchone()
        if mall:
            log.info(f"Fetched details for MallID: {mall_id}")
            return jsonify({"success": True, "data": mall}), 200
        else:
            return jsonify({"success": False, "message": "Mall not found"}), 404
    except Exception as e:
        log.error(f"ERROR FETCHING MALL BY ID {mall_id}: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()