"""
Parse user ask queries into optional structural constraints.

Only explicit calendar/time phrases become hard filters.
Topic words and inferred tags are never used to gate retrieval.
"""
from __future__ import annotations

from typing import NamedTuple

from temporal.parser import extract_time_filter


class QueryConstraints(NamedTuple):
    time_filter: dict | None  # Chroma-style {"timestamp": {...}}
    has_explicit_time: bool


def parse_query_constraints(query: str) -> QueryConstraints:
    time_filter = extract_time_filter(query)
    return QueryConstraints(
        time_filter=time_filter,
        has_explicit_time=time_filter is not None,
    )
