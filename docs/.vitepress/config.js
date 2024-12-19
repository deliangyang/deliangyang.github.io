const sidebar = require('./sidebar')
const nav = require('./nav')
const t = require('./t')
var moment = require('moment')
var taskLists = require('markdown-it-task-lists');
// import { defineConfig } from 'vitepress'
import { MermaidMarkdown } from './theme/mermaid-markdown'
import mathMarkdown from 'markdown-it-mathjax3'
import timeline from "vitepress-markdown-timeline";
import fs from 'fs'

const ogUrl = 'https://blog.ranchulin.com'

export default {
  title: 'sntflyv 的技术博客',
  // autocorrect-disable
  description: 'thinking, 技术分析, Technology Analysis, JIT, python, rust, golang, php, Interpreter, Compiler, ebpf, network protocol, linux, kernel, system, database, Writing',
  // autocorrect-enable
  base: '/',
  lastUpdated: true,
  sitemap: {
    hostname: 'https://blog.ranchulin.com'
  },
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-VFFHZVDPEW' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-VFFHZVDPEW');`
    ]
  ],
  transformPageData(pageData) {
    console.log(pageData)
    console.log('-------------------------------------------------------------------')
    const canonicalUrl = `${ogUrl}/${pageData.relativePath}`
      .replace(/\.md$/, '.html')
    const title = pageData.relativePath.replace(/\.md$/, '').replace('/', '_')
    pageData.frontmatter.head ??= []
    
    const filename = __dirname + '/../../bin/seo/docs/' + pageData.filePath + '.json'
    let metaInfo = {
      'description': '',
      'keywords': [],
      'title': title,
    }
    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, 'utf-8')
      try {
        metaInfo = JSON.parse(content)
      } catch (e) {
        console.log(e)
      }
    }
    pageData.title = title
    if (metaInfo.title) {
      pageData.title = metaInfo.title
    }
    if (metaInfo.description) {
      pageData.description = metaInfo.description
    }
    if (metaInfo.keywords) {
      pageData.frontmatter.head.unshift(['meta', { name: 'keywords', content: metaInfo.keywords.join(',') }])
    }
    pageData.frontmatter.head.unshift(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:title', title }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
    )
    return pageData
  },
  appearance: 'dark',
  themeConfig: {
    search: {
      placeholder: 'Search',
      provider: 'local',
    },
    searchMaxSuggestions: 10,
    editLink: {
      pattern: "https://github.com/deliangyang/sntflyv.github.io/edit/master/docs/:path",
      text: "Edit this page on Github"
    },
    repo: 'https://github.com/deliangyang/sntflyv.github.io/tree/master/docs',
    repoLabel: '更新：' + moment(t.lastTime).utcOffset("+08:00").format('YYYY-MM-DD HH:mm:ss'),
    docsRepo: 'https://github.com/deliangyang/sntflyv.github.io',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'Edit this page on GitLab',
    nav: [
      ...nav,
      {
        text: 'Timeline',
        link: '/daily'
      }
    ],
    sidebar: sidebar,
  },
  plugins: [
    [
      '@vuepress/last-updated',
      {
        dateOptions: {
          hour12: false
        }
      }
    ],
    '@vuepress/back-to-top',
    'mermaidjs',
    [
      '@vuepress/search', {
        searchMaxSuggestions: 10,
        searchHotkeys: ['/', 's'],
      }
    ],
  ],
  markdown: {
    math: true,
    lineNumbers: true,
    toc: { level: [1, 2, 3, 4] },
    externalLinks: { target: '_blank', rel: 'nofollow noopener noreferrer' },
    config: md => {
      // md.use(require('markdown-it-mermaid'))
      md.use(MermaidMarkdown).use(taskLists).use(mathMarkdown)
      md.use(timeline);
    }
  },
  extraWatchFiles: [
    // 相对路径貌似不得行，还是用绝对路径 ok
    __dirname + '/sidebar.js',
    __dirname + '/nav.js',
  ],
}
