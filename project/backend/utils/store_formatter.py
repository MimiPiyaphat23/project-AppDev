# utils/formatter.py

def format_store(s):
    return {
        "id": s.get("StoreID") or s.get("id"),

        "name": s.get("StoreName") or s.get("name") or "Unknown Store",

        "floor": (
            s.get("FloorCode") or
            s.get("floor") or
            ""
        ),

        "floor_id": s.get("FloorID") or s.get("floor_id"),

        "position": {
            "x": s.get("PosX") if s.get("PosX") is not None else s.get("map_x", 0),
            "y": s.get("PosY") if s.get("PosY") is not None else s.get("map_y", 0),
        },

        "logo": s.get("LogoURL") or s.get("logo") or None,

        "category": {
            "name": (
                s.get("StoreCategoryName") or
                s.get("category_name") or
                s.get("category") or
                "Other"
            ),
            "icon": (
                s.get("StoreCategoryIcon") or
                s.get("category_icon") or
                "🏪"
            )
        },

        "description": s.get("Description") or s.get("description") or "",

        # 👉 optional fields (เผื่อใช้ในอนาคต)
        "phone": s.get("Phone"),
        "opening_hours": s.get("OpeningHours"),
        "mall_id": s.get("MallID"),
    }