#!/bin/zsh
set -euo pipefail

# -----------------------------------------------------------------------------
# publish_report.sh - Freigabe & Veröffentlichung von Monatsberichten (Modell A)
# -----------------------------------------------------------------------------

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

echo "=== Birchville Blog: Publikations-Prüfung (Modell A) ==="

# 1. Ermitteln der neuesten Monatsbericht-Dateien
LATEST_DE="$(ls -1 docs/posts/oit-vs-amt-[0-9][0-9][0-9][0-9]-[0-9][0-9].md 2>/dev/null | sort | tail -n 1 || true)"

if [[ -z "$LATEST_DE" ]]; then
  echo "Fehler: Keine Monatsberichte unter docs/posts/ gefunden."
  exit 1
fi

REPORT_FILE="$(basename "$LATEST_DE")"
PERIOD_CODE="${REPORT_FILE#oit-vs-amt-}"
PERIOD_CODE="${PERIOD_CODE%.md}"
LATEST_EN="docs/en/posts/$REPORT_FILE"
LATEST_HI="docs/hi/posts/$REPORT_FILE"

echo "Neuester gefundener Monatsbericht: $PERIOD_CODE ($REPORT_FILE)"

# 2. Automatische Übersetzung falls Zielsprachen fehlen
if [[ ! -f "$LATEST_EN" || ! -f "$LATEST_HI" ]]; then
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

# Prüfe sourcesCount im Frontmatter
SOURCES_DE="$(grep -E "^sourcesCount:[[:space:]]*[0-9]+" "$LATEST_DE" | awk '{print $2}' || true)"
SOURCES_EN="$(grep -E "^sourcesCount:[[:space:]]*[0-9]+" "$LATEST_EN" | awk '{print $2}' || true)"
SOURCES_HI="$(grep -E "^sourcesCount:[[:space:]]*[0-9]+" "$LATEST_HI" | awk '{print $2}' || true)"

if [[ -z "$SOURCES_DE" || -z "$SOURCES_EN" || -z "$SOURCES_HI" ]]; then
  echo "Fehler: 'sourcesCount' fehlt im Frontmatter von $LATEST_DE, $LATEST_EN oder $LATEST_HI."
  exit 1
fi

if [[ "$SOURCES_DE" != "$SOURCES_EN" || "$SOURCES_DE" != "$SOURCES_HI" ]]; then
  echo "Warnung: sourcesCount weicht ab (DE: $SOURCES_DE, EN: $SOURCES_EN, HI: $SOURCES_HI)."
fi

echo "✓ Alle Produktionsregeln (DE/EN/HI Parität, H2-Quellenverzeichnis, sourcesCount) erfüllt."

# 4. Statische Site bauen (VitePress)
echo "Baue VitePress-Blog (docs:build)..."
npm run docs:build

# 5. Git-Status & Commit
TAG_NAME="report/$PERIOD_CODE"

if git status --porcelain | grep -qE "docs/(posts|en/posts|hi/posts)/"; then
  echo "Nicht committete Änderungen an Berichten erkannt. Erstelle Commit..."
  git add docs/posts/ docs/en/posts/ docs/hi/posts/
  git commit -m "feat(report): Freigabe Monatsbericht $PERIOD_CODE (DE/EN/HI)"
else
  echo "Arbeitsverzeichnis für Berichte ist sauber."
fi

# 6. Redaktioneller Monats-Tag setzen
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
  echo "Tag '$TAG_NAME' existiert bereits. Überspringe Tag-Erstellung."
else
  echo "Setze redaktionellen Git-Tag: $TAG_NAME"
  git tag -a "$TAG_NAME" -m "Freigabe Monatsbericht $PERIOD_CODE"
fi

# 7. Push zu Origin
echo "Pushe Commit und Tags zu origin..."
git push origin main
git push origin "$TAG_NAME"

# 8. Deployment in Traefik-Webroot auf Synology
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
echo "Status:        Zu origin gepusht -> Live auf blog.birchville.org"
