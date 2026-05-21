import os
import google.generativeai as genai

# Current Gemini API embedding model (legacy embedding-001 / text-embedding-004 return 404).
# List with: genai.list_models() — look for embedContent on models/gemini-embedding-001.
EMBEDDING_MODEL = "models/gemini-embedding-001"

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))


def embed_text(text: str, *, for_query: bool = False) -> list[float]:
    """
    Convert text into a vector embedding via the Gemini API.

    for_query is reserved for asymmetric retrieval tuning; gemini-embedding-001 does not
    use the legacy embedding-001 task_type API.

    After changing EMBEDDING_MODEL, delete ./chroma_db and re-ingest (vector size changes).
    """
    _ = for_query  # same model/path for ingest and search unless you add MRL dims later

    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
    )

    return result["embedding"]
