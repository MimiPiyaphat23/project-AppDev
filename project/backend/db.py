import mysql.connector
import os

def get_connection():
    """
    Connect to MySQL database using environment variables
    รองรับ Railway + Local
    """
    try:
        conn = mysql.connector.connect(
            host=os.environ.get('DB_HOST', '127.0.0.1'),
            port=int(os.environ.get('DB_PORT', 3306)),  # ✅ สำคัญมาก (เพิ่มตรงนี้)
            user=os.environ.get('DB_USER', 'root'),
            password=os.environ.get('DB_PASSWORD', ''),
            database=os.environ.get('DB_NAME', 'mallmap')
        )

        if conn.is_connected():
            print("✅ Connected to database successfully")

        return conn

    except mysql.connector.Error as err:
        print(f"❌ Database connection error: {err}")
        raise RuntimeError(f"Database connection failed: {err}")