<?php
// Общая база сайта: все записи, график, сертификаты, обучение и уведомления кабинета.
// Хранится одним JSON-документом в SQLite (как раньше в памяти телефона), у документа есть номер версии.
// Кабинет мастера (по паролю) видит и меняет всё; посетители видят только занятость без имён и телефонов.
require_once __DIR__ . '/bot.php';

const LIST_KEYS = ['bookings', 'training', 'certs', 'notes', 'modelBase'];

function store_init() {
    $db = db();
    $db->exec('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)');
    $db->exec('CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, created INTEGER)');
    return $db;
}

// Прочитать документ (с блокировкой записи, если собираемся менять)
function doc_load($forWrite = false) {
    $db = store_init();
    if ($forWrite) $db->exec('BEGIN IMMEDIATE');
    $q = $db->query("SELECT v FROM kv WHERE k = 'doc'"); $raw = $q->fetchColumn();
    $doc = $raw ? json_decode($raw, true) : [];
    if (!is_array($doc)) $doc = [];
    $q = $db->query("SELECT v FROM kv WHERE k = 'doc_v'"); $v = (int)$q->fetchColumn();
    foreach (LIST_KEYS as $k) if (!isset($doc[$k]) || !is_array($doc[$k])) $doc[$k] = [];
    return [$doc, $v];
}

function doc_save($doc, $v) {
    $db = db(); $v++;
    $db->prepare("INSERT OR REPLACE INTO kv (k, v) VALUES ('doc', ?)")->execute([json_encode($doc, JSON_UNESCAPED_UNICODE)]);
    $db->prepare("INSERT OR REPLACE INTO kv (k, v) VALUES ('doc_v', ?)")->execute([(string)$v]);
    $db->exec('COMMIT');
    return $v;
}

function doc_abort() { try { db()->exec('ROLLBACK'); } catch (Throwable $e) {} }

function now_ms() { return (int)round(microtime(true) * 1000); }
function rid($p) { return $p . base_convert((string)now_ms(), 10, 36) . substr(bin2hex(random_bytes(3)), 0, 4); }

// Уведомление в колокольчик кабинета (храним 2 недели, не больше 200)
function doc_note(&$doc, $icon, $title, $text, $go = null) {
    array_unshift($doc['notes'], ['id' => rid('n'), 't' => now_ms(), 'icon' => $icon, 'title' => $title, 'text' => $text, 'go' => $go, 'read' => false]);
    $lim = now_ms() - 14 * 86400 * 1000;
    $doc['notes'] = array_slice(array_values(array_filter($doc['notes'], fn($n) => ($n['t'] ?? 0) > $lim)), 0, 200);
}

// Брони ждут, пока Марина подтвердит оплату: сертификат — 2 часа, обучение — 1 час (клиент связывается с Мариной и переводит по СБП).
// Не подтвердила вовремя — бронь удаляется сама (у обучения освобождаются даты), Марине и клиенту приходит сообщение.
function doc_expire(&$doc) {
    $now = now_ms(); $changed = false;
    $keep = [];
    foreach ($doc['certs'] as $c) {
        if (($c['status'] ?? '') !== 'wait' || ($c['hold'] ?? PHP_INT_MAX) >= $now) { $keep[] = $c; continue; }
        $changed = true;
        $txt = '№ ' . ($c['code'] ?? '') . ' на ' . number_format((int)($c['sum'] ?? 0), 0, ',', ' ') . ' ₽ · ' . ($c['name'] ?? '') . ', ' . ($c['phone'] ?? '');
        doc_note($doc, '⌛', 'Бронь сертификата удалена — оплата не подтверждена за 2 часа', $txt . '. Если деньги всё же пришли — оформите сертификат вручную.', ['tab' => 'req']);
        if ($a = acc_of($c)) cnote($a, '⌛', 'Бронь сертификата удалена', '№ ' . ($c['code'] ?? '') . ': оплату не подтвердили за 2 часа. Если вы оплатили — напишите Марине, она оформит сертификат вручную.', '#sertifikat');
        if (!empty($c['email'])) send_mail($c['email'], 'Бронь сертификата № ' . ($c['code'] ?? '') . ' удалена', "Бронь подарочного сертификата <b>№ " . h($c['code'] ?? '') . "</b> на " . number_format((int)($c['sum'] ?? 0), 0, ',', ' ') . " ₽ удалена: за 2 часа оплата не была подтверждена.\n\nЕсли вы уже оплатили — просто напишите Марине: " . site_phone() . ", она оформит сертификат вручную.\nНе оплачивали — ничего делать не нужно. Оформить новый: <a href=\"" . h(rtrim((string)cfg('site_url'), '/') . '/#sertifikat') . "\">" . h(rtrim((string)cfg('site_url'), '/') . '/#sertifikat') . "</a>");
    }
    $doc['certs'] = $keep;
    $keep = [];
    foreach ($doc['training'] as $x) {
        if (($x['status'] ?? '') !== 'wait' || ($x['hold'] ?? PHP_INT_MAX) >= $now) { $keep[] = $x; continue; }
        $changed = true;
        $txt = ($x['name'] ?? '') . ', ' . ($x['phone'] ?? '') . ': предоплата не подтверждена за 1 час — даты снова свободны. Если деньги пришли — свяжитесь с ученицей и оформите бронь заново.';
        doc_note($doc, '⌛', 'Бронь обучения удалена', $txt, ['tab' => 'req']);
        notify_admins('⌛ <b>Бронь обучения удалена</b>' . "\n" . h($txt));
        if ($a = acc_of($x)) cnote($a, '⌛', 'Бронь обучения удалена', 'Предоплату не подтвердили за 1 час, даты освободились. Если вы оплатили — напишите Марине.', '#obuchenie');
    }
    $doc['training'] = $keep;
    return $changed;
}

// Что видит посетитель сайта: занятость без имён, телефонов и денег
function doc_public($doc) {
    $out = $doc;
    $out['bookings'] = array_values(array_map(fn($b) => array_intersect_key($b, array_flip(['id', 'date', 'start', 'svc', 'remove', 'french', 'adds', 'status', 'dur', 'example'])), $doc['bookings']));
    $out['training'] = array_values(array_map(fn($t) => array_intersect_key($t, array_flip(['id', 'course', 'date', 'days', 'status', 'hold', 'claimed', 'example'])), $doc['training']));
    $models = [];
    foreach (($doc['models'] ?? []) as $k => $m) $models[$k] = is_array($m) ? array_intersect_key($m, array_flip(['time'])) + (!empty($m['name']) ? ['taken' => true] : []) : $m;
    $out['models'] = (object)$models;
    unset($out['certs'], $out['notes'], $out['modelBase'], $out['deleted']);
    foreach (['blocks', 'dayoff', 'hours', 'modelTimes', 'workday', 'bought'] as $k) if (isset($out[$k])) $out[$k] = (object)$out[$k];
    return $out;
}

function doc_full($doc) {
    foreach (['models', 'blocks', 'dayoff', 'hours', 'modelTimes', 'workday', 'bought', 'deleted'] as $k) $doc[$k] = (object)($doc[$k] ?? []);
    return $doc;
}

// Изменения из кабинета: [{p:[ключ], v:значение} | {p:[ключ, id], v:запись} | {p:[...], d:1}]
function doc_apply(&$doc, $ops) {
    foreach ($ops as $op) {
        $p = $op['p'] ?? null; if (!is_array($p) || !$p || count($p) > 2) continue;
        $k = (string)$p[0]; if ($k === '' || $k === 'sent' || strlen($k) > 40) continue;
        $del = !empty($op['d']); $val = $op['v'] ?? null;
        if (count($p) === 1) { if ($del) unset($doc[$k]); else $doc[$k] = $val; continue; }
        $id = (string)$p[1];
        if (in_array($k, LIST_KEYS, true)) {
            if (!is_array($doc[$k])) $doc[$k] = [];
            $found = false;
            foreach ($doc[$k] as $i => $r) if (($r['id'] ?? null) === $id) {
                $found = true;
                if ($del) array_splice($doc[$k], $i, 1); else $doc[$k][$i] = $val;
                break;
            }
            if (!$found && !$del && is_array($val)) { if ($k === 'notes') array_unshift($doc[$k], $val); else $doc[$k][] = $val; }
        } else {
            if (!isset($doc[$k]) || !is_array($doc[$k])) $doc[$k] = [];
            if ($del) unset($doc[$k][$id]); else $doc[$k][$id] = $val;
        }
    }
}

// ---------- вход мастера ----------
function session_ok($token) {
    if (!is_string($token) || strlen($token) < 32) return false;
    $q = store_init()->prepare('SELECT created FROM sessions WHERE token = ?'); $q->execute([hash('sha256', $token)]);
    $c = $q->fetchColumn();
    return $c && $c > time() - 180 * 86400;  // вход держится полгода
}

function session_new() {
    $t = bin2hex(random_bytes(24));
    store_init()->prepare('INSERT INTO sessions (token, created) VALUES (?, ?)')->execute([hash('sha256', $t), time()]);
    return $t;
}

// ---------- проверки для посетителей ----------
function overlaps($a1, $a2, $b1, $b2) { return $a1 < $b2 && $b1 < $a2; }

function day_taken_by_training($doc, $date) {
    foreach ($doc['training'] as $t) {
        $active = ($t['status'] ?? '') === 'paid' || (($t['status'] ?? '') === 'wait' && ($t['hold'] ?? 0) > now_ms());
        if ($active && in_array($date, $t['days'] ?? [$t['date'] ?? ''], true)) return true;
    }
    return false;
}

// Те же правила, что на сайте: часы работы, выходные, обед, закрытые окна, обучение, другие записи
const OPEN_M = 600, CLOSE_M = 1140, STEP_M = 30, LUNCH_M = [720, 750];
function is_workday($doc, $date) {
    if (!empty($doc['dayoff'][$date])) return false;
    $wd = (int)date('w', strtotime($date . ' 12:00'));
    return ($wd === 0 || $wd === 6) ? !empty($doc['workday'][$date]) : true;
}
function day_free_for_training($doc, $date) {
    if (!is_workday($doc, $date) || day_taken_by_training($doc, $date) || !empty($doc['blocks'][$date])) return false;
    foreach ($doc['bookings'] as $b) if (($b['date'] ?? '') === $date && ($b['status'] ?? '') !== 'cancelled') return false;
    return true;
}
function slot_free($doc, $date, $start, $dur, $exceptId = '') {
    if (!is_workday($doc, $date) || day_taken_by_training($doc, $date)) return false;
    $h = $doc['hours'][$date] ?? [OPEN_M, CLOSE_M];
    if ($start < (int)$h[0] || $start + $dur > (int)$h[1] || ($start - OPEN_M) % STEP_M) return false;
    if (overlaps($start, $start + $dur, LUNCH_M[0], LUNCH_M[1])) return false;
    foreach (($doc['blocks'][$date] ?? []) as $m => $why) if (overlaps($start, $start + $dur, (int)$m, (int)$m + STEP_M)) return false;
    if ($date === date('Y-m-d') && $start < (int)date('G') * 60 + (int)date('i') + 60) return false;
    foreach ($doc['bookings'] as $b) {
        if (($b['id'] ?? '') === $exceptId || ($b['status'] ?? '') === 'cancelled' || ($b['date'] ?? '') !== $date) continue;
        if (overlaps($start, $start + $dur, (int)$b['start'], (int)$b['start'] + (int)($b['dur'] ?? 60))) return false;
    }
    return true;
}

function digits_phone($p) { $d = preg_replace('/\D/', '', (string)$p); $d = preg_replace('/^8/', '7', $d); if (strlen($d) === 10 && $d[0] === '9') $d = '7' . $d; return $d; }

// Изменения записей из кабинета (перенос, отмена, удаление) — в таблицу бота, чтобы напоминания шли на правильное время
function mirror_bookings($ops, $doc) {
    $db = db();
    foreach ($ops as $op) {
        $p = $op['p'] ?? [];
        if ($p === ['bookings']) {  // весь список заменён (например, очистка тестовых данных) — убрать лишние записи и у бота
            $ids = array_map(fn($b) => (string)($b['id'] ?? ''), is_array($op['v'] ?? null) ? $op['v'] : []);
            foreach ($db->query('SELECT id FROM bookings')->fetchAll(PDO::FETCH_COLUMN) as $id) if (!in_array($id, $ids, true)) $db->prepare('DELETE FROM bookings WHERE id = ?')->execute([$id]);
            continue;
        }
        if (($p[0] ?? '') !== 'bookings' || count($p) !== 2) continue;
        $id = (string)$p[1];
        $q = $db->prepare('SELECT date, start FROM bookings WHERE id = ?'); $q->execute([$id]); $old = $q->fetch();
        if (!$old) continue;
        $b = null; foreach ($doc['bookings'] as $x) if (($x['id'] ?? '') === $id) $b = $x;
        if (!$b || !empty($op['d'])) { $db->prepare('UPDATE bookings SET status = "cancelled", updated = ? WHERE id = ?')->execute([time(), $id]); continue; }
        $status = in_array($b['status'] ?? '', ['cancelled', 'noshow'], true) ? $b['status'] : 'booked';
        $moved = $old['date'] !== ($b['date'] ?? '') || (int)$old['start'] !== (int)($b['start'] ?? 0);
        $db->prepare('UPDATE bookings SET date = ?, start = ?, dur = ?, status = ?, updated = ?' . ($moved ? ', sent_2d = 0, sent_2h = 0, confirmed = 0' : '') . ' WHERE id = ?')
           ->execute([$b['date'], (int)$b['start'], (int)($b['dur'] ?? 60), $status, time(), $id]);
        // мастер поменяла услугу или добавки — в напоминаниях будет новое название
        if (!empty($b['svcName'])) $db->prepare('UPDATE bookings SET svc = ? WHERE id = ?')->execute([mb_substr((string)$b['svcName'], 0, 80), $id]);
    }
}

// ---------- пароль кабинета ----------
// Пароль из config.php — начальный. После смены в кабинете хранится только его хэш в базе.
function kv_get($k) { $q = store_init()->prepare('SELECT v FROM kv WHERE k = ?'); $q->execute([$k]); return $q->fetchColumn(); }
function kv_put($k, $v) { store_init()->prepare('INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)')->execute([$k, (string)$v]); }
function kv_del($k) { store_init()->prepare('DELETE FROM kv WHERE k = ?')->execute([$k]); }

function pass_ok($pass) {
    $h = kv_get('pass_hash');
    if ($h) return password_verify((string)$pass, $h);
    $c = (string)cfg('cabinet_pass');
    return strlen($c) >= 6 && hash_equals($c, (string)$pass);
}
function pass_set($pass) { kv_put('pass_hash', password_hash((string)$pass, PASSWORD_DEFAULT)); }
function pass_weak($p) { return mb_strlen((string)$p) < 6 ? 'Пароль — не короче 6 символов.' : (mb_strlen((string)$p) > 64 ? 'Слишком длинный пароль.' : ''); }

// ---------- кабинет клиентки: вход по телефону и коду из Telegram или почты ----------
function client_db() {
    $db = store_init();
    $db->exec('CREATE TABLE IF NOT EXISTS client_sessions (token TEXT PRIMARY KEY, phone TEXT, created INTEGER)');
    $db->exec('CREATE TABLE IF NOT EXISTS client_codes (phone TEXT PRIMARY KEY, hash TEXT, until INTEGER, tries INTEGER, sent INTEGER)');
    // личные кабинеты клиенток по почте и паролю; телефон — только подтверждённый кодом
    $db->exec('CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, name TEXT, pass TEXT, phone TEXT DEFAULT "", verified INTEGER DEFAULT 0, created INTEGER)');
    $db->exec('CREATE TABLE IF NOT EXISTS acc_codes (email TEXT, purpose TEXT, hash TEXT, until INTEGER, tries INTEGER, sent INTEGER, PRIMARY KEY (email, purpose))');
    try { $db->exec('ALTER TABLE client_sessions ADD COLUMN acc INTEGER'); } catch (Throwable $e) {}
    // уведомления клиенткам: acc = 0 — рассылка всем; seen — когда клиентка последний раз открывала колокольчик; news — согласие на письма с новостями
    $db->exec('CREATE TABLE IF NOT EXISTS cnotes (id INTEGER PRIMARY KEY AUTOINCREMENT, acc INTEGER, icon TEXT, title TEXT, text TEXT, link TEXT, t INTEGER)');
    $db->exec('CREATE TABLE IF NOT EXISTS link_reqs (id INTEGER PRIMARY KEY AUTOINCREMENT, acc INTEGER, phone TEXT, t INTEGER)');
    foreach (['seen INTEGER DEFAULT 0', 'news INTEGER DEFAULT 0', 'av TEXT DEFAULT ""', 'tg INTEGER DEFAULT 0'] as $col) { try { $db->exec('ALTER TABLE accounts ADD COLUMN ' . $col); } catch (Throwable $e) {} }
    return $db;
}
// Кто вошёл: по номеру телефона (код из Telegram) или в кабинет по почте
function client_who($token) {
    if (!is_string($token) || strlen($token) < 32) return null;
    $q = client_db()->prepare('SELECT phone, acc, created FROM client_sessions WHERE token = ?'); $q->execute([hash('sha256', $token)]);
    $r = $q->fetch(); if (!$r || $r['created'] < time() - 180 * 86400) return null;
    if (!$r['acc']) return ['phone' => $r['phone'], 'acc' => null];
    $a = acc_get((int)$r['acc']); if (!$a || !$a['verified']) return null;
    return ['phone' => $a['phone'], 'acc' => $a];
}
function acc_get($id) { $q = client_db()->prepare('SELECT * FROM accounts WHERE id = ?'); $q->execute([$id]); return $q->fetch() ?: null; }
// Один ящик — разные адреса домена: у Яндекса ya.ru = yandex.ru (а также yandex.com/.by/.kz/.ua, narod.ru), у Google gmail.com = googlemail.com.
// Сравниваем только домены, сам адрес до @ — как написан. У Mail.ru mail.ru, bk.ru, list.ru, inbox.ru — разные ящики, их не сравниваем.
function mail_key($m) {
    $m = mb_strtolower(trim((string)$m)); if (!strpos($m, '@')) return $m;
    [$u, $d] = explode('@', $m, 2);
    if (in_array($d, ['ya.ru', 'yandex.ru', 'yandex.com', 'yandex.by', 'yandex.kz', 'yandex.ua', 'narod.ru'], true)) return $u . '@yandex.ru';
    if (in_array($d, ['gmail.com', 'googlemail.com'], true)) return $u . '@gmail.com';
    return $m;
}
function acc_by_mail($m) {
    $q = client_db()->prepare('SELECT * FROM accounts WHERE email = ?'); $q->execute([$m]); if ($a = $q->fetch()) return $a;
    $k = mail_key($m); if ($k === mb_strtolower(trim((string)$m)) && !preg_match('/@(ya|yandex|narod|gmail|googlemail)\./', $k)) return null;
    foreach (client_db()->query('SELECT * FROM accounts ORDER BY verified DESC, id') as $a) if (mail_key($a['email']) === $k) return $a;
    return null;
}
function acc_session($accId) {
    $t = bin2hex(random_bytes(24));
    client_db()->prepare('INSERT INTO client_sessions (token, phone, acc, created) VALUES (?, "", ?, ?)')->execute([hash('sha256', $t), $accId, time()]);
    return $t;
}
// Что принадлежит клиентке: её телефон (если подтверждён), записи и покупки из кабинета, почта покупателя сертификата
function client_mine($who) {
    $phone = $who['phone'] ?? ''; $acc = $who['acc'] ?? null;
    return function ($x) use ($phone, $acc) {
        if ($phone && digits_phone($x['phone'] ?? '') === $phone) return true;
        if (!$acc) return false;
        // та же почта — с учётом одинаковых ящиков (ya.ru = yandex.ru, gmail.com = googlemail.com)
        return (int)($x['owner'] ?? 0) === (int)$acc['id'] || (($x['email'] ?? '') !== '' && mail_key($x['email']) === mail_key($acc['email']));
    };
}
// Код на почту (регистрация, сброс пароля): 6 цифр, 15 минут, 5 попыток, новый — не чаще раза в минуту
function acc_send_code($email, $purpose) {
    $db = client_db();
    $q = $db->prepare('SELECT sent FROM acc_codes WHERE email = ? AND purpose = ?'); $q->execute([$email, $purpose]);
    if ((int)$q->fetchColumn() > time() - 60) return 'wait';
    $code = (string)random_int(100000, 999999);
    $db->prepare('INSERT OR REPLACE INTO acc_codes (email, purpose, hash, until, tries, sent) VALUES (?, ?, ?, ?, 0, ?)')->execute([$email, $purpose, password_hash($code, PASSWORD_DEFAULT), time() + 900, time()]);
    $what = $purpose === 'reset' ? 'смены пароля' : 'подтверждения почты';
    $ok = send_mail($email, 'Код ' . $code . ' — личный кабинет студии «М.А»', "Код для " . $what . " в личном кабинете студии «М.А»:\n\n<b style=\"font-size:28px;letter-spacing:4px\">" . $code . "</b>\n\nКод действует 15 минут. Никому его не сообщайте — Марина никогда не спрашивает коды.\nЕсли вы ничего не запрашивали, просто удалите это письмо.");
    return $ok ? 'ok' : 'fail';
}
function acc_check_code($email, $purpose, $code) {
    $db = client_db();
    $q = $db->prepare('SELECT * FROM acc_codes WHERE email = ? AND purpose = ?'); $q->execute([$email, $purpose]); $c = $q->fetch();
    if (!$c || $c['until'] < time() || $c['tries'] >= 5) return 'Код устарел. Нажмите «Прислать код ещё раз».';
    $db->prepare('UPDATE acc_codes SET tries = tries + 1 WHERE email = ? AND purpose = ?')->execute([$email, $purpose]);
    if (!password_verify(preg_replace('/\D/', '', (string)$code), $c['hash'])) { sleep(1); return 'Неверный код. Осталось попыток: ' . (4 - (int)$c['tries']); }
    $db->prepare('DELETE FROM acc_codes WHERE email = ? AND purpose = ?')->execute([$email, $purpose]);
    return '';
}
// Уведомление в колокольчик клиентки (если у неё есть кабинет)
function cnote($accId, $icon, $title, $text, $link = '', $tg = true) {
    if (!$accId) return;
    client_db()->prepare('INSERT INTO cnotes (acc, icon, title, text, link, t) VALUES (?, ?, ?, ?, ?, ?)')->execute([(int)$accId, $icon, $title, $text, $link, time()]);
    if ($tg && ($a = acc_get((int)$accId)) && !empty($a['tg']))  // клиентка подключила Telegram в кабинете
        tg_later($a['tg'], trim($icon . ' <b>' . h($title) . '</b>') . "\n" . h($text) . "\n\n<a href=\"" . h(rtrim((string)cfg('site_url'), '/') . '/' . ($link ?: '#kabinet')) . "\">Открыть личный кабинет</a>");
    require_once __DIR__ . '/push.php'; push_acc($accId, push_note(trim($icon . ' ' . $title), $text, './' . ($link ?: '#kabinet')));  // и на телефон, если клиентка включила уведомления
}
// Напоминание из бота/почты — ещё и в колокольчик кабинета (и на телефон) владелицы записи
function cnote_booking($bookingId, $title, $text) {
    [$doc] = doc_load(false);
    foreach ($doc['bookings'] as $b) if (($b['id'] ?? '') === $bookingId) { $a = acc_of($b); if ($a) cnote($a, '🔔', $title, trim(preg_replace('/\s+/u', ' ', strip_tags(preg_replace('/<a [^>]*>.*?<\/a>/u', '', $text)))), '#kabinet'); return; }
}
// Чей кабинет у записи или сертификата: владелец, почта покупателя, подтверждённый телефон
function acc_of($x) {
    if (!empty($x['owner'])) return (int)$x['owner'];
    $db = client_db();
    if (!empty($x['email']) && ($a = acc_by_mail(mb_strtolower($x['email']))) && $a['verified']) return (int)$a['id'];
    $ph = digits_phone($x['phone'] ?? '');
    if ($ph) { $q = $db->prepare('SELECT id FROM accounts WHERE phone = ? AND verified = 1'); $q->execute([$ph]); if ($id = $q->fetchColumn()) return (int)$id; }
    return 0;
}
// Мама изменила записи или сертификаты — сообщить клиенткам в кабинет
function cnotes_diff($before, $doc) {
    $old = []; foreach ($before['bookings'] as $b) $old[$b['id'] ?? ''] = $b;
    foreach ($doc['bookings'] as $b) {
        $o = $old[$b['id'] ?? ''] ?? null; if (!$o || !empty($b['anon'])) continue;
        $acc = null; $get = function () use (&$acc, $b) { return $acc ??= acc_of($b); };
        if (($o['status'] ?? '') === 'booked' && ($b['status'] ?? '') === 'cancelled' && ($b['by'] ?? '') !== 'client')
            cnote($get(), '❌', 'Марина отменила запись', when_text($b['date'], (int)$b['start']) . '. Если это ошибка — напишите Марине.', '#kabinet');
        elseif (($b['status'] ?? '') === 'booked' && (($o['date'] ?? '') !== ($b['date'] ?? '') || (int)($o['start'] ?? 0) !== (int)($b['start'] ?? 0)) && ($b['movedBy'] ?? '') !== 'client')
            cnote($get(), '🔁', 'Запись перенесена', 'Было: ' . when_text($o['date'], (int)$o['start']) . '. Теперь: ' . when_text($b['date'], (int)$b['start']) . '.', '#kabinet');
        elseif (($b['status'] ?? '') === 'booked' && (($o['svc'] ?? '') !== ($b['svc'] ?? '') || !empty($o['french']) !== !empty($b['french']) || !empty($o['remove']) !== !empty($b['remove'])))
            cnote($get(), '✏️', 'Марина изменила запись', ($b['svcName'] ?? 'Услуга изменена') . ' · ' . when_text($b['date'], (int)$b['start']) . ($b['price'] ?? 0 ? ' · ' . number_format((int)$b['price'], 0, ',', ' ') . ' ₽' : ''), '#kabinet');
    }
    $oc = []; foreach ($before['certs'] as $c) $oc[$c['id'] ?? ''] = $c;
    foreach ($doc['certs'] as $c) {
        $o = $oc[$c['id'] ?? ''] ?? null; if (!$o) continue;
        $bal = (int)($c['balance'] ?? $c['sum'] ?? 0); $obal = (int)($o['balance'] ?? $o['sum'] ?? 0);
        if (($o['status'] ?? '') === 'wait' && ($c['status'] ?? '') === 'paid') cnote(acc_of($c), '🎁', 'Сертификат активен', '№ ' . ($c['code'] ?? '') . ' на ' . number_format((int)$c['sum'], 0, ',', ' ') . ' ₽ — оплата получена.', '#kabinet');
        elseif ($bal < $obal) cnote(acc_of($c), '🎁', 'Списание с сертификата', '№ ' . ($c['code'] ?? '') . ': списано ' . number_format($obal - $bal, 0, ',', ' ') . ' ₽, остаток ' . number_format($bal, 0, ',', ' ') . ' ₽.', '#kabinet');
    }
    $ot = []; foreach ($before['training'] as $t) $ot[$t['id'] ?? ''] = $t;
    foreach ($doc['training'] as $t) {
        $o = $ot[$t['id'] ?? ''] ?? null; if (!$o) continue;
        if (($o['status'] ?? '') === 'wait' && ($t['status'] ?? '') === 'paid') cnote(acc_of($t), '🎓', 'Марина подтвердила обучение', 'Предоплата получена, даты закреплены за вами. Подробности — в личном кабинете.', '#kabinet');
        elseif (($o['status'] ?? '') === 'paid' && in_array($t['status'] ?? '', ['refund', 'late'], true) && ($t['by'] ?? '') !== 'student')
            cnote(acc_of($t), '🎓', 'Марина отменила обучение', ($t['status'] === 'refund' ? 'Предоплата вернётся переводом.' : 'Подробности уточните у Марины.'), '#kabinet');
        if (trim((string)($t['mnote'] ?? '')) !== '' && ($t['mnote'] ?? '') !== ($o['mnote'] ?? '')) cnote(acc_of($t), '📝', 'Марина оставила заметку к обучению', mb_substr((string)$t['mnote'], 0, 140), '#kabinet');
        if (!empty($t['refunded']) && empty($o['refunded'])) cnote(acc_of($t), '💸', 'Предоплата возвращена', 'Марина вернула предоплату за обучение.', '#kabinet');
    }
}

// Клиентка привязала номер к кабинету — её записи у Марины обновляются: полное имя из кабинета, почта, отметка «есть кабинет»
function acc_merge($accId, $phone) {
    $a = acc_get((int)$accId); if (!$a || !$phone) return;
    $full = trim((string)$a['name']); $words = count(preg_split('/\s+/u', $full));
    [$doc, $v] = doc_load(true); $n = 0; $old = '';
    foreach (['bookings', 'certs', 'training'] as $k) foreach ($doc[$k] as &$x) {
        if (digits_phone($x['phone'] ?? '') !== $phone || !empty($x['anon'])) continue;
        if (empty($x['owner'])) $x['owner'] = (int)$a['id'];
        $x['accMail'] = $a['email'];
        if (!empty($a['av'])) $x['accAv'] = $a['av'];
        $cur = trim((string)($x['name'] ?? ''));
        if ($k === 'bookings' && $words >= 2 && $cur !== $full && count(preg_split('/\s+/u', $cur)) < $words) { $old = $old ?: $cur; $x['name'] = $full; }
        $n++;
    }
    unset($x);
    if (!$n) { doc_abort(); return; }
    doc_note($doc, '🙋', 'Клиентка зарегистрировалась на сайте', ($old ? $old . ' → ' : '') . ($full ?: $a['email']) . ' · ' . phone_nice($phone) . ' · ' . $a['email'] . '. Её записи в базе обновлены.', ['tab' => 'clients']);
    doc_save($doc, $v);
}

function mail_ok($m) { $m = mb_strtolower(trim((string)$m)); return filter_var($m, FILTER_VALIDATE_EMAIL) && strlen($m) <= 80 ? $m : ''; }
function client_phone($token) {
    if (!is_string($token) || strlen($token) < 32) return '';
    $q = client_db()->prepare('SELECT phone, created FROM client_sessions WHERE token = ?'); $q->execute([hash('sha256', $token)]);
    $r = $q->fetch();
    return ($r && $r['created'] > time() - 180 * 86400) ? $r['phone'] : '';
}
// Куда прислать код: последний чат бота с этим телефоном, иначе почта из записи
function client_channel($phone) {
    $q = db()->prepare('SELECT chat_id, email, remind FROM bookings WHERE phone = ? ORDER BY updated DESC'); $q->execute([$phone]);
    $mail = '';
    foreach ($q->fetchAll() as $r) {
        if (!empty($r['chat_id'])) return ['tg', $r['chat_id']];
        if (!$mail && !empty($r['email'])) $mail = $r['email'];
    }
    return $mail ? ['mail', $mail] : null;
}
function mask_mail($m) { [$a, $d] = explode('@', $m, 2) + ['', '']; return mb_substr($a, 0, 2) . str_repeat('•', max(1, mb_strlen($a) - 2)) . '@' . $d; }

// Фото профиля клиентки: проверить картинку, пересохранить (GD — вредное содержимое не пройдёт), вернуть [данные, расширение]
function av_img($dataUrl, $maxBytes, $maxPx) {
    if (!preg_match('#^data:image/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$#', (string)$dataUrl, $m)) return null;
    $bin = base64_decode($m[2], true); if ($bin === false || strlen($bin) > $maxBytes) return null;
    $info = @getimagesizefromstring($bin);
    if (!$info || !in_array($info[2], [IMAGETYPE_WEBP, IMAGETYPE_JPEG, IMAGETYPE_PNG], true) || $info[0] > $maxPx || $info[1] > $maxPx || $info[0] < 16 || $info[1] < 16) return null;
    if (!function_exists('imagecreatefromstring')) return [$bin, $info[2] === IMAGETYPE_WEBP ? 'webp' : 'jpg'];
    $im = @imagecreatefromstring($bin); if (!$im) return null;
    ob_start(); $webp = function_exists('imagewebp') && imagewebp($im, null, 86); if (!$webp) { ob_clean(); imagejpeg($im, null, 88); }
    $out = ob_get_clean(); imagedestroy($im);
    return [$out, $webp ? 'webp' : 'jpg'];
}
function av_dir() { $d = dirname((string)cfg('db_path')) . '/av'; if (!is_dir($d)) @mkdir($d, 0755, true); return $d; }
function av_remove($name) { if ($name && preg_match('/^([a-f0-9]{32})\.(webp|jpg)$/', $name, $m)) { @unlink(av_dir() . '/' . $name); @unlink(av_dir() . '/' . $m[1] . '_t.' . $m[2]); } }
// Обновить фото в записях, сертификатах и обучении этой клиентки — мама видит его в своём кабинете
function av_sync($a, $name) {
    [$doc, $v] = doc_load(true); $n = 0;
    foreach (['bookings', 'certs', 'training'] as $k) foreach ($doc[$k] as &$x) {
        if ((int)($x['owner'] ?? 0) !== (int)$a['id'] && ($x['accMail'] ?? '') !== $a['email']) continue;
        if ($name) $x['accAv'] = $name; else unset($x['accAv']); $n++;
    }
    unset($x);
    doc_save($doc, $v);  // всегда новая версия базы — кабинет мамы подхватит фото и у записей, найденных по почте или телефону
}
// Для кабинета мамы: какие телефоны и почты принадлежат клиенткам с личным кабинетом, и их фото
function acc_map() {
    $m = ['p' => [], 'e' => []];
    foreach (client_db()->query('SELECT email, phone, av FROM accounts WHERE verified = 1') as $a) {
        $x = ['e' => (string)$a['email'], 'av' => (string)($a['av'] ?? '')];
        $m['e'][mail_key($a['email'])] = $x; if ($a['phone']) $m['p'][(string)$a['phone']] = $x;  // ключ почты — без различий ya.ru / yandex.ru
    }
    return $m;
}

// Telegram в личном кабинете: ссылка на бота с ключом аккаунта; бот запоминает чат и привязывает к нему будущие записи
function acc_tg_link($id) { return 'https://t.me/' . cfg('bot_name') . '?start=a_' . (int)$id . '_' . substr(hash_hmac('sha256', 'acc' . (int)$id, (string)cfg('admin_key')), 0, 10); }
function acc_tg_bind($a, $chat) {
    client_db()->prepare('UPDATE accounts SET tg = ? WHERE id = ?')->execute([(int)$chat, (int)$a['id']]);
    $a['tg'] = $chat; [$doc] = doc_load(false); $today = date('Y-m-d'); $n = 0;
    foreach ($doc['bookings'] as $b) {
        if (($b['status'] ?? '') !== 'booked' || ($b['date'] ?? '') < $today) continue;
        $o = acc_of($b); if ((int)$o !== (int)$a['id']) continue;
        $q = db()->prepare('UPDATE bookings SET chat_id = ? WHERE id = ? AND (chat_id IS NULL OR chat_id = 0)'); $q->execute([(int)$chat, (string)$b['id']]); $n += $q->rowCount();
    }
    return $n;
}


// ---------- каталог сайта: услуги, доп. услуги, курсы, портфолио (меняет Марина в кабинете) ----------
function cat_s($v, $n) { return mb_substr(trim(preg_replace('/\s+/u', ' ', strip_tags((string)$v))), 0, $n); }
function cat_id($v) { return substr(preg_replace('/[^A-Za-z0-9_-]/', '', (string)$v), 0, 20); }
function cat_n($v, $lo, $hi) { return max($lo, min($hi, (int)$v)); }
function cat_list($a, $max, $fn) {  // список записей с уникальными id
    $out = []; $seen = [];
    foreach (is_array($a) ? array_slice($a, 0, $max) : [] as $x) {
        if (!is_array($x)) continue; $id = cat_id($x['id'] ?? ''); if ($id === '' || isset($seen[$id])) continue;
        $seen[$id] = 1; $r = $fn($x); if ($r) $out[] = ['id' => $id] + $r;
    }
    return $out;
}
function cat_flags($x, $keys) { $o = []; foreach ($keys as $k) if (!empty($x[$k])) $o[$k] = true; return $o; }
// Проверить каталог перед сохранением. Курс удалить можно только через course_del (с паролем) — здесь удалённые курсы возвращаем.
function cat_clean($c, $before) {
    if (!is_array($c)) return $before;
    $out = [
        'groups' => cat_list($c['groups'] ?? [], 30, fn($x) => ($n = cat_s($x['name'] ?? '', 40)) !== '' ? ['name' => $n] : null),
        'services' => cat_list($c['services'] ?? [], 300, fn($x) => ($n = cat_s($x['name'] ?? '', 90)) === '' ? null : [
            'g' => cat_id($x['g'] ?? ''), 'name' => $n, 'price' => cat_n($x['price'] ?? 0, 0, 1000000), 'from' => !empty($x['from']),
            'min' => cat_n($x['min'] ?? 60, 5, 600), 'text' => cat_s($x['text'] ?? '', 700), 'home' => !empty($x['home']), 'corr' => cat_n($x['corr'] ?? 0, 0, 120)] + cat_flags($x, ['hidden', 'del'])),
        'addons' => cat_list($c['addons'] ?? [], 50, fn($x) => ($n = cat_s($x['name'] ?? '', 60)) === '' ? null : [
            'name' => $n, 'price' => cat_n($x['price'] ?? 0, 0, 1000000), 'min' => cat_n($x['min'] ?? 0, 0, 300), 'text' => cat_s($x['text'] ?? '', 500),
            'svcs' => array_values(array_unique(array_filter(array_map('cat_id', array_slice((array)($x['svcs'] ?? []), 0, 300)), 'strlen')))] + cat_flags($x, ['del'])),
        'courses' => cat_list($c['courses'] ?? [], 40, fn($x) => ($n = cat_s($x['name'] ?? '', 160)) === '' ? null : [
            'name' => $n, 'short' => cat_s($x['short'] ?? $n, 80) ?: mb_substr($n, 0, 80), 'days' => cat_n($x['days'] ?? 2, 1, 10), 'models' => cat_n($x['models'] ?? 0, 0, 20),
            'price' => cat_n($x['price'] ?? 0, 0, 1000000), 'pre' => cat_n($x['pre'] ?? 0, 0, 1000000), 'msvc' => cat_s($x['msvc'] ?? '', 120),
            'prog' => array_values(array_filter(array_map(fn($p) => cat_s($p, 700), array_slice((array)($x['prog'] ?? []), 0, 60)), 'strlen')),
            'inc' => cat_s($x['inc'] ?? '', 900)] + cat_flags($x, ['hidden', 'del'])),
        'wgroups' => cat_list($c['wgroups'] ?? [], 30, fn($x) => ($n = cat_s($x['name'] ?? '', 40)) !== '' ? ['name' => $n] : null),
        'works' => cat_list($c['works'] ?? [], 400, function ($x) {
            $f = (string)($x['f'] ?? ''); $u = (string)($x['u'] ?? '');
            $src = preg_match('/^\d{2}$/', $f) ? ['f' => $f] : (preg_match('/^[a-f0-9]{32}$/', $u) ? ['u' => $u] : null);
            if (!$src) return null;
            return $src + ['g' => cat_id($x['g'] ?? ''), 'cap' => cat_s($x['cap'] ?? '', 160), 'w' => cat_n($x['w'] ?? 640, 1, 4000), 'h' => cat_n($x['h'] ?? 853, 1, 4000)] + cat_flags($x, ['hidden']);
        }),
    ];
    $out['contacts'] = cat_contacts($c['contacts'] ?? []);
    $ph = $c['about']['photo'] ?? null;
    $out['about'] = [
        'photo' => is_array($ph) && preg_match('/^[a-f0-9]{32}$/', (string)($ph['u'] ?? '')) ? ['u' => $ph['u'], 'w' => cat_n($ph['w'] ?? 640, 1, 4000), 'h' => cat_n($ph['h'] ?? 640, 1, 4000)] : null,
        'awards' => cat_list($c['about']['awards'] ?? [], 60, function ($x) {
            $photos = [];
            foreach (array_slice((array)($x['photos'] ?? []), 0, 30) as $p) {
                if (!is_array($p)) continue; $f = (string)($p['f'] ?? ''); $u = (string)($p['u'] ?? '');
                $src = preg_match('/^\d{2}$/', $f) ? ['f' => $f] : (preg_match('/^[a-f0-9]{32}$/', $u) ? ['u' => $u] : null);
                if ($src) $photos[] = $src + ['cap' => cat_s($p['cap'] ?? '', 200), 'w' => cat_n($p['w'] ?? 640, 1, 4000), 'h' => cat_n($p['h'] ?? 853, 1, 4000)];
            }
            if (!$photos) return null;
            return ['place' => cat_s($x['place'] ?? '', 40), 'title' => cat_s($x['title'] ?? '', 160), 'nom' => cat_s($x['nom'] ?? '', 400), 'where' => cat_s($x['where'] ?? '', 80), 'photos' => $photos];
        }),
    ];
    // курс без пароля не удаляется: если пропал или помечен удалённым — возвращаем, как было
    $was = []; foreach (($before['courses'] ?? []) as $x) if (empty($x['del'])) $was[$x['id']] = $x;
    foreach ($out['courses'] as &$x) if (isset($was[$x['id']])) { if (!empty($x['del'])) unset($x['del']); unset($was[$x['id']]); }
    unset($x);
    foreach ($was as $x) $out['courses'][] = $x;
    return $out;
}
// Контакты Марины: телефон и ссылки на чаты — только проверенные адреса мессенджеров
function cat_contacts($c) {
    $c = is_array($c) ? $c : []; $o = [];
    $ph = cat_s($c['phone'] ?? '', 30); if (strlen(preg_replace('/\D/', '', $ph)) >= 10) $o['phone'] = $ph;
    $wa = cat_s($c['wa'] ?? '', 200);
    if (preg_match('#^https://(wa\.me|api\.whatsapp\.com)/[A-Za-z0-9/_?=.&%-]+$#', $wa) || strlen(preg_replace('/\D/', '', $wa)) >= 10 && !preg_match('/[a-z]/i', $wa)) $o['wa'] = $wa;
    $tg = cat_s($c['tg'] ?? '', 200);
    if (preg_match('/^@?([A-Za-z0-9_]{4,40})$/', $tg, $m)) $tg = 'https://t.me/' . $m[1];
    if (preg_match('#^https://t\.me/[A-Za-z0-9_+/-]{3,80}$#', $tg)) $o['tg'] = $tg;
    $mx = cat_s($c['max'] ?? '', 300);
    if (preg_match('#^https://(web\.)?max\.ru/[A-Za-z0-9_/?=.&%-]+$#', $mx)) $o['max'] = $mx;
    return $o;
}
// Фото работ: лежат в data/works, отдаёт wk.php
function wk_dir() { $d = dirname((string)cfg('db_path')) . '/works'; if (!is_dir($d)) @mkdir($d, 0755, true); return $d; }
