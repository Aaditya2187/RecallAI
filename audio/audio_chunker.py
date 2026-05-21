from pydub import AudioSegment
import os
import uuid

def chunk_audio(audio_path, output_dir, chunk_ms=10_000, overlap_ms=2_000):
    os.makedirs(output_dir, exist_ok=True)

    audio = AudioSegment.from_file(audio_path)
    duration_ms = len(audio)

    chunks = []
    start = 0

    while start < duration_ms:
        end = min(start + chunk_ms, duration_ms)
        chunk = audio[start:end]

        audio_chunk_id = str(uuid.uuid4())  # ✅ UUID-based chunk ID

        chunk_filename = f"{audio_chunk_id}.wav"
        chunk_path = os.path.join(output_dir, chunk_filename)

        chunk.export(chunk_path, format="wav")

        chunks.append({
            "chunk_id": audio_chunk_id,   # 👈 AUDIO-LEVEL ID
            "path": chunk_path,
            "start_ms": start,
            "end_ms": end
        })

        start += chunk_ms - overlap_ms

    return chunks
