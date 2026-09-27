import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Bolt,
  Check,
  Clock,
  Heart,
  MessageSquare,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Progress,
  ProductCardSkeleton,
  Rating,
  Tabs,
  Textarea,
} from '@/components/ui'
import { Reveal } from '@/components/fx'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { api, subscribeApi } from '@/api/client'
import { CATEGORIES, GAMES, USERS } from '@/data/mock'
import { useFavorites, useWallet } from '@/store/prefs'
import { useAuth } from '@/store/auth'
import { useToast } from '@/store/toast'
import { cn, money, num, timeAgo } from '@/lib/utils'
import type { Product, Review } from '@/types'

const TABS = [
  { value: 'about', label: 'Описание' },
  { value: 'reviews', label: 'Отзывы' },
  { value: 'delivery', label: 'Доставка и оплата' },
] as const

type TabValue = (typeof TABS)[number]['value']

export default function ProductPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { has, toggle } = useFavorites()
  const { balance } = useWallet()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [similar, setSimilar] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadedOnce, setLoadedOnce] = useState(false)
  const [tab, setTab] = useState<TabValue>('about')
  const [buying, setBuying] = useState(false)
  // Инкрементается при любой мутации в api — карточка товара перечитывается
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => subscribeApi(() => setReloadTick((n) => n + 1)), [])

  useEffect(() => {
    let alive = true
    void api.product(id).then((p) => {
      if (alive) setProduct(p)
      if (alive) setLoadedOnce(true)
    })
    return () => {
      alive = false
    }
  }, [id, reloadTick])

  useEffect(() => {
    void api.similar(id).then(setSimilar)
    void api.reviews('product', id).then(setReviews)
  }, [id, reloadTick])

  const loading = product === null && !loadedOnce

  const buy = async () => {
    if (!product) return
    if (!user) {
      toast.info('Нужно войти в аккаунт', 'Войдите, чтобы купить товар и начать защищённую сделку.')
      navigate('/login')
      return
    }
    setBuying(true)
    try {
      const order = await api.createOrder({ productId: product.id, buyerId: user.id })
      toast.success(
        'Сделка открыта в эскроу',
        `Заказ ${order.id}. Средства заморожены до получения товара. Напишите продавцу в чате.`,
      )
      navigate('/cabinet/buyer')
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      toast.error(
        msg || 'Не удалось оформить заказ',
        msg === 'Недостаточно средств на балансе' ? 'Пополните кошелёк в кабинете покупателя.' : 'Попробуйте ещё раз через минуту.',
      )
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div className="shell grid gap-6 py-12 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="skeleton h-72 w-full rounded-2xl" />
          <div className="skeleton h-6 w-2/3" />
          <div className="skeleton h-24 w-full rounded-2xl" />
        </div>
        <div className="skeleton h-80 w-full rounded-2xl" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="shell py-20">
        <EmptyState
          icon={<Package size={24} />}
          title="Товар не найден"
          text="Возможно, он был снят с продажи или ссылка устарела."
          action={
            <Link to="/marketplace">
              <Button>Вернуться в маркетплейс</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const seller = USERS.find((u) => u.id === product.sellerId)
  const game = GAMES.find((g) => g.id === product.gameId)
  const cat = CATEGORIES.find((c) => c.id === product.category)
  const fav = has(product.id)
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
  const enough = balance >= product.price

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))
  const maxBucket = Math.max(1, ...ratingBuckets.map((b) => b.count))

  return (
    <div className="relative">
      {/* Хлебные крошки */}
      <div className="shell pt-8">
        <nav className="flex items-center gap-2 text-xs text-white/40">
          <Link to="/marketplace" className="inline-flex items-center gap-1.5 hover:text-white">
            <ArrowLeft size={13} /> Маркетплейс
          </Link>
          <span className="text-white/20">/</span>
          {game && (
            <>
              <Link to={`/marketplace?game=${game.id}`} className="truncate hover:text-white">
                {game.title}
              </Link>
              <span className="text-white/20">/</span>
            </>
          )}
          <span className="truncate text-white/60">{product.title}</span>
        </nav>
      </div>

      <div className="shell grid gap-6 py-8 lg:grid-cols-[1fr_22rem]">
        {/* Основная колонка */}
        <div>
          {/* Превью */}
          <Reveal>
            <div
              className={cn(
                'relative flex aspect-[21/9] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br',
                product.preview,
              )}
            >
              <div className="absolute inset-0 dot-bg opacity-[0.15]" />
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 16 }}
                className="relative text-[7rem] sm:text-[9rem]"
              >
                {product.emoji}
              </motion.span>

              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {discount > 0 && <Badge tone="danger">−{discount}%</Badge>}
                {product.instantDelivery && (
                  <Badge tone="success" icon={<Bolt size={11} />}>
                    Мгновенная доставка
                  </Badge>
                )}
                {product.warrantyDays > 0 && (
                  <Badge tone="info" icon={<RotateCcw size={11} />}>
                    Гарантия {product.warrantyDays} дн.
                  </Badge>
                )}
              </div>

              <button
                onClick={() => toggle(product.id)}
                className={cn(
                  'absolute right-4 top-4 rounded-xl border p-2.5 backdrop-blur-md transition-all duration-300',
                  fav
                    ? 'border-brand-500/50 bg-brand-500/20 text-brand-300'
                    : 'border-white/12 bg-ink-950/60 text-white/60 hover:border-brand-500/40 hover:text-brand-300',
                )}
                aria-label="В избранное"
              >
                <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
              </button>
            </div>
          </Reveal>

          {/* Заголовок */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
              {game && (
                <Link to={`/marketplace?game=${game.id}`} className="hover:text-white">
                  {game.emoji} {game.title}
                </Link>
              )}
              <span className="text-white/20">·</span>
              <Link to={`/marketplace?cat=${product.category}`} className="hover:text-white">
                {cat?.emoji} {cat?.title}
              </Link>
            </div>

            <h1 className="mt-2.5 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {product.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Rating value={product.rating} count={product.reviewsCount} size={15} />
              <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
                <TrendingUp size={13} className="text-emerald-400" /> {num(product.sold)} продаж
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
                <Clock size={13} className="text-sky-400" /> Выдача за {product.deliveryMinutes} мин
              </span>
              <span className="text-xs text-white/30">Опубликовано {timeAgo(product.createdAt)}</span>
            </div>
          </div>

          {/* Табы */}
          <div className="mt-8">
            <Tabs
              value={tab}
              onChange={setTab}
              items={TABS.map((t) => ({
                ...t,
                badge:
                  t.value === 'reviews' && reviews.length > 0 ? (
                    <span className="rounded-full bg-white/10 px-1.5 text-[10px]">{reviews.length}</span>
                  ) : undefined,
              }))}
            />

            <div className="mt-5">
              {tab === 'about' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card p-6"
                >
                  <h2 className="h-display text-lg">Описание</h2>
                  <p className="mt-3.5 text-sm leading-relaxed text-white/60">{product.description}</p>

                  <h3 className="mt-6 text-sm font-bold text-white">Что входит в товар</h3>
                  <ul className="mt-3 space-y-2.5">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                          <Check size={10} strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-6 text-sm font-bold text-white">Теги</h3>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {product.tags.map((t) => (
                      <Link key={t} to={`/marketplace?q=${t}`} className="chip hover:border-brand-500/40">
                        #{t}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'reviews' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <div className="card p-6">
                    {/* Сводка */}
                    <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
                      <div className="text-center sm:text-left">
                        <p className="h-display text-5xl">{product.rating.toFixed(1)}</p>
                        <Rating value={product.rating} showValue={false} size={16} className="mt-2" />
                        <p className="mt-1.5 text-xs text-white/40">{product.reviewsCount} отзывов</p>
                      </div>

                      <div className="space-y-1.5">
                        {ratingBuckets.map((b) => (
                          <div key={b.star} className="flex items-center gap-2.5">
                            <span className="w-8 text-xs text-white/40">{b.star} ★</span>
                            <Progress
                              value={(b.count / maxBucket) * 100}
                              tone={b.star >= 4 ? 'success' : b.star === 3 ? 'warn' : 'brand'}
                              className="flex-1"
                            />
                            <span className="w-6 text-right text-xs text-white/35">{b.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Список */}
                  <div className="mt-4 space-y-3">
                    {reviews.length === 0 ? (
                      <EmptyState
                        icon={<Star size={22} />}
                        title="Отзывов пока нет"
                        text="Станьте первым, кто оставит отзыв об этом товаре."
                      />
                    ) : (
                      reviews.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          className="card p-5"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar src={r.authorAvatar} name={r.authorName} size={38} />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-white">{r.authorName}</span>
                                <Rating value={r.rating} showValue={false} size={11} />
                                <span className="ml-auto text-[11px] text-white/30">{timeAgo(r.createdAt)}</span>
                              </div>
                              <p className="mt-2 text-sm leading-relaxed text-white/60">{r.text}</p>
                              {r.reply && (
                                <div className="mt-3 rounded-xl border-l-2 border-brand-500/50 bg-ink-950/50 p-3">
                                  <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-brand-300">
                                    <BadgeCheck size={12} /> Ответ продавца
                                  </p>
                                  <p className="text-xs leading-relaxed text-white/50">{r.reply}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <AddReview productId={product.id} onAdded={(r) => setReviews((p) => [r, ...p])} />
                </motion.div>
              )}

              {tab === 'delivery' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="card p-6">
                    <h2 className="h-display text-lg">Как проходит сделка</h2>
                    <ol className="mt-4 space-y-4">
                      {[
                        'Вы оплачиваете товар — деньги замораживаются в эскроу Jarwis.',
                        'Продавец получает заказ и передаёт товар в защищённом чате.',
                        'Вы проверяете товар и нажимаете «Подтвердить получение».',
                        'Только после этого средства переводятся продавцу.',
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 font-mono text-xs font-bold text-brand-300">
                            {i + 1}
                          </span>
                          <p className="pt-1 text-sm leading-relaxed text-white/60">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="card p-6">
                    <h3 className="h-display text-base">Если что-то пошло не так</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                      Откройте спор в личном кабинете в течение 24 часов. Модерация Jarwis рассмотрит обращение
                      по данным защищённой сделки и переписки. При подтверждении проблемы деньги возвращаются
                      полностью — комиссия площадки не удерживается.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge tone="success" icon={<RotateCcw size={11} />}>Возврат 100%</Badge>
                      <Badge tone="info" icon={<ShieldCheck size={11} />}>Рассмотрение до 24 ч</Badge>
                      <Badge tone="brand" icon={<Wallet size={11} />}>Эскроу включён</Badge>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Панель покупки */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-5 p-5">
            <div>
              <div className="flex items-baseline gap-2.5">
                {product.oldPrice && (
                  <span className="text-sm text-white/30 line-through">{money(product.oldPrice)}</span>
                )}
                <span className="h-display text-3xl">{money(product.price)}</span>
              </div>
              <p className="mt-1.5 text-xs text-white/35">
                Комиссия площадки 5% включена · {money(Math.round(product.price * 0.05))}
              </p>
            </div>

            {!enough && (
              <div className="rounded-xl border border-gold-400/30 bg-gold-400/8 p-3.5">
                <p className="text-xs leading-relaxed text-gold-200">
                  На балансе {money(balance)}. Не хватает {money(product.price - balance)} — пополните счёт,
                  чтобы купить с баланса, или оплатите картой.
                </p>
              </div>
            )}

            <Button full size="lg" loading={buying} onClick={buy} icon={<ShoppingCart size={17} />}>
              Купить
            </Button>

            <Button full variant="ghost" icon={<MessageSquare size={16} />}>
              Написать продавцу
            </Button>

            <div className="hairline" />

            {/* Продавец */}
            {seller && (
              <div>
                <p className="label">Продавец</p>
                <Link
                  to="/marketplace"
                  className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-brand-500/35"
                >
                  <Avatar src={seller.avatar} name={seller.name} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-bold text-white">
                      {seller.name}
                      {seller.verified && <ShieldCheck size={14} className="shrink-0 text-sky-400" />}
                    </p>
                    <Rating value={seller.rating} count={seller.reviewsCount} size={11} className="mt-0.5" />
                  </div>
                </Link>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    ['Сделок', num(seller.dealsCount)],
                    ['Онлайн', seller.lastSeen < new Date(Date.now() - 86_400_000).toISOString() ? 'да' : '2 ч'],
                    ['Отзывов', num(seller.reviewsCount)],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-lg border border-white/8 py-2">
                      <p className="text-[10px] text-white/35">{l}</p>
                      <p className="text-xs font-bold text-white">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="hairline" />

            {/* Гарантии */}
            <ul className="space-y-2.5">
              {[
                { icon: ShieldCheck, text: 'Безопасная сделка (эскроу)' },
                { icon: Clock, text: `Выдача в течение ${product.deliveryMinutes} мин` },
                { icon: RotateCcw, text: product.warrantyDays > 0 ? `Возврат ${product.warrantyDays} дней` : 'Возврат по спору' },
                { icon: Package, text: `Осталось ${product.inStock} шт.` },
              ].map((g) => (
                <li key={g.text} className="flex items-center gap-2.5 text-xs text-white/55">
                  <g.icon size={14} className="shrink-0 text-brand-400" />
                  {g.text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Похожие */}
      {similar.length > 0 && (
        <section className="shell py-12">
          <h2 className="h-display mb-6 text-2xl">Похожие товары</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Форма добавления отзыва
   ───────────────────────────────────────────── */
function AddReview({ productId, onAdded }: { productId: string; onAdded: (r: Review) => void }) {
  const { user } = useAuth()
  const toast = useToast()
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.info('Войдите, чтобы оставить отзыв')
      return
    }
    if (text.trim().length < 10) {
      toast.warning('Слишком короткий отзыв', 'Напишите хотя бы 10 символов.')
      return
    }
    setSaving(true)
    const review = await api.addReview({
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      targetType: 'product',
      targetId: productId,
      rating,
      text: text.trim(),
    })
    onAdded(review)
    setText('')
    setSaving(false)
    toast.success('Отзыв опубликован', 'Спасибо, что помогаете другим покупателям.')
  }

  return (
    <form onSubmit={submit} className="card mt-4 p-5">
      <h3 className="text-sm font-bold text-white">Оставить отзыв</h3>

      <div className="mt-3.5 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} звёзд`}>
            <Star
              size={22}
              className={cn(
                'transition-all duration-200',
                i <= rating ? 'text-gold-400' : 'text-white/15',
                'hover:scale-110',
              )}
              fill={i <= rating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-white/40">{rating} из 5</span>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Расскажите, как прошла сделка…"
        rows={3}
        className="mt-3.5"
        maxLength={600}
      />

      <Button type="submit" size="sm" loading={saving} className="mt-3.5">
        Опубликовать
      </Button>
    </form>
  )
}

export { ProductCardSkeleton }
