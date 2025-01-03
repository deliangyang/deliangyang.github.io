import{_ as a,c as e,a3 as l,o as i}from"./chunks/framework.BOyF8YV7.js";const m=JSON.parse('{"title":"进程间通信（IPC）详解：管道、消息队列、信号量、共享内存及Socket","description":"本文介绍了进程间通信（IPC）的几种常用方法，包括管道（无名管道和命名管道）、消息队列、信号量、共享内存和Socket，并分别解释了其原理和应用场景，适用于需要了解多进程通信机制的开发者。","frontmatter":{"head":[["link",{"rel":"canonical","href":"https://blog.ranchulin.com/t/Linux/进程-线程-协程/IPC进程间通讯.html"}],["meta",{"property":"og:title","title":"进程间通信（IPC）详解：管道、消息队列、信号量、共享内存及Socket"}],["meta",{"property":"og:url","content":"https://blog.ranchulin.com/t/Linux/进程-线程-协程/IPC进程间通讯.html"}],["meta",{"name":"keywords","content":"IPC,进程间通信,InterProcess Communication,管道,无名管道,命名管道,消息队列,信号量,共享内存,Socket,进程同步,多进程通信,父子进程通信"}]]},"headers":[],"relativePath":"t/Linux/进程-线程-协程/IPC进程间通讯.md","filePath":"t/Linux/进程-线程-协程/IPC进程间通讯.md","lastUpdated":1735898091000}'),o={name:"t/Linux/进程-线程-协程/IPC进程间通讯.md"};function n(r,t,c,u,s,h){return i(),e("div",null,t[0]||(t[0]=[l('<h2 id="进程间通讯-ipc-interprocess-conmunication" tabindex="-1">进程间通讯 IPC（InterProcess Conmunication） <a class="header-anchor" href="#进程间通讯-ipc-interprocess-conmunication" aria-label="Permalink to &quot;进程间通讯 IPC（InterProcess Conmunication）&quot;">​</a></h2><blockquote><p>不同进程之间传播或者交换信息</p></blockquote><h3 id="管道-无名管道和命名管道" tabindex="-1">管道（无名管道和命名管道） <a class="header-anchor" href="#管道-无名管道和命名管道" aria-label="Permalink to &quot;管道（无名管道和命名管道）&quot;">​</a></h3><p>在内核中申请一块固定大小的缓冲区，程序拥有写入和读取的权利，可以看成是特殊的文件</p><ul><li>无名管道 <ul><li>fork 实现父子进程通讯</li></ul></li><li>命名管道 <ul><li>没有关系的进程间通讯</li></ul></li></ul><h3 id="消息队列" tabindex="-1">消息队列 <a class="header-anchor" href="#消息队列" aria-label="Permalink to &quot;消息队列&quot;">​</a></h3><ul><li>内核中创建一个队列，队列中元素都是一个数据报，不同的进程可以通过句柄访问这个队列</li><li>消息队列独立于发送和接收进程，可以通过顺序和消息类型读取，或者 fifo 读取</li><li>可以实现双向通讯</li></ul><h3 id="信号量" tabindex="-1">信号量 <a class="header-anchor" href="#信号量" aria-label="Permalink to &quot;信号量&quot;">​</a></h3><ul><li>内核中创建一个信号量集合（数组）</li><li>默认 1，P -1, V +1</li><li>通过临界资源进行保护实现多进程的同步</li></ul><h3 id="共享存储" tabindex="-1">共享存储 <a class="header-anchor" href="#共享存储" aria-label="Permalink to &quot;共享存储&quot;">​</a></h3><ul><li>将同一块物理内存一块映射到不同的进程的虚拟地址空间中，实现不同进程对同一资源的共享</li><li>不需要从用户态 -&gt; 内核态频繁的切换和数据拷贝</li><li>内存共享是临界资源，需要操作是必须要保证原子性，使用信号量或者互斥锁都可以实现</li></ul><h3 id="socket-不同主机上的两个进程通讯" tabindex="-1">Socket 不同主机上的两个进程通讯 <a class="header-anchor" href="#socket-不同主机上的两个进程通讯" aria-label="Permalink to &quot;Socket 不同主机上的两个进程通讯&quot;">​</a></h3><ul><li>一组抽象的接口</li></ul>',13)]))}const p=a(o,[["render",n]]);export{m as __pageData,p as default};
