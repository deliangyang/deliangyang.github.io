
Zed 作为代码编辑器，在开发过程中给自己开发了一套 UI 框架，叫 `gpui`。可以通过这个地址访问 [www.gpui.rs](https://www.gpui.rs/)。

> A fast, productive UI framework for Rust from the creators of Zed.

官方也特别有趣，“今天，它是 Zed 的 UI 框架，明天，是你的！”，“我们希望您能帮助我们实现这一目标。”。是不是很有意思，很大的诚意邀请你使用它，开发它，让它创造更大的价值。这就是开源精神，从来不怕你抄袭，希望你能一起来完善它，传播它等等。

> Today, it's Zed's UI framework. Tomorrow, it's yours!  
> We'd love your help making that happen.

### 尝试使用 gpui 写一个 hello world 的桌面程序

官方并没有提供 gpui 相关的文档，倒是提供了一些列的 demo 案例。如果你想学习的话，可以按照案例一个一个的推敲，模仿来入门。

通过如下命令创建一个项目，名字叫 `gpui-test-rs`。
```
cargo new gpui-test-rs
```

编辑 Cargo.toml，引入 gpui 库的依赖，这里我们直接填写 github 的地址。
```toml
[package]
name = "gpui-test-rs"
version = "0.1.0"
edition = "2021"

[dependencies]
gpui = { git = "https://github.com/zed-industries/zed" }
```

贴入官方提供的 Hello Word 程序案例代码

```rust
use gpui::*;
 
struct HelloWorld {
    text: SharedString,
}
 
impl Render for HelloWorld {
    fn render(&mut self, _cx: &mut ViewContext<Self>) -> impl IntoElement {
        div()
            .flex()
            .bg(rgb(0x2e7d32))
            .size_full()
            .justify_center()
            .items_center()
            .text_xl()
            .text_color(rgb(0xffffff))
            .child(format!("Hello, {}!", &self.text))
    }
}
 
fn main() {
    App::new().run(|cx: &mut AppContext| {
        cx.open_window(WindowOptions::default(), |cx| {
            cx.new_view(|_cx| HelloWorld {
                text: "World".into(),
            })
        })
        .unwrap();
    });
}
```

执行命令 `cargo run` 就可以看到我们生成的桌面程序了。