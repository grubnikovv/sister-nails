# Генератор новой главной (лендинг): tpl.html -> scripts/site/out/landing.html. Потом port.py собирает index.html.
import re, html, os

MANI = ["Строение кожи и ногтевого аппарата", "Заболевания ногтей", "Обработка инструментов и поверхностей",
        "Внешний вид и защита мастера", "Организация рабочего места", "Виды маникюра",
        "Инструменты и оборудование мастера", "Алгоритм работы с клиентом", "Поэтапный процесс маникюра",
        "Стрессовая зона: что это и как с ней работать", "Архитектура ногтей", "Опил форм",
        "Этапы покрытия: выравнивание, цвет, топ", "Прорисовка френча", "Материалы и работа с ними"]
PEDI = ["Строение кожи и ногтевого аппарата", "Заболевания ногтей", "Обработка инструментов и поверхностей",
        "Внешний вид и защита мастера", "Организация рабочего места", "Виды педикюра",
        "Инструменты и оборудование мастера", "Алгоритм работы с клиентом", "Поэтапный процесс педикюра",
        "Опил форм", "Этапы покрытия: база, цвет, топ", "Дизайн — френч (по желанию)", "Материалы и работа с ними"]
SPEED = ["Знакомство", "Организация рабочего места и психология общения с клиентом", "Снятие: несколько техник",
         "Маникюр", "Выравнивание: несколько техник", "Покрытие", "Опил форм", "Френч", "Ремонт трещин",
         "Работа с гелем и полигелем", "Материалы и работа с ними", "Стерилизация"]
VISUAL = [("Основы визуала", ["Какие формы существуют и для чего применяются", "Как использовать их для грамотного ведения страницы",
                              "Насмотренность и ролевые модели"]),
          ("Обработка фото", ["Обработка фото прямо в телефоне и в других приложениях",
                              "Источники света и как их применять для фото и видео"])]
MATER = ["Свойства материалов", "Простой алгоритм, который избавит от ожогов, отслоек, трещин и усадки материала",
         "Кислотность материалов", "Популярные базы, гели и топы: какие можно использовать, а какие нельзя"]

ON_TERMS = ["Доступ к урокам — 3 месяца с даты покупки", "Поддержка после окончания курса",
            "Сертификат с печатью (бумажный — доставкой, за счёт покупателя)"]
OFF_TERMS = ["Индивидуальное обучение", "Отработка на моделях", "Возможен выезд на удобную вам локацию",
             "Поддержка после окончания курса", "Сертификат с печатью"]
GIFT = "В подарок — курсы «Материаловедение» и «Визуал»"

C = [  # id, title, fmt, level, price, short, groups, terms, extra
 dict(id="mani", t="Маникюр с нуля", f="online", lv="С нуля", p=20000, d="Базовые техники, работа с инструментами и аппаратом, современные дизайны.",
      g=[(None, MANI)], terms=ON_TERMS, facts=["3 месяца доступа", "Сертификат"]),
 dict(id="pedi", t="Педикюр с нуля", f="online", lv="С нуля", p=26000, d="Профессиональный педикюр: обработка трещин, работа с заболеваниями ногтей, секреты эффективной работы.",
      g=[(None, PEDI)], terms=ON_TERMS, facts=["3 месяца доступа", "Сертификат"]),
 dict(id="duo", t="Маникюр + педикюр с нуля", f="online", lv="С нуля", p=35000, d="Обе профессии в одном курсе — и два курса в подарок.",
      g=[("Маникюр", MANI), ("Педикюр", PEDI)], terms=[GIFT] + ON_TERMS, facts=["3 месяца доступа", "2 курса в подарок"], best=True, old=65000, wide=True),
 dict(id="speed-mani", t="Скоростной маникюр за час", f="online", lv="Повышение", p=18000, d="Для практикующих мастеров: качественный маникюр с покрытием за час.",
      g=[(None, SPEED)], terms=ON_TERMS, facts=["3 месяца доступа", "Сертификат"]),
 dict(id="speed-pedi", t="Скоростной педикюр за час", f="online", lv="Повышение", p=17000, d="Для практикующих мастеров: быстрый и аккуратный педикюр без потери качества.",
      g=[], terms=ON_TERMS, facts=["Онлайн", "Сертификат"]),
 dict(id="mater", t="Материаловедение", f="online", lv="Для всех", p=10000, d="Как работать без отслоек и какой материал подходит под разный тип ногтей.",
      g=[(None, MATER)], terms=["Доступ к урокам — 1 месяц", "Сертификат с печатью (бумажный — доставкой, за счёт покупателя)"], facts=["1 месяц доступа", "Сертификат"]),
 dict(id="visual", t="Визуал", f="online", lv="Для всех", p=9000, d="Красивые фото работ и грамотное ведение страницы мастера.",
      g=VISUAL, terms=[], facts=["Онлайн", "Фото и свет"]),
 dict(id="mani-off", t="Основы маникюра", f="offline", lv="С нуля", p=25000, d="Индивидуальное обучение лично с Алиной и отработка на моделях.",
      g=[(None, MANI)], terms=["Длительность — 3 дня + отработка на моделях"] + OFF_TERMS, facts=["3 дня", "Индивидуально"]),
 dict(id="pedi-off", t="Основы педикюра", f="offline", lv="С нуля", p=30000, d="Индивидуальное обучение лично с Алиной и отработка на моделях.",
      g=[(None, [x.replace(" (по желанию)", "") for x in PEDI])], terms=["Длительность — 3 дня + отработка на моделях"] + OFF_TERMS, facts=["3 дня", "Индивидуально"]),
 dict(id="duo-off", t="Маникюр + педикюр с нуля", f="offline", lv="С нуля", p=45000, d="Полный путь в профессию за 5 дней — и два онлайн-курса в подарок.",
      g=[("Маникюр", MANI), ("Педикюр", PEDI)], terms=["Длительность — 5 дней + отработка на моделях", GIFT] + OFF_TERMS, facts=["5 дней", "2 курса в подарок"], best=True, old=74000),
]

def money(n): return f"{n:,}".replace(",", "\u202f") + "\u00a0₽"
E = html.escape
FMT = {"online": "Онлайн", "offline": "Офлайн"}

def card(c, i):
    prog = ""
    for title, items in c["g"]:
        prog += (f'<h4>{E(title)}</h4>' if title else '') + '<ol>' + ''.join(f'<li>{E(x)}</li>' for x in items) + '</ol>'
    if not c["g"]:
        prog = '<p class="muted">Подробная программа скоро появится здесь. Напишите Алине — она расскажет обо всём лично.</p>'
    terms = ''.join(f'<li>{E(x)}</li>' for x in c["terms"])
    if terms: prog += '<h4>Условия</h4><ul class="terms">' + terms + '</ul>'
    facts = ''.join(f'<li>{E(x)}</li>' for x in c["facts"])
    best = c.get("best")
    btn = "Купить курс" if c["f"] == "online" else "Записаться"
    return f'''
      <article class="course{' course--best' if best else ''}{' course--wide' if c.get('wide') else ''} rv" data-fmt="{c['f']}" data-id="{c['id']}" style="--d:{(i % 3) * 70}ms">
        <div class="course__top">
          <span class="chip chip--{c['f']}">{FMT[c['f']]}</span><span class="course__lv">{E(c['lv'])}</span>
          {'<span class="course__best">Выгодно</span>' if best else ''}
        </div>
        <h3 class="course__t">{E(c['t'])}</h3>
        <p class="course__d">{E(c['d'])}</p>
        <ul class="course__facts">{facts}</ul>
        <div class="course__bottom">
          <div class="course__price">{money(c['p'])}{f'<s title="Если покупать курсы по отдельности">{money(c["old"])}</s>' if c.get('old') else ''}</div>
          <div class="course__btns">
            <button class="btn btn--ghost btn--sm" type="button" data-open="{c['id']}">Программа</button>
            <a class="btn btn--sm" href="#kontakty" data-buy="{c['id']}"><span>{btn}</span></a>
          </div>
        </div>
        <template class="course__prog"><div class="prog">{prog}</div></template>
      </article>'''

on = [c for c in C if c['f'] == 'online']; on = [x for x in on if x.get('wide')] + [x for x in on if not x.get('wide')]
off = [c for c in C if c['f'] == 'offline']
cards_on = ''.join(card(c, i) for i, c in enumerate(on)); cards_off = ''.join(card(c, i) for i, c in enumerate(off))

ADV = [("Востребованные навыки", "Актуальные знания и умения, которые помогут выделиться на рынке услуг."),
       ("Рост дохода", "Новые возможности для профессионального роста и увеличения заработка."),
       ("Индивидуальный подход", "Обучение подстраивается под ваш уровень подготовки и задачи."),
       ("Практика с первого урока", "Работа с инструментами и материалами, строение ногтевого аппарата, заболевания ногтей — и сразу применение на практике."),
       ("Поддержка после обучения", "Помогу исправить ошибки в работе и поделюсь всем, что нужно для роста."),
       ("Сертификат с печатью", "После каждого курса — именной сертификат. По желанию отправим бумажный экземпляр.")]
adv = ''.join(f'''
        <li class="adv__i rv" style="--d:{(i % 3) * 80}ms"><span class="adv__n">0{i + 1}</span><h3>{E(t)}</h3><p>{E(d)}</p></li>''' for i, (t, d) in enumerate(ADV))

STEPS = [("Выберите курс", "Онлайн — из любого города, офлайн — лично с Алиной."),
         ("Оплатите на сайте", "Картой или через СБП — безопасно, с электронным чеком."),
         ("Учитесь в кабинете", "Видеоуроки, материалы и прогресс — в личном кабинете, в удобном темпе."),
         ("Получите сертификат", "Именной сертификат с печатью и поддержка после курса.")]
steps = ''.join(f'''
        <li class="step rv" style="--d:{i * 90}ms"><span class="step__n">{i + 1}</span><h3>{E(t)}</h3><p>{E(d)}</p></li>''' for i, (t, d) in enumerate(STEPS))

MARQ = ["Маникюр", "Педикюр", "Онлайн-запись", "Подарочные сертификаты", "Онлайн-курсы", "Офлайн-обучение", "Сертификат с печатью", "Поддержка после курса"]
marq = ''.join(f'<span>{E(x)}</span><i aria-hidden="true">✦</i>' for x in MARQ)

ICON_TG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 4.2 2.9 11.3c-1.2.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.4-1.5ZM8.9 14l8.5-5.4c.4-.3.8-.1.5.2l-7.3 6.6-.3 3-1.4-4.4Z"/></svg>'
ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z"/></svg>'
ICON_MAIL = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>'
ICON_IG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none"/></svg>'

WA = "https://wa.me/79362872201?text=" + "%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D1%8C%D1%81%D1%8F%20%D0%BD%D0%B0%20%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5."

def pic(name, alt, cls="", sizes="(max-width: 700px) 90vw, 480px", eager=False, w=960, h=1280):
    return (f'<img class="{cls}" src="img/{name}-960.webp" srcset="img/{name}-480.webp 480w, img/{name}-960.webp 960w" '
            f'sizes="{sizes}" width="{w}" height="{h}" alt="{E(alt)}" ' + ('fetchpriority="high"' if eager else 'loading="lazy"') + ' decoding="async">')

SVC = [  # ориентир по рынку Москвы, позже Алина поменяет
 ("Маникюр", [("Маникюр без покрытия", 1800, 60, False), ("Маникюр с покрытием гель-лак", 3000, 120, False),
              ("Маникюр, укрепление гелем и гель-лак", 3500, 150, False), ("Мужской маникюр", 2000, 60, False)]),
 ("Наращивание", [("Наращивание, короткая и средняя длина", 4500, 180, False), ("Наращивание, длинные ногти", 5500, 210, True),
              ("Коррекция наращивания", 4000, 150, False)]),
 ("Педикюр", [("Педикюр без покрытия (пальчики)", 2500, 60, False), ("Педикюр с гель-лаком (пальчики)", 3300, 90, False),
              ("Полный педикюр без покрытия", 3300, 90, False), ("Полный педикюр с гель-лаком", 4200, 120, False),
              ("Мужской педикюр", 3500, 90, False)]),
 ("Дизайн и уход", [("Френч", 500, 0, False), ("Дизайн, 1 ноготь", 150, 0, True), ("Снятие покрытия другого мастера", 500, 15, False),
              ("Ремонт ногтя", 300, 15, False), ("SPA-уход для рук", 700, 15, False), ("Парафинотерапия", 800, 20, False)]),
]
def dur(m):
    if not m: return ""
    h, mm = divmod(m, 60)
    return (f"{h}\u00a0ч" if h else "") + (" " if h and mm else "") + (f"{mm}\u00a0мин" if mm else "")
svc = ''
for i, (cat, items) in enumerate(SVC):
    rows = ''.join(f'<li><span class="pl__n">{E(n)}<small>{dur(m)}</small></span><i aria-hidden="true"></i><b>{"от " if fr else ""}{money(p)}</b></li>' for n, p, m, fr in items)
    svc += f'<div class="pl rv" style="--d:{(i % 2) * 80}ms"><h3>{E(cat)}</h3><ul>{rows}</ul></div>'

__import__('os').makedirs(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'out'), exist_ok=True)
page = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'tpl.html'), encoding='utf-8').read()
for k, v in dict(APP=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'app.html'),encoding='utf-8').read().replace('__SVC_JSON__', __import__('json').dumps([[c,[[n,p,m,fr] for n,p,m,fr in it]] for c,it in SVC],ensure_ascii=False)), SVC=svc, CARDS_ON=cards_on, CARDS_OFF=cards_off, ADV=adv, STEPS=steps, MARQ=marq, TG=ICON_TG, WAI=ICON_WA, MAIL=ICON_MAIL, IG=ICON_IG, WA=WA,
                 P_ALINA=pic("alina", "Алина Грубникова — преподаватель маникюра и педикюра", "about__img"),
                 P_HERO=pic("nails-wine", "Маникюр Алины: бордовое покрытие", "hero__img", "(max-width: 700px) 80vw, 520px", True),
                 P_HERO2=pic("nails-nude", "Маникюр: нюдовое покрытие с френчем", "hero__img2", "(max-width: 700px) 40vw, 240px"),
                 G1=pic("nails-black", "Работа Алины: чёрный маникюр", "", "(max-width: 700px) 70vw, 380px"),
                 G2=pic("nails-milk", "Работа Алины: молочный маникюр", "", "(max-width: 700px) 70vw, 380px"),
                 G3=pic("pedicure-blue", "Работа Алины: синий педикюр", "", "(max-width: 700px) 70vw, 380px", w=1280, h=1132),
                 G4=pic("nails-nude", "Работа Алины: нюдовый маникюр", "", "(max-width: 700px) 70vw, 380px"),
                 G5=pic("nails-wine", "Работа Алины: бордовый маникюр", "", "(max-width: 700px) 70vw, 380px")).items():
    page = page.replace('{{' + k + '}}', v)

# Типограф: неразрывные пробелы после коротких слов и перед тире — только в тексте, не в тегах/скриптах
SHORT = r'(?<![\w\-])([А-Яа-яЁёA-Za-z]{1,2}|без|для|под|над|при|про|что|как|или|все|это|вам|вас|нас|мне|так|уже)'
def typo(t):
    t = re.sub(SHORT + r' (?=[\wА-Яа-яЁё«(0-9])', lambda m: m.group(1) + '\u00a0', t)
    t = t.replace(' — ', '\u00a0— ').replace(' –', '\u00a0–')
    t = re.sub(r'(\d) (?=(дн|мес|курс|лет|год|₽))', '\\1\u00a0', t)
    return t
parts = re.split(r'(<script.*?</script>|<style.*?</style>|<[^>]+>)', page, flags=re.S)
page = ''.join(p if p.startswith('<') else typo(p) for p in parts)
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'out','landing.html'), 'w', encoding='utf-8').write(page)
print('ok', len(page))
