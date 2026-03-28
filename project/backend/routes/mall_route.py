from flask import Blueprint, request, jsonify
from services.mall_service import *
from logger import log

mall_bp = Blueprint('mall_bp', __name__)

# =========================
# GET ALL MALLS
# =========================
@mall_bp.route('/', methods=['GET'])
def get_malls():
    try:
        search = request.args.get('search', '').strip()
        data = get_malls_service(search)

        log.info(f"Fetched {len(data)} malls")

        return jsonify({
            "success": True,
            "data": data
        }), 200

    except Exception as e:
        log.error(f"ERROR GET MALLS: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =========================
# GET POPULAR
# =========================
@mall_bp.route('/popular', methods=['GET'])
def get_popular_malls():
    try:
        data = get_popular_malls_service()
        return jsonify({
            "success": True,
            "data": data
        })
    except Exception as e:
        log.error(f"ERROR GET POPULAR: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =========================
# GET RECENT
# =========================
@mall_bp.route('/recent/', methods=['GET'])
def get_recent_malls():
    try:
        data = get_recent_malls_service()
        return jsonify({
            "success": True,
            "data": data
        })
    except Exception as e:
        log.error(f"ERROR GET RECENT: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =========================
# GET BY ID
# =========================
@mall_bp.route('/<int:mall_id>', methods=['GET'])
def get_mall_by_id(mall_id):
    try:
        data = get_mall_by_id_service(mall_id)

        if not data:
            return jsonify({
                "success": False,
                "message": "Mall not found"
            }), 404

        return jsonify({
            "success": True,
            "data": data
        })

    except Exception as e:
        log.error(f"ERROR GET MALL BY ID {mall_id}: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500