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
    if (id === 'vollstandiger-monatsbericht' || id === 'full-monthly-report' || id === 'sampurna-masik-report' || id.includes('monatsbericht') || id.includes('monthly-report')) {
      const nextDetails = target.nextElementSibling?.tagName === 'DETAILS'
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
}
