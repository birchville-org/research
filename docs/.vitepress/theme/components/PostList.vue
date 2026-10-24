<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vitepress'
import { data as allPosts } from '../../../posts.data.mjs'

const props = defineProps({
  limit: { type: Number, default: 0 },
  byYear: { type: Boolean, default: false },
  selectedSeries: { type: String, default: '' },
})

const route = useRoute()
const currentLang = computed(() => {
  if (route.path.startsWith('/hi/')) return 'hi'
  if (route.path.startsWith('/en/')) return 'en'
  return 'de'
})

const isEn = computed(() => currentLang.value === 'en')

// Filter by current language based on URL prefix
const langPosts = computed(() => {
  return allPosts.filter((p) => {
    if (currentLang.value === 'hi') return p.url.startsWith('/hi/')
    if (currentLang.value === 'en') return p.url.startsWith('/en/')
    return !p.url.startsWith('/en/') && !p.url.startsWith('/hi/')
  })
})

const labels = computed(() => {
  if (currentLang.value === 'hi') {
    return {
      series: 'श्रृंखला:',
      all: 'सभी',
      sources: 'स्रोतों का मूल्यांकन',
    }
  }
  if (currentLang.value === 'en') {
    return {
      series: 'Series:',
      all: 'All',
      sources: 'Sources evaluated',
    }
  }
  return {
    series: 'Reihe:',
    all: 'Alle',
    sources: 'Quellen ausgewertet',
  }
})

const activeSeries = ref(props.selectedSeries || 'ALL')

// Collect distinct series available in this language
const availableSeries = computed(() => {
  const set = new Set()
  for (const p of langPosts.value) {
    if (p.series) set.add(p.series)
  }
  return Array.from(set)
})

const filtered = computed(() => {
  let list = langPosts.value
  if (activeSeries.value !== 'ALL') {
    list = list.filter((p) => p.series === activeSeries.value)
  }
  return props.limit ? list.slice(0, props.limit) : list
})

const fmt = (d) => {
  const localeMap = { hi: 'hi-IN', en: 'en-US', de: 'de-DE' }
  return new Date(d).toLocaleDateString(localeMap[currentLang.value] || 'de-DE', { year: 'numeric', month: 'long', day: 'numeric' })
}

const groups = computed(() => {
  const out = []
  for (const p of filtered.value) {
    const y = new Date(p.date).getFullYear()
    const last = out[out.length - 1]
    if (last && last.year === y) last.items.push(p)
    else out.push({ year: y, items: [p] })
  }
  return out
})
</script>

<template>
  <div v-if="!selectedSeries && availableSeries.length > 0" class="filter-bar">
    <span style="font-weight: 600; color: var(--text-2);">{{ labels.series }}</span>
    <button
      class="filter-btn"
      :class="{ active: activeSeries === 'ALL' }"
      @click="activeSeries = 'ALL'"
    >
      {{ labels.all }}
    </button>
    <button
      v-for="s in availableSeries"
      :key="s"
      class="filter-btn"
      :class="{ active: activeSeries === s }"
      @click="activeSeries = s"
    >
      {{ s }}
    </button>
  </div>

  <template v-if="byYear">
    <section v-for="g in groups" :key="g.year">
      <h2 class="post-year">{{ g.year }}</h2>
      <ul class="post-list">
        <li v-for="p in g.items" :key="p.url" class="post-card">
          <div class="post-card-meta">
            <span v-if="p.series" class="post-card-series">{{ p.series }}</span>
            <span v-if="p.period" class="post-card-period">{{ p.period }}</span>
            <span class="post-card-date">{{ fmt(p.date) }}</span>
          </div>

          <a class="post-card-title" :href="p.url">{{ p.title }}</a>
          <p v-if="p.description" class="post-card-desc">{{ p.description }}</p>

          <ul v-if="p.highlights && p.highlights.length" class="post-card-highlights">
            <li v-for="(h, idx) in p.highlights" :key="idx">{{ h }}</li>
          </ul>

          <div class="post-card-footer">
            <div class="post-tags-list">
              <span v-for="t in p.tags" :key="t" class="post-tag">#{{ t }}</span>
            </div>
            <span v-if="p.sourcesCount" class="post-sources-badge">
              📚 {{ p.sourcesCount }} {{ labels.sources }}
            </span>
          </div>
        </li>
      </ul>
    </section>
  </template>

  <ul v-else class="post-list">
    <li v-for="p in filtered" :key="p.url" class="post-card">
      <div class="post-card-meta">
        <span v-if="p.series" class="post-card-series">{{ p.series }}</span>
        <span v-if="p.period" class="post-card-period">{{ p.period }}</span>
        <span class="post-card-date">{{ fmt(p.date) }}</span>
      </div>

      <a class="post-card-title" :href="p.url">{{ p.title }}</a>
      <p v-if="p.description" class="post-card-desc">{{ p.description }}</p>

      <ul v-if="p.highlights && p.highlights.length" class="post-card-highlights">
        <li v-for="(h, idx) in p.highlights" :key="idx">{{ h }}</li>
      </ul>

      <div class="post-card-footer">
        <div class="post-tags-list">
          <span v-for="t in p.tags" :key="t" class="post-tag">#{{ t }}</span>
        </div>
        <span v-if="p.sourcesCount" class="post-sources-badge">
          📚 {{ p.sourcesCount }} {{ labels.sources }}
        </span>
      </div>
    </li>
  </ul>
</template>
