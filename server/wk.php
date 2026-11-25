<?php
// Фото работ в портфолио, которые Марина загрузила из кабинета: лежат в data/works (папка закрыта), отдаём по имени
$f = (string)($_GET['f'] ?? '');
if (!preg_match('/^[a-f0-9]{32}(_t)?\.webp$/', $f) || !is_file($p = __DIR__ . '/data/works/' . $f)) { http_response_code(404); exit; }
$head = (string)@file_get_contents($p, false, null, 0, 12);
header('Content-Type: ' . (substr($head, 8, 4) === 'WEBP' ? 'image/webp' : 'image/jpeg'));  // без поддержки WebP на хостинге сохраняется JPEG
header('Cache-Control: public, max-age=31536000, immutable');
header('X-Content-Type-Options: nosniff');
header('Content-Length: ' . filesize($p));
readfile($p);
