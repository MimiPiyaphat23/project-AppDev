from db import get_connection

def get_floors_by_mall_db(mall_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            FloorID,
            FloorName,
            FloorCode,
            FloorOrder,
            MallID,
            StoreCount
        FROM Floor
        WHERE MallID = %s
        ORDER BY FloorOrder ASC
    """

    cursor.execute(sql, (mall_id,))
    data = cursor.fetchall()

    cursor.close()
    conn.close()
    return data


def get_all_stores_with_floor_db():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT 
            s.StoreID,
            s.StoreName,
            s.FloorID,
            s.PosX,
            s.PosY,
            s.LogoURL,
            s.StoreCategoryName,
            s.StoreCategoryIcon,
            s.Description,
            f.FloorCode
        FROM Store s
        JOIN Floor f ON s.FloorID = f.FloorID
        ORDER BY s.StoreName ASC
    """

    cursor.execute(sql)
    data = cursor.fetchall()

    cursor.close()
    conn.close()
    return data