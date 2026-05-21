import chromadb
from chromadb.config import Settings

# Initialize persistent Chroma client
client = chromadb.Client(
    Settings(
        persist_directory="./chroma_db", is_persistent=True 
    )
)
from pathlib import Path

CHROMA_DIR = Path("C:/Users/Hitesh/Documents/pipeline/chroma_db")
CHROMA_DIR.mkdir(parents=True, exist_ok=True)


collection = client.get_or_create_collection(
    name="audio_memory"
)

def add_segment(
    *,
    audio_chunk_id: str,
    segment_start: float,
    embedding: list,
    document: str,
    metadata: dict
    
):
    """
    Store a single transcript segment embedding in Chroma.

    audio_chunk_id: UUID from audio_chunker (PRIMARY LINEAGE)
    segment_start: used to ensure vector ID uniqueness
    """

    # 🔑 Compound vector ID (required)
    vector_id = f"{audio_chunk_id}::{segment_start:.2f}"

    # 🔐 Enrich metadata with guaranteed fields
    enriched_metadata = {
        "audio_chunk_id": audio_chunk_id,
        **metadata
    }

    collection.add(
        ids=[vector_id],
        embeddings=[embedding],
        documents=[document],
        metadatas=[enriched_metadata]
    )
    
import os
from pathlib import Path

print("PYTHON EXECUTABLE:", os.sys.executable)
print("CURRENT WORKING DIRECTORY:", os.getcwd())

CHROMA_DIR = Path("./chroma_db").resolve()
print("CHROMA DB RESOLVED PATH:", CHROMA_DIR)


