<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  kicker: { type: String, default: 'Birchville Scholarly Synthesis' },
})

const { localeIndex } = useData()

const displaySubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  if (localeIndex.value === 'en') {
    return 'Automated Research Syntheses & Scholarly Digests'
  }
  if (localeIndex.value === 'hi') {
    return 'स्वचालित शोध संश्लेषण एवं अकादमिक संकलन'
  }
  if (localeIndex.value === 'sa') {
    return 'स्वचालित-अनुसन्धान-संश्लेषणं शास्त्रीय-सङ्ग्रहाश्च'
  }
  return 'Automatisierte Forschungs-Synthesen & Wissenschaftliche Digests'
})
</script>

<template>
  <div class="curation-badge">
    <img :src="withBase('/birchville_logo.png')" alt="Birchville Wappen" />
    <div>
      <div class="curation-badge-kicker">{{ kicker }}</div>
      <div class="curation-badge-title">{{ title || displaySubtitle }}</div>
    </div>
  </div>
</template>
