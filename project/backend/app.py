import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ป้องกันไม่ให้ Python สร้างไฟล์ cache ขยะ (.pyc)
sys.dont_write_bytecode = True

from flask import Flask, jsonify
from flask_cors import CORS
from db import get_connection

# 1. นำเข้า Blueprints ทั้งหมดของคุณ
from auth_routes import auth_bp
from map_routes import map_bp
from store_routes import store_bp
from product_routes import product_bp
from favorite_routes import favorite_bp
from upload_routes import upload_bp
from user_routes import user_bp
from category_routes import category_bp

def create_app():
    app = Flask(__name__)
    
    # ==========================================
    # Configurations (การตั้งค่า)
    # ==========================================
    # ต้องตั้งให้ตรงกับค่าในไฟล์ auth ที่ใช้ทำ JWT Token
    app.config['SECRET_KEY'] = 'mysecret' 
    # เปิด CORS เพื่อให้ Frontend ยิง API เข้ามาได้โดยไม่ติด Block
    CORS(app) 

    # ==========================================
    # Register Blueprints (ลงทะเบียน Routes)
    # ==========================================
    # แนะนำให้ใส่ url_prefix เพื่อให้ API ดูเป็นระบบ เช่น http://localhost:5000/api/auth/login
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(store_bp, url_prefix='/api/store')
    app.register_blueprint(product_bp, url_prefix='/api/product')
    app.register_blueprint(map_bp, url_prefix='/api/map')
    app.register_blueprint(favorite_bp, url_prefix='/api/favorite')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(category_bp, url_prefix='/api/categories')

    # ==========================================
    # Test Routes (สำหรับเช็คว่า Server ล่มไหม)
    # ==========================================
    @app.route('/')
    def home():
        return jsonify({"message": "Backend Server is running!"})

    @app.route('/testdb')
    def testdb():
        try:
            conn = get_connection()
            conn.close()
            return jsonify({"status": "ok", "message": "Database Connected"})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)})

    return app

# สร้าง Instance ของแอป
app = create_app()

# ==========================================
# Run Server
# ==========================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)