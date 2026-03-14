from flask import Blueprint, request, jsonify
from db import connect_db
from middleware_auth import require_role

store_bp = Blueprint("store", __name__)

# stores = [
#     {"id": 1, "name": "Nike", "x": 100, "y": 200},
#     {"id": 2, "name": "Adidas", "x": 300, "y": 150}
# ] #fortesting without db

@store_bp.route("/stores", methods=["GET"])
def get_stores():

    db = connect_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM stores")

    return jsonify(cursor.fetchall())
    # return jsonify(stores) #fortesting without db


@store_bp.route("/stores", methods=["POST"])
@require_role("Admin")
def create_store():

    data = request.json

    db = connect_db()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO stores(name,x,y) VALUES(%s,%s,%s)",
        (data["name"], data["x"], data["y"])
    )

    db.commit()

    return jsonify({"message": "store created"})


@store_bp.route("/stores/<int:id>", methods=["DELETE"])
@require_role("Admin")
def delete_store(id):

    db = connect_db()
    cursor = db.cursor()

    cursor.execute("DELETE FROM stores WHERE id=%s", (id,))
    db.commit()

    return jsonify({"message": "store deleted"})