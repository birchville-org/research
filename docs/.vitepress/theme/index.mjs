import { defineComponent, h, onMounted, nextTick } from 'vue'
import DefaultTheme from 'vitepress/theme'
import PostList from './components/PostList.vue'
import CurationBadge from './components/CurationBadge.vue'
import TimelineModal from './components/TimelineModal.vue'
import { setupAutoOpenDetails } from './enhanceDetails.js'
import { setupIastRenderer, onIastRouteChange } from './iastMode.js'
import 'markdown-it-extensible/css'
import './custom.css'

const Layout = defineComponent({
  name: 'BirchvilleLayout',
  setup() {
    onMounted(() => {
      nextTick(() => {
        setupIastRenderer()
      })
    })
    return () => h(DefaultTheme.Layout)
  },
})

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    app.component('PostList', PostList)
    app.component('CurationBadge', CurationBadge)
    app.component('TimelineModal', TimelineModal)

    if (typeof window !== 'undefined') {
      setupAutoOpenDetails()
      const prevAfterRouteChange = router.onAfterRouteChange
      router.onAfterRouteChange = (to) => {
        if (prevAfterRouteChange) prevAfterRouteChange(to)
        nextTick(() => onIastRouteChange())
      }
    }
  },
}
