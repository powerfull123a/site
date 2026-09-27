import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PackageSearch, Search, Store, X } from 'lucide-react'
import { Button, EmptyState, ProductCardSkeleton, Progress } from '@/components/ui'
import { GridBackdrop, Reveal } from '@/components/fx'
import { CategoryTiles, DEFAULT_FILTERS, Filters, SortBar } from '@/components/marketplace/Filters'
import type { FiltersState } from '@/components/marketplace/Filters'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { api } from '@/api/client'
import { CATEGORIES } from '@/data/mock'
import { cn, num } from '@/lib/utils'
import type { Game, Product } from '@/types'

const PER_PAGE = 12

export default function Marketplace() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState<Product[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchDraft, setSearchDraft] = useState(params.get('q') ?? '')

  const filters: FiltersState = useMemo(
    () => ({
      gameId: params.get('game') ?? '',
      category: params.get('cat') ?? '',
      sort: params.get('sort') ?? 'popular',
      minPrice: Number(params.get('min') ?? 0),
      maxPrice: Number(params.get('max') ?? 50_000),
      onlyInstant: params.get('instant') === '1',
      onlyVerified: params.get('verified') === '1',
    }),
    [params],
  )

  const query = params.get('q') ?? ''

  const applyFilters = useCallback(
    (f: FiltersState) => {
      const next = new URLSearchParams()
      if (f.gameId) next.set('game', f.gameId)
      if (f.category) next.set('cat', f.category)
      if (f.sort !== 'popular') next.set('sort', f.sort)
      if (f.minPrice > 0) next.set('min', String(f.minPrice))
      if (f.maxPrice < 50_000) next.set('max', String(f.maxPrice))
      if (f.onlyInstant) next.set('instant', '1')
      if (f.onlyVerified) next.set('verified', '1')
      if (query) next.set('q', query)
      setParams(next, { replace: true })
      setPage(1)
    },
    [params, query, setParams],
  )

  useEffect(() => {
    void api.games().then(setGames)
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    void api
      .products({ ...filters, search: query, page, perPage: PER_PAGE })
      .then((res) => {
        if (!alive) return
        setItems(res.items)
        setTotal(res.total)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [filters, query, page])

  // Синхронизируем поле поиска с URL
  useEffect(() => setSearchDraft(query), [query])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(params)
    if (searchDraft.trim()) next.set('q', searchDraft.trim())
    else next.delete('q')
    setParams(next, { replace: true })
    setPage(1)
  }

  const setCategory = (id: string) => {
    applyFilters({ ...filters, category: id })
  }

  const pages = Math.max(1, Math.ceil(total / PER_PAGE))
  const activeGame = games.find((g) => g.id === filters.gameId)
  const activeCat = CATEGORIES.find((c) => c.id === filters.category)
  const topGames = [...games].sort((a, b) => b.productsCount - a.productsCount).slice(0, 8)

  return (
    <div className="relative">
      {/* Шапка */}
      <section className="relative overflow-hidden border-b border-white/8 pb-10 pt-12 sm:pt-16">
        <GridBackdrop />
        <div className="shell relative">
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-300">
                  <Store size={12} /> Маркетплейс
                </p>
                <h1 className="h-display text-3xl sm:text-4xl lg:text-5xl">
                  {activeGame ? activeGame.title : 'Все товары'}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
                  {activeGame
                    ? `${activeGame.players} игроков онлайн · ${num(activeGame.productsCount)} лотов с защитой сделки`
                    : 'Аккаунты, скины, валюта, бусты и услуги. Все сделки проходят через эскроу Jarwis.'}
                </p>
              </div>

              <form onSubmit={submitSearch} className="w-full lg:max-w-sm">
                <div className="relative">
                  <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    placeholder="Название товара, игра, тег…"
                    className="field py-3.5 pl-11 pr-11"
                    aria-label="Поиск товаров"
                  />
                  {searchDraft && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchDraft('')
                        const next = new URLSearchParams(params)
                        next.delete('q')
                        setParams(next, { replace: true })
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-white/35 hover:text-white"
                      aria-label="Очистить"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </Reveal>

          {/* Категории */}
          <Reveal delay={0.1}>
            <div className="mt-8">
              <CategoryTiles active={filters.category} onSelect={setCategory} />
            </div>
          </Reveal>

          {/* Активные чипы */}
          {(activeGame || activeCat || query) && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {query && (
                <button
                  onClick={() => {
                    const next = new URLSearchParams(params)
                    next.delete('q')
                    setParams(next, { replace: true })
                  }}
                  className="chip-red"
                >
                  Поиск: «{query}» <X size={12} />
                </button>
              )}
              {activeGame && (
                <button onClick={() => applyFilters({ ...filters, gameId: '' })} className="chip-red">
                  {activeGame.emoji} {activeGame.title} <X size={12} />
                </button>
              )}
              {activeCat && (
                <button onClick={() => applyFilters({ ...filters, category: '' })} className="chip-red">
                  {activeCat.emoji} {activeCat.title} <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Популярные игры */}
      <section className="shell pt-10">
        <Reveal>
          <p className="label">Популярные игры</p>
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {topGames.map((g) => (
              <button
                key={g.id}
                onClick={() => applyFilters({ ...filters, gameId: filters.gameId === g.id ? '' : g.id })}
                className={cn(
                  'group flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all duration-400',
                  filters.gameId === g.id
                    ? 'border-brand-500/50 bg-brand-500/12'
                    : 'border-white/10 bg-ink-900/50 hover:border-brand-500/35 hover:bg-ink-850/70',
                )}
              >
                <span className="text-lg transition-transform duration-300 group-hover:scale-110">{g.emoji}</span>
                <span className="text-left">
                  <span className="block text-xs font-bold text-white">{g.short}</span>
                  <span className="block text-[10px] text-white/35">{num(g.productsCount)} лотов</span>
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Содержимое */}
      <section className="shell py-10">
        <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Filters value={filters} onChange={applyFilters} resultCount={total} />
          </aside>

          <div>
            <SortBar value={filters.sort} onChange={(sort) => applyFilters({ ...filters, sort })} resultCount={total} />

            {/* Сетка */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </AnimatePresence>
              )}
            </div>

            {/* Пусто */}
            {!loading && items.length === 0 && (
              <div className="mt-6">
                <EmptyState
                  icon={<PackageSearch size={24} />}
                  title="Ничего не нашлось"
                  text="Попробуйте изменить фильтры или поисковый запрос. Возможно, товар уже куплен."
                  action={
                    <Button variant="ghost" onClick={() => applyFilters({ ...DEFAULT_FILTERS })}>
                      Сбросить всё
                    </Button>
                  }
                />
              </div>
            )}

            {/* Пагинация */}
            {pages > 1 && !loading && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Назад
                </Button>

                <div className="hidden items-center gap-1.5 sm:flex">
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    const p = i + 1
                    const active = p === page
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          'h-9 w-9 rounded-lg text-sm font-semibold transition-all duration-300',
                          active
                            ? 'bg-brand-500 text-white shadow-glow'
                            : 'border border-white/10 text-white/50 hover:border-brand-500/40 hover:text-white',
                        )}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>

                <span className="px-2 text-sm text-white/40 sm:hidden">
                  {page} / {pages}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                >
                  Вперёд
                </Button>
              </div>
            )}

            {/* Прогресс загрузки */}
            {loading && <Progress value={65} className="mt-6" />}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="shell pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card overflow-hidden p-8 sm:p-10"
        >
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="h-display text-2xl">Хотите продавать свои товары?</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
                Комиссия 5%, вывод средств в течение 24 часов, встроенный чат и защита от мошенников.
              </p>
            </div>
            <Link to="/cabinet/seller" className="shrink-0">
              <Button icon={<Store size={16} />}>Стать продавцом</Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
