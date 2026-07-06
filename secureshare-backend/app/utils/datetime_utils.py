from datetime import datetime, timezone, timedelta


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    return utc_now().isoformat().replace('+00:00', 'Z')


def add_minutes_iso(minutes: int) -> str:
    return (utc_now() + timedelta(minutes=minutes)).isoformat().replace('+00:00', 'Z')


def parse_iso(value: str) -> datetime:
    if value.endswith('Z'):
        value = value.replace('Z', '+00:00')
    return datetime.fromisoformat(value)


def is_past(iso_value: str | None) -> bool:
    if not iso_value:
        return False
    return parse_iso(iso_value) <= utc_now()
