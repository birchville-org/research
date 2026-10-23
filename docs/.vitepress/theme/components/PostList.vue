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
const isEn = computed(() => route.path.startsWith('/en/'))

// Filter by current language based on URL prefix
const langPosts = computed(() => {
  return allPosts.filter((p) => {
    if (isEn.value) {
      return p.url.startsWith('/en/')
    }
    return !p.url.startsWith('/en/')
  })
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
  const locale = isEn.value ? 'en-US' : 'de-DE'
  return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
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
    <span style="font-weight: 600; color: var(--text-2);">{{ isEn ? 'Series:' : 'Reihe:' }}</span>
    <button
      class="filter-btn"
      :class="{ active: activeSeries === 'ALL' }"
      @click="activeSeries = 'ALL'"
    >
      {{ isEn ? 'All' : 'Alle' }}
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
              📚 {{ p.sourcesCount }} {{ isEn ? 'Sources evaluated' : 'Quellen ausgewertet' }}
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
          📚 {{ p.sourcesCount }} {{ isEn ? 'Sources evaluated' : 'Quellen ausgewertet' }}
        </span>
      </div>
    </li>
  </ul>
</template>
