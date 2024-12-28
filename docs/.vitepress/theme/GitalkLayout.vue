<template>
  <Layout>
    <template #doc-after>
      <!-- 文章底部 -->
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-6736185910574882"
        data-ad-slot="1978187883"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
      <ins class="adsbygoogle"
        style="display:block; text-align:center;"
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-6736185910574882"
        data-ad-slot="3650362208"></ins>
      <div v-if="initGitalkStep" id="gitalk-container"></div>
    </template>
    <template #aside-top>
      <!-- 左右两侧的广告 -->
      <!-- <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-6736185910574882"
        data-ad-slot="4697814017"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins> -->
    </template>

    <template #aside-bottom>
      <!-- 左右两侧的广告 -->
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-6736185910574882"
        data-ad-slot="4697814017"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </template>

  </Layout>
</template>

<style>
#gitalk-container textarea {
  color: #333;
}
</style>
  <script lang="ts" setup>
  import { useRoute } from 'vitepress'
  import Theme from 'vitepress/theme'
  import { ref, watch, onMounted, nextTick } from 'vue'
  import Gitalk from 'gitalk'
  
  const { Layout } = Theme
  const route = useRoute()
  // 当前加载状态
  // 0 DOM 中无元素，此时调用应将元素插入到 DOM 中，等下个 step 再加载
  // 1 DOM 中有元素，此时调用应用已有 DOM 元素初始化评论插件，加载后步骤完成，不需要再做什么了
  // 2 插件已经加载，此时调用应是切换页面了，应删除页面中的 DOM 元素，等下个 step 再插入
  const initGitalkStep = ref(0)
  
  const initGitalk = () => {
    // 切换页面时，刷新评论组件
    switch (initGitalkStep.value) {
      case 0: // DOM 中无元素，此时调用应将元素插入到 DOM 中，等下个 step 再加载
        initGitalkStep.value = 1
        nextTick(initGitalk)
        return
      case 1: // DOM 中有元素，此时调用应用已有 DOM 元素初始化评论插件，加载后步骤完成，不需要再做什么了
        initGitalkStep.value = 2
        break
      case 2: // 插件已经加载，此时调用应是切换页面了，应删除页面中的 DOM 元素，等下个 step 再插入
        initGitalkStep.value = 0
        nextTick(initGitalk)
        return
    }
  
    // 创建评论组件
    const gitTalk = new Gitalk({
      // GitHub 账号 <==== 按你的实际情况修改 ====>
      owner: 'deliangyang',
      // 仓库名 <==== 按你的实际情况修改 ====>
      repo: 'deliangyang.github.io',
      // 客户端 ID <==== 按你的实际情况修改 ====>
      clientID: 'Ov23lix1Et0qLioXFZyI',
      // 客户端密钥 <==== 按你的实际情况修改 ====>
      clientSecret: '312dd4511ee98f301cf148d2735a008a02a265e1',
      // Github 账号 <==== 按你的实际情况修改 ====>
      admin: [ 'deliangyang' ],
      // 创建 Issue 时，为 Issue 增加的标签
      labels: [ 'Gitalk' ],
      // 如果 Issue 不存在，且登陆的是管理员账号，是否显示创建 Issue 按钮
      createIssueManually: true,
      // 创建 Issue 时，用于唯一标识这篇文章的标记
      id: location.pathname,
      // 撰写评论时，给一个全屏遮罩，聚焦到评论框
      distractionFreeMode: true,
    })
    // 渲染到 DOM 元素中
    gitTalk.render('gitalk-container')
  }
  
  // 初始化和页面切换时加载评论插件
  onMounted(() => {
    initGitalk()
    try {
      window.addAds()
      window.addAds()
      window.addAds()
      console.log('AdUnit loaded')
    } catch (e) {
      console.log(e)
      try {
        let adsbygoogle = window.adsbygoogle || [];
        adsbygoogle.push({});
      } catch (e) {
        console.log(e)
      }
    }
    
  })
  watch(
    () => route.path,
    initGitalk,
  )
  </script>