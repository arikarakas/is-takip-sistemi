import threading
import time
from collections.abc import Callable

from fastapi import HTTPException, Request, status

from app.core.http import get_client_ip


class RateLimiter:
    """In-memory API rate limiting (tek instance için)."""

    _lock = threading.Lock()
    _requests: dict[str, list[float]] = {}

    @classmethod
    def _prune(cls, bucket_key: str, now: float, window_seconds: int) -> list[float]:
        window_start = now - window_seconds
        timestamps = [ts for ts in cls._requests.get(bucket_key, []) if ts > window_start]
        if timestamps:
            cls._requests[bucket_key] = timestamps
        else:
            cls._requests.pop(bucket_key, None)
        return timestamps

    @classmethod
    def check(
        cls,
        request: Request,
        *,
        scope: str,
        max_requests: int,
        window_seconds: int,
    ) -> None:
        now = time.monotonic()
        bucket_key = f"{scope}:{get_client_ip(request)}"

        with cls._lock:
            timestamps = cls._prune(bucket_key, now, window_seconds)
            if len(timestamps) >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Çok fazla istek. Lütfen bir süre sonra tekrar deneyin.",
                    headers={"Retry-After": str(window_seconds)},
                )
            timestamps.append(now)
            cls._requests[bucket_key] = timestamps


def make_rate_limiter(
    scope: str,
    max_requests: int,
    window_seconds: int,
) -> Callable[[Request], None]:
    async def _rate_limit(request: Request) -> None:
        RateLimiter.check(
            request,
            scope=scope,
            max_requests=max_requests,
            window_seconds=window_seconds,
        )

    return _rate_limit
