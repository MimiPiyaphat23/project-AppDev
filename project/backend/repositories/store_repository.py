from db import get_connection

# =========================
# GET ALL
# =========================
def get_all_stores_db():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            s.StoreID, s.StoreName, s.FloorID,
            s.PosX, s.PosY, s.LogoURL,
            s.StoreCategoryName, s.StoreCategoryIcon,
            s.Description, f.FloorCode
        FROM Store s
        JOIN Floor f ON s.FloorID = f.FloorID
        ORDER BY s.StoreName ASC
    """

    cursor.execute(sql)
    data = cursor.fetchall()

    cursor.close()
    conn.close()
    return data


# =========================
# GET BY ID
# =========================
def get_store_by_id_db(store_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            s.StoreID, s.StoreName, s.FloorID,
            s.PosX, s.PosY, s.LogoURL,
            s.StoreCategoryName, s.StoreCategoryIcon,
            s.Description, f.FloorCode
        FROM Store s
        JOIN Floor f ON s.FloorID = f.FloorID
        WHERE s.StoreID = %s
    """

    cursor.execute(sql, (store_id,))
    data = cursor.fetchone()

    cursor.close()
    conn.close()
    return data


# =========================
# CREATE
# =========================
from db import get_connection

def create_store_db(data):
    conn = get_connection()
    cursor = conn.cursor()

    sql = """
        INSERT INTO Store (
            UserID,
            StoreName,
            StoreCategoryName,
            StoreCategoryIcon,
            StoreCategoryID,
            Description,
            Phone,
            OpeningHours,
            LogoURL,
            MallID,
            FloorName,
            FloorID,
            PosX,
            PosY
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        data["UserID"],
        data["StoreName"],
        data["StoreCategoryName"],
        data["StoreCategoryIcon"],  # ⭐ อย่าลืม!
        data["StoreCategoryID"],
        data["Description"],
        data["Phone"],
        data["OpeningHours"],
        data["LogoURL"],
        data["MallID"],
        data["FloorName"],
        data["FloorID"],
        data["PosX"],
        data["PosY"]
    )

    cursor.execute(sql, values)
    conn.commit()

    store_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return {"id": store_id}


# =========================
# UPDATE
# =========================
def update_store_db(store_id, values):
    conn = get_connection()
    cursor = conn.cursor()

    sql = """
        UPDATE Store SET 
            StoreName=%s,
            StoreCategoryName=%s,
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
    """

    cursor.execute(sql, (*values, store_id))
    conn.commit()

    cursor.close()
    conn.close()


# =========================
# DELETE
# =========================
def delete_store_db(store_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM Store WHERE StoreID = %s", (store_id,))
    conn.commit()

    cursor.close()
    conn.close()