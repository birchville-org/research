<script setup>
import { computed } from 'vue'
import { data as posts } from '../../../posts.data.mjs'

const props = defineProps({
  limit: { type: Number, default: 0 },
  byYear: { type: Boolean, default: false },
})

const shown = computed(() => (props.limit ? posts.slice(0, props.limit) : posts))

const fmt = (d) => new Date(d).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })

const groups = computed(() => {
  const out = []
  for (const p of shown.value) {
    const y = new Date(p.date).getFullYear()
    const last = out[out.length - 1]
    if (last && last.year === y) last.items.push(p)
    else out.push({ year: y, items: [p] })
  }
  return out
})
</script>

<template>
  <template v-if="byYear">
    <section v-for="g in groups" :key="g.year">
      <h2 class="post-year">{{ g.year }}</h2>
      <ul class="post-list">
        <li v-for="p in g.items" :key="p.url">
          <span class="post-date">{{ fmt(p.date) }}</span>
          <a class="post-title" :href="p.url">{{ p.title }}</a>
          <p v-if="p.description" class="post-desc">{{ p.description }}</p>
          <div v-if="p.tags.length" class="post-tags">{{ p.tags.join(' · ') }}</div>
        </li>
      </ul>
    </section>
  </template>
  <ul v-else class="post-list">
    <li v-for="p in shown" :key="p.url">
      <span class="post-date">{{ fmt(p.date) }}</span>
      <a class="post-title" :href="p.url">{{ p.title }}</a>
      <p v-if="p.description" class="post-desc">{{ p.description }}</p>
      <div v-if="p.tags.length" class="post-tags">{{ p.tags.join(' · ') }}</div>
    </li>
  </ul>
</template>
