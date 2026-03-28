# utils/store_helper.py

def map_category(category_name):
    mapping = {
        "Clothing": (1, "👕"),
        "Electronics": (2, "📱"),
        "Food": (3, "🍔"),
        "Books": (4, "📚"),
        "Shoes": (5, "👟"),
        "Beauty": (6, "💄"),
        "Sports": (7, "⚽"),
        "Other": (8, "🏪")
    }
    return mapping.get(category_name, (8, "🏪"))


def map_floor(floor_code):
    mapping = {
        "LG": (1, "Lower Ground"),
        "G": (2, "Ground Floor"),
        "1": (3, "Floor 1"),
        "2": (4, "Floor 2"),
        "3": (5, "Floor 3"),
        "4": (6, "Floor 4"),
    }
    return mapping.get(floor_code, (2, "Ground Floor"))


def transform_store_payload(data):
    category_id, category_icon = map_category(data.get("category"))
    floor_id, floor_name = map_floor(data.get("floor"))

    return {
        "UserID": 1,  # TODO: replace with auth user
        "StoreName": data.get("name"),
        "StoreCategoryName": data.get("category"),
        "StoreCategoryIcon": category_icon,
        "StoreCategoryID": category_id,
        "Description": data.get("description", ""),
        "Phone": "0000000000",
        "OpeningHours": "10:00-22:00",
        "LogoURL": data.get("logo") or "",
        "MallID": 1,
        "FloorName": floor_name,
        "FloorID": floor_id,
        "PosX": 0,
        "PosY": 0
    }