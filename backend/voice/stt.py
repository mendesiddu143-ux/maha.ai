import os
import base64
import requests

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "")

def transcribe_audio(audio_b64: str) -> dict:
    try:
        audio_bytes = base64.b64decode(audio_b64)

        headers = {
            "Authorization": f"Token {DEEPGRAM_API_KEY}",
            "Content-Type": "audio/webm",
        }

        params = {
            "model": "nova-2",
            "detect_language": "true",
            "smart_format": "true",
            "punctuate": "true",
        }

        response = requests.post(
            "https://api.deepgram.com/v1/listen",
            headers=headers,
            params=params,
            data=audio_bytes,
            timeout=30
        )

        if response.status_code != 200:
            print(f"[STT Error] Status: {response.status_code}, {response.text}")
            return {"transcript": "", "language": "en"}

        result = response.json()
        channel = result["results"]["channels"][0]
        alt = channel["alternatives"][0]
        detected = channel.get("detected_language", "en") or "en"

        return {
            "transcript": alt["transcript"],
            "confidence": alt.get("confidence", 0),
            "language": detected
        }

    except Exception as e:
        print(f"[STT Error] {e}")
        return {"transcript": "", "language": "en", "confidence": 0}