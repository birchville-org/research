#!/usr/bin/env python3
"""
translate_report.py - Automatische Übersetzung von Monatsberichten ins Englische und Hindi
Nutzt die Gemini API (via Standardbibliothek urllib, keine externen Abhängigkeiten).
"""

import sys
import os
import json
import re
import urllib.request
import urllib.error

API_KEY = os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-2.5-flash"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

PROMPT_EN = """You are a specialized scientific translator in the fields of archaeogenetics, Indology, and historical linguistics.
Translate the following German monthly research report into English for the Birchville Blog.

CRITICAL RULES:
1. Maintain exact YAML frontmatter structure. Translate title, description, period, and highlights. Keep series as "OIT vs AMT". Keep sourcesCount unchanged.
2. In the body:
   - "## 1. Evidenz-Matrix des Monats" -> "## 1. Disciplinary Evidence Matrix"
   - "## 2. Kernbefunde im Detail" or "## 2. Detaillierte Analyse der Kernpublikationen" -> "## 2. Synthesis & Key Findings"
   - "## Ausgewertete Quellen & Bibliographie" -> "## Evaluated Sources & Bibliography"
   - Keep markdown custom containers like ::: note-box [Executive Summary] and ::: grammar-box intact.
   - Maintain all links, DOIs, and citations verbatim.
3. Return ONLY the complete valid Markdown document, without any enclosing markdown code fences.
"""

PROMPT_HI = """You are a scholarly translator specializing in ancient Indian history, Indology, Sanskrit philology, and archaeogenetics.
Translate the following German monthly research report into formal, academic Hindi (in Devanagari script) for the Birchville Blog.

CRITICAL RULES:
1. Maintain exact YAML frontmatter structure.
   - title: Translate into Hindi (e.g., 'OIT बनाम AMT: मासिक रिपोर्ट [माह वर्ष]')
   - date: Keep unchanged
   - series: Keep 'OIT vs AMT'
   - period: Translate into Hindi (e.g., 'अक्टूबर 2026')
   - description: Translate into formal Hindi
   - tags: Keep English technical tags or transcribe accurately
   - sourcesCount: Keep unchanged
   - highlights: Translate each highlight bullet point into clear academic Hindi
2. In the body:
   - "## 1. Evidenz-Matrix des Monats" -> "## 1. विषयवार साक्ष्य-मैट्रिक्स (Evidence Matrix)"
   - "## 2. Kernbefunde im Detail" -> "## 2. प्रमुख निष्कर्ष एवं संश्लेषण"
   - "## Ausgewertete Quellen & Bibliographie" -> "## मूल्यांकित स्रोत एवं संदर्भ"
   - Keep markdown custom containers like ::: note-box [कार्यकारी सारांश (Executive Summary)] and ::: grammar-box intact.
   - Keep all citations, journal names, and URLs verbatim.
3. Return ONLY the complete valid Markdown document, without any enclosing markdown code fences.
"""

def call_gemini(system_prompt: str, content: str) -> str:
    if not API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"{system_prompt}\n\nDOCUMENT TO TRANSLATE:\n\n{content}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
        }
    }

    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        candidate = result["candidates"][0]["content"]["parts"][0]["text"]
        # Strip potential markdown fences if model outputs them
        clean_text = candidate.strip()
        if clean_text.startswith("```markdown"):
            clean_text = clean_text[len("```markdown"):].strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text[len("```"):].strip()
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3].strip()
        return clean_text

def main():
    if len(sys.argv) < 2:
        print("Usage: translate_report.py <path_to_german_report.md>")
        sys.exit(1)

    de_path = sys.argv[1]
    if not os.path.exists(de_path):
        print(f"Error: File not found: {de_path}")
        sys.exit(1)

    base_name = os.path.basename(de_path)
    en_path = os.path.join("docs", "en", "posts", base_name)
    hi_path = os.path.join("docs", "hi", "posts", base_name)

    os.makedirs(os.path.dirname(en_path), exist_ok=True)
    os.makedirs(os.path.dirname(hi_path), exist_ok=True)

    with open(de_path, "r", encoding="utf-8") as f:
        de_content = f.read()

    print(f"Translating {de_path} to English ({en_path})...")
    en_text = call_gemini(PROMPT_EN, de_content)
    with open(en_path, "w", encoding="utf-8") as f:
        f.write(en_text + "\n")
    print(f"✓ English translation written to {en_path}")

    print(f"Translating {de_path} to Hindi ({hi_path})...")
    hi_text = call_gemini(PROMPT_HI, de_content)
    with open(hi_path, "w", encoding="utf-8") as f:
        f.write(hi_text + "\n")
    print(f"✓ Hindi translation written to {hi_path}")

if __name__ == "__main__":
    main()
