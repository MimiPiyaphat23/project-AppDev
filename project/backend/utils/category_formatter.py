def format_category(c):
    return {
        "id": c.get("StoreCategoryID"),
        "name": c.get("StoreCategoryName")
    }