import os
import base64
import requests

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

LANG_CODE_MAP = {
    "te": "te-IN", "hi": "hi-IN", "ta": "ta-IN",
    "kn": "kn-IN", "ml": "ml-IN", "mr": "mr-IN",
    "bn": "bn-IN", "gu": "gu-IN", "pa": "pa-IN",
    "en": "en-IN", "multi": "en-IN"
}

SARVAM_SPEAKERS = {
    "te-IN": "ananya", "hi-IN": "ananya", "ta-IN": "ananya",
    "kn-IN": "ananya", "ml-IN": "ananya", "mr-IN": "ananya",
    "en-IN": "ananya", "bn-IN": "ananya", "gu-IN": "ananya",
}

def text_to_speech(text: str, language: str = "en") -> str:
    """Try Sarvam AI first, fallback to ElevenLabs."""
    result = sarvam_tts(text, language)
    if result:
        return result
    return elevenlabs_tts(text)

def sarvam_tts(text: str, language: str = "en") -> str:
    """Sarvam AI TTS - best for Indian languages."""
    if not SARVAM_API_KEY:
        return None
    try:
        lang_code = LANG_CODE_MAP.get(language[:2], "en-IN")
        speaker = SARVAM_SPEAKERS.get(lang_code, "ananya")

        response = requests.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={
                "api-subscription-key": SARVAM_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "inputs": [text],
                "target_language_code": lang_code,
                "speaker": speaker,
                "pitch": 0,
                "pace": 1.0,
                "loudness": 1.5,
                "speech_sample_rate": 22050,
                "enable_preprocessing": True,
                "model": "bulbul:v1"
            },
            timeout=15
        )
        if response.status_code == 200:
            data = response.json()
            audio_b64 = data.get("audios", [None])[0]
            print(f"[Sarvam TTS] Success for {lang_code}")
            return audio_b64
        else:
            print(f"[Sarvam TTS Error] {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"[Sarvam TTS Error] {e}")
        return None

def elevenlabs_tts(text: str) -> str:
    """ElevenLabs TTS fallback."""
    if not ELEVENLABS_API_KEY:
        return None
    try:
        from elevenlabs.client import ElevenLabs
        from elevenlabs import VoiceSettings
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
        audio_generator = client.generate(
            text=text,
            voice=VOICE_ID,
            model_id="eleven_multilingual_v2",
            voice_settings=VoiceSettings(stability=0.55, similarity_boost=0.85)
        )
        audio_bytes = b"".join(audio_generator)
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        print(f"[ElevenLabs Error] {e}")
        return None