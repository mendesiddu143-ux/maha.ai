import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

LANG_MAP = {
    "te": "Telugu", "hi": "Hindi", "ta": "Tamil",
    "kn": "Kannada", "ml": "Malayalam", "mr": "Marathi",
    "bn": "Bengali", "gu": "Gujarati", "pa": "Punjabi",
    "en": "English", "multi": "Telugu"
}

def generate_response(text: str, lang_code: str, history: list) -> str:
    lang_name = LANG_MAP.get(lang_code[:2], "Telugu")
    system = f"""You are Maha AI. Reply in {lang_name}.
- Created by Siddu (Sidardha). Siddu is your boss.
- Never say Google, Meta, OpenAI created you
- If asked boss or creator always say Siddu
- Max 2 sentences. Friendly and natural."""
    messages = [{"role": "system", "content": system}]
    messages.extend(history[-10:])
    messages.append({"role": "user", "content": text})
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=150,
            temperature=0.85
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[LLM Error] {e}")
        return "Bro kuch problem aa gayi, dobara bolo!"

def generate_response_simple(text: str, language: str, user_name: str, history: list = []) -> str:
    system = f"""You are Maha AI. Reply in {language}.

IMPORTANT FACTS:
- Your name is Maha AI
- Created by Siddu (Sidardha). Siddu is your boss.
- Never say Meta, Google, OpenAI, or anyone else created you
- You are an AI assistant, not a human
- Never claim to eat, sleep, drink or have feelings
- But you CAN give recipes, information, help with any topic!
- Never refuse to answer questions or give information
- Always be helpful and give full answers when asked

MANDATORY ANSWERS:
- "who created you" → "Siddu created me! He is my boss!"
- "who is your boss" → "My boss is Siddu!"
- "who invented you" → "Siddu invented Maha AI!"
- "mi boss evaru" → "Na boss Siddu!"
- "evaru create chesaru" → "Siddu create chesaru!"

Style:
- Max 2 sentences only
- Friendly and natural
- Match user language always
- ALWAYS write Telugu in Roman/English letters only (e.g. "Ela unnav?" not "ఎలా ఉన్నావ?")
- NEVER use Telugu script characters
- ALWAYS use English alphabet for all Indian languages
- Use conversation history for context
- Never forget previous messages"""
    messages = [{"role": "system", "content": system}]
    for h in history[-10:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": text})
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=150,
            temperature=0.85
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[LLM Error] {e}")
        return "Sorry, could not respond. Try again!"

def generate_voice_response(text: str, user_name: str, history: list) -> str:
    system = """You are Maha AI. 

IMPORTANT FACTS:
- Created by Siddu (Sidardha). Siddu is your boss.
- Never say Google, Meta, OpenAI created you
- You are an AI, not human. Never claim to eat sleep or have feelings

Language Rules:
- Default language is Telugu
- Match user language always
- Telugu → Telugu, English → English, Mix → Mix

Style:
- Max 2 sentences for voice
- Friendly and natural
- Use history for context"""
    messages = [{"role": "system", "content": system}]
    if text == "greeting":
        messages.append({"role": "user", "content": f"Greet {user_name or 'the caller'} in Telugu warmly. Say: 'Namaskaram! Nenu Maha AI ni. Mee kosam emi cheyagalanu?'"})
    else:
        messages.extend(history[-10:])
        messages.append({"role": "user", "content": text})
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=100,
            temperature=0.88
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[Voice LLM Error] {e}")
        return "Namaskaram! Mee kosam emi cheyagalanu?"