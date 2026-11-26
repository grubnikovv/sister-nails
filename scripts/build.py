"""Собирает сайт для выкладки в папку out/: страница с правильной шапкой, картинки, шрифты, видео, файлы приложения,
robots.txt и sitemap.xml. Сервер (server/) и настройки добавляет шаг выкладки (.github/workflows/deploy.yml)."""
import os, re, shutil, sys

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SRC, 'out')
DOMAIN = os.environ.get('DOMAIN', 'academy-nail.ru')

s = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
m = re.search(r'<title>(.*?)</title>', s); title = m.group(1) if m else 'A.S.'
if m: s = s.replace(m.group(0), '', 1)
s = s.replace('<meta name="claude:viewport-fit-sides" content="cover">', '')
s = re.sub(r'<meta name="robots" content="[^"]*">', '', s)  # рабочий сайт — открыт для Яндекса и Google
head = ('<!doctype html>\n<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<title>' + title + '</title>\n<link rel="canonical" href="https://' + DOMAIN + '/">\n<style>:root{padding-top:env(safe-area-inset-top,0px);'
        'padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n')
# всё до первого </style> (мета-теги, шрифты, стили) — в <head>: браузер раньше грузит шрифты, поисковики видят описание
i = s.find('</style>')
if i >= 0 and s[:i].lstrip().startswith(('<', '\n')) and '<body' not in s[:i]:
    top, s = s[:i + 8], s[i + 8:]
    head += top + '\n'
if 'rel="icon"' not in head:
    head += '<link rel="icon" href="data:,">\n'
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(head + '</head><body>\n' + s.lstrip() + '\n</body></html>\n')
for sub in ('img', 'video', 'fonts', 'js', 'demo', 'v2'):
    d = os.path.join(SRC, sub)
    if os.path.isdir(d): shutil.copytree(d, os.path.join(OUT, sub), dirs_exist_ok=True)
for f in ('manifest.json', 'sw.js'):
    if os.path.isfile(os.path.join(SRC, f)): shutil.copy(os.path.join(SRC, f), os.path.join(OUT, f))
open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /server/\n\nSitemap: https://' + DOMAIN + '/sitemap.xml\n')
open(os.path.join(OUT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://' + DOMAIN + '/</loc></url>\n</urlset>\n')
print('сайт собран в', OUT)
