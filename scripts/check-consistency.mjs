#!/usr/bin/env node
/**
 * check-consistency.mjs
 * Prüft Berichts-Parität (DE/EN/HI/SA), Quellenanzahl (sourcesCount vs. Bibliographie),
 * „Stand der Forschung“-Reporthistorie und Zeitleisten-Parität/-Aktualität.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const LOCALES = [
  {
    code: 'de',
    postsDir: 'docs/posts',
    dashboardDir: 'docs/stand-der-forschung',
    timelineSuffix: '',
    bibHeading: '## Ausgewertete Quellen & Bibliographie',
    months: {
      '01': ['Januar'],
      '02': ['Februar'],
      '03': ['März'],
      '04': ['April'],
      '05': ['Mai'],
      '06': ['Juni'],
      '07': ['Juli'],
      '08': ['August'],
      '09': ['September'],
      '10': ['Oktober'],
      '11': ['November'],
      '12': ['Dezember'],
    },
  },
  {
    code: 'en',
    postsDir: 'docs/en/posts',
    dashboardDir: 'docs/en/stand-der-forschung',
    timelineSuffix: '.en',
    bibHeading: '## Evaluated Sources & Bibliography',
    months: {
      '01': ['January'],
      '02': ['February'],
      '03': ['March'],
      '04': ['April'],
      '05': ['May'],
      '06': ['June'],
      '07': ['July'],
      '08': ['August'],
      '09': ['September'],
      '10': ['October'],
      '11': ['November'],
      '12': ['December'],
    },
  },
  {
    code: 'hi',
    postsDir: 'docs/hi/posts',
    dashboardDir: 'docs/hi/stand-der-forschung',
    timelineSuffix: '.hi',
    bibHeading: '## मूल्यांकित स्रोत एवं संदर्भ',
    months: {
      '01': ['जनवरी'],
      '02': ['फरवरी'],
      '03': ['मार्च'],
      '04': ['अप्रैल'],
      '05': ['मई'],
      '06': ['जून'],
      '07': ['जुलाई'],
      '08': ['अगस्त'],
      '09': ['सितंबर', 'सितम्बर'],
      '10': ['अक्टूबर'],
      '11': ['नवंबर', 'नवम्बर'],
      '12': ['दिसंबर', 'दिसम्बर'],
    },
  },
  {
    code: 'sa',
    postsDir: 'docs/sa/posts',
    dashboardDir: 'docs/sa/stand-der-forschung',
    timelineSuffix: '.sa',
    bibHeading: '## मूल्याङ्कितानि स्रोतांसि ग्रन्थसूची च',
    months: {
      '01': ['जनवरी'],
      '02': ['फरवरी'],
      '03': ['मार्च'],
      '04': ['अप्रैल'],
      '05': ['मई'],
      '06': ['जून'],
      '07': ['जुलै', 'जुलाई'],
      '08': ['अगस्त'],
      '09': ['सितम्बर', 'सितंबर'],
      '10': ['अक्टूबर'],
      '11': ['नवम्बर', 'नवंबर'],
      '12': ['दिसम्बर', 'दिसंबर'],
    },
  },
]

const errors = []

function addError(scope, message) {
  errors.push({ scope, message })
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractSection4(markdown) {
  const startMatch = markdown.match(/^## 4\.[^\n]*\n/m)
  if (!startMatch) return null
  const rest = markdown.slice(startMatch.index + startMatch[0].length)
  const nextHeadingIdx = rest.search(/^## /m)
  return nextHeadingIdx === -1 ? rest : rest.slice(0, nextHeadingIdx)
}

function parsePostMetadata(relPath, bibHeading) {
  const fullPath = path.join(ROOT_DIR, relPath)
  if (!fs.existsSync(fullPath)) {
    return { exists: false }
  }
  const content = fs.readFileSync(fullPath, 'utf-8')
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) {
    return { exists: true, sourcesCount: null, actualSources: null, hasHeading: false, hasFormFeed: false }
  }
  const scMatch = fmMatch[1].match(/^sourcesCount:\s*(\d+)/m)
  const sourcesCount = scMatch ? Number.parseInt(scMatch[1], 10) : null
  const dateMatch = fmMatch[1].match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)
  const postDate = dateMatch ? dateMatch[1] : null

  const headingRegex = new RegExp(`^${escapeRegExp(bibHeading)}\\s*$`, 'm')
  const headingMatch = headingRegex.exec(content)
  if (!headingMatch) {
    return { exists: true, sourcesCount, postDate, actualSources: null, hasHeading: false, hasFormFeed: false }
  }

  const bibSection = content.slice(headingMatch.index + headingMatch[0].length)
  const hasFormFeed = bibSection.includes('\x0c')
  const entries = bibSection.match(/^\d+\.\s+/gm) || []
  return {
    exists: true,
    sourcesCount,
    postDate,
    actualSources: entries.length,
    hasHeading: true,
    hasFormFeed,
  }
}

// 1. Alle publizierten Berichte aus docs/posts/ ermitteln
const rootPostsAbs = path.join(ROOT_DIR, 'docs/posts')
if (!fs.existsSync(rootPostsAbs)) {
  console.error('Fehler: Verzeichnis docs/posts existiert nicht.')
  process.exit(1)
}

const reportFiles = fs
  .readdirSync(rootPostsAbs)
  .filter((name) => /^([a-z0-9-]+)-(\d{4}-\d{2})\.md$/.test(name))
  .sort()

const seriesPeriods = new Map()
const seriesLatestDates = new Map()
let globalLatestDate = ''

for (const fileName of reportFiles) {
  const match = fileName.match(/^([a-z0-9-]+)-(\d{4})-(\d{2})\.md$/)
  const [, series, year, month] = match
  const period = `${year}-${month}`

  if (!seriesPeriods.has(series)) {
    seriesPeriods.set(series, [])
  }
  seriesPeriods.get(series).push({ fileName, period, year, month })

  const countsByLocale = new Map()
  for (const locale of LOCALES) {
    const relPath = `${locale.postsDir}/${fileName}`
    const meta = parsePostMetadata(relPath, locale.bibHeading)

    if (!meta.exists) {
      addError(relPath, 'Sprachvariante des Monatsberichts fehlt.')
      continue
    }
    if (locale.code === 'de' && meta.postDate) {
      if (meta.postDate > globalLatestDate) {
        globalLatestDate = meta.postDate
      }
      const prevSeriesDate = seriesLatestDates.get(series) || ''
      if (meta.postDate > prevSeriesDate) {
        seriesLatestDates.set(series, meta.postDate)
      }
    }
    if (meta.sourcesCount === null) {
      addError(relPath, "Frontmatter-Feld 'sourcesCount' fehlt oder ist ungültig.")
    } else {
      countsByLocale.set(locale.code, meta.sourcesCount)
    }
    if (!meta.hasHeading) {
      addError(relPath, `Verbindliches Quellenverzeichnis '${locale.bibHeading}' fehlt.`)
    } else {
      if (meta.hasFormFeed) {
        addError(relPath, 'Form-Feed-Steuerzeichen (\\x0c) im Quellenverzeichnis gefunden.')
      }
      if (meta.sourcesCount !== null && meta.actualSources !== meta.sourcesCount) {
        addError(
          relPath,
          `sourcesCount (${meta.sourcesCount}) weicht von nummerierten Quellen (${meta.actualSources}) ab.`
        )
      }
    }
  }

  const distinctCounts = new Set(countsByLocale.values())
  if (distinctCounts.size > 1) {
    const summary = [...countsByLocale.entries()].map(([k, v]) => `${k}:${v}`).join(', ')
    addError(fileName, `Abweichende sourcesCount-Werte über Sprachfassungen (${summary}).`)
  }
}

// 2. Prüfe „Stand der Forschung“-Reporthistorie und Zeitleisten pro Serie
for (const [series, entries] of seriesPeriods.entries()) {
  const periods = entries.map((e) => e.period).sort()
  const latestPeriod = periods[periods.length - 1]

  // 2a. Dashboard Historie (Abschnitt 4) in allen 4 Sprachen
  for (const locale of LOCALES) {
    const dashRel = `${locale.dashboardDir}/${series}.md`
    const dashAbs = path.join(ROOT_DIR, dashRel)
    if (!fs.existsSync(dashAbs)) {
      addError(dashRel, 'Dashboard-Datei fehlt.')
      continue
    }
    const dashContent = fs.readFileSync(dashAbs, 'utf-8')
    const section4 = extractSection4(dashContent)
    if (!section4) {
      addError(dashRel, 'Abschnitt 4 (Historie der Monats-Updates) fehlt.')
      continue
    }

    for (const { period, year, month } of entries) {
      const monthNames = locale.months[month] || []
      const found = monthNames.some((mName) => {
        const rx = new RegExp(`^[-*]\\s+\\*\\*${escapeRegExp(mName)}\\s+${year}\\*\\*:`, 'm')
        return rx.test(section4)
      })
      if (!found) {
        addError(
          dashRel,
          `Eintrag für Berichtsperiode ${period} (${monthNames.join('/')} ${year}) fehlt in Abschnitt 4.`
        )
      }
    }
  }

  // 2b. Zeitleisten-JSONs (docs/public/data/<series>-timeline*.json)
  const timelineMeta = []
  for (const locale of LOCALES) {
    const tlRel = `docs/public/data/${series}-timeline${locale.timelineSuffix}.json`
    const tlAbs = path.join(ROOT_DIR, tlRel)
    if (!fs.existsSync(tlAbs)) {
      addError(tlRel, 'Zeitleisten-JSON fehlt.')
      continue
    }
    let parsed
    try {
      parsed = JSON.parse(fs.readFileSync(tlAbs, 'utf-8'))
    } catch (err) {
      addError(tlRel, `Ungültiges JSON: ${err.message}`)
      continue
    }

    const events = Array.isArray(parsed.events) ? parsed.events : null
    if (!events) {
      addError(tlRel, "Feld 'events' ist kein Array.")
      continue
    }

    const hasLatest = events.some((e) => e.added_in_period === latestPeriod)
    if (!hasLatest) {
      addError(
        tlRel,
        `Aktuellste Berichtsperiode '${latestPeriod}' ist in keinem Event (added_in_period) vertreten.`
      )
    }

    timelineMeta.push({
      rel: tlRel,
      code: locale.code,
      lastUpdated: parsed.last_updated || '',
      ids: events.map((e) => e.id),
    })
  }

  if (timelineMeta.length > 1) {
    const base = timelineMeta[0]
    for (const item of timelineMeta.slice(1)) {
      if (item.lastUpdated !== base.lastUpdated) {
        addError(
          item.rel,
          `last_updated ('${item.lastUpdated}') weicht von ${base.rel} ('${base.lastUpdated}') ab.`
        )
      }
      if (item.ids.length !== base.ids.length || item.ids.some((id, idx) => id !== base.ids[idx])) {
        addError(
          item.rel,
          `Event-IDs/Reihenfolge weichen von ${base.rel} ab (${item.ids.length} vs. ${base.ids.length} Events).`
        )
      }
    }
  }
}

// 3. Prüfe prompts/series.json & Prompt-Skript-Vertrag sowie lokalen Google-Drive-Spiegel
const seriesJsonRel = 'prompts/series.json'
const seriesJsonAbs = path.join(ROOT_DIR, seriesJsonRel)
const sendMailAbs = path.join(ROOT_DIR, 'send_digest_mail.sh')
let driveSkippedCount = 0
let driveCheckedCount = 0

if (!fs.existsSync(seriesJsonAbs)) {
  addError(seriesJsonRel, 'Zentrale Serien-Registry prompts/series.json fehlt.')
} else {
  let registry
  try {
    registry = JSON.parse(fs.readFileSync(seriesJsonAbs, 'utf-8'))
  } catch (err) {
    addError(seriesJsonRel, `Ungültiges JSON: ${err.message}`)
    registry = null
  }

  let mailScriptRecipient = null
  if (fs.existsSync(sendMailAbs)) {
    const mailSh = fs.readFileSync(sendMailAbs, 'utf-8')
    const recMatch = mailSh.match(/^RECIPIENT="([^"]+)"/m)
    mailScriptRecipient = recMatch ? recMatch[1] : null
  } else {
    addError('send_digest_mail.sh', 'Mail-Versandskript fehlt.')
  }

  if (registry && Array.isArray(registry.series)) {
    const registeredIds = new Set(registry.series.map((s) => s.id))
    for (const discoveredSeries of seriesPeriods.keys()) {
      if (!registeredIds.has(discoveredSeries)) {
        addError(seriesJsonRel, `Publizierte Serie '${discoveredSeries}' fehlt in prompts/series.json.`)
      }
    }

    const expectedRecipient = registry.mail_recipient || mailScriptRecipient
    if (mailScriptRecipient && registry.mail_recipient && registry.mail_recipient !== mailScriptRecipient) {
      addError(
        seriesJsonRel,
        `mail_recipient ('${registry.mail_recipient}') weicht von send_digest_mail.sh ('${mailScriptRecipient}') ab.`
      )
    }

    for (const s of registry.series) {
      const promptAbs = path.join(ROOT_DIR, s.prompt_file)
      if (!fs.existsSync(promptAbs)) {
        addError(s.prompt_file, 'Versionierte Prompt-Datei fehlt.')
      } else {
        const promptText = fs.readFileSync(promptAbs, 'utf-8')
        const requiredTokens = [
          { token: 'send_digest_mail.sh', label: 'Mail-Skript send_digest_mail.sh' },
          { token: 'publish_report.sh', label: 'Publikationsskript publish_report.sh' },
          { token: 'npm run check:consistency', label: 'Konsistenz-Gate npm run check:consistency' },
          { token: `${s.blog_post_prefix}-YYYY-MM.md`, label: `Blog-Draft-Muster ${s.blog_post_prefix}-YYYY-MM.md` },
          { token: `stand-der-forschung/${s.dashboard_slug}.md`, label: `Dashboard-Pfad stand-der-forschung/${s.dashboard_slug}.md` },
          { token: `${s.blog_timeline_prefix}-timeline`, label: `Timeline-Prefix ${s.blog_timeline_prefix}-timeline` },
          { token: '.en.json', label: 'EN-Timeline-Sprachdatei (.en.json)' },
          { token: '.hi.json', label: 'HI-Timeline-Sprachdatei (.hi.json)' },
          { token: '.sa.json', label: 'SA-Timeline-Sprachdatei (.sa.json)' },
        ]
        if (expectedRecipient) {
          requiredTokens.push({ token: expectedRecipient, label: `Empfängeradresse ${expectedRecipient}` })
        }
        for (const req of requiredTokens) {
          if (!promptText.includes(req.token)) {
            addError(s.prompt_file, `Pflichtreferenz fehlt: ${req.label} ('${req.token}').`)
          }
        }
      }

      // 4. Lokaler Google-Drive-Spiegel-Abgleich (CI-sicher: nur wenn lokal gemountet)
      if (!s.drive_dir || !fs.existsSync(s.drive_dir)) {
        driveSkippedCount++
        continue
      }
      driveCheckedCount++

      const drivePromptAbs = path.join(s.drive_dir, s.drive_prompt_mirror)
      if (!fs.existsSync(drivePromptAbs)) {
        addError(drivePromptAbs, 'Drive-Spiegel der Prompt-Vorlage fehlt (npm run sync:drive ausführen).')
      } else if (fs.existsSync(promptAbs) && !fs.readFileSync(drivePromptAbs).equals(fs.readFileSync(promptAbs))) {
        addError(
          drivePromptAbs,
          `Weicht von ${s.prompt_file} ab (Abgleich mit 'npm run sync:drive' ausführen).`
        )
      }

      const tlRepoAbs = path.join(ROOT_DIR, `docs/public/data/${s.blog_timeline_prefix}-timeline.json`)
      const driveTlAbs = path.join(s.drive_dir, s.drive_timeline_json)
      if (!fs.existsSync(driveTlAbs)) {
        addError(driveTlAbs, 'Drive-Spiegel der Timeline-JSON fehlt (npm run sync:drive ausführen).')
      } else if (fs.existsSync(tlRepoAbs) && !fs.readFileSync(driveTlAbs).equals(fs.readFileSync(tlRepoAbs))) {
        addError(
          driveTlAbs,
          `Weicht von docs/public/data/${s.blog_timeline_prefix}-timeline.json ab (Abgleich mit 'npm run sync:drive' ausführen).`
        )
      }

      const driveLogAbs = path.join(s.drive_dir, 'processing_log.json')
      if (!fs.existsSync(driveLogAbs)) {
        addError(driveLogAbs, 'Verarbeitungsprotokoll processing_log.json fehlt in Google Drive.')
      } else {
        try {
          const logJson = JSON.parse(fs.readFileSync(driveLogAbs, 'utf-8'))
          const loggedPeriods = new Set((logJson.records || []).map((r) => r.period))
          for (const { period } of seriesPeriods.get(s.id) || []) {
            if (!loggedPeriods.has(period)) {
              addError(driveLogAbs, `Publizierte Periode '${period}' fehlt in processing_log.json.`)
            }
          }
        } catch (err) {
          addError(driveLogAbs, `Ungültiges JSON in processing_log.json: ${err.message}`)
        }
      }
    }
  }
}

// 5. Prüfe lastUpdated-Aktualität (Config-Hook & gerenderte HTML-Zeitstempel)
const vpConfigRel = 'docs/.vitepress/config.mjs'
const vpConfigAbs = path.join(ROOT_DIR, vpConfigRel)
if (!fs.existsSync(vpConfigAbs)) {
  addError(vpConfigRel, 'VitePress-Konfiguration fehlt.')
} else {
  const vpConfigText = fs.readFileSync(vpConfigAbs, 'utf-8')
  if (!vpConfigText.includes('transformPageData')) {
    addError(vpConfigRel, "Hook 'transformPageData' für dynamisches lastUpdated fehlt in config.mjs.")
  }
}

const distDir = path.join(ROOT_DIR, 'docs/.vitepress/dist')
let distCheckedCount = 0
if (fs.existsSync(distDir) && globalLatestDate) {
  const checkHtmlLastUpdated = (relHtmlPath, minDateStr, label) => {
    const htmlAbs = path.join(distDir, relHtmlPath)
    if (!fs.existsSync(htmlAbs)) {
      addError(`docs/.vitepress/dist/${relHtmlPath}`, `Gerenderte HTML-Datei für ${label} nicht gefunden.`)
      return
    }
    distCheckedCount++
    const htmlText = fs.readFileSync(htmlAbs, 'utf-8')
    const timeMatch = htmlText.match(/<time[^>]+datetime="([^"]+)"/)
    if (!timeMatch) {
      addError(`docs/.vitepress/dist/${relHtmlPath}`, `HTML-<time>-Element für lastUpdated fehlt (${label}).`)
      return
    }
    const actualMs = Date.parse(timeMatch[1])
    const minMs = Date.parse(`${minDateStr}T00:00:00Z`)
    if (Number.isNaN(actualMs) || actualMs < minMs) {
      const actualIso = Number.isNaN(actualMs) ? timeMatch[1] : new Date(actualMs).toISOString().slice(0, 10)
      addError(
        `docs/.vitepress/dist/${relHtmlPath}`,
        `lastUpdated (${actualIso}) liegt vor dem jüngsten Berichtsdatum ${minDateStr} (${label}).`
      )
    }
  }

  const aggregatorHtmlPages = [
    'index.html',
    'en/index.html',
    'hi/index.html',
    'sa/index.html',
    'archiv.html',
    'en/archiv.html',
    'hi/archiv.html',
    'sa/archiv.html',
    'stand-der-forschung/index.html',
    'en/stand-der-forschung/index.html',
    'hi/stand-der-forschung/index.html',
    'sa/stand-der-forschung/index.html',
  ]
  for (const relHtml of aggregatorHtmlPages) {
    checkHtmlLastUpdated(relHtml, globalLatestDate, `Übersichtsseite ${relHtml}`)
  }

  for (const [series, latestDate] of seriesLatestDates.entries()) {
    for (const locale of LOCALES) {
      const relHtml =
        locale.code === 'de'
          ? `stand-der-forschung/${series}.html`
          : `${locale.code}/stand-der-forschung/${series}.html`
      checkHtmlLastUpdated(relHtml, latestDate, `Dashboard ${series} (${locale.code})`)
    }
  }
}

console.log('=== Birchville Research Konsistenzprüfung ===')
console.log(`Geprüfte Berichtsserien: ${[...seriesPeriods.keys()].join(', ')}`)
console.log(`Geprüfte Monatsberichte (DE-Basis): ${reportFiles.length}`)
if (driveCheckedCount > 0) {
  console.log(`Geprüfte lokale Drive-Spiegel: ${driveCheckedCount}`)
}
if (driveSkippedCount > 0) {
  console.log(`Google Drive nicht gemountet -> Drive-Spiegel-Prüfung übersprungen (${driveSkippedCount})`)
}
if (distCheckedCount > 0) {
  console.log(`Geprüfte HTML-Seiten (lastUpdated): ${distCheckedCount} (Mindestdatum ${globalLatestDate})`)
} else {
  console.log('Hinweis: docs/.vitepress/dist nicht vorhanden -> HTML-lastUpdated-Prüfung übersprungen')
}

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} Konsistenzfehler gefunden:\n`)
  for (const err of errors) {
    console.error(`- [${err.scope}] ${err.message}`)
  }
  console.error('')
  process.exit(1)
}

console.log('✓ Alle Post-Paritäten, Quellenangaben, Reporthistorien und Zeitleisten sind konsistent.\n')
process.exit(0)
