from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Query


def paginate(query: Query, page: int, limit: int) -> dict[str, Any]:
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit if total else 0,
    }
