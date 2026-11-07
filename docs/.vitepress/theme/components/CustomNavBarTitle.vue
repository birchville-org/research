<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { useSidebar, VPImage } from 'vitepress/theme'

const { site, theme, localeIndex } = useData()
const { hasSidebar } = useSidebar()

const currentLangHome = computed(() => {
  const loc = localeIndex.value
  if (!loc || loc === 'root') {
    return withBase('/')
  }
  return withBase(`/${loc}/`)
})
</script>

<template>
  <div class="VPNavBarTitle" :class="{ 'has-sidebar': hasSidebar }">
    <div class="title-container">
      <a
        class="portal-logo-link"
        href="https://birchville.org"
        title="Birchville Portal (birchville.org)"
        aria-label="Birchville Portal"
      >
        <VPImage v-if="theme.logo" class="logo" :image="theme.logo" />
      </a>
      <a
        class="title-text-link"
        :href="currentLangHome"
        :title="theme.siteTitle || site.title"
      >
        <slot name="nav-bar-title-before" />
        <span v-if="theme.siteTitle" v-html="theme.siteTitle"></span>
        <span v-else-if="theme.siteTitle === undefined">{{ site.title }}</span>
        <slot name="nav-bar-title-after" />
      </a>
    </div>
  </div>
</template>

<style scoped>
.title-container {
  display: flex;
  align-items: center;
  border-bottom: 1px solid transparent;
  width: 100%;
  height: var(--vp-nav-height);
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: opacity 0.25s;
}

@media (min-width: 960px) {
  .title-container {
    flex-shrink: 0;
  }

  .VPNavBarTitle.has-sidebar .title-container {
    border-bottom-color: var(--vp-c-divider);
  }
}

.portal-logo-link {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.portal-logo-link:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

.title-text-link {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.title-text-link:hover {
  color: var(--vp-c-brand-1, #b45309);
}

:deep(.logo) {
  margin-right: 8px;
  height: var(--vp-nav-logo-height);
}
</style>
