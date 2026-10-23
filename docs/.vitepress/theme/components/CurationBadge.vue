<script setup>
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  kicker: { type: String, default: 'Birchville Scholarly Synthesis' },
})

const route = useRoute()
const isEn = computed(() => route.path.startsWith('/en/'))

const displaySubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  return isEn.value
    ? 'Automated Research Syntheses & Scholarly Digests'
    : 'Automatisierte Forschungs-Synthesen & Wissenschaftliche Digests'
})
</script>

<template>
  <div class="curation-badge">
    <img src="/birchville_logo.png" alt="Birchville Wappen" />
    <div>
      <div class="curation-badge-kicker">{{ kicker }}</div>
      <div class="curation-badge-title">{{ title || displaySubtitle }}</div>
    </div>
  </div>
</template>
