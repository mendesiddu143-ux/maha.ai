from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os

import requests
import base64

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

def sarvam_tts(text, lang="hi"):
    if not SARVAM_API_KEY:
        return None
    lang_map = {
        "hi":"hi-IN","te":"te-IN","ta":"ta-IN","ml":"ml-IN",
        "kn":"kn-IN","mr":"mr-IN","bn":"bn-IN","gu":"gu-IN",
        "pa":"pa-IN","en":"en-IN"
    }
    speaker_map = {
    "hi-IN":"abhilash","te-IN":"abhilash","ta-IN":"abhilash",
    "ml-IN":"abhilash","kn-IN":"abhilash","mr-IN":"abhilash",
    "bn-IN":"abhilash","gu-IN":"abhilash","pa-IN":"abhilash","en-IN":"abhilash"
}
    sarvam_lang = lang_map.get(lang[:2], "hi-IN")
    try:
        resp = requests.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
            json={
                "inputs": [text],
                "target_language_code": sarvam_lang,
                "speaker": speaker_map.get(sarvam_lang, "meera"),
                "pitch": 0, "pace": 1.1, "loudness": 1.5,
                "speech_sample_rate": 22050,
                "enable_preprocessing": True,
                "model": "bulbul:v2"
            },
            timeout=15
        )
        if resp.status_code == 200:
            audio = resp.json().get("audios", [None])[0]
            print(f"[TTS] Sarvam OK - {sarvam_lang}")
            return audio
        else:
            print(f"[TTS] Error {resp.status_code}: {resp.text[:100]}")
            return None
    except Exception as e:
        print(f"[TTS] Exception: {e}")
        return None
from voice.stt import transcribe_audio
from voice.llm import generate_response, generate_response_simple, generate_voice_response

app = Flask(__name__, static_folder="templates", static_url_path="")
CORS(app, cors_allowed_origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet", engineio_logger=False, logger=False)
sessions = {}
@app.route("/")
def home():
    return jsonify({"status": "Maha.ai API running!"})

@app.route("/health")
def health():
    return jsonify({"status": "Maha.ai running!"})

@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    data = request.json
    user_message = data.get("message", "")
    language = data.get("language", "English")
    user_name = data.get("userName", "friend")
    reply = generate_response_simple(user_message, language, user_name)
    return jsonify({"reply": reply})

@socketio.on("connect")
def handle_connect(auth=None):
    sid = request.sid
    sessions[sid] = {"history": [], "language": "en"}
    emit("connected", {"message": "Connected to Maha.ai!"})
    print(f"[+] Connected: {sid}")

@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    sessions.pop(sid, None)
    print(f"[-] Disconnected: {sid}")

@socketio.on("voice_input")
def handle_voice_input(data):
    sid = request.sid
    audio_b64 = data.get("audio", "")
    if not audio_b64:
        emit("error", {"message": "No audio received"})
        return
    emit("status", {"state": "listening", "message": "Listening..."})
    stt_result = transcribe_audio(audio_b64)
    transcript = stt_result.get("transcript", "").strip()
    detected_lang = stt_result.get("language", "en")
    if not transcript:
        emit("status", {"state": "idle", "message": "Could not hear you. Try again!"})
        return
    sessions[sid]["language"] = detected_lang
    emit("transcript", {"text": transcript, "language": detected_lang})
    print(f"[Transcript] {transcript} [{detected_lang}]")
    emit("status", {"state": "thinking", "message": "Thinking..."})
    history = sessions[sid]["history"]
    response_text = generate_response(transcript, detected_lang, history)
    sessions[sid]["history"].append({"role": "user", "content": transcript})
    sessions[sid]["history"].append({"role": "assistant", "content": response_text})
    sessions[sid]["history"] = sessions[sid]["history"][-20:]
    emit("ai_text", {"text": response_text})
    print(f"[AI] {response_text}")
    emit("voice_output", {"audio": None, "text": response_text})
    emit("status", {"state": "idle", "message": "Ready"})

@socketio.on("clear_history")
def handle_clear():
    sid = request.sid
    if sid in sessions:
        sessions[sid]["history"] = []
    emit("history_cleared", {"message": "Cleared!"})

@socketio.on("start_call")
def handle_start_call(data):
    sid = request.sid
    user_name = data.get("userName", "Friend")
    sessions[sid]["history"] = []
    emit("status", {"state": "thinking", "message": "Connecting..."})
    from voice.llm import generate_voice_response
    greeting = generate_voice_response("greeting", user_name, [])
    sessions[sid]["history"].append({"role": "assistant", "content": greeting})
    
    audio = sarvam_tts(greeting, sessions[sid].get("language", "hi"))
    emit("ai_response", {"text": greeting, "audio": audio})
    print(f"[Greeting] {greeting}")

@socketio.on("voice_message")
def handle_voice_message(data):
    sid = request.sid
    text = data.get("text", "").strip()
    lang = data.get("lang", "en")
    if not text:
        return
    print(f"[User said] {text}")
    emit("status", {"state": "thinking", "message": "Thinking..."})
    from voice.llm import generate_voice_response
    history = sessions[sid].get("history", [])
    response = generate_voice_response(text, "", history)
    sessions[sid]["history"].append({"role": "user", "content": text})
    sessions[sid]["history"].append({"role": "assistant", "content": response})
    sessions[sid]["history"] = sessions[sid]["history"][-20:]
   
    audio = sarvam_tts(response, lang)
    emit("ai_response", {"text": response, "audio": audio})
    print(f"[Maha] {response}")
if __name__ == "__main__":
   socketio.run(app, debug=False, port=5000, use_reloader=False, allow_unsafe_werkzeug=True)