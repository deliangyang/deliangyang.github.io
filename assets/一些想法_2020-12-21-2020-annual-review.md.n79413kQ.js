import{_ as l,c as i,a3 as e,o as t}from"./chunks/framework.BOyF8YV7.js";const p=JSON.parse('{"title":"2020年终总结与2021年规划：技术提升、生活感悟与未来展望","description":"2020年终总结，涵盖工作（大数据技术应用、项目优化、代码质量提升、升职加薪）、生活（学车、理财投资、摄影）、社交及业余生活（淘宝店经营、自媒体运营）等方面，并对2021年制定了详细计划，包括购房装修、完成人生大事、提升理财能力等。","frontmatter":{"head":[["link",{"rel":"canonical","href":"https://blog.ranchulin.com/一些想法/2020-12-21-2020-annual-review.html"}],["meta",{"property":"og:title","title":"2020年终总结与2021年规划：技术提升、生活感悟与未来展望"}],["meta",{"property":"og:url","content":"https://blog.ranchulin.com/一些想法/2020-12-21-2020-annual-review.html"}],["meta",{"name":"keywords","content":"2020年终总结,年度回顾,职业发展,技术总结,ElasticSearch,Kafka,Spark,Flink,MySQL,PHP,CI/CD,单元测试,编译原理,YAPI,API文档,升职加薪,理财投资,基金,黄金,外汇,摄影,自媒体,淘宝店,个人规划,2021计划,智能家居,驾照"}]]},"headers":[],"relativePath":"一些想法/2020-12-21-2020-annual-review.md","filePath":"一些想法/2020-12-21-2020-annual-review.md","lastUpdated":1735898091000}'),r={name:"一些想法/2020-12-21-2020-annual-review.md"};function n(o,a,h,s,c,d){return t(),i("div",null,a[0]||(a[0]=[e('<h2 id="_2020-annual-review" tabindex="-1">2020 Annual Review <a class="header-anchor" href="#_2020-annual-review" aria-label="Permalink to &quot;2020 Annual Review&quot;">​</a></h2><p>看到不少人都在总结自己的 2020 年，觉得自己也应该总结一下自己的 2020 年，对 2021 年提前做一些规划。</p><h3 id="工作" tabindex="-1">工作 <a class="header-anchor" href="#工作" aria-label="Permalink to &quot;工作&quot;">​</a></h3><p>尝试了不少新的技术，主要还是大数据方向的研究，如 ElasticSearch，Kafka，Spark，Flink。</p><ol><li>项目上有个模块每天能产生一个多亿的流水，之前用的 MySQL 已经无法支撑这个数量级的读写及聚合查询，提出了新的方案，迁移到 Kafka 中，然后通过程序和 Logstash 将数据收集写入 4 个 1T 的 ES 集群。迁移的方案是双写，数据写入 Kafka，同时原有的逻辑不变，待观察数日，数据无异，去点原有的逻辑，流水数据直接写入 Kafka，再同步至 ES 中。ES 的搜索功能强大，支持海量数据聚合，满足了我们数据查询，统计的需求。</li><li>为了提供项目的质量，在原有 PHP 项目的 CI/CD 中加入了 phpmd，phpstan 检查，同时加上 PHPUnit，帮助大家对代码进行单元测试。</li><li>核心服务剥离出原有的代码，形成单独的服务，尝试火焰图对性能分析，目前这个项目没有完全切换流量，看起来还是可以的。</li><li>深入的学习编译原理，将公司代码中的 API 文档，自动同步至 YAPI，结构化 API 文档。</li><li>Code Review。</li><li>工资涨幅 40%，实现一年两次涨薪。</li><li>年度报表统计使用了 Spark、Flink 复盘，效率显著。用 Flink 收集日常亿级日志的错误信息，统计分析数据。</li></ol><h3 id="生活" tabindex="-1">生活 <a class="header-anchor" href="#生活" aria-label="Permalink to &quot;生活&quot;">​</a></h3><ol><li>完成了一些一两年前对她许下的承诺。尝试创造更好的生活环境，但是精力有限，很多事情都是越搞越砸，最后无疾而终。</li><li>终于开始学车，目前已经进行科目二的训练，争取下个星期过科目二。</li><li>尝试了一下学习理财投资，基金、黄金、外汇。</li><li>摄影技术提升，多给她拍几张美美的照片。</li></ol><h3 id="社交" tabindex="-1">社交 <a class="header-anchor" href="#社交" aria-label="Permalink to &quot;社交&quot;">​</a></h3><ol><li>基本上不怎么喜欢主动联系人，一个玩得来的今年 5 月份也去北京了，偶尔联系，在重庆的时候偶尔还可以打个球，吃个饭，聊聊创业计划。</li><li>交友原则依旧，宁缺毋滥，寻求志同道合，高质量的朋友，以致于目前也没有新结交合得来的朋友，可能是自己懒惰的托辞。</li></ol><h3 id="业余" tabindex="-1">业余 <a class="header-anchor" href="#业余" aria-label="Permalink to &quot;业余&quot;">​</a></h3><ol><li>今年疫情的影响，上半年有大量的时间可以做自己的事情，以至于自己耗费了大量的精力和时间去经营自己的 TB 店，忽略了学习和提升自己。TB 店上班年已经超额完成去年的计划的 120%（逐年提升 20%）。以至于下半年基本没怎么经营它，比较佛系。</li><li>经营自媒体，打造自己的 IP 及流量，效果不明显。可能是自己没有做好定位及选题。</li></ol><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>2020 年依旧是普通的一年，没有什么亮点，不过没有上一年过得那么提心吊胆，消费能力相比去年要强一点。想得太多，太片面，总想以技术的角度去解决工作和生活中的问题。由于去年没有怎么制定计划，以至于无法估摸完成进度。</p><ol><li>升职加薪（加薪了，升职有那个意向，但是一直吊着，其实自己也没有那个把我能够管理好其他的人，也不太喜欢推着别人走，执行力差吧，大概是她认为的那一点吧）</li><li>TB 店上半年实现了去年 120% 收入计划（100%）</li><li>投资理财收入几百块</li><li>每个月阅读一本书，没有完成，断断续续（10%）</li><li>实现了几个承诺，仍然差很多（20%，仍要努力）</li><li>提升摄影技术（10%）</li><li>锻炼身体，今年基本没怎么锻炼，坚持过一小段时间的跑步，跑完 5 公里（20%）</li></ol><h3 id="明年的计划" tabindex="-1">明年的计划 <a class="header-anchor" href="#明年的计划" aria-label="Permalink to &quot;明年的计划&quot;">​</a></h3><ol><li>接房装修，智能家居置入</li><li>完成人生大事</li><li>拿到驾照</li><li>如果疫情结束，出去玩几趟</li><li>提高收入，形成自己的投资风格，提升我们的生活质量（除去固定开支，理财投资收益 10%）</li><li>跳出程序员思维圈子，结交新的朋友</li><li>职业规划，解决上班不愉快的问题</li><li>提升自身能力，锻炼身体，摄影，编码，思考能力，阅读书籍</li></ol>',16)]))}const m=l(r,[["render",n]]);export{p as __pageData,m as default};
