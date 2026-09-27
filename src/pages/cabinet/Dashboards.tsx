import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Check,
  CreditCard,
  Heart,
  MessageSquare,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
} from 'lucide-react'
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  Progress,
  Select,
  Textarea,
} from '@/components/ui'
import { Reveal } from '@/components/fx'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { ChatPanel } from '@/components/chat/ChatWidget'
import { api } from '@/api/client'
import { useQuery } from '@/api/useQuery'
import { FEATURED_PRODUCTS, GAMES, ORDERS, TARIFFS } from '@/data/mock'
import { useAuth } from '@/store/auth'
import { useFavorites, useWallet } from '@/store/prefs'
import { useToast } from '@/store/toast'
import { CabinetLayout, OrderStatusBadge, StatCard } from './Layout'
import { cn, money, num, plural, timeAgo } from '@/lib/utils'
import type { Order, Product } from '@/types'
import type { ReactNode } from 'react'

/* ═══════════════════════════════════════════════
   Кабинет покупателя — обзор
   ═══════════════════════════════════════════════ */
export function BuyerDashboard() {
  const { user } = useAuth()
  const { balance } = useWallet()
  const { ids } = useFavorites()
  const { data: fetched } = useQuery<Order[]>(
    () => (user ? api.orders('buyer', user.id) : Promise.resolve([])),
    [user?.id],
  )
  const orders = fetched ?? []

  const active = orders.filter((o) => ['paid', 'in_progress', 'delivered'].includes(o.status))
  // Потрачено = всё, что ушло в сделку (включая активный эскроу)
  const spent = orders.filter((o) => o.status !== 'refunded').reduce((a, o) => a + o.amount, 0)

  return (
    <CabinetLayout mode="buyer" roles={['user', 'seller', 'admin']}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Баланс" value={money(balance)} icon={Wallet} tone="success" />
          <StatCard label="Активных сделок" value={String(active.length)} icon={Package} tone="warn" />
          <StatCard label="Всего покупок" value={String(orders.length)} icon={Check} delta={12} />
          <StatCard label="Потрачено" value={money(spent, { compact: true })} icon={CreditCard} tone="info" delta={8} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Активные сделки */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <h2 className="text-sm font-bold text-white">Активные сделки</h2>
              <Link to="/cabinet/orders" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
                Все заказы
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {active.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={<Package size={22} />}
                    title="Нет активных сделок"
                    text="Все покупки завершены или вы ещё ничего не купили."
                    action={
                      <Link to="/marketplace">
                        <Button size="sm" icon={<Store size={14} />}>
                          В маркетплейс
                        </Button>
                      </Link>
                    }
                  />
                </div>
              ) : (
                active.slice(0, 5).map((o, i) => <OrderRow key={o.id} order={o} index={i} />)
              )}
            </div>
          </div>

          {/* Подписка */}
          <div className="space-y-6">
            <SubscriptionCard />

            <div className="card p-5">
              <h3 className="text-sm font-bold text-white">Избранное</h3>
              <p className="mt-1 text-xs text-white/40">
                {ids.length > 0 ? `${num(ids.length)} товаров сохранено` : 'Пока ничего не сохранено'}
              </p>
              <Link to="/cabinet/favorites" className="mt-4 block">
                <Button variant="ghost" size="sm" full icon={<Heart size={14} />}>
                  Открыть избранное
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Рекомендации */}
        <div>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="h-display text-xl">Рекомендуем вам</h2>
            <Link to="/marketplace" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
              Весь каталог
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURED_PRODUCTS.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} compact />
            ))}
          </div>
        </div>
      </div>
    </CabinetLayout>
  )
}

function SubscriptionCard() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [chosen, setChosen] = useState(TARIFFS[1].id)
  const [loading, setLoading] = useState(false)

  const pay = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1100))
    setLoading(false)
    setOpen(false)
    const t = TARIFFS.find((x) => x.id === chosen)!
    toast.success('Подписка активирована', `${t.name} — оплата прошла, функции уже доступны.`)
  }

  const plan = TARIFFS[1]

  return (
    <>
      <div className="card relative overflow-hidden p-5">
        <span className="absolute inset-x-0 top-0 h-px bg-red-line" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-300">Подписка</p>
            <p className="mt-1.5 h-display text-2xl">Start · бесплатно</p>
          </div>
          <Badge tone="neutral">Активна</Badge>
        </div>

        <div className="mt-4 space-y-2.5">
          {[
            { l: 'Голосовое управление', v: true },
            { l: 'Работа без интернета', v: true },
            { l: 'Лимит команд', v: '10 / день' },
            { l: 'История команд', v: false },
          ].map((r) => (
            <div key={r.l} className="flex items-center justify-between text-xs">
              <span className="text-white/50">{r.l}</span>
              <span className={cn('font-semibold', r.v === true ? 'text-emerald-400' : r.v === false ? 'text-white/25' : 'text-white/75')}>
                {r.v === true ? '✓' : r.v === false ? '—' : r.v}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-[11px] text-white/40">
            <span>Использовано команд</span>
            <span>4 / 10 сегодня</span>
          </div>
          <Progress value={40} />
        </div>

        <Button full className="mt-5" size="sm" onClick={() => setOpen(true)} icon={<Sparkles size={14} />}>
          Перейти на Pro
        </Button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Выбор тарифа">
        <div className="space-y-2.5">
          {TARIFFS.map((t) => (
            <button
              key={t.id}
              onClick={() => setChosen(t.id)}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all duration-300',
                chosen === t.id
                  ? 'border-brand-500/50 bg-brand-500/10'
                  : 'border-white/10 hover:border-white/25',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  chosen === t.id ? 'border-brand-500 bg-brand-500' : 'border-white/20',
                )}
              >
                {chosen === t.id && <Check size={11} strokeWidth={4} className="text-white" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">{t.name}</span>
                <span className="block truncate text-xs text-white/40">{t.tagline}</span>
              </span>
              <span className="shrink-0 text-sm font-bold text-white">
                {t.price === 0 ? 'Бесплатно' : `${money(t.price)}`}
              </span>
            </button>
          ))}
        </div>

        <Button full size="lg" className="mt-6" loading={loading} onClick={pay}>
          Оплатить {plan.name === 'Ultra' ? 'Ultra' : 'выбранный тариф'}
        </Button>
        <p className="mt-3 text-center text-[11px] text-white/30">
          Демо-оплата: реальный платёжный шлюз подключается через VITE_PAYMENT_PROVIDER.
        </p>
      </Modal>
    </>
  )
}

function OrderRow({ order, index }: { order: Order; index: number }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const game = GAMES.find((g) => g.id === order.gameId)

  const confirm = async () => {
    setBusy(true)
    await api.setOrderStatus(order.id, 'confirmed')
    setBusy(false)
    toast.success('Сделка подтверждена', `Заказ ${order.id} завершён, средства переведены продавцу.`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="flex flex-col gap-3 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-white/35">{order.id}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1.5 truncate text-sm font-semibold text-white">{order.productTitle}</p>
        <p className="mt-0.5 text-[11px] text-white/35">
          {game?.title} · {timeAgo(order.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <span className="text-sm font-bold text-white">{money(order.amount)}</span>
        {['paid', 'in_progress', 'delivered'].includes(order.status) && (
          <>
            <Link to="/cabinet/chat" aria-label="Открыть чат">
              <Button variant="ghost" size="sm" className="px-2.5">
                <MessageSquare size={14} />
              </Button>
            </Link>
            <Button size="sm" loading={busy} onClick={confirm} icon={<Check size={13} />}>
              Подтвердить
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   Кабинет продавца — статистика
   ═══════════════════════════════════════════════ */
export function SellerDashboard() {
  const { user } = useAuth()
  const { balance } = useWallet()
  const toast = useToast()
  const [period, setPeriod] = useState('30')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const { data: fetched } = useQuery<Order[]>(
    () => (user ? api.orders('seller', user.id) : Promise.resolve([])),
    [user?.id],
  )
  const orders = fetched ?? []

  const revenue = orders.filter((o) => o.status === 'confirmed').reduce((a, o) => a + o.amount, 0)
  const commission = orders.reduce((a, o) => a + o.commission, 0)
  const pending = orders.filter((o) => ['paid', 'in_progress'].includes(o.status)).reduce((a, o) => a + o.amount, 0)

  // Простая гистограмма по дням
  const chart = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(Date.now() - (13 - i) * 86_400_000)
    const key = day.toDateString()
    const dayOrders = ORDERS.filter((o) => new Date(o.createdAt).toDateString() === key && o.sellerId === user?.id)
    return {
      label: day.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      value: dayOrders.reduce((a, o) => a + o.amount, 0),
    }
  })
  const maxChart = Math.max(1, ...chart.map((c) => c.value))

  return (
    <CabinetLayout mode="seller" roles={['seller', 'admin']}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Выручка за период" value={money(revenue, { compact: true })} icon={Wallet} delta={18} />
          <StatCard label="Заказов" value={String(orders.length)} icon={Package} delta={9} />
          <StatCard label="Средний чек" value={money(Math.round(revenue / Math.max(1, orders.length)), { compact: true })} icon={CreditCard} tone="info" />
          <StatCard label="В ожидании" value={money(pending, { compact: true })} icon={RotateCcw} tone="warn" />
        </div>

        {/* График */}
        <div className="card p-5">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Выручка по дням</h2>
              <p className="mt-0.5 text-xs text-white/40">Последние 14 дней</p>
            </div>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-auto py-2 text-xs"
              aria-label="Период"
            >
              <option value="7">7 дней</option>
              <option value="14">14 дней</option>
              <option value="30">30 дней</option>
              <option value="90">90 дней</option>
            </Select>
          </div>

          <div className="flex h-48 items-end gap-1.5">
            {chart.map((c, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(3, (c.value / maxChart) * 100)}%` }}
                  transition={{ duration: 0.7, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-700/50 to-brand-400 transition-colors group-hover:from-brand-600 group-hover:to-brand-300"
                />
                {c.value > 0 && (
                  <span className="pointer-events-none absolute -top-1 z-10 hidden -translate-y-full whitespace-nowrap rounded-md border border-white/10 bg-ink-950 px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                    {money(c.value, { compact: true })}
                  </span>
                )}
                <span className="mt-1.5 hidden text-[9px] text-white/25 sm:block">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Последние заказы */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <h2 className="text-sm font-bold text-white">Последние заказы</h2>
              <Link to="/cabinet/orders" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
                Все
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {orders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-white/35">{o.id}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{o.productTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{money(o.amount)}</p>
                    <p className="text-[11px] text-white/30">комиссия {money(o.commission)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Выплаты */}
          <div className="space-y-6">
            <div className="card p-5">
              <p className="label">Доступно для вывода</p>
              <p className="h-display text-3xl">{money(balance)}</p>
              <p className="mt-1.5 text-xs text-white/40">
                Комиссия площадки за период: <span className="text-brand-300">{money(commission)}</span>
              </p>

              <Button
                full
                className="mt-5"
                icon={<ArrowUpRight size={15} />}
                onClick={() => setWithdrawOpen(true)}
              >
                Вывести средства
              </Button>

              <div className="mt-4 space-y-2.5">
                {[
                  { icon: ShieldCheck, text: 'Вывод в течение 24 часов' },
                  { icon: Check, text: 'Минимум 500 ₽ для вывода' },
                  { icon: RotateCcw, text: 'Комиссия за вывод — 0%' },
                ].map((r) => (
                  <p key={r.text} className="flex items-center gap-2.5 text-[11px] text-white/40">
                    <r.icon size={12} className="shrink-0 text-brand-400" />
                    {r.text}
                  </p>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-bold text-white">Быстрое действие</h3>
              <p className="mt-1 text-xs text-white/40">Выставите новый лот за пару минут</p>
              <Link to="/cabinet/seller/listings" className="mt-4 block">
                <Button full variant="ghost" size="sm" icon={<Plus size={14} />}>
                  Добавить товар
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Вывод средств">
        <WithdrawForm
          available={balance}
          onDone={() => {
            setWithdrawOpen(false)
            toast.success('Заявка на вывод создана', 'Средства поступят в течение 24 часов.')
          }}
        />
      </Modal>
    </CabinetLayout>
  )
}

function WithdrawForm({ available, onDone }: { available: number; onDone: () => void }) {
  const [amount, setAmount] = useState(Math.min(available, 5000))
  const [method, setMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const enough = amount >= 500 && amount <= available

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enough) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    onDone()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="label">Сумма вывода</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="field"
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => setAmount(available)} className="shrink-0">
            Всё
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-white/35">Доступно: {money(available)} · минимум 500 ₽</p>
        {!enough && <p className="mt-1 text-xs font-medium text-brand-400">Сумма вне допустимого диапазона</p>}
      </div>

      <Select label="Способ получения" value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="card">Банковская карта</option>
        <option value="sbp">СБП по номеру телефона</option>
        <option value="crypto">USDT (TRC-20)</option>
        <option value="jarvis">Баланс Jarwis</option>
      </Select>

      <Textarea label="Реквизиты" rows={2} placeholder="Номер карты / телефона / кошелька" className="font-mono text-xs" />

      <Button type="submit" full size="lg" loading={loading} disabled={!enough}>
        Вывести {money(amount)}
      </Button>
    </form>
  )
}

/* ═══════════════════════════════════════════════
   Мои лоты (создание и управление)
   ═══════════════════════════════════════════════ */
export function SellerListings() {
  const { user } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const { data: fetched } = useQuery<Product[]>(
    async () => (await api.products({ perPage: 96 })).items.filter((p) => user && p.sellerId === user.id),
    [user?.id],
  )
  const items = fetched ?? []

  const setStatus = async (p: Product, status: Product['status']) => {
    try {
      await api.updateProduct(p.id, {
        status,
        inStock: status === 'sold_out' ? 0 : Math.max(1, p.inStock),
      })
      toast.success(
        status === 'active' ? 'Лот снова в продаже' : 'Лот снят с продажи',
        `«${p.title}» обновлён.`,
      )
    } catch {
      toast.error('Не удалось обновить лот', 'Попробуйте ещё раз.')
    }
  }

  return (
    <CabinetLayout mode="seller" roles={['seller', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="h-display text-2xl">Мои лоты</h2>
            <p className="mt-1 text-sm text-white/40">
              Активных: {items.filter((i) => i.status === 'active').length} из {items.length}
            </p>
          </div>
          <Button onClick={() => setOpen(true)} icon={<Plus size={15} />}>
            Добавить товар
          </Button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<Store size={24} />}
            title="У вас пока нет лотов"
            text="Выставите первый товар — модерация проверит его за несколько минут."
            action={<Button onClick={() => setOpen(true)} icon={<Plus size={15} />}>Добавить товар</Button>}
          />
        ) : (
          <div className="space-y-2.5">
            {items.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
              >
                <div
                  className={cn(
                    'flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl',
                    p.preview,
                  )}
                >
                  {p.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/product/${p.id}`}
                      className="truncate text-sm font-bold text-white hover:text-brand-300"
                    >
                      {p.title}
                    </Link>
                    <Badge tone={p.status === 'active' ? 'success' : p.status === 'moderation' ? 'warn' : 'neutral'}>
                      {p.status === 'active' ? 'В продаже' : p.status === 'moderation' ? 'На модерации' : 'Снят'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-white/40">
                    {num(p.sold)} продаж · {num(p.reviewsCount)} отзывов · рейтинг {p.rating}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:flex-col sm:items-end">
                  <span className="h-display text-lg">{money(p.price)}</span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => setStatus(p, p.status === 'active' ? 'sold_out' : 'active')}
                    >
                      {p.status === 'active' ? 'Снять' : 'Вернуть'}
                    </Button>
                    <Link to="/cabinet/seller/listings">
                      <Button variant="ghost" size="sm" className="px-2.5">
                        <ArrowUpRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Новый лот" size="lg">
        <NewListingForm
          onDone={(p) => {
            setOpen(false)
            toast.success('Лот отправлен на модерацию', `«${p.title}» появится в каталоге после проверки.`)
          }}
        />
      </Modal>
    </CabinetLayout>
  )
}

function NewListingForm({ onDone }: { onDone: (p: Product) => void }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [gameId, setGameId] = useState(GAMES[0].id)
  const [category, setCategory] = useState('skins')
  const [price, setPrice] = useState(1500)
  const [description, setDescription] = useState('')
  const [instant, setInstant] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim().length < 5) {
      setError('Название должно содержать минимум 5 символов')
      return
    }
    if (description.trim().length < 20) {
      setError('Опишите товар подробнее — минимум 20 символов')
      return
    }
    if (price < 10) {
      setError('Минимальная цена — 10 ₽')
      return
    }
    setError('')
    setLoading(true)

    const game = GAMES.find((g) => g.id === gameId)!
    try {
      const product = await api.createProduct({
        title: title.trim(),
        gameId,
        category: category as Product['category'],
        price,
        sellerId: user?.id ?? 'u_s1',
        rating: 0,
        reviewsCount: 0,
        preview: 'from-brand-600/40 to-brand-900/10',
        emoji: game.emoji,
        description: description.trim(),
        features: ['Мгновенная доставка', 'Гарантия возврата 14 дней', 'Передача в защищённом чате'],
        deliveryMinutes: instant ? 5 : 1440,
        warrantyDays: 14,
        instantDelivery: instant,
        inStock: 50,
        tags: [category, game.slug],
      })
      onDone(product)
    } catch {
      setError('Не удалось создать лот. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Название товара"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Например: Аккаунт Rare · CS2"
        error={error && title.trim().length < 5 ? error : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Игра" value={gameId} onChange={(e) => setGameId(e.target.value)}>
          {GAMES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.emoji} {g.title}
            </option>
          ))}
        </Select>
        <Select label="Категория" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="accounts">Аккаунты</option>
          <option value="skins">Скины</option>
          <option value="currency">Валюта</option>
          <option value="boosts">Бусты</option>
          <option value="items">Предметы</option>
          <option value="keys">Ключи</option>
          <option value="services">Услуги</option>
        </Select>
      </div>

      <Input
        label="Цена, ₽"
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value) || 0)}
        hint="Комиссия 5% удерживается автоматически при продаже"
      />

      <Textarea
        label="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder="Что входит в товар, условия передачи, важные нюансы…"
      />

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/60">
        <input
          type="checkbox"
          checked={instant}
          onChange={(e) => setInstant(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-ink-900 accent-brand-500"
        />
        Мгновенная доставка (выдача до 5 минут)
      </label>

      {error && !title.trim() && <p className="text-xs text-brand-400">{error}</p>}

      <Button type="submit" full size="lg" loading={loading}>
        Отправить на модерацию
      </Button>
    </form>
  )
}

/* ═══════════════════════════════════════════════
   Заказы (общая страница)
   ═══════════════════════════════════════════════ */
export function OrdersPage() {
  const { user } = useAuth()
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [filter, setFilter] = useState('all')
  const { data: fetched, loading } = useQuery<Order[]>(
    () => (user ? api.orders(role, user.id) : Promise.resolve([])),
    [user?.id, role],
  )
  const orders = fetched ?? []

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <CabinetLayout mode={role === 'buyer' ? 'buyer' : 'seller'} roles={['user', 'seller', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="h-display text-2xl">Заказы</h2>
            <p className="mt-1 text-sm text-white/40">Всего: {num(orders.length)}</p>
          </div>
          <div className="flex gap-2">
            {(['buyer', 'seller'] as const).map((r) => (
              <Button
                key={r}
                variant={role === r ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRole(r)}
              >
                {r === 'buyer' ? 'Как покупатель' : 'Как продавец'}
              </Button>
            ))}
          </div>
        </div>

        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Все' },
            { id: 'paid', label: 'В эскроу' },
            { id: 'in_progress', label: 'В работе' },
            { id: 'confirmed', label: 'Завершённые' },
            { id: 'dispute', label: 'Споры' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'shrink-0 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors',
                filter === f.id
                  ? 'border-brand-500/50 bg-brand-500/12 text-brand-300'
                  : 'border-white/10 text-white/45 hover:text-white/80',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Package size={24} />} title="Заказов нет" text="В этом статусе сейчас пусто." />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((o, i) => (
              <OrderRow key={o.id} order={o} index={i} />
            ))}
          </div>
        )}
      </div>
    </CabinetLayout>
  )
}

/* ═══════════════════════════════════════════════
   Избранное
   ═══════════════════════════════════════════════ */
export function Favorites() {
  const { ids } = useFavorites()
  const { data: fetched, loading } = useQuery<Product[]>(
    async () =>
      ids.length === 0
        ? []
        : (await Promise.all(ids.map((id) => api.product(id)))).filter((p): p is Product => Boolean(p)),
    [ids.join(',')],
  )
  const items = fetched ?? []

  return (
    <CabinetLayout mode="buyer" roles={['user', 'seller', 'admin']}>
      <div className="space-y-6">
        <div>
          <h2 className="h-display text-2xl">Избранное</h2>
          <p className="mt-1 text-sm text-white/40">
            {loading ? 'Загружаем…' : `${num(items.length)} ${plural(items.length, ['товар', 'товара', 'товаров'])}`}
          </p>
        </div>

        {!loading && items.length === 0 ? (
          <EmptyState
            icon={<Heart size={24} />}
            title="Здесь пока пусто"
            text="Нажимайте на сердечко в карточке товара, чтобы вернуться к нему позже."
            action={
              <Link to="/marketplace">
                <Button icon={<Store size={15} />}>В маркетплейс</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </CabinetLayout>
  )
}

/* ═══════════════════════════════════════════════
   Кошелёк
   ═══════════════════════════════════════════════ */
const TOPUP_AMOUNTS = [500, 1000, 2500, 5000, 10_000]

export function WalletPage() {
  const { user } = useAuth()
  const { balance, topUp, pending } = useWallet()
  const toast = useToast()
  const [amount, setAmount] = useState(1000)
  const [method, setMethod] = useState('card')
  const { data: fetched } = useQuery<Order[]>(
    () => (user ? api.orders('buyer', user.id) : Promise.resolve([])),
    [user?.id],
  )

  // История кошелька — реальные заказы пользователя, а не общая витрина
  const history = [...(fetched ?? [])].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  )

  const doTopUp = async () => {
    await topUp(amount)
    toast.success('Баланс пополнен', `На счёт зачислено ${money(amount)}.`)
  }

  return (
    <CabinetLayout mode="buyer" roles={['user', 'seller', 'admin']}>
      <div className="space-y-6">
        <div className="card relative overflow-hidden p-6">
          <span className="absolute inset-x-0 top-0 h-px bg-red-line" />
          <p className="label">Доступно на балансе</p>
          <p className="h-display text-4xl sm:text-5xl">{money(balance)}</p>
          <p className="mt-2 text-sm text-white/40">Один баланс для подписки, покупок и вывода средств</p>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-bold text-white">Пополнить баланс</h3>

          <div className="mt-5 flex flex-wrap gap-2">
            {TOPUP_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={cn(
                  'rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300',
                  amount === a
                    ? 'border-brand-500/50 bg-brand-500/12 text-brand-300'
                    : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white',
                )}
              >
                {money(a)}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <p className="label">Своя сумма</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="field"
            />
          </div>

          <div className="mt-5">
            <p className="label">Способ оплаты</p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {[
                { id: 'card', label: 'Банковская карта', icon: CreditCard },
                { id: 'sbp', label: 'СБП', icon: Wallet },
                { id: 'crypto', label: 'USDT', icon: Sparkles },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border p-3.5 text-left text-sm font-semibold transition-all duration-300',
                    method === m.id
                      ? 'border-brand-500/50 bg-brand-500/12 text-brand-300'
                      : 'border-white/10 text-white/55 hover:border-white/25',
                  )}
                >
                  <m.icon size={16} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Button full size="lg" className="mt-6" loading={pending} onClick={doTopUp} disabled={amount <= 0}>
            Пополнить на {money(amount)}
          </Button>

          <p className="mt-3 text-center text-[11px] text-white/30">
            Демо-режим: реальный платёжный шлюз подключается через VITE_PAYMENT_PROVIDER
          </p>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-white/8 px-5 py-4">
            <h3 className="text-sm font-bold text-white">История операций</h3>
          </div>
          <div className="divide-y divide-white/5">
            {history.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={<CreditCard size={22} />}
                  title="Операций пока нет"
                  text="Пополнения и покупки появятся здесь сразу после первой операции."
                />
              </div>
            ) : (
              history.map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{o.productTitle}</p>
                    <p className="mt-0.5 text-[11px] text-white/35">
                      {o.id} · {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <span className={cn('text-sm font-bold', o.status === 'refunded' ? 'text-emerald-400' : 'text-white')}>
                    {o.status === 'refunded' ? '+' : '−'}
                    {money(o.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </CabinetLayout>
  )
}

/* ═══════════════════════════════════════════════
   Страница чатов (полная)
   ═══════════════════════════════════════════════ */
export function ChatPage() {
  return (
    <CabinetLayout mode="buyer" roles={['user', 'seller', 'admin']}>
      <div className="space-y-6">
        <div>
          <h2 className="h-display text-2xl">Сообщения</h2>
          <p className="mt-1 text-sm text-white/40">Защищённый чат по сделкам — данные передаются только здесь</p>
        </div>
        <div className="card flex h-[min(38rem,calc(100vh-17rem))] min-h-[26rem] flex-col overflow-hidden">
          <ChatPanel showAllLink />
        </div>
      </div>
    </CabinetLayout>
  )
}

/* ═══════════════════════════════════════════════
   Заглушка вывода средств
   ═══════════════════════════════════════════════ */
export function Payouts() {
  return (
    <CabinetLayout mode="seller" roles={['seller', 'admin']}>
      <div className="space-y-6">
        <div>
          <h2 className="h-display text-2xl">Вывод средств</h2>
          <p className="mt-1 text-sm text-white/40">История выплат и реквизиты</p>
        </div>
        <EmptyState
          icon={<Wallet size={24} />}
          title="История выплат"
          text="Здесь появятся все завершённые выплаты. Первый вывод обычно обрабатывается до 24 часов."
          action={
            <Button variant="ghost" onClick={() => undefined}>
              Добавить реквизиты
            </Button>
          }
        />
      </div>
    </CabinetLayout>
  )
}

export { Reveal, type ReactNode }
