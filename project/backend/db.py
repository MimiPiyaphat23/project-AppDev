import mysql.connector
import os # Recommended to use environment variables for security

def get_connection():
    """
    Establishes and returns a connection to the database.
    In a production environment, it's highly recommended to use environment
    variables for connection details instead of hardcoding them.
    """
    try:
        conn = mysql.connector.connect(
            host=os.environ.get('DB_HOST', '192.168.3.38'),
            user=os.environ.get('DB_USER', 'root'),
            password=os.environ.get('DB_PASSWORD', '123456'),
            database=os.environ.get('DB_NAME', 'mallmap')
        )
        # The is_connected() check is often redundant because connect() raises an error on failure.
        # But it's harmless to keep for explicit confirmation.
        if conn.is_connected():
            print("Successfully connected to the database.")
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        # Re-raising the error is good practice if the caller needs to handle the connection failure.
        raise RuntimeError(f"Could not connect to database: {err}") from err
