# Jarwis

Промо-сайт голосового ИИ-клиента **Jarwis** и маркетплейс внутриигровых предметов
(аккаунты, скины, валюта, бусты, ключи, услуги) в эстетике red/black cyberpunk-lite.

Проект собран так, чтобы фронтенд выглядел и работал как готовый продукт, а бэкенд
подключался одной переменной окружения — без переписывания экранов.

---

## Стек

| Слой       | Технология                                              |
| ---------- | ------------------------------------------------------- |
| UI         | React 18, TypeScript (strict)                            |
| Сборка     | Vite 5 (`@` алиас, ручные чанки vendor / motion / charts) |
| Стили      | Tailwind CSS 3 + собственные токены в `src/index.css`     |
| Анимации   | Framer Motion (scroll reveal, page transitions, hover)   |
| Графики    | Recharts (графики админки и кабинета продавца)            |
| Маршруты   | React Router 6 (`v7`-флаги включены)                     |
| Иконки     | lucide-react                                             |

Никакого бэкенда в комплекте нет: слой данных полностью повторяет REST-контракт
и работает на мок-адаптере поверх `localStorage`.

---

## Быстрый старт

```bash
npm install
npm run dev          # http://localhost:5173
```

| Скрипт               | Что делает                                  |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | dev-сервер с HMR                           |
| `npm run typecheck`  | `tsc --noEmit` — проверка типов            |
| `npm run build`      | `tsc -b && vite build` → `dist/`           |
| `npm run preview`    | локальный просмотр собранного `dist/`       |

Требуется Node.js 18+ (проверено на 24.x LTS).

---

## Демо-доступ

Вход на странице `/login` по кнопке **«Демо-доступ»** подставляет:

```
artem@jarwis.gg / jarwis2026
```

Это единый демо-аккаунт: он же администратор, покупатель и продавец, поэтому один
вход открывает все разделы с непустым содержимым.

| Раздел                  | Что показывает                                            |
| ----------------------- | --------------------------------------------------------- |
| `/cabinet/buyer`        | заказы, баланс, избранное, активная подписка               |
| `/cabinet/seller`       | статистика продаж, график выручки, вывод средств            |
| `/cabinet/chat`         | защищённый чат покупатель ↔ продавец                       |
| `/admin`                | обзор, пользователи, модерация, каталог, контент, финансы |

Кнопка **«Роль»** в шапке переключает `user` / `seller` / `admin` — удобно проверять
доступы без правки данных.

Демо-состояние лежит в `localStorage` под префиксом `jarwis:v1:`. Чтобы сбросить
витрину к исходной:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith('jarwis:v1:'))
  .forEach(k => localStorage.removeItem(k))
```

---

## Переменные окружения

Скопируйте `.env.example` в `.env.local`:

```bash
VITE_API_URL=https://api.example.com   # пусто → мок-адаптер
VITE_PAYMENT_PROVIDER=stub
VITE_GOOGLE_CLIENT_ID=
VITE_ADMIN_EMAIL=admin@jarwis.gg
```

**Ключевой момент:** если `VITE_API_URL` задан, `src/api/client.ts` уходит в HTTP
по REST-контракту; если нет — работает мок. Сигнатуры вызовов при этом не меняются,
экраны переписывать не нужно.

---

## Структура

```
src/
├─ api/
│  ├─ client.ts        # адаптер данных: мок ⇄ REST, эскроу-логика, канал переинвалидации
│  └─ useQuery.ts      # хук загрузки с авто-обновлением после мутаций
├─ components/
│  ├─ fx/              # Reveal, Stagger, GradientText, GridBackdrop, счётчики
│  ├─ layout/          # Header, Footer, PageTransition
│  ├─ marketplace/     # ProductCard, Filters (категории, игры, цена, сортировка)
│  ├─ chat/            # ChatWidget + переиспользуемая ChatPanel
│  └─ ui/              # кит компонентов: Button, Input, Modal, Tabs, Badge, StatCard…
├─ data/mock.ts        # детерминированные демо-данные (сид-PRNG)
├─ lib/                # captcha, валидаторы, форматирование, plural
├─ pages/              # Landing, Marketplace, Product, Auth, Static, Admin, cabinet/*
├─ store/              # auth, prefs (избранное/кошелёк), toast
├─ types.ts            # доменные типы
├─ index.css           # токены дизайна + компонентные классы
└─ tailwind.config.js  # цвета brand/ink/gold, keyframes, шкала прозрачности
```

### Роуты

```
/                      лендинг
/pricing               тарифы
/about                 о платформе
/marketplace           каталог + фильтры + поиск + сортировка + пагинация
/product/:id           карточка товара, отзывы, покупка
/login /register /forgot
/cabinet/buyer         кабинет покупателя
/cabinet/orders        заказы (роль покупателя/продавца)
/cabinet/favorites     избранное
/cabinet/wallet        кошелёк: пополнение, методы, история
/cabinet/chat          полноценный чат
/cabinet/seller        кабинет продавца
/cabinet/seller/listings  мои лоты (создание, вкл/выкл)
/cabinet/payouts       выплаты
/admin                 админ-панель (6 вкладок)
*                      404
```

---

## Как устроены ключевые механики

### Эскроу

Логика сделок живёт в `src/api/client.ts`:

- `createOrder` — проверяет баланс покупателя, **списывает сумму в эскроу**,
  переводит лот в `sold_out`, увеличивает счётчик продаж.
- `setOrderStatus('confirmed')` — перечисляет продавцу `сумма − комиссия`.
- `setOrderStatus('refunded' | 'dispute')` — возвращает деньги покупателю
  и возвращает лот в продажу.

Комиссия считается на стороне заказа (`commission = 5%`), поэтому выплаты и
статистика продавца сходятся с кошельком.

### Актуальность данных

Любая мутация в `api` вызывает `notify()`; подписчики (`useQuery`, кошелёк,
`ChatPanel`) перечитывают свои данные. Это заменяет ручной `refetch` в каждом
обработчике и имитирует поведение real-time бэкенда.

### Синхронизация состояния с URL

Каталог полностью описывается query-параметрами
(`?game=&cat=&sort=&min=&max=&instant=&q=`), поэтому любой фильтр можно
расшарить ссылкой, а «Назад» в браузере работает корректно.

### Дизайн-система

Цвета, радиусы, тени, градиенты и keyframes объявлены в `tailwind.config.js`;
компонентные классы (`.btn-primary`, `.card`, `.field`, `.chip`, `.label`,
`.h-display`, `.grad-text`) — в `src/index.css`. Тёмная красно-чёрная тема —
базовая, без переключения темы.

---

## Подключение реального бэкенда

1. Реализуйте эндпоинты из контракта `src/api/client.ts`
   (`/games`, `/products`, `/orders`, `/chat/threads`, `/reviews`, `/users`,
   `/wallet`, `/favorites`, `/admin/stats`).
2. Пропишите `VITE_API_URL`.
3. Замените мок-логин в `src/store/auth.tsx` на `POST /auth/login` с httpOnly-кукой
   (транспорт уже шлёт `credentials: 'include'`).
4. Подключите платёжный шлюз в обработчике `topUp`
   (`VITE_PAYMENT_PROVIDER`) и Google OAuth по `VITE_GOOGLE_CLIENT_ID`.

Экраны, компоненты и стили при этом не меняются.

---

## Переменные окружения и деплой

Статика собирается в `dist/`. Для SPA-роутинга на дев-сервере нужен fallback
на `index.html` (Vite делает это сам, Netlify/Vercel — через `_redirects`
или `vercel.json`).

```bash
npm run build
npm run preview
```

## Лицензия

Приватный проект. Все права защищены.
