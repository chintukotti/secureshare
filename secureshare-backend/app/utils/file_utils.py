import re
from pathlib import Path


def sanitize_filename(filename: str) -> str:
    name = Path(filename).name.strip()
    name = re.sub(r'[^A-Za-z0-9._ -]', '_', name)
    return name or 'file'


def normalize_name(name: str) -> str:
    return ' '.join(name.strip().lower().split())


def get_extension(filename: str) -> str:
    return Path(filename).suffix.lower().lstrip('.')
