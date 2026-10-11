import { createContentLoader } from 'vitepress'

// Liest alle Beiträge unter docs/posts/ ein, neueste zuerst.
export default createContentLoader('posts/*.md', {
  transform(raw) {
    return raw
      .map(({ url, frontmatter }) => ({
        url,
        title: frontmatter.title,
        description: frontmatter.description || '',
        tags: frontmatter.tags || [],
        date: frontmatter.date,
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
