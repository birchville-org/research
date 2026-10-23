import { createContentLoader } from 'vitepress'

function transformPosts(raw) {
  return raw
    .map(({ url, frontmatter }) => ({
      url,
      title: frontmatter.title,
      description: frontmatter.description || '',
      series: frontmatter.series || '',
      period: frontmatter.period || '',
      tags: frontmatter.tags || [],
      highlights: frontmatter.highlights || [],
      sourcesCount: frontmatter.sourcesCount || 0,
      date: frontmatter.date,
    }))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

export default createContentLoader(['posts/*.md', 'en/posts/*.md'], {
  transform: transformPosts,
})
