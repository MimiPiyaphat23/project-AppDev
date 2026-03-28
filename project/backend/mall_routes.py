from flask import Blueprint, request

from api_utils import fail, ok
from db import get_connection
from logger import log

mall_bp = Blueprint("mall_bp", __name__)


def format_mall(row):
    return {
        "id": row["MallID"],
        "name": row["MallName"],
        "location": row["Location"],
        "image": row["MallImageURL"],
        "is_popular": bool(row.get("IsPopular", 0)),
        "store_count": int(row.get("store_count") or 0),
    }


BASE_SQL = """
    SELECT
        m.MallID,
        m.MallName,
        m.Location,
        m.IsPopular,
        m.MallImageURL,
        COUNT(s.StoreID) AS store_count
    FROM Mall m
    LEFT JOIN Store s ON s.MallID = m.MallID
"""


@mall_bp.route("/", methods=["GET"])
def get_malls():
    conn = None
    cursor = None
    try:
        search = (request.args.get("search") or "").strip()
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        if search:
            sql = BASE_SQL + " WHERE m.MallName LIKE %s OR m.Location LIKE %s GROUP BY m.MallID ORDER BY m.MallName ASC"
            like = f"%{search}%"
            cursor.execute(sql, (like, like))
        else:
            sql = BASE_SQL + " GROUP BY m.MallID ORDER BY m.MallName ASC"
            cursor.execute(sql)
        return ok([format_mall(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR GET MALLS: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@mall_bp.route("/popular", methods=["GET"])
def get_popular_malls():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(BASE_SQL + " WHERE m.IsPopular = 1 GROUP BY m.MallID ORDER BY m.MallName ASC")
        return ok([format_mall(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR GET POPULAR MALLS: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@mall_bp.route("/recent/", methods=["GET"])
def get_recent_malls():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(BASE_SQL + " GROUP BY m.MallID ORDER BY m.MallID DESC LIMIT 3")
        return ok([format_mall(row) for row in cursor.fetchall()])
    except Exception as e:
        log.error("ERROR GET RECENT MALLS: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@mall_bp.route("/<int:mall_id>", methods=["GET"])
def get_mall_by_id(mall_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(BASE_SQL + " WHERE m.MallID = %s GROUP BY m.MallID", (mall_id,))
        row = cursor.fetchone()
        if not row:
            return fail("Mall not found", 404)
        return ok(format_mall(row))
    except Exception as e:
        log.error("ERROR GET MALL BY ID: %s", e)
        return fail("An internal server error occurred", 500)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
