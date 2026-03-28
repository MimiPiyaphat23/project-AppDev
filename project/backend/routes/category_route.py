from flask import Blueprint, request, jsonify
from auth_routes import token_required
from services.category_service import (
    get_categories_service,
    create_category_service,
    update_category_service,
    delete_category_service
)

category_bp = Blueprint('category_bp', __name__)


# =========================
# GET ALL
# =========================
@category_bp.route('/', methods=['GET'])
def get_categories():
    try:
        data = get_categories_service()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# =========================
# CREATE
# =========================
@category_bp.route('/', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def create_category(current_user):
    try:
        data = request.get_json()
        new_id = create_category_service(data)

        return jsonify({
            "success": True,
            "message": "Category created",
            "id": new_id
        }), 201

    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# =========================
# UPDATE
# =========================
@category_bp.route('/<int:category_id>', methods=['PUT'])
@token_required(allowed_roles=['Admin'])
def update_category(current_user, category_id):
    try:
        data = request.get_json()
        result = update_category_service(category_id, data)

        if not result:
            return jsonify({"success": False, "message": "Category not found"}), 404

        return jsonify({"success": True, "message": "Updated"})

    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# =========================
# DELETE
# =========================
@category_bp.route('/<int:category_id>', methods=['DELETE'])
@token_required(allowed_roles=['Admin'])
def delete_category(current_user, category_id):
    try:
        result = delete_category_service(category_id)

        if not result:
            return jsonify({"success": False, "message": "Category not found"}), 404

        return jsonify({"success": True, "message": "Deleted"})

    except Exception as e:
        if 'foreign key constraint fails' in str(e).lower():
            return jsonify({
                "success": False,
                "message": "Category is in use"
            }), 409

        return jsonify({"success": False, "message": str(e)}), 500