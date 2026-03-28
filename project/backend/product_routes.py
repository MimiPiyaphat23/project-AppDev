from flask import Blueprint, request
from api_utils import fail, ok
from auth_routes import token_required
from db import get_connection
from logger import log

product_bp = Blueprint("product_bp", __name__)

def format_product(p):
    return {
        "id": p["ProductID"],
        "name": p["ProductName"],
        "price": float(p["Price"]),
        "stock": p["StockQuantity"],
        "image": p["ProductImageURL"],
        "store_id": p["StoreID"],
        "category_id": p["CategoryID"]
    }

@product_bp.route("/", methods=["GET"])
@token_required(["StoreOwner", "Admin"])
def get_products(current_user):
    conn = None
    cursor = None
    try:
        role = current_user.get("role")
        store_id = current_user.get("store_id")

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        if role == "Admin":
            # Admin สามารถดูสินค้าทั้งหมด หรือระบุ store_id ผ่าน query string ได้ เช่น ?store_id=1
            target_store = request.args.get("store_id")
            if target_store:
                sql = "SELECT * FROM Product WHERE StoreID = %s AND IsActive = 1"
                cursor.execute(sql, (target_store,))
            else:
                sql = "SELECT * FROM Product WHERE IsActive = 1"
                cursor.execute(sql)
        else:
            # StoreOwner ดูได้เฉพาะร้านตัวเอง
            if not store_id:
                return fail("Store ID not found in token", 403)
            sql = "SELECT * FROM Product WHERE StoreID = %s AND IsActive = 1"
            cursor.execute(sql, (store_id,))
            
        products = cursor.fetchall()

        return ok([format_product(p) for p in products])

    except Exception as e:
        log.error("ERROR GET PRODUCTS: %s", e)
        return fail("Internal server error", 500)
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@product_bp.route("/store/<int:store_id>", methods=["GET"])
def get_products_by_store(store_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # ดึงสินค้าทั้งหมดของร้านที่ระบุ และต้องเป็นสินค้าที่ยัง Active อยู่
        sql = "SELECT * FROM Product WHERE StoreID = %s AND IsActive = 1"
        cursor.execute(sql, (store_id,))
        products = cursor.fetchall()

        return ok([format_product(p) for p in products])
    except Exception as e:
        log.error("ERROR GET PRODUCTS BY STORE: %s", e)
        return fail("Internal server error", 500)
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = "SELECT * FROM Product WHERE ProductID = %s AND IsActive = 1"
        cursor.execute(sql, (product_id,))
        product = cursor.fetchone()

        if not product:
            return fail("Product not found", 404)

        return ok(format_product(product))
    except Exception as e:
        log.error("ERROR GET PRODUCT BY ID: %s", e)
        return fail("Internal server error", 500)
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@product_bp.route("/", methods=["POST"])
@token_required(["StoreOwner", "Admin"])
def add_product(current_user):
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        
        # 1. ดึง StoreID และข้อมูลจาก Request
        store_id = current_user.get("store_id")
        if current_user.get("role") == "Admin" and "store_id" in data:
            store_id = data.get("store_id")

        if not store_id:
            return fail("User does not have an associated store. (Admin must provide store_id in request body)", 403)

        # รองรับทั้ง 'name' และ 'ProductName' เพื่อความยืดหยุ่นกับ Frontend
        name = data.get("name") or data.get("ProductName")
        price = data.get("price") or data.get("Price", 0)
        stock = data.get("stock") or data.get("StockQuantity", 0)
        category_id = data.get("category_id") or data.get("CategoryID", 1)
        image_url = data.get("image_url") or data.get("ProductImageURL", "")

        if not name:
            return fail("Product name is required", 400)

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # 2. ตรวจสอบว่ามีสินค้าชื่อนี้ในร้านนี้อยู่แล้วหรือไม่ (รวมที่ IsActive = 0 ด้วย)
        check_sql = "SELECT ProductID, IsActive FROM Product WHERE ProductName = %s AND StoreID = %s"
        cursor.execute(check_sql, (name, store_id))
        existing_product = cursor.fetchone()

        if existing_product:
            if existing_product["IsActive"] == 0:
                # 3. ถ้าเจอสินค้าเดิมที่ถูกลบไปแล้ว ให้ทำการ Reactivate และ Update ข้อมูลใหม่
                update_sql = """
                    UPDATE Product 
                    SET IsActive = 1, Price = %s, StockQuantity = %s, CategoryID = %s, ProductImageURL = %s
                    WHERE ProductID = %s
                """
                cursor.execute(update_sql, (price, stock, category_id, image_url, existing_product["ProductID"]))
                conn.commit()
                return ok({"id": existing_product["ProductID"]}, message="Product reactivated successfully")
            else:
                # ถ้าสินค้ายังมีสถานะ Active อยู่ ไม่ควรให้เพิ่มซ้ำ
                return fail("This product already exists in your store", 400)

        # 4. ถ้าไม่พบสินค้าเดิมเลย จึงค่อยทำการ INSERT ใหม่
        insert_sql = """
            INSERT INTO Product (ProductName, Price, StockQuantity, ProductImageURL, StoreID, CategoryID)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_sql, (name, price, stock, image_url, store_id, category_id))
        conn.commit()

        return ok({"id": cursor.lastrowid}, message="Product added successfully", status=201)

    except Exception as e:
        log.error("ERROR ADD PRODUCT: %s", e)
        return fail("Internal server error", 500)
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@product_bp.route("/<int:product_id>", methods=["PUT"])
@token_required(["StoreOwner", "Admin"])
def update_product(current_user, product_id):
    conn = None
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        role = current_user.get("role")
        store_id = current_user.get("store_id")

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # เช็คว่าสินค้ามีอยู่จริงไหม และเป็นของร้านนี้ไหม (ถ้าไม่ใช่ Admin)
        cursor.execute("SELECT StoreID FROM Product WHERE ProductID = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            return fail("Product not found", 404)
        
        if role != "Admin" and product["StoreID"] != store_id:
            return fail("Unauthorized to update this product", 403)

        name = data.get("name")
        price = data.get("price")
        stock = data.get("stock")
        category_id = data.get("category_id")

        sql = """
            UPDATE Product 
            SET ProductName = COALESCE(%s, ProductName), 
                Price = COALESCE(%s, Price), 
                StockQuantity = COALESCE(%s, StockQuantity),
                CategoryID = COALESCE(%s, CategoryID)
            WHERE ProductID = %s
        """
        cursor.execute(sql, (name, price, stock, category_id, product_id))
        conn.commit()

        return ok(message="Product updated successfully")
    except Exception as e:
        log.error("ERROR UPDATE PRODUCT: %s", e)
        return fail("Internal server error", 500)
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@product_bp.route("/<int:product_id>", methods=["DELETE"])
@token_required(["StoreOwner", "Admin"])
def delete_product(current_user, product_id):
    conn = None
    cursor = None
    try:
        role = current_user.get("role")
        store_id = current_user.get("store_id")

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT StoreID FROM Product WHERE ProductID = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            return fail("Product not found", 404)

        if role != "Admin" and product["StoreID"] != store_id:
            return fail("Unauthorized to delete this product", 403)

        cursor.execute("UPDATE Product SET IsActive = 0 WHERE ProductID = %s", (product_id,))
        conn.commit()

        return ok(message="Product deleted successfully")
    except Exception as e:
        log.error("ERROR DELETE PRODUCT: %s", e)
        return fail("Internal server error", 500)
    finally:
        if cursor: cursor.close()
        if conn: conn.close()