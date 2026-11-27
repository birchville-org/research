# Monatsbericht-Auftrag: Yavanas mit Kharoṣṭhī-Feder

> **Single Source of Truth (SSOT):** Diese Datei im Git-Repository (`/Volumes/SanDisk1TB/proj/birchville-blog/prompts/yavanas.md`) ist die verbindliche Master-Vorlage für den Forschungsauftrag `yavanas`. Der Spiegel in Google Drive wird über `npm run sync:drive` synchron gehalten.

## 1. Parameter
* **Themenbezeichnung:** Yavanas mit Kharoṣṭhī-Feder: Griechischsprachige Verwaltungseliten und die Entstehung der Gāndhārī-Manuskriptkultur in Taxila und Swat
* **Serien-Kürzel:** `yavanas` (`series: "Yavanas"`)
* **Projektordner (Google Drive):** `/Users/marco/Library/CloudStorage/GoogleDrive-mdemarmels@gmail.com/Meine Ablage/Yavanas-blog`
* **Blog-Repository:** `/Volumes/SanDisk1TB/proj/birchville-blog`
* **Empfänger E-Mail:** `webmaster@birchville.org`
* **Recherchezeitraum:** Letzte 30 Tage ab heute
* **Zielumfang:** 1000–1500 Wörter (Deutsch, reiner Unicode-Klartext, strikt KEINE LaTeX-Syntax `$` oder `$$`)

---

## 2. Steuerungslogik & Vorprüfungen (Strikt einzuhalten)

### Schritt 2.1: Datumskontrolle & Rückfrage
1. Ermittle das heutige Datum und den Wochentag.
2. Prüfe, ob heute der **letzte Freitag des aktuellen Kalendermonats** ist (d. h. heute + 7 Tage liegt bereits im nächsten Kalendermonat).
3. **Falls heute NICHT der letzte Freitag des Monats ist:**
   * Gib das aktuelle Datum sowie den nächsten regulären Stichtag aus.
   * Frage den Benutzer interaktiv, ob der Zeitplan übersteuert und die Verarbeitung trotzdem sofort gestartet werden soll.
   * Fahre **NUR** nach ausdrücklicher Bestätigung fort; beende den Lauf andernfalls mit einer kurzen Notiz.

### Schritt 2.2: Duplikatssperre & Prüfung des Verarbeitungsprotokolls (Idempotenz)
1. Ermittle die Berichtsperiode `YYYY-MM`.
2. Prüfe `/Users/marco/Library/CloudStorage/GoogleDrive-mdemarmels@gmail.com/Meine Ablage/Yavanas-blog/processing_log.json` sowie das Vorhandensein von `yavanas_YYYY-MM.md` und `/Volumes/SanDisk1TB/proj/birchville-blog/docs/posts/yavanas-YYYY-MM.md`.
3. **Falls für diesen Monat bereits ein Bericht vorliegt oder protokolliert wurde:**
   * Auf keinen Fall nochmals verarbeiten oder überschreiben. Lauf sofort mit Hinweis auf den bestehenden Bericht beenden.

---

## 3. Rechercheprofil & Fachdisziplinen (Letzte 30 Tage)
Führe mittels Web-Suche (`search_web`) eine umfassende wissenschaftliche und publizistische Recherche zu neuen Beiträgen der letzten 30 Tage durch:
1. **Epigraphik & Kanzleipraxis:** Kharoṣṭhī-Inschriften, Swat-Meridarch Theodotos CKI 32, Meridarchen-Platte Taxila, aramäische vs. griechische Schreibertradition, makedonischer Kalender / Monatsnamen in Gandhāra, Rabatak-Inschrift, bilingue Legenden.
2. **Gāndhārī-Philologie & Manuskriptforschung:** Früheste Birkenrinden-Handschriften (Islamabad-, Senior- und British-Library-Sammlungen), Schreibgewohnheiten und Formulare, Verwaltungsroutine vs. Klosterpraxis, Lehnwörter im religiösen und administrativen Wortschatz, *Dictionary of Gāndhārī* (LMU München).
3. **Archäologie Taxila / Sirkap & Gandharan Urbanism:** Stratigraphie und Grabungsbefunde in Sirkap/Taxila, Stiftungen und Stupas, Jandial D, Barikot/Swat, Siedlungsarchäologie der italienischen Mission (ISMEO).
4. **Historischer Kulturkontakt & Chronologie:** Chronologisches Gefälle Indo-Griechen vs. Kuschan, Weiterleben griechischer Kanzleipraxis im Stiftungswesen, Vergleiche zur gleichzeitigen Verschriftlichung im Pāli-Kanon.

---

## 4. Berichterstellung & Formatstandards
* Umfang: ca. 1000–1500 Wörter auf Deutsch.
* Reiner Unicode-Klartext (niemals LaTeX-Syntax `$` oder `$$`).
* Gliederung: Executive Summary, die vier Fachabschnitte sowie als H2-Pflichtabschnitt am Ende `## Ausgewertete Quellen & Bibliographie` mit allen verwendeten Titeln, Autoren, Erscheinungsdaten und funktionierenden direkten URLs/DOIs (durchnummerierte Liste, keine Steuerzeichen wie `\x0c`).

---

## 5. Speicherung, Protokollführung, Zeitleiste & Dashboards

1. **Rohbericht im Google-Drive-Projektordner speichern:**
   `/Users/marco/Library/CloudStorage/GoogleDrive-mdemarmels@gmail.com/Meine Ablage/Yavanas-blog/yavanas_YYYY-MM.md`
2. **Verarbeitungsprotokoll atomar nachführen:**
   * `/Users/marco/Library/CloudStorage/GoogleDrive-mdemarmels@gmail.com/Meine Ablage/Yavanas-blog/processing_log.json` (`records`)
   * `/Users/marco/Library/CloudStorage/GoogleDrive-mdemarmels@gmail.com/Meine Ablage/Yavanas-blog/PROCESSING_LOG.md`
3. **Chronologische Zeitleiste & Forschungsbefunde (alle 4 Sprachen) aktualisieren:**
   * Extrahiere neu datierte Befunde, Inschriften, C14-Ergebnisse oder paläographische Fixpunkte aus der Monatsrecherche.
   * Ergänze `/Volumes/SanDisk1TB/proj/birchville-blog/docs/public/data/yavanas-timeline.json` (unter `events` mit `"added_in_period": "YYYY-MM"`) und setze `last_updated` auf `YYYY-MM-DD`.
   * Aktualisiere synchron die drei übersetzten Zeitleisten mit identischen Event-`id`s und `last_updated`:
     * `/Volumes/SanDisk1TB/proj/birchville-blog/docs/public/data/yavanas-timeline.en.json`
     * `/Volumes/SanDisk1TB/proj/birchville-blog/docs/public/data/yavanas-timeline.hi.json`
     * `/Volumes/SanDisk1TB/proj/birchville-blog/docs/public/data/yavanas-timeline.sa.json`
   * Spiegle nach Google Drive via `npm run sync:drive` (aktualisiert `yavanas_timeline.json`) und ergänze `/Users/marco/Library/CloudStorage/GoogleDrive-mdemarmels@gmail.com/Meine Ablage/Yavanas-blog/yavanas_timeline.md`.
4. **„Stand der Forschung“-Dashboards (alle 4 Sprachen) nachführen:**
   * Ergänze den Monatsbericht in allen vier Sprachfassungen von `docs/{,en/,hi/,sa/}stand-der-forschung/yavanas.md` unter Abschnitt *4. Historie der Monats-Updates*.
   * Prüfe Abschnitte 1–3 (Evidenz-Matrix, Laufende Projekte, Offene Streitpunkte) auf Aktualisierungsbedarf.

---

## 6. E-Mail-Digest, Blog-Draft & Konsistenz-Gate

1. **E-Mail-Digest an `webmaster@birchville.org`:**
   ```zsh
   /Volumes/SanDisk1TB/proj/birchville-blog/send_digest_mail.sh \
     "Monatsbericht Yavanas mit Kharoṣṭhī-Feder (YYYY-MM)" \
     "/Users/marco/Library/CloudStorage/GoogleDrive-mdemarmels@gmail.com/Meine Ablage/Yavanas-blog/yavanas_YYYY-MM.md"
   ```
2. **Blog-Draft bereitstellen:**
   * Ablegen unter `/Volumes/SanDisk1TB/proj/birchville-blog/docs/posts/yavanas-YYYY-MM.md` mit normiertem YAML-Frontmatter (`title`, `date`, `series: "Yavanas"`, `period`, `description`, `tags`, `sourcesCount`, `highlights`), wobei `sourcesCount` exakt der nummerierten Quellenanzahl entspricht.
   * Nach Übersetzung (`translate_report.py` bzw. `publish_report.sh`) und Abschluss aller Dashboard-/Zeitleisten-Updates im Repo-Root prüfen und freigeben:
     ```zsh
     npm run check:consistency
     ./publish_report.sh docs/posts/yavanas-YYYY-MM.md
     ```
