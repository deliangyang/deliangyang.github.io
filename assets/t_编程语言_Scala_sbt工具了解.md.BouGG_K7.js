import{_ as t,c as s,a3 as e,o as l}from"./chunks/framework.BOyF8YV7.js";const b=JSON.parse('{"title":"sbt Scala构建工具详解：配置、依赖、命令及最佳实践","description":"深入学习sbt Scala构建工具，涵盖sbt构建文件配置、依赖管理(+=, %, %%)、常用命令(clean, compile, test, run, package, console, reload)以及目录结构详解。提升你的Scala项目构建效率。","frontmatter":{"head":[["link",{"rel":"canonical","href":"https://blog.ranchulin.com/t/编程语言/Scala/sbt工具了解.html"}],["meta",{"property":"og:title","title":"sbt Scala构建工具详解：配置、依赖、命令及最佳实践"}],["meta",{"property":"og:url","content":"https://blog.ranchulin.com/t/编程语言/Scala/sbt工具了解.html"}],["meta",{"name":"keywords","content":"sbt,Scala,构建工具,build.sbt,依赖管理,+= ,%,%%,compile,test,run,package,clean,console,reload,scalaVersion,libraryDependencies,构建文件,目录结构,常用命令"}]]},"headers":[],"relativePath":"t/编程语言/Scala/sbt工具了解.md","filePath":"t/编程语言/Scala/sbt工具了解.md","lastUpdated":1735898091000}'),i={name:"t/编程语言/Scala/sbt工具了解.md"};function n(r,a,c,o,d,h){return l(),s("div",null,a[0]||(a[0]=[e(`<h2 id="sbt-scala-构建工具" tabindex="-1">sbt Scala 构建工具 <a class="header-anchor" href="#sbt-scala-构建工具" aria-label="Permalink to &quot;sbt Scala 构建工具&quot;">​</a></h2><blockquote><p>sbt 是一款 scala 的构建管理工具，这里就不做安装的解释了，主要是深入的了解一下里面的参数，已经字符的含义，如：<code>:=</code>、<code>%</code>、<code>%%</code>等</p></blockquote><h3 id="目录结构" tabindex="-1">目录结构 <a class="header-anchor" href="#目录结构" aria-label="Permalink to &quot;目录结构&quot;">​</a></h3><ul><li>源代码目录 <ul><li>src/main/scala or src/main/java</li></ul></li><li>测试文件目录 <ul><li>src/test/scala or src/test/java</li></ul></li><li>数据资源 <ul><li>src/main/resources or src/test/resources</li></ul></li><li>lib jar 包</li></ul><h3 id="构建文件-build-bat" tabindex="-1">构建文件 build.bat <a class="header-anchor" href="#构建文件-build-bat" aria-label="Permalink to &quot;构建文件 build.bat&quot;">​</a></h3><div class="language-scala vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">scala</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">lazy</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> val</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> root</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (project in file(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  .settings(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;hello&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    version </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1.0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    scalaVersion </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;2.12.13&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  )</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><ul><li>+= 表示追加</li><li>% 表示字符串构造 lvy 模块 ID 的</li></ul><h3 id="依赖" tabindex="-1">依赖 <a class="header-anchor" href="#依赖" aria-label="Permalink to &quot;依赖&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>libraryDependencies += groupID % artifactID % revision % configuration</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h3 id="常用命令" tabindex="-1">常用命令 <a class="header-anchor" href="#常用命令" aria-label="Permalink to &quot;常用命令&quot;">​</a></h3><table tabindex="0"><thead><tr><th style="text-align:center;">命令</th><th style="text-align:center;">解释说明</th></tr></thead><tbody><tr><td style="text-align:center;">clean</td><td style="text-align:center;">删除所有生成的文件（在 target 目录下）。</td></tr><tr><td style="text-align:center;">compile</td><td style="text-align:center;">编译源文件（在 src/main/scala 和 src/main/java 目录下）。</td></tr><tr><td style="text-align:center;">test</td><td style="text-align:center;">编译和运行所有测试。</td></tr><tr><td style="text-align:center;">console</td><td style="text-align:center;">进入到一个包含所有编译的文件和所有依赖的 classpath 的 Scala 解析器。输入 :quit，</td></tr><tr><td style="text-align:center;">run</td><td style="text-align:center;">&lt;参数&gt;* 在和 sbt 所处的同一个虚拟机上执行项目的 main class。</td></tr><tr><td style="text-align:center;">package</td><td style="text-align:center;">将 src/main/resources 下的文件和 src/main/scala 以及 src/main/java 中编译出来的 class 文件打包成一个 jar 文件。</td></tr><tr><td style="text-align:center;">help</td><td style="text-align:center;">&lt;命令&gt; 显示指定的命令的详细帮助信息。如果没有指定命令，会显示所有命令的简介。</td></tr><tr><td style="text-align:center;">reload</td><td style="text-align:center;">重新加载构建定义（build.sbt，project/<em>.scala，project/</em>.sbt 这些文件中定义的内容)。在修改了构建定义文件之后需要重新加载。</td></tr></tbody></table><h2 id="参考文档" tabindex="-1">参考文档 <a class="header-anchor" href="#参考文档" aria-label="Permalink to &quot;参考文档&quot;">​</a></h2><ul><li><a href="https://www.scala-sbt.org/1.x/docs/zh-cn/Running.html" target="_blank" rel="nofollow noopener noreferrer">https://www.scala-sbt.org/1.x/docs/zh-cn/Running.html</a></li><li><a href="https://www.scala-sbt.org/1.x/docs/sbt-by-example.html" target="_blank" rel="nofollow noopener noreferrer">https://www.scala-sbt.org/1.x/docs/sbt-by-example.html</a></li></ul>`,13)]))}const k=t(i,[["render",n]]);export{b as __pageData,k as default};
