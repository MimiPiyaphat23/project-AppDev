from flask import jsonify


def ok(data=None, message=None, status=200, **extra):
    payload = {"success": True, "data": data}
    if message:
        payload["message"] = message
    payload.update(extra)
    return jsonify(payload), status


def fail(message, status=400, **extra):
    payload = {"success": False, "message": message}
    payload.update(extra)
    return jsonify(payload), status
