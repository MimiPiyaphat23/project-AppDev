from flask import Blueprint

from api_utils import fail, ok
from db import get_connection
from logger import log

map_bp = Blueprint("map_bp", __name__)


@map_bp.route("/stores", methods=["GET"])
def get_map_stores():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT StoreID AS id, StoreName AS name, PosX AS pos_x, PosY AS pos_y, FloorID AS floor_id FROM Store ORDER BY StoreName ASC"
        )
        return ok(cursor.fetchall())
    except Exception as e:
        log.error("ERROR GET MAP STORES: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
