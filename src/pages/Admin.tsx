import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  Ban,
  BadgeCheck,
  BarChart3,
  Bell,
  Check,
  Flag,
  LayoutGrid,
  Megaphone,
  Percent,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingUp,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { Avatar, Badge, Button, EmptyState, Input, Modal, Progress, Select, Switch, Tabs, Textarea } from '@/components/ui'
import { Reveal } from '@/components/fx'
import { api } from '@/api/client'
import { useQuery } from '@/api/useQuery'
import { CATEGORIES, GAMES, PENDING_REPORTS, USERS } from '@/data/mock'
import { useAuth } from '@/store/auth'
import { cn, money, num, timeAgo } from '@/lib/utils'
import type { AdminStats, IconType, Product, User } from '@/types'

const TABS = [
  { value: 'overview', label: 'Обзор', icon: LayoutGrid },
  { value: 'users', label: 'Пользователи', icon: Users },
  { value: 'moderation', label: 'Модерация', icon: ShieldCheck },
  { value: 'catalog', label: 'Категории', icon: ShoppingBag },
  { value: 'content', label: 'Контент', icon: Megaphone },
  { value: 'finance', label: 'Финансы', icon: Wallet },
] as const

type TabValue = (typeof TABS)[number]['value']

/* ─────────────────────────────────────────────
   Обёртка
   ───────────────────────────────────────────── */
export function Admin() {
  const { user, hasRole } = useAuth()
  const [tab, setTab] = useState<TabValue>('overview')
  const { data: stats } = useQuery<AdminStats>(() => api.adminStats(), [])
  const [commission, setCommission] = useState(5)
  const [notif, setNotif] = useState('')

  useEffect(() => {
    if (!notif) return
    const t = setTimeout(() => setNotif(''), 3500)
    return () => clearTimeout(t)
  }, [notif])

  if (!user) return <Navigate to="/login?next=/admin" replace />
  if (!hasRole('admin')) {
    return (
      <div className="shell py-20">
        <EmptyState
          icon={<Shield size={24} />}
          title="Доступ запрещён"
          text="Раздел доступен только администраторам Jarwis. Войдите под аккаунтом с ролью администратора."
          action={
            <Link to="/login">
              <Button>Войти</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Шапка */}
      <div className="border-b border-white/8 bg-ink-900/50">
        <div className="shell py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                <Shield size={22} />
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="h-display text-2xl sm:text-3xl">Админ-панель</h1>
                  <Badge tone="danger">Admin</Badge>
                </div>
                <p className="mt-1 text-sm text-white/45">
                  Управление платформой Jarwis · {new Date().toLocaleDateString('ru-RU', { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <StatPill icon={Users} label="Пользователей" value={num(USERS.length + 24_180)} />
              <StatPill icon={ShoppingBag} label="Товаров" value={num(48_200)} />
              <StatPill icon={TrendingUp} label="GMV за месяц" value="84.2M ₽" />
            </div>
          </div>
        </div>
      </div>

      <div className="shell py-8">
        {/* Табы */}
        <div className="no-scrollbar mb-7 flex gap-1.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-300',
                tab === t.value ? 'text-white' : 'text-white/45 hover:text-white/80',
              )}
            >
              {tab === t.value && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-0 -z-10 rounded-xl bg-brand-500/12 ring-1 ring-brand-500/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <t.icon size={15} />
              {t.label}
              {t.value === 'moderation' && PENDING_REPORTS.length > 0 && (
                <span className="rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                  {PENDING_REPORTS.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {tab === 'overview' && <Overview stats={stats} />}
            {tab === 'users' && <UsersAdmin onNotify={setNotif} />}
            {tab === 'moderation' && <Moderation onNotify={setNotif} />}
            {tab === 'catalog' && <CatalogAdmin onNotify={setNotif} />}
            {tab === 'content' && <ContentAdmin onNotify={setNotif} />}
            {tab === 'finance' && <FinanceAdmin commission={commission} setCommission={setCommission} onNotify={setNotif} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Уведомление */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-5 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/12 px-4 py-3 text-sm font-semibold text-emerald-200 backdrop-blur-xl"
          >
            <Check size={16} />
            {notif}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-ink-900/60 px-3.5 py-2.5">
      <Icon size={16} className="text-brand-400" />
      <div>
        <p className="text-[10px] text-white/35">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Обзор
   ═══════════════════════════════════════════════ */
function Overview({ stats }: { stats: AdminStats | null }) {
  const totals = useMemo(() => {
    if (!stats) return { revenue: 0, signups: 0, orders: 0 }
    return {
      revenue: stats.revenue.reduce((a, b) => a + b, 0),
      signups: stats.signups.reduce((a, b) => a + b, 0),
      orders: stats.orders.reduce((a, b) => a + b, 0),
    }
  }, [stats])

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Выручка за 14 дней"
          value={stats ? money(totals.revenue, { compact: true }) : '—'}
          delta={14.2}
          icon={Wallet}
        />
        <KpiCard
          label="Новых пользователей"
          value={stats ? num(totals.signups) : '—'}
          delta={8.7}
          icon={UserPlus}
          tone="info"
        />
        <KpiCard
          label="Заказов"
          value={stats ? num(totals.orders) : '—'}
          delta={21.3}
          icon={ShoppingBag}
          tone="success"
        />
        <KpiCard
          label="Средний чек"
          value={stats ? money(Math.round(totals.revenue / Math.max(1, totals.orders))) : '—'}
          delta={-2.1}
          icon={BarChart3}
          tone="warn"
        />
      </div>

      {/* Графики */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-white">Выручка и заказы</h2>
          <p className="mt-0.5 text-xs text-white/40">Динамика за последние 14 дней</p>

          {stats ? (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.labels.map((l, i) => ({ label: l, revenue: stats.revenue[i], orders: stats.orders[i] }))}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f4f" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#f43f4f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} width={38} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#f43f4f" strokeWidth={2} fill="url(#gRev)" />
                  <Area type="monotone" dataKey="orders" stroke="#38bdf8" strokeWidth={2} fill="url(#gOrd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="skeleton mt-6 h-64 w-full" />
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-white">Регистрации</h2>
          <p className="mt-0.5 text-xs text-white/40">Новых аккаунтов в день</p>

          {stats ? (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.labels.map((l, i) => ({ label: l, signups: stats.signups[i] }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} width={34} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="signups" fill="#f43f4f" radius={[4, 4, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="skeleton mt-6 h-64 w-full" />
          )}
        </div>
      </div>

      {/* Активность */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-white">Топ игр по выручке</h2>
          <div className="mt-5 space-y-4">
            {GAMES.slice(0, 6).map((g, i) => {
              const value = 100 - i * 13
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex items-center gap-2.5 text-xs">
                    <span className="text-base">{g.emoji}</span>
                    <span className="flex-1 truncate font-semibold text-white">{g.title}</span>
                    <span className="font-mono text-white/50">{money(100_000 + i * 87_000, { compact: true })}</span>
                  </div>
                  <Progress value={value} tone={i < 2 ? 'brand' : i < 4 ? 'warn' : 'success'} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-white">События платформы</h2>
          <div className="mt-4 space-y-3">
            {[
              { icon: UserPlus, text: '124 новых пользователя за последние 24 часа', time: '5 мин назад', tone: 'text-sky-400' },
              { icon: AlertTriangle, text: '3 жалобы на товары ожидают рассмотрения', time: '12 мин назад', tone: 'text-gold-400' },
              { icon: Wallet, text: 'Выплаты продавцам за вчера: 1.24M ₽', time: '1 ч назад', tone: 'text-emerald-400' },
              { icon: Shield, text: 'Автобан сработал на 2 аккаунта', time: '3 ч назад', tone: 'text-brand-400' },
              { icon: Megaphone, text: 'Акция «−45% на Pro» активна', time: '6 ч назад', tone: 'text-brand-300' },
            ].map((e) => (
              <div key={e.text} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.02] p-3">
                <e.icon size={15} className={cn('mt-0.5 shrink-0', e.tone)} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed text-white/70">{e.text}</p>
                  <p className="mt-0.5 text-[10px] text-white/30">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = 'brand',
}: {
  label: string
  value: string
  delta: number
  icon: IconType
  tone?: 'brand' | 'info' | 'success' | 'warn'
}) {
  const tones = {
    brand: 'from-brand-500/20 to-brand-700/5 text-brand-400 ring-brand-500/20',
    info: 'from-sky-500/20 to-sky-700/5 text-sky-400 ring-sky-500/20',
    success: 'from-emerald-500/20 to-emerald-700/5 text-emerald-400 ring-emerald-500/20',
    warn: 'from-gold-400/20 to-gold-600/5 text-gold-400 ring-gold-400/20',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="card card-hover p-5"
    >
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1', tones[tone])}>
          <Icon size={17} />
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[11px] font-bold',
            delta >= 0 ? 'bg-emerald-500/12 text-emerald-300' : 'bg-brand-500/12 text-brand-300',
          )}
        >
          {delta >= 0 ? '+' : ''}
          {delta}%
        </span>
      </div>
      <p className="mt-4 text-xs text-white/40">{label}</p>
      <p className="mt-1 h-display text-2xl">{value}</p>
    </motion.div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/95 px-3 py-2 shadow-glow backdrop-blur-xl">
      <p className="mb-1 text-[10px] font-semibold text-white/40">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name === 'revenue'
            ? money(p.value, { compact: true })
            : p.name === 'orders'
              ? `${num(p.value)} шт`
              : num(p.value)}
        </p>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Пользователи
   ═══════════════════════════════════════════════ */
function UsersAdmin({ onNotify }: { onNotify: (s: string) => void }) {
  const { data: fetched } = useQuery<User[]>(() => api.users(), [])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editing, setEditing] = useState<User | null>(null)
  const users = fetched ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter(
      (u) =>
        (roleFilter === 'all' || u.role === roleFilter) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    )
  }, [users, query, roleFilter])

  const patch = async (u: User, changes: Partial<User>, message: string) => {
    try {
      await api.updateUser(u.id, changes)
      onNotify(message)
    } catch {
      onNotify('Не удалось сохранить изменения')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени или email…"
          icon={<Search size={15} />}
          className="sm:max-w-xs"
        />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:w-44">
          <option value="all">Все роли</option>
          <option value="user">Покупатели</option>
          <option value="seller">Продавцы</option>
          <option value="admin">Администраторы</option>
        </Select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-white/8 bg-white/[0.02]">
              <tr>
                {['Пользователь', 'Роль', 'Рейтинг', 'Сделок', 'Регистрация', 'Действия'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white/35">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.id} className={cn('transition-colors hover:bg-white/[0.02]', u.banned && 'opacity-50')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size={34} />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-semibold text-white">
                          {u.name}
                          {u.verified && <BadgeCheck size={13} className="shrink-0 text-sky-400" />}
                          {u.banned && <Ban size={13} className="shrink-0 text-brand-400" />}
                        </p>
                        <p className="truncate text-[11px] text-white/35">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.role === 'admin' ? 'danger' : u.role === 'seller' ? 'brand' : 'neutral'}>
                      {u.role === 'admin' ? 'Админ' : u.role === 'seller' ? 'Продавец' : 'Покупатель'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-white/75">{u.rating || '—'}</td>
                  <td className="px-4 py-3 font-mono text-white/75">{num(u.dealsCount)}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{timeAgo(u.registeredAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Button variant="subtle" size="sm" className="px-2.5" onClick={() => setEditing(u)} aria-label="Роли">
                        <UserCog size={13} />
                      </Button>
                      <Button
                        variant={u.verified ? 'subtle' : 'ghost'}
                        size="sm"
                        className="px-2.5"
                        onClick={() =>
                          patch(u, { verified: !u.verified }, u.verified ? 'Верификация снята' : 'Пользователь верифицирован')
                        }
                        aria-label="Верификация"
                      >
                        <BadgeCheck size={13} />
                      </Button>
                      <Button
                        variant={u.banned ? 'ghost' : 'danger'}
                        size="sm"
                        className="px-2.5"
                        onClick={() => patch(u, { banned: !u.banned }, u.banned ? 'Пользователь разбанен' : 'Пользователь заблокирован')}
                        aria-label="Бан"
                      >
                        {u.banned ? <Check size={13} /> : <Ban size={13} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/8 px-4 py-3 text-xs text-white/35">
          Показано {num(filtered.length)} из {num(users.length)}
        </div>
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Роли и права">
        {editing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <Avatar src={editing.avatar} name={editing.name} size={44} />
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{editing.name}</p>
                <p className="truncate text-xs text-white/40">{editing.email}</p>
              </div>
            </div>

            <Select
              label="Роль"
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value as User['role'] })}
            >
              <option value="user">Покупатель</option>
              <option value="seller">Продавец</option>
              <option value="admin">Администратор</option>
            </Select>

            <div className="space-y-3 border-t border-white/8 pt-4">
              <Switch
                checked={editing.verified}
                onChange={(v) => setEditing({ ...editing, verified: v })}
                label="Верифицирован"
                hint="Показывать галочку рядом с именем"
              />
              <Switch
                checked={editing.banned}
                onChange={(v) => setEditing({ ...editing, banned: v })}
                label="Заблокирован"
                hint="Запретить вход и сделки"
              />
            </div>

            <Button
              full
              onClick={async () => {
                await patch(editing, { role: editing.role, verified: editing.verified, banned: editing.banned }, 'Изменения сохранены')
                setEditing(null)
              }}
            >
              Сохранить
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Модерация
   ═══════════════════════════════════════════════ */
function Moderation({ onNotify }: { onNotify: (s: string) => void }) {
  const [reports, setReports] = useState(PENDING_REPORTS)
  const { data: fetched } = useQuery<Product[]>(
    async () => (await api.products({ perPage: 96 })).items.filter((p) => p.status === 'moderation'),
    [],
  )
  const items = fetched ?? []

  const resolve = (id: string, action: 'approved' | 'rejected') => {
    setReports((prev) => prev.filter((r) => r.id !== id))
    onNotify(action === 'approved' ? 'Жалоба отклонена, товар восстановлен' : 'Товар заблокирован')
  }

  const moderate = async (p: Product, status: Product['status'], message: string) => {
    try {
      await api.updateProduct(p.id, { status })
      onNotify(message)
    } catch {
      onNotify('Не удалось изменить статус товара')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Жалобы */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Flag size={16} className="text-brand-400" />
            <h2 className="text-sm font-bold text-white">Жалобы</h2>
            <Badge tone="danger">{reports.length}</Badge>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {reports.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={<Check size={22} />} title="Жалоб нет" text="Все обращения рассмотрены." />
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      r.priority === 'high' ? 'bg-brand-500/15 text-brand-400' : r.priority === 'medium' ? 'bg-gold-400/15 text-gold-400' : 'bg-white/8 text-white/45',
                    )}
                  >
                    <AlertTriangle size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{r.reason}</p>
                    <p className="mt-0.5 text-[11px] text-white/35">
                      Товар {r.target} · {timeAgo(r.createdAt)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => resolve(r.id, 'approved')}>
                        Отклонить жалобу
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => resolve(r.id, 'rejected')}>
                        Заблокировать
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Товары на модерации */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-gold-400" />
            <h2 className="text-sm font-bold text-white">Ожидают проверки</h2>
            <Badge tone="warn">{items.length}</Badge>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {items.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={<Check size={22} />} title="Очередь пуста" text="Все товары проверены." />
            </div>
          ) : (
            items.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl', p.preview)}>
                  {p.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${p.id}`} className="block truncate text-sm font-semibold text-white hover:text-brand-300">
                    {p.title}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    {money(p.price)} · добавлен {timeAgo(p.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void moderate(p, 'active', 'Товар одобрен и опубликован')}
                    aria-label="Одобрить"
                  >
                    <Check size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => void moderate(p, 'banned', 'Товар отклонён')}
                    aria-label="Отклонить"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Категории и игры
   ═══════════════════════════════════════════════ */
function CatalogAdmin({ onNotify }: { onNotify: (s: string) => void }) {
  const [tab, setTab] = useState<'games' | 'categories'>('games')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  return (
    <div className="space-y-5">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'games', label: 'Игры', badge: <Badge tone="neutral">{GAMES.length}</Badge> },
          { value: 'categories', label: 'Категории', badge: <Badge tone="neutral">{CATEGORIES.length}</Badge> },
        ]}
      />

      {tab === 'games' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => (
            <div key={g.id} className="card flex items-center gap-3.5 p-4">
              <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl', g.gradient)}>
                {g.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{g.title}</p>
                <p className="text-[11px] text-white/35">
                  {num(g.productsCount)} лотов · {g.players}
                </p>
              </div>
              <Button
                variant="subtle"
                size="sm"
                className="px-2.5"
                onClick={() => onNotify(`Игра «${g.title}» отредактирована`)}
                aria-label="Изменить"
              >
                <Settings size={13} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <div key={c.id} className="card flex items-center gap-3.5 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-xl">
                {c.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{c.title}</p>
                <p className="truncate text-[11px] text-white/35">{c.hint}</p>
              </div>
              <div className="flex gap-1.5">
                <Button variant="subtle" size="sm" className="px-2.5" onClick={() => onNotify(`Категория «${c.title}» отредактирована`)} aria-label="Изменить">
                  <Settings size={13} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="px-2.5"
                  onClick={() => onNotify(`Категория «${c.title}» удалена`)}
                  aria-label="Удалить"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="ghost" icon={<LayoutGrid size={15} />} onClick={() => setAdding(true)}>
        Добавить {tab === 'games' ? 'игру' : 'категорию'}
      </Button>

      <Modal open={adding} onClose={() => setAdding(false)} title={tab === 'games' ? 'Новая игра' : 'Новая категория'}>
        <div className="space-y-4">
          <Input label="Название" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название" />
          <Button
            full
            onClick={() => {
              onNotify(`«${newName || 'Без названия'}» добавлен${newName ? 'о' : 'о'} в список`)
              setNewName('')
              setAdding(false)
            }}
          >
            Добавить
          </Button>
        </div>
      </Modal>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Контент лендинга
   ═══════════════════════════════════════════════ */
function ContentAdmin({ onNotify }: { onNotify: (s: string) => void }) {
  const [hero, setHero] = useState('Твой ИИ-клиент в каждой игре')
  const [subtitle, setSubtitle] = useState(
    'Jarvis слышит тебя, понимает контекст матча и отвечает за 40 миллисекунд — даже когда интернета нет.',
  )
  const [banner, setBanner] = useState('Скидка 45% на Pro до конца недели')
  const [promo, setPromo] = useState(true)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-white">Hero-блок</h2>
          <div className="mt-4 space-y-4">
            <Input label="Заголовок" value={hero} onChange={(e) => setHero(e.target.value)} />
            <Textarea label="Подзаголовок" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2.5">
            <Megaphone size={16} className="text-brand-400" />
            <h2 className="text-sm font-bold text-white">Акция</h2>
          </div>
          <div className="mt-4 space-y-4">
            <Input label="Текст баннера" value={banner} onChange={(e) => setBanner(e.target.value)} />
            <div className="border-t border-white/8 pt-4">
              <Switch
                checked={promo}
                onChange={setPromo}
                label="Показывать промо-баннер"
                hint="Будет виден на главной странице и в шапке сайта"
              />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className="text-gold-400" />
            <h2 className="text-sm font-bold text-white">Рассылка</h2>
          </div>
          <Textarea
            label="Текст уведомления"
            rows={3}
            className="mt-4"
            defaultValue="Плановое обслуживание 20 авг с 03:00 до 05:00 МСК. Ожидайте перебоев в работе маркетплейса."
          />
          <Button className="mt-4" size="sm" onClick={() => onNotify('Уведомление отправлено 24 180 пользователям')}>
            Отправить всем
          </Button>
        </div>

        <Button onClick={() => onNotify('Изменения на лендинге сохранены и опубликованы')}>
          Сохранить и опубликовать
        </Button>
      </div>

      {/* Превью */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="label">Предпросмотр</p>
        <div className="card overflow-hidden p-5">
          {promo && (
            <div className="mb-4 rounded-lg bg-gradient-to-r from-brand-900/60 to-brand-700/30 px-3 py-1.5 text-center text-[11px] font-semibold text-brand-100">
              {banner}
            </div>
          )}
          <h3 className="h-display text-2xl leading-tight">{hero}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/50">{subtitle}</p>
          <div className="mt-5 flex gap-2">
            <span className="btn-primary shine btn-sm pointer-events-none">Купить Jarwis</span>
            <span className="btn-ghost btn-sm pointer-events-none">В маркетплейс</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Финансы
   ═══════════════════════════════════════════════ */
function FinanceAdmin({
  commission,
  setCommission,
  onNotify,
}: {
  commission: number
  setCommission: (n: number) => void
  onNotify: (s: string) => void
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-5">
        <div className="flex items-center gap-2.5">
          <Percent size={16} className="text-brand-400" />
          <h2 className="text-sm font-bold text-white">Комиссия платформы</h2>
        </div>

        <div className="mt-5">
          <p className="label">Размер комиссии, %</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-brand-500"
            />
            <span className="h-display w-20 text-right text-2xl">{commission}%</span>
          </div>
        </div>

        <div className="mt-6 space-y-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          {[
            ['Средний чек покупки', 2400],
            ['Комиссия с заказа', Math.round(2400 * (commission / 100))],
            ['Заказов в месяц', 18_400],
            ['Доход платформы', Math.round(2400 * (commission / 100) * 18_400)],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-center justify-between text-xs">
              <span className="text-white/45">{label}</span>
              <span className="font-bold text-white">{money(Number(value))}</span>
            </div>
          ))}
        </div>

        <Button full className="mt-5" onClick={() => onNotify(`Комиссия ${commission}% применена ко всем новым сделкам`)}>
          Применить
        </Button>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2.5">
          <Wallet size={16} className="text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Платёжные системы</h2>
        </div>

        <div className="mt-4 space-y-3">
          {[
            { name: 'ЮKassa', status: 'active', note: 'Карты РФ, СБП' },
            { name: 'Stripe', status: 'active', note: 'Международные карты' },
            { name: 'Crypto (USDT/BTC)', status: 'active', note: 'Ручная проверка' },
            { name: 'Google Pay', status: 'off', note: 'Не подключена' },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-xl border border-white/8 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-[11px] text-white/35">{p.note}</p>
              </div>
              <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>
                {p.status === 'active' ? 'Активна' : 'Выключена'}
              </Badge>
              <Button
                variant="subtle"
                size="sm"
                className="px-2.5"
                onClick={() => onNotify(`${p.name}: статус изменён`)}
                aria-label="Настроить"
              >
                <Settings size={13} />
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-white/30">
          Провайдер задаётся переменной <code className="font-mono text-white/50">VITE_PAYMENT_PROVIDER</code> в
          файле <code className="font-mono text-white/50">.env</code>.
        </p>
      </div>
    </div>
  )
}

export { Reveal }
