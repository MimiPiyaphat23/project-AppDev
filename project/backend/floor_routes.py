from flask import Blueprint

from api_utils import fail, ok
from db import get_connection
from logger import log

floor_bp = Blueprint("floor_bp", __name__)


def format_floor(row):
    return {
        "id": row["FloorID"],
        "name": row["FloorName"],
        "mall_id": row["MallID"],
        "floor_code": row["FloorCode"],
        "floor_order": row["FloorOrder"],
        "store_count": int(row.get("store_count") or 0),
    }


def format_store(row):
    return {
        "id": row["StoreID"],
        "name": row["StoreName"],
        "mall_id": row["MallID"],
        "floor": row["FloorCode"],
        "floor_id": row["FloorID"],
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
    }


@floor_bp.route("/mall/<int:mall_id>", methods=["GET"])
def get_floors_by_mall(mall_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT
                f.FloorID,
                f.FloorName,
                f.MallID,
                f.FloorCode,
                f.FloorOrder,
                COUNT(s.StoreID) AS store_count
            FROM Floor f
            LEFT JOIN Store s ON s.FloorID = f.FloorID
            WHERE f.MallID = %s
            GROUP BY f.FloorID
            ORDER BY f.FloorOrder ASC
        """
        cursor.execute(sql, (mall_id,))
        return ok([format_floor(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR GET FLOORS BY MALL: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@floor_bp.route("/<int:floor_id>/stores", methods=["GET"])
def get_stores_by_floor(floor_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
            SELECT
                s.StoreID,
                s.StoreName,
                s.MallID,
                s.FloorID,
                f.FloorCode,
                s.PosX,
                s.PosY,
                s.LogoURL,
                s.StoreCategoryName,
                s.StoreCategoryIcon,
                s.Description,
                s.Phone,
                s.OpeningHours
            FROM Store s
            JOIN Floor f ON f.FloorID = s.FloorID
            WHERE s.FloorID = %s
            ORDER BY s.StoreName ASC
        """
        cursor.execute(sql, (floor_id,))
        return ok([format_store(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR GET STORES BY FLOOR: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
