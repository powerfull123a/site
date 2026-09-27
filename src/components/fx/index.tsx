import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────
   Появление при скролле
   ───────────────────────────────────────────── */
type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 34 },
  down: { x: 0, y: -34 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
}

export function Reveal({
  children,
  delay = 0,
  dir = 'up',
  className,
  once = true,
  blur = true,
}: {
  children: ReactNode
  delay?: number
  dir?: Direction
  className?: string
  once?: boolean
  blur?: boolean
}) {
  const o = OFFSET[dir]
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: o.x, y: o.y, filter: blur ? 'blur(6px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-80px 0px -60px 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Каскад из нескольких детей с задержкой. */
export function Stagger({
  children,
  className,
  step = 0.08,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  step?: number
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export const staggerItem = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

/* ─────────────────────────────────────────────
   Счётчик, растущий при появлении
   ───────────────────────────────────────────── */
export function Counter({
  to,
  duration = 1.9,
  format,
  className,
}: {
  to: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(to * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} className={className}>
      {format ? format(value) : Math.round(value).toLocaleString('ru-RU')}
    </span>
  )
}

/* ─────────────────────────────────────────────
   3D-наклон карточки за курсором
   ───────────────────────────────────────────── */
export function Tilt({
  children,
  className,
  max = 9,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 180, damping: 20 })
  const sy = useSpring(my, { stiffness: 180, damping: 20 })
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])

  return (
    <div ref={ref} className={cn('perspective', className)}>
      <motion.div
        className="group relative h-full w-full"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onPointerMove={(e) => {
          const r = ref.current?.getBoundingClientRect()
          if (!r) return
          mx.set((e.clientX - r.left) / r.width)
          my.set((e.clientY - r.top) / r.height)
        }}
        onPointerLeave={() => {
          mx.set(0.5)
          my.set(0.5)
        }}
      >
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(320px circle at var(--gx, 50%) var(--gy, 50%), rgba(244,63,79,0.16), transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Фоновые декорации
   ───────────────────────────────────────────── */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute inset-0 grid-bg opacity-[0.55]" />
      <div className="absolute inset-0 bg-red-glow" />
      <div className="absolute -left-1/4 top-1/3 h-[36rem] w-[36rem] rounded-full bg-brand-600/10 blur-[130px] animate-float" />
      <div className="absolute -right-1/4 bottom-0 h-[30rem] w-[30rem] rounded-full bg-brand-800/10 blur-[120px] animate-float [animation-delay:2.5s]" />
    </div>
  )
}

/** Мерцающие «частицы». */
export function Particles({ count = 26 }: { count?: number }) {
  const [dots] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2.4,
      dur: 5 + Math.random() * 7,
      delay: Math.random() * 6,
    })),
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-brand-400/60 animate-blink"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
            boxShadow: '0 0 8px rgba(244,63,79,0.7)',
          }}
        />
      ))}
    </div>
  )
}

/** Бегущая строка. */
export function Marquee({
  children,
  className,
  speed = 32,
}: {
  children: ReactNode
  className?: string
  speed?: number
}) {
  return (
    <div className={cn('mask-fade-x relative flex overflow-hidden', className)}>
      <div
        className="flex shrink-0 items-center gap-8 pr-8 animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

/** CRT-развёртка — эффект технологичности. */
export function Scanlines({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 opacity-[0.12]', className)}
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0px, transparent 1px, transparent 3px)',
      }}
    />
  )
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-2 w-2', className)}>
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  )
}

/* ─────────────────────────────────────────────
   Анимированная градиентная обводка
   ───────────────────────────────────────────── */
export function GradientBorder({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('relative rounded-2xl p-px', className)}>
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl opacity-70 animate-gradient-x"
        style={{
          background:
            'linear-gradient(120deg, rgba(244,63,79,0.7), rgba(244,63,79,0.05) 40%, rgba(255,107,116,0.7) 70%, rgba(244,63,79,0.1))',
          backgroundSize: '300% 300%',
        }}
      />
      <div className="relative h-full w-full">{children}</div>
    </div>
  )
}
