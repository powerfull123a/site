import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Store,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react'
import { Logo } from '@/components/ui'
import { LiveDot } from '@/components/fx'
import { useAuth, useUnreadCount } from '@/store/auth'
import { useWallet } from '@/store/prefs'
import { cn, money } from '@/lib/utils'
import type { ReactNode } from 'react'

const NAV = [
  { to: '/', label: 'Главная', end: true },
  { to: '/marketplace', label: 'Маркетплейс' },
  { to: '/pricing', label: 'Тарифы' },
  { to: '/about', label: 'О платформе' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [search, setSearch] = useState('')
  const { user, signOut, hasRole } = useAuth()
  const { balance } = useWallet()
  const unread = useUnreadCount()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenu(false)
    setUserMenu(false)
  }, [location.pathname])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/marketplace?q=${encodeURIComponent(search)}`)
  }

  return (
    <>
      {/* Промо-полоса */}
      <div className="relative z-50 overflow-hidden border-b border-brand-500/20 bg-gradient-to-r from-brand-900/60 via-brand-700/40 to-brand-900/60">
        <div className="shell flex items-center justify-center gap-2 py-2 text-center text-[11px] font-medium text-brand-100 sm:text-xs">
          <LiveDot />
          <span className="truncate">Версия 3.0: офлайн-режим, локальная модель и API для модов</span>
          <Link to="/pricing" className="hidden shrink-0 underline underline-offset-2 hover:text-white sm:inline">
            Подробнее
          </Link>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500 ease-smooth',
          scrolled
            ? 'border-b border-white/8 bg-ink-950/85 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="shell flex h-16 items-center gap-3 sm:h-[4.5rem] sm:gap-5">
          <Link to="/" className="shrink-0 transition-transform duration-300 hover:scale-[1.03]" aria-label="Jarvis — на главную">
            <Logo size={36} />
          </Link>

          {/* Навигация — десктоп */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-300',
                    isActive ? 'text-white' : 'text-white/50 hover:text-white/85',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-lg bg-brand-500/12 ring-1 ring-brand-500/30"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Поиск — десктоп */}
          <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 xl:block">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по маркетплейсу…"
                className="field py-2.5 pl-10 text-sm"
                aria-label="Поиск"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            {user ? (
              <>
                <Link
                  to="/cabinet/buyer"
                  className="relative hidden rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-brand-500/40 hover:text-white md:flex md:items-center md:gap-2"
                  title="Баланс"
                >
                  <Wallet size={15} className="text-brand-400" />
                  {money(balance, { compact: true })}
                </Link>

                <Link
                  to="/cabinet/chat"
                  className="relative rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/70 transition-colors hover:border-brand-500/40 hover:text-white"
                  aria-label="Сообщения"
                >
                  <MessageSquare size={17} />
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenu((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pr-2.5 transition-colors hover:border-brand-500/40"
                  >
                    <img src={user.avatar} alt="" className="h-7 w-7 rounded-lg" />
                    <ChevronDown size={14} className={cn('text-white/40 transition-transform', userMenu && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {userMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.18 }}
                          className="glass absolute right-0 top-full z-20 mt-2 w-60 overflow-hidden rounded-2xl p-1.5 shadow-glow-lg"
                        >
                          <div className="border-b border-white/8 px-3 py-2.5">
                            <p className="truncate text-sm font-bold text-white">{user.name}</p>
                            <p className="truncate text-xs text-white/40">{user.email}</p>
                          </div>
                          <div className="py-1.5">
                            <MenuItem to="/cabinet/buyer" icon={<LayoutDashboard size={15} />}>Покупателю</MenuItem>
                            <MenuItem to="/cabinet/seller" icon={<Store size={15} />}>Продавцу</MenuItem>
                            <MenuItem to="/cabinet/favorites" icon={<span className="text-sm">♥</span>}>Избранное</MenuItem>
                            {hasRole('admin') && (
                              <MenuItem to="/admin" icon={<ShieldCheck size={15} />} tone="brand">
                                Админ-панель
                              </MenuItem>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              signOut()
                              navigate('/')
                            }}
                            className="flex w-full items-center gap-2.5 border-t border-white/8 px-3 py-2.5 text-sm font-medium text-white/55 transition-colors hover:bg-brand-500/10 hover:text-brand-300"
                          >
                            <LogOut size={15} /> Выйти
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm hidden sm:inline-flex">
                  <LogIn size={15} /> Войти
                </Link>
                <Link to="/register" className="btn-primary shine btn-sm">
                  <UserPlus size={15} /> Регистрация
                </Link>
              </>
            )}

            <button
              onClick={() => setMenu((v) => !v)}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/80 lg:hidden"
              aria-label="Меню"
              aria-expanded={menu}
            >
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/8 bg-ink-950/95 backdrop-blur-xl lg:hidden"
            >
              <div className="shell space-y-1 py-4">
                <form onSubmit={submitSearch} className="mb-3 xl:hidden">
                  <div className="relative">
                    <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск по маркетплейсу…"
                      className="field py-2.5 pl-10 text-sm"
                    />
                  </div>
                </form>
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors',
                          isActive ? 'bg-brand-500/12 text-white ring-1 ring-brand-500/30' : 'text-white/60',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
                {!user && (
                  <Link to="/login" className="btn-ghost mt-2 w-full">
                    <LogIn size={16} /> Войти
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

function MenuItem({
  to,
  icon,
  children,
  tone,
}: {
  to: string
  icon: ReactNode
  children: ReactNode
  tone?: 'brand'
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        tone === 'brand'
          ? 'text-brand-300 hover:bg-brand-500/12'
          : 'text-white/60 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      {icon}
      {children}
    </Link>
  )
}

/* ─────────────────────────────────────────────
   Футер
   ───────────────────────────────────────────── */
const FOOTER_COLS = [
  {
    title: 'Продукт',
    links: [
      { to: '/pricing', label: 'Тарифы' },
      { to: '/marketplace', label: 'Маркетплейс' },
      { to: '/about', label: 'О платформе' },
      { to: '/about#demo', label: 'Как это работает' },
    ],
  },
  {
    title: 'Продавцам',
    links: [
      { to: '/cabinet/seller', label: 'Кабинет продавца' },
      { to: '/register', label: 'Стать продавцом' },
      { to: '/about#faq', label: 'Правила площадки' },
      { to: '/about#faq', label: 'Комиссии' },
    ],
  },
  {
    title: 'Поддержка',
    links: [
      { to: '/about#faq', label: 'FAQ' },
      { to: '/about#contacts', label: 'Центр помощи' },
      { to: '/about#contacts', label: 'Связаться с нами' },
      { to: '/login', label: 'Восстановить доступ' },
    ],
  },
  {
    title: 'Правовое',
    links: [
      { to: '/about', label: 'Пользовательское соглашение' },
      { to: '/about', label: 'Политика конфиденциальности' },
      { to: '/about', label: 'Обработка данных' },
      { to: '/about', label: 'Антифрод' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/8 bg-ink-900/40">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-red-line opacity-60" />
      <div className="shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo size={38} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Голосовой ИИ-клиент и безопасный маркетплейс внутриигровых предметов. Работает офлайн, защищает
              каждую сделку.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="chip-red">
                <LiveDot /> 2.4 млн игроков онлайн
              </span>
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/35">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="group inline-flex items-center text-sm text-white/50 transition-colors hover:text-white"
                    >
                      <span className="mr-0 h-px w-0 bg-brand-500 transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-7 sm:flex-row">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Jarwis. Все права защищены.</p>
          <p className="text-xs text-white/30">
            Сделано в России · <span className="text-brand-400">24/7 поддержка</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
