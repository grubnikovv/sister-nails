/* Админ-панель в CRM: курсы (описание, цены, фото, программа, уроки, тесты, задания) и сайт (тексты, фото, контакты, услуги, портфолио) */
(function () {
  var A = window.A, D = document, E = A.esc, I = A.I, C = A.CMS;
  var TYPES = [['theory', 'Теория'], ['test', 'Тест'], ['practice', 'Задание']];
  function top(t, s, r) { return '<div class="atop"><div><h1>' + t + '</h1>' + (s ? '<p>' + s + '</p>' : '') + '</div>' + (r || '') + '</div>'; }
  function fld(label, html, hint) { return '<label class="afld"><span>' + label + '</span>' + html + (hint ? '<small>' + hint + '</small>' : '') + '</label>'; }
  function inp(f, v, ph, type) { return '<input class="inp" data-f="' + f + '" value="' + E(v == null ? '' : v) + '"' + (ph ? ' placeholder="' + E(ph) + '"' : '') + (type ? ' type="' + type + '" inputmode="numeric"' : '') + '>'; }
  function ta(f, v, ph, rows) { return '<textarea class="inp" data-f="' + f + '" rows="' + (rows || 3) + '"' + (ph ? ' placeholder="' + E(ph) + '"' : '') + '>' + E(v == null ? '' : v) + '</textarea>'; }
  function lines(a) { return (a || []).join('\n'); }
  function toLines(v) { return String(v).split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
  function slot(src, key, label) {
    return '<div class="aslot' + (src ? ' on' : '') + '">' + (src ? '<img src="' + src + '" alt="">' : '<span>' + (label || 'Добавить фото') + '</span>') +
      '<label class="aslot__up"><input type="file" accept="image/*" hidden data-up="' + key + '">' + (src ? 'Заменить' : '+ Фото') + '</label>' + (src ? '<button class="aslot__x" data-rm="' + key + '" aria-label="Убрать фото">×</button>' : '') + '</div>';
  }
  function upload(input, cb) { var f = input.files[0]; if (!f) return; A.compress(f, 1400, cb); }
  function save(quiet) { return A.cmsSave(quiet); }
  function rerender() { var y = scrollY; A.rerender(); requestAnimationFrame(function () { scrollTo(0, y); }); }

  /* ================= КУРСЫ ================= */
  A.adminCourses = function (arg) {
    var list = A.coursesEdit(), id = arg[1], c = id && list.filter(function (x) { return x.id === id; })[0];
    if (!c) return courseList(list);
    if (arg[2] === 'urok') return lessonEdit(c, arg[3]);
    return courseEdit(c, list);
  };

  function courseList(list) {
    var html = top('Курсы', 'Всё, что видят ученицы: описание, цены, фото, программа и уроки', '<button class="btn btn--sm" id="cadd">+ Новый курс</button>') +
      '<div class="alist">' + list.map(function (c, i) {
        var n = A.lessons(c).length, cv = A.cover(c, 480);
        return '<div class="arow"><div class="arow__img">' + (cv ? '<img src="' + cv + '" alt="">' : '<span>Нет фото</span>') + '</div>' +
          '<div class="arow__t"><b>' + E(c.t) + '</b><span>' + (c.f === 'online' ? 'Онлайн' : 'Офлайн') + ' · ' + A.rub(c.p) + ' · ' + A.plural(n, 'урок', 'урока', 'уроков') + '</span>' + (c.hid ? '<span class="tag">Скрыт</span>' : '<span class="tag ok">На сайте</span>') + '</div>' +
          '<div class="arow__a"><button class="ib" data-mv="' + i + ':-1" aria-label="Выше"' + (i ? '' : ' disabled') + '>↑</button><button class="ib" data-mv="' + i + ':1" aria-label="Ниже"' + (i < list.length - 1 ? '' : ' disabled') + '>↓</button><a class="btn btn--sm" href="#/crm/kursy/' + c.id + '">Изменить</a></div></div>';
      }).join('') + '</div>';
    return { html: html, mount: function (v) {
      v.querySelector('#cadd').onclick = function () {
        var nid = 'c' + Date.now().toString(36);
        list.push({ id: nid, t: 'Новый курс', f: 'online', lv: 'С нуля', p: 0, d: '', old: null, best: false, g: [], terms: [], facts: [], hid: true });
        C.prog[nid] = [{ t: 'Модуль 1', d: '', l: [{ t: 'Первый урок', m: 15, k: 'theory', d: '', pts: [], tc: [], ask: true }] }];
        window.PROGRAM = window.PROGRAM || {}; PROGRAM[nid] = C.prog[nid];
        save(true); A.toast('Курс создан — пока скрыт с сайта'); location.hash = '#/crm/kursy/' + nid;
      };
      v.addEventListener('click', function (e) { var b = e.target.closest('[data-mv]'); if (!b) return; var p = b.dataset.mv.split(':'), i = +p[0], j = i + +p[1]; var t = list[i]; list[i] = list[j]; list[j] = t; save(true); rerender(); });
    } };
  }

  function courseEdit(c, list) {
    var P = A.progEdit(c); if (A.S.ltype && A.S.ltype[c.id]) { delete A.S.ltype[c.id]; A.save(); }
    var g = A.gal(c.id), gl = 0; P.forEach(function (m) { gl += m.l.length; });
    var html = '<nav class="crumbs"><a href="#/crm/kursy">Курсы</a><span>' + E(c.t) + '</span></nav>' +
      top(E(c.t), (c.hid ? 'Черновик — на сайте не виден' : 'Опубликован на сайте') + ' · ' + A.plural(gl, 'урок', 'урока', 'уроков'),
        '<div class="atop__a"><a class="btn btn--sm btn--ghost" href="#/kurs/' + c.id + '" target="_blank">Открыть на сайте</a><button class="btn btn--sm" id="pub">' + (c.hid ? 'Опубликовать' : 'Скрыть с сайта') + '</button></div>') +
      '<div class="g2"><div class="stk2">' +
      '<section class="cardx"><h2>Основное</h2><div class="agrid">' +
        fld('Название курса', inp('t', c.t)) +
        fld('Формат', '<select class="inp" data-f="f"><option value="online"' + (c.f === 'online' ? ' selected' : '') + '>Онлайн — видеоуроки в кабинете</option><option value="offline"' + (c.f === 'offline' ? ' selected' : '') + '>Офлайн — лично с Алиной</option></select>') +
        fld('Уровень', inp('lv', c.lv, 'С нуля / Для мастеров')) +
        fld('Цена, ₽', inp('p', c.p, '20000', 'number')) +
        fld('Старая цена, ₽', inp('old', c.old || '', 'необязательно', 'number'), 'Покажется зачёркнутой') +
        fld('Метка «Выгодно»', '<span class="atog"><input type="checkbox" data-f="best"' + (c.best ? ' checked' : '') + '><i></i>Показывать на карточке</span>') +
      '</div>' +
        fld('Короткое описание', ta('d', c.d, 'Что даст курс — 1–2 предложения', 3)) +
        fld('Главные факты', ta('facts', lines(c.facts), 'Каждый с новой строки, например: 3 месяца доступа', 3), 'Первый факт виден на карточке курса') +
        fld('Условия', ta('terms', lines(c.terms), 'Каждое условие с новой строки', 4)) +
      '</section>' +
      '<section class="cardx"><h2>Программа</h2><p class="muted" style="margin:-6px 0 16px">Тип урока, длительность и можно ли задать вопрос куратору. Подробности урока — кнопка «Урок».</p>' +
        P.map(function (m, k) {
          return '<div class="amod"><div class="amod__h"><span class="cap2">Модуль ' + (k + 1) + '</span><div class="amod__a"><button class="ib" data-mm="' + k + ':-1"' + (k ? '' : ' disabled') + ' aria-label="Модуль выше">↑</button><button class="ib" data-mm="' + k + ':1"' + (k < P.length - 1 ? '' : ' disabled') + ' aria-label="Модуль ниже">↓</button><button class="ib" data-mdel="' + k + '" aria-label="Удалить модуль">×</button></div></div>' +
            inp('m' + k + '.t', m.t, 'Название модуля') + '<div style="height:8px"></div>' + inp('m' + k + '.d', m.d, 'Короткое описание модуля') +
            '<div class="alessons">' + m.l.map(function (l, j) {
              return '<div class="ales"><div class="ales__t"><span class="bld__n">' + (j + 1) + '</span>' + inp('l' + k + '-' + j + '.t', l.t, 'Название урока') + '</div>' +
                '<div class="ales__o"><div class="seg seg--sm" data-lk="' + k + '-' + j + '">' + TYPES.map(function (t) { return '<button aria-pressed="' + ((l.k || 'theory') === t[0]) + '" data-k="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
                '<label class="amin">' + inp('l' + k + '-' + j + '.m', l.m, 'мин', 'number') + '<span>мин</span></label>' +
                '<button class="achat' + (l.ask === false ? ' off' : '') + '" data-ask="' + k + '-' + j + '">' + (l.ask === false ? I.lock + 'Вопросы закрыты' : I.chat + 'Вопросы открыты') + '</button>' +
                '<span class="ales__a"><a class="btn btn--xs btn--ghost" href="#/crm/kursy/' + c.id + '/urok/' + k + '-' + j + '">Урок</a><button class="ib" data-lm="' + k + '-' + j + ':-1" aria-label="Выше">↑</button><button class="ib" data-lm="' + k + '-' + j + ':1" aria-label="Ниже">↓</button><button class="ib" data-ldel="' + k + '-' + j + '" aria-label="Удалить урок">×</button></span></div></div>';
            }).join('') + '</div><button class="lnk" data-ladd="' + k + '">+ Добавить урок</button></div>';
        }).join('') + '<button class="btn btn--sm btn--ghost" id="madd" style="margin-top:8px">+ Добавить модуль</button></section>' +
      '</div><div class="stk2 aside">' +
      '<section class="cardx"><h2>Обложка</h2><div class="aslots one">' + slot(C.cov[c.id] || A.cover(c), 'cov', 'Обложка курса') + '</div><p class="muted" style="margin-top:10px">Видна в каталоге и вверху страницы курса.</p></section>' +
      '<section class="cardx"><h2>Работы учениц</h2><div class="aslots">' + [0, 1, 2, 3, 4, 5].map(function (n) { return slot(g[n], 'g' + n); }).join('') + '</div><p class="muted" style="margin-top:10px">До 6 фото. Пустые места на сайте выглядят как аккуратные рамки «Фото появится здесь».</p></section>' +
      '<section class="cardx danger"><h2>Удаление</h2><p class="muted" style="margin-bottom:12px">Курс исчезнет с сайта. У купивших учениц доступ сохранится.</p><button class="btn btn--sm btn--ghost" id="cdel">Удалить курс</button></section>' +
      '</div></div>';
    return { html: html, mount: function (v) {
      v.addEventListener('change', function (e) {
        var el = e.target, f = el.dataset.f; if (!f) return;
        var val = el.type === 'checkbox' ? el.checked : el.value;
        var mm = f.match(/^m(\d+)\.(t|d)$/), ll = f.match(/^l(\d+)-(\d+)\.(t|m)$/);
        if (mm) P[+mm[1]][mm[2]] = val;
        else if (ll) P[+ll[1]].l[+ll[2]][ll[3]] = ll[3] === 'm' ? (+val || 0) : val;
        else if (f === 'p' || f === 'old') c[f] = val === '' ? null : +val;
        else if (f === 'facts' || f === 'terms') c[f] = toLines(val);
        else c[f] = val;
        save();
      });
      v.addEventListener('click', function (e) {
        var b;
        if ((b = e.target.closest('[data-lk] [data-k]'))) { var q = b.parentNode.dataset.lk.split('-'), L = P[+q[0]].l[+q[1]]; L.k = b.dataset.k;
          if (L.k === 'practice' && !L.hw) L.hw = { t: 'Выполните практику по теме урока и пришлите фото работы.', c: ['Фото до и после', 'Фото крупным планом при дневном свете'] };
          if (L.k === 'test' && !L.quiz) L.quiz = [{ q: 'Новый вопрос', a: ['Вариант 1', 'Вариант 2', 'Вариант 3'], ok: 0 }];
          save(); return rerender(); }
        if ((b = e.target.closest('[data-ask]'))) { var r = b.dataset.ask.split('-'), x = P[+r[0]].l[+r[1]]; x.ask = x.ask === false; save(true); A.toast(x.ask ? 'Вопросы куратору по уроку открыты' : 'Вопросы по уроку закрыты'); return rerender(); }
        if ((b = e.target.closest('[data-ladd]'))) { P[+b.dataset.ladd].l.push({ t: 'Новый урок', m: 15, k: 'theory', d: '', pts: [], tc: [], ask: true }); save(true); return rerender(); }
        if ((b = e.target.closest('[data-ldel]'))) { var w = b.dataset.ldel.split('-'); if (!confirm('Удалить урок «' + P[+w[0]].l[+w[1]].t + '»?')) return; P[+w[0]].l.splice(+w[1], 1); save(true); return rerender(); }
        if ((b = e.target.closest('[data-lm]'))) { var z = b.dataset.lm.split(':'), y = z[0].split('-'), arr = P[+y[0]].l, i = +y[1], j = i + +z[1]; if (j < 0 || j >= arr.length) return; var tt = arr[i]; arr[i] = arr[j]; arr[j] = tt; save(true); return rerender(); }
        if ((b = e.target.closest('[data-mm]'))) { var u = b.dataset.mm.split(':'), a1 = +u[0], a2 = a1 + +u[1]; var t2 = P[a1]; P[a1] = P[a2]; P[a2] = t2; save(true); return rerender(); }
        if ((b = e.target.closest('[data-mdel]'))) { var k2 = +b.dataset.mdel; if (!confirm('Удалить модуль «' + P[k2].t + '» вместе с уроками?')) return; P.splice(k2, 1); save(true); return rerender(); }
        if ((b = e.target.closest('[data-rm]'))) { var key = b.dataset.rm; if (key === 'cov') C.cov[c.id] = ''; else { var gg = C.gal[c.id] || []; gg.splice(+key.slice(1), 1); C.gal[c.id] = gg; } save(true); return rerender(); }
      });
      v.addEventListener('change', function (e) {
        var el = e.target, key = el.dataset.up; if (!key) return;
        upload(el, function (u) { if (key === 'cov') C.cov[c.id] = u; else { var gg = C.gal[c.id] = C.gal[c.id] || []; var n = +key.slice(1); if (n >= gg.length) gg.push(u); else gg[n] = u; } if (save(true)) { A.toast('Фото добавлено'); rerender(); } });
      });
      v.querySelector('#madd').onclick = function () { P.push({ t: 'Модуль ' + (P.length + 1), d: '', l: [{ t: 'Новый урок', m: 15, k: 'theory', d: '', pts: [], tc: [], ask: true }] }); save(true); rerender(); };
      v.querySelector('#pub').onclick = function () { c.hid = !c.hid; save(true); A.toast(c.hid ? 'Курс скрыт с сайта' : 'Курс опубликован'); rerender(); };
      v.querySelector('#cdel').onclick = function () { if (!confirm('Удалить курс «' + c.t + '»? Это действие нельзя отменить.')) return; list.splice(list.indexOf(c), 1); delete C.prog[c.id]; delete C.cov[c.id]; delete C.gal[c.id]; save(true); A.toast('Курс удалён'); location.hash = '#/crm/kursy'; };
    } };
  }

  function lessonEdit(c, pos) {
    var P = A.progEdit(c), q = String(pos || '0-0').split('-'), k = +q[0], j = +q[1], L = P[k] && P[k].l[j];
    if (!L) { location.hash = '#/crm/kursy/' + c.id; return { html: '', mount: function () {} }; }
    L.k = L.k || 'theory';
    var html = '<nav class="crumbs"><a href="#/crm/kursy">Курсы</a><a href="#/crm/kursy/' + c.id + '">' + E(c.t) + '</a><span>Модуль ' + (k + 1) + ' · Урок ' + (j + 1) + '</span></nav>' +
      top(E(L.t), E(P[k].t)) +
      '<div class="g2"><div class="stk2">' +
      '<section class="cardx"><h2>Урок</h2><div class="agrid">' + fld('Название', inp('t', L.t)) + fld('Длительность, мин', inp('m', L.m, '15', 'number')) + '</div>' +
        fld('Тип урока', '<div class="seg" data-type>' + TYPES.map(function (t) { return '<button aria-pressed="' + (L.k === t[0]) + '" data-k="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>', L.k === 'theory' ? 'Ученица смотрит урок и отмечает «изучен»' : L.k === 'test' ? 'Следующий урок откроется после 2/3 верных ответов' : 'Следующий урок откроется после вашей проверки') +
        fld('Вопросы куратору', '<span class="atog"><input type="checkbox" data-f="ask"' + (L.ask !== false ? ' checked' : '') + '><i></i>Ученица может написать вам по этому уроку</span>') +
        fld('Описание', ta('d', L.d, 'О чём урок, 1–3 предложения', 3)) +
        fld('«В этом уроке»', ta('pts', lines(L.pts), 'Каждый пункт с новой строки', 4)) +
        fld('Таймкоды', ta('tc', (L.tc || []).map(function (x) { return x[0] + ' ' + x[1]; }).join('\n'), '00:00 Вступление\n03:20 Обработка кутикулы', 4), 'Формат: время, пробел, название') +
        fld('Материалы (PDF)', ta('mat', lines(L.mat), 'Конспект урока\nЧек-лист', 3) + '<label class="btn btn--sm btn--ghost" style="justify-self:start;cursor:pointer"><input type="file" accept="application/pdf,.pdf,.doc,.docx,.ppt,.pptx,image/*" multiple hidden id="pdfup">+ Загрузить файлы</label>', 'Каждый файл — отдельной строкой; ученица скачивает их в уроке') +
      '</section>' +
      (L.k === 'practice' ? '<section class="cardx"><h2>Домашнее задание</h2>' + fld('Задание', ta('hw.t', (L.hw || {}).t, 'Что нужно сделать', 3)) + fld('Что прислать', ta('hw.c', lines((L.hw || {}).c), 'Каждый пункт с новой строки', 4)) + '</section>' : '') +
      (L.k === 'test' ? '<section class="cardx"><h2>Тест</h2><p class="muted" style="margin:-6px 0 14px">Отметьте кружком правильный ответ.</p>' + (L.quiz || []).map(function (x, n) {
        return '<div class="aq"><div class="aq__h"><span class="bld__n">' + (n + 1) + '</span>' + inp('q' + n, x.q, 'Вопрос') + '<button class="ib" data-qdel="' + n + '" aria-label="Удалить вопрос">×</button></div>' +
          x.a.map(function (a, m) { return '<label class="aq__a"><input type="radio" name="ok' + n + '" data-ok="' + n + '-' + m + '"' + (x.ok === m ? ' checked' : '') + '>' + inp('a' + n + '-' + m, a, 'Вариант ответа') + '</label>'; }).join('') + '</div>';
      }).join('') + '<button class="btn btn--sm btn--ghost" id="qadd">+ Вопрос</button></section>' : '') +
      '</div><div class="stk2 aside">' +
      '<section class="cardx"><h2>Видео</h2><label class="drop"><input type="file" accept="video/*" hidden id="vup"><span class="drop__ic">' + I.book + '</span><b>' + (L.vid ? 'Загружено: ' + E(L.vid) : 'Загрузить видео урока') + '</b><small>Любой формат: MP4, MOV, AVI, MKV, с телефона</small></label><p class="muted" style="margin-top:10px">Сервер сам перекодирует видео в качества 1080 / 720 / 480 — ученица выберет нужное в плеере. Видео защищено от скачивания и открывается только ученицам курса. В демо сохраняется название файла.</p></section>' +
      '<section class="cardx"><a class="btn btn--sm btn--ghost" href="#/crm/kursy/' + c.id + '">← К программе курса</a></section>' +
      '</div></div>';
    return { html: html, mount: function (v) {
      v.addEventListener('change', function (e) {
        var el = e.target, f = el.dataset.f, o;
        if (el.dataset.ok) { o = el.dataset.ok.split('-'); L.quiz[+o[0]].ok = +o[1]; return save(); }
        if (!f) return; var val = el.type === 'checkbox' ? el.checked : el.value;
        if (f === 'm') L.m = +val || 0;
        else if (f === 'pts' || f === 'mat') L[f] = toLines(val);
        else if (f === 'tc') L.tc = toLines(val).map(function (x) { var s = x.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*[—–-]?\s*(.*)$/); return s ? [s[1], s[2]] : ['', x]; });
        else if (f === 'hw.t') { L.hw = L.hw || { c: [] }; L.hw.t = val; }
        else if (f === 'hw.c') { L.hw = L.hw || { t: '' }; L.hw.c = toLines(val); }
        else if ((o = f.match(/^q(\d+)$/))) L.quiz[+o[1]].q = val;
        else if ((o = f.match(/^a(\d+)-(\d+)$/))) L.quiz[+o[1]].a[+o[2]] = val;
        else L[f] = val;
        save();
      });
      v.addEventListener('click', function (e) {
        var b;
        if ((b = e.target.closest('[data-type] [data-k]'))) { L.k = b.dataset.k; if (L.k === 'practice' && !L.hw) L.hw = { t: '', c: [] }; if (L.k === 'test' && !(L.quiz && L.quiz.length)) L.quiz = [{ q: '', a: ['', '', ''], ok: 0 }]; save(true); return rerender(); }
        if ((b = e.target.closest('[data-qdel]'))) { L.quiz.splice(+b.dataset.qdel, 1); save(true); return rerender(); }
      });
      var qa = v.querySelector('#qadd'); if (qa) qa.onclick = function () { L.quiz.push({ q: '', a: ['', '', ''], ok: 0 }); save(true); rerender(); };
      v.querySelector('#pdfup').onchange = function () { var names = [].map.call(this.files, function (f) { return f.name.replace(/\.[^.]+$/, ''); }); L.mat = (L.mat || []).concat(names); save(true); A.toast('Файлов добавлено: ' + names.length + ' (демо)'); rerender(); };
      v.querySelector('#vup').onchange = function () { var f = this.files[0]; if (!f) return; L.vid = f.name; save(true); A.toast('Видео выбрано (демо): ' + f.name); rerender(); };
    } };
  }

  /* ================= САЙТ ================= */
  A.adminSite = function () {
    var ct = C.ct = C.ct || {}, svc = A.SVC, works = A.works() || ['nails-wine', 'nails-nude', 'pedicure-blue', 'nails-black', 'nails-milk', 'alina'].map(function (n) { return A.img(n, 960); });
    var pages = [['#/', 'Главная'], ['#/akademiya', 'Академия'], ['#/studiya', 'Студия'], ['#/alina', 'Об Алине'], ['#/kontakty', 'Контакты'], ['#/dokumenty', 'Документы']];
    var html = top('Сайт', 'Тексты, фото, контакты, услуги и портфолио') +
      '<div class="g2"><div class="stk2">' +
      '<section class="cardx"><h2>Тексты и фото на страницах</h2><p class="muted" style="margin:-6px 0 16px">Откройте страницу, нажмите на любой заголовок или абзац и печатайте. На фото появится кнопка «Заменить фото».</p><div class="apages">' +
        pages.map(function (p) { return '<button class="sso__b" data-edit="' + p[0] + '">' + I.edit + p[1] + '</button>'; }).join('') + '</div></section>' +
      '<section class="cardx"><h2>Услуги и цены студии</h2><div class="asvc">' + svc.map(function (s, i) {
        return '<div class="asvc__r">' + inp('s' + i + '.0', s[0], 'Услуга') + '<div class="asvc__o">' + inp('s' + i + '.1', s[1], 'Время') + '<select class="inp" data-f="s' + i + '.4"><option value=""' + (!s[4] ? ' selected' : '') + '>—</option><option value="от "' + (s[4] === 'от ' ? ' selected' : '') + '>от</option><option value="+"' + (s[4] === '+' ? ' selected' : '') + '>+</option></select>' + inp('s' + i + '.2', s[2], 'Цена', 'number') + '<button class="ib" data-sdel="' + i + '" aria-label="Удалить услугу">×</button></div></div>';
      }).join('') + '</div><button class="lnk" id="sadd" style="margin-top:12px">+ Добавить услугу</button></section>' +
      '<section class="cardx"><h2>Портфолио «Работы Алины»</h2><div class="aslots">' + works.map(function (u, i) { return slot(u, 'w' + i); }).join('') + slot('', 'w' + works.length, 'Добавить работу') + '</div><p class="muted" style="margin-top:10px">Бегущая лента на главной, в студии и на странице «Об Алине».</p></section>' +
      '</div><div class="stk2 aside">' +
      '<section class="cardx"><h2>Контакты</h2>' +
        fld('Телефон', '<input class="inp" data-c="phone" value="' + E(A.ct('phone')) + '">') + fld('Telegram', '<input class="inp" data-c="tg" value="' + E(A.ct('tg')) + '">', 'Имя пользователя без @') +
        fld('WhatsApp', '<input class="inp" data-c="wa" value="' + E(A.ct('wa')) + '">', 'Номер цифрами: 79991234567') + fld('Почта', '<input class="inp" data-c="email" value="' + E(A.ct('email')) + '">') +
        fld('Адрес студии', '<input class="inp" data-c="addr" value="' + E(A.ct('addr')) + '">') + fld('Часы работы', '<input class="inp" data-c="hours" value="' + E(A.ct('hours')) + '">') +
        fld('Ссылка на запись в DIKIDI', '<input class="inp" data-c="dikidi" value="' + E(A.ct('dikidi')) + '">', 'Все кнопки «Записаться» ведут сюда') +
      '</section>' +
      '<section class="cardx danger"><h2>Вернуть как было</h2><p class="muted" style="margin-bottom:12px">Сбросит все правки сайта и курсов в этом браузере.</p><button class="btn btn--sm btn--ghost" id="creset">Сбросить правки</button></section>' +
      '</div></div>';
    return { html: html, mount: function (v) {
      v.addEventListener('click', function (e) {
        var b;
        if ((b = e.target.closest('[data-edit]'))) return A.startEdit(b.dataset.edit);
        if ((b = e.target.closest('[data-sdel]'))) { svc.splice(+b.dataset.sdel, 1); C.svc = svc; save(true); return rerender(); }
        if ((b = e.target.closest('[data-rm]'))) { works.splice(+b.dataset.rm.slice(1), 1); C.works = works; save(true); return rerender(); }
      });
      v.addEventListener('change', function (e) {
        var el = e.target, o;
        if (el.dataset.c) { ct[el.dataset.c] = el.value.trim(); A.applyCt(); return save(); }
        if (el.dataset.up) return upload(el, function (u) { var n = +el.dataset.up.slice(1); if (n >= works.length) works.push(u); else works[n] = u; C.works = works; if (save(true)) { A.toast('Фото добавлено'); rerender(); } });
        if ((o = (el.dataset.f || '').match(/^s(\d+)\.(\d)$/))) { var s = svc[+o[1]]; s[+o[2]] = o[2] === '2' ? (+el.value || 0) : el.value; C.svc = svc; save(); }
      });
      v.querySelector('#sadd').onclick = function () { svc.push(['Новая услуга', '1 ч', 0, '#E5B7C8']); C.svc = svc; save(true); rerender(); };
      v.querySelector('#creset').onclick = function () { if (!confirm('Сбросить все правки сайта и курсов?')) return; try { localStorage.removeItem('as-cms'); } catch (er) {} location.reload(); };
    } };
  };
})();
