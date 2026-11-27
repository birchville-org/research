# Changelog

## v0.3.0 (2026-11-27)

### Datenintegrität & Kernfunktionen
- **Interlineare IAST-Modi (`हिन्दी + IAST`, `संस्कृतम् + IAST`):** Client-seitiger `<ruby>`-Renderer (`ruby-position: under`) in `docs/.vitepress/theme/iastMode.js` (Vue-Lifecycle + `router.onAfterRouteChange` + `observer.takeRecords()`) mit Sprachmenü-Alias (`customLangs.js`) sowie Sanskrit-1:1- und Hindi-Stufe-1-Hybrid-Transliterator (`iastTransliterator.js`: Ausnahme-Lexikon, Morphemgrenzen-Segmentierung, Ohala-Schwa-Tilgung, Nukta).
- **IAST-Regressionstests & CI (`scripts/test-iast.mjs`, `.github/workflows/deploy.yml`):** Automatisierte Test-Suite über Sanskrit/Hindi-Prüffälle und 3913 Korpus-Tokens (`npm run test:iast` / `npm test`) sowie Integration in den GitHub-Pages-Workflow.

### Plattform & Deployment
- **Synology-Sync In-Place (`publish_report.sh`):** Statt des bisherigen Verzeichnis-Tausches über `dist.new` + `mv` (der die Bind-Mount-Inode wechselte) synchronisiert das Skript nun via `rsync -az --delete --exclude='._*'` In-Place in `/volume1/docker/blog/dist/`.

### Dokumentation
- **Backlog:** `BACKLOG.md` mit Status zu IAST-Ausbaustufe 1b und Stufe 2 ergänzt.

## v0.2.0 (2026-11-27)

### Datenintegrität & Kernfunktionen
- **Zentrale Serien-Registry & Prompt-Vertrag:** `prompts/series.json` sowie die versionierten Serien-Prompts (`prompts/ivc.md`, `prompts/oit-vs-amt.md`, `prompts/yavanas.md`) und `RECOVERY.md` ergänzt; `PROMPT_TEMPLATE_MONTHLY_REPORT.md` auf Repo-first + `npm run sync:drive` vereinheitlicht.
- **Konsistenz- & Drive-Sync-Skripte:** `scripts/check-consistency.mjs` (inkl. Paritäts-, Quellen-, Dashboard-, Timeline-, Prompt- und `lastUpdated`-Prüfung) sowie `scripts/sync-drive.mjs` (Repo → Google Drive) eingeführt.

### Performance & Rendering
- **Dynamisches `lastUpdated`:** `transformPageData` in `docs/.vitepress/config.mjs` ermittelt für Übersichts-, Archiv- und Dashboard-Seiten automatisch das jüngste Beitrags-/Commit-Datum; `check-consistency.mjs` prüft die gerenderten HTML-`<time datetime>`-Tags über alle 24 Seiten.
- **Konfigurierbarer Base-Pfad:** `VITEPRESS_BASE` (Standard `/research/`) und `VITEPRESS_DIST_DIR` in `docs/.vitepress/config.mjs` bzw. `scripts/check-links.mjs` ergänzt.

### Plattform- & CI/CD-Stabilität
- **Dual-Base- & Atomar-Deploy:** `publish_report.sh` baut für `https://blog.birchville.org/` eine eigene Root-Variante in `docs/.vitepress/dist-synology` und tauscht `/volume1/docker/blog/dist` auf Synology atomar über `dist.new` und `mv`.
- **CI/CD-Pipeline:** `.github/workflows/deploy.yml` (`fetch-depth: 0`, `npm run check:consistency`) und `package.json` (`test`, `check:consistency`, `sync:drive`) vervollständigt.

## v0.1.1 (2026-11-26)

### Datenintegrität & Kernfunktionen
- **Indus Valley Culture (IVC):** Monats-Update November 2026 in der Reporthistorie unter `Stand der Forschung` ergänzt und die Oktober-2026-Angabe zu Rakhigarhi Mound 7 konsistent an den Monatsbericht angeglichen (DE/EN/HI/SA).
- **OIT vs. AMT:** Fehlende Monats-Updates in der Reporthistorie unter `Stand der Forschung` nachgetragen (Juni, Juli und August 2026 in DE/EN; Oktober 2026 in HI/SA) sowie den Oktober-2026-Eintrag in allen vier Sprachfassungen präzise auf die dokumentierten Befunde (Laktasepersistenz `-13.910:C>T` / `Steppe_MLBA`, 8 Skelette Rakhigarhi Mound 7, Sinauli-Scheibenräder, Dharamjali-Megadürren, Rigveda-Chronologie) korrigiert.

### i18n-Parität & Korrekturen
- Hindi-Einträge (Juli und September 2026) unter `docs/hi/stand-der-forschung/oit-vs-amt.md` hinsichtlich Vollständigkeit (`AnSI`, `qpAdm`) und Devanāgarī-Schreibweise bereinigt.
