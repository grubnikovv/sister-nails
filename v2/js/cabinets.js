/* Кабинет ученицы и CRM куратора */
(function () {
  var A = window.A, E = A.esc, D = document, I = A.I, S = function () { return A.S; };

  function shell(kind, tabs, cur, body) {
    var side = '<aside class="side"><a class="logo" href="#/" style="padding:0;background:none"><img src="../img/logo-dark.webp" alt="Мэй’Эйлин"></a>' +
      tabs.map(function (t) { return '<a href="#/' + kind + (t[0] ? '/' + t[0] : '') + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + I[t[2]] + t[1] + (t[3] ? '<span class="cnt">' + t[3] + '</span>' : '') + '</a>'; }).join('') +
      '<a href="#/">' + I.out + 'На сайт</a>' +
      '<div class="who"><span class="av">' + (kind === 'crm' ? 'АГ' : 'АС') + '</span><span>' + (kind === 'crm' ? 'Алина Грубникова<br><small style="opacity:.6">куратор</small>' : E(S().me.name) + '<br><small style="opacity:.6">ученица</small>') + '</span></div></aside>';
    var bar = '<nav class="tabbar">' + tabs.slice(0, 5).map(function (t) { return '<a href="#/' + kind + (t[0] ? '/' + t[0] : '') + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + I[t[2]] + '<span>' + t[1].split(' ')[0] + '</span>' + (t[3] ? '<span class="cnt">' + t[3] + '</span>' : '') + '</a>'; }).join('') + '</nav>';
    return '<div class="shell">' + side + '<main class="main">' + body + '</main></div>' + bar;
  }
  function top(title, sub, right) { return '<div class="atop"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (right || '') + '</div>'; }
  function photos(a) { return a && a.length ? '<div class="photos">' + a.map(function (s) { return '<img src="' + s + '" alt="Фото работы">'; }).join('') + '</div>' : ''; }

  /* ============ КАБИНЕТ УЧЕНИЦЫ ============ */
  function myCourse() { return A.course(S().me.course); }
  function les() { return A.lessons(myCourse()); }
  function done(i) { var p = S().prog[i], l = les()[i]; if (!p) return false; return l.hw ? p.st === 'ok' : (p.st === 'done' || p.st === 'ok'); }
  function open(i) { return i === 0 || done(i - 1); }
  function cur() { var L = les(); for (var i = 0; i < L.length; i++) if (!done(i)) return i; return L.length - 1; }
  function dcount() { var c = 0; les().forEach(function (_, i) { if (done(i)) c++; }); return c; }
  function unreadS() { return S().chat.filter(function (m) { return m.f === 'c' && m.at > (S().seen.s || 0); }).length; }
  function status(i) { var p = S().prog[i] || {}; if (done(i)) return '<span class="tag ok">Пройден</span>'; if (!open(i)) return ''; if (p.st === 'sent') return '<span class="tag wait">На проверке</span>'; if (p.st === 'back') return '<span class="tag bad">На доработку</span>'; return '<span class="tag pink">' + (les()[i].hw ? 'Ждёт задание' : 'Открыт') + '</span>'; }
  function ktabs(cur) { return [['', 'Главная', 'home'], ['kurs', 'Мой курс', 'book'], ['chat', 'Куратор', 'chat', unreadS()], ['sert', 'Сертификаты', 'cert'], ['zapisi', 'Записи', 'cal']]; }

  A.route('/kabinet', function (arg) {
    A.onScroll = null;
    var sub = arg[0] || '', c = myCourse(), L = les(), body = '';
    if (sub === '') {
      var pc = Math.round(dcount() / L.length * 100), ci = cur(), sentN = Object.keys(S().prog).filter(function (k) { return S().prog[k].st === 'sent'; }).length;
      body = top('Здравствуйте, <em>' + E(S().me.name.split(' ')[0]) + '</em>', 'Ваше обучение и записи — в одном месте') +
        '<div class="g3" style="margin-bottom:16px"><div class="kpi"><b>' + pc + '%</b><span>курса пройдено</span></div><div class="kpi"><b>' + dcount() + '/' + L.length + '</b><span>уроков</span></div><div class="kpi"><b>' + sentN + '</b><span>заданий на проверке</span></div><div class="kpi"><b>' + (75 - 8) + '</b><span>дней доступа осталось</span></div></div>' +
        '<div class="g2"><div class="stk2"><div class="cardx" style="background:var(--navy);color:#F4EEF2"><div style="display:flex;gap:18px;align-items:center"><div class="ring" style="--p:' + pc + '"><b style="color:var(--navy)">' + pc + '%</b></div><div><span class="tag pink">Онлайн-курс</span><h2 style="margin:10px 0 0;color:#fff">' + E(c.t) + '</h2></div></div>' +
          '<div style="margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)"><span style="font-size:13px;opacity:.65">Следующий урок</span><div style="font:500 26px/1.15 var(--serif);margin:6px 0 16px">' + (ci + 1) + '. ' + E(L[ci].t) + '</div><a class="btn btn--pink" href="#/kabinet/urok/' + ci + '">Продолжить <span class="ar">→</span></a></div></div>' +
          '<div class="cardx"><h2>Последние события</h2>' + [S().prog[2] && S().prog[2].st === 'sent' ? ['wait', 'Задание к уроку 3 отправлено на проверку'] : null, ['ok', 'Урок 2 пройден'], ['pink', 'Алина ответила в чате']].filter(Boolean).map(function (r) { return '<div class="row2"><span class="tag ' + r[0] + '">●</span><div class="m"><b style="font-weight:400">' + r[1] + '</b></div></div>'; }).join('') + '</div></div>' +
        '<div class="stk2"><div class="cardx"><h2>Куратор</h2><div class="row2"><span class="av">АГ</span><div class="m"><b>Алина Грубникова</b><span>отвечает в течение дня</span></div></div><a class="btn btn--sm" href="#/kabinet/chat" style="margin-top:10px">Написать</a></div>' +
        '<div class="cardx"><h2>Ещё курсы</h2>' + ['mater', 'visual'].map(function (id) { var x = A.course(id); return '<a class="row2" href="#/kurs/' + id + '"><img src="' + A.img(A.COVER[id], 480) + '" style="width:56px;height:56px;border-radius:12px;object-fit:cover"><div class="m"><b>' + E(x.t) + '</b><span>' + A.rub(x.p) + '</span></div><span>→</span></a>'; }).join('') + '</div></div></div>';
    } else if (sub === 'kurs') {
      body = top(E(c.t), 'Уроки открываются по порядку — после проверки задания') + '<div class="g2"><div class="cardx"><div class="les">' + L.map(function (l, i) {
        var o = open(i); return '<button ' + (o ? 'onclick="location.hash=\'#/kabinet/urok/' + i + '\'"' : 'disabled') + (i === cur() ? ' aria-current="true"' : '') + '><span class="n' + (done(i) ? ' ok' : '') + '">' + (done(i) ? '✓' : i + 1) + '</span><span class="t"><b>' + E(l.t) + '</b><small>' + l.m + ' мин' + (l.hw ? ' · задание' : '') + '</small></span>' + (o ? status(i) : I.lock) + '</button>'; }).join('') + '</div></div>' +
        '<div class="stk2"><div class="cardx"><h2>Материалы курса</h2>' + ['Конспект курса (PDF)', 'Список расходников', 'Чек-лист стерилизации'].map(function (m) { return '<div class="row2"><span class="tag">PDF</span><div class="m"><b style="font-weight:400">' + m + '</b></div><button class="btn btn--xs btn--ghost" onclick="A.toast(\'Файл появится, когда Алина загрузит материалы\')">Скачать</button></div>'; }).join('') + '</div></div></div>';
    } else if (sub === 'urok') {
      var i = Math.min(+arg[1] || 0, L.length - 1), l = L[i], p = S().prog[i] || {};
      if (!open(i)) { location.hash = '#/kabinet/kurs'; return ''; }
      body = '<a class="lnk" href="#/kabinet/kurs">← Все уроки</a><div style="height:16px"></div><div class="g2"><div class="stk2"><div class="video"><img src="' + A.img(['nails-wine', 'nails-nude', 'nails-milk', 'nails-black', 'pedicure-blue'][i % 5]) + '" alt=""><button class="play" aria-label="Смотреть" onclick="var b=this.parentNode.querySelector(\'.vbar i\');b.style.transition=\'width 6s linear\';b.style.width=\'100%\';A.toast(\'Здесь будет видео урока — защищённое от скачивания\')"></button><div class="vbar"><i></i></div></div>' +
        '<div class="cardx"><span class="muted">Урок ' + (i + 1) + ' из ' + L.length + ' · ' + l.m + ' мин</span><h2 style="margin:8px 0 10px">' + E(l.t) + '</h2>' + status(i) + '<p class="muted" style="margin-top:14px">Конспект урока и список материалов — во вкладке «Мой курс».</p></div></div><div class="stk2">';
      if (l.hw) {
        body += '<div class="cardx"><h2>Домашнее задание</h2><p>' + E(l.hw) + '</p>' + (p.comment ? '<div class="cmt"><b>Комментарий Алины</b>' + E(p.comment) + '</div>' : '');
        if (p.st === 'sent' || p.st === 'ok') body += '<div style="margin-top:14px;padding:14px;border-radius:14px;background:var(--grey2)"><b style="font-weight:500">Ваш ответ</b> <span class="muted">· ' + A.ago(p.at) + '</span><p style="margin-top:6px;font-size:14.5px">' + E(p.text) + '</p>' + photos(p.photos) + '</div>' + (p.st === 'sent' ? '<p class="muted" style="margin-top:12px">Алина проверит и напишет комментарий. Следующий урок откроется после проверки.</p>' : '');
        else body += '<div class="fld" style="margin-top:14px"><textarea class="inp" id="hwT" placeholder="Опишите, что получилось">' + E(p.st === 'back' ? p.text : '') + '</textarea></div><label class="btn btn--ghost btn--sm" style="cursor:pointer">📷 Добавить фото<input type="file" id="hwF" accept="image/*" multiple hidden></label><div class="photos" id="hwP"></div><button class="btn" style="width:100%;margin-top:14px" id="hwS">Отправить на проверку</button>';
        body += '</div>';
      } else body += '<div class="cardx"><h2>Без задания</h2><p class="muted">Посмотрите урок и отметьте его — откроется следующий.</p>' + (done(i) ? '<span class="tag ok" style="margin-top:12px">Пройден</span>' : '<button class="btn" style="margin-top:14px" id="lesD">Урок просмотрен</button>') + '</div>';
      if (i + 1 < L.length) body += '<div class="cardx"><span class="muted">Следующий урок</span><h3 style="margin-top:6px">' + E(L[i + 1].t) + '</h3>' + (open(i + 1) ? '<a class="btn btn--sm" style="margin-top:12px" href="#/kabinet/urok/' + (i + 1) + '">Перейти</a>' : '<p class="muted" style="margin-top:8px">' + A.I.lock + ' Откроется после ' + (l.hw ? 'проверки задания' : 'просмотра') + '</p>') + '</div>';
      body += '</div></div>';
      return { html: shell('kabinet', ktabs(), 'kurs', body), mount: function (v) {
        var tmp = [];
        var f = v.querySelector('#hwF'); if (f) f.onchange = function () { [].slice.call(f.files, 0, 4).forEach(function (file) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 600 / Math.max(im.width, im.height)), cv = D.createElement('canvas'); cv.width = im.width * k; cv.height = im.height * k; cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); tmp.push(cv.toDataURL('image/jpeg', .7)); v.querySelector('#hwP').innerHTML = tmp.map(function (s) { return '<img src="' + s + '">'; }).join(''); }; im.src = r.result; }; r.readAsDataURL(file); }); };
        var s = v.querySelector('#hwS'); if (s) s.onclick = function () { var t = v.querySelector('#hwT').value.trim(); if (!t && !tmp.length) { A.toast('Напишите ответ или добавьте фото'); return; } S().prog[i] = { st: 'sent', text: t, photos: tmp, at: Date.now() }; A.save(); A.toast('Отправлено Алине — задание уже в её CRM'); A.rerender(); };
        var d = v.querySelector('#lesD'); if (d) d.onclick = function () { S().prog[i] = { st: 'done', at: Date.now() }; A.save(); A.toast('Урок пройден — следующий открыт'); A.rerender(); };
      } };
    } else if (sub === 'chat') {
      S().seen.s = Date.now(); A.save(); body = chat('s');
      return { html: shell('kabinet', ktabs(), 'chat', body), mount: chatMount('s') };
    } else if (sub === 'sert') {
      var fin = dcount() === L.length;
      body = top('Сертификаты', 'Сертификаты об обучении и подарочные сертификаты студии') + '<div class="g2"><div class="cardx"><h2>Об окончании курса</h2><div style="aspect-ratio:1.414;border-radius:16px;background:#FBF7F5;border:1px solid var(--line);display:grid;place-items:center;text-align:center;padding:20px;position:relative;filter:' + (fin ? 'none' : 'grayscale(1)') + ';opacity:' + (fin ? 1 : .55) + '"><div><img src="../img/logo.webp" style="width:120px;margin:0 auto 10px"><div class="cap">Сертификат</div><div style="font:italic 500 34px var(--serif);margin:8px 0">' + E(c.t) + '</div><div class="muted">' + E(S().me.name) + '</div></div></div><p class="muted" style="margin-top:12px">' + (fin ? 'Готов! Можно скачать или заказать бумажный.' : 'Откроется после финального задания: пройдено ' + dcount() + ' из ' + L.length + ' уроков.') + '</p></div>' +
        '<div class="cardx"><h2>Подарочные</h2>' + S().certs.map(function (x) { return '<div class="row2"><span class="tag pink">№ ' + x.n + '</span><div class="m"><b>' + A.rub(x.left) + '</b><span>из ' + A.rub(x.sum) + ' · до ' + A.dshort(x.till) + '</span></div></div>'; }).join('') + '<button class="btn btn--sm" data-gift style="margin-top:12px">Подарить сертификат</button></div></div>';
    } else if (sub === 'zapisi') {
      var mine = S().bookings.filter(function (b) { return b.site; });
      body = top('Записи в студию', 'Онлайн-запись через DIKIDI') + '<div class="cardx" style="max-width:720px">' + (mine.length ? mine.map(function (b) { return '<div class="row2"><span class="tag navy">' + A.dshort(b.day) + '</span><div class="m"><b>' + E(b.svc) + '</b><span>' + b.time + ' · ' + A.rub(b.price) + '</span></div></div>'; }).join('') : '<p class="empty">Пока нет записей</p>') + '<button class="btn" data-book style="margin-top:14px">Записаться онлайн</button></div>';
    }
    return shell('kabinet', ktabs(), sub, body);
  });

  /* ---------- чат (общий) ---------- */
  function chat(me) {
    return top(me === 's' ? 'Куратор' : 'Сообщения', me === 's' ? 'Алина отвечает в течение дня' : 'Переписка с ученицами') + '<div class="g2"><div class="cardx chat"><div class="row2" style="padding-top:0"><span class="av">' + (me === 's' ? 'АГ' : 'АС') + '</span><div class="m"><b>' + (me === 's' ? 'Алина Грубникова' : E(S().me.name)) + '</b><span>' + (me === 's' ? 'куратор курса' : 'Маникюр с нуля · урок ' + (cur() + 1)) + '</span></div></div><div class="chat__l" id="cl">' +
      S().chat.map(function (m) { return '<div class="msg ' + (m.f === me ? 'out' : 'in') + '">' + E(m.t) + '<small>' + A.ago(m.at) + '</small></div>'; }).join('') + '</div><form class="chat__f" id="cf"><input class="inp" id="ci" placeholder="Сообщение…" autocomplete="off"><button class="btn btn--sm">Отправить</button></form></div>' +
      '<div class="cardx"><h2>' + (me === 's' ? 'Подсказка' : 'Диалоги') + '</h2>' + (me === 's' ? '<p class="muted">Уведомление об ответе придёт в Telegram или на почту.</p>' : [S().me.name].concat(S().others.map(function (o) { return o.name; })).map(function (n, i) { return '<div class="row2"><span class="av" style="width:34px;height:34px;font-size:12px">' + n.split(' ').map(function (x) { return x[0]; }).join('') + '</span><div class="m"><b>' + E(n) + '</b><span>' + (i ? 'нет новых' : 'активный диалог') + '</span></div></div>'; }).join('')) + '</div></div>';
  }
  function chatMount(me) { return function (v) { var l = v.querySelector('#cl'); l.scrollTop = l.scrollHeight; v.querySelector('#cf').onsubmit = function (e) { e.preventDefault(); var t = v.querySelector('#ci').value.trim(); if (!t) return; S().chat.push({ f: me, t: t, at: Date.now() }); S().seen[me] = Date.now(); A.save(); A.rerender(); }; }; }

  /* ============ CRM КУРАТОРА ============ */
  var STAGES = [['new', 'Новая заявка', '#8A90A0'], ['contact', 'Связались', '#E2A33B'], ['pay', 'Ждёт оплату', '#C8006A'], ['study', 'Учится', '#3B6FE2'], ['done', 'Завершила', '#1E8A55'], ['lost', 'Отказ', '#B3123A']];
  function stageName(s) { return (STAGES.filter(function (x) { return x[0] === s; })[0] || [0, s])[1]; }
  function queue() { var q = []; var L = les(); Object.keys(S().prog).forEach(function (k) { if (S().prog[k].st === 'sent') q.push({ me: 1, i: +k, l: L[k], p: S().prog[k] }); }); S().others.forEach(function (o) { if (o.hw) q.push({ o: o, p: o.hw }); }); return q; }
  function unreadC() { return S().chat.filter(function (m) { return m.f === 's' && m.at > (S().seen.c || 0); }).length; }
  function ctabs() { return [['', 'Воронка', 'funnel', S().leads.filter(function (l) { return l.stage === 'new'; }).length], ['dz', 'Задания', 'hw', queue().length], ['uchenitsy', 'Ученицы', 'users'], ['chat', 'Сообщения', 'chat', unreadC()], ['zapisi', 'Записи', 'cal'], ['analitika', 'Аналитика', 'chart'], ['eksport', 'Выгрузка', 'dl']]; }

  A.route('/crm', function (arg) {
    A.onScroll = null;
    var sub = arg[0] || '', body = '';
    if (sub === '') {
      var L = S().leads, open = L.filter(function (l) { return l.stage !== 'lost' && l.stage !== 'done'; }), tasks = L.filter(function (l) { return l.task; });
      body = top('Воронка <em>заявок</em>', 'Перетащите карточку в нужный этап — или откройте её', '<button class="btn btn--sm" id="add">+ Заявка</button>') +
        '<div class="g3" style="margin-bottom:16px"><div class="kpi"><b>' + L.filter(function (l) { return l.stage === 'new'; }).length + '</b><span>новых заявок</span></div><div class="kpi"><b>' + A.rub(open.reduce(function (s, l) { return s + l.sum; }, 0)).replace(' ₽', '') + '</b><span>₽ в работе</span></div><div class="kpi"><b>' + L.filter(function (l) { return l.stage === 'study'; }).length + '</b><span>учатся сейчас</span></div><div class="kpi"><b>' + tasks.length + '</b><span>задач на сегодня–завтра</span></div></div>' +
        '<div class="kanban" id="kb">' + STAGES.map(function (st) { var items = L.filter(function (l) { return l.stage === st[0]; }); return '<div class="col" data-st="' + st[0] + '" style="--c:' + st[2] + '"><div class="col__h"><div><b>' + st[1] + '</b><i></i></div><span>' + items.length + ' · ' + A.rub(items.reduce(function (s, l) { return s + l.sum; }, 0)) + '</span></div>' +
          items.map(function (l) { var c = A.course(l.course); return '<div class="lcd" data-id="' + l.id + '"><b>' + E(l.name) + '</b><div class="s">' + E(c.t) + (c.f === 'offline' ? ' · офлайн' : '') + '</div><div class="f"><span class="src">' + E(l.src) + '</span><span class="sum">' + A.rub(l.sum) + '</span></div>' + (l.task ? '<div class="due" style="margin-top:8px">⏰ ' + E(l.task.x) + ' · ' + A.dshort(l.task.t) + '</div>' : '') + '</div>'; }).join('') + '</div>'; }).join('') + '</div>';
      return { html: shell('crm', ctabs(), '', body), mount: function (v) { kanban(v); v.querySelector('#add').onclick = function () { leadForm(); }; } };
    } else if (sub === 'lead') {
      var l = S().leads.filter(function (x) { return x.id === arg[1]; })[0]; if (!l) { location.hash = '#/crm'; return ''; }
      var c = A.course(l.course);
      body = '<a class="lnk" href="#/crm">← Воронка</a><div style="height:14px"></div>' + top(E(l.name), E(c.t) + ' · ' + A.rub(l.sum)) +
        '<div class="g2"><div class="stk2"><div class="cardx"><h2>Этап</h2><div class="seg" id="stg">' + STAGES.map(function (s) { return '<button aria-pressed="' + (s[0] === l.stage) + '" data-s="' + s[0] + '">' + s[1] + '</button>'; }).join('') + '</div></div>' +
        '<div class="cardx"><h2>Контакты</h2><div class="row2"><div class="m"><span>Телефон</span><b>' + E(l.phone) + '</b></div><a class="btn btn--xs" href="tel:' + E(l.phone) + '">Позвонить</a></div><div class="row2"><div class="m"><span>Почта</span><b>' + E(l.email || '—') + '</b></div></div><div class="row2"><div class="m"><span>Источник</span><b>' + E(l.src) + '</b></div><div class="m"><span>Создана</span><b>' + A.dshort(l.at) + '</b></div></div>' +
        '<div class="row2"><div class="m"><span>Курс</span><b>' + E(c.t) + ' · ' + (c.f === 'online' ? 'онлайн' : 'офлайн') + '</b></div></div></div>' +
        '<div class="cardx"><h2>История</h2><ul class="hist">' + l.hist.slice().reverse().map(function (h) { return '<li>' + E(h.x) + '<small>' + A.dshort(h.t) + ' · ' + A.ago(h.t) + '</small></li>'; }).join('') + '</ul><div class="fld" style="margin-top:10px"><textarea class="inp" id="nt" placeholder="Заметка: о чём договорились"></textarea></div><button class="btn btn--sm" id="ntb">Добавить заметку</button></div></div>' +
        '<div class="stk2"><div class="cardx"><h2>Задача</h2>' + (l.task ? '<div class="row2"><span class="tag wait">⏰</span><div class="m"><b>' + E(l.task.x) + '</b><span>до ' + A.dshort(l.task.t) + '</span></div><button class="btn btn--xs btn--ghost" id="tdone">Готово</button></div>' : '<p class="muted">Задач нет</p>') +
        '<div class="fld" style="margin-top:12px"><input class="inp" id="tx" placeholder="Например: перезвонить"></div><div class="fld"><input class="inp" id="td" type="date"></div><button class="btn btn--sm btn--ghost" id="tadd">Поставить задачу</button></div>' +
        '<div class="cardx"><h2>Действия</h2><div style="display:grid;gap:8px"><button class="btn btn--sm" id="sendpay">Отправить ссылку на оплату</button><a class="btn btn--sm btn--ghost" href="https://wa.me/' + String(l.phone).replace(/\D/g, '') + '">Написать в WhatsApp</a>' + (l.stage === 'study' ? '<a class="btn btn--sm btn--ghost" href="#/crm/uchenitsy">Прогресс ученицы</a>' : '') + '</div></div>' +
        (l.note ? '<div class="cardx"><h2>Комментарий клиентки</h2><p>' + E(l.note) + '</p></div>' : '') + '</div></div>';
      return { html: shell('crm', ctabs(), '', body), mount: function (v) {
        v.querySelector('#stg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; l.stage = b.dataset.s; l.hist.push({ t: Date.now(), x: 'Этап: ' + stageName(l.stage) }); A.save(); A.toast('Этап изменён'); A.rerender(); });
        v.querySelector('#ntb').onclick = function () { var t = v.querySelector('#nt').value.trim(); if (!t) return; l.hist.push({ t: Date.now(), x: t }); A.save(); A.rerender(); };
        var td = v.querySelector('#tdone'); if (td) td.onclick = function () { l.hist.push({ t: Date.now(), x: 'Выполнено: ' + l.task.x }); l.task = null; A.save(); A.rerender(); };
        v.querySelector('#tadd').onclick = function () { var x = v.querySelector('#tx').value.trim(), d = v.querySelector('#td').value; if (!x) return; l.task = { x: x, t: d ? +new Date(d) : Date.now() + A.DAY }; A.save(); A.toast('Задача поставлена — напомним в Telegram'); A.rerender(); };
        v.querySelector('#sendpay').onclick = function () { l.stage = 'pay'; l.hist.push({ t: Date.now(), x: 'Отправлена ссылка на оплату ' + A.rub(l.sum) }); A.save(); A.toast('Ссылка на оплату отправлена (демо)'); A.rerender(); };
      } };
    } else if (sub === 'dz') {
      var q = queue();
      body = top('Домашние <em>задания</em>', 'Примите работу — у ученицы откроется следующий урок') + (q.length ? '<div class="stk2" style="max-width:860px">' + q.map(function (it, k) {
        var who = it.me ? S().me.name : it.o.name, what = it.me ? 'Урок ' + (it.i + 1) + ': ' + it.l.t : it.p.les;
        return '<div class="cardx"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><span class="tag wait">На проверке · ' + A.ago(it.p.at) + '</span><h3 style="margin-top:10px">' + E(who) + '</h3><p class="muted">' + E(what) + '</p></div></div><div style="margin-top:12px;padding:14px;border-radius:14px;background:var(--grey2)"><p style="font-size:14.5px">' + E(it.p.text) + '</p>' + photos(it.p.photos) + '</div>' +
          '<div class="fld" style="margin-top:12px"><textarea class="inp" id="cm' + k + '" placeholder="Комментарий: что получилось, что исправить"></textarea></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--sm" data-ok="' + k + '">Принять — открыть следующий урок</button><button class="btn btn--sm btn--ghost" data-back="' + k + '">Вернуть на доработку</button></div></div>'; }).join('') + '</div>' : '<div class="cardx"><p class="empty">Все задания проверены ✓<br>Новые придут сюда и в Telegram</p></div>');
      return { html: shell('crm', ctabs(), 'dz', body), mount: function (v) {
        v.addEventListener('click', function (e) { var b = e.target.closest('[data-ok],[data-back]'); if (!b) return; var k = +(b.dataset.ok || b.dataset.back), it = q[k], ok = !!b.dataset.ok, cm = v.querySelector('#cm' + k).value.trim();
          if (!ok && !cm) { A.toast('Напишите, что исправить'); return; }
          if (it.me) { it.p.st = ok ? 'ok' : 'back'; it.p.comment = cm || 'Отличная работа! Следующий урок открыт.'; } else { it.o.hw = null; if (ok) it.o.done++; }
          A.save(); A.toast(ok ? 'Принято — у ученицы открылся следующий урок' : 'Возвращено с комментарием'); A.rerender(); });
      } };
    } else if (sub === 'uchenitsy') {
      var list = [{ name: S().me.name, course: S().me.course, done: dcount(), all: les().length, last: Date.now() - 36e5, hw: queue().filter(function (x) { return x.me; }).length }].concat(S().others.map(function (o) { return { name: o.name, course: o.course, done: o.done, all: A.lessons(A.course(o.course)).length, last: o.last, hw: o.hw ? 1 : 0 }; }));
      body = top('Ученицы', list.length + ' активных · прогресс и задания') + '<div class="cardx"><div class="tblw"><table class="tbl"><thead><tr><th>Ученица</th><th>Курс</th><th>Прогресс</th><th>Задания</th><th>Была</th></tr></thead><tbody>' + list.map(function (s) { var pc = Math.round(s.done / s.all * 100); return '<tr><td><b style="font-weight:500">' + E(s.name) + '</b></td><td>' + E(A.course(s.course).t) + '</td><td style="min-width:140px"><div class="bar"><i style="width:' + pc + '%"></i></div><small class="muted">' + s.done + '/' + s.all + '</small></td><td>' + (s.hw ? '<span class="tag wait">' + s.hw + ' на проверке</span>' : (pc === 100 ? '<span class="tag ok">Завершила</span>' : '<span class="tag">—</span>')) + '</td><td class="muted">' + A.ago(s.last) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    } else if (sub === 'chat') {
      S().seen.c = Date.now(); A.save();
      return { html: shell('crm', ctabs(), 'chat', chat('c')), mount: chatMount('c') };
    } else if (sub === 'zapisi') {
      var B = S().bookings.slice().sort(function (a, b) { return a.day - b.day || a.time.localeCompare(b.time); }), days = {};
      B.forEach(function (b) { (days[b.day] = days[b.day] || []).push(b); });
      body = top('Записи <em>студии</em>', 'Синхронизация с DIKIDI · ' + B.length + ' записей') + '<div class="g3" style="margin-bottom:16px"><div class="kpi"><b>' + B.filter(function (b) { return b.day === A.today(); }).length + '</b><span>сегодня</span></div><div class="kpi"><b>' + B.length + '</b><span>на неделе</span></div><div class="kpi"><b>' + A.rub(B.reduce(function (s, b) { return s + b.price; }, 0)).replace(' ₽', '') + '</b><span>₽ ожидается</span></div><div class="kpi"><b>' + S().certs.length + '</b><span>сертификатов</span></div></div>' +
        '<div class="g2"><div class="stk2">' + Object.keys(days).map(function (d) { return '<div class="cardx"><h2>' + (+d === A.today() ? 'Сегодня' : +d === A.today() + A.DAY ? 'Завтра' : A.dlong(+d)) + '</h2>' + days[d].map(function (b) { return '<div class="row2"><span class="tag navy">' + b.time + '</span><div class="m"><b>' + E(b.name) + (b.site ? ' <span class="tag pink">с сайта</span>' : '') + '</b><span>' + E(b.svc) + '</span></div><b style="font-weight:500">' + A.rub(b.price) + '</b></div>'; }).join('') + '</div>'; }).join('') + '</div>' +
        '<div class="cardx"><h2>Подарочные сертификаты</h2>' + S().certs.map(function (x) { return '<div class="row2"><span class="tag pink">' + x.n + '</span><div class="m"><b>' + E(x.who) + '</b><span>остаток ' + A.rub(x.left) + ' из ' + A.rub(x.sum) + '</span></div></div>'; }).join('') + '</div></div>';
    } else if (sub === 'analitika') {
      var P = S().pay, mx = Math.max.apply(null, P.map(function (p) { return p.sum; })), tot = P.reduce(function (s, p) { return s + p.sum; }, 0), Ls = S().leads;
      var fun = [['Заявки', Ls.length], ['Связались', Ls.filter(function (l) { return l.stage !== 'new'; }).length], ['Ждут оплату+', Ls.filter(function (l) { return ['pay', 'study', 'done'].indexOf(l.stage) >= 0; }).length], ['Оплатили', Ls.filter(function (l) { return ['study', 'done'].indexOf(l.stage) >= 0; }).length]];
      var src = {}; Ls.forEach(function (l) { src[l.src] = (src[l.src] || 0) + 1; });
      body = top('Аналитика', 'Выручка, воронка и источники заявок') + '<div class="g3" style="margin-bottom:16px"><div class="kpi"><b>' + A.rub(tot).replace(' ₽', '') + '</b><span>₽ за период</span><i>+18%</i></div><div class="kpi"><b>' + Math.round(fun[3][1] / fun[0][1] * 100) + '%</b><span>конверсия в оплату</span></div><div class="kpi"><b>' + A.rub(Math.round(tot / P.length)).replace(' ₽', '') + '</b><span>₽ средний чек</span></div><div class="kpi"><b>' + S().others.length + 1 + '</b><span>активных учениц</span></div></div>' +
        '<div class="g2"><div class="cardx"><h2>Выручка по неделям</h2><div class="chart">' + P.map(function (p, i) { return '<div><i style="height:' + Math.round(p.sum / mx * 150) + 'px;animation-delay:' + i * 80 + 'ms"></i>' + A.dshort(p.t) + '</div>'; }).join('') + '</div></div>' +
        '<div class="stk2"><div class="cardx"><h2>Воронка</h2><ul class="funnel">' + fun.map(function (f) { return '<li><span>' + f[0] + '</span><span class="fb" style="width:' + Math.round(f[1] / fun[0][1] * 100) + '%"></span><b>' + f[1] + '</b></li>'; }).join('') + '</ul></div>' +
        '<div class="cardx"><h2>Источники</h2>' + Object.keys(src).map(function (k) { return '<div class="row2"><div class="m"><b style="font-weight:400">' + E(k) + '</b></div><b>' + src[k] + '</b></div>'; }).join('') + '</div></div></div>';
    } else if (sub === 'eksport') {
      body = top('Выгрузка <em>в таблицы</em>', 'Файлы открываются в Excel и Google Таблицах') + '<div class="g2"><div class="cardx"><h2>Скачать</h2>' +
        [['leads', 'Заявки и клиентки', 'имя, телефон, курс, этап, сумма, источник'], ['students', 'Ученицы и прогресс', 'курс, пройдено уроков, задания'], ['bookings', 'Записи студии', 'дата, время, услуга, сумма'], ['pay', 'Оплаты', 'дата и сумма']].map(function (x) { return '<div class="row2"><span class="tag">CSV</span><div class="m"><b>' + x[1] + '</b><span>' + x[2] + '</span></div><button class="btn btn--xs" data-csv="' + x[0] + '">Скачать</button></div>'; }).join('') + '</div>' +
        '<div class="cardx"><h2>Как открыть в Google Таблицах</h2><ol style="list-style:decimal;padding-left:18px;display:grid;gap:8px;font-size:14.5px"><li>Скачайте файл кнопкой слева</li><li>Откройте sheets.google.com → «Пустой файл»</li><li>«Файл» → «Импорт» → «Загрузка» → выберите файл</li><li>Готово — всё по колонкам</li></ol><p class="muted" style="margin-top:12px">На хостинге добавим автоматическую выгрузку раз в неделю на почту.</p></div></div>';
      return { html: shell('crm', ctabs(), 'eksport', body), mount: function (v) { v.addEventListener('click', function (e) { var b = e.target.closest('[data-csv]'); if (b) csv(b.dataset.csv); }); } };
    }
    return shell('crm', ctabs(), sub, body);
  });

  /* ---------- перетаскивание карточек ---------- */
  function kanban(v) {
    var drag = null, ghostX = 0, ghostY = 0, sx = 0, sy = 0, moved = false;
    v.querySelectorAll('.lcd').forEach(function (el) {
      el.addEventListener('pointerdown', function (e) { drag = el; sx = e.clientX; sy = e.clientY; moved = false; if (e.pointerType === 'mouse') el.setPointerCapture(e.pointerId); });
      el.addEventListener('pointermove', function (e) { if (drag !== el) return; var dx = e.clientX - sx, dy = e.clientY - sy;
        if (e.pointerType !== 'mouse') { if (Math.hypot(dx, dy) > 10) moved = true; return; }
        if (!moved && Math.hypot(dx, dy) < 8) return; moved = true; el.classList.add('drag'); el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(2deg)';
        v.querySelectorAll('.col').forEach(function (c) { var r = c.getBoundingClientRect(); c.classList.toggle('over', e.clientX > r.left && e.clientX < r.right); }); });
      el.addEventListener('pointerup', function (e) { if (drag !== el) return; drag = null; el.classList.remove('drag'); el.style.transform = '';
        if (!moved) { location.hash = '#/crm/lead/' + el.dataset.id; return; }
        if (e.pointerType !== 'mouse') return;
        var col = [].filter.call(v.querySelectorAll('.col'), function (c) { var r = c.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right; })[0];
        v.querySelectorAll('.col').forEach(function (c) { c.classList.remove('over'); });
        if (col) { var l = A.S.leads.filter(function (x) { return x.id === el.dataset.id; })[0]; if (l.stage !== col.dataset.st) { l.stage = col.dataset.st; l.hist.push({ t: Date.now(), x: 'Этап: ' + stageName(l.stage) }); A.save(); A.toast('«' + l.name + '» → ' + stageName(l.stage)); A.rerender(); } } });
      el.addEventListener('pointercancel', function () { drag = null; el.classList.remove('drag'); el.style.transform = ''; });
    });
  }
  function leadForm() {
    A.sheet('<h3>Новая заявка</h3><div class="fld"><input class="inp" id="an" placeholder="Имя"></div><div class="fld"><input class="inp" id="ap" placeholder="Телефон"></div><div class="fld"><select class="inp" id="ac">' + COURSES.map(function (c) { return '<option value="' + c.id + '">' + E(c.t) + '</option>'; }).join('') + '</select></div><div class="fld"><select class="inp" id="as"><option>Instagram</option><option>Telegram</option><option>Рекомендация</option><option>Звонок</option></select></div><button class="btn" style="width:100%" id="aok">Добавить в воронку</button>', function (p) {
      p.querySelector('#aok').onclick = function () { var c = A.course(p.querySelector('#ac').value); A.S.leads.unshift({ id: 'l' + Date.now(), name: p.querySelector('#an').value || 'Без имени', phone: p.querySelector('#ap').value, email: '', stage: 'new', course: c.id, src: p.querySelector('#as').value, sum: c.p, note: '', at: Date.now(), hist: [{ t: Date.now(), x: 'Заявка добавлена вручную' }], task: null }); A.save(); A.closeSheet(); A.rerender(); };
    });
  }
  /* ---------- выгрузка CSV (Excel / Google Таблицы) ---------- */
  function csv(kind) {
    var rows;
    if (kind === 'leads') rows = [['Имя', 'Телефон', 'Почта', 'Курс', 'Этап', 'Сумма', 'Источник', 'Дата заявки', 'Комментарий']].concat(A.S.leads.map(function (l) { return [l.name, l.phone, l.email, A.course(l.course).t, stageName(l.stage), l.sum, l.src, A.dshort(l.at), l.note]; }));
    if (kind === 'students') rows = [['Ученица', 'Курс', 'Пройдено уроков', 'Всего уроков']].concat([[A.S.me.name, A.course(A.S.me.course).t, dcount(), les().length]]).concat(A.S.others.map(function (o) { return [o.name, A.course(o.course).t, o.done, A.lessons(A.course(o.course)).length]; }));
    if (kind === 'bookings') rows = [['Дата', 'Время', 'Клиентка', 'Услуга', 'Сумма']].concat(A.S.bookings.map(function (b) { return [A.dshort(b.day), b.time, b.name, b.svc, b.price]; }));
    if (kind === 'pay') rows = [['Дата', 'Сумма']].concat(A.S.pay.map(function (p) { return [A.dshort(p.t), p.sum]; }));
    var text = '﻿' + rows.map(function (r) { return r.map(function (x) { x = String(x == null ? '' : x); return /[;"\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(';'); }).join('\r\n');
    var a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); a.download = kind + '-' + new Date().toISOString().slice(0, 10) + '.csv'; D.body.appendChild(a); a.click(); a.remove();
    A.toast('Файл скачан — откройте в Excel или Google Таблицах');
  }
})();
