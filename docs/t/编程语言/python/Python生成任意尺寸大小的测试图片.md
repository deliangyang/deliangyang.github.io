# Python 脚本自动生成指定尺寸图片，提升测试效率

## 背景

在业务开发过程中经常会遇到提交表达时，有一个需求“上传指定尺寸大小的图片”。每次需要去测试这样的需求时，需要用截图工具拖拖拽拽，截取一个指定大小的图片，然后保存，上传测试。一种类型的尺寸大小还好，可以复用，要是有好几种类型的图片尺寸需求，测试过程就变得十分的繁琐。

## 解决方案

于是，自己用 Python 写了一个脚本，用来生成指定尺寸大小和后缀的图片，主要用的是 PIL 库。代码如下：

```python
from PIL import Image, ImageFont, ImageDraw
import sys
from random import choice
import os

size = sys.argv[1]

ext = 'png'
if len(sys.argv) == 3:
    ext = sys.argv[2]

width, height = size.lower().split('x')

color = [
    # 'red',
    'green',
    'black',
    'blue',
    'purple',
    'yellow',
    'orange',
    'pink',
]

the_color = choice(color)
image = Image.new("RGB", (int(width), int(height)), the_color)
draw_image = ImageDraw.Draw(image)
font = ImageFont.load_default(size=20)
draw_image.text((10, 10), "%s" % size, fill='red', font=font)

filename = "%s.%s" % (size, ext)
save_path = os.path.join(os.path.expanduser("~"), "Downloads", filename)
image.save(save_path)

print('Image created successfully!, check the folder for the image file, named %s' % save_path)
```

我们还可以将这个脚本设置为别名，方便我们在终端中直接调用。

```bash
alias cimage="python $HOME/bin/create_image.py"
```

别忘了安装 PIL 库。

```bash
pip install pillow
```

## 使用方法

```bash
cimage 100x100 # default png

cimage 200x200 jpg

cimage 300x300 png
```
---

能用脚本解决的问题，就不要手动解决。这样可以提高效率，减少重复劳动。