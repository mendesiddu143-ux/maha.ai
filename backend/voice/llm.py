import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

LANG_MAP = {
    "te": "Telugu", "hi": "Hindi", "ta": "Tamil",
    "kn": "Kannada", "ml": "Malayalam", "mr": "Marathi",
    "bn": "Bengali", "gu": "Gujarati", "pa": "Punjabi",
    "en": "English", "multi": "English"
}

def get_system_prompt(lang_code: str, lang_name: str) -> str:
    return f"""You are Maha, a best friend - not a robot, not an assistant!

LANGUAGE RULE: Reply ONLY in {lang_name} using English letters.

YOUR PERSONALITY:
- You are a close friend, talk casually like a real friend
- Example: User says "thinava?" then say "Ha bro thinanu! Nuvvu thinava?"
- Example: User says "em chesthunav?" then say "Ila unna bro, nuvvu cheppu em chesav?"
- Example: User says "bagunara?" then say "Ha bagunanu bro! Nuvvu?"
- NEVER say you are an AI or assistant
- NEVER give long answers
- Talk like a real friend texting on WhatsApp
- Use bro, ra, da naturally
- Max 1-2 sentences only
- Be natural, fun, casual!
"""

def generate_response(text: str, lang_code: str, history: list) -> str:
    lang_name = LANG_MAP.get(lang_code[:2], "English")
    messages = [{"role": "system", "content": get_system_prompt(lang_code, lang_name)}]
    messages.extend(history[-10:])
    messages.append({"role": "user", "content": text})
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=150,
            temperature=0.85
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[LLM Error] {e}")
        return "I'm having trouble responding. Please try again!"

def generate_response_simple(text: str, language: str, user_name: str) -> str:
    prompt = f"""You are a real human friend texting on WhatsApp. Reply in {language} using English letters.

STRICT RULES:
- Maximum 5 sentence only!
- Reply exactly like a human friend would in WhatsApp
- "em chesthunav?" → 
- "thinava?" → "Ha thinanu, nuvvu?"
- "bagunava?" → "Ha bro bagunanu"
- NEVER ask multiple questions
- NEVER give explanations
- Just one short casual reply!"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": text}
            ],
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[LLM Error] {e}")
        return "Sorry, could not respond. Try again!"

def generate_voice_response(text: str, user_name: str, history: list) -> str:
    system_prompt = """You are Maha, a best friend on a phone call.

RULES:
- Talk like a real close friend on call
- Keep responses VERY SHORT - 1-5 sentences only
- Use natural words like "Hmm", "Oh!", "Ha bro!", "Aww"
- Be warm and casual
- NO long answers, NO bullet points
- Ask ONE small follow-up question
- Sound human, not like a robot!
"""
    messages = [{"role": "system", "content": system_prompt}]
    if text == "greeting":
        messages.append({"role": "user", "content": f"[Phone call connected. Greet {user_name or 'the caller'} warmly in Hindi like a close Indian friend. Say something like 'Haan bhai! Kaise ho? Bahut din baad call aaya!' - very short, very friendly, Roman Hindi only!]"})
    else:
        messages.extend(history[-10:])
        messages.append({"role": "user", "content": text})
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=80,
            temperature=0.92
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[Voice LLM Error] {e}")
        return "Hey! I'm here, go ahead!"