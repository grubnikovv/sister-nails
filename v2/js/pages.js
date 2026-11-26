/* Публичные страницы сайта */
(function () {
  var A = window.A, E = A.esc, D = document;
  function ph(name, cls, alt, w) { return '<div class="ph ' + (cls || '') + '"><img src="' + A.img(name, w || 960) + '" srcset="' + A.img(name, 480) + ' 480w, ' + A.img(name, 960) + ' 960w" sizes="(max-width: 700px) 92vw, 640px" data-full="' + A.img(name, 960) + '" alt="' + E(alt || '') + '" loading="lazy" decoding="async"></div>'; }
  function ln(t, d) { return '<span class="ln"><span' + (d ? ' style="--d:' + d + 'ms"' : '') + '>' + t + '</span></span>'; }
  function lessonsCount(c) { return c.g.reduce(function (s, g) { return s + g[1].length; }, 0); }
  function card(c, i) {
    var n = lessonsCount(c);
    return '<a class="cc rv" style="--d:' + (i % 3) * 80 + 'ms" href="#/kurs/' + c.id + '">' +
      '<div class="ph"><img src="' + A.img(A.COVER[c.id], 480) + '" alt="" loading="lazy"><span class="cc__flag">' + (c.f === 'online' ? 'Онлайн' : 'Офлайн') + '</span>' + (c.best ? '<span class="cc__flag f">Выгодно</span>' : '') + '</div>' +
      '<div class="cc__b"><div class="cc__m"><span>' + E(c.lv) + '</span>' + (n ? '<span>' + n + ' уроков</span>' : '') + '<span>' + E(c.facts[0]) + '</span></div>' +
      '<h3>' + E(c.t) + '</h3><p>' + E(c.d) + '</p>' +
      '<div class="cc__f"><div class="cc__p">' + A.rub(c.p) + (c.old ? '<s>' + A.rub(c.old) + ' по отдельности</s>' : '') + '</div><span class="btn btn--sm">Подробнее <span class="ar">→</span></span></div></div></a>';
  }
  var marq = function () { var a = ['nails-wine', 'nails-nude', 'pedicure-blue', 'nails-black', 'nails-milk', 'alina']; var h = a.concat(a).map(function (x) { return ph(x, '', '', 480); }).join(''); return '<div class="marq" aria-hidden="true"><div class="marq__t">' + h + '</div></div>'; };

  /* ---------- главная ---------- */
  A.route('/', function () {
    return { html:
      '<section class="hero"><div class="wrap hero__g">' +
        '<div><div class="hero__tag rv"><b>Новый поток</b>Старт сразу после оплаты</div>' +
        '<h1 class="h1">' + ln('Профессия') + ln('<em>мастера</em>', 90) + ln('маникюра', 180) + '</h1>' +
        '<p class="lead rv" style="--d:250ms">Мэй’Эйлин — ногтевая академия и нейл студия Алины Грубниковой. Онлайн-школа с куратором и проверкой заданий — и студия, где делают маникюр, которым любуются.</p>' +
        '<div class="hero__acts rv" style="--d:320ms"><a class="btn" href="#/akademiya">Выбрать курс <span class="ar">→</span></a><a class="btn btn--ghost" href="#/studiya">Записаться на маникюр</a></div>' +
        '<ul class="stats4 rv" style="--d:400ms"><li><b data-n="50" data-s="+">50+</b><span>выпускниц</span></li><li><b data-n="10">10</b><span>курсов</span></li><li><b data-n="5" data-s="+">5+</b><span>лет практики</span></li><li><b>1:1</b><span>личный куратор</span></li></ul></div>' +
        '<div class="collage rv" id="col" style="--d:200ms">' + ph('nails-wine', 'p1', 'Маникюр Алины') + ph('alina', 'p2', 'Алина Грубникова') + ph('nails-nude', 'p3', 'Френч') + '</div>' +
      '</div></section>' +
      '<div class="tline" aria-hidden="true"><span>Маникюр<i>✦</i>Педикюр<i>✦</i>Онлайн-школа<i>✦</i>Куратор<i>✦</i>Сертификат<i>✦</i>Маникюр<i>✦</i>Педикюр<i>✦</i>Онлайн-школа<i>✦</i>Куратор<i>✦</i>Сертификат<i>✦</i></span></div>' +
      '<section class="sec"><div class="wrap"><span class="cap rv">Почему академия Алины</span><h2 class="h2" style="margin:16px 0 50px">' + ln('Обучение,') + ln('<em>которое работает</em>', 90) + '</h2>' +
        '<div class="stack">' +
          '<article class="stk" style="--i:0"><div><div class="stk__n">01</div><h3 class="h2" style="font-size:clamp(38px,4.4vw,70px);margin-top:20px">Уроки <em>по порядку</em></h3><p class="lead" style="margin-top:16px">Каждый следующий урок открывается, когда Алина приняла домашнее задание. Без пробелов в знаниях.</p><div class="pills"><span>Видео в кабинете</span><span>Доступ 3 месяца</span><span>С телефона</span></div></div>' + ph('nails-milk', 'wipe', '') + '</article>' +
          '<article class="stk" style="--i:1"><div><div class="stk__n">02</div><h3 class="h2" style="font-size:clamp(38px,4.4vw,70px);margin-top:20px">Проверка <em>каждой работы</em></h3><p class="lead" style="margin-top:16px">Загружаете фото — получаете разбор: что получилось, что исправить. Как личное обучение, только онлайн.</p><div class="pills"><span>Фото-задания</span><span>Комментарии</span><span>Чат с куратором</span></div></div>' + ph('nails-black', 'wipe', '') + '</article>' +
          '<article class="stk" style="--i:2"><div><div class="stk__n">03</div><h3 class="h2" style="font-size:clamp(38px,4.4vw,70px);margin-top:20px">Сертификат <em>и поддержка</em></h3><p class="lead" style="margin-top:16px;color:rgba(244,238,242,.75)">Именной сертификат с печатью и помощь Алины после курса — чтобы уверенно начать работать.</p><div class="pills"><span>С печатью</span><span>Бумажный по желанию</span><span>Поддержка</span></div></div>' + ph('pedicure-blue', 'wipe', '') + '</article>' +
        '</div></div></section>' +
      '<section class="sec dark"><div class="wrap"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:10px"><div><span class="cap rv">Популярные курсы</span><h2 class="h2" style="margin-top:16px">' + ln('Начните') + ln('<em>с этих</em>', 90) + '</h2></div><a class="btn btn--pink rv" href="#/akademiya">Все 10 курсов <span class="ar">→</span></a></div>' +
        '<div class="cgrid">' + ['duo', 'mani', 'mani-off'].map(function (id, i) { return card(A.course(id), i); }).join('') + '</div></div></section>' +
      '<section class="sec" style="padding-bottom:60px"><div class="wrap" style="margin-bottom:40px"><span class="cap rv">Портфолио</span><h2 class="h2" style="margin-top:16px">' + ln('Работы') + ln('<em>Алины</em>', 90) + '</h2></div>' + marq() + '</section>' +
      '<section class="sec powder"><div class="wrap" style="display:grid;gap:40px;align-items:center;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">' +
        '<div><span class="cap rv">Нейл студия Мэй’Эйлин · Москва</span><h2 class="h2" style="margin:16px 0 24px">' + ln('Маникюр') + ln('<em>за 30 секунд</em>', 90) + '</h2><p class="lead rv">Выберите услугу, день и свободное окно — запись подтвердится в DIKIDI, напомним накануне.</p><div class="hero__acts rv" style="margin-top:30px"><button class="btn" data-book>Записаться онлайн <span class="ar">→</span></button><a class="lnk" href="#/studiya">Услуги и цены</a></div></div>' +
        '<div class="collage rv" style="height:min(100vw,520px)">' + ph('nails-black', 'p1') + ph('pedicure-blue', 'p2') + ph('nails-milk', 'p3') + '</div></div></section>',
      mount: function (v) {
        var col = v.querySelector('#col');
        A.onScroll = function (y) { if (col && innerWidth > 959 && y < innerHeight * 1.3) col.style.transform = 'translate3d(0,' + y * .12 + 'px,0) rotate(' + (y * .006) + 'deg)'; };
      } };
  });

  /* ---------- академия: каталог ---------- */
  A.route('/akademiya', function () {
    A.onScroll = null;
    return { html:
      '<section class="khero"><div class="wrap"><span class="cap rv">Ногтевая академия Мэй’Эйлин</span><h1 class="h1" style="margin:18px 0 26px">' + ln('Курсы') + ln('<em>академии</em>', 90) + '</h1>' +
        '<p class="lead rv">Онлайн — видеоуроки в личном кабинете, задания с проверкой и куратор. Офлайн — индивидуально, лично с Алиной.</p>' +
        '<div class="ftabs rv" data-pick id="ft" style="margin-top:34px"><button aria-pressed="true" data-v="all">Все курсы</button><button aria-pressed="false" data-v="start">С нуля</button><button aria-pressed="false" data-v="pro">Для мастеров</button><button aria-pressed="false" data-v="online">Онлайн</button><button aria-pressed="false" data-v="offline">Офлайн</button></div>' +
        '<div class="cgrid" id="cg">' + COURSES.map(card).join('') + '</div></div></section>' +
      '<section class="sec dark"><div class="wrap"><span class="cap rv">Как проходит онлайн-обучение</span><h2 class="h2" style="margin:16px 0 40px">' + ln('Учёба') + ln('<em>в личном кабинете</em>', 90) + '</h2>' +
        '<div class="g3">' + [['01', 'Оплата на сайте', 'Картой или СБП, чек на почту — доступ открывается сразу'], ['02', 'Видеоуроки', 'Смотрите с телефона, в своём темпе'], ['03', 'Домашние задания', 'Фото работы — проверка и комментарий Алины'], ['04', 'Сертификат', 'Именной, с печатью, после финального задания']].map(function (s, i) { return '<div class="kpi rv" style="--d:' + i * 80 + 'ms;background:rgba(255,255,255,.06);color:#F4EEF2"><b style="color:var(--pink)">' + s[0] + '</b><div style="font:500 24px/1.1 var(--serif);margin:14px 0 8px">' + s[1] + '</div><span style="color:rgba(244,238,242,.7)">' + s[2] + '</span></div>'; }).join('') + '</div>' +
        '<div class="hero__acts rv" style="margin-top:40px"><a class="btn btn--pink" href="#/kabinet">Посмотреть кабинет ученицы <span class="ar">→</span></a></div></div></section>',
      mount: function (v) {
        v.querySelector('#ft').addEventListener('pick', function (e) {
          var f = e.detail.dataset.v;
          v.querySelectorAll('#cg .cc').forEach(function (a) {
            var c = A.course(a.getAttribute('href').split('/').pop()), seg = c.f === 'offline' ? 'offline' : (c.lv === 'С нуля' ? 'start' : 'pro');
            a.hidden = !(f === 'all' || f === c.f || f === seg || (f === 'start' && c.lv === 'С нуля'));
            a.style.display = a.hidden ? 'none' : '';
          });
        });
      } };
  });

  /* ---------- страница курса ---------- */
  A.route('/kurs', function (arg) {
    A.onScroll = null;
    var c = A.course(arg[0]) || COURSES[0], les = A.lessons(c), n = les.length, mods = [], titles = [];
    A.modules(c).forEach(function (md) { titles.push(E(md.t)); mods.push(les.filter(function (l) { return l.mt === md.t; })); });
    var parts = c.t.split(' '), last = parts.pop();
    var rel = COURSES.filter(function (x) { return x.id !== c.id && x.f === c.f; }).slice(0, 3);
    return { html:
      '<section class="khero"><div class="wrap khero__g"><div><a class="lnk rv" href="#/akademiya">← Все курсы</a><div class="rv" style="margin-top:26px"><span class="cap">' + (c.f === 'online' ? 'Онлайн-курс' : 'Офлайн · лично с Алиной') + ' · ' + E(c.lv) + '</span></div>' +
        '<h1 class="h1" style="margin:16px 0 22px;font-size:clamp(52px,8vw,128px)">' + ln(E(parts.join(' '))) + ln('<em>' + E(last) + '</em>', 90) + '</h1><p class="lead rv">' + E(c.d) + '</p>' +
        '<div class="hero__acts rv" style="margin-top:30px"><button class="btn" data-buy="' + c.id + '">' + (c.f === 'online' ? 'Купить курс' : 'Записаться') + ' · ' + A.rub(c.p) + '</button><a class="lnk" href="#prog">Программа</a></div></div>' +
        '<div class="collage rv" style="height:min(110vw,560px)">' + ph(A.COVER[c.id], 'p1') + ph('alina', 'p2') + ph(c.f === 'online' ? 'nails-milk' : 'nails-black', 'p3') + '</div></div>' +
        '<div class="wrap"><ul class="kf"><li class="rv"><b>' + (c.f === 'online' ? 'Онлайн' : 'Офлайн') + '</b><span>формат</span></li><li class="rv" style="--d:80ms"><b>' + (n || '—') + '</b><span>уроков</span></li><li class="rv" style="--d:160ms"><b>' + E(c.facts[0]) + '</b><span>' + (c.f === 'online' ? 'доступ' : 'длительность') + '</span></li><li class="rv" style="--d:240ms"><b>Есть</b><span>сертификат с печатью</span></li></ul></div></section>' +
      '<section class="sec powder" id="prog" style="padding-top:90px"><div class="wrap"><span class="cap rv">Программа</span><h2 class="h2" style="margin:16px 0 40px">' + ln('Что') + ln('<em>вы освоите</em>', 90) + '</h2>' +
        (mods.length ? '<div class="mods">' + mods.map(function (m, k) { return '<details class="rv"' + (k === 0 ? ' open' : '') + '><summary><i>' + String(k + 1).padStart(2, '0') + '</i><b>' + titles[Math.min(k, titles.length - 1)] + '</b><span>' + A.plural(m.length, 'урок', 'урока', 'уроков') + '</span></summary><ol>' + m.map(function (l, j) { return '<li><small>' + String(les.indexOf(l) + 1).padStart(2, '0') + '</small>' + E(l.t) + (l.hw ? '<span class="tag pink">задание</span>' : '<small>' + l.m + ' мин</small>') + '</li>'; }).join('') + '</ol></details>'; }).join('') + '</div>' : '<p class="lead">Подробная программа скоро появится — напишите Алине, она расскажет лично.</p>') +
        (c.terms.length ? '<h3 class="h3" style="margin:50px 0 16px">Условия</h3><div class="pills">' + c.terms.map(function (t) { return '<span style="background:var(--card)">' + E(t) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="buybar"><div><b>' + A.rub(c.p) + '</b>' + (c.old ? '<s>' + A.rub(c.old) + '</s>' : '') + '<div style="font-size:12px;opacity:.65">' + (c.f === 'online' ? 'Карта или СБП · доступ сразу' : 'Предоплата бронирует даты') + '</div></div><button class="btn btn--pink" data-buy="' + c.id + '">' + (c.f === 'online' ? 'Купить курс' : 'Записаться') + ' <span class="ar">→</span></button></div></div></section>' +
      '<section class="sec"><div class="wrap"><span class="cap rv">Похожие курсы</span><div class="cgrid">' + rel.map(card).join('') + '</div></div></section>' };
  });

  /* ---------- студия ---------- */
  var SVC = [['Маникюр без покрытия', '1 ч', 1800, '#EEDCD5'], ['Маникюр с гель-лаком', '2 ч', 3000, '#6E0D25'], ['Укрепление гелем и гель-лак', '2 ч 30 мин', 3500, '#F1ECE6'], ['Наращивание', '3 ч', 4500, '#E5B7C8'], ['Коррекция наращивания', '2 ч 30 мин', 4000, '#C99BAA'], ['Педикюр с гель-лаком', '1 ч 30 мин', 3300, '#1D33A8'], ['Полный педикюр', '2 ч', 4200, '#121218'], ['Френч', 'к покрытию', 500, '#FBF8F4']];
  A.SVC = SVC;
  A.route('/studiya', function () {
    A.onScroll = null;
    return { html:
      '<section class="khero"><div class="wrap khero__g"><div><span class="cap rv">Нейл студия Мэй’Эйлин · Москва</span><h1 class="h1" style="margin:16px 0 24px">' + ln('Студия') + ln('<em>Мэй’Эйлин</em>', 90) + '</h1><p class="lead rv">Стерильные инструменты, материалы премиум-класса и покрытие, которое носится без сколов три недели.</p>' +
        '<div class="hero__acts rv" style="margin-top:30px"><button class="btn" data-book>Записаться онлайн <span class="ar">→</span></button></div></div>' +
        '<div class="collage rv" style="height:min(110vw,560px)">' + ph('nails-black', 'p1') + ph('nails-wine', 'p2') + ph('nails-nude', 'p3') + '</div></div></section>' +
      '<section class="sec powder" style="padding-top:80px"><div class="wrap"><span class="cap rv">Услуги и цены</span><h2 class="h2" style="margin:16px 0 36px">' + ln('Выберите') + ln('<em>свой оттенок</em>', 90) + '</h2>' +
        '<div class="svc">' + SVC.map(function (s, i) { return '<button class="rv" style="--d:' + i * 50 + 'ms" data-book="' + i + '"><i class="nl" style="--c:' + s[3] + '"></i><span><b>' + E(s[0]) + '</b><small>' + E(s[1]) + '</small></span><em>' + (i === 7 ? '+' : (i === 3 ? 'от ' : '')) + A.rub(s[2]) + '</em></button>'; }).join('') + '</div></div></section>' +
      '<section class="sec" style="padding-bottom:60px"><div class="wrap" style="margin-bottom:40px"><span class="cap rv">Портфолио</span><h2 class="h2" style="margin-top:16px">' + ln('Работы') + ln('<em>студии</em>', 90) + '</h2></div>' + marq() + '</section>' };
  });

  /* ---------- об Алине ---------- */
  A.route('/alina', function () {
    A.onScroll = null;
    return '<section class="khero"><div class="wrap khero__g"><div><span class="cap rv">Мастер и преподаватель</span><h1 class="h1" style="margin:16px 0 24px">' + ln('Алина') + ln('<em>Грубникова</em>', 90) + '</h1>' +
      '<p class="lead rv">Инструктор по маникюру и педикюру и действующий мастер. Больше пяти лет работаю с клиентами и больше года обучаю мастеров — уже более 50 выпускниц.</p>' +
      '<p class="lead rv" style="margin-top:14px">Научу работать с абсолютно любыми ногтями, организовать рабочее место и делать маникюр, на который записываются в очередь.</p>' +
      '<p class="rv" style="font:italic 500 clamp(28px,3vw,40px)/1.2 var(--serif);margin-top:30px">«Я даю все знания, что у меня есть. В самом доступном для вас виде»</p></div>' +
      '<div class="collage rv" style="height:min(120vw,620px)">' + ph('alina', 'p1') + ph('nails-wine', 'p2') + ph('nails-black', 'p3') + '</div></div>' +
      '<div class="wrap"><ul class="stats4"><li><b data-n="5" data-s="+">5+</b><span>лет мастером</span></li><li><b data-n="50" data-s="+">50+</b><span>выпускниц</span></li><li><b data-n="10">10</b><span>авторских курсов</span></li><li><b>1:1</b><span>обучение офлайн</span></li></ul></div></section>' +
      '<section class="sec" style="padding-top:40px">' + marq() + '</section>';
  });

  /* ---------- контакты + заявка ---------- */
  A.route('/kontakty', function () {
    A.onScroll = null;
    return { html: '<section class="khero"><div class="wrap khero__g"><div><span class="cap rv">Контакты</span><h1 class="h1" style="margin:16px 0 24px">' + ln('Напишите') + ln('<em>Алине</em>', 90) + '</h1>' +
      '<p class="lead rv">Москва, адрес уточняется · ежедневно 10:00–21:00<br>+7 936 287-22-01 · academy.nail@mail.ru</p>' +
      '<div class="hero__acts rv" style="margin-top:26px"><a class="btn" href="https://t.me/alina_sergeevna28">Telegram</a><a class="btn btn--ghost" href="https://wa.me/79362872201">WhatsApp</a></div></div>' +
      '<form class="cardx rv" id="lf"><h2>Оставить <em class="serif" style="color:var(--fu)">заявку</em></h2><p class="muted" style="margin:-6px 0 16px">Ответим в течение дня и подберём курс</p>' +
      '<div class="fld"><label for="ln">Имя</label><input class="inp" id="ln" required placeholder="Как к вам обращаться"></div>' +
      '<div class="fld"><label for="lp">Телефон</label><input class="inp" id="lp" type="tel" required placeholder="+7"></div>' +
      '<div class="fld"><label for="lc">Интересует</label><select class="inp" id="lc">' + COURSES.map(function (c) { return '<option value="' + c.id + '">' + E(c.t) + ' · ' + (c.f === 'online' ? 'онлайн' : 'офлайн') + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label for="lm">Комментарий</label><textarea class="inp" id="lm" placeholder="Есть ли опыт, удобное время для звонка"></textarea></div>' +
      A.consent('lcn') + '<button class="btn" style="width:100%;margin-top:12px">Отправить заявку</button></form></div></section>',
      mount: function (v) {
        v.querySelector('#lf').onsubmit = function (e) {
          e.preventDefault(); var c = A.course(v.querySelector('#lc').value);
          A.S.leads.unshift({ id: 'l' + Date.now(), name: v.querySelector('#ln').value, phone: v.querySelector('#lp').value, email: '', stage: 'new', course: c.id, src: 'Сайт', sum: c.p, note: v.querySelector('#lm').value, at: Date.now(), hist: [{ t: Date.now(), x: 'Заявка с сайта (страница «Контакты»)' }], task: { t: Date.now() + 2 * 36e5, x: 'Перезвонить по заявке' } });
          A.save(); e.target.reset(); A.toast('Заявка отправлена — она уже в CRM Алины');
        };
      } };
  });

  /* ---------- документы ---------- */
  function docLinks(d) { return '<a class="btn btn--sm" href="docs/' + d.id + '.pdf" download="' + E(d.t) + ' — Мэй’Эйлин.pdf">' + A.I.dl + 'Скачать PDF</a>'; }
  A.route('/dokumenty', function (arg) {
    A.onScroll = null;
    var d = (window.DOCS || []).filter(function (x) { return x.id === arg[0]; })[0];
    if (!d) return '<section class="dhero"><div class="wrap"><span class="cap rv">Правовая информация</span><h1 class="h2" style="margin:16px 0 18px">' + ln('Документы') + '</h1><p class="lead rv">Публичная оферта, политика конфиденциальности и другие документы ИП Грубниковой А. С. Читайте на сайте или скачивайте в PDF.</p></div></section>' +
      '<section class="sec" style="padding-top:20px"><div class="wrap"><div class="dgrid">' + DOCS.map(function (x, i) { return '<article class="dcard rv" style="--d:' + i * 60 + 'ms"><span class="dcard__ic">' + A.I.doc + '</span><h2>' + E(x.t) + '</h2><p>' + E(x.d) + '</p><small>Редакция от ' + x.date + '</small><div class="dcard__a"><a class="btn btn--sm btn--ghost" href="#/dokumenty/' + x.id + '">Читать</a>' + docLinks(x) + '</div></article>'; }).join('') + '</div></div></section>';
    var toc = d.s.filter(function (x) { return x.h; });
    return { html: '<section class="dhero"><div class="wrap"><a class="lnk" href="#/dokumenty">← Все документы</a><h1 class="h2 dtitle">' + E(d.t) + '</h1><div class="dmeta"><span class="muted">Редакция от ' + d.date + ' · ИП Грубникова Алина Сергеевна</span><div class="dmeta__a">' + docLinks(d) + '<button class="btn btn--sm btn--ghost" onclick="print()">Распечатать</button></div></div></div></section>' +
      '<section class="sec" style="padding-top:10px"><div class="wrap dlay">' + (toc.length > 2 ? '<nav class="dtoc" aria-label="Содержание"><b>Содержание</b>' + toc.map(function (x) { var k = d.s.indexOf(x); return '<a href="#/dokumenty/' + d.id + '" data-sec="s' + k + '">' + E(x.h) + '</a>'; }).join('') + '</nav>' : '<div></div>') +
      '<article class="doc">' + d.s.map(function (x, k) { return '<section id="s' + k + '">' + (x.h ? '<h2>' + E(x.h) + '</h2>' : '') + x.html + '</section>'; }).join('') +
      (d.req ? '<section class="doc__req"><h2>Реквизиты исполнителя</h2>' + DOCS.filter(function (x) { return x.id === 'rekvizity'; })[0].s[0].html + '</section>' : '') + '</article></div></section>',
      mount: function (v) { v.querySelectorAll('[data-sec]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var t = v.querySelector('#' + a.dataset.sec); scrollTo({ top: t.getBoundingClientRect().top + scrollY - 90, behavior: A.rm ? 'auto' : 'smooth' }); }; }); } };
  });

  /* ---------- вход ---------- */
  A.route('/vhod', function () {
    A.onScroll = null;
    return '<section class="login"><div style="width:100%;max-width:900px"><h1 class="h2" style="text-align:center;margin-bottom:34px">' + ln('Вход') + ln('<em>в кабинет</em>', 90) + '</h1><div class="login__g">' +
      '<div class="lcard rv"><span class="cap">Для учениц</span><h2>Личный <em>кабинет</em></h2><p>Уроки, домашние задания, связь с куратором и прогресс обучения.</p>' +
        '<div class="sso"><a class="sso__b vk" href="#/kabinet"><svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="7" fill="#0077FF"/><path d="M12.8 17c-5 0-7.8-3.4-7.9-9.1h2.5c.1 4.2 1.9 5.9 3.4 6.3V7.9h2.3v3.6c1.4-.2 2.9-1.8 3.4-3.6h2.3c-.4 2.2-2 3.8-3.2 4.5 1.2.6 3 2 3.7 4.6h-2.5c-.5-1.7-1.9-3-3.7-3.2V17h-.3z" fill="#fff"/></svg>Войти через VK ID</a>' +
        '<a class="sso__b ya" href="#/kabinet"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#FC3F1D"/><path d="M13.3 6.5h-1.1c-2 0-3.1 1-3.1 2.6 0 1.8.8 2.6 2.4 3.7l1.3.9-3.8 5.8H6.7l3.4-5.1C8.2 13 7 11.7 7 9.2c0-3 2.1-5 5.2-5h3v14.8h-1.9V6.5z" fill="#fff"/></svg>Войти через Яндекс ID</a>' +
        '<div class="sso__or"><span>или по почте</span></div><form class="sso__f" onsubmit="event.preventDefault();var v=this.querySelector(\'input\').value;if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(v)){A.toast(\'Введите почту, указанную при покупке\');return}A.toast(\'Ссылка для входа отправлена на \'+v+\' (демо)\');setTimeout(function(){location.hash=\'#/kabinet\'},900)"><input class="inp" type="email" inputmode="email" autocomplete="email" placeholder="Почта, указанная при покупке"><button class="btn">Получить ссылку для входа <span class="ar">→</span></button></form></div>' +
        '<p class="muted" style="margin-top:14px;font-size:12.5px">Доступ к курсу приходит на почту после оплаты. VK ID или Яндекс ID можно привязать в кабинете для быстрого входа.</p></div>' +
      '<a class="lcard d rv" style="--d:100ms" href="#/crm"><span class="cap" style="color:rgba(244,238,242,.6)">Для Алины</span><h2>CRM <em>куратора</em></h2><p>Заявки, ученицы, проверка заданий, сообщения, аналитика и выгрузка в таблицы.</p><span class="btn btn--pink">Войти <span class="ar">→</span></span></a>' +
      '</div><p class="demo-note">Демо-режим: вход без проверки, данные хранятся только в этом браузере. <button class="lnk" onclick="A.reset();A.toast(\'Демо сброшено\')">Сбросить демо</button></p></div></section>';
  });

  /* ---------- запись (DIKIDI) и покупка курса ---------- */
  D.addEventListener('click', function (e) {
    var b = e.target.closest('[data-book]');
    if (b) { e.preventDefault(); A.book(); return; }
    var buy = e.target.closest('[data-buy]');
    if (buy) { var c = A.course(buy.dataset.buy);
      A.sheet('<h3>' + E(c.t) + '</h3><p class="muted" style="margin-bottom:18px">' + (c.f === 'online' ? 'Онлайн-курс · доступ откроется сразу после оплаты' : 'Офлайн · предоплата бронирует даты') + '</p>' +
        '<div class="fld"><input class="inp" id="pn" autocomplete="name" placeholder="Имя и фамилия"></div><div class="fld"><input class="inp" id="pe" type="email" autocomplete="email" inputmode="email" placeholder="Почта — на неё придёт доступ и чек"></div>' +
        '<div class="opts" data-pick><button aria-pressed="true"><b>Картой</b><span>💳</span></button><button aria-pressed="false"><b>СБП</b><span>⚡</span></button></div>' +
        A.consent('pc', true) + '<button class="btn" style="width:100%;margin-top:12px" id="pok">Оплатить ' + A.rub(c.f === 'online' ? c.p : Math.round(c.p / 3)) + '</button><p class="muted" style="text-align:center;margin-top:10px;font-size:12px">Демо: настоящая оплата заработает после подключения банка</p>', function (p) {
          A.pick(p); p.querySelector('#pok').onclick = function () {
            var em = p.querySelector('#pe').value.trim();
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { A.toast('Укажите почту — на неё придёт доступ к курсу'); p.querySelector('#pe').focus(); return; }
            if (!p.querySelector('#pc').checked) { A.toast('Нужно согласие с офертой и на обработку данных'); return; }
            var name = p.querySelector('#pn').value || 'Новая ученица', sum = c.f === 'online' ? c.p : Math.round(c.p / 3);
            A.S.leads.unshift({ id: 'l' + Date.now(), name: name, phone: '', email: em, stage: c.f === 'online' ? 'study' : 'pay', course: c.id, src: 'Сайт', sum: c.p, note: c.f === 'online' ? 'Оплатила онлайн' : 'Внесла предоплату', at: Date.now(), hist: [{ t: Date.now(), x: 'Покупка на сайте: ' + A.rub(sum) }] });
            A.S.pay.push({ t: Date.now(), sum: sum }); A.save(); A.closeSheet(); A.burst(); A.toast(c.f === 'online' ? 'Оплачено (демо) — доступ в личном кабинете' : 'Предоплата получена (демо) — Алина свяжется');
          };
        }); }
  });
})();
