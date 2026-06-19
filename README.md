# M&A Vacancy Monitor

Сайт-монитор вакансий с упоминанием M&A на hh.ru. Один Node.js/Express
сервер: отдаёт статический фронтенд (`public/index.html`) и проксирует
запросы к `api.hh.ru` через `/api/vacancies` (чтобы избежать CORS и
блокировок при обращении напрямую из браузера).

## Структура

```
ma-vacancy-monitor/
├── server.js          ← Express-сервер: статика + прокси к api.hh.ru
├── public/
│   └── index.html      ← вся страница (UI + логика на чистом JS)
├── package.json
└── README.md
```

## Деплой на Railway

1. Зарегистрируйся на railway.app (проще всего — через GitHub-аккаунт).
2. Залей эту папку в GitHub-репозиторий:
   ```
   cd ma-vacancy-monitor
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<твой-юзернейм>/ma-vacancy-monitor.git
   git push -u origin main
   ```
3. На railway.app → "New Project" → "Deploy from GitHub repo" → выбери
   этот репозиторий.
4. Railway сам определит Node.js-проект по `package.json`, установит
   зависимости (`npm install`) и запустит `npm start`.
5. После деплоя зайди в настройки проекта → "Settings" → "Networking" →
   "Generate Domain" — получишь публичный URL вида
   `https://ma-vacancy-monitor-production.up.railway.app`.

### Альтернатива без GitHub — Railway CLI

```
npm i -g @railway/cli
cd ma-vacancy-monitor
railway login
railway init
railway up
```

## Локальная проверка перед деплоем

```
cd ma-vacancy-monitor
npm install
npm start
```
Откроется на `localhost:3000`.

## Настройка

- В `server.js` замени `misak.contact@gmail.com` в `User-Agent` на свой
  контакт (hh.ru рекомендует это в документации API).
- Список городов в `<select id="area">` в `index.html` — захардкоженный
  минимум. Полный список регионов можно получить через
  `https://api.hh.ru/areas`.

## Известные ограничения

- hh.ru блокирует запросы с некоторых облачных IP-диапазонов (например,
  с Vercel/AWS serverless) как часть анти-скрейпинг защиты. Railway
  использует другую инфраструктуру (Google Cloud), которая обычно через
  такую блокировку проходит — но 100% гарантии нет, нужно проверять.
- hh.ru API отдаёт максимум 2000 вакансий на один поисковый запрос.
- История вакансий не сохраняется — каждый поиск отражает текущее
  состояние hh.ru на момент запроса.

