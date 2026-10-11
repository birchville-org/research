import { defineConfig, createContentLoader } from 'vitepress'
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { Feed } from 'feed'
const require = createRequire(import.meta.url)
const attrs = require('markdown-it-attrs')
import footnote from 'markdown-it-footnote'
import deflist from 'markdown-it-deflist'
import extensiblePlugin from 'markdown-it-extensible'
const multimd_table = require('markdown-it-multimd-table')

const SITE_URL = process.env.SITE_URL || 'https://example.org'
const TITLE = 'Birchville Blog'
const DESCRIPTION = 'Private Forschungsergebnisse'

const blockContainers = [
  { name: 'grammar-box2', className: 'grammar-box2' },
  { name: 'grammarbox2', className: 'grammar-box2' },
  { name: 'grammar-box', className: 'grammar-box' },
  { name: 'grammarbox', className: 'grammar-box' },
  { name: 'metrik-schema', className: 'metrik-schema' },
  { name: 'metrikschema', className: 'metrik-schema' },
  { name: 'literatur-box', className: 'literatur-box' },
  { name: 'literatur', className: 'literatur-box' },
  { name: 'deleteme-box', className: 'deleteme-box' },
  { name: 'deletemebox', className: 'deleteme-box' },
  { name: 'note-box', className: 'note-box' },
  { name: 'notebox', className: 'note-box' },
  { name: 'laut-table', className: 'laut-table' },
  { name: 'lauttable', className: 'laut-table' },
  { name: 'no-header', className: 'no-header' },
  { name: 'noheader', className: 'no-header' },
  { name: 'important', className: 'important' },
  { name: 'gaga-box', className: 'gaga-box' },
  { name: 'compact', className: 'compact' },
  { name: 'indent', className: 'indent' },
  { name: 'center', className: 'center' },
  { name: 'media', className: 'media' },
]

export default defineConfig({
  title: TITLE,
  description: DESCRIPTION,
  lang: 'de-DE',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: TITLE, href: '/feed.xml' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Beiträge', link: '/' },
      { text: 'Archiv', link: '/archiv' },
      { text: 'RSS', link: '/feed.xml', target: '_blank' },
    ],
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        locales: { root: { translations: { button: { buttonText: 'Suchen' } } } },
      },
    },
  },

  markdown: {
    lineNumbers: false,
    breaks: true,
    config: (md) => {
      md.use(attrs)
      md.use(footnote)
      md.use(deflist)

      md.use(multimd_table, {
        multiline: true,
        rowspan: true,
        headerless: true,
        multiscript: true,
        colspans: true,
      })

      md.use(extensiblePlugin, { blockContainers })
    },
  },

  buildEnd: async (siteConfig) => {
    const feed = new Feed({
      title: TITLE,
      description: DESCRIPTION,
      id: SITE_URL,
      link: SITE_URL,
      language: 'de',
      copyright: '',
    })

    const posts = await createContentLoader('posts/*.md', { excerpt: true, render: true }).load()
    posts.sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))

    for (const { url, frontmatter, excerpt, html } of posts) {
      feed.addItem({
        title: frontmatter.title,
        id: `${SITE_URL}${url}`,
        link: `${SITE_URL}${url}`,
        description: frontmatter.description || excerpt,
        content: html,
        date: new Date(frontmatter.date),
      })
    }

    fs.writeFileSync(path.join(siteConfig.outDir, 'feed.xml'), feed.rss2())
  },
})
