<script setup>
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  series: {
    type: String,
    default: 'yavanas',
  },
  buttonText: {
    type: String,
    default: 'Chronologische Zeitleiste & Forschungsbefunde',
  },
  title: {
    type: String,
    default: '',
  },
})

const dialogRef = ref(null)
const isOpen = ref(false)
const timelineData = ref(null)
const selectedCategory = ref('all')
const sortAscending = ref(true)
const isLoading = ref(false)
const loadError = ref(null)

const dataUrl = computed(() => {
  return withBase(`/data/${props.series}-timeline.json`)
})

async function loadData() {
  if (timelineData.value) return
  isLoading.value = true
  loadError.value = null
  try {
    const res = await fetch(dataUrl.value)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    const json = await res.json()
    timelineData.value = json
  } catch (err) {
    console.error('Fehler beim Laden der Zeitleiste:', err)
    loadError.value = 'Zeitleistendaten konnten nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
}

function openModal() {
  loadData()
  if (dialogRef.value) {
    if (typeof dialogRef.value.showModal === 'function') {
      dialogRef.value.showModal()
    } else {
      dialogRef.value.setAttribute('open', '')
    }
    isOpen.value = true
    document.body.style.overflow = 'hidden'
  }
}

function closeModal() {
  if (dialogRef.value) {
    if (typeof dialogRef.value.close === 'function') {
      dialogRef.value.close()
    } else {
      dialogRef.value.removeAttribute('open')
    }
    isOpen.value = false
    document.body.style.overflow = ''
  }
}

function onBackdropClick(event) {
  if (event.target === dialogRef.value) {
    closeModal()
  }
}

const categories = computed(() => {
  if (!timelineData.value || !timelineData.value.categories) return []
  return timelineData.value.categories
})

const filteredEvents = computed(() => {
  if (!timelineData.value || !timelineData.value.events) return []
  let list = timelineData.value.events
  if (selectedCategory.value !== 'all') {
    list = list.filter((e) => e.category === selectedCategory.value)
  }
  return [...list].sort((a, b) => {
    const diff = (a.period_start ?? 0) - (b.period_start ?? 0)
    return sortAscending.value ? diff : -diff
  })
})

const modalTitle = computed(() => {
  if (props.title) return props.title
  if (timelineData.value && timelineData.value.series_title) {
    return `${timelineData.value.series_title} – Chronologische Zeitleiste`
  }
  return 'Chronologische Zeitleiste & Forschungsbefunde'
})
</script>

<template>
  <div class="timeline-trigger-wrapper">
    <button
      type="button"
      class="quick-btn quick-btn-primary timeline-open-btn"
      @click="openModal"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
    >
      <span class="btn-icon">⏱️</span>
      <span class="btn-text">{{ buttonText }}</span>
      <span v-if="timelineData && timelineData.events" class="event-count-badge">
        {{ timelineData.events.length }}
      </span>
    </button>

    <dialog
      ref="dialogRef"
      class="matrix-dialog timeline-dialog vp-doc"
      @click="onBackdropClick"
      @close="closeModal"
      aria-labelledby="timeline-dialog-title"
    >
      <div class="matrix-dialog-inner timeline-dialog-inner">
        <!-- Header -->
        <header class="matrix-dialog-header timeline-header">
          <div class="timeline-header-titles">
            <h2 id="timeline-dialog-title" class="matrix-dialog-title">
              {{ modalTitle }}
            </h2>
            <div v-if="timelineData && timelineData.period_coverage" class="timeline-period-badge">
              Zeitraum: {{ timelineData.period_coverage }}
            </div>
          </div>
          <button
            type="button"
            class="quick-btn quick-btn-outline matrix-dialog-close timeline-close-btn"
            @click="closeModal"
            aria-label="Schließen"
          >
            ✕ Schließen
          </button>
        </header>

        <!-- Subtitle & Filter Toolbar -->
        <div class="timeline-toolbar">
          <div class="timeline-filter-group">
            <button
              type="button"
              class="filter-chip"
              :class="{ active: selectedCategory === 'all' }"
              @click="selectedCategory = 'all'"
            >
              Alle Disziplinen
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="filter-chip"
              :class="{ active: selectedCategory === cat.id }"
              @click="selectedCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>

          <div class="timeline-sort-group">
            <button
              type="button"
              class="sort-btn"
              @click="sortAscending = !sortAscending"
              :title="sortAscending ? 'Chronologisch: Älteste zuerst' : 'Chronologisch: Neueste zuerst'"
            >
              {{ sortAscending ? '↓ Chronologisch (Früheste zuerst)' : '↑ Chronologisch (Späteste zuerst)' }}
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="matrix-dialog-body timeline-body">
          <div v-if="isLoading" class="timeline-loading">
            Lade Zeitleistendaten...
          </div>
          <div v-else-if="loadError" class="timeline-error">
            {{ loadError }}
          </div>
          <div v-else-if="filteredEvents.length === 0" class="timeline-empty">
            Keine Ereignisse für die gewählte Kategorie gefunden.
          </div>
          <div v-else class="timeline-track">
            <article
              v-for="(evt, idx) in filteredEvents"
              :key="evt.id || idx"
              class="timeline-card"
              :class="`cat-${evt.category}`"
            >
              <!-- Timeline node & date pill -->
              <div class="timeline-meta-bar">
                <span class="timeline-date-pill">{{ evt.date_display }}</span>
                <span v-if="evt.site" class="timeline-site-pill">📍 {{ evt.site }}</span>
                <span v-if="evt.discipline" class="timeline-discipline-pill">{{ evt.discipline }}</span>
                <span v-if="evt.added_in_period" class="timeline-period-tag">
                  Berichtsstand {{ evt.added_in_period }}
                </span>
              </div>

              <h3 class="timeline-event-title">{{ evt.title }}</h3>

              <p class="timeline-summary">{{ evt.summary }}</p>

              <!-- Additional attributes -->
              <div class="timeline-footer-row">
                <div v-if="evt.confidence" class="timeline-footer-item">
                  <strong>Evidenzgrad:</strong> {{ evt.confidence }}
                </div>
                <div v-if="evt.sources && evt.sources.length" class="timeline-footer-item">
                  <strong>Quellen/Belege:</strong> {{ evt.sources.join(', ') }}
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.timeline-trigger-wrapper {
  margin: 0;
  display: inline-flex;
  align-items: center;
}

.timeline-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  line-height: 1.4;
  border-radius: 4px;
  background-color: var(--accent) !important;
  color: #ffffff !important;
  border: 1px solid var(--accent) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: all 0.15s ease;
}

.timeline-open-btn .btn-text {
  color: #ffffff !important;
}

.timeline-open-btn:hover {
  background-color: #92400e !important;
  border-color: #92400e !important;
}

:root.dark .timeline-open-btn,
.dark .timeline-open-btn {
  background-color: var(--accent) !important;
  color: #0a1628 !important;
  border-color: var(--accent) !important;
}

:root.dark .timeline-open-btn .btn-text,
.dark .timeline-open-btn .btn-text {
  color: #0a1628 !important;
}

:root.dark .timeline-open-btn:hover,
.dark .timeline-open-btn:hover {
  background-color: #facc15 !important;
  border-color: #facc15 !important;
}

.btn-icon {
  font-size: 1.1rem;
}

.event-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  color: inherit !important;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Dialog Styles */
dialog.timeline-dialog {
  width: min(94vw, 1100px) !important;
  max-width: min(94vw, 1100px) !important;
  max-height: 88vh;
  margin: auto !important;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
}

.timeline-dialog-inner {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem 1.5rem;
  max-height: 86vh;
}

.timeline-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.85rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid var(--border);
}

.timeline-header-titles {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.timeline-header-titles h2 {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  font-size: 1.35rem !important;
  line-height: 1.25 !important;
  color: var(--vp-c-text-1);
}

.timeline-period-badge {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.timeline-close-btn {
  cursor: pointer;
  white-space: nowrap;
}

/* Toolbar & Filters */
.timeline-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0 0.85rem 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}

.timeline-filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.filter-chip {
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.filter-chip.active {
  background-color: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
  font-weight: 600;
}

:root.dark .filter-chip.active,
.dark .filter-chip.active {
  color: #0a1628 !important;
}

.sort-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background-color: var(--vp-c-bg-alt);
}

.sort-btn:hover {
  border-color: var(--accent);
}

/* Timeline Body & Cards */
.timeline-body {
  overflow-y: auto;
  padding-right: 0.5rem;
}

.timeline-track {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  position: relative;
  padding-left: 1.25rem;
  border-left: 2px solid var(--border);
  margin-left: 0.5rem;
}

.timeline-card {
  position: relative;
  background-color: var(--vp-c-bg-alt);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.timeline-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: var(--accent);
}

/* Timeline bullet point on left border */
.timeline-card::before {
  content: '';
  position: absolute;
  left: calc(-1.25rem - 6px);
  top: 1.25rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--accent);
  border: 2px solid var(--vp-c-bg);
  box-shadow: 0 0 0 2px var(--accent);
}

.timeline-meta-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.timeline-date-pill {
  background-color: var(--accent);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.78rem;
  padding: 0.18rem 0.55rem;
  border-radius: 4px;
}

:root.dark .timeline-date-pill,
.dark .timeline-date-pill {
  color: #0a1628 !important;
}

.timeline-site-pill {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.timeline-discipline-pill {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.timeline-period-tag {
  margin-left: auto;
  font-size: 0.74rem;
  color: var(--accent);
  background-color: rgba(180, 83, 9, 0.08);
  border: 1px solid rgba(180, 83, 9, 0.25);
  padding: 0.12rem 0.45rem;
  border-radius: 3px;
  font-weight: 500;
}

.timeline-event-title {
  margin: 0 0 0.5rem 0 !important;
  padding: 0 !important;
  font-size: 1.08rem !important;
  font-weight: 600 !important;
  line-height: 1.35 !important;
  border: none !important;
  color: var(--vp-c-text-1);
}

.timeline-summary {
  margin: 0 0 0.75rem 0 !important;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.timeline-footer-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--border);
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
}

.timeline-loading,
.timeline-error,
.timeline-empty {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.timeline-error {
  color: #dc2626;
}
</style>
