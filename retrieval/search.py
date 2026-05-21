from embeddings.embedder import embed_text
from vector_db.chroma_client import collection


def semantic_search(
    query: str,
    k: int = 50,
    session_ids: list[str] | None = None,
    time_filter: dict | None = None,
):
    """
    Semantic search over Chroma with optional session and ingestion-time filters.

    time_filter: Chroma where fragment, e.g. {"timestamp": {"$gte": "...", "$lt": "..."}}.
    If None, temporal phrases in the query are still parsed unless caller passes
    time_filter=False explicitly via apply in ask_pipeline.
    """
    query_embedding = embed_text(query, for_query=True)

    filters: list[dict] = []

    if time_filter:
        filters.append(time_filter)

    if session_ids:
        filters.append({"session_id": {"$in": session_ids}})

    where_clause = None
    if len(filters) == 1:
        where_clause = filters[0]
    elif len(filters) > 1:
        where_clause = {"$and": filters}

    if where_clause:
        return collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            where=where_clause,
            include=["documents", "metadatas", "distances"],
        )

    return collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        include=["documents", "metadatas", "distances"],
    )
