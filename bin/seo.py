import requests
import os
import time
import re

prompts = '为了优化 seo，请以作者的角度来提取总结这篇文章的关键词，description，并给出一个有趣吸引人的标题，结果需要符合 seo 优化，保持语法正确，表达正确，提高质量，看起来自然。给出 JSON 结构 {keywords: [], description: '', title: ''}。'
key = os.getenv('GEMINI_API_KEY')
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}'
dir = 'docs/'
os.makedirs('bin/seo/', exist_ok=True)

reg_trim = re.compile(r'```json\n')
reg_trim2 = re.compile(r'\n```')

def walk_dir(path):
    for root, dirs, files in os.walk(path):
        for file in files:
            yield os.path.join(root, file)

def get_recommend(file):
    filename = f'bin/seo/{file}.json'
    if os.path.exists(filename):
        return
    print(f'get_recommend: {file}')
    with open(file, 'r') as fr:
        content = fr.read()
        resp = requests.post(url, json={
            'contents': [
                {
                    'parts': [
                        {
                            'text': f'{prompts}\n{content}'
                        }
                    ]
                }
            ]
        })
        text = ''
        try:
            text = resp.text
            result = resp.json()['candidates'][0]['content']['parts'][0]['text']
            result = reg_trim.sub('', result)
            result = reg_trim2.sub('', result)
        except Exception as e:
            print(text)
            print(e)
            print('-' * 100)
            return
        dirname = os.path.dirname(filename)
        os.makedirs(dirname, exist_ok=True)
        with open(filename, 'w') as fw:
            fw.write(result)
        time.sleep(1)


skips = [
    'docs/daily.md',
    'docs/index.md',
]

for file in walk_dir(dir):
    if file.endswith('.md'):
        if file in skips:
            continue
        get_recommend(file)
        # exit(1)
        