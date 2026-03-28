from db import get_connection

def get_malls_db(search=None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    if search and search != "undefined":
        sql = """
            SELECT * FROM Mall
            WHERE MallName LIKE %s OR Location LIKE %s
            ORDER BY MallName ASC
        """
        param = f"%{search}%"
        cursor.execute(sql, (param, param))
    else:
        sql = "SELECT * FROM Mall ORDER BY MallName ASC"
        cursor.execute(sql)

    data = cursor.fetchall()

    cursor.close()
    conn.close()
    return data


def get_popular_malls_db():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Mall WHERE IsPopular = 1 LIMIT 5")
    data = cursor.fetchall()

    cursor.close()
    conn.close()
    return data


def get_recent_malls_db():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Mall ORDER BY MallID DESC LIMIT 3")
    data = cursor.fetchall()

    cursor.close()
    conn.close()
    return data


def get_mall_by_id_db(mall_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Mall WHERE MallID = %s", (mall_id,))
    data = cursor.fetchone()

    cursor.close()
    conn.close()
    return data