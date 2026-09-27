import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, MessageSquare, Send, ShieldCheck, X } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { USERS } from '@/data/mock'
import { api, subscribeApi } from '@/api/client'
import { useAuth } from '@/store/auth'
import { cn, timeAgo } from '@/lib/utils'
import type { ChatMessage, ChatThread } from '@/types'

/* ─────────────────────────────────────────────
   Панель переписки. Используется и во всплывающем
   виджете, и на полноценной странице /cabinet/chat.
   ───────────────────────────────────────────── */
export function ChatPanel({
  className,
  showAllLink = false,
}: {
  className?: string
  showAllLink?: boolean
}) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const me = user ?? USERS[0]
  const active = threads.find((t) => t.id === activeId) ?? null
  const counterpart = active
    ? USERS.find((u) => u.id === (active.sellerId === me.id ? active.buyerId : active.sellerId))
    : null

  // Первый доступный диалог становится активным, если текущий не в списке
  useEffect(() => {
    if (threads.length === 0) return
    if (!threads.some((t) => t.id === activeId)) setActiveId(threads[0].id)
  }, [threads, activeId])

  useEffect(() => {
    if (!user) return
    let alive = true
    const load = () => void api.threads(user.id).then((t) => alive && setThreads(t))
    load()
    // Любое новое сообщение в api перечитывает список диалогов
    const off = subscribeApi(load)
    return () => {
      alive = false
      off()
    }
  }, [user])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages.length])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !active) return
    setDraft('')
    setSending(true)
    try {
      const msg = await api.sendMessage(active.id, me.id, text)
      setThreads((prev) =>
        prev.map((t) => (t.id === active.id ? { ...t, messages: [...t.messages, msg], unread: 0 } : t)),
      )
    } finally {
      setSending(false)
    }
  }

  if (threads.length === 0) {
    return (
      <div className={cn('flex flex-1 flex-col items-center justify-center p-8 text-center', className)}>
        <MessageSquare size={26} className="text-white/20" />
        <p className="mt-3 text-sm font-semibold text-white/60">Диалогов пока нет</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/35">
          Переписка с продавцом открывается автоматически после оформления заказа.
        </p>
        <Link to="/marketplace" className="mt-4">
          <Button size="sm" variant="ghost">
            В маркетплейс
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      {/* Список диалогов */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/8 p-2 no-scrollbar">
        {threads.map((t) => {
          const other = USERS.find((u) => u.id === (t.sellerId === me.id ? t.buyerId : t.sellerId))
          return (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={cn(
                'relative shrink-0 rounded-full transition-all',
                t.id === activeId ? 'ring-2 ring-brand-500' : 'opacity-60 hover:opacity-100',
              )}
              title={other?.name}
            >
              <Avatar src={other?.avatar} name={other?.name ?? '?'} size={32} />
              {t.unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold">
                  {t.unread}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Собеседник */}
      {counterpart && active && (
        <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-2.5">
          <Avatar src={counterpart.avatar} name={counterpart.name} size={30} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{counterpart.name}</p>
            <p className="flex items-center gap-1 text-[10px] text-emerald-400">
              <ShieldCheck size={10} /> Проверенный продавец · рейтинг {counterpart.rating}
            </p>
          </div>
          {active.orderId && <span className="chip shrink-0 font-mono text-[10px]">{active.orderId}</span>}
          {showAllLink && (
            <Link
              to="/cabinet/orders"
              className="shrink-0 text-[11px] font-semibold text-brand-300 hover:text-brand-200"
            >
              Заказ
            </Link>
          )}
        </div>
      )}

      {/* Сообщения */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3.5">
        {active?.messages.map((m: ChatMessage) => {
          if (m.system) {
            return (
              <div key={m.id} className="flex justify-center py-1">
                <span className="max-w-[85%] rounded-full border border-brand-500/25 bg-brand-500/8 px-3 py-1.5 text-center text-[10px] leading-relaxed text-brand-200/90">
                  {m.text}
                </span>
              </div>
            )
          }
          const mine = m.authorId === me.id
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', mine ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed',
                  mine
                    ? 'rounded-br-md bg-gradient-to-br from-brand-600 to-brand-700 text-white'
                    : 'rounded-bl-md border border-white/8 bg-ink-800 text-white/85',
                )}
              >
                {m.text}
                <span className={cn('mt-1 block text-[9px]', mine ? 'text-white/50' : 'text-white/30')}>
                  {timeAgo(m.createdAt)}
                </span>
              </div>
            </motion.div>
          )
        })}
        {sending && (
          <div className="flex justify-end">
            <div className="flex gap-1 rounded-2xl rounded-br-md bg-ink-800 px-3.5 py-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-white/35"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ввод */}
      <form onSubmit={send} className="flex shrink-0 gap-2 border-t border-white/8 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Сообщение…"
          aria-label="Сообщение"
          className="field py-2.5 text-sm"
          maxLength={500}
        />
        <Button type="submit" size="sm" loading={sending} className="px-3" aria-label="Отправить">
          <Send size={15} />
        </Button>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Плавающая кнопка + окно чата
   ───────────────────────────────────────────── */
export function ChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="group fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow-lg"
        aria-label={open ? 'Закрыть чат' : 'Открыть чат'}
      >
        <span className="absolute inset-0 rounded-2xl bg-brand-500/40 animate-pulse-ring" />
        <AnimatePresence mode="wait">
          <motion.span
            key={open ? 'x' : 'chat'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <X size={22} className="text-white" /> : <MessageSquare size={22} className="text-white" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass fixed bottom-24 right-5 z-[70] flex h-[min(32rem,calc(100vh-9rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl shadow-glow-lg"
          >
            <div className="flex items-center justify-between border-b border-white/8 bg-gradient-to-r from-brand-950/60 to-ink-900/60 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} className="text-brand-400" />
                <div>
                  <p className="text-sm font-bold text-white">Сообщения</p>
                  <p className="flex items-center gap-1 text-[10px] text-white/40">
                    <Lock size={9} /> Защищённый чат сделки
                  </p>
                </div>
              </div>
              <Link
                to="/cabinet/chat"
                onClick={() => setOpen(false)}
                className="text-[11px] font-semibold text-brand-300 hover:text-brand-200"
              >
                Все чаты
              </Link>
            </div>

            <ChatPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
