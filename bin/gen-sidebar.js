#!/usr/bin/env node

const fs = require('fs')
const path = require('path');
const { exit } = require('process');

// 文档目录
const WORK_PATH = process.argv[2] || 'docs'
// 去掉文档前缀 docs/
const re_prefix = new RegExp(`^${WORK_PATH}/?`);

// 过滤的目录
const re_skip_dir = new RegExp(`/test/`)

const travel = (dir, callback) => {
  fs.readdirSync(dir).forEach((file) => {
    var pathname = path.join(dir, file)
    if (fs.statSync(pathname).isDirectory()) {
      travel(pathname, callback)
    } else {
      if (/\.md$/.test(pathname) && !re_skip_dir.test(pathname)) {
        callback(
          pathname.replace(/\.md$/, '').replace(re_prefix, '')
        )
      }
    }
  })
}

var Node = function() {
  this.data = null
  this.items = {}
}

Node.prototype = {
  toString: function () {
    return this.data
  },

  getData: function() {
    return this.data
  },

  setData: function (ele) {
    this.data = ele
  },

  hasData: function (ele) {
    return ele in this.items
  },

  isEmpty: function () {
    return JSON.stringify(this.items) === '{}'
  },

}

var TireTree = function() {}
TireTree.prototype = {
  insert: function (node, data) {
    data.forEach((datum) => {
      if (!node.hasData(datum)) {
        node.items[datum] = new Node()
      }
      node = node.items[datum]
      node.setData(datum)
    })
  }
}

let tree = new TireTree()
let node = new Node()
travel(WORK_PATH, (pathname) => {
  tree.insert(node, pathname.split('/'))
});

const parseTree = (node, link) => {
  let result = []
  for (let sNode in node.items) {
    const datum = node.items[sNode]
    let items = []
    const text = datum.toString()
    let _link = link + '/' + datum.getData()
    if (datum.items) {
      items.push(...parseTree(datum, _link))
    }

    let hasReadMe = false
    for (let idx in items) {
      if (items[idx].text.toUpperCase() === 'README') {
        hasReadMe = true
        items.splice(idx, 1)
        if (!_link.endsWith('/')) {
          _link += '/'
        }
        break
      } else if (items[idx].text.toUpperCase() === 'INDEX') {
        hasReadMe = true
        items.splice(idx, 1)
        if (!_link.endsWith('/')) {
          _link += '/index'
        }
        break
      }
    }

    if (!hasReadMe) {
      if (items.length > 0) {
        _link = items[0]['link']
      }
  
      if (/^\/[^\/]+$/.test(_link)) {
        try {
          const stat = fs.lstatSync((WORK_PATH + _link).replace(/^\//, ''))
          if (stat.isDirectory()) {
            _link += '/'
          }
        } catch(e) {
          console.error(
            WORK_PATH,
            _link
          )
          continue
        }
      }
    }

    if (text.length <= 0) {
      continue
    }

    let tmp = {
      text: text,
      collapsible: true,
      link: _link,
      items: [],
    }
    if (items.length > 0) {
      tmp['items'] = items
    }
    result.push(tmp)
  }
  return result
}

let sidebar = parseTree(node, '')

// autocorrect-disable
let navs = ['生活', '读后感', '一些收藏', '经济', '一些想法', '关于我', 'python专栏', 'seo' ]
// autocorrect-enable

let navPath = {}
navs.forEach(function(nav) {
  navPath[nav] = '/' + nav + '/'
})

let newSiderBar = {}
for (let nav in navPath) {
  newSiderBar[navPath[nav]] = []
}
// 字典优先匹配原则
newSiderBar['/t/'] = []

for (let idx in sidebar) {
  let text = sidebar[idx]['text']
  let key = navPath[text] || '/t/'
  newSiderBar[key].push(sidebar[idx])
}

newSiderBar['/t/'] = newSiderBar['/t/'][0].items

let json_result = JSON.stringify(newSiderBar)
  .replace(/README/g, '')

console.log(
  'module.exports = ' + 
  json_result
)
