from flask import Blueprint, request

from api_utils import fail, ok
from auth_routes import token_required
from db import get_connection
from logger import log

store_bp = Blueprint("store_bp", __name__)


def format_store(row):
    return {
        "id": row["StoreID"],
        "name": row["StoreName"],
        "mall_id": row["MallID"],
        "floor": row["FloorCode"],
        "floor_id": row["FloorID"],
        "floor_code": row["FloorCode"],
        "map_x": float(row.get("PosX") or 0),
        "map_y": float(row.get("PosY") or 0),
        "position": {"x": float(row.get("PosX") or 0), "y": float(row.get("PosY") or 0)},
        "logo": row.get("LogoURL"),
        "category_name": row.get("StoreCategoryName"),
        "category": {
            "name": row.get("StoreCategoryName"),
            "icon": row.get("StoreCategoryIcon"),
        },
        "description": row.get("Description"),
        "phone": row.get("Phone"),
        "opening_hours": row.get("OpeningHours"),
        "owner_user_id": row.get("UserID"),
        "floor_name": row.get("FloorName"),
        "mall_name": row.get("MallName"),
        "store_category_id": row.get("StoreCategoryID"),
    }


def base_store_query(where_clause="", order_clause="ORDER BY s.StoreName ASC"):
    return f"""
        SELECT
            s.StoreID,
            s.UserID,
            s.StoreName,
            s.StoreCategoryName,
            s.StoreCategoryIcon,
            s.StoreCategoryID,
            s.Description,
            s.Phone,
            s.OpeningHours,
            s.LogoURL,
            s.MallID,
            m.MallName,
            s.FloorID,
            f.FloorName,
            f.FloorCode,
            s.PosX,
            s.PosY
        FROM Store s
        JOIN Floor f ON f.FloorID = s.FloorID
        JOIN Mall m ON m.MallID = s.MallID
        {where_clause}
        {order_clause}
    """


@store_bp.route("/", methods=["GET"])
def get_all_stores():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(base_store_query())
        return ok([format_store(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR GET ALL STORES: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@store_bp.route("/mall/<int:mall_id>", methods=["GET"])
def get_stores_by_mall(mall_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(base_store_query("WHERE s.MallID = %s"), (mall_id,))
        return ok([format_store(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR GET STORES BY MALL: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@store_bp.route("/search", methods=["GET"])
def search_stores():
    conn = None
    cursor = None
    try:
        mall_id = request.args.get("mall_id", type=int)
        q = (request.args.get("q") or "").strip()
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        conditions = []
        params = []
        if mall_id:
            conditions.append("s.MallID = %s")
            params.append(mall_id)
        if q:
            conditions.append("(s.StoreName LIKE %s OR s.StoreCategoryName LIKE %s)")
            like = f"%{q}%"
            params.extend([like, like])
        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        cursor.execute(base_store_query(where), tuple(params))
        return ok([format_store(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR SEARCH STORES: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@store_bp.route("/<int:store_id>", methods=["GET"])
def get_store_by_id(store_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(base_store_query("WHERE s.StoreID = %s", order_clause=""), (store_id,))
        row = cursor.fetchone()
        if not row:
            return fail("Store not found", 404)
        return ok(format_store(row))
    except Exception as e:
        log.error("ERROR GET STORE BY ID: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@store_bp.route("/", methods=["POST"])
@token_required(["Admin", "StoreOwner"])
def create_store(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        log.info("CREATE STORE REQUEST: %s", data)
        
        required = ["StoreName", "StoreCategoryName", "StoreCategoryID", "MallID", "FloorID"]
        missing = [field for field in required if not data.get(field)]
        if missing:
            log.warning("Missing required fields: %s", missing)
            return fail(f"Missing required fields: {', '.join(missing)}", 400)

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify Mall exists
        cursor.execute("SELECT MallID FROM Mall WHERE MallID = %s", (data["MallID"],))
        if not cursor.fetchone():
            log.warning("Mall not found with ID: %s", data["MallID"])
            return fail(f"Mall not found with ID {data['MallID']}", 404)
        
        # Verify Floor exists
        cursor.execute("SELECT FloorName FROM Floor WHERE FloorID = %s", (data["FloorID"],))
        floor = cursor.fetchone()
        if not floor:
            log.warning("Floor not found with ID: %s", data["FloorID"])
            return fail(f"Floor not found with ID {data['FloorID']}", 404)
        
        # Verify StoreCategoryID exists
        cursor.execute("SELECT StoreCategoryName FROM StoreCategory WHERE StoreCategoryID = %s", (data["StoreCategoryID"],))
        category = cursor.fetchone()
        if not category:
            log.warning("Category not found with ID: %s", data["StoreCategoryID"])
            return fail(f"Category not found with ID {data['StoreCategoryID']}", 404)

        user_id = data.get("UserID") or current_user.get("user_id")
        if not user_id:
            log.warning("No user ID found in current_user: %s", current_user)
            return fail("User ID not found", 400)
            
        log.info("Inserting store with UserID: %s, StoreName: %s, FloorID: %s, MallID: %s", user_id, data["StoreName"], data["FloorID"], data["MallID"])
        
        cursor.execute(
            """
            INSERT INTO Store (
                UserID, StoreName, StoreCategoryName, StoreCategoryIcon, StoreCategoryID,
                Description, Phone, OpeningHours, LogoURL, MallID, FloorName, FloorID, PosX, PosY
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                data["StoreName"],
                data["StoreCategoryName"],
                data.get("StoreCategoryIcon") or "shopping-bag",
                data["StoreCategoryID"],
                data.get("Description") or "",
                data.get("Phone") or "",
                data.get("OpeningHours") or "",
                data.get("LogoURL") or "",
                data["MallID"],
                floor["FloorName"],
                data["FloorID"],
                data.get("PosX") or 0,
                data.get("PosY") or 0,
            ),
        )
        store_id = cursor.lastrowid
        conn.commit()
        log.info("Store created successfully with ID: %s", store_id)
        return ok({"id": store_id}, message="Store created successfully", status=201)
    except Exception as e:
        log.error("ERROR CREATE STORE: %s", e, exc_info=True)
        return fail(f"An internal server error occurred: {str(e)}", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@store_bp.route("/<int:store_id>", methods=["PUT"])
@token_required(["Admin", "StoreOwner"])
def update_store(current_user, store_id):
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        log.info("UPDATE STORE REQUEST (ID: %s): %s", store_id, data)
        
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify Store exists
        cursor.execute("SELECT StoreID FROM Store WHERE StoreID = %s", (store_id,))
        if not cursor.fetchone():
            log.warning("Store not found with ID: %s", store_id)
            return fail("Store not found", 404)
        
        # Verify Floor exists if FloorID is provided
        floor = None
        if data.get("FloorID"):
            cursor.execute("SELECT FloorName FROM Floor WHERE FloorID = %s", (data["FloorID"],))
            floor = cursor.fetchone()
            if not floor:
                log.warning("Floor not found with ID: %s", data["FloorID"])
                return fail(f"Floor not found with ID {data['FloorID']}", 404)
        
        # Verify StoreCategoryID exists if provided
        if data.get("StoreCategoryID"):
            cursor.execute("SELECT StoreCategoryName FROM StoreCategory WHERE StoreCategoryID = %s", (data["StoreCategoryID"],))
            category = cursor.fetchone()
            if not category:
                log.warning("Category not found with ID: %s", data["StoreCategoryID"])
                return fail(f"Category not found with ID {data['StoreCategoryID']}", 404)
        
        cursor.execute(
            """
            UPDATE Store SET
                StoreName=%s,
                StoreCategoryName=%s,
                StoreCategoryIcon=%s,
                StoreCategoryID=%s,
                Description=%s,
                Phone=%s,
                OpeningHours=%s,
                LogoURL=%s,
                FloorName=%s,
                FloorID=%s,
                PosX=%s,
                PosY=%s
            WHERE StoreID=%s
            """,
            (
                data.get("StoreName"),
                data.get("StoreCategoryName"),
                data.get("StoreCategoryIcon") or "shopping-bag",
                data.get("StoreCategoryID"),
                data.get("Description") or "",
                data.get("Phone") or "",
                data.get("OpeningHours") or "",
                data.get("LogoURL") or "",
                floor["FloorName"] if floor else data.get("FloorName") or "",
                data.get("FloorID"),
                data.get("PosX") or 0,
                data.get("PosY") or 0,
                store_id,
            ),
        )
        conn.commit()
        log.info("Store updated successfully with ID: %s", store_id)
        return ok(message="Store updated successfully")
    except Exception as e:
        log.error("ERROR UPDATE STORE: %s", e, exc_info=True)
        return fail(f"An internal server error occurred: {str(e)}", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@store_bp.route("/<int:store_id>", methods=["DELETE"])
@token_required(["Admin", "StoreOwner"])
def delete_store(current_user, store_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Store WHERE StoreID = %s", (store_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return fail("Store not found", 404)
        return ok(message="Store deleted successfully")
    except Exception as e:
        log.error("ERROR DELETE STORE: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
