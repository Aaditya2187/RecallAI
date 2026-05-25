from audio.audio_chunker import chunk_audio
from audio.stt import transcribe_audio
from audio.diarization import diarize_audio
from audio.align import assign_speakers
from embeddings.embedder import embed_text
from vector_db.chroma_client import add_segment
import json
from datetime import datetime, timezone
import uuid
from app.sessions.repository import create_session
from app.sessions.enricher import enrich_session


def ingest_audio_file(audio_path: str) -> dict:
    """
    Orchestrates the full audio ingestion pipeline.
    Returns session_id and enriched title for the API/frontend.
    """

    chunks_dir = "./data/chunksdir"

    audio_chunks = chunk_audio(
        audio_path=audio_path,
        output_dir=chunks_dir,
        chunk_ms=30_000,
        overlap_ms=5_000
    )
    all_segments=[]
    session_id = str(uuid.uuid4())
    default_title = f"Meeting – {datetime.now():%d %b %Y – %H:%M}"

    for chunk in audio_chunks:
        chunk_path = chunk["path"]
        audio_chunk_id = chunk["chunk_id"]
        offset_sec = chunk["start_ms"] / 1000

        # STT
        stt_result = transcribe_audio(chunk_path)
        text_segments = stt_result["segments"]
        print(text_segments)

        # Diarization
        speaker_segments = diarize_audio(chunk_path)


        # Rebase timestamps
        for seg in text_segments:
            seg["start"] += offset_sec
            seg["end"] += offset_sec

        for sp in speaker_segments:
            sp["start"] += offset_sec
            sp["end"] += offset_sec

        # Align speakers
        aligned_segments = assign_speakers(
            text_segments,
            speaker_segments
        )
        print("3️⃣ Aligned segments:", aligned_segments)
        ingestion_timestamp = datetime.now(timezone.utc).timestamp()



        # Attach chunk_id + embed + store
        for seg in aligned_segments:
            seg["audio_chunk_id"] = audio_chunk_id

            text = seg["text"].strip()
            if not text:
                continue

            embedding = embed_text(text)
            all_segments.append(text)
            


            add_segment(
                audio_chunk_id=audio_chunk_id,
                segment_start=seg["start"],
                embedding=embedding,
                document=text,
                metadata={
                    "session_id":session_id,
                    "audio_id": audio_path,
                    "speaker": seg["speaker"] or "UNKNOWN",
                    "start": seg["start"],
                    "end": seg["end"],
                    "timestamp": ingestion_timestamp
                }
            
            )
        with open("output.json", "w", encoding="utf-8") as f:
             json.dump(all_segments, f, indent=2)
    create_session(
    session_id=session_id,
    title=default_title,
    session_type="unknown",      # updated later
    tags=[],
    source_file=audio_path,
    auto_named=True)
    enrich_session(session_id, all_segments)

    from app.db.mongo import sessions_collection

    doc = sessions_collection.find_one({"session_id": session_id}) or {}
    return {
        "session_id": session_id,
        "title": doc.get("title") or default_title,
        "tags": doc.get("tags") or [],
        "session_type": doc.get("session_type"),
    }

