#!/usr/bin/env node
/**
 * sync-drive.mjs
 * Spiegelt versionierte Serien-Prompts (prompts/<id>.md) und
 * DE-Zeitleisten (docs/public/data/<id>-timeline.json) aus dem Repo
 * in die jeweiligen Google-Drive-Projektordner gemäß prompts/series.json.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const seriesConfigPath = path.join(ROOT_DIR, 'prompts/series.json')
if (!fs.existsSync(seriesConfigPath)) {
  console.error(`Fehler: Registry nicht gefunden: ${seriesConfigPath}`)
  process.exit(1)
}

const config = JSON.parse(fs.readFileSync(seriesConfigPath, 'utf-8'))

function syncFile(srcAbs, dstAbs) {
  if (!fs.existsSync(srcAbs)) {
    console.error(`  ❌ Quelle fehlt: ${srcAbs}`)
    return 'missing'
  }
  const srcBuf = fs.readFileSync(srcAbs)
  if (fs.existsSync(dstAbs) && fs.readFileSync(dstAbs).equals(srcBuf)) {
    return 'unchanged'
  }
  fs.copyFileSync(srcAbs, dstAbs)
  return 'updated'
}

console.log('=== Birchville Research: Drive-Spiegel-Synchronisation ===')

let hasErrors = false
for (const entry of config.series || []) {
  if (!fs.existsSync(entry.drive_dir)) {
    console.log(`- [${entry.id}] Google-Drive-Ordner nicht gemountet -> übersprungen (${entry.drive_dir})`)
    continue
  }

  const promptSrc = path.join(ROOT_DIR, entry.prompt_file)
  const promptDst = path.join(entry.drive_dir, entry.drive_prompt_mirror)
  const tlSrc = path.join(ROOT_DIR, `docs/public/data/${entry.blog_timeline_prefix}-timeline.json`)
  const tlDst = path.join(entry.drive_dir, entry.drive_timeline_json)

  const promptState = syncFile(promptSrc, promptDst)
  const tlState = syncFile(tlSrc, tlDst)

  if (promptState === 'missing' || tlState === 'missing') {
    hasErrors = true
  }
  console.log(`- [${entry.id}] Prompt: ${promptState} | Timeline-JSON: ${tlState}`)
}

if (hasErrors) {
  process.exit(1)
}
console.log('✓ Drive-Synchronisation abgeschlossen.\n')
