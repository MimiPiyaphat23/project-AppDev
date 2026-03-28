from db import get_connection

def get_all_categories():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT StoreCategoryID, StoreCategoryName
        FROM StoreCategory
        ORDER BY StoreCategoryName
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

def create_category(category_name):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO StoreCategory (StoreCategoryName) VALUES (%s)",
        (category_name,)
    )
    conn.commit()

    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return new_id

def update_category(category_id, category_name):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE StoreCategory SET StoreCategoryName=%s WHERE StoreCategoryID=%s",
        (category_name, category_id)
    )
    conn.commit()

    affected = cursor.rowcount
    cursor.close()
    conn.close()
    return affected


def delete_category(category_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM StoreCategory WHERE StoreCategoryID=%s",
        (category_id,)
    )
    conn.commit()

    affected = cursor.rowcount
    cursor.close()
    conn.close()
    return affected

def get_category_by_name(category_name):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT StoreCategoryID, StoreCategoryIcon
        FROM StoreCategory
        WHERE StoreCategoryName = %s
        LIMIT 1
    """

    cursor.execute(sql, (category_name,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result