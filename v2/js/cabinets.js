/* Кабинет ученицы и CRM куратора */
(function () {
  var A = window.A, E = A.esc, D = document, I = A.I, S = function () { return A.S; };

  var TH = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>';
  function shell(kind, tabs, cur, body) {
    var side = '<aside class="side"><a class="logo" href="#/" style="padding:0;background:none" aria-label="На сайт">' + A.LOGO + '</a>' +
      tabs.map(function (t) { return '<a href="#/' + kind + (t[0] ? '/' + t[0] : '') + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + I[t[2]] + t[1] + (t[3] ? '<span class="cnt">' + t[3] + '</span>' : '') + '</a>'; }).join('') +
      '<button class="sthm thm" data-theme-toggle>' + TH + '<span class="t-l">Тёмная тема</span><span class="t-d">Светлая тема</span></button>' +
      '<a href="#/" class="sout">' + I.out + 'Выйти</a>' +
      '<div class="who"><span class="av">' + (kind === 'crm' ? 'АГ' : 'АС') + '</span><span>' + (kind === 'crm' ? 'Алина Грубникова<br><small style="opacity:.6">куратор</small>' : E(S().me.name) + '<br><small style="opacity:.6">ученица</small>') + '</span></div></aside>';
    var bar = '<nav class="tabbar">' + tabs.slice(0, 5).map(function (t) { return '<a href="#/' + kind + (t[0] ? '/' + t[0] : '') + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + I[t[2]] + '<span>' + t[1].split(' ')[0] + '</span>' + (t[3] ? '<span class="cnt">' + t[3] + '</span>' : '') + '</a>'; }).join('') + '</nav>';
    return '<div class="shell">' + side + '<main class="main"><div class="abar"><a class="logo" href="#/" aria-label="На главную">' + A.LOGO + '</a><div class="abar__r"><button class="ib thm" data-theme-toggle aria-label="Сменить тему">' + TH + '</button><a class="ib" href="#/" aria-label="Выйти" title="Выйти">' + I.out + '</a></div></div>' + body + '</main></div>' + bar;
  }
  function top(title, sub, right) { return '<div class="atop"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (right || '') + '</div>'; }
  function photos(a) { return a && a.length ? '<div class="photos">' + a.map(function (s) { return '<img src="' + s + '" alt="Фото работы">'; }).join('') + '</div>' : ''; }

  /* ============ КАБИНЕТ УЧЕНИЦЫ ============ */
  function myCourse() { return A.course(S().me.course); }
  function les() { return A.lessons(myCourse()); }
  function done(i) { var p = S().prog[i], l = les()[i]; if (!p) return false; return l.k === 'practice' ? p.st === 'ok' : l.k === 'test' ? p.st === 'passed' : (p.st === 'done' || p.st === 'ok' || p.st === 'passed'); }
  function kind(l) { var k = A.KIND[l.k]; return '<span class="' + k[1] + ' kd">' + k[0] + '</span>'; }
  function open(i) { return i === 0 || done(i - 1); }
  function cur() { var L = les(); for (var i = 0; i < L.length; i++) if (!done(i)) return i; return L.length - 1; }
  function dcount() { var c = 0; les().forEach(function (_, i) { if (done(i)) c++; }); return c; }
  function unreadS() { return S().chat.filter(function (m) { return m.f === 'c' && m.at > (S().seen.s || 0); }).length; }
  function status(i) { var p = S().prog[i] || {}; if (done(i)) return '<span class="tag ok">Пройден</span>'; if (!open(i)) return ''; if (p.st === 'sent') return '<span class="tag wait">На проверке</span>'; if (p.st === 'back') return '<span class="tag bad">На доработку</span>'; var k = les()[i].k; return '<span class="tag pink">' + (k === 'practice' ? 'Ждёт задание' : k === 'test' ? 'Пройдите тест' : 'Открыт') + '</span>'; }
  function file(m) { return '<button class="file" onclick="A.toast(\'Файл появится, когда Алина загрузит материалы\')"><span class="file__ic">PDF</span><span class="file__t"><b>' + E(m[0]) + '</b><small>' + E(m[1]) + '</small></span><span class="file__d">' + A.I.dl + '</span></button>'; }
  function ktabs(cur) { return [['', 'Главная', 'home'], ['kurs', 'Мой курс', 'book'], ['chat', 'Куратор', 'chat', unreadS()]]; }

  A.route('/kabinet', function (arg) {
    A.onScroll = null;
    var sub = arg[0] || '', c = myCourse(), L = les(), body = '';
    if (sub === '') {
      var pc = Math.round(dcount() / L.length * 100), ci = cur(), sentN = Object.keys(S().prog).filter(function (k) { return S().prog[k].st === 'sent'; }).length;
      body = top('Здравствуйте, <em>' + E(S().me.name.split(' ')[0]) + '</em>', 'Ваше обучение — в одном месте') +
        '<div class="g3" style="margin-bottom:16px"><div class="kpi"><b>' + pc + '%</b><span>курса пройдено</span></div><div class="kpi"><b>' + dcount() + '/' + L.length + '</b><span>уроков</span></div><div class="kpi"><b>' + sentN + '</b><span>заданий на проверке</span></div><div class="kpi"><b>' + (75 - 8) + '</b><span>дней доступа осталось</span></div></div>' +
        '<div class="g2"><div class="stk2"><div class="cardx" style="background:var(--navy);color:#F4EEF2"><div style="display:flex;gap:18px;align-items:center"><div class="ring" style="--p:' + pc + '"><b style="color:var(--ink)">' + pc + '%</b></div><div><span class="tag pink">Онлайн-курс</span><h2 style="margin:10px 0 0;color:#fff">' + E(c.t) + '</h2></div></div>' +
          '<div style="margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)"><span style="font-size:13px;opacity:.65">Следующий урок</span><div style="font:500 26px/1.15 var(--serif);margin:6px 0 16px">' + (ci + 1) + '. ' + E(L[ci].t) + '</div><a class="btn btn--pink" href="#/kabinet/urok/' + ci + '">Продолжить <span class="ar">→</span></a></div></div>' +
          '<div class="cardx"><h2>Последние события</h2>' + [S().prog[2] && S().prog[2].st === 'sent' ? ['wait', 'Задание к уроку 3 отправлено на проверку'] : null, ['ok', 'Урок 2 пройден'], ['pink', 'Алина ответила в чате']].filter(Boolean).map(function (r) { return '<div class="row2"><span class="tag ' + r[0] + '">●</span><div class="m"><b style="font-weight:400">' + r[1] + '</b></div></div>'; }).join('') + '</div></div>' +
        '<div class="stk2"><div class="cardx"><h2>Быстрый вход</h2><p class="muted" style="margin-bottom:12px">Привяжите аккаунт, чтобы входить в одно касание. Вход по почте ' + E(S().me.email || 'anna@mail.ru') + ' остаётся.</p><div class="sso">' +
          [['vk', 'VK ID'], ['ya', 'Яндекс ID']].map(function (x) { var on = (S().sso || {})[x[0]]; return '<button class="sso__b ' + x[0] + (on ? ' on' : '') + '" data-sso="' + x[0] + '">' + (on ? '✓ ' + x[1] + ' привязан' : 'Привязать ' + x[1]) + '</button>'; }).join('') + '</div></div>' +
          '<div class="cardx"><h2>Куратор</h2><div class="row2"><span class="av">АГ</span><div class="m"><b>Алина Грубникова</b><span>отвечает в течение дня</span></div></div><a class="btn btn--sm" href="#/kabinet/chat" style="margin-top:10px">Написать</a></div>' +
        '<div class="cardx"><h2>Ещё курсы</h2>' + ['mater', 'visual'].map(function (id) { var x = A.course(id); return '<a class="row2" href="#/kurs/' + id + '"><img src="' + A.img(A.COVER[id], 480) + '" style="width:56px;height:56px;border-radius:12px;object-fit:cover"><div class="m"><b>' + E(x.t) + '</b><span>' + A.rub(x.p) + '</span></div><span>→</span></a>'; }).join('') + '</div></div></div>';
    } else if (sub === 'kurs') {
      var M = A.modules(c), pc = Math.round(dcount() / L.length * 100), ci = cur(), nx = L[ci];
      body = '<div class="chero"><div class="chero__t"><span class="tag pink">Онлайн-курс · ' + A.plural(M.length, 'модуль', 'модуля', 'модулей') + ' · ' + A.plural(L.length, 'урок', 'урока', 'уроков') + '</span><h1>' + E(c.t) + '</h1>' +
        '<div class="chero__p"><div class="bar"><i style="width:' + pc + '%"></i></div><span>' + dcount() + ' из ' + L.length + ' уроков · ' + pc + '%</span></div>' +
        '<div class="chero__n"><small>Следующий урок</small><b>' + (ci + 1) + '. ' + E(nx.t) + '</b></div><a class="btn btn--pink" href="#/kabinet/urok/' + ci + '">Продолжить <span class="ar">→</span></a></div>' +
        '<img class="chero__img" src="' + A.img(A.COVER[c.id]) + '" alt=""></div>' +
        '<div class="g2"><div class="stk2">' + M.map(function (md, k) {
          var idx = L.map(function (l, i) { return i; }).filter(function (i) { return L[i].mod === k; }), dn = idx.filter(done).length, lock = !open(idx[0]);
          return '<section class="cardx mod' + (lock ? ' is-lock' : '') + '"><div class="mod__h"><div><span class="cap2">Модуль ' + (k + 1) + '</span><h2>' + E(md.t) + '</h2><p class="muted">' + E(md.d) + '</p></div><span class="mod__c' + (dn === idx.length ? ' ok' : '') + '">' + dn + '/' + idx.length + '</span></div><div class="les">' +
            idx.map(function (i) { var l = L[i], o = open(i); return '<button ' + (o ? 'onclick="location.hash=\'#/kabinet/urok/' + i + '\'"' : 'disabled') + (i === ci ? ' aria-current="true"' : '') + '><span class="n' + (done(i) ? ' ok' : '') + '">' + (done(i) ? '✓' : i + 1) + '</span><span class="t"><b>' + E(l.t) + '</b><small>' + kind(l) + l.m + ' мин</small></span>' + (o ? status(i) : '<span class="lk">' + I.lock + '</span>') + '</button>'; }).join('') + '</div></section>';
        }).join('') + '</div>' +
        '<div class="stk2 aside"><div class="cardx"><h2>Как проходит обучение</h2><ol class="how"><li><b>Смотрите урок</b><span>Видео, конспект и материалы — в любое время</span></li><li><b>Выполняете задание</b><span>Фото работы и пара слов о том, что получилось</span></li><li><b>Алина проверяет</b><span>Обычно в течение дня, с комментарием</span></li><li><b>Открывается следующий урок</b><span>Уведомление придёт в Telegram</span></li></ol></div>' +
        '<div class="cardx cur"><img src="' + A.img('alina', 480) + '" alt="Алина Грубникова"><div><small class="muted">Ваш куратор</small><b>Алина Грубникова</b><a class="btn btn--sm" href="#/kabinet/chat">Задать вопрос</a></div></div>' +
        '<div class="cardx"><h2>Сертификат</h2><div class="cert"><span class="cert__ic">' + I.cert + '</span><div><b>' + (pc === 100 ? 'Сертификат готов' : 'Откроется после итоговой работы') + '</b><span class="muted">Именной, с печатью академии</span></div></div><div class="bar" style="margin-top:14px"><i style="width:' + pc + '%"></i></div></div>' +
        '<div class="cardx"><h2>Материалы курса</h2>' + [['Конспект курса', 'PDF · 4,8 МБ'], ['Список расходников', 'PDF · 320 КБ'], ['Чек-лист стерилизации', 'PDF · 210 КБ']].map(file).join('') + '</div></div></div>';
    } else if (sub === 'urok') {
      var i = Math.min(+arg[1] || 0, L.length - 1), l = L[i], p = S().prog[i] || {}, M2 = A.modules(c);
      if (!open(i)) { location.hash = '#/kabinet/kurs'; return ''; }
      var st = p.st === 'ok' ? 3 : p.st === 'sent' ? 2 : 1, nxt = i + 1 < L.length ? L[i + 1] : null;
      body = '<nav class="crumbs"><a href="#/kabinet/kurs">' + E(c.t) + '</a><span>Модуль ' + (l.mod + 1) + ' · Урок ' + (i + 1) + ' из ' + L.length + '</span></nav>' +
        '<div class="lgrid"><div class="stk2">' +
        '<div class="player" id="pl"><div class="player__bg"></div><span class="player__chip">Урок ' + (i + 1) + '</span><button class="player__play" id="plb" aria-label="Смотреть урок"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></button><div class="player__msg">Здесь будет видео урока<br><small>Алина загрузит его в кабинет</small></div>' +
        '<div class="player__ctl"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg><span>00:00 / ' + l.m + ':00</span><div class="player__bar"><i></i></div><span>1×</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></div></div>' +
        '<div class="lhead"><h1>' + E(l.t) + '</h1><div class="lhead__m">' + status(i) + '<span class="muted">' + l.m + ' мин</span><span class="muted">' + E(l.mt) + '</span></div></div>' +
        '<div class="cardx"><h2>Об уроке</h2><p class="ltxt">' + E(l.d) + '</p><h3 class="sub3">В этом уроке</h3><ul class="pts">' + l.pts.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="g2b"><div class="cardx"><h2>Таймкоды</h2><div class="tcs">' + l.tc.map(function (x) { return '<button data-tc="' + x[0] + '"><span>' + x[0] + '</span>' + E(x[1]) + '</button>'; }).join('') + '</div></div>' +
        '<div class="cardx"><h2>Материалы</h2>' + (window.MATS || []).map(file).join('') + '</div></div>';
      if (l.k === 'test') {
        var res = p.st === 'passed' ? p : null;
        body += '<div class="cardx hw" id="hw"><div class="hw__h"><h2>Тест по уроку</h2>' + kind(l) + '</div><p class="ltxt">' + l.quiz.length + ' вопроса · проверяется сразу. Чтобы открыть следующий урок, ответьте верно хотя бы на ' + Math.ceil(l.quiz.length * 2 / 3) + '.</p>' +
          '<form id="qz" class="qz">' + l.quiz.map(function (q, qi) { return '<fieldset><legend><span>' + (qi + 1) + '</span>' + E(q.q) + '</legend>' + q.a.map(function (a, ai) { return '<label><input type="radio" name="q' + qi + '" value="' + ai + '"' + (res && ai === q.ok ? ' checked' : '') + '><span>' + E(a) + '</span></label>'; }).join('') + '</fieldset>'; }).join('') +
          (res ? '<div class="cmt"><div><b>Тест пройден: ' + res.score + ' из ' + l.quiz.length + '</b>Можно перепройти для закрепления.</div></div>' : '') +
          '<button class="btn btn--wide">' + (res ? 'Пройти ещё раз' : 'Проверить ответы') + '</button></form></div>';
      } else if (l.k === 'practice') {
        body += '<div class="cardx hw" id="hw"><div class="hw__h"><h2>Домашнее задание</h2><ol class="steps">' + ['Отправить', 'Проверка', 'Принято'].map(function (x, k) { return '<li class="' + (k + 1 < st ? 'ok' : k + 1 === st ? 'on' : '') + '"><i>' + (k + 1 < st || st === 3 ? '✓' : k + 1) + '</i>' + x + '</li>'; }).join('') + '</ol></div>' +
          '<p class="ltxt">' + E(l.hw.t) + '</p><h3 class="sub3">Что прислать</h3><ul class="crit">' + l.hw.c.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul>' +
          (p.comment ? '<div class="cmt ' + (p.st === 'back' ? 'bad' : '') + '"><img src="' + A.img('alina', 480) + '" alt=""><div><b>' + (p.st === 'back' ? 'Алина вернула на доработку' : 'Комментарий Алины') + '</b>' + E(p.comment) + '</div></div>' : '');
        if (p.st === 'sent' || p.st === 'ok') body += '<div class="ans"><b>Ваш ответ</b><span class="muted"> · ' + A.ago(p.at) + '</span>' + (p.text ? '<p>' + E(p.text) + '</p>' : '') + photos(p.photos) + '</div>' + (p.st === 'sent' ? '<p class="note">Алина проверит работу и напишет комментарий. Следующий урок откроется сразу после проверки — придёт уведомление.</p>' : '');
        else body += '<label class="drop"><input type="file" id="hwF" accept="image/*" multiple hidden><span class="drop__ic">' + I.cam + '</span><b>Добавить фото работы</b><small>до 4 фото · JPG или PNG</small></label><div class="photos" id="hwP"></div><div class="fld"><textarea class="inp" id="hwT" placeholder="Опишите, что получилось и что вызвало сложности">' + E(p.st === 'back' ? p.text : '') + '</textarea></div><button class="btn btn--wide" id="hwS">Отправить на проверку</button>';
        body += '</div>';
      } else body += '<div class="cardx hw"><div class="hw__h"><h2>Теоретический урок</h2>' + kind(l) + '</div><p class="ltxt">Посмотрите видео и прочитайте конспект. Когда всё понятно — отметьте урок, и сразу откроется следующий.</p>' + (done(i) ? '<span class="tag ok">Урок изучен</span>' : '<button class="btn btn--wide" id="lesD">Урок изучен</button>') + '</div>';
      body += '<div class="lnav">' + (i > 0 ? '<a class="lnav__a" href="#/kabinet/urok/' + (i - 1) + '"><small>←\u00a0Предыдущий</small><b>' + E(L[i - 1].t) + '</b></a>' : '<span></span>') +
        (nxt ? (open(i + 1) ? '<a class="lnav__a r" href="#/kabinet/urok/' + (i + 1) + '"><small>Следующий\u00a0→</small><b>' + E(nxt.t) + '</b></a>' : '<span class="lnav__a r off"><small>' + I.lock + ' Следующий</small><b>Откроется после ' + (l.k === 'practice' ? 'проверки задания' : l.k === 'test' ? 'теста' : 'изучения урока') + '</b></span>') : '<a class="lnav__a r" href="#/kabinet/kurs"><small>Финиш\u00a0→</small><b>Сертификат об окончании</b></a>') + '</div>' +
        '<div class="ask"><div><b>Остался вопрос по уроку?</b><span>Алина ответит в чате, уведомление придёт в Telegram</span></div><a class="btn btn--sm btn--ghost" href="#/kabinet/chat">Написать куратору</a></div></div>' +
        '<aside class="lside"><div class="cardx"><div class="lside__p"><div class="ring" style="--p:' + Math.round(dcount() / L.length * 100) + '"><b>' + Math.round(dcount() / L.length * 100) + '%</b></div><div><b>' + E(c.t) + '</b><span class="muted">' + dcount() + ' из ' + L.length + ' уроков</span></div></div>' +
        M2.map(function (md, k) { return '<details class="lside__m"' + (k === l.mod ? ' open' : '') + '><summary><span>Модуль ' + (k + 1) + '</span>' + E(md.t) + '</summary>' + L.map(function (x, j) { if (x.mod !== k) return ''; var o = open(j); return '<a ' + (o ? 'href="#/kabinet/urok/' + j + '"' : 'aria-disabled="true"') + (j === i ? ' aria-current="page"' : '') + '><i class="' + (done(j) ? 'ok' : '') + '">' + (done(j) ? '✓' : o ? j + 1 : '') + (o || done(j) ? '' : I.lock) + '</i>' + E(x.t) + '</a>'; }).join('') + '</details>'; }).join('') + '</div></aside></div>';
      return { html: shell('kabinet', ktabs(), 'kurs', body), mount: function (v) {
        var tmp = [];
        var pb = v.querySelector('#plb'); pb.onclick = function () { v.querySelector('#pl').classList.add('is-on'); A.toast('Здесь будет видео урока — защищённое от скачивания'); };
        v.querySelectorAll('[data-tc]').forEach(function (b) { b.onclick = function () { v.querySelector('#pl').scrollIntoView({ behavior: 'smooth', block: 'center' }); A.toast('Видео перемотается на ' + b.dataset.tc); }; });
        var f = v.querySelector('#hwF'); if (f) f.onchange = function () { [].slice.call(f.files, 0, 4 - tmp.length).forEach(function (file) { A.compress(file, 1280, function (u) { tmp.push(u); v.querySelector('#hwP').innerHTML = tmp.map(function (s) { return '<img src="' + s + '" alt="">'; }).join(''); }); }); };
        var s = v.querySelector('#hwS'); if (s) s.onclick = function () { var t = v.querySelector('#hwT').value.trim(); if (!t && !tmp.length) { A.toast('Добавьте фото или напишите ответ'); return; } S().prog[i] = { st: 'sent', text: t, photos: tmp, at: Date.now() }; A.save(); A.toast('Отправлено Алине на проверку'); A.rerender(); };
        var qz = v.querySelector('#qz'); if (qz) qz.onsubmit = function (e) { e.preventDefault(); var miss = 0, sc = 0;
          l.quiz.forEach(function (q, qi) { var ch = qz.querySelector('input[name=q' + qi + ']:checked'); var fs = qz.querySelectorAll('fieldset')[qi]; fs.classList.remove('ok', 'bad'); if (!ch) { miss++; return; } var ok = +ch.value === q.ok; if (ok) sc++; fs.classList.add(ok ? 'ok' : 'bad'); });
          if (miss) { A.toast('Ответьте на все вопросы'); return; }
          if (sc >= Math.ceil(l.quiz.length * 2 / 3)) { S().prog[i] = { st: 'passed', score: sc, at: Date.now() }; A.save(); A.toast('Тест пройден: ' + sc + ' из ' + l.quiz.length + ' — следующий урок открыт'); setTimeout(A.rerender, 900); }
          else A.toast('Верно ' + sc + ' из ' + l.quiz.length + ' — пересмотрите урок и попробуйте ещё раз'); };
        var d = v.querySelector('#lesD'); if (d) d.onclick = function () { S().prog[i] = { st: 'done', at: Date.now() }; A.save(); A.toast('Урок изучен — следующий открыт'); A.rerender(); };
      } };
    } else if (sub === 'chat') {
      S().seen.s = Date.now(); A.save(); body = chat('s');
      return { html: shell('kabinet', ktabs(), 'chat', body), mount: chatMount('s') };
    }
    return shell('kabinet', ktabs(), sub, body);
  });

  /* ---------- чат (общий) ---------- */
  function chat(me) {
    return top(me === 's' ? 'Куратор' : 'Сообщения', me === 's' ? 'Алина отвечает в течение дня' : 'Переписка с ученицами') + '<div class="g2"><div class="cardx chat"><div class="row2" style="padding-top:0"><span class="av">' + (me === 's' ? 'АГ' : 'АС') + '</span><div class="m"><b>' + (me === 's' ? 'Алина Грубникова' : E(S().me.name)) + '</b><span>' + (me === 's' ? 'куратор курса' : 'Маникюр с нуля · урок ' + (cur() + 1)) + '</span></div></div><div class="chat__l" id="cl">' +
      S().chat.map(function (m) { var P = m.p || []; return '<div class="msg ' + (m.f === me ? 'out' : 'in') + (P.length ? ' has-p' : '') + '">' + (P.length ? '<div class="msg__p n' + Math.min(P.length, 4) + '">' + P.slice(0, 4).map(function (u) { return '<img src="' + u + '" alt="Фото" loading="lazy">'; }).join('') + '</div>' : '') + (m.t ? '<span class="msg__t">' + E(m.t) + '</span>' : '') + '<small>' + A.ago(m.at) + '</small></div>'; }).join('') + '</div><div class="chat__pv" id="cpv"></div><form class="chat__f" id="cf"><label class="ib chat__att" aria-label="Прикрепить фото"><input type="file" id="cfile" accept="image/*" multiple hidden>' + I.cam + '</label><input class="inp" id="ci" placeholder="Сообщение…" autocomplete="off"><button class="btn btn--sm chat__s" aria-label="Отправить"><span>Отправить</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button></form></div>' +
      '<div class="cardx"><h2>' + (me === 's' ? 'Подсказка' : 'Диалоги') + '</h2>' + (me === 's' ? '<p class="muted">Уведомление об ответе придёт в Telegram или на почту.</p>' : [S().me.name].concat(S().others.map(function (o) { return o.name; })).map(function (n, i) { return '<div class="row2"><span class="av" style="width:34px;height:34px;font-size:12px">' + n.split(' ').map(function (x) { return x[0]; }).join('') + '</span><div class="m"><b>' + E(n) + '</b><span>' + (i ? 'нет новых' : 'активный диалог') + '</span></div></div>'; }).join('')) + '</div></div>';
  }
  function chatMount(me) { return function (v) { var l = v.querySelector('#cl'); l.scrollTop = l.scrollHeight; var att = [], pv = v.querySelector('#cpv'); function drawPv() { pv.innerHTML = att.map(function (u, i) { return '<span><img src="' + u + '" alt=""><button type="button" data-rm="' + i + '" aria-label="Убрать фото">×</button></span>'; }).join(''); }
      pv.onclick = function (e) { var b = e.target.closest('[data-rm]'); if (b) { att.splice(+b.dataset.rm, 1); drawPv(); } };
      v.querySelector('#cfile').onchange = function () { [].slice.call(this.files, 0, 4 - att.length).forEach(function (f) { A.compress(f, 1280, function (u) { att.push(u); drawPv(); }); }); this.value = ''; };
      v.querySelector('#cf').onsubmit = function (e) { e.preventDefault(); var t = v.querySelector('#ci').value.trim(); if (!t && !att.length) return; S().chat.push({ f: me, t: t, p: att.slice(), at: Date.now() }); S().seen[me] = Date.now(); A.save(); A.rerender(); }; }; }

  /* ============ CRM КУРАТОРА ============ */
  var STAGES = [['new', 'Новая заявка', '#8A90A0'], ['contact', 'Связались', '#E2A33B'], ['pay', 'Ждёт оплату', '#C8006A'], ['study', 'Учится', '#3B6FE2'], ['done', 'Завершила', '#1E8A55'], ['lost', 'Отказ', '#B3123A']];
  function stageName(s) { return (STAGES.filter(function (x) { return x[0] === s; })[0] || [0, s])[1]; }
  function queue() { var q = []; var L = les(); Object.keys(S().prog).forEach(function (k) { if (S().prog[k].st === 'sent') q.push({ me: 1, i: +k, l: L[k], p: S().prog[k] }); }); S().others.forEach(function (o) { if (o.hw) q.push({ o: o, p: o.hw }); }); return q; }
  function unreadC() { return S().chat.filter(function (m) { return m.f === 's' && m.at > (S().seen.c || 0); }).length; }
  function ctabs() { return [['', 'Воронка', 'funnel', S().leads.filter(function (l) { return l.stage === 'new'; }).length], ['dz', 'Задания', 'hw', queue().length], ['uchenitsy', 'Ученицы', 'users'], ['kursy', 'Курсы', 'book'], ['chat', 'Сообщения', 'chat', unreadC()], ['analitika', 'Аналитика', 'chart'], ['eksport', 'Выгрузка', 'dl']]; }

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
    } else if (sub === 'kursy') {
      var cid = arg[1] || 'mani', cc = A.course(cid) || A.course('mani'), CL = A.lessons(cc), MM = A.modules(cc);
      var cnt = { theory: 0, test: 0, practice: 0 }; CL.forEach(function (x) { cnt[x.k]++; });
      body = top('Курсы', 'Структура курса и тип каждого урока') +
        '<div class="cardx" style="margin-bottom:16px"><div class="seg seg--wrap" id="csel">' + COURSES.filter(function (x) { return x.f === 'online'; }).map(function (x) { return '<button aria-pressed="' + (x.id === cc.id) + '" data-c="' + x.id + '">' + E(x.t) + '</button>'; }).join('') + '</div></div>' +
        '<div class="g2"><div class="stk2">' + MM.map(function (md, k) { return '<section class="cardx"><span class="cap2">Модуль ' + (k + 1) + '</span><h2 style="margin-top:6px">' + E(md.t) + '</h2><div class="bld">' +
          CL.map(function (x, i) { if (x.mod !== k) return ''; return '<div class="bld__r"><span class="bld__n">' + (i + 1) + '</span><div class="bld__t"><b>' + E(x.t) + '</b><small>' + x.m + '\u00a0мин' + (x.k === 'test' ? ' · ' + x.quiz.length + ' вопроса' : '') + '</small></div><div class="seg seg--sm" data-i="' + i + '">' + [['theory', 'Теория'], ['test', 'Тест'], ['practice', 'Задание']].map(function (t) { return '<button aria-pressed="' + (x.k === t[0]) + '" data-k="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div></div>'; }).join('') +
          '</div><button class="lnk" style="margin-top:14px" onclick="A.toast(\'Добавление уроков и загрузка видео появятся на сервере\')">+ Добавить урок</button></section>'; }).join('') + '</div>' +
        '<div class="stk2"><div class="cardx"><h2>Итого в курсе</h2><div class="row2"><span class="tag">Теория</span><div class="m"><b>' + cnt.theory + '</b><span>посмотреть и отметить</span></div></div><div class="row2"><span class="tag test">Тест</span><div class="m"><b>' + cnt.test + '</b><span>проверяется автоматически</span></div></div><div class="row2"><span class="tag pink">Задание</span><div class="m"><b>' + cnt.practice + '</b><span>проверяете вы в «Заданиях»</span></div></div></div>' +
        '<div class="cardx"><h2>Как это работает</h2><ul class="pts"><li>Теория — ученица смотрит урок и нажимает «Урок изучен»</li><li>Тест — 3 вопроса, открывает следующий урок при 2 верных ответах</li><li>Задание — фото работы, следующий урок откроется после вашей проверки</li></ul></div></div></div>';
      return { html: shell('crm', ctabs(), 'kursy', body), mount: function (v) {
        v.querySelector('#csel').onclick = function (e) { var b = e.target.closest('[data-c]'); if (b) location.hash = '#/crm/kursy/' + b.dataset.c; };
        v.addEventListener('click', function (e) { var b = e.target.closest('.seg--sm [data-k]'); if (!b) return; var i = +b.parentNode.dataset.i; S().ltype = S().ltype || {}; S().ltype[cc.id] = S().ltype[cc.id] || {}; S().ltype[cc.id][i] = b.dataset.k; A.save(); A.toast('Урок ' + (i + 1) + ': ' + b.textContent.toLowerCase() + ' — у учениц уже обновилось'); A.rerender(); });
      } };
    } else if (sub === 'uchenitsy') {
      var list = [{ name: S().me.name, course: S().me.course, done: dcount(), all: les().length, last: Date.now() - 36e5, hw: queue().filter(function (x) { return x.me; }).length }].concat(S().others.map(function (o) { return { name: o.name, course: o.course, done: o.done, all: A.lessons(A.course(o.course)).length, last: o.last, hw: o.hw ? 1 : 0 }; }));
      body = top('Ученицы', list.length + ' активных · прогресс и задания') + '<div class="cardx"><div class="tblw"><table class="tbl"><thead><tr><th>Ученица</th><th>Курс</th><th>Прогресс</th><th>Задания</th><th>Была</th></tr></thead><tbody>' + list.map(function (s) { var pc = Math.round(s.done / s.all * 100); return '<tr><td><b style="font-weight:500">' + E(s.name) + '</b></td><td>' + E(A.course(s.course).t) + '</td><td style="min-width:140px"><div class="bar"><i style="width:' + pc + '%"></i></div><small class="muted">' + s.done + '/' + s.all + '</small></td><td>' + (s.hw ? '<span class="tag wait">' + s.hw + ' на проверке</span>' : (pc === 100 ? '<span class="tag ok">Завершила</span>' : '<span class="tag">—</span>')) + '</td><td class="muted">' + A.ago(s.last) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    } else if (sub === 'chat') {
      S().seen.c = Date.now(); A.save();
      return { html: shell('crm', ctabs(), 'chat', chat('c')), mount: chatMount('c') };
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
        [['leads', 'Заявки и клиентки', 'имя, телефон, курс, этап, сумма, источник'], ['students', 'Ученицы и прогресс', 'курс, пройдено уроков, задания'], ['pay', 'Оплаты', 'дата и сумма']].map(function (x) { return '<div class="row2"><span class="tag">CSV</span><div class="m"><b>' + x[1] + '</b><span>' + x[2] + '</span></div><button class="btn btn--xs" data-csv="' + x[0] + '">Скачать</button></div>'; }).join('') + '</div>' +
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
    if (kind === 'pay') rows = [['Дата', 'Сумма']].concat(A.S.pay.map(function (p) { return [A.dshort(p.t), p.sum]; }));
    var text = '﻿' + rows.map(function (r) { return r.map(function (x) { x = String(x == null ? '' : x); return /[;"\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(';'); }).join('\r\n');
    var a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); a.download = kind + '-' + new Date().toISOString().slice(0, 10) + '.csv'; D.body.appendChild(a); a.click(); a.remove();
    A.toast('Файл скачан — откройте в Excel или Google Таблицах');
  }
  // привязка VK ID / Яндекс ID (демо; на сервере — OAuth)
  D.addEventListener('click', function (e) { var b = e.target.closest('[data-sso]'); if (!b) return; var k = b.dataset.sso; S().sso = S().sso || {}; S().sso[k] = !S().sso[k]; A.save(); A.toast(S().sso[k] ? (k === 'vk' ? 'VK ID' : 'Яндекс ID') + ' привязан (демо)' : 'Привязка отключена'); A.rerender(); });
})();
