from repositories.store_repository import *
from utils.store_formatter import format_store

# =========================
# GET ALL
# =========================
def get_all_stores_service():
    stores = get_all_stores_db()
    return [format_store(s) for s in stores]


# =========================
# GET BY ID
# =========================
def get_store_by_id_service(store_id):
    store = get_store_by_id_db(store_id)
    if not store:
        return None
    return format_store(store)


# =========================
# CREATE
# =========================
# services/store_service.py

from db import get_connection
from utils.store_helper import transform_store_payload


def create_store_service(data):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        payload = transform_store_payload(data)

        sql = """
            INSERT INTO Store (
                UserID, StoreName, StoreCategoryName, StoreCategoryIcon, StoreCategoryID,
                Description, Phone, OpeningHours, LogoURL,
                MallID, FloorName, FloorID, PosX, PosY
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = tuple(payload.values())

        cursor.execute(sql, values)
        conn.commit()

        return {
            "id": cursor.lastrowid,
            "name": payload["StoreName"],
            "floor": data.get("floor"),
            "category": payload["StoreCategoryName"],
            "logo": payload["LogoURL"],
            "description": payload["Description"]
        }

    finally:
        cursor.close()
        conn.close()


# =========================
# UPDATE
# =========================
def update_store_service(store_id, data):
    values = (
        data.get('StoreName'),
        data.get('StoreCategoryName'),
        data.get('StoreCategoryID'),
        data.get('Description'),
        data.get('Phone'),
        data.get('OpeningHours'),
        data.get('LogoURL'),
        data.get('FloorName'),
        data.get('FloorID'),
        data.get('PosX'),
        data.get('PosY')
    )

    update_store_db(store_id, values)


# =========================
# DELETE
# =========================
def delete_store_service(store_id):
    delete_store_db(store_id)