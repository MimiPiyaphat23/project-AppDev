import os
import sys

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from auth_routes import auth_bp
from category_routes import category_bp
from db import get_connection
from favorite_routes import favorite_bp
from floor_routes import floor_bp
from mall_routes import mall_bp
from map_routes import map_bp
from product_routes import product_bp
from store_routes import store_bp
from upload_routes import upload_bp
from user_routes import user_bp

load_dotenv()
sys.dont_write_bytecode = True


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "mallmap-secret")

    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}},
        allow_headers=["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
        supports_credentials=True,
    )

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(store_bp, url_prefix="/api/stores")
    app.register_blueprint(product_bp, url_prefix="/api/products")
    app.register_blueprint(map_bp, url_prefix="/api/map")
    app.register_blueprint(favorite_bp, url_prefix="/api/favorites")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(category_bp, url_prefix="/api/categories")
    app.register_blueprint(mall_bp, url_prefix="/api/malls")
    app.register_blueprint(floor_bp, url_prefix="/api/floors")

    @app.route("/")
    def home():
        return jsonify({"message": "Backend Server is running!"})

    @app.route("/testdb")
    def testdb():
        try:
            conn = get_connection()
            conn.close()
            return jsonify({
                "status": "ok",
                "message": f"Connected to {os.environ.get('DB_NAME', 'MallMAP')} at {os.environ.get('DB_HOST', '127.0.0.1')}",
            })
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
