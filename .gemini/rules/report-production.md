# Produktionsregeln für Monatsberichte & Blog-Beiträge

Für alle automatisiert oder manuell generierten Monatsberichte und Blogbeiträge in diesem Repository gelten folgende verbindliche Standards:

## 1. Verbindliches Quellenverzeichnis (H2-Ebene)
* **Pflichtabschnitt:** Jeder Monatsbericht MUSS am Ende einen eigenen Abschnitt auf H2-Ebene (`## Ausgewertete Quellen & Bibliographie` bzw. in der englischen Fassung `## Evaluated Sources & Bibliography`) besitzen.
* **Überschriften-Hierarchie:** Dieser Abschnitt MUSS als echtes Markdown-H2 (`##`) deklariert sein, damit er:
  1. Automatisch im Inhaltsverzeichnis (Outline / Seitennavigation rechts) von VitePress erfasst wird.
  2. Direkt per Anker-Link ansteuerbar ist.
* **Keine unformatierten Textblöcke:** Reine Fettungen (wie `**Vollständige Bibliographie**`) oder Steuerzeichen (wie Form Feeds `\x0c`) sind unzulässig.

## 2. Struktur und Format der Quellenangaben
* **Nummerierte Liste:** Jede Quelle wird durchnummeriert: `1. **Autor / Institution (Jahr):** *Titel*. Journal/Medium. Identifikator/DOI.`
* **Valide, klickbare Hyperlinks:** URLs müssen als reguläre Markdown-Links `[Link-Text](URL)` formatiert sein. Pandoc-spezifische Markup-Artefakte (z. B. `{.underline}`) sind verboten.
* **Kategorisierung bei umfangreichen Quellen:** Bei mehr als 10 Quellen ist eine Gliederung auf H3-Ebene (`### Primärstudien & Peer-Reviewed`, `### Preprints & Fachberichte`, `### Institutionelle Mitteilungen & Rezeption`) vorzusehen.

## 3. Frontmatter-Konsistenz
* Jede Markdown-Datei muss das Metadatum `sourcesCount` im YAML-Frontmatter führen:
  ```yaml
  ---
  title: "..."
  date: 2026-10-23
  series: "OIT vs AMT"
  period: "Oktober 2026"
  sourcesCount: 15
  ---
  ```
* Die in `sourcesCount` angegebene Zahl MUSS exakt der Anzahl der nummerierten Einträge im Quellenverzeichnis entsprechen (wichtig für das Blog-Badge `📚 X Quellen ausgewertet` in der Beitragsliste).

## 4. Zweisprachigkeit & Parität (i18n)
* Jeder deutsche Beitrag unter `docs/posts/` muss ein synchrones englisches Äquivalent unter `docs/en/posts/` besitzen.
* Das Quellenverzeichnis darf in der englischen Übersetzung NICHT weggelassen werden. Es wird vollständig mit englischen Abschnittsüberschriften (`## Evaluated Sources & Bibliography`) parallel geführt.
