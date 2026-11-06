# Universal-Prompt-Vorlage: Monatlicher Forschungsbericht mit Blog-Publikationspipeline

Diese Vorlage enthält die vollständige Steuerungslogik (Datumsprüfung mit interaktiver Rückfrage, Duplikatssperre / Idempotenz, Recherche, Protokollführung, Mailversand und Blog-Vorbereitung). Sie kann für beliebige neue Themen kopiert und angepasst werden.

---

```markdown
# Monatsbericht-Auftrag: [THEMA_NAME]

## 1. Parameter
* **Themenbezeichnung:** [THEMA_NAME] (z. B. "Indus-Kultur (IVC): Archäologie und Chronologie")
* **Serien-Kürzel:** [SERIEN_KUERZEL] (z. B. "ivc", "oit-vs-amt" oder "yavanas")
* **Projektordner (Google Drive/Lokal):** [PFAD_PROJEKTORDNER] (z. B. "/Users/marco/Library/CloudStorage/GoogleDrive-mdemarmels@gmail.com/Meine Ablage/[ORDNER]")
* **Blog-Repository:** /Volumes/SanDisk1TB/proj/birchville-blog
* **Empfänger E-Mail:** webmaster@birchville.org
* **Recherchezeitraum:** Letzte 30 Tage ab heute
* **Zielumfang:** 1000–1500 Wörter (Deutsch, reiner Unicode-Klartext, strikt KEINE LaTeX-Syntax)

---

## 2. Steuerungslogik & Vorprüfungen (Strikt einzuhalten)

### Schritt 2.1: Datumskontrolle & Rückfrage
1. Ermittle das heutige Datum und den Wochentag.
2. Prüfe, ob heute der **letzte Freitag des Kalendermonats** ist (d. h. heute + 7 Tage liegt im nächsten Kalendermonat).
3. **Falls heute NICHT der letzte Freitag ist:**
   * Gib das heutige Datum sowie den nächsten regulären Stichtag aus.
   * **Stelle eine interaktive Rückfrage**, ob der Zeitplan übersteuert und die Verarbeitung sofort gestartet werden soll.
   * Fahre **NUR** fort, wenn der Nutzer die Übersteuerung ausdrücklich bestätigt. Andernfalls beende den Lauf sofort ohne weitere Aktionen.

### Schritt 2.2: Duplikatssperre & Prüfung des Verarbeitungsprotokolls (Idempotenz)
1. Ermittle die Berichtsperiode `YYYY-MM` (aktuelles Jahr und Monat).
2. Prüfe die Protokolldatei `[PFAD_PROJEKTORDNER]/processing_log.json` sowie das Vorhandensein von Zieldateien `[SERIEN_KUERZEL]-YYYY-MM.*` bzw. `out_of_india_YYYY-MM.*`.
3. **Sperre gegen Doppelverarbeitung:**
   * Falls für die Periode `YYYY-MM` bereits ein Bericht protokolliert ist oder die Zieldatei existiert: **Brich den Lauf sofort ab!**
   * Meldung: *"Der Monatsbericht für [SERIEN_KUERZEL] (YYYY-MM) liegt bereits vor bzw. wurde bereits verarbeitet. Ein erneuter Lauf ist gesperrt."*
   * **Keinesfalls einen alten Bericht nochmals verarbeiten oder überschreiben.**

---

## 3. Fachliche Recherche (Letzte 30 Tage)
Führe via Web-Suche (search_web) und Fachdatenbanken eine systematische Recherche zu neuen Veröffentlichungen, Preprints und Diskussionen der letzten 30 Tage durch:

[FACHGEBIETE_LISTE]
<!-- Beispiel:
1. Archäogenetik & Paläogenetik: aDNA-Studien, Populationsmodelle, Haplogruppen
2. Archäologie & Datierung: Grabungsbefunde, Stratigraphie, C14-Daten
3. Linguistik & Philologie: Sprachkontakt, Substrate, Textchronologie
-->

---

## 4. Berichterstellung & Formatstandards
Verfasse den Bericht auf Deutsch im Umfang von ca. 1000–1500 Wörtern mit folgender Gliederung:
1. `# [TITEL]` mit Metadatenblock (Berichtszeitraum, Erstellungsdatum, Disziplinen)
2. `## 1. Executive Summary`
3. Fachabschnitte gemäß den Disziplinen
4. **Verbindliches Quellenverzeichnis (H2-Ebene gemäß Blog-Standard):**
   `## Ausgewertete Quellen & Bibliographie`
   * Durchnummerierte Liste aller verwendeten Quellen (`1. **Autor (Jahr):** *Titel*. Journal. [Link](URL)`).
   * Valide, funktionierende Direktlinks (kein Pandoc-Markup).
   * Reiner Unicode-Klartext (kein `$`, kein `$$`, keine LaTeX-Mathematik).

---

## 5. Dateispeicherung & Protokollführung

1. **Speichern im Projektordner:**
   Speichere den Markdown-Bericht unter:
   `[PFAD_PROJEKTORDNER]/[DATEINAME_MUSTER_YYYY-MM].md`

2. **Verarbeitungsprotokoll aktualisieren:**
   Trage den abgeschlossenen Lauf atomar ein:
   * In `[PFAD_PROJEKTORDNER]/processing_log.json` (JSON-Array `records`) mit:
     `{"period": "YYYY-MM", "processed_at": "<ISO-Timestamp>", "primary_file": "<Dateiname>", "status": "completed", "notes": "..."}`
   * In `[PFAD_PROJEKTORDNER]/PROCESSING_LOG.md` (Markdown-Tabelle).

3. **Chronologische Zeitleiste & Forschungsbefunde (Timeline-Artefakt) aktualisieren:**
   * Extrahiere neu datierte Befunde, Inschriften, C14-Ergebnisse oder chronologische Verschiebungen aus der Monatsrecherche.
   * Ergänze atomar `[PFAD_PROJEKTORDNER]/[SERIEN_KUERZEL]_timeline.json` (unter `events` mit Kennzeichnung `"added_in_period": "YYYY-MM"`).
   * Spiegle die Datei nach `/Volumes/SanDisk1TB/proj/birchville-blog/docs/public/data/[SERIEN_KUERZEL]-timeline.json`.
   * Aktualisiere die tabellarische Begleitdatei `[PFAD_PROJEKTORDNER]/[SERIEN_KUERZEL]_timeline.md`.
   * Vermerke neue chronologische Fixpunkte in `docs/stand-der-forschung/[SERIEN_KUERZEL].md` unter Abschnitt *4. Historie der Monats-Updates*.

---

## 6. E-Mail-Digest & Blog-Bereitstellung

1. **E-Mail-Digest:**
   Versende den Bericht per Apple Mail an `[ZIEL_EMAIL]` über:
   `/Volumes/SanDisk1TB/proj/birchville-blog/send_digest_mail.sh "[THEMA_NAME] (YYYY-MM)" "[PFAD_PROJEKTORDNER]/[DATEINAME_MUSTER_YYYY-MM].md"`

2. **Blog-Draft bereitstellen (Birchville Blog):**
   * Kopiere den Bericht nach `/Volumes/SanDisk1TB/proj/birchville-blog/docs/posts/[SERIEN_KUERZEL]-YYYY-MM.md`.
   * Ergänze das normierte YAML-Frontmatter:
     ```yaml
     ---
     title: "[THEMA_NAME]: Monatsbericht [MONAT_NAME] [JAHR]"
     date: YYYY-MM-DD
     series: "[SERIEN_NAME]"
     period: "[MONAT_NAME] [JAHR]"
     description: "..."
     tags: [...]
     sourcesCount: [EXAKTE_ANZAHL_DER_QUELLEN]
     ---
     ```
   * *Hinweis zur Publikation:* Die Freigabe und Veröffentlichung erfolgt anschließend über `./publish_report.sh docs/posts/[SERIEN_KUERZEL]-YYYY-MM.md`.
```
