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
  A.lessons = function (c) {
    var out = [];
    c.g.forEach(function (g) { g[1].forEach(function (t) { out.push({ t: (g[0] ? g[0] + ': ' : '') + t }); }); });
    out.forEach(function (l, i) { l.m = 12 + (i * 7) % 30; if (i % 3 === 2 || i === out.length - 1) l.hw = 'Выполните практику по теме урока и пришлите фото работы крупным планом.'; });
    return out;
  };

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
      chat: [
        { f: 'c', t: 'Здравствуйте, Анна! Я Алина, ваш куратор. Пишите сюда любые вопросы — отвечу в течение дня', at: n - 4 * DAY },
        { f: 's', t: 'Здравствуйте! Какой аппарат лучше взять на старт?', at: n - 2 * DAY },
        { f: 'c', t: 'Для начала хватит 30–35 тысяч оборотов. В уроке 5 разберём, какие фрезы нужны', at: n - 2 * DAY + 36e5 }
      ],
      bookings: [
        { id: 'b1', name: 'Ольга', svc: 'Маникюр с гель-лаком', day: T, time: '11:00', price: 3000 },
        { id: 'b2', name: 'Екатерина', svc: 'Полный педикюр', day: T, time: '15:00', price: 4200 },
        { id: 'b3', name: 'Дарья', svc: 'Наращивание', day: T + DAY, time: '10:00', price: 4500 },
        { id: 'b4', name: 'Светлана', svc: 'Маникюр без покрытия', day: T + DAY, time: '14:00', price: 1800 },
        { id: 'b5', name: 'Ирина', svc: 'Коррекция', day: T + 2 * DAY, time: '12:00', price: 4000 }
      ],
      certs: [{ n: 'ME-2471', sum: 3000, left: 1500, who: 'Анна', till: T + 60 * DAY }],
      pay: [
        { t: n - 40 * DAY, sum: 61000 }, { t: n - 30 * DAY, sum: 84000 }, { t: n - 20 * DAY, sum: 72000 }, { t: n - 10 * DAY, sum: 108000 }, { t: n - 2 * DAY, sum: 91000 }
      ],
      seen: {}
    };
  };
  A.load = function () { var s; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} A.S = s && s.leads ? s : A.seed(); };
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
      D.querySelectorAll('.nav a,.mnav a').forEach(function (a) { if (a.getAttribute('href') === '#' + m.base) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      if (out.mount) out.mount(view);
      A.reveal(view); A.pick(view);
      D.getElementById('mnav').classList.remove('on');
      curPath = m;
    };
    if (first || A.rm || sameSection) { first = false; swap(); return; }
    curtain.classList.remove('out'); curtain.classList.add('in');
    setTimeout(function () { swap(); curtain.classList.remove('in'); curtain.classList.add('out'); setTimeout(function () { curtain.classList.remove('out'); }, 700); }, 560);
  }
  A.rerender = function () { first = true; render(); };
  A.reveal = function (root) {
    if (A.rm || !('IntersectionObserver' in window)) { root.querySelectorAll('.rv,.ln,.wipe').forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
    root.querySelectorAll('.rv,.h1 .ln,.h2 .ln,.wipe').forEach(function (e) { io.observe(e); });
    var cnt = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; var b = e.target, n = +b.dataset.n, t0 = performance.now(); (function st(t) { var k = Math.min(1, (t - t0) / 1500); b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + (k === 1 ? (b.dataset.s || '') : ''); if (k < 1) requestAnimationFrame(st); })(t0); cnt.unobserve(b); }); }, { threshold: .5 });
    root.querySelectorAll('[data-n]').forEach(function (b) { cnt.observe(b); });
  };
  A.start = function () {
    view = D.getElementById('view'); curtain = D.getElementById('curtain');
    addEventListener('hashchange', render); render();
    var hdr = D.getElementById('hdr'), last = 0, tick = false;
    addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; var y = scrollY; hdr.classList.toggle('solid', y > 30); hdr.classList.toggle('hide', y > last && y > 400); last = y; if (A.onScroll) A.onScroll(y); }); }, { passive: true });
    D.getElementById('burger').onclick = function () { D.getElementById('mnav').classList.toggle('on'); };
  };
})();
