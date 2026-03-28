from repositories.mall_repository import *
from utils.mall_formatter import format_mall

def get_malls_service(search=None):
    malls = get_malls_db(search)
    return [format_mall(m) for m in malls]


def get_popular_malls_service():
    malls = get_popular_malls_db()
    return [format_mall(m) for m in malls]


def get_recent_malls_service():
    malls = get_recent_malls_db()
    return [format_mall(m) for m in malls]


def get_mall_by_id_service(mall_id):
    mall = get_mall_by_id_db(mall_id)
    if not mall:
        return None
    return format_mall(mall)