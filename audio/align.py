def overlap(a_start, a_end, b_start, b_end):
    return max(0.0, min(a_end, b_end) - max(a_start, b_start))


def assign_speakers(text_segments, speaker_segments):
    """
    Align text segments with speaker segments using maximum time overlap.
    """
    aligned = []

    for seg in text_segments:
        best_speaker = "UNKNOWN"
        best_overlap = 0.0

        for sp in speaker_segments:
            o = overlap(
                seg["start"], seg["end"],
                sp["start"], sp["end"]
            )
            if o > best_overlap:
                best_overlap = o
                best_speaker = sp["speaker"]

        aligned.append({
            "start": seg["start"],
            "end": seg["end"],
            "speaker": best_speaker,
            "text": seg["text"]
        })

    return aligned
