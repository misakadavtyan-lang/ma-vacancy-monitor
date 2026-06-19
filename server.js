const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Раздаём статический фронтенд из папки public/
app.use(express.static(path.join(__dirname, 'public')));

// Прокси-эндпоинт к hh.ru
app.get('/api/vacancies', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const hhUrl = `https://api.hh.ru/vacancies?${params.toString()}`;

    const hhRes = await fetch(hhUrl, {
      headers: {
  	'User-Agent': 'api-test-agent',
  	'Accept': 'application/json',
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

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'proxy_failed', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
