const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Простой in-memory кэш: ключ = строка запроса, значение = {data, ts}
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Обычный браузерный User-Agent — выдавать себя за реальный браузер
// оказалось надёжнее, чем честно представляться кастомным скриптом.
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

app.get('/api/vacancies', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const cacheKey = params.toString();

    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('X-Cache', 'HIT');
      res.status(200).json(cached.data);
      return;
    }

    // небольшая пауза перед запросом — снижает шанс попасть под
    // anti-bot фильтр по скорости запросов
    await sleep(400 + Math.random() * 600);

    const hhUrl = `https://api.hh.ru/vacancies?${params.toString()}`;
    const hhRes = await fetch(hhUrl, {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'application/json',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    });

    const text = await hhRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.set('Access-Control-Allow-Origin', '*');

    if (!hhRes.ok) {
      res.status(hhRes.status).json({
        error: 'hh_api_error',
        status: hhRes.status,
        requested_url: hhUrl,
        hh_response: data,
      });
      return;
    }

    cache.set(cacheKey, { data, ts: Date.now() });
    res.set('X-Cache', 'MISS');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'proxy_failed', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
