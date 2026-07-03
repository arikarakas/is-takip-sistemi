import threading
import time

from fastapi import HTTPException, Request, status

from app.core.config import settings


class LoginGuard:
    """In-memory login brute-force koruması (tek instance için)."""

    _lock = threading.Lock()
    _ip_attempts: dict[str, list[float]] = {}
    _account_state: dict[str, tuple[int, float, float]] = {}  # count, window_start, locked_until

    @staticmethod
    def _client_ip(request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

    @classmethod
    def _prune_ip_attempts(cls, ip: str, now: float) -> list[float]:
        window_start = now - settings.LOGIN_IP_WINDOW_SECONDS
        attempts = [ts for ts in cls._ip_attempts.get(ip, []) if ts > window_start]
        if attempts:
            cls._ip_attempts[ip] = attempts
        else:
            cls._ip_attempts.pop(ip, None)
        return attempts

    @classmethod
    def _raise_rate_limited(cls) -> None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Çok fazla giriş denemesi. Lütfen bir süre sonra tekrar deneyin.",
            headers={"Retry-After": str(settings.LOGIN_LOCKOUT_SECONDS)},
        )

    @classmethod
    def check_ip_limit(cls, request: Request) -> None:
        now = time.monotonic()
        ip = cls._client_ip(request)

        with cls._lock:
            attempts = cls._prune_ip_attempts(ip, now)
            if len(attempts) >= settings.LOGIN_IP_MAX_ATTEMPTS:
                cls._raise_rate_limited()
            attempts.append(now)
            cls._ip_attempts[ip] = attempts

    @classmethod
    def check_account_lock(cls, username: str) -> None:
        now = time.monotonic()
        key = username.lower()

        with cls._lock:
            state = cls._account_state.get(key)
            if state is None:
                return

            _, _, locked_until = state
            if locked_until > now:
                cls._raise_rate_limited()

            if locked_until > 0 and locked_until <= now:
                cls._account_state.pop(key, None)

    @classmethod
    def record_failure(cls, username: str) -> None:
        now = time.monotonic()
        key = username.lower()
        window = settings.LOGIN_LOCKOUT_SECONDS

        with cls._lock:
            count, window_start, locked_until = cls._account_state.get(key, (0, now, 0.0))

            if locked_until > now:
                return

            if now - window_start > window:
                count = 0
                window_start = now

            count += 1
            locked_until = 0.0
            if count >= settings.LOGIN_MAX_ATTEMPTS:
                locked_until = now + window
                count = 0
                window_start = now

            cls._account_state[key] = (count, window_start, locked_until)

    @classmethod
    def record_success(cls, username: str) -> None:
        key = username.lower()
        with cls._lock:
            cls._account_state.pop(key, None)
