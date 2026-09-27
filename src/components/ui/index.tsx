import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Loader2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────── Button ─────────────────────────── */
type Variant = 'primary' | 'ghost' | 'outline' | 'subtle' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  full?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'btn-primary shine',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  subtle: 'btn border border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.09] hover:text-white',
  danger: 'btn border border-brand-600/50 bg-brand-600/15 text-brand-300 hover:bg-brand-600 hover:text-white',
}

const SIZES = {
  sm: 'px-3.5 py-2 text-xs',
  md: '',
  lg: 'px-7 py-4 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, full, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(VARIANTS[variant], SIZES[size], full && 'w-full', className)}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  )
})

/* ─────────────────────────── Input ─────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  addon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, addon, className, id, ...rest },
  ref,
) {
  const inputId = id ?? (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(
            'field',
            icon && 'pl-10',
            addon && 'pr-20',
            error && 'border-brand-500/70 focus:border-brand-500 focus:ring-brand-500/20',
            className,
          )}
          {...rest}
        />
        {addon && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{addon}</span>}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-brand-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-white/35">{hint}</p>
      ) : null}
    </div>
  )
})

/* ────────────────────────── Textarea ────────────────────────── */
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(function Textarea({ label, error, className, id, ...rest }, ref) {
  const tid = id ?? (label ? `ta-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={tid} className="label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={tid}
        className={cn('field resize-y', error && 'border-brand-500/70', className)}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-brand-400">{error}</p>}
    </div>
  )
})

/* ─────────────────────────── Select ─────────────────────────── */
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
>(function Select({ label, className, id, children, ...rest }, ref) {
  const sid = id ?? (label ? `se-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={sid} className="label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={sid}
        className={cn('field cursor-pointer appearance-none bg-[length:16px] pr-9', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.85rem center',
        }}
        {...rest}
      >
        {children}
      </select>
    </div>
  )
})

/* ─────────────────────────── Badge ─────────────────────────── */
const TONES = {
  neutral: 'border-white/12 bg-white/[0.05] text-white/65',
  brand: 'border-brand-500/35 bg-brand-500/12 text-brand-300',
  success: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300',
  warn: 'border-gold-400/35 bg-gold-400/12 text-gold-300',
  info: 'border-sky-500/35 bg-sky-500/12 text-sky-300',
  danger: 'border-brand-600/45 bg-brand-600/15 text-brand-300',
} as const

export type BadgeTone = keyof typeof TONES

export function Badge({
  tone = 'neutral',
  children,
  className,
  icon,
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
  icon?: ReactNode
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', TONES[tone], className)}>
      {icon}
      {children}
    </span>
  )
}

/* ─────────────────────────── Rating ─────────────────────────── */
export function Rating({
  value,
  count,
  size = 13,
  showValue = true,
  className,
}: {
  value: number
  count?: number
  size?: number
  showValue?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)))
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-white/15" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star size={size} className="text-gold-400" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          )
        })}
      </span>
      {showValue && <span className="ml-1 text-xs font-semibold text-white/75">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-white/35">({count})</span>}
    </span>
  )
}

/* ─────────────────────────── Avatar ─────────────────────────── */
export function Avatar({
  src,
  name,
  size = 36,
  ring = false,
  className,
}: {
  src?: string
  name: string
  size?: number
  ring?: boolean
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-700', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} width={size} height={size} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="text-xs font-bold text-white/70">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
      {ring && (
        <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand-500/50" />
      )}
    </span>
  )
}

/* ─────────────────────────── Skeleton ─────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-7 w-full" />
      </div>
    </div>
  )
}

/* ─────────────────────────── Progress ─────────────────────────── */
export function Progress({
  value,
  className,
  tone = 'brand',
}: {
  value: number
  className?: string
  tone?: 'brand' | 'success' | 'warn'
}) {
  const tones = {
    brand: 'from-brand-500 to-brand-300',
    success: 'from-emerald-500 to-emerald-300',
    warn: 'from-gold-500 to-gold-300',
  }
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]', className)}>
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-smooth', tones[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/* ─────────────────────────── Tabs ─────────────────────────── */
export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: ReactNode; badge?: ReactNode }[]
  className?: string
}) {
  return (
    <div className={cn('no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-ink-900/60 p-1', className)}>
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              'relative shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-300',
              active ? 'text-white' : 'text-white/45 hover:text-white/80',
            )}
          >
            {active && (
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-600/30 to-brand-500/20 ring-1 ring-brand-500/40" />
            )}
            <span className="relative flex items-center gap-2">
              {it.label}
              {it.badge}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────── Modal ─────────────────────────── */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={cn(
              'glass relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border-white/12 p-5 shadow-glow-lg sm:rounded-2xl',
              sizes[size],
            )}
          >
            {title && <h3 className="mb-4 text-lg font-bold text-white">{title}</h3>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────── Switch ─────────────────────────── */
export function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-white/40">{hint}</span>}
      </span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
          checked ? 'bg-brand-500' : 'bg-white/12',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
          style={{ left: checked ? 26 : 4 }}
        />
      </span>
    </button>
  )
}

/* ─────────────────────────── Empty state ─────────────────────────── */
export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: ReactNode
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-white">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/45">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ─────────────────────────── Section header ─────────────────────────── */
export function SectionHead({
  eyebrow,
  title,
  text,
  align = 'center',
  action,
}: {
  eyebrow?: string
  title: ReactNode
  text?: string
  align?: 'center' | 'left'
  action?: ReactNode
}) {
  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-4 sm:mb-14',
        align === 'center' ? 'items-center text-center' : 'items-start',
        action && 'sm:flex-row sm:items-end sm:justify-between',
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-300">
            {eyebrow}
          </p>
        )}
        <h2 className="h-display text-3xl sm:text-4xl lg:text-[2.75rem]">{title}</h2>
        {text && <p className="mt-4 text-base leading-relaxed text-white/50">{text}</p>}
      </div>
      {action}
    </div>
  )
}

/* ─────────────────────────── Logo mark ─────────────────────────── */
export function Logo({
  size = 32,
  withText = true,
  className,
}: {
  size?: number
  withText?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="none" aria-hidden>
          <path
            d="M6 4v16M6 12l9-8M6 12l11 8"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-200 shadow-[0_0_8px_rgba(255,180,190,0.9)]" />
      </span>
      {withText && (
        <span className="h-display text-lg tracking-tight">
          Jar<span className="grad-text">wis</span>
        </span>
      )}
    </span>
  )
}
