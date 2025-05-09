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
