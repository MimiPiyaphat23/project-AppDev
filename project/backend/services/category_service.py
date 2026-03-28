from repositories.category_repository import (
    get_all_categories,
    create_category,
    update_category,
    delete_category
)
from utils.category_formatter import format_category


def get_categories_service():
    categories = get_all_categories()
    return [format_category(c) for c in categories]


def create_category_service(data):
    if not data or not data.get("CategoryName"):
        raise ValueError("CategoryName is required")

    return create_category(data["CategoryName"])


def update_category_service(category_id, data):
    if not data or not data.get("CategoryName"):
        raise ValueError("CategoryName is required")

    affected = update_category(category_id, data["CategoryName"])
    if affected == 0:
        return None
    return True


def delete_category_service(category_id):
    affected = delete_category(category_id)
    if affected == 0:
        return None
    return True