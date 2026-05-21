from datetime import datetime, timedelta, timezone
import re
import calendar

def extract_time_filter(query: str):
    """
    Extract temporal constraints from a query and return
    a Chroma-compatible metadata filter.
    """

    now = datetime.now(timezone.utc)
    q = query.lower()

    # --------------------
    # Today (calendar day)
    # --------------------
    if re.search(r"\btoday\b", q):
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        return _range(start, end)

    # --------------------
    # Yesterday (calendar day)
    # --------------------
    if "yesterday" in q:
        start = (now - timedelta(days=1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end = start + timedelta(days=1)
        return _range(start, end)

    # --------------------
    # Last week (calendar week)
    # --------------------
    if "this week" in q:
        start = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        return _range(start, None)

    if "last week" in q:
        start_of_this_week = now - timedelta(days=now.weekday())
        start = (start_of_this_week - timedelta(days=7)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end = start + timedelta(days=7)
        return _range(start, end)

    if "last 7 days" in q or "past week" in q or "past 7 days" in q:
        start = (now - timedelta(days=7)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        return _range(start, None)

    # --------------------
    # Last month (calendar month)
    # --------------------
    if "last month" in q:
        year = now.year
        month = now.month - 1 or 12
        if month == 12:
            year -= 1

        start = datetime(year, month, 1, tzinfo=timezone.utc)
        last_day = calendar.monthrange(year, month)[1]
        end = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)

        return _range(start, end)

    # --------------------
    # Last year (calendar year)
    # --------------------
    if "last year" in q:
        year = now.year - 1
        start = datetime(year, 1, 1, tzinfo=timezone.utc)
        end = datetime(year, 12, 31, 23, 59, 59, tzinfo=timezone.utc)

        return _range(start, end)

    # --------------------
    # Rolling windows (last N units)
    # --------------------
    match = re.search(r"last (\d+) (minute|minutes|hour|hours|day|days)", q)
    if match:
        value = int(match.group(1))
        unit = match.group(2)

        delta = {
            "minute": timedelta(minutes=value),
            "minutes": timedelta(minutes=value),
            "hour": timedelta(hours=value),
            "hours": timedelta(hours=value),
            "day": timedelta(days=value),
            "days": timedelta(days=value)
        }[unit]

        start = now - delta
        return _range(start, None)

    # --------------------
    # Recently (heuristic)
    # --------------------
    if "recent" in q or "recently" in q:
        start = now - timedelta(hours=24)
        return _range(start, None)

    return None


# Phrases removed for keyword extraction (keep in sync with extract_time_filter).
_TEMPORAL_PHRASES = (
    "today",
    "yesterday",
    "this week",
    "last week",
    "last month",
    "last year",
    "last 7 days",
    "past week",
    "past 7 days",
    "recently",
    "recent",
)


def strip_temporal_phrases(query: str) -> str:
    """Return query text with known temporal phrases removed (for title/keyword parsing)."""
    q = query.lower()
    for phrase in sorted(_TEMPORAL_PHRASES, key=len, reverse=True):
        q = q.replace(phrase, " ")
    q = re.sub(r"\blast\s+\d+\s+(minute|minutes|hour|hours|day|days)\b", " ", q)
    return re.sub(r"\s+", " ", q).strip()


def _range(start, end):
    """
    Helper to format Chroma-compatible range filter.
    """
    if end:
        return {
            "timestamp": {
                "$gte": start.isoformat(),
                "$lt": end.isoformat()
            }
        }
    else:
        return {
            "timestamp": {
                "$gte": start.isoformat()
            }
        }
