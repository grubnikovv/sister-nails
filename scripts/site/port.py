# Собирает новый index.html: мамин сайт (запись, кабинеты, кабинет мастера, сертификаты) + новая главная и стиль Алины.
import re, json
import os
SP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out') + '/'
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..') + '/'
L = open(REPO + 'legacy/ma-base.html', encoding='utf-8').read()
P = open(SP + 'landing.html', encoding='utf-8').read()

def must(old, new, s, count=1):
    if old not in s: raise SystemExit('НЕ НАЙДЕНО: ' + old[:80])
    return s.replace(old, new, count) if count else s.replace(old, new)

# ---------- 1. части новой главной ----------
styles = re.findall(r'<style>(.*?)</style>', P, re.S)
css = styles[0]
fontface = ''.join(re.findall(r'@font-face\{[^}]*\}', css))
css = re.sub(r'@font-face\{[^}]*\}', '', css)
main = P[P.find('<main id="top">') + len('<main id="top">'):P.find('</main>')]
dialog = P[P.find('<dialog'):P.find('</dialog>') + 9]

# свои переменные -> --x-*, чтобы не путаться с мамиными --bg/--ink/--line
for v in sorted(set(re.findall(r'--([a-z][\w-]*)', css)), key=len, reverse=True):
    css = re.sub(r'--' + re.escape(v) + r'(?![\w-])', '--x-' + v, css)
    main = re.sub(r'--' + re.escape(v) + r'(?![\w-])', '--x-' + v, main)
# :root-переменные главной: на .x-land, тема — по data-theme / системной
css = css.replace(':root:not([data-theme="light"]){', ':root:not([data-theme="light"]) .x-land{').replace(':root[data-theme="dark"]{', ':root[data-theme="dark"] .x-land{')
css = re.sub(r'(?<![\w\]\)])\:root\{', '.x-land{', css, count=1)

# классы -> x-*
KEEP = {'logo__l', 'logo__d'}
classes = set(re.findall(r'\.([a-zA-Z][\w-]*)', re.sub(r'url\([^)]*\)', '', css))) - {'5s'}
classes = {c for c in classes if not re.match(r'^\d', c) and not c.startswith('x-')}
def rn(c): return 'x-' + c if c in classes or c in KEEP else c
css = re.sub(r'\.([a-zA-Z][\w-]*)', lambda m: '.' + rn(m.group(1)) if m.group(1) in classes or m.group(1) in KEEP else m.group(0), css)
def fixcls(h):
    return re.sub(r'class="([^"]*)"', lambda m: 'class="' + ' '.join(rn(c) for c in m.group(1).split()) + '"', h)
main = fixcls(main); dialog = fixcls(dialog)
# элементные правила главной — только внутри .x-land
css = css.replace('*,*::before,*::after{box-sizing:border-box}', '')
css = css.replace('html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:84px}', '')
css = re.sub(r'(?<![\w.#-])body\{[^}]*\}', '', css, count=1)
for sel in ['img{', 'a{', 'button{', 'h1,h2,h3,h4{', 'p{', 'ul,ol{']:
    css = css.replace('\n' + sel, '\n.x-land ' + sel.replace(',', ',.x-land '), 1)
css = css.replace('dialog{', '.x-dlg{').replace('dialog[open]', '.x-dlg[open]').replace('dialog::backdrop', '.x-dlg::backdrop')
dialog = dialog.replace('<dialog id="dlg"', '<dialog class="x-dlg x-land" id="dlg"')

def split_top(sel):
    out, depth, cur = [], 0, ''
    for ch in sel:
        if ch in '([': depth += 1
        if ch in ')]': depth -= 1
        if ch == ',' and depth == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur); return out
def pref_sel(s):
    s = s.strip()
    if not s or s.startswith('.x-land') or s.startswith('.x-dlg') or s.startswith('from') or s.startswith('to') or s.endswith('%'): return s
    m = re.match(r'^(:root(?:\[[^\]]*\]|:not\([^)]*\))*|\.x-is-ready|\.x-menu-open)\s*(.*)$', s)
    if m: return m.group(1) + ' ' + (m.group(2) if m.group(2).startswith('.x-land') else '.x-land ' + m.group(2))
    return '.x-land ' + s
def prefix_css(c):
    out, i, n = '', 0, len(c)
    while i < n:
        j = c.find('{', i)
        if j < 0: out += c[i:]; break
        head = c[i:j]; depth, k = 1, j + 1
        while k < n and depth:
            if c[k] == '{': depth += 1
            elif c[k] == '}': depth -= 1
            k += 1
        body = c[j + 1:k - 1]; h = head.strip()
        if h.startswith('@media') or h.startswith('@supports'): out += head + '{' + prefix_css(body) + '}'
        elif h.startswith('@'): out += head + '{' + body + '}'
        else:
            lead = head[:len(head) - len(head.lstrip())]
            out += lead + ','.join(pref_sel(x) for x in split_top(h)) + '{' + body + '}'
        i = k
    return out

css = prefix_css(css)
land_css = ('.x-land{overflow-x:clip;background:var(--x-bg);color:var(--x-ink);font:400 16px/1.6 var(--x-sans);hyphens:manual;-webkit-hyphens:manual}\n'
            '.x-land *,.x-land *::before,.x-land *::after{box-sizing:border-box}\n' + css)

LAND_JS = r'''<script>
(function(){
  var d=document,root=d.documentElement,rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('x-is-ready')})});
  var par=[].slice.call(d.querySelectorAll('.x-land [data-par]')),tick=false;
  function onScroll(){tick=false;if(rm||d.getElementById('v-home').hidden)return;par.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
    el.style.transform='translate3d(0,'+((r.top+r.height/2-innerHeight/2)*parseFloat(el.dataset.par)).toFixed(1)+'px,0)'})}
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();
  var io='IntersectionObserver' in window&&!rm?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('x-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08}):null;
  d.querySelectorAll('.x-rv').forEach(function(el){io?io.observe(el):el.classList.add('x-in')});
  var dlg=d.getElementById('dlg');
  d.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){
    var c=d.querySelector('.x-course[data-id="'+b.dataset.open+'"]');if(!c)return;
    d.getElementById('dlgT').textContent=c.querySelector('.x-course__t').textContent;
    var f=d.getElementById('dlgF');f.className='x-chip x-chip--'+c.dataset.fmt;f.textContent=c.querySelector('.x-chip').textContent;
    d.getElementById('dlgP').textContent=c.querySelector('.x-course__price').firstChild.textContent;
    var bd=d.getElementById('dlgB');bd.innerHTML='';bd.appendChild(c.querySelector('template').content.cloneNode(true));bd.scrollTop=0;
    var buy=c.querySelector('[data-buy]');d.getElementById('dlgBuy').setAttribute('href',buy.getAttribute('href'));d.querySelector('#dlgBuy span').textContent=buy.textContent;
    dlg.showModal()})});
  d.getElementById('dlgX').addEventListener('click',function(){dlg.close()});
  d.getElementById('dlgBuy').addEventListener('click',function(){dlg.close()});
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  var strip=d.getElementById('strip');
  d.querySelectorAll('.x-land [data-s]').forEach(function(b){b.addEventListener('click',function(){strip.scrollBy({left:(+b.dataset.s)*strip.querySelector('figure').offsetWidth*1.05,behavior:rm?'auto':'smooth'})})});
})();
</script>'''

# ---------- 2. вставляем главную вместо маминой ----------
i = L.find('<main id="v-home"'); j = L.find('</main>', i)
open_tag = L[i:L.find('>', i) + 1]
STUBS = ('<div hidden aria-hidden="true" class="x-stubs"><div id="stage"></div><span id="shadeName"></span><div id="shades"></div>'
         '<div id="tbCourses"></div><div id="homeSvc"></div><div id="homeGal"></div><span id="rvN"></span><button id="rvPrev"></button>'
         '<button id="rvNext"></button><div id="rvTrack"></div><div id="rvDots"></div></div>')
L = L[:i] + open_tag + '<div class="x-land">' + main + '</div>' + STUBS + L[j:]
# ссылки главной на экраны сайта
L = L.replace('<a class="btn glow" href="#obuchenie">Записаться на обучение</a></div>', '<a class="btn glow" href="#zapis">Записаться онлайн</a></div>')
L = re.sub(r'href="#kontakty" data-buy="(mani-off|pedi-off|duo-off)"', r'href="#obuchenie" data-buy="\1"', L)
L = L.replace('href="#kabinet/zapis"', 'href="#zapis"').replace('href="#kabinet/sert"', 'href="#sertifikat"')
# окно программы курса — перед </body>-скриптами: ставим сразу после главной
k = L.find('</main>', L.find('<main id="v-home"'))
L = L[:k + 7] + '\n' + dialog + L[k + 7:]

# ---------- 3. стиль: палитра и шрифты Алины ----------
L = re.sub(r'(@font-face \{[^}]*\}\s*)+', '', L, count=0)
ROOT_OLD = re.search(r':root \{\n  --bg: #FBF8F7;.*?\n\}', L, re.S).group(0)
ROOT_NEW = ''':root {
  --bg: #ECEDEF;
  --paper: #FFFFFF;
  --ink: #0E1A33;
  --mute: #5E667A;
  --line: #DADCE2;
  --blush: #FBE2F3;
  --lac: #0E1A33;
  --lac-ink: #FFFFFF;
  --gold: #D4006F;
  --ok: #2E7D5B;
  --red: #B3261E;
  --shadow: 0 1px 2px rgba(14,26,51,.05), 0 14px 40px rgba(14,26,51,.08);
  --display: Cormorant, "Cormorant Garamond", Georgia, serif;
  --body: Onest, system-ui, -apple-system, "Segoe UI", sans-serif;
  --nail: #D4006F;
}'''
L = L.replace(ROOT_OLD, ROOT_NEW, 1)
L = L.replace('--bg: #141012; --paper: #1D171A; --ink: #F3ECEE; --mute: #A8999F; --line: #2E2529; --blush: #261D21;', '--bg: #0B1222; --paper: #141F3A; --ink: #EEF0F5; --mute: #A7AEBD; --line: #26314D; --blush: #2A2242;')
L = L.replace('--lac: #E04A72; --lac-ink: #1A0A10; --gold: #D2AE62;', '--lac: #F4B4DE; --lac-ink: #0E1A33; --gold: #FF5AAE;')
# шрифты + стиль главной + логотип — в первый <style>
LOGO_CSS = ('.logo .brand-i{height:46px;width:auto;display:block}.logo .brand-i.logo__d{display:none}'
            ':root[data-theme="dark"] .logo .brand-i.logo__l{display:none}:root[data-theme="dark"] .logo .brand-i.logo__d{display:block}'
            '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .logo .brand-i.logo__l{display:none}:root:not([data-theme="light"]) .logo .brand-i.logo__d{display:block}}'
            '.m-mx{display:none!important}footer .logo .brand-i{height:72px}.x-adm{display:block;text-align:center;font-size:12px;color:var(--mute);padding:6px 0 18px;text-decoration:none}.x-adm:hover{color:var(--ink)}\n')
first_style = L.find('<style>') + 7
L = L[:first_style] + '\n' + fontface + '\n' + LOGO_CSS + L[first_style:]
last_style_end = L.rfind('</style>', 0, L.find('<body') if '<body' in L else L.find('<header'))
L = L[:last_style_end] + '\n/* ===== новая главная (A.S. / Мэй’Эйлин) ===== */\n' + land_css + '\n' + L[last_style_end:]
L = L.replace('</body>', LAND_JS + '\n</body>') if '</body>' in L else L + '\n' + LAND_JS

# логотип
LOGO = ('<img class="brand-i logo__l" src="img/logo.webp" width="720" height="393" alt="Нейл Студия Мэй’Эйлин">'
        '<img class="brand-i logo__d" src="img/logo-dark.webp" width="720" height="393" alt="" aria-hidden="true">')
L = L.replace('<svg class="brand" aria-hidden="true"><use class="lg0" href="#lgm"></use><use class="nyh" href="#lgmNy"></use></svg>', LOGO)
L = L.replace('<span class="brand-t">Академия маникюра и&nbsp;педикюра</span>', '')

# новогоднее оформление мамы — выключено
L = L.replace('if (q ? q[1] === "1" : (m === 10 && d.getDate() >= 18) || m === 11 || (m === 0 && d.getDate() <= 14)) document.documentElement.classList.add("ny");', '')

# ---------- 4. демо-данные ----------
L = must('SHOW_EXAMPLES = false;', 'SHOW_EXAMPLES = true;', L)

# ---------- 5. услуги (ориентир по Москве) ----------
a = L.find('var SERVICES0 = ['); b = L.find('];', a) + 2
SVC = '''var SERVICES0 = [
    { id: "man", name: "Маникюр без покрытия", price: 1800, min: 60, text: "Комбинированная обработка, форма, уход за кутикулой." },
    { id: "gel", name: "Маникюр с покрытием гель-лак", price: 3000, min: 120, text: "Маникюр, выравнивание и покрытие гель-лаком в один тон." },
    { id: "str", name: "Маникюр, укрепление гелем и гель-лак", price: 3500, min: 150, text: "Укрепление натуральных ногтей гелем и покрытие гель-лаком." },
    { id: "men", name: "Мужской маникюр", price: 2000, min: 60, noRemove: true, text: "Аккуратная обработка, форма и матовое покрытие по желанию." },
    { id: "cor", name: "Коррекция наращивания", price: 4000, min: 150, text: "Опил отросшей длины, ремонт, новое покрытие." },
    { id: "ext", name: "Наращивание, короткая и средняя длина", price: 4500, min: 180, text: "Наращивание гелем с покрытием." },
    { id: "ext4", name: "Наращивание, длинные ногти", price: 5500, from: true, min: 210, text: "Длинные ногти. Точную цену Алина назовёт по факту длины." },
    { id: "off", name: "Снятие покрытия с рук", price: 500, min: 15, noRemove: true, text: "Только снять покрытие, без нового. Любое — своё или от другого мастера." },
    { id: "offf", name: "Снятие покрытия с ног", price: 500, min: 15, noRemove: true, foot: true, text: "Только снять покрытие с ног, без нового." },
    { id: "spa", name: "SPA-уход для рук", price: 700, min: 15, noRemove: true, text: "Скраб, маска и массаж рук." },
    { id: "par", name: "Парафинотерапия", price: 800, min: 20, noRemove: true, text: "Тёплый парафин: увлажнение и мягкость кожи рук." },
    { id: "ped", name: "Педикюр без покрытия (пальчики)", price: 2500, min: 60, foot: true, text: "Обработка пальчиков без покрытия." },
    { id: "pedg", name: "Педикюр с гель-лаком (пальчики)", price: 3300, min: 90, foot: true, text: "Обработка пальчиков и покрытие гель-лаком." },
    { id: "pedf", name: "Полный педикюр без покрытия", price: 3300, min: 90, foot: true, text: "Обработка пальчиков и стоп, без покрытия." },
    { id: "pedp", name: "Полный педикюр с гель-лаком", price: 4200, min: 120, foot: true, text: "Пальчики, стопы и покрытие гель-лаком." },
    { id: "pedm", name: "Мужской педикюр", price: 3500, min: 90, foot: true, noRemove: true, text: "Полная обработка пальчиков и стоп." }
  ];'''
L = L[:a] + SVC + L[b:]
L = L.replace('{ id: "french", name: "Френч", price: 200,', '{ id: "french", name: "Френч", price: 500,')
L = L.replace('{ id: "remove", name: "Снятие покрытия", price: 200,', '{ id: "remove", name: "Снятие покрытия", price: 500,')

# ---------- 6. офлайн-курсы академии (онлайн — отдельно, в кабинете) ----------
a = L.find('var COURSES0 = ['); b = L.find('];', a) + 2
MANI = ["Строение кожи и ногтевого аппарата", "Заболевания ногтей", "Обработка инструментов и поверхностей", "Внешний вид и защита мастера", "Организация рабочего места", "Виды маникюра", "Инструменты и оборудование мастера", "Алгоритм работы с клиентом", "Поэтапный процесс маникюра", "Стрессовая зона: что это и как с ней работать", "Архитектура ногтей", "Опил форм", "Этапы покрытия: выравнивание, цвет, топ", "Прорисовка френча", "Материалы и работа с ними"]
PEDI = ["Строение кожи и ногтевого аппарата", "Заболевания ногтей", "Обработка инструментов и поверхностей", "Внешний вид и защита мастера", "Организация рабочего места", "Виды педикюра", "Инструменты и оборудование мастера", "Алгоритм работы с клиентом", "Поэтапный процесс педикюра", "Опил форм", "Этапы покрытия: база, цвет, топ", "Дизайн — френч", "Материалы и работа с ними"]
INC = "Индивидуальное обучение, отработка на моделях, возможен выезд на удобную вам локацию. Поддержка после курса и сертификат с печатью."
COURSES = '''var COURSES0 = [
    { id: "man", name: "Основы маникюра", short: "Основы маникюра", days: 3, models: 2, price: 25000, pre: 8000, prog: %s, inc: %s },
    { id: "ped", name: "Основы педикюра", short: "Основы педикюра", days: 3, models: 2, price: 30000, pre: 10000, prog: %s, inc: %s },
    { id: "ext", name: "Маникюр + педикюр с нуля", short: "Маникюр + педикюр", days: 5, models: 4, price: 45000, pre: 15000, prog: %s, inc: %s }
  ];''' % (json.dumps(MANI, ensure_ascii=False), json.dumps(INC, ensure_ascii=False), json.dumps(PEDI, ensure_ascii=False), json.dumps(INC, ensure_ascii=False),
           json.dumps(["<b>Маникюр.</b> " + ", ".join(MANI) + ".", "<b>Педикюр.</b> " + ", ".join(PEDI) + "."], ensure_ascii=False),
           json.dumps(INC + " В подарок — онлайн-курсы «Материаловедение» и «Визуал».", ensure_ascii=False))
L = L[:a] + COURSES + L[b:]
L = L.replace('ext: "Наращивание или коррекция ногтей" }', 'ext: "Маникюр и педикюр с покрытием" }')

# ---------- 7. бренд, контакты, город ----------
REP = [('Марина Шевченко', 'Алина Грубникова'), ('Шевченко', 'Грубникова'), ('Марин', 'Алин'), ('марин', 'алин'),
       ('Михайловка, ул. Обороны, 41', 'Москва, адрес уточняется'), ('ул.&nbsp;Обороны,&nbsp;41', 'адрес уточняется'), ('marina@', 'alina@'), ('ул. Обороны, 41', 'адрес уточняется'), ('Обороны, 41', 'адрес уточняется'),
       ('Михайловке', 'Москве'), ('Михайловку', 'Москву'), ('Михайловки', 'Москвы'), ('Михайловка', 'Москва'), ('Михайловской', 'Московской'),
       ('Волгоградская область', 'Москва'), ('Волгоградской области', 'Москве'),
       ('студия «М.А»', 'студия «Мэй’Эйлин»'), ('студии «М.А»', 'студии «Мэй’Эйлин»'), ('студию «М.А»', 'студию «Мэй’Эйлин»'), ('«М.А»', '«Мэй’Эйлин»'),
       ('М.А — ', 'Мэй’Эйлин — '), (' — М.А', ' — Мэй’Эйлин'), ('М.А', 'Мэй’Эйлин'),
       ('ma-nails.ru', 'academy-nail.ru'), ('+7 995 428-47-88', '+7 936 287-22-01'), ('+79954284788', '+79362872201'), ('79954284788', '79362872201'),
       ('https://t.me/monrobeauty', 'https://t.me/alina_sergeevna28'), ('https://wa.me/message/22ORQIZQY6J2E1', 'https://wa.me/79362872201')]
for o, n in REP: L = L.replace(o, n)
L = re.sub(r'<a class="m-mx"[^>]*>.*?</a>', '', L, flags=re.S)

# вход для мастера — отдельно, в самом низу
L = L.replace('<a href="#admin">Вход для мастера</a>', '')
L = L.replace('</footer>', '<a class="x-adm" href="#admin">Вход для мастера</a>\n</footer>', 1)

open(REPO + 'index.html', 'w', encoding='utf-8').write(L)
print('ok', len(L), 'классов главной:', len(classes))
for w in ['Марин', 'М.А', 'Михайлов', 'Обороны', '995 428', 'monro']:
    print(w, L.count(w))

# ---------- 8. контент мамы -> Алины ----------
L = open(REPO + 'index.html', encoding='utf-8').read()
# каталог услуг: группы и порядок под новые услуги
L = must('var feet = { ped: 1, pedg: 1, pedf: 1, pedp: 1, pedh: 1, nit: 1, nitc: 1 }, other = { off: 1, offf: 1, offb: 1 }, home = { gel: 1, ext: 1, pedp: 1 };',
         'var feet = { ped: 1, pedg: 1, pedf: 1, pedp: 1, pedm: 1 }, other = { off: 1, offf: 1, spa: 1, par: 1 }, home = { gel: 1, ext: 1, pedp: 1 };', L)
L = must('var order = ["man", "gel", "str", "cor", "cor4", "ext", "ext4", "ped", "pedg", "pedf", "pedp", "pedh", "nit", "nitc", "off", "offf", "offb"];',
         'var order = ["man", "gel", "str", "men", "cor", "ext", "ext4", "ped", "pedg", "pedf", "pedp", "pedm", "off", "offf", "spa", "par"];', L)
L = must('var frenchOk = ["gel", "str", "cor", "cor4", "ext", "ext4", "pedg", "pedp", "pedh"];', 'var frenchOk = ["gel", "str", "cor", "ext", "ext4", "pedg", "pedp"];', L)
L = must('var CORR0 = { gel: 21, str: 21, cor: 21, cor4: 21, ext: 21, ext4: 21, pedg: 28, pedp: 28 };', 'var CORR0 = { gel: 21, str: 21, cor: 21, ext: 21, ext4: 21, pedg: 28, pedp: 28 };', L)
for o, n in [('svc("nitc")', 'svc("cor")'), ('"cor4" : "cor"', '"cor" : "cor"'), ('svc("nit")', 'svc("man")'), ('"offb" : /ног/', '"off" : /ног/'), ('"pedh" : /полн/', '"pedp" : /полн/')]:
    L = L.replace(o, n)
# шрифты: предзагрузка новых
L = L.replace('<link rel="preload" href="fonts/manrope-cyrillic.woff2" as="font" type="font/woff2" crossorigin>', '<link rel="preload" href="fonts/onest-cyrillic.woff2" as="font" type="font/woff2" crossorigin>')
L = L.replace('<link rel="preload" href="fonts/tenorsans-cyrillic.woff2" as="font" type="font/woff2" crossorigin>', '<link rel="preload" href="fonts/cormorant-cyrillic.woff2" as="font" type="font/woff2" crossorigin>')
# портфолио: фото Алины
a = L.find('var WORKS0 = ['); b = L.find('];', a) + 2
L = L[:a] + '''var WORKS0 = [
    [1, "m", "Бордовый маникюр", 640, 853],
    [2, "m", "Нюдовый маникюр с френчем", 640, 853],
    [3, "m", "Чёрный маникюр", 640, 853],
    [4, "p", "Синий педикюр", 640, 566],
    [5, "m", "Молочный маникюр", 640, 853]
  ];''' + L[b:]
# о мастере
L = L.replace('src="img/marina-s.webp" srcset="img/marina-s.webp 640w, img/marina.webp 936w"', 'src="img/alina-960.webp" srcset="img/alina-480.webp 480w, img/alina-960.webp 960w"')
L = L.replace('width="640" height="598" alt="Алина Грубникова, мастер маникюра и преподаватель, с кубком чемпионата"', 'width="960" height="1280" alt="Алина Грубникова, мастер маникюра и преподаватель"')
L = L.replace('"img/marina-s.webp"', '"img/alina-480.webp"')
L = must('<p class="lead">Мастер маникюра и преподаватель, основатель студии «Мэй’Эйлин».</p>', '<p class="lead">Мастер маникюра и педикюра, инструктор, основатель студии «Мэй’Эйлин» и A.S. Ногтевой академии.</p>', L)
a = L.find('<p class="lead">Делаю маникюр с 2017 года'); b = L.find('</ul>', a) + 5
L = L[:a] + '''<p class="lead">Больше пяти лет работаю мастером и больше года обучаю. Выпустила более 50 топ-мастеров. Даю все знания, что у меня есть, — в самом доступном виде.</p>
      <ul class="ticks">
        <li>Более 5 лет работы мастером маникюра и педикюра</li>
        <li>Более года опыта работы инструктором</li>
        <li>Более 50 выпускниц стали топ-мастерами</li>
        <li>Маникюр, педикюр, покрытие без отслоек, френч</li>
        <li>Онлайн-курсы и индивидуальное обучение офлайн</li>
        <li>Поддержка выпускниц после окончания курса</li>
      </ul>''' + L[b:]
# награды мамы — убрать (у Алины пока нет), блок скрыт
L = re.sub(r'function awards0\(\) \{', 'function awards0() { return [];', L, count=1)
L = L.replace('<section class="block" style="background:var(--paper)"><div class="wrap">\n    <div class="sec-head"><span class="eyebrow">Награды</span><h2>Кубки и дипломы</h2></div>',
              '<section class="block" style="background:var(--paper)" hidden><div class="wrap">\n    <div class="sec-head"><span class="eyebrow">Награды</span><h2>Кубки и дипломы</h2></div>')
# Instagram и MAX
L = L.replace('https://www.instagram.com/_monrobeauty_/', 'https://www.instagram.com/a.s.nailsacademy').replace('@_monrobeauty_', '@a.s.nailsacademy')
L = re.sub(r'<a [^>]*><img src="img/map.webp"[^>]*>.*?</a>', '', L, count=1, flags=re.S)
L = L.replace('Три курса в студии «Мэй’Эйлин»: маникюр, педикюр и наращивание.', 'Три курса лично с Алиной: основы маникюра, основы педикюра и маникюр + педикюр с нуля.')
open(REPO + 'index.html', 'w', encoding='utf-8').write(L)
print('step8 ok')
