import mysql.connector

def get_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="123456",
            database="mallmap"
        )
        if conn.is_connected():
            print("เชื่อมต่อฐานข้อมูลสำเร็จ")
        return conn
    except mysql.connector.Error as err:
        raise RuntimeError(f"ไม่สามารถเชื่อมต่อฐานข้อมูลได้: {err}") from err