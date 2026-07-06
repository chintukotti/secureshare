from decimal import Decimal


def to_dynamodb_value(value):
    if isinstance(value, float):
        return Decimal(str(value))
    if isinstance(value, dict):
        return {k: to_dynamodb_value(v) for k, v in value.items() if v is not None}
    if isinstance(value, list):
        return [to_dynamodb_value(v) for v in value]
    return value


def from_dynamodb_value(value):
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    if isinstance(value, dict):
        return {k: from_dynamodb_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [from_dynamodb_value(v) for v in value]
    return value
