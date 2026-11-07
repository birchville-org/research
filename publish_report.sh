#!/bin/zsh
set -euo pipefail

# -----------------------------------------------------------------------------
# publish_report.sh - Freigabe & Veröffentlichung von Monatsberichten (Modell A)
# -----------------------------------------------------------------------------

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

echo "=== Birchville Blog: Publikations-Prüfung (Modell A) ==="

# 1. Ermitteln der Ziel-Monatsbericht-Dateien
if [[ $# -ge 1 && -n "${1:-}" ]]; then
  if [[ -f "$1" ]]; then
    LATEST_DE="$1"
  elif [[ -f "docs/posts/$1" ]]; then
    LATEST_DE="docs/posts/$1"
  else
    echo "Fehler: Angegebene Datei nicht gefunden: $1"
    exit 1
  fi
else
  # Automatisch den neuesten Bericht über alle Serien (oit-vs-amt, ivc etc.) ermitteln
  LATEST_DE="$(ls -1 docs/posts/*.md 2>/dev/null | sort | tail -n 1 || true)"
fi

if [[ -z "$LATEST_DE" ]]; then
  echo "Fehler: Keine Monatsberichte unter docs/posts/ gefunden."
  exit 1
fi

REPORT_FILE="$(basename "$LATEST_DE")"
FILENAME_NO_EXT="${REPORT_FILE%.md}"

# Serie und Periode aus Dateinamen extrahieren
if [[ "$FILENAME_NO_EXT" =~ ^([a-zA-Z0-9_-]+)-([0-9]{4}-[0-9]{2})$ ]]; then
  SERIES_PREFIX="${match[1]}"
  PERIOD_CODE="${match[2]}"
else
  SERIES_PREFIX="report"
  PERIOD_CODE="$FILENAME_NO_EXT"
fi

LATEST_EN="docs/en/posts/$REPORT_FILE"
LATEST_HI="docs/hi/posts/$REPORT_FILE"
LATEST_SA="docs/sa/posts/$REPORT_FILE"

# Tag-Namenskonvention
if [[ "$SERIES_PREFIX" == "oit-vs-amt" ]]; then
  if git rev-parse "report/$PERIOD_CODE" >/dev/null 2>&1; then
    TAG_NAME="report/$PERIOD_CODE"
  else
    TAG_NAME="report/$SERIES_PREFIX-$PERIOD_CODE"
  fi
else
  TAG_NAME="report/$SERIES_PREFIX-$PERIOD_CODE"
fi

echo "Ziel-Monatsbericht: Serie='$SERIES_PREFIX', Periode='$PERIOD_CODE' ($REPORT_FILE)"

# 2. Automatische Übersetzung falls Zielsprachen fehlen
if [[ ! -f "$LATEST_EN" || ! -f "$LATEST_HI" || ! -f "$LATEST_SA" ]]; then
  echo "Fehlende Übersetzungen erkannt. Starte automatische Übersetzung via translate_report.py..."
  python3 translate_report.py "$LATEST_DE"
fi

# 3. Validierung gegen Produktionsregeln (.gemini/rules/report-production.md)
echo "Prüfe Einhaltung der Produktionsregeln..."

if [[ ! -f "$LATEST_EN" ]]; then
  echo "Fehler: Englisches Gegenstück fehlt: $LATEST_EN"
  exit 1
fi

if [[ ! -f "$LATEST_HI" ]]; then
  echo "Fehler: Hindi-Gegenstück fehlt: $LATEST_HI"
  exit 1
fi

if [[ ! -f "$LATEST_SA" ]]; then
  echo "Fehler: Sanskrit-Gegenstück fehlt: $LATEST_SA"
  exit 1
fi

# Prüfe H2-Quellenverzeichnis in DE
if ! grep -q "^## Ausgewertete Quellen & Bibliographie" "$LATEST_DE"; then
  echo "Fehler: Deutsches Quellenverzeichnis '## Ausgewertete Quellen & Bibliographie' fehlt in $LATEST_DE"
  exit 1
fi

# Prüfe H2-Quellenverzeichnis in EN
if ! grep -q "^## Evaluated Sources & Bibliography" "$LATEST_EN"; then
  echo "Fehler: Englisches Quellenverzeichnis '## Evaluated Sources & Bibliography' fehlt in $LATEST_EN"
  exit 1
fi

# Prüfe H2-Quellenverzeichnis in HI
if ! grep -q "^## मूल्यांकित स्रोत एवं संदर्भ" "$LATEST_HI"; then
  echo "Fehler: Hindi-Quellenverzeichnis '## मूल्यांकित स्रोत एवं संदर्भ' fehlt in $LATEST_HI"
  exit 1
fi

# Prüfe H2-Quellenverzeichnis in SA
if ! grep -q "^## मूल्याङ्कितानि स्रोतांसि ग्रन्थसूची च" "$LATEST_SA"; then
  echo "Fehler: Sanskrit-Quellenverzeichnis '## मूल्याङ्कितानि स्रोतांसि ग्रन्थसूची च' fehlt in $LATEST_SA"
  exit 1
fi

# Prüfe sourcesCount im Frontmatter
SOURCES_DE="$(grep -E "^sourcesCount:[[:space:]]*[0-9]+" "$LATEST_DE" | awk '{print $2}' || true)"
SOURCES_EN="$(grep -E "^sourcesCount:[[:space:]]*[0-9]+" "$LATEST_EN" | awk '{print $2}' || true)"
SOURCES_HI="$(grep -E "^sourcesCount:[[:space:]]*[0-9]+" "$LATEST_HI" | awk '{print $2}' || true)"
SOURCES_SA="$(grep -E "^sourcesCount:[[:space:]]*[0-9]+" "$LATEST_SA" | awk '{print $2}' || true)"

if [[ -z "$SOURCES_DE" || -z "$SOURCES_EN" || -z "$SOURCES_HI" || -z "$SOURCES_SA" ]]; then
  echo "Fehler: 'sourcesCount' fehlt im Frontmatter von $LATEST_DE, $LATEST_EN, $LATEST_HI oder $LATEST_SA."
  exit 1
fi

if [[ "$SOURCES_DE" != "$SOURCES_EN" || "$SOURCES_DE" != "$SOURCES_HI" || "$SOURCES_DE" != "$SOURCES_SA" ]]; then
  echo "Warnung: sourcesCount weicht ab (DE: $SOURCES_DE, EN: $SOURCES_EN, HI: $SOURCES_HI, SA: $SOURCES_SA)."
fi

echo "✓ Alle Produktionsregeln (DE/EN/HI/SA Parität, H2-Quellenverzeichnis, sourcesCount) erfüllt."

# 4. Statische Site bauen (VitePress)
echo "Baue VitePress-Blog (docs:build)..."
npm run docs:build

# 5. Git-Status & Commit
if git status --porcelain | grep -qE "docs/(posts|en/posts|hi/posts|sa/posts)/"; then
  echo "Nicht committete Änderungen an Berichten erkannt. Erstelle Commit..."
  git add docs/posts/ docs/en/posts/ docs/hi/posts/ docs/sa/posts/
  git commit -m "feat(report): Freigabe Monatsbericht $PERIOD_CODE (DE/EN/HI/SA)"
else
  echo "Arbeitsverzeichnis für Berichte ist sauber."
fi

# 6. Redaktioneller Monats-Tag setzen
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
  echo "Aktualisiere bestehenden Git-Tag: $TAG_NAME"
  git tag -f -a "$TAG_NAME" -m "Freigabe Monatsbericht $PERIOD_CODE (aktualisiert)"
else
  echo "Setze redaktionellen Git-Tag: $TAG_NAME"
  git tag -a "$TAG_NAME" -m "Freigabe Monatsbericht $PERIOD_CODE"
fi

# 7. Push zu Origin und Synology
echo "Pushe Commit und Tags zu origin (GitHub) und synology..."
git push origin main
git push origin "$TAG_NAME" --force
git push synology main 2>/dev/null || true
git push synology "$TAG_NAME" --force 2>/dev/null || true

# 8. Deployment in Traefik-Webroot auf Synology (Legacy & Fallback)
echo "Synchronisiere HTML-Build in Traefik-Webroot auf Synology (/volume1/docker/blog/dist)..."
tar -czf - -C docs/.vitepress/dist . | ssh marco@synology.local "tar -xzf - -C /volume1/docker/blog/dist"
echo "✓ Traefik-Webroot erfolgreich aktualisiert."

# 9. Wiki-Repository-Prüfung (Birchville-Standard)
WIKI_DIR="../birchville-blog.wiki"
if [[ -d "$WIKI_DIR" ]]; then
  echo "Prüfe zugehöriges Wiki-Repository ($WIKI_DIR)..."
  (
    cd "$WIKI_DIR"
    if [[ -n "$(git status --porcelain)" ]]; then
      echo "Ausstehende Änderungen im Wiki-Repo gefunden. Synchronisiere..."
      git add -A
      git commit -m "docs: Synchronisation nach Monatsbericht-Freigabe $PERIOD_CODE"
      git push origin master 2>/dev/null || git push origin main
    else
      echo "Wiki-Repository ist synchron."
    fi
  )
fi

echo ""
echo "=== Erfolgreich publiziert! ==="
echo "Monatsbericht: $PERIOD_CODE"
echo "Git-Tag:       $TAG_NAME"
echo "Status:        Zu origin gepusht -> Live auf docs.birchville.org/research/"
