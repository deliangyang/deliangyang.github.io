import{_ as t,c as a,a3 as o,o as r}from"./chunks/framework.BOyF8YV7.js";const p=JSON.parse('{"title":"CSRF 跨站请求伪造攻击：原理、防御及解决方案","description":"详解 CSRF 跨站请求伪造攻击原理及防御方案，包括动态 token、参数加密、JS 代码混淆等有效措施，帮助您提升网站安全等级，保护用户数据。","frontmatter":{"head":[["link",{"rel":"canonical","href":"https://blog.ranchulin.com/t/信息安全对抗/web安全/CSRF攻击.html"}],["meta",{"property":"og:title","title":"CSRF 跨站请求伪造攻击：原理、防御及解决方案"}],["meta",{"property":"og:url","content":"https://blog.ranchulin.com/t/信息安全对抗/web安全/CSRF攻击.html"}],["meta",{"name":"keywords","content":"CSRF,跨站请求伪造,攻击,漏洞,安全,cookie,token,HTTP请求,解决方案,动态token,参数加密,js代码混淆"}]]},"headers":[],"relativePath":"t/信息安全对抗/web安全/CSRF攻击.md","filePath":"t/信息安全对抗/web安全/CSRF攻击.md","lastUpdated":1735898091000}'),l={name:"t/信息安全对抗/web安全/CSRF攻击.md"};function n(i,e,c,s,h,d){return r(),a("div",null,e[0]||(e[0]=[o('<h2 id="csrf-跨站请求伪造攻击" tabindex="-1">CSRF 跨站请求伪造攻击 <a class="header-anchor" href="#csrf-跨站请求伪造攻击" aria-label="Permalink to &quot;CSRF 跨站请求伪造攻击&quot;">​</a></h2><h3 id="攻击原来" tabindex="-1">攻击原来 <a class="header-anchor" href="#攻击原来" aria-label="Permalink to &quot;攻击原来&quot;">​</a></h3><ul><li>登录服务器，拿到 cookie 或者 token，用户根据网站请求的规则（参数编码等）可以构造 HTTP 请求，发送数据，不局限在浏览器页面</li></ul><h3 id="解决方案" tabindex="-1">解决方案 <a class="header-anchor" href="#解决方案" aria-label="Permalink to &quot;解决方案&quot;">​</a></h3><ul><li>动态 token，加载页面生成 token，提交数据使用当前页面生成的 token，增加伪造请求的难度</li><li>参数加密，js 代码混淆等</li></ul>',5)]))}const u=t(l,[["render",n]]);export{p as __pageData,u as default};
