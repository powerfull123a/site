import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Cpu,
  Gauge,
  Mic,
  Plane,
  Puzzle,
  Shield,
  Sparkles,
  Star,
  Store,
  Terminal,
  Zap,
} from 'lucide-react'
import { Badge, Button, Rating, SectionHead } from '@/components/ui'
import {
  AI_FEATURES,
  DEMO_STEPS,
  FAQ,
  GAMES,
  LANDING,
  TARIFFS,
  TESTIMONIALS,
  FEATURED_PRODUCTS,
} from '@/data/mock'
import {
  Counter as Count,
  GradientBorder,
  GridBackdrop,
  LiveDot,
  Marquee,
  Particles,
  Reveal,
  Scanlines,
  Stagger,
  Tilt,
  staggerItem,
} from '@/components/fx'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { cn, money, num } from '@/lib/utils'

/* ─────────────────────────────────────────────
   Hero
   ───────────────────────────────────────────── */
function Hero() {
  const [micOn, setMicOn] = useState(false)

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-14 sm:pb-28 sm:pt-20">
      <GridBackdrop />
      <Particles />
      <Scanlines />

      <div className="shell relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Текст */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/pricing"
              className="group inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-brand-200 transition-colors hover:border-brand-500/60"
            >
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Новое
              </span>
              <span className="truncate">{LANDING.announcement}</span>
              <ArrowRight size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="h-display mt-6 text-[2.6rem] leading-[0.94] sm:text-6xl lg:text-[4.25rem]"
          >
            Твой <span className="grad-text text-glow">ИИ-клиент</span>
            <br />
            в каждой игре
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg"
          >
            {LANDING.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link to="/pricing">
              <Button size="lg" className="w-full sm:w-auto" icon={<Sparkles size={17} />}>
                Купить Jarwis
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto" icon={<Store size={17} />}>
                В маркетплейс
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/40"
          >
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-emerald-400" /> Без карты для старта
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-emerald-400" /> Windows, macOS, Linux
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-emerald-400" /> Отмена в один клик
            </span>
          </motion.div>

          {/* Статистика */}
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4"
          >
            {LANDING.stats.map((s) => (
              <div key={s.label}>
                <dd className="h-display text-2xl tracking-tight text-white sm:text-[1.75rem]">
                  <Count to={s.value} />{s.suffix}
                </dd>
                <dt className="mt-1.5 text-[11px] leading-snug text-white/40">{s.label}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Визуал */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <HeroVisual micOn={micOn} onToggleMic={() => setMicOn((v) => !v)} />
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Визуал hero: анимированный мокап ассистента
   ───────────────────────────────────────────── */
const VOICE_BARS = [0.3, 0.6, 0.9, 0.45, 1, 0.7, 0.35, 0.85, 0.5, 0.25, 0.6, 0.95, 0.4, 0.75, 0.3]

function HeroVisual({ micOn, onToggleMic }: { micOn: boolean; onToggleMic: () => void }) {
  // Смена индекса «реплики» ассистента по клику по ядру
  const [bubble, setBubble] = useState(0)

  return (
    <GradientBorder className="relative">
      <div className="relative overflow-hidden rounded-2xl bg-ink-950/95 p-5 sm:p-6">
        <Scanlines className="opacity-[0.08]" />

        {/* Окно */}
        <div className="mb-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-600/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2.5 font-mono text-[10px] text-white/30">jarwis://console</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
            <LiveDot /> online
          </span>
        </div>

        {/* Сфера / ядро */}
        <button
          onClick={() => setBubble((b) => b + 1)}
          className="relative mx-auto mb-5 flex h-40 w-40 items-center justify-center"
          aria-label="Следующая реплика ассистента"
        >
          <span className="absolute inset-0 rounded-full bg-brand-600/20 blur-2xl animate-pulse" />
          <span className="absolute inset-4 rounded-full border border-brand-500/25 animate-spin-slow" />
          <span className="absolute inset-8 rounded-full border border-dashed border-white/10 animate-spin-slow [animation-direction:reverse]" />
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow-lg"
            animate={
              micOn
                ? { scale: [1, 1.09, 1], boxShadow: ['0 0 40px rgba(244,63,79,0.5)', '0 0 70px rgba(244,63,79,0.8)', '0 0 40px rgba(244,63,79,0.5)'] }
                : { scale: 1 }
            }
            transition={{ duration: 1.4, repeat: micOn ? Infinity : 0 }}
          >
            <Bot size={34} className="text-white" />
          </motion.div>
        </button>

        {/* Голосовая волна */}
        <button
          onClick={onToggleMic}
          className="mb-4 flex h-12 w-full items-center justify-center gap-1 rounded-xl border border-white/10 bg-ink-900/70 px-4 transition-colors hover:border-brand-500/40"
          aria-label={micOn ? 'Выключить микрофон' : 'Включить микрофон'}
        >
          {VOICE_BARS.map((h, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-brand-600 to-brand-300"
              animate={micOn ? { height: [`${h * 45}%`, `${Math.min(100, h * 100)}%`, `${h * 45}%`] } : { height: '12%' }}
              transition={
                micOn
                  ? { duration: 0.9, repeat: Infinity, delay: i * 0.05, ease: 'easeInOut' }
                  : { duration: 0.3 }
              }
              style={{ height: '12%' }}
            />
          ))}
          <span className="ml-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {micOn ? 'слушаю…' : 'микрофон'}
          </span>
        </button>

        {/* Диалог */}
        <div className="space-y-2.5">
          <ChatLine side="user" text="Эй, Джарвис, сколько у меня золота?" />
          <AnimateSwap index={bubble} />
          <motion.div
            animate={{ opacity: bubble === 1 ? 1 : 0.35 }}
            className="flex items-center gap-2 rounded-xl border border-white/8 bg-ink-900/60 px-3.5 py-2.5"
          >
            <Sparkles size={13} className="shrink-0 text-brand-400" />
            <p className="text-xs text-white/70">Открыть торгового NPC и отфильтровать по цене</p>
          </motion.div>
        </div>

        {/* Метрики */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { icon: Gauge, label: 'Отклик', value: '40 мс' },
            { icon: Plane, label: 'Офлайн', value: 'Да' },
            { icon: Shield, label: 'Локально', value: '100%' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-white/8 bg-ink-900/60 px-2.5 py-2 text-center">
              <m.icon size={13} className="mx-auto mb-1 text-brand-400" />
              <p className="text-[10px] text-white/35">{m.label}</p>
              <p className="text-xs font-bold text-white">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Плавающие чипы */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-3 top-16 hidden items-center gap-2 rounded-xl border border-white/10 bg-ink-900/90 px-3 py-2 shadow-glow backdrop-blur-xl sm:flex"
      >
        <Zap size={13} className="text-gold-400" />
        <span className="text-[11px] font-semibold text-white">−45% на Pro</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute -right-3 bottom-24 hidden items-center gap-2 rounded-xl border border-white/10 bg-ink-900/90 px-3 py-2 shadow-glow backdrop-blur-xl sm:flex"
      >
        <Terminal size={13} className="text-sky-400" />
        <span className="font-mono text-[11px] text-white/70">500+ игр</span>
      </motion.div>
    </GradientBorder>
  )
}

function ChatLine({ side, text }: { side: 'user' | 'jarvis'; text: string }) {
  return (
    <div className={cn('flex', side === 'user' ? 'justify-end' : 'justify-start')}>
      <p
        className={cn(
          'max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed',
          side === 'user'
            ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white'
            : 'border border-brand-500/25 bg-brand-500/8 text-brand-100',
        )}
      >
        {text}
      </p>
    </div>
  )
}

function AnimateSwap({ index }: { index: number }) {
  const replies = [
    '12 480 золота. Хватит на Клинок Бури — он даёт +18% к урону на боссах.',
    'Сейчас посчитаю… 12 480. Рекомендую Клинок Бури, +18% к урону на боссах.',
  ]
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-start"
    >
      <p className="max-w-[90%] rounded-xl border border-brand-500/25 bg-brand-500/8 px-3.5 py-2.5 text-xs leading-relaxed text-brand-100">
        {replies[index % replies.length]}
      </p>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Преимущества
   ───────────────────────────────────────────── */
function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-bg opacity-[0.05]" />
      <div className="shell relative">
        <Reveal>
          <SectionHead
            eyebrow="Возможности"
            title={
              <>
                Всё, что нужно для <span className="grad-text">умной игры</span>
              </>
            }
            text="Jarvis не просто слушает — он понимает контекст, помнит вашу игру и остаётся рядом даже без сети."
          />
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" step={0.09}>
          {AI_FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              className="group relative"
            >
              <Tilt max={6} className="h-full">
                <div className="card card-hover flex h-full flex-col p-6">
                  {/* Уголок со свечением */}
                  <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-red-line opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="mb-5 flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/25 to-brand-700/10 text-2xl ring-1 ring-brand-500/25 transition-transform duration-500 group-hover:scale-110">
                      {f.emoji}
                    </span>
                    <span className="chip font-mono text-[10px]">{f.metric}</span>
                  </div>

                  <h3 className="h-display text-lg tracking-tight">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/50">{f.text}</p>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Демонстрация работы
   ───────────────────────────────────────────── */
function Demo() {
  const icons = [Mic, Cpu, Sparkles, Zap] as const

  return (
    <section id="demo" className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-700/8 blur-[150px]" />

      <div className="shell relative">
        <Reveal>
          <SectionHead
            eyebrow="Демонстрация"
            title={
              <>
                Как это <span className="grad-text">работает</span>
              </>
            }
            text="Четыре шага от фразы до действия в игре. Никаких горячих клавиш и переключений окон."
          />
        </Reveal>

        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* Шаги */}
          <Stagger className="space-y-3" step={0.12}>
            {DEMO_STEPS.map((s, i) => {
              const Icon = icons[i]
              return (
                <motion.div key={s.title} variants={staggerItem}>
                  <div className="group card card-hover flex items-start gap-4 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400 ring-1 ring-brand-500/25 transition-all duration-500 group-hover:bg-brand-500 group-hover:text-white">
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[10px] text-white/25">0{i + 1}</span>
                        <h3 className="text-sm font-bold text-white">{s.title}</h3>
                      </div>
                      <p className="mt-1 font-mono text-[11px] leading-relaxed text-white/45">{s.text}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </Stagger>

          {/* Мокап с интерфейсом игры */}
          <Reveal dir="left" delay={0.15}>
            <div className="relative">
              <GradientBorder>
                <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-4">
                  <div className="mb-3 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-600/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="ml-2 font-mono text-[10px] text-white/30">game.exe — live overlay</span>
                  </div>

                  {/* «Игровой» экран */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br from-ink-800 to-ink-900">
                    <div className="absolute inset-0 dot-bg opacity-[0.12]" />
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white/5" />
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white/5" />

                    {/* HUD */}
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <span className="rounded bg-ink-950/70 px-2 py-1 font-mono text-[9px] text-white/50">FPS 240</span>
                      <span className="rounded bg-emerald-500/20 px-2 py-1 font-mono text-[9px] text-emerald-300">GPU 62%</span>
                    </div>

                    <div className="absolute right-3 top-3 rounded-lg bg-ink-950/70 px-2.5 py-1.5 text-right">
                      <p className="font-mono text-[9px] text-white/35">ЗОЛОТО</p>
                      <p className="font-mono text-sm font-bold text-gold-400">12 480</p>
                    </div>

                    {/* Оверлей Jarvis */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.35 }}
                      className="absolute bottom-3 left-3 right-3"
                    >
                      <div className="rounded-xl border border-brand-500/30 bg-ink-950/90 p-3 backdrop-blur-md">
                        <div className="mb-2 flex items-center gap-2">
                          <Sparkles size={12} className="text-brand-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
                            Jarwis рекомендует
                          </span>
                          <span className="ml-auto font-mono text-[9px] text-white/30">40 мс</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-white/75">
                          Клинок Бури — лучший вариант сейчас. Урон +18% против боссов, цена ниже рынка на 340 зол.
                        </p>
                        <div className="mt-2.5 flex gap-2">
                          <span className="rounded-md bg-brand-500 px-2.5 py-1 text-[9px] font-bold text-white">
                            Купить · 2 100
                          </span>
                          <span className="rounded-md border border-white/12 px-2.5 py-1 text-[9px] font-semibold text-white/50">
                            Отклонить
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Метрики под мокапом */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      ['Поддержка', '500+ игр'],
                      ['API для модов', 'Открытый'],
                      ['Задержка', '40 мс'],
                    ].map(([l, v]) => (
                      <div key={l} className="rounded-lg border border-white/8 bg-ink-900/60 px-2.5 py-2 text-center">
                        <p className="text-[9px] text-white/35">{l}</p>
                        <p className="text-[11px] font-bold text-white">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GradientBorder>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Игры
   ───────────────────────────────────────────── */
function GamesStrip() {
  return (
    <section className="relative py-16">
      <div className="shell mb-9">
        <Reveal>
          <SectionHead
            align="left"
            eyebrow="Интеграции"
            title={
              <>
                Работает в <span className="grad-text">500+ играх</span>
              </>
            }
            text="От киберспортивных дисциплин до песочниц. Для инди-проектов — открытый API."
          />
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <Marquee speed={46} className="py-2">
          {GAMES.map((g) => (
            <Link
              key={g.id}
              to={`/marketplace?game=${g.id}`}
              className="group flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/60 px-5 py-3.5 transition-all duration-400 hover:border-brand-500/45 hover:bg-ink-850"
            >
              <span className="text-2xl transition-transform duration-400 group-hover:scale-110">{g.emoji}</span>
              <span>
                <span className="block text-sm font-bold text-white">{g.title}</span>
                <span className="block text-[11px] text-white/35">
                  {g.players} онлайн · {num(g.productsCount)} лотов
                </span>
              </span>
            </Link>
          ))}
        </Marquee>
      </Reveal>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Тарифы
   ───────────────────────────────────────────── */
function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead
            eyebrow="Тарифы"
            title={
              <>
                Выберите <span className="grad-text">свой уровень</span>
              </>
            }
            text="Начните бесплатно. Переходите на Pro, когда почувствуете разницу."
            action={
              <div className="flex items-center gap-3">
                <span className={cn('text-sm font-semibold transition-colors', !yearly ? 'text-white' : 'text-white/40')}>
                  Ежемесячно
                </span>
                <button
                  onClick={() => setYearly((v) => !v)}
                  className="relative h-7 w-12 rounded-full bg-white/12 transition-colors duration-300"
                  role="switch"
                  aria-checked={yearly}
                  aria-label="Годовая оплата"
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    className={cn(
                      'absolute top-1 h-5 w-5 rounded-full shadow',
                      yearly ? 'left-6 bg-brand-500' : 'left-1 bg-white',
                    )}
                  />
                </button>
                <span className={cn('text-sm font-semibold transition-colors', yearly ? 'text-white' : 'text-white/40')}>
                  За год
                  <span className="ml-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    −35%
                  </span>
                </span>
              </div>
            }
          />
        </Reveal>

        <Stagger className="grid gap-5 lg:grid-cols-3" step={0.12}>
          {TARIFFS.map((t) => {
            const price = yearly && t.price > 0 ? Math.round((t.price * 12 * 0.65) / 12) : t.price
            return (
              <motion.div key={t.id} variants={staggerItem} className="h-full">
                <div
                  className={cn(
                    'relative flex h-full flex-col rounded-2xl p-6 transition-all duration-500',
                    t.popular
                      ? 'border border-brand-500/40 bg-gradient-to-b from-brand-950/50 to-ink-900/70 shadow-glow-lg lg:-translate-y-3'
                      : 'card card-hover',
                  )}
                >
                  {t.popular && (
                    <>
                      <span className="absolute inset-x-6 top-0 h-px bg-red-line" />
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-glow">
                        Популярный
                      </span>
                    </>
                  )}

                  <h3 className="h-display text-2xl tracking-tight">{t.name}</h3>
                  <p className="mt-2 text-sm text-white/45">{t.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    {t.oldPrice && !yearly && (
                      <span className="text-sm text-white/30 line-through">{money(t.oldPrice)}</span>
                    )}
                    <span className="h-display text-4xl tracking-tight">
                      {price === 0 ? 'Бесплатно' : money(price)}
                    </span>
                    {price > 0 && <span className="text-sm text-white/40">/ {t.period}</span>}
                  </div>

                  <Link to="/register" className="mt-6">
                    <Button full variant={t.popular ? 'primary' : 'ghost'} icon={<Zap size={15} />}>
                      {t.cta}
                    </Button>
                  </Link>

                  <ul className="mt-7 space-y-3">
                    {t.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={cn(
                            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                            f.included ? 'bg-brand-500/20 text-brand-300' : 'bg-white/6 text-white/25',
                          )}
                        >
                          {f.included ? <Check size={10} strokeWidth={3} /> : <span className="h-1 w-1 rounded-full bg-current" />}
                        </span>
                        <span className={cn('leading-snug', f.included ? 'text-white/80' : 'text-white/30 line-through')}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </Stagger>

        <Reveal delay={0.2}>
          <p className="mt-8 text-center text-xs text-white/35">
            Цены указаны с учётом налогов. Возврат в течение 14 дней — без вопросов.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Витрина маркетплейса
   ───────────────────────────────────────────── */
function MarketplacePreview() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(199,15,60,0.14),transparent_70%)]" />
      <div className="shell relative">
        <Reveal>
          <SectionHead
            eyebrow="Маркетплейс"
            title={
              <>
                Внутриигровые предметы <span className="grad-text">с защитой</span>
              </>
            }
            text="Эскроу, рейтинги продавцов и внутренний чат. Деньги переводятся только после вашего подтверждения."
            action={
              <Link to="/marketplace">
                <Button variant="ghost" icon={<Store size={16} />}>
                  Весь каталог
                </Button>
              </Link>
            }
          />
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" step={0.07}>
          {FEATURED_PRODUCTS.slice(0, 4).map((p, i) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} index={i} compact />
            </motion.div>
          ))}
        </Stagger>

        {/* Преимущества площадки */}
        <Reveal delay={0.15}>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'Эскроу-сделка', text: 'Средства заморожены до подтверждения получения товара' },
              { icon: Star, title: 'Рейтинг продавцов', text: 'Только проверенные продавцы с историей сделок' },
              { icon: Zap, title: 'Мгновенная выдача', text: 'Большинство товаров приходит за считаные минуты' },
            ].map((f) => (
              <div key={f.title} className="card flex items-start gap-3.5 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
                  <f.icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Отзывы
   ───────────────────────────────────────────── */
function Testimonials() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead
            eyebrow="Отзывы"
            title={
              <>
                Что говорят <span className="grad-text">игроки</span>
              </>
            }
            text="Средняя оценка 4.9 из 5 на основе 18 400 отзывов."
          />
        </Reveal>

        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" step={0.08}>
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={staggerItem} className="h-full">
              <Tilt max={5} className="h-full">
                <figure className="card card-hover flex h-full flex-col p-6">
                  <Rating value={t.rating} showValue={false} size={15} className="mb-4" />
                  <blockquote className="flex-1 text-sm leading-relaxed text-white/70">
                    «{t.text}»
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
                    <img src={t.avatar} alt="" className="h-9 w-9 rounded-full" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-white">{t.name}</span>
                      <span className="block truncate text-[11px] text-white/40">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Tilt>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FAQ
   ───────────────────────────────────────────── */
function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead
            eyebrow="FAQ"
            title={
              <>
                Частые <span className="grad-text">вопросы</span>
              </>
            }
            text="Не нашли ответ? Напишите нам — поддержка отвечает в среднем за 4 минуты."
          />
        </Reveal>

        <div className="mx-auto max-w-3xl space-y-2.5">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <div
                  className={cn(
                    'card overflow-hidden transition-colors duration-400',
                    isOpen && 'border-brand-500/30 bg-ink-850/70',
                  )}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center gap-4 p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="flex-1 text-sm font-bold text-white sm:text-base">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                        isOpen ? 'bg-brand-500 text-white' : 'bg-white/6 text-white/45',
                      )}
                    >
                      <ChevronDown size={15} />
                    </motion.span>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-white/55">{item.a}</p>
                  </motion.div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Финальный CTA
   ───────────────────────────────────────────── */
function FinalCta() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <GradientBorder>
            <div className="relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-12 sm:py-20">
              <GridBackdrop />
              <Particles count={18} />

              <div className="relative mx-auto max-w-2xl">
                <Badge tone="brand" className="mb-6" icon={<Sparkles size={12} />}>
                  {LANDING.promoBanner.title}
                </Badge>

                <h2 className="h-display text-3xl sm:text-5xl">
                  Начните играть <span className="grad-text text-glow">по-новому</span>
                </h2>

                <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/55">
                  {LANDING.promoBanner.text} Первая неделя — бесплатно, без привязки карты.
                </p>

                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto" icon={<Sparkles size={17} />}>
                      Создать аккаунт
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="ghost" className="w-full sm:w-auto" icon={<ArrowRight size={17} />}>
                      {LANDING.promoBanner.cta}
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/35">
                  <span className="inline-flex items-center gap-1.5">
                    <Puzzle size={12} /> 500+ игр
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Shield size={12} /> E2E шифрование
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Plane size={12} /> Работает офлайн
                  </span>
                </div>
              </div>
            </div>
          </GradientBorder>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Страница
   ───────────────────────────────────────────── */
export default function Landing() {
  return (
    <>
      <Hero />
      <Features />
      <Demo />
      <GamesStrip />
      <Pricing />
      <MarketplacePreview />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  )
}
