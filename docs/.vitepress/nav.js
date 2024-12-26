// autocorrect-disable
module.exports = [
  { text: '技术博客', link: '/t/' },
  {
    text: '专栏',
    items: [
      {
        text: 'Python',
        link: '/python专栏/',
      },
      {
        text: 'SEO',
        link: '/seo/',
      },
    ]
  },
  { text: '关于我', link: '/关于我/', },
  { 
    text: '生活', 
    ariaLabel: '生活&运动',
    items: [
      {
        text: '健康饮食',
        items: [
          {
            text: '健康饮食',
            link: '/生活/健康饮食/日常豆浆制作', 
          },
        ]
      },
      {
        text: '运动',
        items: [
          {
            text: '跑步',
            link: '/生活/运动/跑步', 
          },
          {
            text: '羽毛球',
            link: '/生活/运动/羽毛球', 
          }
        ]
      },
      {
        text: '经济',
        items: [
          {
            text: '股票',
            link: '/经济/股票研究/',
          }
        ]
      },
      {
        text: '读后感',
        items: [
          {
            text: '读后感',
            link: '/读后感/',
          },
          {
            text: '一些收藏',
            link: '/一些收藏/',
          }
        ]
      }
    ],
  },
  { text: '意见反馈', link: 'https://github.com/deliangyang/sntflyv.github.io/issues/new'},
]
// autocorrect-enable