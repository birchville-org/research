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

const SITE_URL = process.env.SITE_URL || 'https://blog.birchville.org'
const TITLE = 'Birchville Blog'
const DESCRIPTION_DE = 'Kompression automatisierter Forschungs- & Rechercheergebnisse'
const DESCRIPTION_EN = 'Synthesized and compressed automated research digests'

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
  base: '/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/og-icon.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: TITLE }],
    ['meta', { property: 'og:description', content: DESCRIPTION_DE }],
    ['meta', { property: 'og:image', content: `${SITE_URL}/og-icon.png` }],
    ['meta', { property: 'og:image:width', content: '128' }],
    ['meta', { property: 'og:image:height', content: '128' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: TITLE }],
    ['meta', { name: 'twitter:description', content: DESCRIPTION_DE }],
    ['meta', { name: 'twitter:image', content: `${SITE_URL}/og-icon.png` }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: `${TITLE} (DE)`, href: '/feed.xml' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: `${TITLE} (EN)`, href: '/feed-en.xml' }],
  ],

  locales: {
    root: {
      label: 'Deutsch',
      lang: 'de-DE',
      description: DESCRIPTION_DE,
      themeConfig: {
        nav: [
          { text: 'Beiträge', link: '/' },
          { text: 'Stand der Forschung', link: '/stand-der-forschung' },
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
    },
    en: {
      label: 'English',
      lang: 'en-US',
      description: DESCRIPTION_EN,
      themeConfig: {
        nav: [
          { text: 'Posts', link: '/en/' },
          { text: 'State of Research', link: '/en/stand-der-forschung' },
          { text: 'Archive', link: '/en/archiv' },
          { text: 'RSS', link: '/feed-en.xml', target: '_blank' },
        ],
        search: {
          provider: 'local',
          options: {
            detailedView: true,
            locales: { en: { translations: { button: { buttonText: 'Search' } } } },
          },
        },
      },
    },
  },

  themeConfig: {
    logo: '/birchville_logo.png',
    siteTitle: 'Birchville Blog',
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
    // Generate DE RSS Feed
    const feedDe = new Feed({
      title: `${TITLE} (DE)`,
      description: DESCRIPTION_DE,
      id: `${SITE_URL}/`,
      link: `${SITE_URL}/`,
      image: `${SITE_URL}/apple-touch-icon.png`,
      favicon: `${SITE_URL}/favicon.ico`,
      language: 'de',
      copyright: '',
    })

    const postsDe = await createContentLoader('posts/*.md', { excerpt: true, render: true }).load()
    postsDe.sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))

    const oitExplanationDe = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>Hintergrund zur Forschungsreihe „OIT vs. AMT“:</strong>
  <p style="margin:6px 0 4px;"><strong>OIT (Out of India Theory):</strong> Postuliert den Ursprung der indogermanischen Sprachfamilie auf dem indischen Subkontinent und deren Westausbreitung.</p>
  <p style="margin:0;"><strong>AMT (Aryan Migration Theory / Steppen-Hypothese):</strong> Beschreibt das Standardmodell der Einwanderung indo-iranischer Sprechergruppen aus der eurasischen Steppe im 2. Jahrtausend v. Chr.</p>
</div>
`

    const oitExplanationEn = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>Background on "OIT vs. AMT":</strong>
  <p style="margin:6px 0 4px;"><strong>OIT (Out of India Theory):</strong> Proposes that the Indo-European language family originated within the Indian subcontinent and expanded westward.</p>
  <p style="margin:0;"><strong>AMT (Aryan Migration Theory / Steppe Hypothesis):</strong> The linguistic and archaeogenetic consensus model positing that Indo-Iranian speakers migrated into South Asia from the Eurasian steppe in the 2nd millennium BCE.</p>
</div>
`

    for (const { url, frontmatter, excerpt, html } of postsDe) {
      const isOit = frontmatter.series === 'OIT vs AMT' || (frontmatter.tags && frontmatter.tags.includes('OIT'))
      const feedContent = isOit ? oitExplanationDe + html : html

      feedDe.addItem({
        title: frontmatter.title,
        id: `${SITE_URL}${url}`,
        link: `${SITE_URL}${url}`,
        description: frontmatter.description || excerpt,
        content: feedContent,
        date: new Date(frontmatter.date),
      })
    }
    fs.writeFileSync(path.join(siteConfig.outDir, 'feed.xml'), feedDe.rss2())

    // Generate EN RSS Feed
    const feedEn = new Feed({
      title: `${TITLE} (EN)`,
      description: DESCRIPTION_EN,
      id: `${SITE_URL}/en/`,
      link: `${SITE_URL}/en/`,
      image: `${SITE_URL}/apple-touch-icon.png`,
      favicon: `${SITE_URL}/favicon.ico`,
      language: 'en',
      copyright: '',
    })

    const postsEn = await createContentLoader('en/posts/*.md', { excerpt: true, render: true }).load()
    postsEn.sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))

    for (const { url, frontmatter, excerpt, html } of postsEn) {
      const isOit = frontmatter.series === 'OIT vs AMT' || (frontmatter.tags && frontmatter.tags.includes('OIT'))
      const feedContent = isOit ? oitExplanationEn + html : html

      feedEn.addItem({
        title: frontmatter.title,
        id: `${SITE_URL}${url}`,
        link: `${SITE_URL}${url}`,
        description: frontmatter.description || excerpt,
        content: feedContent,
        date: new Date(frontmatter.date),
      })
    }
    fs.writeFileSync(path.join(siteConfig.outDir, 'feed-en.xml'), feedEn.rss2())
  },
})
