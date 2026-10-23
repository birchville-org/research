import DefaultTheme from 'vitepress/theme'
import PostList from './components/PostList.vue'
import CurationBadge from './components/CurationBadge.vue'
import { setupAutoOpenDetails } from './enhanceDetails.js'
import 'markdown-it-extensible/css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PostList', PostList)
    app.component('CurationBadge', CurationBadge)

    if (typeof window !== 'undefined') {
      setupAutoOpenDetails()
    }
  },
}
