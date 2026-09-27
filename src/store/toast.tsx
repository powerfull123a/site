import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  kind: ToastKind
  title: string
  text?: string
}

interface ToastApi {
  push: (kind: ToastKind, title: string, text?: string) => void
  success: (title: string, text?: string) => void
  error: (title: string, text?: string) => void
  info: (title: string, text?: string) => void
  warning: (title: string, text?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const TONES: Record<ToastKind, string> = {
  success: 'border-emerald-500/40 text-emerald-300',
  error: 'border-brand-500/50 text-brand-300',
  info: 'border-sky-500/40 text-sky-300',
  warning: 'border-gold-400/40 text-gold-300',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const seq = useRef(0)

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (kind: ToastKind, title: string, text?: string) => {
      const id = ++seq.current
      setItems((prev) => [...prev.slice(-3), { id, kind, title, text }])
      setTimeout(() => remove(id), 4200)
    },
    [remove],
  )

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (t, x) => push('success', t, x),
      error: (t, x) => push('error', t, x),
      info: (t, x) => push('info', t, x),
      warning: (t, x) => push('warning', t, x),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const Icon = ICONS[t.kind]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 60, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className={`glass pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-card ${TONES[t.kind]}`}
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{t.title}</p>
                  {t.text && <p className="mt-0.5 text-xs leading-relaxed text-white/55">{t.text}</p>}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="shrink-0 rounded-md p-1 text-white/35 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Закрыть уведомление"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast должен использоваться внутри <ToastProvider>')
  return ctx
}
