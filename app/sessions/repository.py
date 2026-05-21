import os
from datetime import datetime, timezone
from app.db.mongo import sessions_collection

def create_session(
    session_id: str,
    title: str,
    session_type: str,
    tags: list[str],
    source_file: str,
    auto_named: bool = True
):
    """
    Create a new session entry in MongoDB.
    """

    doc = {
        "session_id": session_id,
        "title": title,
        "session_type": session_type,
        "tags": tags,
        "summary": "No summary generated yet",
        "source_file": source_file,
        "audio_filename": os.path.basename(source_file) if source_file else None,
        "created_at": datetime.now(timezone.utc),
        "auto_named": auto_named,
    }

    sessions_collection.insert_one(doc)

    return doc
