import DefaultTheme from 'vitepress/theme'
import Mermaid from "./Mermaid.vue";
import "vitepress-markdown-timeline/dist/theme/index.css";
import GitalkLayout from "./GitalkLayout.vue";

import 'gitalk/dist/gitalk.css'

export default {
  ...DefaultTheme,
  Layout: GitalkLayout,
  enhanceApp({ app, router, siteData }) {
    // app is the Vue 3 app instance from `createApp()`. router is VitePress'
    // custom router. `siteData` is a `ref` of current site-level metadata.
    // console.log(app);
    // console.log(siteData);
    app.component('Mermaid', Mermaid);
  }
}