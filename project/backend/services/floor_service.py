from repositories.floor_repository import *
from utils.floor_formatter import format_floor
from utils.store_formatter import format_store   # ✅ ใช้ร่วม

def get_floors_by_mall_service(mall_id):
    floors = get_floors_by_mall_db(mall_id)
    return [format_floor(f) for f in floors]


def get_all_stores_service():
    stores = get_all_stores_with_floor_db()
    return [format_store(s) for s in stores]   # ✅ ใช้ตัวเดียวกัน

from db import get_connection

def get_floor_by_code(floor_code):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT FloorID, FloorName
        FROM Floor
        WHERE FloorCode = %s
        LIMIT 1
    """

    cursor.execute(sql, (floor_code,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result