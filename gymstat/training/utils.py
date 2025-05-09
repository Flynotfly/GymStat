from datetime import datetime


def is_datetime(string: str) -> bool:
    try:
        datetime.strptime(string, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return False
    else:
        return True


def is_duration(string: str) -> bool:
    for fmt in ("%H:%M:%S", "%M:%S"):
        try:
            datetime.strptime(string, fmt)
        except ValueError:
            pass
        else:
            return True
    return False


def is_5stars(string: str) -> bool:
    try:
        value = int(string)
    except ValueError:
        return False
    else:
        if 1 <= value <= 5:
            return True
        else:
            return False


def is_10stars(string: str) -> bool:
    try:
        value = int(string)
    except ValueError:
        return False
    else:
        if 1 <= value <= 10:
            return True
        else:
            return False
