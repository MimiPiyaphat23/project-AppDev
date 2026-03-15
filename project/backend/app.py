from flask import Flask, jsonify, request
from db import get_connection

app = Flask(__name__)

# --------------------------------
# Test Database
# --------------------------------
@app.route('/testdb', methods=['GET'])
def testdb():
    try:
        conn = get_connection()
        conn.close()
        return jsonify({
            "status": "ok",
            "message": "Database Connected"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })


# --------------------------------
# Get All Stores
# --------------------------------
@app.route('/stores', methods=['GET'])
def get_stores():

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
        SELECT StoreID, UserID, StoreName, StoreCategoryID,
               Phone, LogoURL, FloorID, PosX, PosY
        FROM Store
        """

        cursor.execute(sql)
        stores = cursor.fetchall()

        return jsonify({
            "status": "ok",
            "stores": stores
        })

    except Exception as e:

        print("ERROR GET STORES:", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# --------------------------------
# Create Store
# --------------------------------
@app.route('/store', methods=['POST'])
def create_store():

    conn = None
    cursor = None

    try:
        data = request.get_json()

        print("DATA RECEIVED:", data)

        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON received"
            }), 400

        userID = data.get("UserID")
        storeName = data.get("StoreName")
        categoryID = data.get("StoreCategoryID")
        phone = data.get("Phone")
        logo = data.get("LogoURL")
        floorID = data.get("FloorID")
        posX = data.get("PosX")
        posY = data.get("PosY")

        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        INSERT INTO Store
        (UserID, StoreName, StoreCategoryID, Phone, LogoURL, FloorID, PosX, PosY)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(sql, (
            userID,
            storeName,
            categoryID,
            phone,
            logo,
            floorID,
            posX,
            posY
        ))

        conn.commit()

        return jsonify({
            "status": "ok",
            "message": "Store created successfully"
        })

    except Exception as e:

        print("ERROR CREATE STORE:", e)

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# --------------------------------
# Run Server
# --------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)