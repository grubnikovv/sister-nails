/* Админка: всё, что Алина меняет на сайте сама (курсы, программа, цены, тексты, фото, контакты).
   В демо хранится в этом браузере (ключ as-cms); на сервере — в базе через API. */
(function () {
  var A = window.A, D = document, E = A.esc, KEY = 'as-cms';
  var C; try { C = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { C = {}; }
  C.t = C.t || {}; C.p = C.p || {}; C.cov = C.cov || {}; C.gal = C.gal || {}; C.prog = C.prog || {};
  A.CMS = C;
  A.cmsSave = function (quiet) {
    try { localStorage.setItem(KEY, JSON.stringify(C)); if (!quiet) A.toast('Сохранено'); return true; }
    catch (e) { A.toast('Не хватило места в браузере для фото. На сервере ограничения не будет'); return false; }
  };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ---------- курсы ---------- */
  if (C.courses) window.COURSES = C.courses;
  Object.keys(C.prog).forEach(function (id) { window.PROGRAM = window.PROGRAM || {}; PROGRAM[id] = C.prog[id]; });
  A.pub = function () { return COURSES.filter(function (c) { return !c.hid; }); };
  A.cover = function (c, w) { if (!c) return ''; if (C.cov[c.id]) return C.cov[c.id]; return A.COVER[c.id] ? A.img(A.COVER[c.id], w || 960) : ''; };
  A.gal = function (id) { return C.gal[id] || []; };
  A.coursesEdit = function () { if (!C.courses) C.courses = clone(COURSES); window.COURSES = C.courses; return C.courses; };
  A.progEdit = function (c) {
    if (!C.prog[c.id]) {
      var L = A.lessons(c), mods = A.modules(c);
      C.prog[c.id] = mods.map(function (md, k) { return { t: md.t, d: md.d || '', l: L.filter(function (x) { return x.mod === k; }).map(function (x) {
        var o = { t: x.t, m: x.m, k: x.k, d: x.d, pts: x.pts, tc: x.tc, ask: x.ask !== false };
        if (x.hw) o.hw = x.hw; if (x.quiz) o.quiz = x.quiz; if (x.mat) o.mat = x.mat; return o; }) }; });
      window.PROGRAM = window.PROGRAM || {}; PROGRAM[c.id] = C.prog[c.id];
    }
    return C.prog[c.id];
  };

  /* ---------- контакты и услуги ---------- */
  var CT = { phone: '+7 936 287-22-01', tg: 'alina_sergeevna28', wa: '79362872201', email: 'academy.nail@mail.ru', addr: 'Москва, адрес уточняется', hours: 'ежедневно 10:00–21:00', dikidi: 'https://dikidi.net/' };
  A.ct = function (k) { return (C.ct && C.ct[k] != null && C.ct[k] !== '') ? C.ct[k] : CT[k]; };
  A.DIKIDI = A.ct('dikidi');
  A.applyCt = function () {
    D.querySelectorAll('[data-ct]').forEach(function (a) { var k = a.dataset.ct;
      if (k === 'tg') a.href = 'https://t.me/' + A.ct('tg').replace(/^@/, '');
      if (k === 'wa') { a.href = 'https://wa.me/' + A.ct('wa').replace(/\D/g, ''); a.textContent = 'WhatsApp · ' + A.ct('phone'); }
      if (k === 'email') { a.href = 'mailto:' + A.ct('email'); a.textContent = A.ct('email'); } });
    A.DIKIDI = A.ct('dikidi');
  };
  A.works = function () { return C.works || null; };

  /* ---------- правка текстов и фото прямо на страницах ---------- */
  var SKIP = /^\/(kurs|kabinet|crm|vhod)$/;
  var SEL = 'h1,h2,h3,p,.cap,.hero__tag,.stats4 b,.stats4 span,.pills span,.foot__big,.kf b,.kf span';
  function keyBase(m) { return m.base === '/dokumenty' ? m.full : m.base; }
  A.editing = function () { try { return sessionStorage.getItem('as-edit') === '1'; } catch (e) { return false; } };
  A.cmsApply = function (view, m) {
    if (SKIP.test(m.base)) return;
    var kb = keyBase(m), list = [].slice.call(view.querySelectorAll(SEL)).filter(function (el) { return !el.closest('.cc,.svc,form,[data-noedit],.dcard__a') && !el.querySelector('h1,h2,h3,p'); });
    list.forEach(function (el, i) {
      var k = kb + '|' + i, o = C.t[k];
      el.dataset.ek = k; if (!el.dataset.eo) el.dataset.eo = el.innerHTML;
      if (o && o.o === el.innerHTML) { el.innerHTML = o.v; el.removeAttribute('data-n'); }
    });
    [].slice.call(view.querySelectorAll('.ph img')).filter(function (im) { return !im.closest('.cc,.marq'); }).forEach(function (im, i) {
      var k = kb + '|img' + i; im.dataset.pk = k; var v = C.p[k];
      if (v) { im.src = v; im.removeAttribute('srcset'); im.dataset.full = v; }
    });
    if (A.editing()) editOn(view);
  };
  function editOn(view) {
    D.body.classList.add('cms-edit');
    view.querySelectorAll('[data-ek]').forEach(function (el) {
      el.contentEditable = 'true'; el.spellcheck = true;
      el.onblur = function () { var k = el.dataset.ek, nz = function (h) { return h.replace(/&nbsp;|\u00a0|\u2060/g, ' ').replace(/\s+/g, ' ').trim(); }; if (nz(el.innerHTML) === nz(el.dataset.eo)) delete C.t[k]; else C.t[k] = { o: el.dataset.eo, v: el.innerHTML }; A.cmsSave(true); };
      el.onkeydown = function (e) { if (e.key === 'Enter' && !/^P$/.test(el.tagName)) { e.preventDefault(); el.blur(); } };
    });
    view.querySelectorAll('[data-pk]').forEach(function (im) {
      var ph = im.closest('.ph'); if (!ph || ph.querySelector('.cms-pic')) return;
      var b = D.createElement('label'); b.className = 'cms-pic'; b.innerHTML = '<input type="file" accept="image/*" hidden>📷 Заменить фото';
      b.querySelector('input').onchange = function () { var f = this.files[0]; if (!f) return; A.compress(f, 1400, function (u) { C.p[im.dataset.pk] = u; if (A.cmsSave(true)) { im.src = u; im.removeAttribute('srcset'); A.toast('Фото заменено'); } }); };
      ph.appendChild(b);
    });
    if (!D.getElementById('cmsbar')) {
      var bar = D.createElement('div'); bar.id = 'cmsbar'; bar.className = 'cmsbar';
      bar.innerHTML = '<span><b>Режим правки</b> Нажмите на любой текст и измените его. Фото — кнопкой на фото.</span><button class="btn btn--sm btn--pink" id="cmsdone">Готово</button>';
      D.body.appendChild(bar);
      bar.querySelector('#cmsdone').onclick = function () { try { sessionStorage.removeItem('as-edit'); } catch (e) {} bar.remove(); D.body.classList.remove('cms-edit'); A.toast('Изменения сохранены'); location.hash = '#/crm/sayt'; };
    }
  }
  A.startEdit = function (to) { try { sessionStorage.setItem('as-edit', '1'); } catch (e) {} location.hash = to || '#/'; };
})();
