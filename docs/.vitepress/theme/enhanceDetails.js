export function setupAutoOpenDetails() {
  if (typeof window === 'undefined') return

  function openDetailsForHash(hash) {
    if (!hash) return
    const id = decodeURIComponent(hash.replace(/^#/, ''))
    if (!id) return

    // Find the target element
    const target = document.getElementById(id)
    if (!target) return

    // If target itself is a details container, open it
    if (target.tagName === 'DETAILS') {
      target.open = true
    }

    // If target is inside a details container, find and open that container
    const parentDetails = target.closest('details')
    if (parentDetails) {
      parentDetails.open = true
    }

    // If the hash is specifically pointing to the full report anchor, open child details
    if (
      id === 'vollstandiger-monatsbericht' ||
      id === 'full-monthly-report' ||
      id === 'sampurna-masik-report' ||
      id.includes('monatsbericht') ||
      id.includes('monthly-report')
    ) {
      const nextDetails =
        target.nextElementSibling?.tagName === 'DETAILS'
          ? target.nextElementSibling
          : target.parentElement?.querySelector('details')
      if (nextDetails) nextDetails.open = true
    }
  }

  // Handle click on links (including TOC links & Jump Button)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a')
    if (!link || !link.hash) return

    const hash = link.hash
    // Allow default hash navigation, then open details
    setTimeout(() => {
      openDetailsForHash(hash)
      // Smooth scroll into view if needed
      const elem = document.getElementById(decodeURIComponent(hash.replace(/^#/, '')))
      if (elem) elem.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  })

  // Also check on initial page load / hash change
  window.addEventListener('hashchange', () => {
    openDetailsForHash(window.location.hash)
  })

  // Initial load check
  if (window.location.hash) {
    setTimeout(() => openDetailsForHash(window.location.hash), 150)
  }

  setupMatrixPopup()
}

function getPopupLabels() {
  const path = window.location.pathname
  const lang = (document.documentElement.lang || 'de').toLowerCase()

  if (path.startsWith('/en/') || lang.startsWith('en')) {
    return {
      openMatrix: '⤢ Open Evidence Matrix in Popup',
      openTable: '⤢ Open Table in Popup',
      close: '✕ Close (Esc)',
      defaultTitle: 'Evidence Matrix',
    }
  }
  if (path.startsWith('/hi/') || lang.startsWith('hi')) {
    return {
      openMatrix: '⤢ साक्ष्य-मैट्रिक्स बड़े पॉपअप में खोलें',
      openTable: '⤢ तालिका बड़े पॉपअप में खोलें',
      close: '✕ बंद करें (Esc)',
      defaultTitle: 'साक्ष्य-मैट्रिक्स (Evidence Matrix)',
    }
  }
  if (path.startsWith('/sa/') || lang.startsWith('sa')) {
    return {
      openMatrix: '⤢ प्रमाण-व्यूहं बृहद्-दर्शने उद्घाटयतु',
      openTable: '⤢ सारणीं बृहद्-दर्शने उद्घाटयतु',
      close: '✕ पिधत्ताम् (Esc)',
      defaultTitle: 'प्रमाण-व्यूहः (Evidence Matrix)',
    }
  }
  return {
    openMatrix: '⤢ Evidenz-Matrix im Popup öffnen',
    openTable: '⤢ Tabelle im Popup öffnen',
    close: '✕ Schließen (Esc)',
    defaultTitle: 'Evidenz-Matrix',
  }
}

function getOrCreateMatrixDialog() {
  let dialog = document.getElementById('birchville-matrix-dialog')
  if (dialog) return dialog

  dialog = document.createElement('dialog')
  dialog.id = 'birchville-matrix-dialog'
  dialog.className = 'matrix-dialog vp-doc'
  dialog.setAttribute('closedby', 'any')
  dialog.setAttribute('aria-labelledby', 'matrix-dialog-title')

  const inner = document.createElement('div')
  inner.className = 'matrix-dialog-inner'

  const header = document.createElement('header')
  header.className = 'matrix-dialog-header'

  const title = document.createElement('h2')
  title.id = 'matrix-dialog-title'
  title.className = 'matrix-dialog-title'

  const form = document.createElement('form')
  form.method = 'dialog'
  form.className = 'matrix-dialog-form'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'submit'
  closeBtn.className = 'quick-btn quick-btn-outline matrix-dialog-close'

  form.appendChild(closeBtn)
  header.appendChild(title)
  header.appendChild(form)

  const body = document.createElement('div')
  body.className = 'matrix-dialog-body'

  inner.appendChild(header)
  inner.appendChild(body)
  dialog.appendChild(inner)
  document.body.appendChild(dialog)

  // Fallback for browsers without declarative <dialog closedby="any"> support
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return
      const rect = dialog.getBoundingClientRect()
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width

      if (isDialogContent) return
      dialog.close()
    })
  }

  return dialog
}

function findPrecedingHeadingText(table) {
  let el = table.previousElementSibling
  while (el) {
    if (/^H[1-4]$/.test(el.tagName)) {
      return el.textContent.replace(/[\u200B#]+$/g, '').trim()
    }
    el = el.previousElementSibling
  }
  return ''
}

function openTableInModal(table, titleText) {
  const labels = getPopupLabels()
  const dialog = getOrCreateMatrixDialog()

  const titleEl = dialog.querySelector('#matrix-dialog-title')
  const closeBtn = dialog.querySelector('.matrix-dialog-close')
  const bodyEl = dialog.querySelector('.matrix-dialog-body')

  if (titleEl) titleEl.textContent = titleText || labels.defaultTitle
  if (closeBtn) closeBtn.textContent = labels.close

  if (bodyEl) {
    bodyEl.replaceChildren()
    const clonedTable = table.cloneNode(true)
    bodyEl.appendChild(clonedTable)
  }

  dialog.showModal()
}

function enhanceMatrixTables() {
  const tables = document.querySelectorAll('.vp-doc table')
  if (!tables.length) return

  const labels = getPopupLabels()

  tables.forEach((table, idx) => {
    if (table.closest('dialog')) return

    const headingText = findPrecedingHeadingText(table)
    const isEvidenzMatrix =
      idx === 0 || /evidenz|evidence|साक्ष्य|प्रमाण/i.test(headingText)

    const prev = table.previousElementSibling
    if (!prev || !prev.classList.contains('matrix-toolbar')) {
      const toolbar = document.createElement('div')
      toolbar.className = 'matrix-toolbar'

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'quick-btn quick-btn-outline matrix-popup-btn'
      btn.textContent = isEvidenzMatrix ? labels.openMatrix : labels.openTable
      btn.addEventListener('click', () => openTableInModal(table, headingText))

      toolbar.appendChild(btn)
      table.parentNode.insertBefore(toolbar, table)
    }

    // Also add quick button next to "Vollständigen Monatsbericht lesen" for the primary Evidenz-Matrix
    if (idx === 0) {
      const fullReportLink = document.querySelector(
        '.vp-doc a[href="#full-monthly-report"], .vp-doc a[href="#vollstandiger-monatsbericht"]'
      )
      const actionContainer = fullReportLink?.parentElement
      if (
        actionContainer &&
        !actionContainer.querySelector('.matrix-top-popup-btn')
      ) {
        const topBtn = document.createElement('button')
        topBtn.type = 'button'
        topBtn.className = 'quick-btn quick-btn-outline matrix-top-popup-btn'
        topBtn.textContent = labels.openMatrix
        topBtn.addEventListener('click', () =>
          openTableInModal(table, headingText)
        )
        actionContainer.appendChild(topBtn)
      }
    }
  })
}

export function setupMatrixPopup() {
  if (typeof window === 'undefined') return

  const runEnhancement = () => {
    requestAnimationFrame(() => {
      enhanceMatrixTables()
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runEnhancement)
  } else {
    setTimeout(runEnhancement, 80)
  }

  // Re-run when VitePress navigates between pages
  const observer = new MutationObserver(() => {
    const unenhancedTable = document.querySelector(
      '.vp-doc table:not(dialog table)'
    )
    if (
      unenhancedTable &&
      (!unenhancedTable.previousElementSibling ||
        !unenhancedTable.previousElementSibling.classList.contains(
          'matrix-toolbar'
        ))
    ) {
      runEnhancement()
    }
  })

  const startObserver = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true })
    }
  }

  if (document.body) {
    startObserver()
  } else {
    document.addEventListener('DOMContentLoaded', startObserver)
  }
}
