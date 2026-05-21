import whisper
from typing import Dict, List

# Load model ONCE at startup (important for performance)
# Options: "tiny", "base", "small", "medium", "large"
model = whisper.load_model("base")


def transcribe_audio(audio_path: str) -> Dict:
    """
    Transcribes audio using local Whisper and returns
    text + structured segments with timestamps.
    """

    # Run transcription
    result = model.transcribe(audio_path)

    # Extract structured segments
    segments: List[Dict] = []
    for seg in result["segments"]:
        segments.append({
            "start": float(seg["start"]),
            "end": float(seg["end"]),
            "text": seg["text"].strip()
        })

    return {
        "text": result["text"].strip(),
        "segments": segments
    }
