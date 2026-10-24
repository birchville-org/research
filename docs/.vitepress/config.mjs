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
const DESCRIPTION_HI = 'स्वचालित शोध एवं अनुसंधान परिणामों का संपीड़न'
const DESCRIPTION_SA = 'स्वचालित-अनुसन्धान-परिणामानां सङ्क्षेपः'

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
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: `${TITLE} (HI)`, href: '/feed-hi.xml' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: `${TITLE} (SA)`, href: '/feed-sa.xml' }],
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
    hi: {
      label: 'हिन्दी',
      lang: 'hi-IN',
      description: DESCRIPTION_HI,
      themeConfig: {
        nav: [
          { text: 'लेख', link: '/hi/' },
          { text: 'अनुसंधान की स्थिति', link: '/hi/stand-der-forschung' },
          { text: 'अभिलेखागार', link: '/hi/archiv' },
          { text: 'RSS', link: '/feed-hi.xml', target: '_blank' },
        ],
        search: {
          provider: 'local',
          options: {
            detailedView: true,
            locales: { hi: { translations: { button: { buttonText: 'खोजें' } } } },
          },
        },
      },
    },
    sa: {
      label: 'संस्कृतम्',
      lang: 'sa-IN',
      description: DESCRIPTION_SA,
      themeConfig: {
        nav: [
          { text: 'लेखाः', link: '/sa/' },
          { text: 'अनुसन्धानस्थितिः', link: '/sa/stand-der-forschung' },
          { text: 'सङ्ग्रहः', link: '/sa/archiv' },
          { text: 'RSS', link: '/feed-sa.xml', target: '_blank' },
        ],
        search: {
          provider: 'local',
          options: {
            detailedView: true,
            locales: { sa: { translations: { button: { buttonText: 'अन्वेषणम्' } } } },
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

    const ivcExplanationDe = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>Hintergrund zur Forschungsreihe „IVC“ (Indus-Valley-Culture / Harappa-Zivilisation):</strong>
  <p style="margin:6px 0 0;">Monatliche Synthese neuer archäologischer, paläoklimatischer, archäogenetischer und siedlungsgeographischer Befunde zur bronzezeitlichen Indus-Zivilisation (ca. 3300–1300 v. Chr.) sowie deren urbaner Reife-, Transformations- und Deurbanisationsphasen.</p>
</div>
`

    const oitExplanationEn = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>Background on "OIT vs. AMT":</strong>
  <p style="margin:6px 0 4px;"><strong>OIT (Out of India Theory):</strong> Proposes that the Indo-European language family originated within the Indian subcontinent and expanded westward.</p>
  <p style="margin:0;"><strong>AMT (Aryan Migration Theory / Steppe Hypothesis):</strong> The linguistic and archaeogenetic consensus model positing that Indo-Iranian speakers migrated into South Asia from the Eurasian steppe in the 2nd millennium BCE.</p>
</div>
`

    const ivcExplanationEn = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>Background on "IVC" (Indus Valley Culture / Civilization):</strong>
  <p style="margin:6px 0 0;">Monthly synthesis of emerging archaeological, paleoclimatic, archaeogenetic, and settlement-geographical evidence concerning the Bronze Age Indus Civilization (c. 3300–1300 BCE), its urban maturity, transformation, and deurbanization phases.</p>
</div>
`

    const oitExplanationHi = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>"OIT vs. AMT" अनुसंधान श्रृंखला की पृष्ठभूमि:</strong>
  <p style="margin:6px 0 4px;"><strong>OIT (आउट ऑफ इंडिया थ्योरी):</strong> यह प्रस्ताव करती है कि भारोपीय (इंडो-यूरोपीय) भाषा परिवार की उत्पत्ति भारतीय उपमहाद्वीप में हुई और यहीं से इसका पश्चिम की ओर विस्तार हुआ।</p>
  <p style="margin:0;"><strong>AMT (आर्य प्रवासन सिद्धांत / स्टेपी परिकल्पना):</strong> भाषावैज्ञानिक और पुरातत्व-आनुवंशिक सर्वसम्मत मॉडल, जिसके अनुसार दूसरी सहस्राब्दी ईसा पूर्व में यूरेशियाई स्टेपी से मध्य एशिया होते हुए इंडो-ईरानी भाषी दक्षिण एशिया पहुंचे।</p>
</div>
`

    const ivcExplanationHi = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>"IVC" (सिंधु घाटी सभ्यता / हड़प्पा सभ्यता) अनुसंधान श्रृंखला की पृष्ठभूमि:</strong>
  <p style="margin:6px 0 0;">कांस्य युगीन सिंधु सभ्यता (लगभग 3300-1300 ईसा पूर्व), इसके शहरी परिपक्वता काल, रूपांतरण और विसंगठन (डी-अर्बनाइजेशन) चरणों से संबंधित नए पुरातात्विक, पुरा-जलवायु, आनुवंशिक और भू-स्थानिक अध्ययनों का मासिक सार।</p>
</div>
`

    const oitExplanationSa = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>"OIT vs. AMT" अनुसन्धान-मालायाः पृष्ठभूमिः:</strong>
  <p style="margin:6px 0 4px;"><strong>OIT (आउट ऑफ इंडिया थ्योरी / भारत-मूल-सिद्धान्तः):</strong> भारोपीय-भाषापरिवारस्य मूलस्थानं भारतीयोपमहाद्वीपः आसीत्, तत एव तस्य पश्चिमाभिमुखी Central Asia दिशि च विस्तारः सञ्जातः इति प्रतिपादयति।</p>
  <p style="margin:0;"><strong>AMT (आर्य-प्रवासन-सिद्धान्तः / स्टेपी-परिकल्पना):</strong> भाषावैज्ञानिकः पुराजनुवैज्ञानिकश्च सर्वसम्मतः सिद्धान्तः, येन द्वितीय-सहस्राब्द्यां ईसापूर्वे यूरेशिया-स्टेपी-प्रदेशात् मध्य-एशिया-मार्गेण हिन्द-ईरानी-भाषकाः दक्षिण-एशियाम् आगताः इति वर्ण्यते।</p>
</div>
`

    const ivcExplanationSa = `
<div style="background:#f1eee7; border-left:4px solid #b45309; padding:12px 16px; margin-bottom:20px; font-size:14px; border-radius:0 6px 6px 0;">
  <strong>"IVC" (सिन्धु-उपत्यका-सभ्यता / हरप्पा-संस्कृतिः) अनुसन्धान-मालायाः पृष्ठभूमिः:</strong>
  <p style="margin:6px 0 0;">कांस्ययुगीन-सिन्धुसभ्यतायाः (प्रायः ३३००–१३०० ईसापूर्वम्), तस्याः नागरिक-परिपक्वतायाः, रूपान्तरणस्य, वि-नगरीकरण-सोपानानां च विषये प्रत्यग्र-पुरातात्त्विक-भूवैज्ञानिक-पुराजनुवैज्ञानिक-शोधानां मासिकः सारसङ्क्षेपः।</p>
</div>
`

    for (const { url, frontmatter, excerpt, html } of postsDe) {
      const isOit = frontmatter.series === 'OIT vs AMT' || (frontmatter.tags && frontmatter.tags.includes('OIT'))
      const isIvc = frontmatter.series === 'IVC' || (frontmatter.tags && frontmatter.tags.includes('IVC'))
      let feedContent = html
      if (isOit) feedContent = oitExplanationDe + feedContent
      else if (isIvc) feedContent = ivcExplanationDe + feedContent

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
      const isIvc = frontmatter.series === 'IVC' || (frontmatter.tags && frontmatter.tags.includes('IVC'))
      let feedContent = html
      if (isOit) feedContent = oitExplanationEn + feedContent
      else if (isIvc) feedContent = ivcExplanationEn + feedContent

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

    // Generate HI RSS Feed
    const feedHi = new Feed({
      title: `${TITLE} (HI)`,
      description: DESCRIPTION_HI,
      id: `${SITE_URL}/hi/`,
      link: `${SITE_URL}/hi/`,
      image: `${SITE_URL}/apple-touch-icon.png`,
      favicon: `${SITE_URL}/favicon.ico`,
      language: 'hi',
      copyright: '',
    })

    const postsHi = await createContentLoader('hi/posts/*.md', { excerpt: true, render: true }).load()
    postsHi.sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))

    for (const { url, frontmatter, excerpt, html } of postsHi) {
      const isOit = frontmatter.series === 'OIT vs AMT' || (frontmatter.tags && frontmatter.tags.includes('OIT'))
      const isIvc = frontmatter.series === 'IVC' || (frontmatter.tags && frontmatter.tags.includes('IVC'))
      let feedContent = html
      if (isOit) feedContent = oitExplanationHi + feedContent
      else if (isIvc) feedContent = ivcExplanationHi + feedContent

      feedHi.addItem({
        title: frontmatter.title,
        id: `${SITE_URL}${url}`,
        link: `${SITE_URL}${url}`,
        description: frontmatter.description || excerpt,
        content: feedContent,
        date: new Date(frontmatter.date),
      })
    }
    fs.writeFileSync(path.join(siteConfig.outDir, 'feed-hi.xml'), feedHi.rss2())

    // Generate SA RSS Feed
    const feedSa = new Feed({
      title: `${TITLE} (SA)`,
      description: DESCRIPTION_SA,
      id: `${SITE_URL}/sa/`,
      link: `${SITE_URL}/sa/`,
      image: `${SITE_URL}/apple-touch-icon.png`,
      favicon: `${SITE_URL}/favicon.ico`,
      language: 'sa',
      copyright: '',
    })

    const postsSa = await createContentLoader('sa/posts/*.md', { excerpt: true, render: true }).load()
    postsSa.sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))

    for (const { url, frontmatter, excerpt, html } of postsSa) {
      const isOit = frontmatter.series === 'OIT vs AMT' || (frontmatter.tags && frontmatter.tags.includes('OIT'))
      const isIvc = frontmatter.series === 'IVC' || (frontmatter.tags && frontmatter.tags.includes('IVC'))
      let feedContent = html
      if (isOit) feedContent = oitExplanationSa + feedContent
      else if (isIvc) feedContent = ivcExplanationSa + feedContent

      feedSa.addItem({
        title: frontmatter.title,
        id: `${SITE_URL}${url}`,
        link: `${SITE_URL}${url}`,
        description: frontmatter.description || excerpt,
        content: feedContent,
        date: new Date(frontmatter.date),
      })
    }
    fs.writeFileSync(path.join(siteConfig.outDir, 'feed-sa.xml'), feedSa.rss2())
  },
})
