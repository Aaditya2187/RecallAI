from fastapi import FastAPI, UploadFile, Form, HTTPException
import os
import shutil

from app.sessions.api import router as sessions_router
from fastapi.middleware.cors import CORSMiddleware

from audio.print import ingest_audio_file
from retrieval.ask_pipeline import retrieve_for_ask
from app.llm.generator import generate_answer

app = FastAPI()

# CORS middleware - must be added BEFORE other middleware/routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server (your frontend)
        "http://localhost:3000",  # Alternative dev port
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(sessions_router)

AUDIO_UPLOAD_DIR = "./data/audio"
os.makedirs(AUDIO_UPLOAD_DIR, exist_ok=True)

# Test MongoDB connection on startup
try:
    from app.db.mongo import sessions_collection
    sessions_collection.database.command('ping')
    print("✅ MongoDB connection successful")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    print("Make sure MongoDB is running on mongodb://localhost:27017")


@app.post("/ingest_audio")
def ingest_audio(file: UploadFile):
    """
    Upload audio and ingest it into memory.
    """
    audio_path = os.path.join(AUDIO_UPLOAD_DIR, file.filename)

    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = ingest_audio_file(audio_path)

    return {
        "status": "success",
        "file": file.filename,
        "session_id": result["session_id"],
        "title": result.get("title"),
        "tags": result.get("tags", []),
    }


@app.post("/ask")
def ask(
    query: str = Form(...),
    top_k: int = Form(5)
):
    """
    Ask a question over stored audio memory.
    """

    retrieval = retrieve_for_ask(query, top_k=top_k)

    answer = generate_answer(
        query=query,
        documents=retrieval["documents"],
        metadatas=retrieval["metadatas"],
        session_context=retrieval.get("session_context") or "",
    )

    sources = _format_ask_sources(
        retrieval["documents"],
        retrieval["metadatas"],
    )

    return {
        "query": query,
        "answer": answer,
        "sources": sources,
        "retrieval_mode": retrieval.get("retrieval_mode"),
    }


def _format_ask_sources(documents: list, metadatas: list) -> list[dict]:
    """Attach human-readable memory titles and excerpt text for the UI."""
    from app.db.mongo import sessions_collection

    title_cache: dict[str, str] = {}
    sources = []

    for doc, meta in zip(documents, metadatas):
        meta = meta or {}
        sid = meta.get("session_id")
        title = None
        if sid:
            if sid in title_cache:
                title = title_cache[sid]
            else:
                row = sessions_collection.find_one(
                    {"session_id": sid},
                    {"title": 1, "audio_filename": 1},
                )
                if row:
                    title = row.get("title") or row.get("audio_filename")
                title_cache[sid] = title or "Untitled memory"

        sources.append({
            **meta,
            "session_id": sid,
            "session_title": title or "Untitled memory",
            "chunk_text": doc,
        })

    return sources
