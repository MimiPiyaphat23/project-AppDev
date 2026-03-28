def format_floor(f):
    return {
        "id": f.get("FloorID"),
        "name": f.get("FloorName"),
        "mall_id": f.get("MallID"),
        "floor_code": f.get("FloorCode"),
        "floor_order": f.get("FloorOrder"),
        "store_count": f.get("StoreCount", 0)
    }