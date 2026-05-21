from pyannote.audio import Pipeline
import torchaudio
import os

HF_TOKEN = os.getenv("HF_TOKEN")

pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization",
    use_auth_token=HF_TOKEN
)

def load_audio(path):
    waveform, sample_rate = torchaudio.load(path)
    return {
        "waveform": waveform,
        "sample_rate": sample_rate,
    }

def diarize_audio(audio_path):
    audio = load_audio(audio_path)
    diarization = pipeline(audio)

    return [
        {
            "start": float(turn.start),
            "end": float(turn.end),
            "speaker": speaker
        }
        for turn, _, speaker in diarization.itertracks(yield_label=True)
    ]
