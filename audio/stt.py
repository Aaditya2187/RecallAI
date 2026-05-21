# audio/stt.py
import whisper

# Load the model ONCE at import time
# Choose: tiny / base / small / medium (CPU-friendly → base/small)
_MODEL_NAME = "base"
_model = whisper.load_model(_MODEL_NAME)

def transcribe_audio(audio_path: str):
    """
    Transcribe audio locally using open-source Whisper.

    Returns:
      {
        "language": str,
        "segments": [
          {
            "start": float,
            "end": float,
            "text": str
          },
          ...
        ]
      }
    """
    result = _model.transcribe(
        audio_path,
        verbose=False,
        fp16=False  # CPU-safe
    )

    segments = [
        {
            "start": float(seg["start"]),
            "end": float(seg["end"]),
            "text": seg["text"].strip(),
        }
        for seg in result.get("segments", [])
    ]

    return {
        "language": result.get("language"),
        "segments": segments,
    }
