/**
 * iastTransliterator.js
 * Deterministic Devanāgarī -> IAST transliteration for Sanskrit (1:1)
 * and Stage-1 Client-Hybrid (Lexicon + Morpheme Segmentation + Ohala Schwa Deletion) for Hindi.
 */

const VOWELS = {
  अ: 'a',
  आ: 'ā',
  इ: 'i',
  ई: 'ī',
  उ: 'u',
  ऊ: 'ū',
  ऋ: 'ṛ',
  ॠ: 'ṝ',
  ऌ: 'ḷ',
  ॡ: 'ḹ',
  ए: 'e',
  ऐ: 'ai',
  ओ: 'o',
  औ: 'au',
  ऍ: 'ê',
  ऑ: 'ô',
  ऎ: 'e',
  ऒ: 'o',
}

const MATRAS = {
  'ा': 'ā',
  'ि': 'i',
  'ी': 'ī',
  'ु': 'u',
  'ू': 'ū',
  'ृ': 'ṛ',
  'ॄ': 'ṝ',
  'ॢ': 'ḷ',
  'ॣ': 'ḹ',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au',
  'ॅ': 'ê',
  'ॉ': 'ô',
  'ॆ': 'e',
  'ॊ': 'o',
}

const CONSONANTS = {
  क: 'k',
  ख: 'kh',
  ग: 'g',
  घ: 'gh',
  ङ: 'ṅ',
  च: 'c',
  छ: 'ch',
  ज: 'j',
  झ: 'jh',
  ञ: 'ñ',
  ट: 'ṭ',
  ठ: 'ṭh',
  ड: 'ḍ',
  ढ: 'ḍh',
  ण: 'ṇ',
  त: 't',
  थ: 'th',
  द: 'd',
  ध: 'dh',
  न: 'n',
  प: 'p',
  फ: 'ph',
  ब: 'b',
  भ: 'bh',
  म: 'm',
  य: 'y',
  र: 'r',
  ल: 'l',
  व: 'v',
  श: 'ś',
  ष: 'ṣ',
  स: 's',
  ह: 'h',
  ळ: 'ḷ',
}

const NUKTA_COMBINE = {
  क: 'q',
  ख: 'ḵh',
  ग: 'ġ',
  ज: 'z',
  ड: 'ṛ',
  ढ: 'ṛh',
  फ: 'f',
  य: 'ẏ',
  न: 'ṉ',
  र: 'ṟ',
  ळ: 'ḻ',
}

const CODA_MARKS = {
  'ं': 'ṃ',
  'ः': 'ḥ',
  'ँ': 'm̐',
}

const DIGITS = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
}

const VIRAMA = '्'
const NUKTA = '\u093C'

/**
 * Curated Hindi exception lexicon (only entries where standard morpheme + Ohala rules diverge).
 */
export const HINDI_LEXICON = new Map([
  ['असमर्थ', 'asamarth'],
  ['अध्ययनों', 'adhyayanoṃ'],
  ['अवलोकन', 'avlokan'],
  ['उत्खनन', 'utkhanan'],
  ['उपमहाद्वीप', 'upmahādvīp'],
  ['कालक्रम', 'kālkram'],
  ['पांडुलिपि', 'pāṇḍulipi'],
  ['पांडुलिपियों', 'pāṇḍulipiyoṃ'],
  ['पांडुलिपियां', 'pāṇḍulipiyāṃ'],
  ['पुराजिनविज्ञान', 'purājinavijñān'],
  ['भारतीय', 'bhāratīya'],
  ['मोहनजोदड़ो', 'mohanjodaṛo'],
  ['यवनों', 'yavanoṃ'],
  ['यहाँ', 'yahāṃ'],
  ['वहाँ', 'vahāṃ'],
  ['जहाँ', 'jahāṃ'],
  ['कहाँ', 'kahāṃ'],
  ['राखीगढ़ी', 'rākhīgaṛhī'],
  ['सिद्धान्त', 'siddhānt'],
])

const HI_PREFIXES = [
  'पुनर्',
  'अंतर',
  'अन्तर्',
  'प्रति',
  'पुरा',
  'महा',
  'परि',
  'अति',
  'अधि',
  'अभि',
  'बहु',
  'स्व',
]

const HI_SUFFIXES = [
  'विज्ञान',
  'शास्त्र',
  'कालीन',
  'पूर्वक',
  'अनुसार',
  'करण',
  'वादी',
  'कारी',
  'वाला',
  'वाली',
  'वाले',
  'पन',
  'ता',
  'ना',
  'ने',
  'नी',
]

function readConsonant(chars, idx) {
  const ch = chars[idx]
  if (chars[idx + 1] === NUKTA && NUKTA_COMBINE[ch]) {
    return { roman: NUKTA_COMBINE[ch], nextIdx: idx + 2 }
  }
  if (CONSONANTS[ch]) {
    return { roman: CONSONANTS[ch], nextIdx: idx + 1 }
  }
  return null
}

/**
 * Tokenize a Devanāgarī word into phonological akshara / syllable units.
 */
function tokenizeAksharas(word) {
  const chars = Array.from(word.normalize('NFD'))
  const units = []
  let i = 0

  while (i < chars.length) {
    const ch = chars[i]

    if (ch === '\u200C' || ch === '\u200D') {
      i++
      continue
    }

    if (ch === 'ॐ') {
      units.push({ type: 'literal', text: 'oṃ', vowel: 'o', coda: 'ṃ', isCluster: false, hasInherentSchwa: false })
      i++
      continue
    }

    if (ch === 'ऽ') {
      units.push({ type: 'literal', text: "'", vowel: '', coda: '', isCluster: false, hasInherentSchwa: false })
      i++
      continue
    }

    if (DIGITS[ch]) {
      units.push({ type: 'literal', text: DIGITS[ch], vowel: '', coda: '', isCluster: false, hasInherentSchwa: false })
      i++
      continue
    }

    if (VOWELS[ch]) {
      let vowel = VOWELS[ch]
      let coda = ''
      i++
      // Skip optional nukta on vowels if present
      if (chars[i] === NUKTA) i++
      if (CODA_MARKS[chars[i]]) {
        coda = CODA_MARKS[chars[i]]
        i++
      }
      units.push({ type: 'V', onset: [], isCluster: false, vowel, coda, hasInherentSchwa: false })
      continue
    }

    const firstC = readConsonant(chars, i)
    if (firstC) {
      const onset = [firstC.roman]
      i = firstC.nextIdx
      let explicitVirama = false

      while (chars[i] === VIRAMA) {
        // Peek after virāma (skipping optional ZWNJ/ZWJ)
        let look = i + 1
        while (chars[look] === '\u200C' || chars[look] === '\u200D') look++
        const nextC = readConsonant(chars, look)
        if (nextC) {
          onset.push(nextC.roman)
          i = nextC.nextIdx
        } else {
          explicitVirama = true
          i++
          break
        }
      }

      let vowel = ''
      let hasInherentSchwa = false
      if (!explicitVirama) {
        if (MATRAS[chars[i]]) {
          vowel = MATRAS[chars[i]]
          i++
        } else {
          vowel = 'a'
          hasInherentSchwa = true
        }
      }

      let coda = ''
      while (CODA_MARKS[chars[i]]) {
        coda += CODA_MARKS[chars[i]]
        i++
      }

      units.push({
        type: 'C',
        onset,
        isCluster: onset.length > 1,
        vowel,
        explicitVirama,
        coda,
        hasInherentSchwa,
      })
      continue
    }

    if (CODA_MARKS[ch]) {
      if (units.length > 0) {
        units[units.length - 1].coda += CODA_MARKS[ch]
      } else {
        units.push({ type: 'literal', text: CODA_MARKS[ch], vowel: '', coda: '', isCluster: false, hasInherentSchwa: false })
      }
      i++
      continue
    }

    if (MATRAS[ch]) {
      units.push({ type: 'literal', text: MATRAS[ch], vowel: MATRAS[ch], coda: '', isCluster: false, hasInherentSchwa: false })
      i++
      continue
    }

    // Fallback for any unhandled character inside Devanāgarī block
    units.push({ type: 'literal', text: ch, vowel: '', coda: '', isCluster: false, hasInherentSchwa: false })
    i++
  }

  return units
}

function renderUnits(units) {
  let out = ''
  for (const u of units) {
    if (u.type === 'literal') {
      out += u.text
    } else if (u.type === 'V') {
      out += u.vowel + u.coda
    } else {
      out += u.onset.join('') + u.vowel + u.coda
    }
  }
  return out
}

/**
 * Apply Ohala schwa-deletion rules to a single Hindi morpheme's akshara list.
 */
function applyHindiSchwaRules(units) {
  const n = units.length
  if (n === 0) return ''

  // Step 1: Word/morpheme-final inherent schwa deletion
  const last = units[n - 1]
  if (n > 1 && last.type === 'C' && last.hasInherentSchwa && !last.coda) {
    const prev = units[n - 2]
    const isIyaEnding =
      last.onset.length === 1 &&
      last.onset[0] === 'y' &&
      (prev.vowel === 'i' || prev.vowel === 'ī' || prev.vowel === 'u' || prev.vowel === 'ū')
    const isRephaFinalDrop =
      last.onset.length === 2 && last.onset[0] === 'r' && last.onset[1] !== 'v'
    if ((!last.isCluster || isRephaFinalDrop) && !isIyaEnding) {
      last.vowel = ''
    }
  }

  // Step 2: Medial schwa deletion (right-to-left, Ohala VCaCV context)
  for (let i = n - 2; i >= 1; i--) {
    const cur = units[i]
    const prev = units[i - 1]
    const next = units[i + 1]

    if (cur.type !== 'C' || !cur.hasInherentSchwa || cur.isCluster || cur.coda) {
      continue
    }

    const prevEndsInVowel = prev && prev.vowel !== '' && !prev.coda
    const nextHasVowel = next && next.vowel !== ''
    const nextIsCluster = next && next.isCluster
    const glideAfterHighVowel =
      (cur.onset[0] === 'y' || cur.onset[0] === 'v') &&
      (prev.vowel === 'i' || prev.vowel === 'ī' || prev.vowel === 'u' || prev.vowel === 'ū')

    if (prevEndsInVowel && nextHasVowel && !nextIsCluster && !glideAfterHighVowel) {
      cur.vowel = ''
    }
  }

  return renderUnits(units)
}

function transliterateHindiMorpheme(morpheme) {
  if (HINDI_LEXICON.has(morpheme)) {
    return HINDI_LEXICON.get(morpheme)
  }
  return applyHindiSchwaRules(tokenizeAksharas(morpheme))
}

/**
 * Transliterate a Hindi word using Stage-1 Client-Hybrid:
 * 1. Direct lookup in HINDI_LEXICON
 * 2. Productive prefix / suffix morpheme segmentation
 * 3. Ohala schwa-deletion rule fallback per morpheme
 */
function transliterateHindiWord(word) {
  if (HINDI_LEXICON.has(word)) {
    return HINDI_LEXICON.get(word)
  }

  let stem = word
  let prefixOut = ''
  let suffixOut = ''

  // Check productive prefixes (only on true akshara boundaries, never before combining marks)
  for (const pre of HI_PREFIXES) {
    if (stem.startsWith(pre) && stem.length > pre.length) {
      const rest = stem.slice(pre.length)
      const boundaryChar = rest[0]
      if (
        MATRAS[boundaryChar] ||
        boundaryChar === VIRAMA ||
        boundaryChar === NUKTA ||
        CODA_MARKS[boundaryChar]
      ) {
        continue
      }
      if (tokenizeAksharas(rest).length >= 2) {
        prefixOut = renderUnits(tokenizeAksharas(pre))
        stem = rest
        break
      }
    }
  }

  // Check productive suffixes (never split across an open virāma cluster)
  for (const suf of HI_SUFFIXES) {
    if (stem.endsWith(suf) && stem.length > suf.length) {
      const base = stem.slice(0, stem.length - suf.length)
      if (base.endsWith(VIRAMA)) continue
      if (tokenizeAksharas(base).length >= 2) {
        suffixOut = transliterateHindiMorpheme(suf)
        stem = base
        break
      }
    }
  }

  const stemOut = transliterateHindiMorpheme(stem)
  return prefixOut + stemOut + suffixOut
}

/**
 * Transliterate a single Devanāgarī word to IAST.
 * @param {string} word Devanāgarī word
 * @param {'sa' | 'hi'} lang Target language mode ('sa' = 1:1 Sanskrit, 'hi' = Hindi Client-Hybrid)
 * @returns {string} IAST string
 */
export function transliterateDevanagariToIast(word, lang = 'sa') {
  if (!word) return ''
  const normalized = word.normalize('NFD')
  if (lang === 'hi') {
    return transliterateHindiWord(normalized)
  }
  return renderUnits(tokenizeAksharas(normalized))
}

const DEVANAGARI_WORD_RE =
  /[\u0900-\u0963\u0966-\u097F]+(?:[\u200C\u200D][\u0900-\u0963\u0966-\u097F]+)*/g

/**
 * Transliterate all Devanāgarī words inside arbitrary text to IAST,
 * preserving whitespace, punctuation, Latin text, and daṇḍas.
 * @param {string} text Input text
 * @param {'sa' | 'hi'} lang Target language mode ('sa' = 1:1 Sanskrit, 'hi' = Hindi Client-Hybrid)
 * @returns {string} Transliterated text
 */
export function transliterateDevanagariText(text, lang = 'sa') {
  if (!text) return ''
  return text.replace(DEVANAGARI_WORD_RE, (word) =>
    transliterateDevanagariToIast(word, lang)
  )
}

const DEVANAGARI_TEST_RE = /[\u0900-\u0963\u0966-\u097F]/

export function containsDevanagari(text) {
  return DEVANAGARI_TEST_RE.test(text)
}
