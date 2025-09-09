
Chrome 实现一个侧边栏其实很方便，因为侧边栏的框架 Chrome 已经帮我们实现好了，只需要配置权限，然后实现页面即可。

## 配置权限

在 `manifest.json` 文件中增加如下配置即可。permissions 添加 "sidePanel"，side_panel 设置默认的文件路径 `"side-panel.html"`。

```json
{
    ...
    "permissions": [
        ...
        "sidePanel"
    ],
    "background": {
        "service_worker": "background.js"
    },
    "side_panel": {
        "default_path": "side-panel.html"
    }
}
```

当然 Chrome 也支持多个侧边栏，具体实现需求可以查阅官方文档。Chrome 支持侧边栏支持如下特性：字典侧边栏，全局侧边栏，多个侧边栏，打开侧边栏，针对特定网站的侧边栏。

## side-panel.html 编码

侧边栏的代码可以很简单，然后通过 js 动态生成 DOM 即可

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>我的侧边栏</title>
  </head>
  <body>
    <div class="projects">

    </div>
    <script src="side-panel.js"></script>
  </body>
</html>

```

比如使用 `document.querySelector('.projects').innerHTML = html;` 直接在 DOM 元素中插入 HTMl 代码。或者 `createElement` DOM 元素，然后在其它元素后面 `appendChild` 等等。

点击插件图标按钮，直接打开侧边栏
```js
// background.js
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
```

### 跨域问题

Chrome 插件基本上不需要考虑跨域的问题。只需要在 `manifest.json` 文件中配置 `host_permissions` 权限即可。

```json
{
  ...
  "host_permissions": [
    "https://api.example.com/*",
    "https://another-api.example.com/*"
  ],
  ...
}
```

当前页面的脚本可以直接发起跨域请求。如果需要请求其它域名，则需要在 background.js 中使用 `chrome.runtime.onMessage` 监听消息，然后在回调函数中发起请求，最后通过 `sendResponse` 返回结果。

```js
// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchData') {
    const init = {
      method,
      headers,
      credentials: 'include', // include cookies
    };
    fetch(request.url, init)
      .then((response) => response.json())
      .then((data) => sendResponse({ data }))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // 表示异步响应
  }
});
```

## 实现一个测试侧边栏，获取百度的标题，展示在侧边栏中

### manifest.json 配置

```json
{
  "manifest_version": 3,
  "name": "测试侧边栏",
  "version": "1.0",
  "description": "一个简单的测试侧边栏插件",
  "host_permissions": [
    "https://*.baidu.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "permissions": [
    "sidePanel"
  ],
  "side_panel": {
    "default_path": "side-panel.html"
  }
}
```

### side-panel.html

```html
<!DOCTYPE html>
<html lang="en"></html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的侧边栏</title>
</head>
<body>
  <div class="projects">

  </div>
  <script src="side-panel.js"></script>
</body>
</html>
```

### side-panel.js

```js
// Example usage: Fetch Baidu title when the sidebar is loaded
document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ type: 'FETCH', url: 'https://www.baidu.com' }, (response) => {
    if (response?.ok && response.body) {
      const titleMatch = response.body.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : '未找到标题';
      document.querySelector('.projects').innerHTML = `<h1>${title}</h1>`;
    } else {
      console.error('Error fetching Baidu title:', response?.error);
      document.querySelector('.projects').innerHTML = `<h1>加载标题失败</h1>`;
    }
  });
});
```

### background.js

```js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  if (message.type === 'PING') {
    sendResponse({ ok: true, ts: Date.now() });
  }

  // Handle cross-origin fetch with cookies from background
  if (message?.type === 'FETCH') {
    const { url, method = 'GET', headers = {}, body } = message;
    if (!url) {
      sendResponse({ ok: false, error: 'Missing url' });
      return;
    }

    const init = {
      method,
      headers,
      credentials: 'include', // include cookies
    };
    if (body !== undefined && body !== null) {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (!init.headers || !('Content-Type' in init.headers)) {
        init.headers = { ...(init.headers || {}), 'Content-Type': 'application/json' };
      }
    }

    fetch(url, init)
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();
        sendResponse({
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          body: text,
          contentType,
        });
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.message || String(err) });
      });

    return true; // async
  }
});

// Optional: Open side panel on action icon click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
```
