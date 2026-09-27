import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Bolt, Heart, ShieldCheck, Clock } from 'lucide-react'
import { Badge, Rating } from '@/components/ui'
import { useFavorites } from '@/store/prefs'
import { USERS, GAMES } from '@/data/mock'
import { cn, money, num } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index?: number
  compact?: boolean
}

/** forwardRef обязателен: карточка рендерится внутри AnimatePresence mode="popLayout",
 *  который передаёт ref дочернему motion-элементу. */
export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(function ProductCard(
  { product, index = 0, compact = false },
  ref,
) {
  const { has, toggle } = useFavorites()
  const seller = USERS.find((u) => u.id === product.sellerId)
  const game = GAMES.find((g) => g.id === product.gameId)
  const fav = has(product.id)
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.045, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="group card card-hover flex flex-col overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden">
        <div
          className={cn(
            'relative flex items-center justify-center overflow-hidden bg-gradient-to-br transition-all duration-700 ease-smooth',
            product.preview,
            compact ? 'h-28' : 'h-40',
          )}
        >
          <span className={cn('transition-transform duration-700 group-hover:scale-125', compact ? 'text-4xl' : 'text-6xl')}>
            {product.emoji}
          </span>

          {/* Свечение при наведении */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(200px circle at 50% 60%, rgba(255,255,255,0.14), transparent 70%)' }} />

          {/* Сетка поверх */}
          <div className="absolute inset-0 dot-bg opacity-[0.14]" />

          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {discount > 0 && <Badge tone="danger">−{discount}%</Badge>}
            {product.instantDelivery && (
              <Badge tone="success" icon={<Bolt size={11} />}>
                Мгновенно
              </Badge>
            )}
          </div>

          {product.status === 'sold_out' && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/75 backdrop-blur-[2px]">
              <span className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80">
                Продано
              </span>
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggle(product.id)}
        aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
        className={cn(
          'absolute right-2.5 top-2.5 z-10 rounded-lg border p-2 backdrop-blur-md transition-all duration-300',
          fav
            ? 'border-brand-500/50 bg-brand-500/20 text-brand-300'
            : 'border-white/12 bg-ink-950/60 text-white/55 opacity-0 hover:border-brand-500/40 hover:text-brand-300 group-hover:opacity-100',
        )}
      >
        <motion.span animate={fav ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
          <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
        </motion.span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-[11px] text-white/40">
          <span>{game?.emoji}</span>
          <span className="truncate font-medium">{game?.title}</span>
          {seller?.verified && <ShieldCheck size={12} className="shrink-0 text-sky-400" />}
        </div>

        <Link to={`/product/${product.id}`} className="group/t">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover/t:text-brand-300">
            {product.title}
          </h3>
        </Link>

        <div className="mt-2.5 flex items-center gap-3">
          <Rating value={product.rating} count={product.reviewsCount} size={12} />
          <span className="text-[11px] text-white/30">· {num(product.sold)} продаж</span>
        </div>

        {!compact && product.warrantyDays > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-white/35">
            <Clock size={11} /> Гарантия {product.warrantyDays} дн. · выдача за {product.deliveryMinutes} мин
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            {product.oldPrice && (
              <span className="mr-2 text-xs text-white/30 line-through">{money(product.oldPrice)}</span>
            )}
            <span className="h-display text-lg tracking-tight text-white">{money(product.price)}</span>
          </div>
          {seller && (
            <Link
              to="/marketplace"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1.5 text-[11px] text-white/60 transition-colors hover:border-brand-500/40 hover:text-white"
              title={seller.name}
            >
              <img src={seller.avatar} alt="" className="h-4 w-4 rounded-full" />
              <span className="max-w-[7rem] truncate">{seller.name}</span>
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  )
})
