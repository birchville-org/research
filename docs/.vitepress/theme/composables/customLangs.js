import { computed } from 'vue'
import { useData } from 'vitepress'
import { iastEnabled } from '../iastMode.js'

const IAST_LOCALES = new Set(['hi', 'sa'])

function ensureStartingSlash(path) {
  return /^\//.test(path) ? path : `/${path}`
}

function normalizeLink(link, addPath, path, addExt) {
  return addPath
    ? link.replace(/\/$/, '') +
        ensureStartingSlash(
          path
            .replace(/(^|\/)index\.md$/, '$1')
            .replace(/\.md$/, addExt ? '.html' : '')
        )
    : link
}

export function useLangs({ correspondingLink = false } = {}) {
  const { site, localeIndex, page, theme, hash } = useData()

  const currentLang = computed(() => {
    const loc = localeIndex.value
    const baseLabel = site.value.locales[loc]?.label
    const label =
      IAST_LOCALES.has(loc) && iastEnabled.value
        ? `${baseLabel} + IAST`
        : baseLabel

    return {
      label,
      link:
        site.value.locales[loc]?.link ||
        (loc === 'root' ? '/' : `/${loc}/`),
    }
  })

  const localeLinks = computed(() => {
    const currentLoc = localeIndex.value
    const relativeRest = page.value.relativePath.slice(
      currentLang.value.link.length - 1
    )
    const canCorrespond = theme.value.i18nRouting !== false && correspondingLink

    return Object.entries(site.value.locales).flatMap(([key, value]) => {
      const targetBase = normalizeLink(
        value.link || (key === 'root' ? '/' : `/${key}/`),
        canCorrespond,
        relativeRest,
        !site.value.cleanUrls
      )

      if (IAST_LOCALES.has(key)) {
        const items = []
        if (!(currentLoc === key && !iastEnabled.value)) {
          items.push({
            text: value.label,
            link: `${targetBase}?iast=0${hash.value}`,
          })
        }
        if (!(currentLoc === key && iastEnabled.value)) {
          items.push({
            text: `${value.label} + IAST`,
            link: `${targetBase}?iast=1${hash.value}`,
          })
        }
        return items
      }

      if (currentLoc === key) return []

      return {
        text: value.label,
        link: targetBase + hash.value,
      }
    })
  })

  return { localeLinks, currentLang }
}
