"""
Legacy copy — prefer ``embeddings.embedder`` (project import path).
Kept in sync for local experiments under ``data/``.
"""
import os
import google.generativeai as genai

EMBEDDING_MODEL = "models/gemini-embedding-001"

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))


def embed_text(text: str, *, for_query: bool = False) -> list[float]:
    _ = for_query
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
    )
    return result["embedding"]
