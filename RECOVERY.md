# Birchville Research: Systemübersicht & Disaster-Recovery-Runbook

Dieses Dokument beschreibt die **Single Source of Truth (SSOT)** für alle monatlichen Forschungsberichte, Skripte, Dashboards und Zeitleisten sowie das vollständige Wiederherstellungsverfahren im Notfall.

---

## 1. Gesamtarchitektur & Artefakt-Matrix

Alle verbindlichen Steuerungsartefakte werden versioniert in diesem Git-Repository (`birchville-org/research`) geführt. Google Drive dient ausschließlich als Ablage für Rohberichte, Verarbeitungsprotokolle und synchronisierte Spiegelkopien (`npm run sync:drive`).

| Serie (`id`) | Master-Prompt (Repo SSOT) | Stichtag | Google-Drive-Ordner | Rohbericht & Logs (Drive) | Blog-Posts (4 Sprachen) | Dashboards (4 Sprachen) | Zeitleisten (4 Sprachen + Drive) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`ivc`** | `prompts/ivc.md` | Letzter Donnerstag, 02:00 | `Meine Ablage/IVC-blog` | `indus_valley_YYYY-MM.md`, `processing_log.json`, `PROCESSING_LOG.md` | `docs/{,en/,hi/,sa/}posts/ivc-YYYY-MM.md` | `docs/{,en/,hi/,sa/}stand-der-forschung/ivc.md` | `docs/public/data/ivc-timeline{,.en,.hi,.sa}.json` + `ivc_timeline.{json,md}` |
| **`oit-vs-amt`** | `prompts/oit-vs-amt.md` | Letzter Freitag, 02:00 | `Meine Ablage/OITvsAMT-blog` | `out_of_india_YYYY-MM.md`, `processing_log.json`, `PROCESSING_LOG.md` | `docs/{,en/,hi/,sa/}posts/oit-vs-amt-YYYY-MM.md` | `docs/{,en/,hi/,sa/}stand-der-forschung/oit-vs-amt.md` | `docs/public/data/oit-vs-amt-timeline{,.en,.hi,.sa}.json` + `oit_vs_amt_timeline.{json,md}` |
| **`yavanas`** | `prompts/yavanas.md` | Letzter Freitag, 02:00 | `Meine Ablage/Yavanas-blog` | `yavanas_YYYY-MM.md`, `processing_log.json`, `PROCESSING_LOG.md` | `docs/{,en/,hi/,sa/}posts/yavanas-YYYY-MM.md` | `docs/{,en/,hi/,sa/}stand-der-forschung/yavanas.md` | `docs/public/data/yavanas-timeline{,.en,.hi,.sa}.json` + `yavanas_timeline.{json,md}` |

### Zentrale Registry & Skripte im Repository

| Datei | Zweck |
| :--- | :--- |
| `prompts/series.json` | Maschinenlesbare Registry aller Serien, Pfade, Zeitpläne und Dateinamensmuster |
| `PROMPT_TEMPLATE_MONTHLY_REPORT.md` | Generischer Blueprint für künftige neue Forschungsreihen |
| `send_digest_mail.sh` | Mailversand per Apple Mail an `webmaster@birchville.org` (Absender: `mdemarmels@gmail.com`) |
| `translate_report.py` | Automatische Übersetzung neuer DE-Berichte nach EN, HI (Devanāgarī) und SA (Devanāgarī) via Gemini API |
| `publish_report.sh` | Validierung, Build, Konsistenzprüfung, Git-Commit/-Tag, Push (`origin` & `synology`) und Synology-Webroot-Sync |
| `scripts/check-links.mjs` | Prüfung aller internen Links, Base-Pfade (`/research/`) und Anker in `docs/.vitepress/dist` |
| `scripts/check-consistency.mjs` | Prüfung von i18n-Parität, `sourcesCount` vs. Bibliographie, Abschnitt-4-Historien, 4-Sprachen-Zeitleisten, Prompt-Vertrag und Drive-Spiegel |
| `scripts/sync-drive.mjs` | Synchronisiert `prompts/<id>.md` -> `PROMPT_TEMPLATE_MONTHLY_REPORT.md` und `<id>-timeline.json` -> Drive |
| `.github/workflows/deploy.yml` | GitHub Actions Pipeline (`docs:build`, `check:links`, `check:consistency`, Deploy auf GitHub Pages) |

---

## 2. Antigravity-Automationen (Zero-Drift-Konfiguration)

Da geplante Antigravity-Automationen nicht in Git gespeichert werden, sollten die drei Automations-Aufträge jeweils nur einen **einzeiligen Verweis** auf den versionierten Master-Prompt im Repository enthalten. Änderungen im Repo greifen damit ohne manuelles Nachkopieren:

- **IVC (Donnerstag, 02:00 Uhr):**
  `Lies und führe den Auftrag exakt gemäß /Volumes/SanDisk1TB/proj/birchville-blog/prompts/ivc.md aus.`
- **OIT vs. AMT (Freitag, 02:00 Uhr):**
  `Lies und führe den Auftrag exakt gemäß /Volumes/SanDisk1TB/proj/birchville-blog/prompts/oit-vs-amt.md aus.`
- **Yavanas (Freitag, 02:00 Uhr):**
  `Lies und führe den Auftrag exakt gemäß /Volumes/SanDisk1TB/proj/birchville-blog/prompts/yavanas.md aus.`

---

## 3. Worst-Case-Rekonstruktion (Disaster Recovery)

Falls der lokale Rechner oder das Arbeitsverzeichnis vollständig neu aufgesetzt werden muss:

1. **Repository klonen & Abhängigkeiten installieren:**
   ```zsh
   git clone git@github.com:birchville-org/research.git /Volumes/SanDisk1TB/proj/birchville-blog
   cd /Volumes/SanDisk1TB/proj/birchville-blog
   npm ci
   ```
2. **Remotes & SSH-Zugänge wiederherstellen:**
   - SSH-Key (`~/.ssh/id_ed25519`) für GitHub (`origin`) und Synology (`synology`: `ssh://marco@synology.local/volume1/git/birchville-blog.git`) einrichten.
   - Optional Remote `synology` ergänzen: `git remote add synology ssh://marco@synology.local/volume1/git/birchville-blog.git`.
3. **Umgebungsvariable für Übersetzungen setzen (ungetrackt in `.env`):**
   - Für `translate_report.py` wird `GEMINI_API_KEY` benötigt (ausschließlich über Umgebungsvariable oder lokale, durch `.gitignore` geschützte `.env`-Datei hinterlegen, niemals committen).
4. **Apple Mail & Google Drive verbinden:**
   - Apple Mail mit Absenderkonto (`mdemarmels@gmail.com`) einrichten.
   - Google Drive (`Meine Ablage/{IVC-blog,OITvsAMT-blog,Yavanas-blog}`) lokal einhängen.
   - Falls die Google-Drive-Ordner verloren gingen: Ordner gemäß `prompts/series.json` neu anlegen und per `npm run sync:drive` die Prompts und Zeitleisten aus dem Git-Repository wiederherstellen (die publizierten Monatsberichte liegen vollständig unter `docs/posts/` im Repo).
5. **Integrität verifizieren:**
   ```zsh
   npm run sync:drive
   npm run docs:build && npm test
   ```
6. **Antigravity-Automationen neu anlegen:**
   Die drei geplanten Aufgaben mit den 1-Zeilen-Delegationen aus Abschnitt 2 anlegen.

---

## 4. Laufender Abgleich

- Nach jeder Änderung an `prompts/*.md` oder `docs/public/data/*-timeline.json`:
  ```zsh
  npm run sync:drive && npm run docs:build && npm test
  ```
- Vor jeder Veröffentlichung eines neuen Monatsberichts:
  ```zsh
  ./publish_report.sh docs/posts/<serie>-YYYY-MM.md
  ```
  `publish_report.sh` erzwingt automatisch `docs:build`, `check:links` und `check:consistency`.
