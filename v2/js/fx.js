/* Живые анимации: капли лака, прогресс, наклоны, магнитные кнопки, курсор, брызги при успехах. Только transform/opacity. */
(function () {
  var A = window.A, D = document, W = window;
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = W.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var LAK = ['#D21C7C', '#E8489B', '#FFBEED', '#B0005C'];

  /* ---------- брызги лака (успех) ---------- */
  A.burst = function (x, y, n) {
    if (RM) return;
    if (x == null) { x = innerWidth / 2; y = innerHeight / 2; }
    var box = D.createElement('div'); box.className = 'fx-burst'; box.style.left = x + 'px'; box.style.top = y + 'px';
    n = n || 18;
    for (var i = 0; i < n; i++) {
      var p = D.createElement('i'), a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 120, s = .5 + Math.random() * .9;
      p.style.setProperty('--x', Math.cos(a) * r + 'px'); p.style.setProperty('--y', Math.sin(a) * r - 40 + 'px');
      p.style.setProperty('--r', (Math.random() * 360) + 'deg'); p.style.setProperty('--s', s);
      p.style.background = LAK[i % LAK.length]; p.style.animationDelay = (Math.random() * 80) + 'ms';
      box.appendChild(p);
    }
    D.body.appendChild(box); setTimeout(function () { box.remove(); }, 1400);
  };
  A.burstAt = function (el) { if (!el) return A.burst(); var r = el.getBoundingClientRect(); A.burst(r.left + r.width / 2, r.top + r.height / 2); };

  if (RM) return;

  /* ---------- капля лака в точке касания ---------- */
  D.addEventListener('click', function (e) {
    if (e.button > 0 || !e.clientX && !e.clientY || e.target.closest('input,textarea,select,.lb,.kanban .lcd')) return;
    var d = D.createElement('div'); d.className = 'fx-drop'; d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px';
    for (var i = 0; i < 5; i++) { var s = D.createElement('i'), a = (i / 5) * Math.PI * 2 + Math.random(); s.style.setProperty('--x', Math.cos(a) * 26 + 'px'); s.style.setProperty('--y', Math.sin(a) * 26 + 'px'); d.appendChild(s); }
    D.body.appendChild(d); setTimeout(function () { d.remove(); }, 700);
  });

  /* ---------- прогресс прокрутки + наклон бегущих лент от скорости ---------- */
  var bar = D.createElement('div'); bar.className = 'fx-progress'; D.body.appendChild(bar);
  var lastY = scrollY, vel = 0, tick = false;
  function frame() {
    tick = false;
    var h = D.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
    var dy = scrollY - lastY; lastY = scrollY; vel = vel * .8 + dy * .2;
    var sk = Math.max(-8, Math.min(8, vel * .35));
    D.documentElement.style.setProperty('--sk', sk.toFixed(2) + 'deg');
    if (Math.abs(vel) > .1) { tick = true; requestAnimationFrame(frame); } else D.documentElement.style.setProperty('--sk', '0deg');
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });

  /* ---------- смена темы — круговое раскрытие от кнопки ---------- */
  var tog = A.toggleTheme;
  A.toggleTheme = function (e) {
    var ev = W.event, x = ev && ev.clientX != null ? ev.clientX : innerWidth - 40, y = ev && ev.clientY != null ? ev.clientY : 40;
    if (!D.startViewTransition) return tog();
    D.documentElement.style.setProperty('--vx', x + 'px'); D.documentElement.style.setProperty('--vy', y + 'px');
    D.documentElement.classList.add('vt-theme');
    var t = D.startViewTransition(function () { var R = D.documentElement; R.dataset.theme = R.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('as-theme', R.dataset.theme); } catch (er) {} var m = D.querySelector('meta[name=theme-color]'); if (m) m.content = R.dataset.theme === 'dark' ? '#1E1D1F' : '#F0E9DF'; });
    t.finished.then(function () { D.documentElement.classList.remove('vt-theme'); });
  };

  if (!FINE) return;

  /* ---------- ПК: курсор-капля ---------- */
  var cur = D.createElement('div'); cur.className = 'fx-cur'; cur.innerHTML = '<i></i><b></b>'; D.body.appendChild(cur);
  var cx = -100, cy = -100, rx = -100, ry = -100;
  addEventListener('pointermove', function (e) { cx = e.clientX; cy = e.clientY; cur.classList.toggle('hot', !!e.target.closest('a,button,label,[data-zoom],.ph img,.lcd,summary')); }, { passive: true });
  addEventListener('pointerdown', function () { cur.classList.add('down'); }); addEventListener('pointerup', function () { cur.classList.remove('down'); });
  D.addEventListener('mouseleave', function () { cur.style.opacity = 0; }); D.addEventListener('mouseenter', function () { cur.style.opacity = 1; });
  (function loop() { rx += (cx - rx) * .2; ry += (cy - ry) * .2; cur.firstChild.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; cur.lastChild.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); })();

  /* ---------- ПК: магнитные кнопки и 3D-наклон карточек ---------- */
  D.addEventListener('pointermove', function (e) {
    var b = e.target.closest('.btn:not(.btn--wide)');
    if (b) { var r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + 'px'; b._m = 1; }
    var c = e.target.closest('.cc,.lcard,.dcard,.svc button,.kpi');
    if (c) { var q = c.getBoundingClientRect(), px = (e.clientX - q.left) / q.width - .5, py = (e.clientY - q.top) / q.height - .5; c.style.transform = 'perspective(900px) rotateY(' + (px * 6).toFixed(2) + 'deg) rotateX(' + (-py * 6).toFixed(2) + 'deg) translateY(-4px)'; c.style.setProperty('--gx', (px + .5) * 100 + '%'); c.style.setProperty('--gy', (py + .5) * 100 + '%'); c.classList.add('fx-tilt'); }
  }, { passive: true });
  D.addEventListener('pointerout', function (e) {
    var b = e.target.closest('.btn'); if (b && !b.contains(e.relatedTarget)) b.style.translate = '';
    var c = e.target.closest('.cc,.lcard,.dcard,.svc button,.kpi'); if (c && !c.contains(e.relatedTarget)) { c.style.transform = ''; c.classList.remove('fx-tilt'); }
  }, { passive: true });
})();
