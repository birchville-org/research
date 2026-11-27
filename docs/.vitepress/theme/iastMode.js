import { ref } from 'vue'
import { containsDevanagari, transliterateDevanagariToIast } from './iastTransliterator.js'

const STORAGE_KEY = 'birchville-iast'
const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'TEXTAREA',
  'INPUT',
  'RUBY',
  'RT',
  'RP',
  'NOSCRIPT',
])

const SKIP_SELECTOR =
  '.VPNavBarTranslations, .VPNavScreenTranslations, .VPNavBarExtra, .VPNavBarTitle'

// Match Devanāgarī words excluding Danda (। U+0964) and Double Danda (॥ U+0965)
const DEV_WORD_RE =
  /([\u0900-\u0963\u0966-\u097F]+(?:[\u200C\u200D][\u0900-\u0963\u0966-\u097F]+)*)/g

export const iastEnabled = ref(false)

let observer = null
let isMutatingDom = false

function readStoredPreference() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setIastMode(enabled) {
  const next = Boolean(enabled)
  iastEnabled.value = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }
}

export function syncIastFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const q = params.get('iast')
  if (q === '1') {
    setIastMode(true)
  } else if (q === '0') {
    setIastMode(false)
  } else {
    iastEnabled.value = readStoredPreference()
  }
}

function getActiveIndicLang() {
  if (typeof window === 'undefined') return null
  const htmlLang = (document.documentElement.lang || '').toLowerCase()
  const path = window.location.pathname
  if (/(^|\/)hi(\/|$)/.test(path) || htmlLang.startsWith('hi')) return 'hi'
  if (/(^|\/)sa(\/|$)/.test(path) || htmlLang.startsWith('sa')) return 'sa'
  return null
}

function shouldSkipNode(node) {
  const parent = node.parentElement
  if (!parent) return true
  if (SKIP_TAGS.has(parent.tagName)) return true
  if (parent.closest(SKIP_SELECTOR)) return true
  if (parent.closest('ruby')) return true
  return false
}

function applyIastToSubtree(root, lang) {
  if (!root || !lang) return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !containsDevanagari(node.nodeValue)) {
        return NodeFilter.FILTER_REJECT
      }
      if (shouldSkipNode(node)) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes = []
  let current
  while ((current = walker.nextNode())) {
    textNodes.push(current)
  }

  for (const textNode of textNodes) {
    const text = textNode.nodeValue
    DEV_WORD_RE.lastIndex = 0
    if (!DEV_WORD_RE.test(text)) continue
    DEV_WORD_RE.lastIndex = 0

    const frag = document.createDocumentFragment()
    let lastIndex = 0
    let match

    while ((match = DEV_WORD_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)))
      }
      const devWord = match[1]
      const iastWord = transliterateDevanagariToIast(devWord, lang)

      const ruby = document.createElement('ruby')
      ruby.className = 'bv-iast-ruby'
      ruby.setAttribute('data-bv-iast', '1')
      ruby.appendChild(document.createTextNode(devWord))

      const rpOpen = document.createElement('rp')
      rpOpen.textContent = ' ('
      const rt = document.createElement('rt')
      rt.className = 'bv-iast-rt'
      rt.textContent = iastWord
      const rpClose = document.createElement('rp')
      rpClose.textContent = ')'

      ruby.appendChild(rpOpen)
      ruby.appendChild(rt)
      ruby.appendChild(rpClose)
      frag.appendChild(ruby)

      lastIndex = DEV_WORD_RE.lastIndex
    }

    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)))
    }

    textNode.parentNode.replaceChild(frag, textNode)
  }
}

function removeIastFromSubtree(root) {
  if (!root) return
  const rubies = root.querySelectorAll('ruby[data-bv-iast="1"]')
  if (!rubies.length) return

  const affectedParents = new Set()
  for (const ruby of rubies) {
    const parent = ruby.parentNode
    if (!parent) continue
    const baseText = Array.from(ruby.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.nodeValue)
      .join('')
    parent.replaceChild(document.createTextNode(baseText), ruby)
    affectedParents.add(parent)
  }

  for (const parent of affectedParents) {
    parent.normalize()
  }
}

function refreshIastView() {
  if (typeof document === 'undefined' || isMutatingDom) return
  const indicLang = getActiveIndicLang()
  const active = Boolean(indicLang && iastEnabled.value)

  isMutatingDom = true
  try {
    document.documentElement.classList.toggle('bv-iast-active', active)
    if (active) {
      applyIastToSubtree(document.body, indicLang)
    } else {
      removeIastFromSubtree(document.body)
    }
  } finally {
    isMutatingDom = false
  }
}

export function setupIastRenderer() {
  if (typeof window === 'undefined') return

  const initAfterHydration = () => {
    syncIastFromUrl()
    requestAnimationFrame(() => refreshIastView())
  }

  const scheduleRefresh = () => {
    requestAnimationFrame(() => refreshIastView())
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAfterHydration)
  } else {
    setTimeout(initAfterHydration, 40)
  }

  // Handle direct switches between e.g. 'हिन्दी' (?iast=0) and 'हिन्दी + IAST' (?iast=1)
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]')
    if (!link) return
    const href = link.getAttribute('href') || ''
    if (href.includes('iast=1')) {
      setIastMode(true)
      setTimeout(scheduleRefresh, 60)
    } else if (href.includes('iast=0')) {
      setIastMode(false)
      setTimeout(scheduleRefresh, 60)
    }
  })

  window.addEventListener('popstate', () => {
    syncIastFromUrl()
    setTimeout(scheduleRefresh, 60)
  })

  observer = new MutationObserver((mutations) => {
    if (isMutatingDom) return
    const indicLang = getActiveIndicLang()
    if (!indicLang || !iastEnabled.value) {
      if (document.documentElement.classList.contains('bv-iast-active')) {
        scheduleRefresh()
      }
      return
    }

    let hasRelevantAddition = false
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        hasRelevantAddition = true
        break
      }
      if (m.type === 'attributes' && m.target === document.documentElement) {
        hasRelevantAddition = true
        break
      }
    }

    if (hasRelevantAddition) {
      scheduleRefresh()
    }
  })

  const startObserver = () => {
    if (!document.body) return
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  if (document.body) {
    startObserver()
  } else {
    document.addEventListener('DOMContentLoaded', startObserver)
  }
}
