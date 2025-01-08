import{_ as n,c as a,a3 as e,o as p}from"./chunks/framework.BOyF8YV7.js";const h=JSON.parse('{"title":"Logstash ClickHouse 插件安装详解及配置示例","description":"本文介绍了如何为 Logstash 安装 ClickHouse 插件，包括手动编译安装、离线包安装以及详细的配置示例（包含 Kafka input 和 ClickHouse output）。  解决国内源安装问题，并提供完整的 Logstash 配置文件供参考。","frontmatter":{"head":[["link",{"rel":"canonical","href":"https://blog.ranchulin.com/t/Linux/2021/2021-03-02-install-logstash-clickhouse-plugin.html"}],["meta",{"property":"og:title","title":"Logstash ClickHouse 插件安装详解及配置示例"}],["meta",{"property":"og:url","content":"https://blog.ranchulin.com/t/Linux/2021/2021-03-02-install-logstash-clickhouse-plugin.html"}],["meta",{"name":"keywords","content":"logstash,clickhouse,插件,安装,output,手动编译,离线安装,http,JSONEachRow,ruby,gem,logstash-output-clickhouse,kafka,配置,demo"}]]},"headers":[],"relativePath":"t/Linux/2021/2021-03-02-install-logstash-clickhouse-plugin.md","filePath":"t/Linux/2021/2021-03-02-install-logstash-clickhouse-plugin.md","lastUpdated":1736299776000}'),l={name:"t/Linux/2021/2021-03-02-install-logstash-clickhouse-plugin.md"};function t(i,s,o,c,u,r){return p(),a("div",null,s[0]||(s[0]=[e(`<h2 id="为-logstash-安装-clickhouse-插件" tabindex="-1">为 logstash 安装 clickhouse 插件 <a class="header-anchor" href="#为-logstash-安装-clickhouse-插件" aria-label="Permalink to &quot;为 logstash 安装 clickhouse 插件&quot;">​</a></h2><h3 id="简单介绍" tabindex="-1">简单介绍 <a class="header-anchor" href="#简单介绍" aria-label="Permalink to &quot;简单介绍&quot;">​</a></h3><p>logstash 的 clickhosue 插件是用 ruby 写的，<a href="https://github.com/funcmike/logstash-output-clickhouse" target="_blank" rel="nofollow noopener noreferrer">https://github.com/funcmike/logstash-output-clickhouse</a> 这是一个归档项目，没有再维护了。主要实现的就是将数据通过 http <code>JSONEachRow</code>的方式提交给 clickhouse，只实现了 output 阶段。</p><h3 id="安装插件-手动编译" tabindex="-1">安装插件，手动编译 <a class="header-anchor" href="#安装插件-手动编译" aria-label="Permalink to &quot;安装插件，手动编译&quot;">​</a></h3><ul><li>确保服务器安装了 <code>ruby</code>，<code>gem</code></li><li>clone 项目，<code>git clone https://github.com/funcmike/logstash-output-clickhouse.git</code></li><li><code>cd logstash-output-clickhouse</code></li><li><code>gem build logstash-output-clickhouse.gemspec</code></li><li><code>logstash-plugin install logstash-output-clickhouse-0.1.0.gem</code></li><li>检查插件是否安装成功：<code>bin/logstash-plugin list | grep clickhouse</code></li></ul><h3 id="注意如果使用了国内源的-可能会出现超时-ssl-的问题" tabindex="-1">注意如果使用了国内源的，可能会出现超时，SSL 的问题 <a class="header-anchor" href="#注意如果使用了国内源的-可能会出现超时-ssl-的问题" aria-label="Permalink to &quot;注意如果使用了国内源的，可能会出现超时，SSL 的问题&quot;">​</a></h3><blockquote><p>增加：<code>:ssl_verify_mode: 0</code></p></blockquote><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>root@debian:~# cat ~/.gemrc</span></span>
<span class="line"><span>---</span></span>
<span class="line"><span>:backtrace: false</span></span>
<span class="line"><span>:bulk_threshold: 1000</span></span>
<span class="line"><span>:sources:</span></span>
<span class="line"><span>- https://gems.ruby-china.com/</span></span>
<span class="line"><span>:update_sources: true</span></span>
<span class="line"><span>:verbose: true</span></span>
<span class="line"><span>:ssl_verify_mode: 0</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h4 id="离线包安装" tabindex="-1">离线包安装 <a class="header-anchor" href="#离线包安装" aria-label="Permalink to &quot;离线包安装&quot;">​</a></h4><ul><li>找一个已经安装好的，打一个离线包安装，注意版本问题</li></ul><h3 id="demo" tabindex="-1">demo <a class="header-anchor" href="#demo" aria-label="Permalink to &quot;demo&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>input {</span></span>
<span class="line"><span>    kafka {</span></span>
<span class="line"><span>        bootstrap_servers =&gt; &quot;internal.kafka.1.xxxx.me:9092&quot;</span></span>
<span class="line"><span>        group_id =&gt; &quot;sync_kd_6&quot;</span></span>
<span class="line"><span>        topics =&gt; [&quot;test.detailKd&quot;]</span></span>
<span class="line"><span>        consumer_threads =&gt; 5</span></span>
<span class="line"><span>        codec =&gt; &quot;json&quot;</span></span>
<span class="line"><span>        auto_offset_reset =&gt; &#39;earliest&#39;</span></span>
<span class="line"><span>        decorate_events =&gt; true</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>filter {</span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>      add_field =&gt; { &quot;@data&quot; =&gt; &quot;%{data}&quot; }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    json {</span></span>
<span class="line"><span>      source =&gt; &quot;@data&quot;</span></span>
<span class="line"><span>      remove_field =&gt; [&quot;@data&quot;, &quot;data&quot;, &quot;@timestamp&quot;, &quot;@version&quot;, &quot;event&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ruby {</span></span>
<span class="line"><span>        code =&gt; &quot;event.set(&#39;time&#39;, event.get(&#39;time&#39;).to_i * 1000)&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>output {</span></span>
<span class="line"><span>    clickhouse {</span></span>
<span class="line"><span>        http_hosts =&gt; [&quot;http://10.0.0.89:8123&quot;]</span></span>
<span class="line"><span>        table =&gt; &quot;detail.kd&quot;</span></span>
<span class="line"><span>        request_tolerance =&gt; 5</span></span>
<span class="line"><span>        flush_size =&gt; 3000</span></span>
<span class="line"><span>        pool_max =&gt; 1000</span></span>
<span class="line"><span>        mutations =&gt; {</span></span>
<span class="line"><span>            &quot;id&quot; =&gt; &quot;id&quot;</span></span>
<span class="line"><span>            &quot;user&quot; =&gt; &quot;user&quot;</span></span>
<span class="line"><span>            &quot;total&quot; =&gt; &quot;total&quot;</span></span>
<span class="line"><span>            &quot;free&quot; =&gt; &quot;free&quot;</span></span>
<span class="line"><span>            &quot;relId&quot; =&gt; &quot;relId&quot;</span></span>
<span class="line"><span>            &quot;type&quot; =&gt; &quot;type&quot;</span></span>
<span class="line"><span>            &quot;time&quot; =&gt; &quot;time&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br></div></div>`,12)]))}const m=n(l,[["render",t]]);export{h as __pageData,m as default};
