import type {
  AdminStats,
  ChatThread,
  FaqItem,
  Game,
  LandingContent,
  Order,
  Product,
  ProductCategory,
  Review,
  Tariff,
  User,
} from '@/types'

/* ─────────────────────────────────────────────
   Детерминированный ГПСЧ — демо-данные не «прыгают» между перезагрузками
   ───────────────────────────────────────────── */
let _seed = 20260927
function rnd() {
  _seed = (_seed * 1664525 + 1013904223) % 4294967296
  return _seed / 4294967296
}
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)]
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

/* ─────────────────────────────────────────────
   Игры
   ───────────────────────────────────────────── */
export const GAMES: Game[] = [
  { id: 'g_steam', slug: 'steam', title: 'Steam', short: 'STEAM', emoji: '🎮', gradient: 'from-blue-600/30 to-cyan-500/10', players: '418 млн', productsCount: 12840 },
  { id: 'g_cs2', slug: 'cs2', title: 'Counter-Strike 2', short: 'CS2', emoji: '🔫', gradient: 'from-orange-600/30 to-amber-500/10', players: '1.4 млн', productsCount: 4210 },
  { id: 'g_dota', slug: 'dota2', title: 'Dota 2', short: 'DOTA 2', emoji: '⚔️', gradient: 'from-red-700/30 to-rose-500/10', players: '812 тыс.', productsCount: 3180 },
  { id: 'g_minecraft', slug: 'minecraft', title: 'Minecraft', short: 'MINECRAFT', emoji: '🟩', gradient: 'from-emerald-600/30 to-lime-500/10', players: '172 млн', productsCount: 9640 },
  { id: 'g_fortnite', slug: 'fortnite', title: 'Fortnite', short: 'FORTNITE', emoji: '🏝️', gradient: 'from-violet-600/30 to-fuchsia-500/10', players: '96 млн', productsCount: 5120 },
  { id: 'g_roblox', slug: 'roblox', title: 'Roblox', short: 'ROBLOX', emoji: '🎯', gradient: 'from-red-600/30 to-pink-500/10', players: '88 млн', productsCount: 7310 },
  { id: 'g_gta', slug: 'gta5', title: 'GTA 5 Online', short: 'GTA 5', emoji: '🚗', gradient: 'from-amber-600/30 to-yellow-500/10', players: '44 млн', productsCount: 2890 },
  { id: 'g_valorant', slug: 'valorant', title: 'Valorant', short: 'VALORANT', emoji: '🎯', gradient: 'from-red-600/30 to-pink-600/10', players: '28 млн', productsCount: 2140 },
  { id: 'g_pubg', slug: 'pubg', title: 'PUBG', short: 'PUBG', emoji: '🪖', gradient: 'from-yellow-600/30 to-orange-500/10', players: '37 млн', productsCount: 1960 },
  { id: 'g_terraria', slug: 'terraria', title: 'Terraria', short: 'TERRARIA', emoji: '🌳', gradient: 'from-teal-600/30 to-emerald-500/10', players: '19 млн', productsCount: 1120 },
]

/* ─────────────────────────────────────────────
   Категории
   ───────────────────────────────────────────── */
export const CATEGORIES: { id: ProductCategory; title: string; emoji: string; hint: string }[] = [
  { id: 'accounts', title: 'Аккаунты', emoji: '🗝️', hint: 'Готовые аккаунты с прогрессом' },
  { id: 'skins', title: 'Скины', emoji: '🎨', hint: 'Внешний вид, оружие, персонажи' },
  { id: 'currency', title: 'Валюта', emoji: '💎', hint: 'Игровая валюта и монеты' },
  { id: 'boosts', title: 'Бусты', emoji: '🚀', hint: 'Повышение рейтинга и MMR' },
  { id: 'items', title: 'Предметы', emoji: '📦', hint: 'Ресурсы, наборы, предметы' },
  { id: 'keys', title: 'Ключи', emoji: '🔑', hint: 'CD-ключи и подписки' },
  { id: 'services', title: 'Услуги', emoji: '🛠️', hint: 'Буст, обучение, чистка' },
]

/* ─────────────────────────────────────────────
   Пользователи
   ───────────────────────────────────────────── */
const AVATAR_COLORS = ['#f43f4f', '#ff6b74', '#c70f3c', '#e09a1f', '#8b5cf6', '#06b6d4', '#22c55e']
function avatarFor(name: string) {
  const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const bg = AVATAR_COLORS[h % AVATAR_COLORS.length]
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg.replace('#', '')}&color=fff&bold=true&size=128&format=svg&initials=${initials}`
}

const SELLER_NAMES = [
  'NeonTrader', 'VaultKing', 'SkinFactory', 'LootLab', 'QuantumSell', 'DarkMatter',
  'PixelBazaar', 'ArcadePro', 'NovaDeals', 'IronPhoenix', 'GhostLoad', 'HyperMart',
  'CrimsonNode', 'ZeroLatency', 'BitMonster', 'UrbanLegend',
]

export const USERS: User[] = [
  {
    id: 'u_me', name: 'Артём Ковалёв', email: 'artem@jarwis.gg', avatar: avatarFor('Артём Ковалёв'),
    role: 'admin', verified: true, banned: false, rating: 5, reviewsCount: 128, dealsCount: 64,
    balance: 48_920, registeredAt: daysAgo(430), lastSeen: hoursAgo(0.02), country: 'RU',
  },
  ...SELLER_NAMES.map((name, i) => ({
    id: `u_s${i + 1}`,
    name,
    email: `${name.toLowerCase()}@shop.jarwis.gg`,
    avatar: avatarFor(name),
    role: (i % 5 === 0 ? 'admin' : 'seller') as User['role'],
    verified: i % 3 !== 1,
    banned: false,
    rating: Math.round((3.9 + rnd() * 1.1) * 10) / 10,
    reviewsCount: int(12, 940),
    dealsCount: int(30, 2100),
    balance: int(4_000, 620_000),
    registeredAt: daysAgo(int(20, 700)),
    lastSeen: hoursAgo(int(1, 96)),
    country: pick(['RU', 'KZ', 'BY', 'UA', 'DE', 'TR']),
  })),
]

/**
 * Демо-аккаунт один и тот же для всех разделов:
 * artem@jarwis.gg / jarwis2026 — админ, покупатель и продавец,
 * поэтому один вход показывает и кабинеты, и админку.
 */
export const DEMO_ACCOUNTS = {
  buyer: USERS[0],
  seller: USERS.find((u) => u.id === 'u_s1')!,
  admin: USERS[0],
}

/* ─────────────────────────────────────────────
   Товары
   ───────────────────────────────────────────── */
const PREVIEWS = [
  'from-brand-600/40 to-brand-900/10',
  'from-rose-600/40 to-pink-900/10',
  'from-orange-600/40 to-red-900/10',
  'from-fuchsia-600/40 to-purple-900/10',
  'from-cyan-600/40 to-blue-900/10',
  'from-emerald-600/40 to-teal-900/10',
  'from-violet-600/40 to-indigo-900/10',
  'from-amber-600/40 to-yellow-900/10',
  'from-sky-600/40 to-cyan-900/10',
  'from-lime-600/40 to-green-900/10',
]

const TITLE_PARTS: Record<ProductCategory, string[]> = {
  accounts: ['Аккаунт', 'Профиль', 'Альт-аккаунт', 'Основной аккаунт'],
  skins: ['Скин', 'Набор скинов', 'Рубиновый скин', 'Легендарный набор', 'Ночной скин'],
  currency: ['Валюта', 'Монеты', 'Кристаллы', 'Алмазы'],
  boosts: ['Буст', 'Пуш рейтинга', 'Буст до ранга', ' MMR-буст'],
  items: ['Набор предметов', 'Ящик с лутом', 'Крафтовые ресурсы', 'Арсенал'],
  keys: ['CD-ключ', 'Подписка', 'Промокод', 'Season Pass'],
  services: ['Буст до Diamond', 'Обучение', 'Чистка аккаунта', 'Настройка ПК'],
}

const QUALIFIERS = ['Rare', 'Legendary', 'Pro', 'VIP', 'Ultra', 'Global', 'S', 'A | B', 'Новичок', 'Топ']

const FEATURE_POOL = [
  'Мгновенная доставка после оплаты',
  'Гарантия возврата 14 дней',
  'Передача через защищённый чат',
  'Проверка продавцом перед выдачей',
  'Данные не покидают эскроу',
  'Поддержка 24/7',
  'Возможность раскрытия данных',
  'Онлайн-поддержка после сделки',
]

const DESCRIPTIONS = [
  'Товар проверен модерацией Jarwis и полностью готов к передаче. Оплата проходит через эскроу — деньги переводятся продавцу только после вашего подтверждения получения.',
  'Один из самых популярных лотов в категории. Продавец отвечает в среднем за 3 минуты и передаёт товар в течение указанного времени. Любая проблема — открываем спор, возвращаем средства.',
  'Полностью легальный контент, переход на новый аккаунт не требуется. Доступ выдаётся сразу после подтверждения сделки в чате.',
]

function makeProduct(i: number): Product {
  const cat = pick(CATEGORIES).id
  const game = pick(GAMES)
  const qual = pick(QUALIFIERS)
  const title = `${pick(TITLE_PARTS[cat])} ${qual} · ${game.short}`
  const price = int(1, 240) * 100 + pick([0, 90, 50])
  const hasDiscount = rnd() > 0.72
  const status: Product['status'] = i % 37 === 0 ? 'moderation' : rnd() > 0.96 ? 'sold_out' : 'active'
  const feats = [...new Set([...Array(int(2, 4))].map(() => pick(FEATURE_POOL)))]

  return {
    id: `p_${i + 1}`,
    title,
    gameId: game.id,
    category: cat,
    price,
    oldPrice: hasDiscount ? Math.round((price * (1.4 + rnd() * 0.7)) / 10) * 10 : undefined,
    sellerId: pick(USERS).id,
    rating: Math.round((4 + rnd() * 1) * 10) / 10,
    reviewsCount: int(0, 480),
    sold: int(0, 940),
    preview: PREVIEWS[i % PREVIEWS.length],
    emoji: game.emoji,
    description: pick(DESCRIPTIONS),
    features: feats,
    deliveryMinutes: pick([1, 5, 15, 30, 60, 180, 720]),
    warrantyDays: pick([0, 3, 7, 14, 30]),
    instantDelivery: rnd() > 0.55,
    inStock: status === 'sold_out' ? 0 : int(1, 250),
    tags: [cat, game.slug, qual.toLowerCase()],
    createdAt: daysAgo(int(0, 90)),
    status,
  }
}

export const PRODUCTS: Product[] = Array.from({ length: 96 }, (_, i) => makeProduct(i))

export const FEATURED_PRODUCTS = PRODUCTS.filter((p) => p.status === 'active' && p.rating >= 4.7)
  .sort((a, b) => b.sold - a.sold)
  .slice(0, 8)

/* ─────────────────────────────────────────────
   Заказы
   ───────────────────────────────────────────── */
const ORDER_STATUSES: Order['status'][] = [
  'confirmed', 'delivered', 'in_progress', 'paid', 'pending', 'dispute', 'refunded',
]

export const ORDERS: Order[] = Array.from({ length: 34 }, (_, i) => {
  const product = pick(PRODUCTS)
  const status = pick(ORDER_STATUSES)
  const commission = Math.round(product.price * 0.05)
  // Продавец не покупает сам у себя — сдвигаем покупателя
  const buyerId =
    product.sellerId === DEMO_ACCOUNTS.buyer.id ? pick(['u_s4', 'u_s6']) : pick([DEMO_ACCOUNTS.buyer.id, 'u_s4', 'u_s6'])
  return {
    id: `JW-${String(10420 + i * 7)}`,
    productId: product.id,
    productTitle: product.title,
    gameId: product.gameId,
    buyerId,
    sellerId: product.sellerId,
    amount: product.price,
    commission,
    status,
    createdAt: daysAgo(int(0, 60)),
    deliveryData: 'login: user_**** · 2FA: подтверждён',
    escrowReleasedAt: status === 'confirmed' ? daysAgo(int(0, 30)) : undefined,
  }
}).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

/* ─────────────────────────────────────────────
   Отзывы
   ───────────────────────────────────────────── */
const REVIEW_TEXTS = [
  'Всё прошло быстро, продавец выдал товар через минуту. Рекомендую.',
  'Товар соответствует описанию. Эскроу сработал как положено, вопросов нет.',
  'Ответил за пару минут, помог с настройкой. Спасибо за сделку!',
  'Был небольшой лаг с выдачей, но продавец оперативно всё исправил. Ставлю пять звёзд.',
  'Покупал уже третий раз, качество стабильно высокое. Цены ниже, чем на аналогах.',
  'Честный продавец, без переписок и лишних вопросов. Всё чётко.',
  'Товар хороший, но доставка заняла чуть дольше обещанного. В целом ок.',
  'Очень удобно, что сделка идёт через Jarwis — не нужно переводить деньги напрямую.',
  'Скин огонь, графика просто топ. Спасибо продавцу!',
  'Всё отлично, буду брать ещё. Единственное — хотелось бы больше способов оплаты.',
]

export const REVIEWS: Review[] = Array.from({ length: 68 }, (_, i) => {
  const author = pick(USERS.slice(1))
  const targetType: Review['targetType'] = rnd() > 0.5 ? 'product' : 'seller'
  const target = pick(PRODUCTS)
  return {
    id: `r_${i + 1}`,
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    targetType,
    targetId: targetType === 'product' ? target.id : target.sellerId,
    rating: rnd() > 0.18 ? 5 : 4,
    text: pick(REVIEW_TEXTS),
    createdAt: daysAgo(int(0, 120)),
    reply: rnd() > 0.75 ? 'Спасибо за отзыв! Рады, что всё прошло гладко. Обращайтесь ещё 🤝' : undefined,
  }
}).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

/* ─────────────────────────────────────────────
   Чаты
   ───────────────────────────────────────────── */
export const THREADS: ChatThread[] = [
  {
    id: 'th_1',
    orderId: ORDERS[0]?.id,
    buyerId: DEMO_ACCOUNTS.buyer.id,
    sellerId: DEMO_ACCOUNTS.seller.id,
    unread: 2,
    lastMessageAt: hoursAgo(0.4),
    messages: [
      { id: 'm1', authorId: DEMO_ACCOUNTS.buyer.id, text: 'Здравствуйте! Товар ещё в наличии?', createdAt: hoursAgo(3) },
      { id: 'm2', authorId: DEMO_ACCOUNTS.seller.id, text: 'Привет! Да, в наличии, могу выдать в течение 5 минут после оплаты.', createdAt: hoursAgo(2.6) },
      { id: 'm3', authorId: 'system', text: 'Оплата получена. Средства заморожены в эскроу до подтверждения сделки.', createdAt: hoursAgo(2.2), system: true },
      { id: 'm4', authorId: DEMO_ACCOUNTS.seller.id, text: 'Отправил данные в зашифрованном виде, ключ внутри. Проверьте и подтвердите получение.', createdAt: hoursAgo(0.5) },
      { id: 'm5', authorId: DEMO_ACCOUNTS.seller.id, text: 'Если что-то не так — открывайте спор, вернём средства.', createdAt: hoursAgo(0.4) },
    ],
  },
  {
    id: 'th_2',
    orderId: ORDERS[3]?.id,
    buyerId: DEMO_ACCOUNTS.buyer.id,
    sellerId: USERS[4].id,
    unread: 0,
    lastMessageAt: daysAgo(2),
    messages: [
      { id: 'm6', authorId: USERS[4].id, text: 'Спасибо за сделку! Если понравится — заглядывайте ещё.', createdAt: daysAgo(2) },
      { id: 'm7', authorId: DEMO_ACCOUNTS.buyer.id, text: 'Спасибо, всё отлично 👍', createdAt: daysAgo(2) },
    ],
  },
  {
    id: 'th_3',
    buyerId: DEMO_ACCOUNTS.buyer.id,
    sellerId: USERS[6].id,
    unread: 1,
    lastMessageAt: daysAgo(5),
    messages: [
      { id: 'm8', authorId: USERS[6].id, text: 'Есть вопрос по совместимости версии — напишите, какая у вас игра.', createdAt: daysAgo(5) },
    ],
  },
]

/* ─────────────────────────────────────────────
   Тарифы Jarvis AI
   ───────────────────────────────────────────── */
export const TARIFFS: Tariff[] = [
  {
    id: 't_start',
    name: 'Start',
    tagline: 'Попробовать всё самое главное',
    price: 0,
    period: 'навсегда',
    cta: 'Скачать бесплатно',
    features: [
      { text: 'Голосовое управление микрофоном', included: true },
      { text: 'Работа без интернета (offline-режим)', included: true },
      { text: '10 команд в день', included: true },
      { text: 'Базовая модель без задержек', included: true },
      { text: 'История команд', included: false },
      { text: 'Приоритетная поддержка', included: false },
    ],
  },
  {
    id: 't_pro',
    name: 'Pro',
    tagline: 'Для тех, кто играет каждый день',
    price: 499,
    oldPrice: 899,
    period: 'в месяц',
    popular: true,
    cta: 'Взять Pro',
    features: [
      { text: 'Всё из Start, без лимитов', included: true },
      { text: 'Unlimited голосовых команд', included: true },
      { text: 'Расширенный контекст игры', included: true },
      { text: 'Мгновенные подсказки по тактике', included: true },
      { text: 'История команд и экспорт', included: true },
      { text: 'Приоритетная поддержка 24/7', included: true },
    ],
  },
  {
    id: 't_ultra',
    name: 'Ultra',
    tagline: 'Максимум производительности',
    price: 1290,
    oldPrice: 1990,
    period: 'в месяц',
    cta: 'Взять Ultra',
    features: [
      { text: 'Всё из Pro', included: true },
      { text: 'Локальная модель на вашем ПК', included: true },
      { text: 'Нулевая задержка отклика', included: true },
      { text: 'Интеграция с платформами VR', included: true },
      { text: 'Ранние фичи и бета-функции', included: true },
      { text: 'Персональный менеджер', included: true },
    ],
  },
]

/* ─────────────────────────────────────────────
   Лендинг: контент (управляется из админки)
   ───────────────────────────────────────────── */
export const LANDING: LandingContent = {
  announcement: 'Версия 3.0 вышла: офлайн-режим, локальная модель и API для модов',
  heroTitle: 'Твой ИИ-клиент в каждой игре',
  heroSubtitle:
    'Jarwis слышит тебя, понимает контекст матча и отвечает за 40 миллисекунд — даже когда интернета нет. Плюс маркетплейс предметов с защитой сделки.',
  promoBanner: {
    title: 'Скидка 45% на Pro до конца недели',
    text: 'Промокод JARWIS45 применяется автоматически при оформлении подписки.',
    cta: 'Забрать скидку',
  },
  stats: [
    { value: 2_400_000, suffix: '+', label: 'игроков пользуются Jarwis' },
    { value: 40, suffix: ' мс', label: 'средняя задержка ответа' },
    { value: 12, suffix: ' млн', label: 'сделок закрыто в эскроу' },
    { value: 4.9, suffix: '/5', label: 'рейтинг на маркетплейсе' },
  ],
}

/* ─────────────────────────────────────────────
   Преимущества ИИ-клиента
   ───────────────────────────────────────────── */
export const AI_FEATURES = [
  {
    emoji: '🎤',
    title: 'Голосовое общение',
    text: 'Просто говорите — микрофон всегда рядом. Wake-слово «Эй, Джарвис» запускает ассистент даже в хаосе матча.',
    metric: 'Распознавание 98 мс',
  },
  {
    emoji: '✈️',
    title: 'Работает без интернета',
    text: 'Локальная модель на вашем устройстве. Играете в метро, в самолёте, в деревне — ассистент отвечает всегда.',
    metric: '100% offline',
  },
  {
    emoji: '⚡',
    title: 'Скорость',
    text: 'Отклик за 40 мс благодаря предиктивной загрузке моделей и оптимизации под ваш CPU и GPU.',
    metric: '40 мс отклик',
  },
  {
    emoji: '🧩',
    title: 'Удобство',
    text: 'Не нужно переключать окна и печатать. Команды голосом работают в любой игре, даже в полноэкранном режиме.',
    metric: '500+ игр',
  },
  {
    emoji: '🔒',
    title: 'Безопасность',
    text: 'Микрофон обрабатывается на устройстве, облако опционально. Никакой записи голоса без вашего согласия.',
    metric: 'E2E шифрование',
  },
  {
    emoji: '🛒',
    title: 'Маркетплейс внутри',
    text: 'Покупка предметов прямо во время игры. Эскроу, рейтинг продавцов и защита от мошенников.',
    metric: 'Эскроу 24/7',
  },
]

/* ─────────────────────────────────────────────
   Отзывы на лендинге
   ───────────────────────────────────────────── */
export const TESTIMONIALS = [
  {
    name: 'Кирилл М.',
    role: 'Капитан команды по CS2',
    avatar: avatarFor('Кирилл М.'),
    rating: 5,
    text: 'Джарвис реально меняет игру. На голос отдаёт инфу по раунду, пока я играю — и не лагает даже на среднем ПК. Окупился за первый вечер.',
  },
  {
    name: 'Марина Д.',
    role: 'Стример, 84K подписчиков',
    avatar: avatarFor('Марина Д.'),
    rating: 5,
    text: 'Веду стримы и постоянно спрашиваю у ассистента зачемодательные советы. Зрители в восторге. Плюс офлайн-режим — в поездках не пропадаю.',
  },
  {
    name: 'Артём С.',
    role: 'Разработчик инди-игры',
    avatar: avatarFor('Артём С.'),
    rating: 5,
    text: 'Интегрировал API Джарвиса в свою игру за вечер. Голосовой ввод и подсказки по прогрессу — то, что хотели игроки с первых плейтестов.',
  },
  {
    name: 'Егор П.',
    role: 'Новичок в Dota 2',
    avatar: avatarFor('Егор П.'),
    rating: 4,
    text: 'Я совсем новичок, и Джарвис объясняет механики простыми словами прямо по ходу игры. Наконец-то перестал гуглить каждый вопрос.',
  },
  {
    name: 'Ника Л.',
    role: 'Продавец на маркетплейсе',
    avatar: avatarFor('Ника Л.'),
    rating: 5,
    text: 'Как продавец на Jarwis я получаю в разы меньше вопросов в личке. Эскроу убирает весь стресс, а отзывы делают репутацию.',
  },
  {
    name: 'Денис Р.',
    role: 'Стример Minecraft',
    avatar: avatarFor('Денис Р.'),
    rating: 5,
    text: 'Покупаю скины прямо на стриме через маркетплейс, зрителям нравится. Сделки защищены, ни разу не было проблем с выдачей.',
  },
]

/* ─────────────────────────────────────────────
   FAQ
   ───────────────────────────────────────────── */
export const FAQ: FaqItem[] = [
  {
    q: 'Как работает голосовое управление?',
    a: 'Jarvis постоянно слушает микрофон в фоновом режиме, но обрабатывает звук только на устройстве. Активация — wake-слово «Эй, Джарвис» или горячая клавиша. Распознавание работает со скоростью 98 мс даже при задержке в интернете 200 мс.',
  },
  {
    q: 'Что происходит, если нет интернета?',
    a: 'Ничего не теряется. В приложении есть компактная локальная модель, которая полностью заменяет облачную в базовых сценариях: голосовые команды, подсказки по инвентарю, чтение с экрана. Подписка Pro расширяет офлайн-возможности локальной моделью на вашем GPU.',
  },
  {
    q: 'Насколько безопасно использовать микрофон?',
    a: 'Аудио-поток шифруется и не покидает устройство при локальной обработке. В облако уходит только обезличенный текст запроса — сырые записи голоса не сохраняются и не используются для обучения без явного согласия. Можно полностью отключить облачные функции одной кнопкой.',
  },
  {
    q: 'Какие игры поддерживаются?',
    a: 'Более 500 популярных игр: от киберспортивных дисциплин (CS2, Dota 2, Valorant) до песочниц (Minecraft, Roblox, Terraria). Для инди-проектов есть открытый API — Jarvis подхватывает интерфейс автоматически.',
  },
  {
    q: 'Как защищены сделки на маркетплейсе?',
    a: 'Все деньги покупателя хранятся в эскроу до подтверждения получения товара. Продавец получает средства только после вашего подтверждения или по истечении таймера автоподтверждения. Если возник спор — деньги возвращаются полностью, а модерация Jarvis рассматривает обращение по данным переписки и защищённой сделки.',
  },
  {
    q: 'Какие способы оплаты доступны?',
    a: 'Карты РФ и СНГ, СБП, криптовалюта (USDT, BTC, ETH), баланс Jarwis и подарочные карты. Все платежи проходят через защищённый шлюз с 3D Secure.',
  },
  {
    q: 'Есть ли версия для мобильных устройств?',
    a: 'Да, доступны приложения для Android и iOS, а также браузерная версия с ограниченным функционалом. Подписка синхронизируется между всеми устройствами.',
  },
  {
    q: 'Можно отменить подписку?',
    a: 'В любой момент в один клик. Оплаченный период до конца сохранится, автоматическое продление просто отключится.',
  },
]

/* ─────────────────────────────────────────────
   Демонстрация работы
   ───────────────────────────────────────────── */
export const DEMO_STEPS = [
  {
    icon: 'mic',
    title: 'Говорите естественно',
    text: '«Эй, Джарвис, сколько у меня золота и что лучше купить?»',
  },
  {
    icon: 'cpu',
    title: 'Локальная модель думает',
    text: 'Запрос распознаётся и обрабатывается на устройстве за 40 мс.',
  },
  {
    icon: 'reply',
    title: 'Полезный ответ в игре',
    text: '«12 480 золота. Бери Клинок Бури — он даёт +18% к урону на боссах.»',
  },
  {
    icon: 'action',
    title: 'Действие в один клик',
    text: '«Открой магазин» — Джарвис подсвечивает нужный раздел интерфейса.',
  },
]

/* ─────────────────────────────────────────────
   Админ-статистика
   ───────────────────────────────────────────── */
export const ADMIN_STATS: AdminStats = {
  labels: Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86_400_000)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
  }),
  revenue: Array.from({ length: 14 }, () => int(120, 980) * 1000),
  signups: Array.from({ length: 14 }, () => int(120, 2400)),
  orders: Array.from({ length: 14 }, () => int(300, 3100)),
}

export const ADMIN_MODERATION = PRODUCTS.filter((p) => p.status === 'moderation')
export const PENDING_REPORTS = [
  { id: 'rep_1', target: 'p_14', reason: 'Подозрение на продажу чужого аккаунта', priority: 'high' as const, createdAt: hoursAgo(2) },
  { id: 'rep_2', target: 'p_31', reason: 'Несоответствие описания и товара', priority: 'medium' as const, createdAt: hoursAgo(6) },
  { id: 'rep_3', target: 'p_58', reason: 'Запрос на оспаривание сделки', priority: 'high' as const, createdAt: hoursAgo(11) },
  { id: 'rep_4', target: 'p_76', reason: 'Спам в описании товара', priority: 'low' as const, createdAt: daysAgo(1) },
]
