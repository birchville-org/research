# Produktionsregeln für Monatsberichte & Blog-Beiträge

Für alle automatisiert oder manuell generierten Monatsberichte und Blogbeiträge in diesem Repository gelten folgende verbindliche Standards:

## 1. Verbindliches Quellenverzeichnis (H2-Ebene)
* **Pflichtabschnitt:** Jeder Monatsbericht MUSS am Ende einen eigenen Abschnitt auf H2-Ebene besitzen:
  * Deutsch: `## Ausgewertete Quellen & Bibliographie`
  * Englisch: `## Evaluated Sources & Bibliography`
  * Hindi: `## मूल्यांकित स्रोत एवं संदर्भ`
* **Überschriften-Hierarchie:** Dieser Abschnitt MUSS als echtes Markdown-H2 (`##`) deklariert sein, damit er:
  1. Automatisch im Inhaltsverzeichnis (Outline / Seitennavigation rechts) von VitePress erfasst wird.
  2. Direkt per Anker-Link ansteuerbar ist.
* **Keine unformatierten Textblöcke:** Reine Fettungen (wie `**Vollständige Bibliographie**`) oder Steuerzeichen (wie Form Feeds `\x0c`) sind unzulässig.

## 2. Struktur und Format der Quellenangaben
* **Nummerierte Liste:** Jede Quelle wird durchnummeriert: `1. **Autor / Institution (Jahr):** *Titel*. Journal/Medium. Identifikator/DOI.`
* **Valide, klickbare Hyperlinks:** URLs müssen als reguläre Markdown-Links `[Link-Text](URL)` formatiert sein. Pandoc-spezifische Markup-Artefakte (z. B. `{.underline}`) sind verboten.
* **Kategorisierung bei umfangreichen Quellen:** Bei mehr als 10 Quellen ist eine Gliederung auf H3-Ebene (`### Primärstudien & Peer-Reviewed`, `### Preprints & Fachberichte`, `### Institutionelle Mitteilungen & Rezeption`) vorzusehen.

## 3. Frontmatter-Konsistenz & Serien-Zuordnung
* Jede Markdown-Datei muss das Metadatum `series` und `sourcesCount` im YAML-Frontmatter führen.
* Unterstützte Forschungsreihen und Dateinamen-Muster:
  1. **OIT vs. AMT**:
     - Dateiname: `docs/posts/oit-vs-amt-YYYY-MM.md`
     - Frontmatter: `series: "OIT vs AMT"`
     - Git-Tag: `report/oit-vs-amt-YYYY-MM` (bzw. historisch `report/YYYY-MM`)
  2. **IVC (Indus Valley Culture)**:
     - Dateiname: `docs/posts/ivc-YYYY-MM.md`
     - Frontmatter: `series: "IVC"`
     - Git-Tag: `report/ivc-YYYY-MM`
* Beispiel-Frontmatter:
  ```yaml
  ---
  title: "IVC: Monatsbericht Oktober 2026"
  date: 2026-10-30
  series: "IVC"
  period: "Oktober 2026"
  description: "Monatlicher Forschungsbericht zu aktuellen Ausgrabungen, Paläoklima und Chronologien der Indus-Zivilisation."
  tags: [IVC, Harappa, Archaeology, Radiocarbon]
  sourcesCount: 12
  ---
  ```
* Die in `sourcesCount` angegebene Zahl MUSS exakt der Anzahl der nummerierten Einträge im Quellenverzeichnis entsprechen (wichtig für das Blog-Badge `📚 X Quellen ausgewertet` in der Beitragsliste).

## 4. Dreisprachigkeit & Parität (i18n: DE, EN, HI)
* Jeder deutsche Beitrag unter `docs/posts/` muss synchrone Äquivalente unter `docs/en/posts/` (Englisch) und `docs/hi/posts/` (Hindi in Devanagari) besitzen.
* Das Übersetzungs-Skript `translate_report.py` übersetzt neue Berichte automatisch via Gemini API in beide Zielsprachen.
* Das Quellenverzeichnis darf in keiner Übersetzung weggelassen werden. Es wird in allen drei Sprachen mit identischer Quellenanzahl geführt.

## 5. Publikations-Workflow (Modell A)
* Sobald die Automatisierung einen neuen Monatsbericht (z. B. `docs/posts/ivc-2026-10.md` oder `docs/posts/oit-vs-amt-2026-10.md`) ablegt, erfolgt die Freigabe und Bereitstellung per:
  ```bash
  ./publish_report.sh [optional_pfad_zur_datei.md]
  ```
* Das Skript prüft Parität, H2-Quellen und `sourcesCount`, baut VitePress, committet und taggt, pusht zu Origin und synchronisiert das Traefik-Docker-Webroot.
