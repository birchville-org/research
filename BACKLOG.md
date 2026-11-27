# Backlog – Birchville Research (`birchville-blog`)

Stand: 2026-11-27

## 1. Kurzfristig / Offene Freigabe

- [x] **Visuelle Browser-Prüfung der IAST-Darstellungsmodi (`हिन्दी + IAST`, `संस्कृतम् + IAST`)**
  - Prüfung auf Desktop, Tablet und Mobile inkl. Zeilenumbruch-Verhalten von `<ruby>` (`ruby-position: under`) in:
    - Übersichtsseiten und [`PostList.vue`](docs/.vitepress/theme/components/PostList.vue)
    - Aufgeklappten `<details>`-Langberichten
    - Evidenz-Matrix-Popups (`dialog.matrix-dialog`)
    - Interaktiver Zeitleiste ([`TimelineModal.vue`](docs/.vitepress/theme/components/TimelineModal.vue))
    - Light Mode und Dark Mode sowie Copy-&-Paste-Test (`user-select: none` auf `<rt>`).
- [ ] **Qualitätssicherung & Veröffentlichung der aktuellen lokalen Änderungen**
  - Cross-Model-Review (`/code-review`) und Release (`/release`) für:
    - Client-seitige IAST-Modi unter [`docs/.vitepress/`](docs/.vitepress/) (`iastTransliterator.js`, `iastMode.js`, `customLangs.js`, `custom.css`, `index.mjs`, `config.mjs`)
    - Inode-erhaltenden Synology-Sync in [`publish_report.sh`](publish_report.sh).

---

## 2. IAST-Ausbaustufe 1b – Korpus-Stichprobe & Ausnahme-Lexikon (Hindi)

- [x] **Systematische Korpus-Stichprobe über bestehende Hindi-Texte**
  - Auswertung aller Hindi-Dateien unter `docs/hi/posts/*.md`, `docs/hi/stand-der-forschung/*.md` und `docs/public/data/*.hi.json` auf falsch getilgte oder beibehaltene Schwa-Grenzfälle (Komposita, Verbalstämme, Tatsama-/Tadbhava-Wörter).
- [x] **Erweiterung von `HINDI_LEXICON` & Morphem-Listen**
  - Ergänzung von Ausnahmen, Morphemgrenzen-Schutz (`MATRAS`/`VIRAMA`) sowie finaler Repha-Regel in [`iastTransliterator.js`](docs/.vitepress/theme/iastTransliterator.js).
  - Aufbau eines dedizierten automatisierten Regressionstests ([`scripts/test-iast.mjs`](scripts/test-iast.mjs) via `npm run test:iast` / `npm test`) für Hindi-Schwa-Tilgung, Korpus-Invarianten und Sanskrit-1:1-Transliteration.

---

## 3. IAST-Ausbaustufe 2 – Build-Time-Korpus-Lexikon (Ziel: ca. 99 %+)

- [ ] **Wortextraktion im Build-Prozess**
  - Build-Skript erstellen, das sämtliche einzigartigen Devanāgarī-Wortformen aus `docs/hi/` und `docs/public/data/*.hi.json` einsammelt.
- [ ] **Offline-Auflösung gegen Morphologie-Quelle**
  - Abgleich der extrahierten Wortformen gegen ein Offline-Lexikon bzw. eine Morphologie-Datenbasis (z. B. Wiktionary-Dump oder IIIT-Hyderabad-Morph-Daten) und Export als kompakte Lookup-JSON (ca. 30–60 KB).
- [ ] **Nahtlose Integration in den Client-Transliterator**
  - Einbindung der generierten JSON-Tabelle in den Direkt-Lookup von [`iastTransliterator.js`](docs/.vitepress/theme/iastTransliterator.js), ohne Änderungen am `<ruby>`-Renderer ([`iastMode.js`](docs/.vitepress/theme/iastMode.js)) oder am Sprachmenü ([`customLangs.js`](docs/.vitepress/theme/composables/customLangs.js)).
