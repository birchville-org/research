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

PROMPT_EN = """You are a specialized scientific translator in the fields of South Asian archaeology, Indology, archaeogenetics, and historical linguistics.
Translate the following German monthly research report into English for the Birchville Blog.

CRITICAL RULES:
1. Translate the ENTIRE document from start to finish without summarizing, skipping, or abridging ANY section.
2. Frontmatter:
   - title: Translate title accurately into English (e.g., 'OIT vs AMT: Monthly Report [Period]' or 'IVC: Monthly Report [Period]').
   - date: Keep unchanged
   - series: Keep series value unchanged from frontmatter (e.g., "OIT vs AMT" or "IVC").
   - period: Translate into English (e.g., "October 2026")
   - description: Translate into English
   - tags: Keep technical tags intact or translate appropriately
   - sourcesCount: Keep unchanged
   - highlights: Translate each highlight bullet point into formal academic English
3. Top Navigation Button:
   Translate '<a href="#vollstandiger-monatsbericht" class="quick-btn quick-btn-primary" style="text-decoration: none;">\\n    <span>📄</span> Vollständigen Monatsbericht lesen ↓\\n  </a>'
   to '<a href="#full-monthly-report" class="quick-btn quick-btn-primary" style="text-decoration: none;">\\n    <span>📄</span> Read full monthly report ↓\\n  </a>'
4. Section Headings:
   - "## 1. Evidenz-Matrix des Monats" -> "## 1. Disciplinary Evidence Matrix"
   - "## 2. Kernbefunde im Detail" or "## 2. Detaillierte Analyse der Kernpublikationen" -> "## 2. Key Findings & Detailed Analysis"
   - "## 3. Zusammenfassung & Synthese" -> "## 3. Synthesis & Conclusions"
   - "## Vollständiger Monatsbericht" -> "## Full Monthly Report {#full-monthly-report}"
   - "::: details Vollständigen ungekürzten Monatsbericht anzeigen" -> "::: details Display full unabridged monthly report"
   - "## Ausgewertete Quellen & Bibliographie" or "Vollständige Bibliographie" -> "## Evaluated Sources & Bibliography"
5. Custom containers: Keep ::: note-box, ::: grammar-box, ::: details, and all attributes intact.
6. The full text inside ::: details MUST be translated completely into English in its entirety! Do not omit, truncate, or summarize it!
7. Keep all citations, links, and DOIs intact.
8. Return ONLY the complete valid Markdown document, without any enclosing markdown code block fences (no ```markdown at the start or ``` at the end).
"""

PROMPT_HI = """You are a scholarly translator specializing in ancient Indian history, South Asian archaeology, Indology, and archaeogenetics.
Translate the following German monthly research report into formal, academic Hindi (in Devanagari script) for the Birchville Blog.

CRITICAL RULES:
1. Translate the ENTIRE document from start to finish without summarizing, skipping, or abridging ANY section into scholarly, formal Hindi (Devanagari script).
2. Frontmatter:
   - title: Translate into Hindi (e.g., 'OIT बनाम AMT: मासिक रिपोर्ट [माह वर्ष]' or 'IVC: मासिक रिपोर्ट [माह वर्ष]')
   - date: Keep unchanged
   - series: Keep series value unchanged from frontmatter (e.g., "OIT vs AMT" or "IVC")
   - period: Translate into Hindi (e.g., 'जून 2026', 'जुलाई 2026', 'अगस्त 2026', 'सितंबर 2026', 'अक्टूबर 2026')
   - description: Translate into formal Hindi
   - tags: Keep English technical tags or transcribe accurately
   - sourcesCount: Keep unchanged
   - highlights: Translate each highlight bullet point into formal academic Hindi
3. Top Navigation Button:
   Translate '<a href="#vollstandiger-monatsbericht" class="quick-btn quick-btn-primary" style="text-decoration: none;">\\n    <span>📄</span> Vollständigen Monatsbericht lesen ↓\\n  </a>'
   to '<a href="#full-monthly-report" class="quick-btn quick-btn-primary" style="text-decoration: none;">\\n    <span>📄</span> संपूर्ण मासिक रिपोर्ट पढ़ें ↓\\n  </a>'
4. Section Headings:
   - "## 1. Evidenz-Matrix des Monats" -> "## 1. विषयवार साक्ष्य-मैट्रिक्स (Evidence Matrix)"
   - "## 2. Kernbefunde im Detail" -> "## 2. प्रमुख निष्कर्ष एवं विस्तृत विश्लेषण"
   - "## 3. Zusammenfassung & Synthese" -> "## 3. सारांश एवं निष्कर्ष"
   - "## Vollständiger Monatsbericht" -> "## संपूर्ण मासिक रिपोर्ट {#full-monthly-report}"
   - "::: details Vollständigen ungekürzten Monatsbericht anzeigen" -> "::: details संपूर्ण अबाधित मासिक रिपोर्ट देखें"
   - "## Ausgewertete Quellen & Bibliographie" -> "## मूल्यांकित स्रोत एवं संदर्भ"
5. Custom containers: Keep ::: note-box, ::: grammar-box, ::: details, and all attributes intact.
6. The full text inside ::: details MUST be translated completely into Hindi in its entirety! Do not omit, truncate, or summarize it!
7. Keep all citations, links, and DOIs intact.
8. Return ONLY the complete valid Markdown document, without any enclosing markdown code block fences (no ```markdown at the start or ``` at the end).
"""

PROMPT_SA = """You are a renowned scholarly translator specializing in ancient Indian history, Indology, Vedic studies, South Asian archaeology, and archaeogenetics.
Translate the following German monthly research report into formal, academic, modern scientific Sanskrit (Śāstrīya-Samskṛtam, in Devanagari script) for the Birchville Blog.

CRITICAL RULES:
1. Translate the ENTIRE document from start to finish without summarizing, skipping, or abridging ANY section into scholarly, grammatically correct Sanskrit (Devanagari script), following standard scientific terminology (e.g. CSTT / śāstrīya-pāribhāṣika-śabdāvalī):
   - Ancient DNA (aDNA): प्राचीनजनुसूत्रम् (prācīna-janusūtram) or पुराजनुतत्त्वम् (purājanutattvam)
   - Archaeology / Excavation: पुरातत्त्वम् (purātattvam) / उत्खननम् (utkhananam)
   - Steppe ancestry: स्टेपी-प्रजाति-अंशः / स्टेपी-मूलम्
   - Radiocarbon dating: कार्बन-कालनिर्धारणम् (kārbana-kālanirdhāraṇam)
   - Stratigraphy: स्तरविज्ञानम् (staravijñānam)
   - Peer-reviewed: समक्षपरीक्षितम् (samakṣaparīkṣitam)
   - Migration: प्रवासनम् (pravāsanam) / सञ्चारः (sañcāraḥ)
2. Frontmatter:
   - title: Translate into Sanskrit (e.g., 'OIT विरुद्धं AMT: मासिक-वृत्तान्तः [मासः वर्षम्]' or 'IVC: मासिक-वृत्तान्तः [मासः वर्षम्]')
   - date: Keep unchanged
   - series: Keep series value unchanged from frontmatter (e.g., "OIT vs AMT" or "IVC")
   - period: Translate into Sanskrit (e.g., 'जून 2026', 'जुलै 2026', 'अगस्त 2026', 'सितम्बर 2026', 'अक्टूबर 2026')
   - description: Translate into formal academic Sanskrit
   - tags: Keep technical tags intact or transcribe accurately
   - sourcesCount: Keep unchanged
   - highlights: Translate each highlight bullet point into formal academic Sanskrit
3. Top Navigation Button:
   Translate '<a href="#vollstandiger-monatsbericht" class="quick-btn quick-btn-primary" style="text-decoration: none;">\\n    <span>📄</span> Vollständigen Monatsbericht lesen ↓\\n  </a>'
   to '<a href="#full-monthly-report" class="quick-btn quick-btn-primary" style="text-decoration: none;">\\n    <span>📄</span> सम्पूर्णं मासिक-वृत्तान्तं पठतु ↓\\n  </a>'
4. Section Headings:
   - "## 1. Evidenz-Matrix des Monats" -> "## 1. प्रमाण-व्यूहः (Disciplinary Evidence Matrix)"
   - "## 2. Kernbefunde im Detail" or "## 2. Detaillierte Analyse der Kernpublikationen" -> "## 2. मुख्यान्वेषणानि विस्तृतावलोकनं च"
   - "## 3. Zusammenfassung & Synthese" -> "## 3. संक्षेपः संश्लेषणं च"
   - "## Vollständiger Monatsbericht" -> "## सम्पूर्ण-मासिक-वृत्तान्तः {#full-monthly-report}"
   - "::: details Vollständigen ungekürzten Monatsbericht anzeigen" -> "::: details सम्पूर्णम् अविकलं मासिक-वृत्तान्तं पश्यतु"
   - "## Ausgewertete Quellen & Bibliographie" or "Vollständige Bibliographie" -> "## मूल्याङ्कितानि स्रोतांसि ग्रन्थसूची च"
5. Custom containers: Keep ::: note-box, ::: grammar-box, ::: details, and all attributes intact. Inside ::: note-box [Executive Summary], translate the heading to [कार्यकारी-सारसंक्षेपः].
6. The full text inside ::: details MUST be translated completely into Sanskrit in its entirety! Do not omit, truncate, or summarize it!
7. Keep all citations, links, and DOIs intact.
8. Return ONLY the complete valid Markdown document, without any enclosing markdown code block fences (no ```markdown at the start or ``` at the end).
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
            "maxOutputTokens": 32768,
            "thinkingConfig": {
                "thinkingBudget": 0
            }
        }
    }

    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with urllib.request.urlopen(req, timeout=180) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        candidate = result["candidates"][0]
        finish_reason = candidate.get("finishReason")
        if finish_reason != "STOP":
            raise RuntimeError(f"Gemini API did not finish normally (finishReason={finish_reason})")

        candidate_text = candidate["content"]["parts"][0]["text"]
        # Strip potential markdown fences if model outputs them
        clean_text = candidate_text.strip()
        if clean_text.startswith("```markdown"):
            clean_text = clean_text[len("```markdown"):].strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text[len("```"):].strip()
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3].strip()
        return clean_text

def main():
    if len(sys.argv) < 2:
        print("Usage: translate_report.py <path_to_german_report.md> [--sa-only|--en-only|--hi-only|--force]")
        sys.exit(1)

    de_path = sys.argv[1]
    if not os.path.exists(de_path):
        print(f"Error: File not found: {de_path}")
        sys.exit(1)

    force = "--force" in sys.argv
    sa_only = "--sa-only" in sys.argv
    en_only = "--en-only" in sys.argv
    hi_only = "--hi-only" in sys.argv

    base_name = os.path.basename(de_path)
    en_path = os.path.join("docs", "en", "posts", base_name)
    hi_path = os.path.join("docs", "hi", "posts", base_name)
    sa_path = os.path.join("docs", "sa", "posts", base_name)

    os.makedirs(os.path.dirname(en_path), exist_ok=True)
    os.makedirs(os.path.dirname(hi_path), exist_ok=True)
    os.makedirs(os.path.dirname(sa_path), exist_ok=True)

    with open(de_path, "r", encoding="utf-8") as f:
        de_content = f.read()

    # English
    if not (sa_only or hi_only):
        if force or not os.path.exists(en_path):
            print(f"Translating {de_path} to English ({en_path})...")
            en_text = call_gemini(PROMPT_EN, de_content)
            with open(en_path, "w", encoding="utf-8") as f:
                f.write(en_text + "\n")
            print(f"✓ English translation written to {en_path}")
        else:
            print(f"Skipping English (already exists: {en_path})")

    # Hindi
    if not (sa_only or en_only):
        if force or not os.path.exists(hi_path):
            print(f"Translating {de_path} to Hindi ({hi_path})...")
            hi_text = call_gemini(PROMPT_HI, de_content)
            with open(hi_path, "w", encoding="utf-8") as f:
                f.write(hi_text + "\n")
            print(f"✓ Hindi translation written to {hi_path}")
        else:
            print(f"Skipping Hindi (already exists: {hi_path})")

    # Sanskrit
    if not (en_only or hi_only):
        if force or not os.path.exists(sa_path):
            print(f"Translating {de_path} to Sanskrit ({sa_path})...")
            sa_text = call_gemini(PROMPT_SA, de_content)
            with open(sa_path, "w", encoding="utf-8") as f:
                f.write(sa_text + "\n")
            print(f"✓ Sanskrit translation written to {sa_path}")
        else:
            print(f"Skipping Sanskrit (already exists: {sa_path})")

if __name__ == "__main__":
    main()
