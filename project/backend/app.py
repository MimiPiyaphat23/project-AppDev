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
from routes.store_route import store_bp
from product_routes import product_bp
from favorite_routes import favorite_bp
from upload_routes import upload_bp
from user_routes import user_bp
from routes.category_route import category_bp
from routes.mall_route import mall_bp
from routes.floor_route import floor_bp # <--- ADDED

def create_app():
    app = Flask(__name__)
    
    # ==========================================
    # Configurations (การตั้งค่า)
    # ==========================================
    # ต้องตั้งให้ตรงกับค่าในไฟล์ auth ที่ใช้ทำ JWT Token
    app.config['SECRET_KEY'] = 'mysecret' 
    
    # เปิด CORS แบบเจาะจงเพื่อให้รองรับ Header ของ Ngrok และการส่ง Token
    CORS(app, resources={r"/api/*": {"origins": "*"}}, 
         allow_headers=["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
         supports_credentials=True)

    # ==========================================
    # Register Blueprints (ลงทะเบียน Routes)
    # ==========================================
    # แนะนำให้ใส่ url_prefix เพื่อให้ API ดูเป็นระบบ เช่น http://localhost:5000/api/auth/login
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(store_bp, url_prefix='/api/stores') # Changed prefix to /stores
    app.register_blueprint(product_bp, url_prefix='/api/products') # Changed prefix to /products
    app.register_blueprint(map_bp, url_prefix='/api/map')
    app.register_blueprint(favorite_bp, url_prefix='/api/favorites') # Changed prefix to /favorites
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(category_bp, url_prefix='/api/categories')
    app.register_blueprint(mall_bp, url_prefix='/api/malls')
    app.register_blueprint(floor_bp, url_prefix='/api/floors') # <--- ADDED

    # ==========================================
    # Test Routes (สำหรับเช็คว่า Server ล่มไหม)
    # ==========================================
    @app.route('/')
    def home():
        return jsonify({"message": "Backend Server is running!"})

    @app.route('/testdb')
    def testdb():
        try:
            import os
            conn = get_connection()
            conn.close()
            return jsonify({
                "status": "ok", 
                "message": f"Connected to {os.environ.get('DB_NAME', 'mallmap')} at {os.environ.get('DB_HOST', '127.0.0.1')}"
            })
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