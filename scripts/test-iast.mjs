#!/usr/bin/env node
/**
 * test-iast.mjs
 * Automated regression suite for Sanskrit 1:1 and Hindi Stage-1 Client-Hybrid IAST transliteration,
 * including a corpus invariant check across all Hindi content files.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  transliterateDevanagariToIast,
  containsDevanagari,
} from '../docs/.vitepress/theme/iastTransliterator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')

// 1. Sanskrit 1:1 exact mapping tests
const sanskritCases = [
  ['संस्कृतम्', 'saṃskṛtam'],
  ['सिन्धु', 'sindhu'],
  ['भारतम्', 'bhāratam'],
  ['अन्वेषणम्', 'anveṣaṇam'],
  ['सङ्ग्रहः', 'saṅgrahaḥ'],
  ['प्रथमः', 'prathamaḥ'],
  ['यवनाः', 'yavanāḥ'],
  ['खरोष्ठी', 'kharoṣṭhī'],
  ['२०२६', '2026'],
  ['ॐ', 'oṃ'],
]

for (const [input, expected] of sanskritCases) {
  assert.equal(
    transliterateDevanagariToIast(input, 'sa'),
    expected,
    `Sanskrit failed for ${input}`
  )
}

// 2. Hindi Stage-1 Client-Hybrid tests
const hindiCases = [
  // Basic schwa deletion & verb stems
  ['भारत', 'bhārat'],
  ['कमल', 'kamal'],
  ['करना', 'karnā'],
  ['समझना', 'samajhnā'],
  ['समझा', 'samjhā'],
  ['असमर्थ', 'asamarth'],

  // Nukta consonants
  ['हड़प्पा', 'haṛappā'],
  ['ग़ज़ल', 'ġazal'],
  ['क़ानून', 'qānūn'],
  ['खोजें', 'khojeṃ'],

  // Productive prefix/suffix boundary safety (no split across matras/virama)
  ['स्वात', 'svāt'],
  ['स्वागत', 'svāgat'],
  ['स्वामी', 'svāmī'],
  ['स्वीकृति', 'svīkṛti'],
  ['अनातोलिया', 'anātoliyā'],
  ['अनातोलियाई', 'anātoliyāī'],
  ['उपाधि', 'upādhi'],
  ['अंतराल', 'aṃtarāl'],
  ['शहरीकरण', 'śahrīkaraṇ'],

  // Final repha clusters (drop final 'a') vs other clusters (retain final 'a')
  ['रिपोर्ट', 'riporṭ'],
  ['संदर्भ', 'saṃdarbh'],
  ['संपर्क', 'saṃpark'],
  ['संपूर्ण', 'saṃpūrṇ'],
  ['वर्ष', 'varṣ'],
  ['अर्थ', 'arth'],
  ['पूर्व', 'pūrva'],
  ['शब्द', 'śabda'],
  ['क्षेत्र', 'kṣetra'],
  ['मध्य', 'madhya'],
  ['प्रश्न', 'praśna'],
  ['स्पष्ट', 'spaṣṭa'],
  ['बौद्ध', 'bauddha'],

  // Lexicon domain terms
  ['पुरातत्व', 'purātatva'],
  ['महत्वपूर्ण', 'mahatvapūrṇ'],
  ['पद्धतिगत', 'paddhatigat'],
  ['पुनर्निर्माण', 'punarnirmāṇ'],
  ['निरंतरता', 'niraṃtartā'],
]

for (const [input, expected] of hindiCases) {
  assert.equal(
    transliterateDevanagariToIast(input, 'hi'),
    expected,
    `Hindi failed for ${input}`
  )
}

assert.equal(containsDevanagari('Steppe_MLBA'), false)
assert.equal(containsDevanagari('सिंधु'), true)

// 3. Corpus invariant check across all Hindi markdown & timeline JSON files
function walk(dir) {
  if (!fs.existsSync(dir)) return []
  let out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out = out.concat(walk(full))
    else if (full.endsWith('.md') || full.endsWith('.hi.json')) out.push(full)
  }
  return out
}

const hiFiles = [
  ...walk(path.join(ROOT_DIR, 'docs', 'hi')),
  ...walk(path.join(ROOT_DIR, 'docs', 'public', 'data')).filter((f) => f.endsWith('.hi.json')),
]
const DEV_WORD_RX =
  /[\u0900-\u0963\u0966-\u097F]+(?:[\u200C\u200D][\u0900-\u0963\u0966-\u097F]+)*/g
const BROKEN_SPLIT_RX = /sva[āī]|anaā|upaā|aṃtaraā/

let uniqueCount = 0
const broken = []
const seen = new Set()

for (const file of hiFiles) {
  const txt = fs.readFileSync(file, 'utf8')
  for (const m of txt.matchAll(DEV_WORD_RX)) {
    const w = m[0]
    if (seen.has(w)) continue
    seen.add(w)
    uniqueCount++
    const iast = transliterateDevanagariToIast(w, 'hi')
    assert.ok(iast.length > 0, `Empty IAST output for ${w}`)
    if (BROKEN_SPLIT_RX.test(iast)) {
      broken.push(`${w} -> ${iast}`)
    }
  }
}

assert.equal(
  broken.length,
  0,
  `Broken prefix-split outputs found in Hindi corpus:\n${broken.join('\n')}`
)

console.log('=== Birchville Research IAST Transliteration Tests ===')
console.log(`Sanskrit assertions: ${sanskritCases.length}`)
console.log(`Hindi assertions:    ${hindiCases.length}`)
console.log(`Hindi corpus words:  ${uniqueCount} unique tokens across ${hiFiles.length} files`)
console.log('✓ All IAST transliteration and corpus boundary checks passed.')
