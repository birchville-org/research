#!/usr/bin/env node
/**
 * check-links.mjs
 * Validiert die Integrität und Konsistenz aller internen Links, Assets,
 * Anker und Base-Pfade im erzeugten VitePress-Dist-Verzeichnis.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const DIST_DIR = path.resolve(ROOT_DIR, 'docs/.vitepress/dist')
const BASE_PATH = '/research/'

if (!fs.existsSync(DIST_DIR)) {
  console.error(`Fehler: Build-Verzeichnis existiert nicht: ${DIST_DIR}`)
  console.error('Bitte zuerst "npm run docs:build" ausführen.')
  process.exit(1)
}

function getAllFiles(dir, ext = '.html') {
  let results = []
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext))
    } else if (file.endsWith(ext)) {
      results.push(fullPath)
    }
  }
  return results
}

const htmlFiles = getAllFiles(DIST_DIR, '.html')
const allDistFiles = new Set(
  getAllFiles(DIST_DIR, '')
    .map((f) => path.relative(DIST_DIR, f).replace(/\\/g, '/'))
)

// Erfasse alle definierten IDs in den HTML-Dateien für Anchor-Prüfungen
const fileIds = new Map()

const ID_REGEX = /(?:id|name)=["']([^"']+)["']/gi

for (const filePath of htmlFiles) {
  const relPath = path.relative(DIST_DIR, filePath).replace(/\\/g, '/')
  const content = fs.readFileSync(filePath, 'utf-8')
  const ids = new Set()
  let match
  while ((match = ID_REGEX.exec(content)) !== null) {
    ids.add(match[1])
  }
  fileIds.set(relPath, ids)
}

let totalLinksChecked = 0
const errors = []

// Regex zum Extrahieren von Links & Asset-Referenzen
const LINK_REGEX = /<(?:a|link|img|script)\s+[^>]*?(?:href|src)=["']([^"']+)["'][^>]*?>/gi

function fileExistsInDist(relTarget) {
  // 1. Exakter Treffer (z.B. assets/..., favicon.png, data/...)
  if (allDistFiles.has(relTarget)) return relTarget

  // 2. Clean-URL: Pfad + .html (z.B. stand-der-forschung/yavanas -> stand-der-forschung/yavanas.html)
  if (allDistFiles.has(relTarget + '.html')) return relTarget + '.html'

  // 3. Verzeichnis mit index.html (z.B. stand-der-forschung/ -> stand-der-forschung/index.html)
  const normalized = relTarget.replace(/\/$/, '')
  if (allDistFiles.has(normalized + '/index.html')) return normalized + '/index.html'

  return null
}

for (const filePath of htmlFiles) {
  const currentRelPath = path.relative(DIST_DIR, filePath).replace(/\\/g, '/')
  const currentDir = path.dirname(currentRelPath)
  const content = fs.readFileSync(filePath, 'utf-8')

  let match
  while ((match = LINK_REGEX.exec(content)) !== null) {
    const rawUrl = match[1].trim()

    // Ignoriere leere, externe oder Pseudoprotokolle
    if (
      !rawUrl ||
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('//') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('tel:') ||
      rawUrl.startsWith('javascript:') ||
      rawUrl.startsWith('data:')
    ) {
      continue
    }

    totalLinksChecked++

    // Zerlege in Pfad und Hash
    const [pathPart, hashPart] = rawUrl.split('#')

    // 1. Reiner In-Page-Anchor (#section)
    if (!pathPart) {
      if (hashPart) {
        const ids = fileIds.get(currentRelPath) || new Set()
        if (!ids.has(hashPart)) {
          errors.push({
            file: currentRelPath,
            url: rawUrl,
            reason: `In-Page-Anker '#${hashPart}' existiert nicht in dieser Seite.`,
          })
        }
      }
      continue
    }

    // 2. Prüfung auf vergessene Root-Pfade ohne Base (z.B. href="/stand-der-forschung/...")
    if (pathPart.startsWith('/') && !pathPart.startsWith(BASE_PATH)) {
      // Ausnahme: Root-Dateien wie /favicon-32x32.png oder Feed, falls separat
      const relCandidate = pathPart.replace(/^\//, '')
      if (!allDistFiles.has(relCandidate) && !allDistFiles.has(relCandidate + '.html')) {
        errors.push({
          file: currentRelPath,
          url: rawUrl,
          reason: `Wurzel-Pfad fehlt das Projekt-Präfix '${BASE_PATH}'. Sollte '${BASE_PATH}${relCandidate}' oder relativ sein.`,
        })
        continue
      }
    }

    // 3. Ziel-Pfad auflösen
    let resolvedDistPath = ''
    if (pathPart.startsWith(BASE_PATH)) {
      resolvedDistPath = pathPart.slice(BASE_PATH.length)
    } else if (pathPart.startsWith('/')) {
      resolvedDistPath = pathPart.slice(1)
    } else {
      // Relativer Pfad
      resolvedDistPath = path.posix.normalize(path.posix.join(currentDir, pathPart))
    }

    // Entferne evtl. Query-Strings
    resolvedDistPath = resolvedDistPath.split('?')[0]

    // Leerer Pfad entspricht Wurzel index.html
    if (!resolvedDistPath || resolvedDistPath === '.') {
      resolvedDistPath = 'index.html'
    }

    const matchedFile = fileExistsInDist(resolvedDistPath)
    if (!matchedFile) {
      errors.push({
        file: currentRelPath,
        url: rawUrl,
        reason: `Zieldatei existiert nicht im Dist-Ordner (aufgelöst: '${resolvedDistPath}').`,
      })
      continue
    }

    // 4. Anchor im externen Ziel prüfen (falls vorhanden)
    if (hashPart && matchedFile.endsWith('.html')) {
      const targetIds = fileIds.get(matchedFile) || new Set()
      if (!targetIds.has(hashPart)) {
        errors.push({
          file: currentRelPath,
          url: rawUrl,
          reason: `Anker '#${hashPart}' existiert nicht in Zieldatei '${matchedFile}'.`,
        })
      }
    }
  }
}

console.log('=== Birchville Research Link-Konsistenzprüfung ===')
console.log(`Gescannte HTML-Dateien: ${htmlFiles.length}`)
console.log(`Geprüfte Links & Assets: ${totalLinksChecked}`)

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} ungültige Verlinkung(en) gefunden:\n`)
  for (const err of errors) {
    console.error(`- Datei: ${err.file}`)
    console.error(`  URL:   ${err.url}`)
    console.error(`  Grund: ${err.reason}\n`)
  }
  process.exit(1)
} else {
  console.log('✓ Alle internen Links, Base-Pfade und Anker sind konsistent.\n')
  process.exit(0)
}
