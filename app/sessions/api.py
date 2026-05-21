from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.db.mongo import sessions_collection
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["sessions"])


def serialize_session(doc: dict) -> dict:
    title = doc.get("title")
    audio_filename = doc.get("audio_filename") or doc.get("source_file")
    if audio_filename and "/" in str(audio_filename):
        import os
        audio_filename = os.path.basename(audio_filename)

    return {
        "id": doc.get("session_id") or str(doc["_id"]),
        "session_id": doc.get("session_id"),
        "created_at": doc.get("created_at"),
        "title": title,
        "display_title": title or _fallback_title(audio_filename, doc),
        "session_type": doc.get("session_type"),
        "tags": doc.get("tags") or [],
        "summary": doc.get("summary"),
        "audio_filename": audio_filename,
        "transcript": doc.get("transcript"),
        "metadata": doc.get("metadata", {}),
    }


def _fallback_title(audio_filename: str | None, doc: dict) -> str:
    if audio_filename:
        name = str(audio_filename)
        for ext in (".mp3", ".wav", ".m4a", ".mp4", ".webm"):
            if name.lower().endswith(ext):
                name = name[: -len(ext)]
        return name.replace("_", " ").replace("-", " ").strip() or "Untitled memory"
    sid = doc.get("session_id") or str(doc.get("_id", ""))
    return f"Memory · {sid[:8]}" if sid else "Untitled memory"


@router.get("")
def list_sessions():
    try:
        sessions_collection.database.command("ping")
        docs = list(sessions_collection.find().sort("created_at", -1))
        return [serialize_session(d) for d in docs]
    except Exception as e:
        logger.error(f"MongoDB error in list_sessions: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database connection error. Please ensure MongoDB is running.",
        )


@router.get("/{session_id}")
def get_session(session_id: str):
    try:
        doc = sessions_collection.find_one({"session_id": session_id})
        if not doc:
            try:
                oid = ObjectId(session_id)
                doc = sessions_collection.find_one({"_id": oid})
            except Exception:
                doc = None
        if not doc:
            raise HTTPException(status_code=404, detail="Session not found")

        return serialize_session(doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MongoDB error in get_session: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database connection error. Please ensure MongoDB is running.",
        )
