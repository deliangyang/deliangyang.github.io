import{_ as a,c as l,j as t,a as n,o as s}from"./chunks/framework.BOyF8YV7.js";const R=JSON.parse('{"title":"Rust 高级生命周期详解：子类型、Bound、Trait 对象及匿名生命周期","description":"深入探讨 Rust 高级生命周期特性，包括生命周期子类型、生命周期 bound、trait 对象生命周期和匿名生命周期，以及编译器如何推导生命周期。了解如何确保生命周期长度以及在泛型引用中指定生命周期。","frontmatter":{"head":[["link",{"rel":"canonical","href":"https://blog.ranchulin.com/t/编程语言/Rust/高级的Rust.html"}],["meta",{"property":"og:title","title":"Rust 高级生命周期详解：子类型、Bound、Trait 对象及匿名生命周期"}],["meta",{"property":"og:url","content":"https://blog.ranchulin.com/t/编程语言/Rust/高级的Rust.html"}],["meta",{"name":"keywords","content":"Rust,生命周期,高级生命周期,生命周期子类型,生命周期bound,trait对象生命周期,匿名生命周期,泛型引用,编译器推导"}]]},"headers":[],"relativePath":"t/编程语言/Rust/高级的Rust.md","filePath":"t/编程语言/Rust/高级的Rust.md","lastUpdated":1735898091000}'),r={name:"t/编程语言/Rust/高级的Rust.md"};function o(u,e,i,d,c,p){return s(),l("div",null,e[0]||(e[0]=[t("h3",{id:"高级生命周期",tabindex:"-1"},[n("高级生命周期 "),t("a",{class:"header-anchor",href:"#高级生命周期","aria-label":'Permalink to "高级生命周期"'},"​")],-1),t("p",null,"每一个引用都有生命周期，不过大部分的情况下 Rust 允许我们省略生命周期，编译器可以自动帮助我们推导出来，这里我们看到三个我们还未涉及到的生命周期高级特征：",-1),t("ol",null,[t("li",null,"生命周期子类型，确保某个生命周期长于另一个生命周期的方式"),t("li",null,"生命周期 bound，用于指定泛型引用的生命周期"),t("li",null,"trait 对象生命周期，以及他们是如何推断的，何时需要指定"),t("li",null,"匿名生命周期：使得生命周期省略更为明显。")],-1)]))}const h=a(r,[["render",o]]);export{R as __pageData,h as default};
