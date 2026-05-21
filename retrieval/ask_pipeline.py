"""
Semantic-first retrieval for POST /ask.

Primary signal: vector similarity on the full user query (always).
Optional narrowing: explicit calendar time phrases only (yesterday, last week, …).
Tags and auto-extracted keywords are never used as hard filters — they only appear
in session summaries passed to the LLM as soft context.
"""
from __future__ import annotations

import logging

from app.sessions.resolver import (
    fetch_recent_session_context,
    fetch_session_context,
    resolve_sessions_by_time,
)
from retrieval.query_constraints import parse_query_constraints
from retrieval.search import semantic_search

logger = logging.getLogger(__name__)

MIN_RETRIEVAL_K = 24
MAX_RETRIEVAL_K = 48


def _segment_key(meta: dict, doc: str) -> tuple:
    return (
        meta.get("session_id"),
        meta.get("start"),
        (doc or "")[:80],
    )


def _extract_hits(results: dict) -> list[tuple[str, dict, float | None]]:
    documents = results.get("documents") or [[]]
    metadatas = results.get("metadatas") or [[]]
    distances = results.get("distances") or [[]]

    docs = list(documents[0]) if documents else []
    metas = list(metadatas[0]) if metadatas else []
    dists = list(distances[0]) if distances else [None] * len(docs)

    while len(dists) < len(docs):
        dists.append(None)

    return list(zip(docs, metas, dists[: len(docs)]))


def _merge_hits(
    *hit_lists: list[list[tuple[str, dict, float | None]]],
    limit: int,
) -> tuple[list[str], list[dict], list[float | None]]:
    """Merge multiple retrieval passes; lower distance = better match."""
    seen: set[tuple] = set()
    merged: list[tuple[str, dict, float | None]] = []

    for hits in hit_lists:
        for doc, meta, dist in hits:
            key = _segment_key(meta, doc)
            if key in seen:
                continue
            seen.add(key)
            merged.append((doc, meta, dist))

    merged.sort(key=lambda row: row[2] if row[2] is not None else 1e9)
    merged = merged[:limit]

    if not merged:
        return [], [], []

    docs, metas, dists = zip(*merged)
    return list(docs), list(metas), list(dists)


def retrieve_for_ask(query: str, top_k: int = 5) -> dict:
    k = max(MIN_RETRIEVAL_K, min(top_k * 5, MAX_RETRIEVAL_K))
    constraints = parse_query_constraints(query)

    # 1) Always: full semantic search over all ingested segments (no tag/keyword gate).
    semantic_global = _extract_hits(
        semantic_search(query, k=k, session_ids=None, time_filter=None)
    )
    mode = "semantic_global"

    extra_lists: list[list[tuple[str, dict, float | None]]] = [semantic_global]

    # 2) Optional: if user named a time period, add time-scoped semantic results and merge.
    if constraints.has_explicit_time:
        time_on_segments = _extract_hits(
            semantic_search(
                query,
                k=k,
                session_ids=None,
                time_filter=constraints.time_filter,
            )
        )
        if time_on_segments:
            extra_lists.insert(0, time_on_segments)  # prefer time-aligned hits when merging
            mode = "semantic_global+time"

        # Soft hint: sessions in Mongo for that period (still ranked by embedding distance)
        time_session_ids = resolve_sessions_by_time(constraints)
        if time_session_ids:
            time_sessions = _extract_hits(
                semantic_search(
                    query,
                    k=k,
                    session_ids=time_session_ids,
                    time_filter=None,
                )
            )
            if time_sessions:
                extra_lists.insert(0, time_sessions)
                mode = "semantic_global+time+sessions"

    docs, metas, dists = _merge_hits(*extra_lists, limit=top_k)

    session_ids_for_context = list(
        dict.fromkeys(
            m.get("session_id") for m in metas if m and m.get("session_id")
        )
    )
    session_context = fetch_session_context(session_ids_for_context)
    if not session_context.strip():
        session_context = fetch_recent_session_context()

    logger.info(
        "ask retrieval mode=%s chunks=%d explicit_time=%s",
        mode,
        len(docs),
        constraints.has_explicit_time,
    )

    return {
        "documents": docs,
        "metadatas": metas,
        "distances": list(dists),
        "session_context": session_context,
        "retrieval_mode": mode,
        "constraints": {
            "has_time": constraints.has_explicit_time,
            "structural_filters": "time_only_if_explicit",
        },
    }
