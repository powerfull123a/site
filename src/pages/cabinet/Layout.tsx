import { useState } from 'react'
import { Link, NavLink, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  Store,
  User,
  Wallet,
} from 'lucide-react'
import { Avatar, Badge, Button } from '@/components/ui'
import { useAuth } from '@/store/auth'
import { useWallet } from '@/store/prefs'
import { cn, money, num } from '@/lib/utils'
import type { ReactNode } from 'react'
import type { IconType, Role } from '@/types'

const BUYER_LINKS = [
  { to: '/cabinet/buyer', label: 'Обзор', icon: LayoutDashboard, end: true },
  { to: '/cabinet/orders', label: 'Мои заказы', icon: Package },
  { to: '/cabinet/favorites', label: 'Избранное', icon: Heart },
  { to: '/cabinet/wallet', label: 'Кошелёк', icon: Wallet },
  { to: '/cabinet/chat', label: 'Сообщения', icon: MessageSquare },
]

const SELLER_LINKS = [
  { to: '/cabinet/seller', label: 'Статистика', icon: BarChart3, end: true },
  { to: '/cabinet/seller/listings', label: 'Мои лоты', icon: Store },
  { to: '/cabinet/orders', label: 'Заказы', icon: Package },
  { to: '/cabinet/chat', label: 'Сообщения', icon: MessageSquare },
  { to: '/cabinet/payouts', label: 'Вывод средств', icon: Wallet },
]

export function CabinetLayout({
  children,
  mode,
  roles,
}: {
  children: ReactNode
  mode: 'buyer' | 'seller'
  roles: Role[]
}) {
  const { user, hasRole, signOut } = useAuth()
  const { balance } = useWallet()
  const [roleMenu, setRoleMenu] = useState(false)

  if (!user) return <Navigate to="/login?next=/cabinet/buyer" replace />
  if (!hasRole(...roles)) return <Navigate to="/cabinet/buyer" replace />

  const links = mode === 'buyer' ? BUYER_LINKS : SELLER_LINKS

  return (
    <div className="relative">
      <div className="shell py-8 sm:py-10">
        {/* Шапка кабинета */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar src={user.avatar} name={user.name} size={52} ring />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="h-display text-2xl sm:text-3xl">
                  {mode === 'buyer' ? 'Кабинет покупателя' : 'Кабинет продавца'}
                </h1>
                {user.verified && (
                  <Badge tone="info" icon={<ShieldCheck size={11} />}>
                    Верифицирован
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-white/45">
                {user.name} · {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5">
              <Wallet size={15} className="text-brand-400" />
              <span className="text-sm font-bold text-white">{money(balance)}</span>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRoleMenu((v) => !v)}
                icon={<Settings size={14} />}
              >
                Роль
              </Button>
              {roleMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRoleMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass absolute right-0 top-full z-20 mt-1.5 w-52 rounded-xl p-1.5 shadow-glow-lg"
                  >
                    <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/30">
                      Демо: переключение режима
                    </p>
                    <RoleOption
                      active={mode === 'buyer'}
                      onClick={() => setRoleMenu(false)}
                      to="/cabinet/buyer"
                    >
                      Покупатель
                    </RoleOption>
                    <RoleOption
                      active={mode === 'seller'}
                      onClick={() => setRoleMenu(false)}
                      to="/cabinet/seller"
                    >
                      Продавец
                    </RoleOption>
                    {user.role === 'admin' && (
                      <RoleOption active={false} onClick={() => setRoleMenu(false)} to="/admin">
                        Администратор
                      </RoleOption>
                    )}
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/55 transition-colors hover:bg-brand-500/10 hover:text-brand-300"
                    >
                      <LogOut size={15} /> Выйти
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
          {/* Навигация */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cn(
                      'relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-300',
                      isActive ? 'text-white' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="cabinet-nav"
                          className="absolute inset-0 -z-10 rounded-xl bg-brand-500/12 ring-1 ring-brand-500/30"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <l.icon size={16} />
                      {l.label}
                    </>
                  )}
                </NavLink>
              ))}

              <div className="my-2 hidden h-px bg-white/8 lg:block" />

              <Link
                to="/marketplace"
                className="hidden items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/80 lg:flex"
              >
                <User size={16} />
                В маркетплейс
              </Link>
            </nav>
          </aside>

          {/* Контент */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}

function RoleOption({
  active,
  onClick,
  to,
  children,
}: {
  active: boolean
  onClick: () => void
  to: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'block rounded-lg px-3 py-2 text-sm transition-colors',
        active ? 'bg-brand-500/15 font-semibold text-brand-300' : 'text-white/60 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      {children}
    </Link>
  )
}

/* ─────────────────────────────────────────────
   Карточка метрики
   ───────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = 'brand',
}: {
  label: string
  value: string
  delta?: number
  icon: IconType
  tone?: 'brand' | 'success' | 'warn' | 'info'
}) {
  const tones = {
    brand: 'from-brand-500/20 to-brand-700/5 text-brand-400 ring-brand-500/20',
    success: 'from-emerald-500/20 to-emerald-700/5 text-emerald-400 ring-emerald-500/20',
    warn: 'from-gold-400/20 to-gold-600/5 text-gold-400 ring-gold-400/20',
    info: 'from-sky-500/20 to-sky-700/5 text-sky-400 ring-sky-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card card-hover overflow-hidden p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1', tones[tone])}>
          <Icon size={17} />
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-bold',
              delta >= 0 ? 'bg-emerald-500/12 text-emerald-300' : 'bg-brand-500/12 text-brand-300',
            )}
          >
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
      <p className="mt-4 text-xs text-white/40">{label}</p>
      <p className="mt-1 h-display text-2xl tracking-tight">{value}</p>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Таблица заказов
   ───────────────────────────────────────────── */
const STATUS_META: Record<string, { label: string; tone: 'neutral' | 'brand' | 'success' | 'warn' | 'info' | 'danger' }> = {
  pending: { label: 'Ожидает оплаты', tone: 'warn' },
  paid: { label: 'Оплачен · эскроу', tone: 'info' },
  in_progress: { label: 'В работе', tone: 'brand' },
  delivered: { label: 'Передан', tone: 'info' },
  confirmed: { label: 'Завершён', tone: 'success' },
  dispute: { label: 'Спор', tone: 'danger' },
  refunded: { label: 'Возврат', tone: 'neutral' },
}

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, tone: 'neutral' as const }
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

export { STATUS_META, num }
