
Chrome 开发并没有想象的那么难，如果详细的阅读官方的开发文档，便可以很快的进入开发，实现一个简单的应用。

[官方文档地址](https://developer.chrome.com/docs/extensions/reference/manifest?hl=zh-cn)

`manifest.json` 是扩展程序中必不可少的一个文件，该文件包含了一些参数，比如：应用名称，描述，程序版本，最低使用版本，权限申请，注入脚本，注册内容脚本，图标，可在哪些域名下使用等等。


### manifest.json 最小清单

```
{
  "manifest_version": 3,
  "name": "Minimal Manifest",
  "version": "1.0.0",
  "description": "A basic example extension with only required keys",
  "icons": {
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  }
}
```

### manifest.json 注册内容脚本
```
{
  "manifest_version": 3,
  "name": "Run script automatically",
  "description": "Runs a script on www.example.com automatically when user installs the extension",
  "version": "1.0",
  "icons": {
    "16": "images/icon-16.png",
    "32": "images/icon-32.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  },
    "background": {
    "service_worker": "service-worker.js"
  },
  "content_scripts": [
    {
      "js": [
        "content-script.js"
      ],
      "matches": [
        "http://*.example.com//"
      ]
    }
  ],
  "permissions": ["scripting", "activeTab"],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
}
```

### 开发及注意事项

这里有一点需要注意的是：<b>manifest_version 唯一支持的值是 3</b>，如果有一天你升级了 Chrome，发现本地导入的插件不可以使用，可以将这个值调整为 3，如果你不想调整这个值，可以打开 `chrome://flags/#allow-legacy-mv2-extensions`，将值改成 Enabled，重启浏览器便可以使用了。

### 常用代码使用

1. 获取当前域名

```js
const url = window.location.href;
```

2. 发起 http GET && POST 请求，避开跨域请求
```js
const httpGet = (url) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`HTTP error: ${xhr.status}`));
                }
            }
        }
        xhr.onerror = function () {
            reject(new Error('Network error'));
        };
        xhr.send();
    });
}

const httpPost = (url, data) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onreadystatechange = function () { 
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`HTTP error: ${xhr.status}`));
                }
            }
        }
        xhr.onerror = function () {
            reject(new Error('Network error'));
        };
        xhr.send(JSON.stringify(data));
    });
}

```

3. 注入的脚步中生成 HTML 元素，实现点击事件，并不可以直接使用 onclick 调用函数执行，需要使用如下代码注册监听事件

```js
const btnElement = document.createElement('button');
btnElement.innerHTML = `<button id="btn-click">click me</button>`;
document.body.appendChild(btnElement);

const clickHandle = () => {
    alert('clicked')
}

document.getElementById("btn-click").addEventListener("click", clickHandle);
```