from __future__ import annotations

import time
from collections import defaultdict

from fastapi import HTTPException, status

_attempts: dict[str, list[float]] = defaultdict(list)


def check_login_rate_limit(key: str, *, max_attempts: int = 10, window_seconds: int = 60) -> None:
    """Simple in-memory rate limiter for login attempts."""
    now = time.time()
    recent = [timestamp for timestamp in _attempts[key] if now - timestamp < window_seconds]
    _attempts[key] = recent

    if len(recent) >= max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )

    _attempts[key].append(now)
