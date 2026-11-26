/* Ядро прототипа: демо-база в браузере, маршруты, переходы, общие элементы */
(function () {
  var A = window.A = {};
  var D = document;
  A.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  A.rub = function (n) { return (+n || 0).toLocaleString('ru-RU') + ' ₽'; };
  A.rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DAY = 864e5; A.DAY = DAY;
  A.today = function () { var x = new Date(); x.setHours(0, 0, 0, 0); return +x; };
  var WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  A.WD = WD;
  A.dlong = function (t) { var x = new Date(t); return x.getDate() + ' ' + MON[x.getMonth()]; };
  A.dshort = function (t) { var x = new Date(t); return String(x.getDate()).padStart(2, '0') + '.' + String(x.getMonth() + 1).padStart(2, '0'); };
  A.ago = function (t) { var m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'только что' : m < 60 ? m + ' мин назад' : m < 1440 ? Math.round(m / 60) + ' ч назад' : Math.round(m / 1440) + ' дн. назад'; };
  A.img = function (n, w) { return '../img/' + n + '-' + (w || 960) + '.webp'; };

  /* ---------- курсы: уроки из программы ---------- */
  A.COVER = { mani: 'nails-nude', pedi: 'pedicure-blue', duo: 'nails-wine', 'speed-mani': 'nails-black', 'speed-pedi': 'pedicure-blue', mater: 'nails-milk', visual: 'nails-wine', 'mani-off': 'nails-milk', 'pedi-off': 'pedicure-blue', 'duo-off': 'nails-black' };
  A.course = function (id) { return COURSES.filter(function (c) { return c.id === id; })[0]; };
  A.plural = function (n, a, b, c) { var m = n % 10, h = n % 100; return n + '\u00a0' + (m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c); };
  A.modules = function (c) {
    var P = (window.PROGRAM || {})[c.id];
    if (P) return P;
    var all = []; c.g.forEach(function (g) { g[1].forEach(function (t) { all.push(t); }); });
    var mods = [], n = Math.max(1, Math.ceil(all.length / 4));
    for (var k = 0; k < n; k++) mods.push({ t: (c.g.length > 1 && c.g[k] && c.g[k][0]) || 'Модуль ' + (k + 1), d: c.d, l: all.slice(k * 4, k * 4 + 4).map(function (t) { return { t: t }; }) });
    mods.forEach(function (md, k) { md.l.forEach(function (l, j) { var i = k * 4 + j; if (i % 3 === 2 || i === all.length - 1) l.hw = { t: 'Выполните практику по теме урока и пришлите фото работы крупным планом.', c: ['Фото до и после', 'Фото крупным планом при дневном свете'] }; }); });
    return mods;
  };
  A.lessons = function (c) {
    var out = [];
    A.modules(c).forEach(function (md, k) { md.l.forEach(function (l, j) {
      var x = {}; for (var q in l) x[q] = l[q];
      x.mod = k; x.mt = md.t; x.j = j; x.m = x.m || 12 + (out.length * 7) % 20;
      x.d = x.d || 'Описание урока появится, когда Алина загрузит видео.';
      x.pts = x.pts || ['Теория простым языком', 'Демонстрация на модели', 'Типичные ошибки и как их избежать'];
      x.tc = x.tc || [['00:00', 'Вступление'], ['03:00', 'Теория'], ['08:00', 'Практика']];
      out.push(x);
    }); });
    // тип урока: теория / тест / практика (задание с проверкой). Алина меняет тип в CRM → «Курсы»
    var ov = (A.S && A.S.ltype && A.S.ltype[c.id]) || {};
    out.forEach(function (x, i) {
      x.k = ov[i] || x.k || (x.hw ? 'practice' : x.quiz ? 'test' : 'theory');
      if (x.k === 'practice' && !x.hw) x.hw = { t: 'Выполните практику по теме урока и пришлите фото работы.', c: ['Фото до и после', 'Фото крупным планом при дневном свете'] };
      if (x.k === 'test' && !x.quiz) {
        var o1 = out[(i + 3) % out.length], o2 = out[(i + 7) % out.length];
        x.quiz = [
          { q: 'Какой теме посвящён этот урок?', a: [x.t, o1.t, o2.t], ok: 0 },
          { q: 'Что из этого разбирается в уроке?', a: [o1.pts[0], x.pts[0], o2.pts[1] || o2.pts[0]], ok: 1 },
          { q: 'Что делать, если что-то осталось непонятным?', a: ['Пропустить и идти дальше', 'Пересмотреть фрагмент по таймкодам и написать куратору', 'Начать курс заново'], ok: 1 }
        ];
      }
    });
    return out;
  };
  A.KIND = { theory: ['Теория', 'tag'], test: ['Тест', 'tag test'], practice: ['Задание', 'tag pink'] };

  /* ---------- демо-база (только в этом браузере) ---------- */
  var KEY = 'as-v2';
  A.seed = function () {
    var n = Date.now(), T = A.today();
    var NAMES = ['Анна Смирнова', 'Мария Котова', 'Виктория Лебедева', 'Елена Орлова', 'Дарья Волкова', 'Ксения Морозова', 'Полина Зайцева', 'Ирина Соколова', 'Софья Павлова', 'Алёна Белова', 'Юлия Новикова', 'Ольга Фёдорова'];
    var leads = [
      ['n0', 8, 'new', 'mani', 'Сайт', 20000, 'Хочу на курс с нуля, есть ли рассрочка?'],
      ['n1', 9, 'new', 'duo-off', 'Instagram', 45000, 'Интересует офлайн в Москве'],
      ['n2', 10, 'new', 'mater', 'Telegram', 10000, ''],
      ['n3', 11, 'contact', 'pedi', 'Сайт', 26000, 'Перезвонить вечером'],
      ['n4', 4, 'contact', 'speed-mani', 'Рекомендация', 18000, 'Уже мастер 2 года'],
      ['n5', 5, 'pay', 'duo', 'Сайт', 35000, 'Отправлена ссылка на оплату'],
      ['n6', 6, 'pay', 'mani-off', 'Instagram', 25000, 'Ждёт даты в декабре'],
      ['n7', 0, 'study', 'mani', 'Сайт', 20000, 'Учится, урок 3'],
      ['n8', 1, 'study', 'pedi', 'Telegram', 26000, ''],
      ['n9', 2, 'study', 'duo', 'Сайт', 35000, ''],
      ['n10', 3, 'done', 'mater', 'Сайт', 10000, 'Отзыв получен'],
      ['n11', 7, 'lost', 'visual', 'Instagram', 9000, 'Передумала']
    ].map(function (r, i) {
      var t = n - (i * 0.7 + 0.2) * DAY;
      return { id: r[0], name: NAMES[r[1]], phone: '+7 9' + (10 + i) + ' ' + (100 + i * 37) + '-' + (10 + i) + '-' + (20 + i), email: 'student' + i + '@mail.ru', stage: r[2], course: r[3], src: r[4], sum: r[5], note: r[6], at: t,
        hist: [{ t: t, x: 'Заявка с источника «' + r[4] + '»' }].concat(r[2] !== 'new' ? [{ t: t + 3 * 36e5, x: 'Алина связалась, обсудили курс' }] : []).concat(r[2] === 'study' || r[2] === 'done' ? [{ t: t + DAY, x: 'Оплата ' + A.rub(r[5]) + ' получена, доступ открыт' }] : []),
        task: r[2] === 'contact' || r[2] === 'new' ? { t: T + (i % 3) * DAY + 15 * 36e5, x: r[2] === 'new' ? 'Позвонить и рассказать о курсе' : 'Перезвонить' } : null };
    });
    return {
      leads: leads,
      me: { name: 'Анна Смирнова', course: 'mani', lead: 'n7' },
      prog: { 0: { st: 'done' }, 1: { st: 'done' }, 2: { st: 'sent', text: 'Обработала инструменты: дезинфекция, ПСО, сухожар 180°. Фото во вложении.', photos: [A.img('nails-milk', 480)], at: n - 5 * 36e5 } },
      others: [
        { id: 'o1', name: 'Мария Котова', course: 'pedi', done: 4, last: n - 2 * 36e5, hw: { les: 'Опил форм', text: 'Первый педикюр на модели, покрытие синее.', photos: [A.img('pedicure-blue', 480)], at: n - 26 * 36e5 } },
        { id: 'o2', name: 'Виктория Лебедева', course: 'duo', done: 12, last: n - 30 * 36e5 },
        { id: 'o3', name: 'Елена Орлова', course: 'mater', done: 4, last: n - 5 * DAY, fin: true }
      ],
      v2p: 1,
      chat: [
        { f: 'c', t: 'Здравствуйте, Анна! Я Алина, ваш куратор. Пишите сюда любые вопросы — отвечу в течение дня', at: n - 4 * DAY },
        { f: 's', t: 'Здравствуйте! Какой аппарат лучше взять на старт?', at: n - 2 * DAY },
        { f: 'c', t: 'Для начала хватит 30–35 тысяч оборотов. В уроке 5 разберём, какие фрезы нужны', at: n - 2 * DAY + 36e5 },
        { f: 's', t: 'Сделала первый френч на подруге, посмотрите, пожалуйста', p: [A.img('nails-black', 960), A.img('nails-nude', 960)], at: n - 20 * 36e5 },
        { f: 'c', t: 'Линия улыбки ровная, умница! На безымянном чуть толще — попробуйте кисть тоньше. Вот пример', p: [A.img('nails-milk', 960)], at: n - 18 * 36e5 }
      ],
      pay: [
        { t: n - 40 * DAY, sum: 61000 }, { t: n - 30 * DAY, sum: 84000 }, { t: n - 20 * DAY, sum: 72000 }, { t: n - 10 * DAY, sum: 108000 }, { t: n - 2 * DAY, sum: 91000 }
      ],
      seen: {}
    };
  };
  A.load = function () { var s; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} A.S = s && s.leads ? s : A.seed();
    if (!A.S.v2p) { A.S.v2p = 1; var sd = A.seed(); sd.chat.forEach(function (m) { if (m.p && !A.S.chat.some(function (x) { return x.t === m.t; })) A.S.chat.push(m); }); A.S.chat.sort(function (a, b) { return a.at - b.at; }); } };
  /* онлайн-запись в студию — через DIKIDI (ссылку Алины подставим, когда пришлёт) */
  A.DIKIDI = 'https://dikidi.net/';
  A.book = function () { var w = window.open(A.DIKIDI, '_blank'); if (w) { try { w.opener = null; } catch (e) {} } else location.href = A.DIKIDI; };
  /* согласие (152-ФЗ): отдельная галочка, ссылки открывают документы в новой вкладке */
  A.consent = function (id, offer) { return '<label class="cns"><input type="checkbox" id="' + id + '" required><span>' + (offer ? 'Принимаю условия <a href="#/dokumenty/oferta" target="_blank">публичной оферты</a> и ' : 'Даю ') + (offer ? 'даю ' : '') + '<a href="#/dokumenty/soglasie" target="_blank">согласие на обработку персональных данных</a> в соответствии с <a href="#/dokumenty/politika" target="_blank">политикой конфиденциальности</a></span></label>'; };
  A.compress = function (file, max, cb) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, max / Math.max(im.width, im.height)), cv = D.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); cb(cv.toDataURL('image/jpeg', .78)); }; im.src = r.result; }; r.readAsDataURL(file); };
  A.save = function () { try { localStorage.setItem(KEY, JSON.stringify(A.S)); } catch (e) { A.toast('Не хватило места — фото не сохранилось'); } };
  A.reset = function () { A.S = A.seed(); A.save(); };
  A.load();

  /* ---------- общие элементы ---------- */
  A.toast = function (t) { var e = D.getElementById('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(A.toast.t); A.toast.t = setTimeout(function () { e.classList.remove('on'); }, 2800); };
  A.sheet = function (html, mount) {
    var s = D.getElementById('sheet'), p = s.querySelector('.sheet__p');
    p.innerHTML = '<div class="grab"></div>' + html; s.classList.add('on'); p.scrollTop = 0;
    if (mount) mount(p);
  };
  A.closeSheet = function () { D.getElementById('sheet').classList.remove('on'); };
  D.addEventListener('click', function (e) { if (e.target.id === 'sheet') A.closeSheet(); if (e.target.closest('[data-close]')) A.closeSheet(); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape') A.closeSheet(); });
  A.pick = function (root) { root.querySelectorAll('[data-pick]').forEach(function (g) { g.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || b.disabled) return; g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); g.dispatchEvent(new CustomEvent('pick', { detail: b })); }); }); };

  /* ---------- значки ---------- */
  var I = A.I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M10 20v-6h4v6"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z"/><path d="M5 16a4 4 0 0 1 4-4h10"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    cert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21l2-4h4l2 4"/><circle cx="12" cy="10" r="2.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.3-3.6 4.1-5.4 7.5-5.4s6.2 1.8 7.5 5.4"/></svg>',
    funnel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/></svg>',
    hw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h12l4 4v12H4z"/><path d="M8 12l3 3 5-6"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.4 3.6-5 6.5-5s5.5 1.6 6.5 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.2 2.2 3.6 5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h16M4 16h16"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };

  /* ---------- маршруты и переходы ---------- */
  var routes = {}, curPath = null;
  A.route = function (path, fn) { routes[path] = fn; };
  A.go = function (h) { location.hash = h; };
  function match(h) {
    var path = h.replace(/^#/, '') || '/', parts = path.split('/').filter(Boolean), base = '/' + (parts[0] || ''), arg = parts.slice(1);
    return { fn: routes[base] || routes['/'], base: base, arg: arg, full: path };
  }
  var view = null, curtain = null, first = true;
  function render() {
    var m = match(location.hash);
    if (location.hash.indexOf('#/') !== 0 && location.hash.length > 1) { var el = D.getElementById(location.hash.slice(1)); if (el) { el.scrollIntoView({ behavior: A.rm ? 'auto' : 'smooth' }); return; } }
    var sameSection = curPath && m.base === curPath.base && (m.base === '/kabinet' || m.base === '/crm');
    var swap = function () {
      var out = m.fn(m.arg) || '';
      var isApp = m.base === '/kabinet' || m.base === '/crm';
      D.body.classList.toggle('app', isApp);
      D.getElementById('hdr').hidden = isApp; D.getElementById('foot').hidden = isApp || m.base === '/vhod';
      view.innerHTML = typeof out === 'string' ? out : out.html;
      if (!sameSection) scrollTo(0, 0);
      var nb = { '/kurs': '/akademiya' }[m.base] || m.base; D.querySelectorAll('.nav a,.mnav a').forEach(function (a) { if (a.getAttribute('href') === '#' + nb) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      if (out.mount) out.mount(view);
      A.reveal(view); A.pick(view);
      D.getElementById('mnav').classList.remove('on'); D.body.classList.remove('menu');
      A.typo(view); curPath = m;
    };
    if (first || A.rm || sameSection) { first = false; swap(); return; }
    var toApp = (m.base === '/kabinet' || m.base === '/crm') && !(curPath && (curPath.base === '/kabinet' || curPath.base === '/crm'));
    curtain.classList.toggle('quick', !toApp);
    if (toApp) { D.getElementById('brandS').textContent = m.base === '/crm' ? 'кабинет куратора' : 'личный кабинет'; }
    curtain.classList.remove('out'); void curtain.offsetWidth; curtain.classList.add('in');
    setTimeout(function () { swap(); curtain.classList.remove('in'); curtain.classList.add('out'); setTimeout(function () { curtain.classList.remove('out'); }, 700); }, toApp ? 1900 : 620);
  }
  var SHORT = /(^|[\s(«"„])([А-Яа-яЁёA-Za-z]{1,2}|без|для|под|над|при|про|что|как|или|все|это|вам|вас|нас|мне|так|уже|его|она|они|наш|мой|ваш|где|кто|чем|вы|не|ни)\s+(?=\S)/g;
  A.typo = function (root) {
    var w = D.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentNode && n.parentNode.nodeName; return p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA' ? 2 : 1; } }), n;
    while ((n = w.nextNode())) { var t = n.nodeValue, o = t;
      t = t.replace(SHORT, function (m, a, b) { return a + b + '\u00a0'; }).replace(SHORT, function (m, a, b) { return a + b + '\u00a0'; });
      t = t.replace(/ (—|–) /g, '\u00a0$1 ').replace(/(\d) (?=\d{3}\b)/g, '$1\u00a0').replace(/(\d) (?=(₽|мин|ч\b|дн|дня|дней|мес|урок|тем|лет|год|курс|выпуск|%))/g, '$1\u00a0');
      t = t.replace(/([А-Яа-яЁёA-Za-z])-(?=[А-Яа-яЁёA-Za-z])/g, '$1-\u2060');
      if (t !== o) n.nodeValue = t; }
  };
  A.rerender = function () { first = true; render(); };
  A.reveal = function (root) {
    if (A.rm || !('IntersectionObserver' in window)) { root.querySelectorAll('.rv,.ln,.wipe').forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
    root.querySelectorAll('.rv,.h1 .ln,.h2 .ln,.wipe').forEach(function (e) { io.observe(e); });
    // счётчики: итоговое число уже стоит в разметке; «докрутка» — только украшение, и в конце всегда ставится точное число
    var fin = function (b) { b.textContent = b.dataset.n + (b.dataset.s || ''); };
    var cnt = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; var b = e.target, n = +b.dataset.n, t0 = performance.now(); cnt.unobserve(b);
      setTimeout(function () { fin(b); }, 1800);
      (function st(t) { var k = Math.min(1, Math.max(0, (t - t0) / 1500)); if (k >= 1) return fin(b); b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); requestAnimationFrame(st); })(t0); }); }, { threshold: .4 });
    root.querySelectorAll('[data-n]').forEach(function (b) { cnt.observe(b); });
  };
  A.LOGO = '<span class="lgo"><span class="wm"><img class="wm__m" src="../img/me-mm.webp" alt="" width="545" height="542"><i class="msk wm__r"></i></span><svg class="lgo__s" viewBox="0 0 1000 66" aria-hidden="true"><text x="500" y="52" text-anchor="middle" textLength="996" lengthAdjust="spacing" font-family="Onest,system-ui,sans-serif" font-weight="500" font-size="62" fill="currentColor">АКАДЕМИЯ &amp; НЕЙЛ СТУДИЯ</text></svg></span>';
  A.setTheme = function (t) {
    var R = D.documentElement; R.classList.add('theme-anim'); R.dataset.theme = t;
    try { localStorage.setItem('as-theme', t); } catch (e) {}
    var m = D.querySelector('meta[name=theme-color]'); if (m) m.content = t === 'dark' ? '#1E1D1F' : '#F0E9DF';
    setTimeout(function () { R.classList.remove('theme-anim'); }, 600);
  };
  /* ---------- просмотр фото на весь экран ---------- */
  A.lb = function (list, i) {
    var el = D.getElementById('lb'); if (!el) { el = D.createElement('div'); el.id = 'lb'; el.className = 'lb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.innerHTML = '<button class="lb__x" aria-label="Закрыть">×</button><button class="lb__a lb__p" aria-label="Предыдущее фото">‹</button><figure class="lb__f"><img alt=""></figure><button class="lb__a lb__n" aria-label="Следующее фото">›</button><div class="lb__c"></div>'; D.body.appendChild(el);
      el.addEventListener('click', function (e) { if (e.target.closest('.lb__p')) return go(-1); if (e.target.closest('.lb__n')) return go(1); if (e.target.closest('.lb__x') || !e.target.closest('img')) close(); });
      var x0 = null; el.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
      el.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); x0 = null; });
      D.addEventListener('keydown', function (e) { if (!el.classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }); }
    var L = list, k = i;
    function show() { var im = el.querySelector('img'); im.src = L[k]; el.querySelector('.lb__c').textContent = L.length > 1 ? (k + 1) + ' / ' + L.length : ''; el.classList.toggle('one', L.length < 2); }
    function go(d) { k = (k + d + L.length) % L.length; show(); }
    function close() { el.classList.remove('on'); D.documentElement.style.overflow = ''; }
    A.lb.go = go; show(); el.classList.add('on'); D.documentElement.style.overflow = 'hidden';
  };
  D.addEventListener('click', function (e) {
    var im = e.target.closest('.ph img, .photos img, .msg__p img, [data-zoom]'); if (!im || e.target.closest('a,.cc,button')) return;
    var grp = im.closest('.photos, .msg__p, .collage, .marq__t, .stk, .zoomg') || im.parentNode.parentNode;
    var imgs = [].slice.call(grp.querySelectorAll('img')).filter(function (x) { return x.closest('.ph,.photos,.msg__p,[data-zoom]'); });
    var src = function (x) { return (x.dataset.full || x.currentSrc || x.src).replace(/-480\.webp$/, '-960.webp'); };
    var uniq = []; imgs.forEach(function (x) { var u = src(x); if (uniq.indexOf(u) < 0) uniq.push(u); });
    A.lb(uniq, Math.max(0, uniq.indexOf(src(im))));
  });
  A.toggleTheme = function () { A.setTheme(D.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); };
  A.start = function () {
    var th = D.getElementById('thm'); if (th) th.onclick = A.toggleTheme;
    // тайная дверь в CRM: удерживать «©» в подвале ~1 секунду
    var cp = D.getElementById('cpr'), ht = 0;
    if (cp) { var stop = function () { clearTimeout(ht); cp.classList.remove('hold'); };
      cp.addEventListener('pointerdown', function (e) { e.preventDefault(); cp.classList.add('hold'); ht = setTimeout(function () { cp.classList.remove('hold'); try { navigator.vibrate && navigator.vibrate(30); } catch (er) {} location.hash = '#/crm'; }, 900); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { cp.addEventListener(ev, stop); });
      cp.addEventListener('contextmenu', function (e) { e.preventDefault(); }); }
    try { if (!localStorage.getItem('as-ck')) { var ck = D.getElementById('ck'); ck.hidden = false; requestAnimationFrame(function () { ck.classList.add('on'); }); D.getElementById('ckok').onclick = function () { localStorage.setItem('as-ck', '1'); ck.classList.remove('on'); setTimeout(function () { ck.hidden = true; }, 500); }; } } catch (e) {}
    D.addEventListener('click', function (e) { if (e.target.closest('[data-theme-toggle]')) A.toggleTheme(); });
    if (D.documentElement.dataset.theme === 'dark') { var mt = D.querySelector('meta[name=theme-color]'); if (mt) mt.content = '#1E1D1F'; }
    view = D.getElementById('view'); curtain = D.getElementById('curtain');
    A.typo(D.getElementById('foot')); A.typo(D.getElementById('mnav')); addEventListener('hashchange', render); render();
    var hdr = D.getElementById('hdr'), last = 0, tick = false;
    addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; var y = scrollY; hdr.classList.toggle('solid', y > 30); hdr.classList.toggle('hide', y > last && y > 400); last = y; if (A.onScroll) A.onScroll(y); }); }, { passive: true });
    D.getElementById('burger').onclick = function () { var on = D.getElementById('mnav').classList.toggle('on'); D.body.classList.toggle('menu', on); };
  };
})();
