import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Check,
  Cpu,
  Gamepad2,
  Globe,
  Headphones,
  Mic,
  Plane,
  Rocket,
  Shield,
  Sparkles,
  Store,
  Users,
  Zap,
} from 'lucide-react'
import { Badge, Button, SectionHead } from '@/components/ui'
import { GridBackdrop, Reveal, Stagger, Tilt, staggerItem } from '@/components/fx'
import { AI_FEATURES, FAQ, TARIFFS, TESTIMONIALS } from '@/data/mock'
import { money } from '@/lib/utils'

/* ─────────────────────────────────────────────
   О платформе
   ───────────────────────────────────────────── */
export function About() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8 py-16 sm:py-24">
        <GridBackdrop />
        <div className="shell relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <Badge tone="brand" className="mb-6" icon={<Sparkles size={12} />}>
                О платформе
              </Badge>
              <h1 className="h-display text-4xl sm:text-6xl">
                Технология, которая <span className="grad-text text-glow">выигрывает</span> для игроков
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
                Мы строим два продукта в одном: голосового ИИ-ассистента, который понимает игру, и маркетплейс,
                где нельзя обмануть. Оба работают на собственной инфраструктуре Jarvis.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto" icon={<Rocket size={17} />}>
                    Попробовать бесплатно
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button size="lg" variant="ghost" className="w-full sm:w-auto" icon={<Store size={17} />}>
                    Открыть маркетплейс
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Миссия */}
      <section className="shell py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal dir="right">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-300">
              Миссия
            </p>
            <h2 className="h-display text-3xl sm:text-4xl">
              Игры без <span className="grad-text">фрустрации</span>
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/55">
              <p>
                Мы устали от ощущения, что хорошие игры портят две вещи: переключение между приложениями и
                недоверие к покупкам. Поэтому Jarvis решает обе проблемы сразу.
              </p>
              <p>
                Ассистент слышит вас, когда вы играете, и отвечает голосом прямо в игре — без Alt+Tab, без
                окна поверх. Маркетплейс работает как защищённая биржа: деньги замораживаются, пока вы не
                подтвердите, что товар получен.
              </p>
              <p>
                Никакой подписки «на вкус». Мы зарабатываем на честной комиссии с продаж, а не на навязчивых
                ограничениях.
              </p>
            </div>
          </Reveal>

          <Reveal dir="left" delay={0.1}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {[
                { icon: Mic, title: 'Голос в первую очередь', text: 'Микрофон обрабатывается локально, задержка 98 мс' },
                { icon: Plane, title: 'Работает офлайн', text: 'Локальная модель вместо облака — в метро и самолёте' },
                { icon: Shield, title: 'Эскроу по умолчанию', text: 'Ни одна сделка не проходит без защиты' },
                { icon: Globe, title: '500+ игр', text: 'От киберспорта до песочниц, плюс открытый API' },
              ].map((f) => (
                <Tilt key={f.title} max={6} className="h-full">
                  <div className="card h-full p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400 ring-1 ring-brand-500/20">
                      <f.icon size={19} />
                    </span>
                    <p className="mt-4 text-sm font-bold text-white">{f.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/45">{f.text}</p>
                  </div>
                </Tilt>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Как устроена система */}
      <section className="relative overflow-hidden border-y border-white/8 bg-ink-900/30 py-20 sm:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead
              eyebrow="Архитектура"
              title={
                <>
                  Что внутри <span className="grad-text">Jarvis</span>
                </>
              }
              text="Три слоя, которые работают вместе: локальный рантайм, облачный интеллект и защищённый слой сделок."
            />
          </Reveal>

          <Stagger className="grid gap-4 md:grid-cols-3" step={0.12}>
            {[
              {
                icon: Cpu,
                title: 'Локальный рантайм',
                text: 'Компактная модель на вашем устройстве. Распознаёт речь, читает состояние игры и отвечает без сети за 40 мс.',
                points: ['Wake-word «Эй, Джарвис»', 'Работа на CPU и GPU', 'Полностью офлайн'],
              },
              {
                icon: Bot,
                title: 'Облачный интеллект',
                text: 'Опционально подключается для сложных запросов: разбор стратегий, перевод, генерация контента.',
                points: ['Обезличенные запросы', 'E2E шифрование', 'Отключается одной кнопкой'],
              },
              {
                icon: Shield,
                title: 'Слой сделок',
                text: 'Эскроу, рейтинги, внутренний чат и автоматический антифрод для маркетплейса.',
                points: ['Заморозка средств', 'Споры с возвратом', 'Рейтинг продавцов'],
              },
            ].map((layer) => (
              <motion.div key={layer.title} variants={staggerItem} className="h-full">
                <div className="card card-hover flex h-full flex-col p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/25 to-brand-700/10 text-brand-400 ring-1 ring-brand-500/25">
                    <layer.icon size={22} />
                  </span>
                  <h3 className="mt-5 h-display text-lg">{layer.title}</h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-white/50">{layer.text}</p>
                  <ul className="mt-5 space-y-2 border-t border-white/8 pt-4">
                    {layer.points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-xs text-white/50">
                        <Check size={12} className="shrink-0 text-brand-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Цифры */}
      <section className="shell py-20 sm:py-24">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" step={0.08}>
          {[
            { value: '2.4M', label: 'активных игроков', icon: Users },
            { value: '12M', label: 'сделок в эскроу', icon: Store },
            { value: '99.2%', label: 'успешных сделок', icon: Check },
            { value: '40ms', label: 'отклик ассистента', icon: Zap },
          ].map((s) => (
            <motion.div key={s.label} variants={staggerItem}>
              <div className="card p-6 text-center">
                <s.icon size={20} className="mx-auto mb-4 text-brand-400" />
                <p className="h-display text-3xl">{s.value}</p>
                <p className="mt-1.5 text-xs text-white/40">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </Stagger>
      </section>

      {/* Тарифы */}
      <section className="relative overflow-hidden border-y border-white/8 bg-ink-900/30 py-20 sm:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead
              eyebrow="Тарифы"
              title={
                <>
                  Честные <span className="grad-text">условия</span>
                </>
              }
              text="Один тариф — все игры. Никаких скрытых платежей за базовые функции."
            />
          </Reveal>

          <div className="grid gap-4 lg:grid-cols-3">
            {TARIFFS.map((t) => (
              <div
                key={t.id}
                className={
                  t.popular
                    ? 'relative rounded-2xl border border-brand-500/40 bg-gradient-to-b from-brand-950/50 to-ink-900/70 p-6 shadow-glow-lg'
                    : 'card p-6'
                }
              >
                {t.popular && <span className="absolute inset-x-6 top-0 h-px bg-red-line" />}
                <h3 className="h-display text-2xl">{t.name}</h3>
                <p className="mt-2 text-sm text-white/45">{t.tagline}</p>
                <p className="mt-5 h-display text-4xl">
                  {t.price === 0 ? 'Бесплатно' : money(t.price)}
                </p>
                {t.price > 0 && <p className="text-xs text-white/35">в месяц</p>}
                <Link to="/register" className="mt-6 block">
                  <Button full variant={t.popular ? 'primary' : 'ghost'}>
                    {t.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Преимущества списком */}
      <section className="shell py-20 sm:py-24">
        <Reveal>
          <SectionHead
            eyebrow="Возможности"
            title={
              <>
                Всё, что <span className="grad-text">включено</span>
              </>
            }
          />
        </Reveal>
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" step={0.06}>
          {AI_FEATURES.map((f) => (
            <motion.div key={f.title} variants={staggerItem} className="card flex items-start gap-3.5 p-5">
              <span className="text-2xl">{f.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/45">{f.text}</p>
              </div>
            </motion.div>
          ))}
        </Stagger>
      </section>

      {/* Отзывы */}
      <section className="relative overflow-hidden border-y border-white/8 bg-ink-900/30 py-20 sm:py-24">
        <div className="shell">
          <Reveal>
            <SectionHead
              eyebrow="Отзывы"
              title={
                <>
                  Нас <span className="grad-text">рекомендуют</span>
                </>
              }
            />
          </Reveal>
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" step={0.08}>
            {TESTIMONIALS.slice(0, 6).map((t) => (
              <motion.figure key={t.name} variants={staggerItem} className="card p-6">
                <blockquote className="text-sm leading-relaxed text-white/65">«{t.text}»</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
                  <img src={t.avatar} alt="" className="h-9 w-9 rounded-full" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{t.name}</p>
                    <p className="truncate text-[11px] text-white/40">{t.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="shell py-20 sm:py-24">
        <Reveal>
          <SectionHead
            eyebrow="FAQ"
            title={
              <>
                Частые <span className="grad-text">вопросы</span>
              </>
            }
          />
        </Reveal>
        <Accordion items={FAQ} />
      </section>

      {/* Контакты */}
      <section id="contacts" className="shell pb-24">
        <Reveal>
          <div className="card overflow-hidden p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="h-display text-3xl">Нужна помощь?</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
                  Поддержка работает круглосуточно и отвечает в среднем за 4 минуты. Выберите удобный канал.
                </p>
                <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                  <Button icon={<Headphones size={16} />}>Чат поддержки</Button>
                  <Button variant="ghost" icon={<Globe size={16} />}>Документация</Button>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { icon: Headphones, label: 'Поддержка', value: 'support@jarwis.gg' },
                  { icon: Store, label: 'Сотрудничество', value: 'partners@jarwis.gg' },
                  { icon: Gamepad2, label: 'Для разработчиков', value: 'api@jarwis.gg' },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-3.5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
                      <c.icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] text-white/35">{c.label}</p>
                      <p className="truncate text-sm font-semibold text-white">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Аккордеон FAQ (используется и на лендинге)
   ───────────────────────────────────────────── */
export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl space-y-2.5">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={item.q}
            className={
              isOpen ? 'card overflow-hidden border-brand-500/30 bg-ink-850/70' : 'card overflow-hidden'
            }
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
                className={
                  isOpen ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white' : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/6 text-white/45'
                }
              >
                <ArrowRight size={15} className="-rotate-90" />
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
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Тарифы — отдельная страница
   ───────────────────────────────────────────── */
export function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b border-white/8 py-16 sm:py-20">
        <GridBackdrop />
        <div className="shell relative text-center">
          <Reveal>
            <Badge tone="brand" className="mb-6" icon={<Sparkles size={12} />}>
              Тарифы
            </Badge>
            <h1 className="h-display text-4xl sm:text-6xl">
              Платите только за <span className="grad-text text-glow">то, чем пользуетесь</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
              Начните с бесплатного тарифа. Обновитесь, когда Jarvis станет частью вашей игры.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/60 px-5 py-3">
              <span className={!yearly ? 'text-sm font-semibold text-white' : 'text-sm text-white/40'}>Ежемесячно</span>
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
                  className={
                    yearly
                      ? 'absolute left-6 top-1 h-5 w-5 rounded-full bg-brand-500 shadow'
                      : 'absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow'
                  }
                />
              </button>
              <span className={yearly ? 'text-sm font-semibold text-white' : 'text-sm text-white/40'}>
                За год
                <span className="ml-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  −35%
                </span>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="shell py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {TARIFFS.map((t, i) => {
            const price = yearly && t.price > 0 ? Math.round((t.price * 12 * 0.65) / 12) : t.price
            return (
              <Reveal key={t.id} delay={i * 0.1}>
                <div
                  className={
                    t.popular
                      ? 'relative flex h-full flex-col rounded-2xl border border-brand-500/40 bg-gradient-to-b from-brand-950/50 to-ink-900/70 p-7 shadow-glow-lg lg:-translate-y-3'
                      : 'card card-hover flex h-full flex-col p-7'
                  }
                >
                  {t.popular && (
                    <>
                      <span className="absolute inset-x-7 top-0 h-px bg-red-line" />
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-glow">
                        Популярный
                      </span>
                    </>
                  )}

                  <h2 className="h-display text-2xl">{t.name}</h2>
                  <p className="mt-2 text-sm text-white/45">{t.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    {t.oldPrice && !yearly && (
                      <span className="text-sm text-white/30 line-through">{money(t.oldPrice)}</span>
                    )}
                    <span className="h-display text-4xl">{price === 0 ? 'Бесплатно' : money(price)}</span>
                    {price > 0 && <span className="text-sm text-white/40">/ {t.period}</span>}
                  </div>

                  <Link to="/register" className="mt-6">
                    <Button full size="lg" variant={t.popular ? 'primary' : 'ghost'}>
                      {t.cta}
                    </Button>
                  </Link>

                  <ul className="mt-7 space-y-3">
                    {t.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={
                            f.included
                              ? 'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300'
                              : 'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/6 text-white/25'
                          }
                        >
                          {f.included ? <Check size={10} strokeWidth={3} /> : <span className="h-1 w-1 rounded-full bg-current" />}
                        </span>
                        <span className={f.included ? 'leading-snug text-white/80' : 'text-white/30 line-through'}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'Возврат 14 дней', text: 'Без объяснения причин' },
              { icon: Zap, title: 'Мгновенная оплата', text: 'Карты, СБП, крипта' },
              { icon: Headphones, title: 'Поддержка 24/7', text: 'Отвечаем за 4 минуты' },
            ].map((f) => (
              <div key={f.title} className="card flex items-center gap-3.5 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400">
                  <f.icon size={17} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="text-xs text-white/40">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  )
}
