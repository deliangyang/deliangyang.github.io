import{_ as n,c as a,a3 as e,o as p}from"./chunks/framework.BOyF8YV7.js";const o=JSON.parse('{"title":"DNS协议详解：Wireshark抓包分析及数据结构解读","description":"本文详解DNS协议，通过Wireshark抓包分析DNS查询和应答过程，深入探讨DNS数据包的二进制结构和可视化数据结构，包含A记录和CNAME记录的解析示例。","frontmatter":{"head":[["link",{"rel":"canonical","href":"https://blog.ranchulin.com/t/网络编程/DNS协议/DNS协议.html"}],["meta",{"property":"og:title","title":"DNS协议详解：Wireshark抓包分析及数据结构解读"}],["meta",{"property":"og:url","content":"https://blog.ranchulin.com/t/网络编程/DNS协议/DNS协议.html"}],["meta",{"name":"keywords","content":"DNS,DNS协议,DNS查询,Wireshark,抓包,域名解析,数据包分析,二进制dump,A记录,CNAME记录,IP地址,端口53,dig命令"}]]},"headers":[],"relativePath":"t/网络编程/DNS协议/DNS协议.md","filePath":"t/网络编程/DNS协议/DNS协议.md","lastUpdated":1736299776000}'),l={name:"t/网络编程/DNS协议/DNS协议.md"};function i(r,s,c,b,t,d){return p(),a("div",null,s[0]||(s[0]=[e(`<h2 id="dns-协议" tabindex="-1">DNS 协议 <a class="header-anchor" href="#dns-协议" aria-label="Permalink to &quot;DNS 协议&quot;">​</a></h2><ul><li>发起 DNS 查询 <code>dig blog.sourcedev.cc</code></li><li>WireShark 抓包，过滤关键词 <code>dns</code> 即可</li><li>DNS 服务器默认端口 53</li></ul><h3 id="查询" tabindex="-1">查询 <a class="header-anchor" href="#查询" aria-label="Permalink to &quot;查询&quot;">​</a></h3><h4 id="数据包二进制-dump" tabindex="-1">数据包二进制 dump <a class="header-anchor" href="#数据包二进制-dump" aria-label="Permalink to &quot;数据包二进制 dump&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>0000   4c f0 01 20 00 01 00 00 00 00 00 01 03 77 77 77   L.. .........www</span></span>
<span class="line"><span>0010   09 73 6f 75 72 63 65 64 65 76 02 63 63 00 00 01   .sourcedev.cc...</span></span>
<span class="line"><span>0020   00 01 00 00 29 10 00 00 00 00 00 00 00            ....)........</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h4 id="可视化数据结构" tabindex="-1">可视化数据结构 <a class="header-anchor" href="#可视化数据结构" aria-label="Permalink to &quot;可视化数据结构&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Domain Name System (query)</span></span>
<span class="line"><span>    Transaction ID: 0x4cf0</span></span>
<span class="line"><span>    Flags: 0x0120 Standard query</span></span>
<span class="line"><span>    Questions: 1</span></span>
<span class="line"><span>    Answer RRs: 0</span></span>
<span class="line"><span>    Authority RRs: 0</span></span>
<span class="line"><span>    Additional RRs: 1</span></span>
<span class="line"><span>    Queries</span></span>
<span class="line"><span>        www.sourcedev.cc: type A, class IN</span></span>
<span class="line"><span>            Name: www.sourcedev.cc</span></span>
<span class="line"><span>            [Name Length: 16]</span></span>
<span class="line"><span>            [Label Count: 3]</span></span>
<span class="line"><span>            Type: A (Host Address) (1)</span></span>
<span class="line"><span>            Class: IN (0x0001)</span></span>
<span class="line"><span>    Additional records</span></span>
<span class="line"><span>        &lt;Root&gt;: type OPT</span></span>
<span class="line"><span>    [Response In: 17]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h3 id="应答" tabindex="-1">应答 <a class="header-anchor" href="#应答" aria-label="Permalink to &quot;应答&quot;">​</a></h3><h4 id="数据包二进制-dump-1" tabindex="-1">数据包二进制 dump <a class="header-anchor" href="#数据包二进制-dump-1" aria-label="Permalink to &quot;数据包二进制 dump&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>0000   4c f0 81 80 00 01 00 01 00 00 00 00 03 77 77 77   L............www</span></span>
<span class="line"><span>0010   09 73 6f 75 72 63 65 64 65 76 02 63 63 00 00 01   .sourcedev.cc...</span></span>
<span class="line"><span>0020   00 01 c0 0c 00 01 00 01 00 00 02 58 00 04 2a c0   ...........X..*.</span></span>
<span class="line"><span>0030   4e 39                                             N9</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><h4 id="可视化数据结构-1" tabindex="-1">可视化数据结构 <a class="header-anchor" href="#可视化数据结构-1" aria-label="Permalink to &quot;可视化数据结构&quot;">​</a></h4><ul><li>权威服务器名称只是存了一个数值（数据包 data 所在位置 offset 开始位置），这个操作可以减少数据包的大小</li></ul><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Domain Name System (response)</span></span>
<span class="line"><span>    Transaction ID: 0x4cf0</span></span>
<span class="line"><span>    Flags: 0x8180 Standard query response, No error</span></span>
<span class="line"><span>    Questions: 1</span></span>
<span class="line"><span>    Answer RRs: 1</span></span>
<span class="line"><span>    Authority RRs: 0</span></span>
<span class="line"><span>    Additional RRs: 0</span></span>
<span class="line"><span>    Queries</span></span>
<span class="line"><span>        www.sourcedev.cc: type A, class IN</span></span>
<span class="line"><span>            Name: www.sourcedev.cc</span></span>
<span class="line"><span>            [Name Length: 16]</span></span>
<span class="line"><span>            [Label Count: 3]</span></span>
<span class="line"><span>            Type: A (Host Address) (1)</span></span>
<span class="line"><span>            Class: IN (0x0001)</span></span>
<span class="line"><span>    Answers</span></span>
<span class="line"><span>        www.sourcedev.cc: type A, class IN, addr 42.192.78.57</span></span>
<span class="line"><span>    [Request In: 15]</span></span>
<span class="line"><span>    [Time: 0.058614000 seconds]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h4 id="分析-answers-部分的数据结构" tabindex="-1">分析 Answers 部分的数据结构 <a class="header-anchor" href="#分析-answers-部分的数据结构" aria-label="Permalink to &quot;分析 Answers 部分的数据结构&quot;">​</a></h4><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>    Queries</span></span>
<span class="line"><span>        blog.sourcedev.cc: type A, class IN</span></span>
<span class="line"><span>            Name: blog.sourcedev.cc</span></span>
<span class="line"><span>            [Name Length: 17]</span></span>
<span class="line"><span>            [Label Count: 3]</span></span>
<span class="line"><span>            Type: A (Host Address) (1)</span></span>
<span class="line"><span>            Class: IN (0x0001)</span></span>
<span class="line"><span>    Answers</span></span>
<span class="line"><span>        blog.sourcedev.cc: type CNAME, class IN, cname deliangyang.github.io</span></span>
<span class="line"><span>            Name: blog.sourcedev.cc</span></span>
<span class="line"><span>            Type: CNAME (Canonical NAME for an alias) (5)</span></span>
<span class="line"><span>            Class: IN (0x0001)</span></span>
<span class="line"><span>            Time to live: 509</span></span>
<span class="line"><span>            Data length: 23</span></span>
<span class="line"><span>            CNAME: deliangyang.github.io</span></span>
<span class="line"><span>        deliangyang.github.io: type A, class IN, addr 185.199.108.153</span></span>
<span class="line"><span>            Name: deliangyang.github.io</span></span>
<span class="line"><span>            Type: A (Host Address) (1)</span></span>
<span class="line"><span>            Class: IN (0x0001)</span></span>
<span class="line"><span>            Time to live: 509</span></span>
<span class="line"><span>            Data length: 4</span></span>
<span class="line"><span>            Address: 185.199.108.153</span></span>
<span class="line"><span>    [Request In: 39]</span></span>
<span class="line"><span>    [Time: 0.062407000 seconds]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><ul><li>一行是 16 个字节</li><li>0xc0 为分隔符</li><li><code>Name: deliangyang.github.io</code> 用 <code>0xc0 0x2f</code> 表示，offset 为 47，即第二行倒数第一个位置（16 * 3 - 1 0x0b 0x65 0x65 ...），所以反查到的前一个 name 的位置</li></ul><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>0000   a7 28 81 80 00 01 00 05 00 00 00 00 04 62 6c 6f   .(...........blo</span></span>
<span class="line"><span>0010   67 09 73 6f 75 72 63 65 64 65 76 02 63 63 00 00   g.sourcedev.cc..</span></span>
<span class="line"><span>0020   01 00 01 c0 0c 00 05 00 01 00 00 01 fd 00 17 0b   ................</span></span>
<span class="line"><span>0030   64 65 6c 69 61 6e 67 79 61 6e 67 06 67 69 74 68   deliangyang.gith</span></span>
<span class="line"><span>0040   75 62 02 69 6f 00 c0 2f 00 01 00 01 00 00 01 fd   ub.io../........</span></span>
<span class="line"><span>0050   00 04 b9 c7 6c 99 c0 2f 00 01 00 01 00 00 01 fd   ....l../........</span></span>
<span class="line"><span>0060   00 04 b9 c7 6e 99 c0 2f 00 01 00 01 00 00 01 fd   ....n../........</span></span>
<span class="line"><span>0070   00 04 b9 c7 6f 99 c0 2f 00 01 00 01 00 00 01 fd   ....o../........</span></span>
<span class="line"><span>0080   00 04 b9 c7 6d 99                                 ....m.</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div>`,17)]))}const m=n(l,[["render",i]]);export{o as __pageData,m as default};
