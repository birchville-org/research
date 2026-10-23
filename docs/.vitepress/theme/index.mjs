import DefaultTheme from 'vitepress/theme'
import PostList from './components/PostList.vue'
import CurationBadge from './components/CurationBadge.vue'
import 'markdown-it-extensible/css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PostList', PostList)
    app.component('CurationBadge', CurationBadge)
  },
}
