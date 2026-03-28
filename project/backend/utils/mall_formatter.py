def format_mall(m):
    return {
        "id": m.get("MallID"),
        "name": m.get("MallName"),
        "location": m.get("Location"),
        "store_count": m.get("StoreCount", 0),
        "image": m.get("MallImageURL"),
        "is_popular": bool(m.get("IsPopular", 0))
    }