from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from app.db.mongo import sessions_collection
from retrieval.query_constraints import QueryConstraints, parse_query_constraints


def resolve_sessions_by_time(
    constraints: QueryConstraints,
) -> Optional[List[str]]:
    """
    Optional Mongo pre-filter: only when the user gave an explicit time phrase
    (yesterday, last week, today, etc.).

    Returns None if no time constraint; [] if time constraint matched no sessions.
    Never filters by inferred tags or extracted keywords.
    """
    if not constraints.has_explicit_time or not constraints.time_filter:
        return None

    ts_filter = constraints.time_filter["timestamp"]
    created_at_filter = {}
    if "$gte" in ts_filter:
        created_at_filter["$gte"] = _iso_to_dt(ts_filter["$gte"])
    if "$lt" in ts_filter:
        created_at_filter["$lt"] = _iso_to_dt(ts_filter["$lt"])

    if not created_at_filter:
        return None

    candidates = list(
        sessions_collection.find({"created_at": created_at_filter}).sort("created_at", -1)
    )
    return [s["session_id"] for s in candidates if s.get("session_id")]


def fetch_session_context(session_ids: list[str], max_sessions: int = 5) -> str:
    """Build LLM context from Mongo session summaries/titles/tags."""
    if not session_ids:
        return ""

    docs = list(
        sessions_collection.find({"session_id": {"$in": session_ids[:max_sessions]}})
    )
    blocks = []
    for doc in docs:
        sid = doc.get("session_id", "")
        title = doc.get("title") or "Untitled"
        created = doc.get("created_at", "")
        tags = ", ".join(doc.get("tags") or []) or "none"
        summary = (doc.get("summary") or "").strip()
        if summary == "No summary generated yet":
            summary = ""
        block = f"### Session {sid}\nTitle: {title}\nRecorded: {created}\nTags: {tags}"
        if summary:
            block += f"\nSummary:\n{summary[:4000]}"
        blocks.append(block)

    return "\n\n".join(blocks)


def fetch_recent_session_context(max_sessions: int = 3) -> str:
    """Light catalog of newest sessions — helps broad semantic questions."""
    docs = list(
        sessions_collection.find().sort("created_at", -1).limit(max_sessions)
    )
    ids = [d["session_id"] for d in docs if d.get("session_id")]
    return fetch_session_context(ids, max_sessions=max_sessions)


def _iso_to_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
