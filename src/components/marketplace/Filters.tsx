import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { CATEGORIES, GAMES } from '@/data/mock'
import { cn, money, num, plural } from '@/lib/utils'

export interface FiltersState {
  gameId: string
  category: string
  sort: string
  minPrice: number
  maxPrice: number
  onlyInstant: boolean
  onlyVerified: boolean
}

export const DEFAULT_FILTERS: FiltersState = {
  gameId: '',
  category: '',
  sort: 'popular',
  minPrice: 0,
  maxPrice: 50_000,
  onlyInstant: false,
  onlyVerified: false,
}

const SORTS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешёвые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'new', label: 'Новинки' },
]

const PRICE_STEPS = [0, 500, 1000, 2500, 5000, 10_000, 25_000, 50_000]

export function Filters({
  value,
  onChange,
  resultCount,
}: {
  value: FiltersState
  onChange: (f: FiltersState) => void
  resultCount: number
}) {
  const [open, setOpen] = useState(false)
  const [gamesOpen, setGamesOpen] = useState(false)

  const set = (patch: Partial<FiltersState>) => onChange({ ...value, ...patch })
  const activeCount =
    (value.gameId ? 1 : 0) +
    (value.category ? 1 : 0) +
    (value.onlyInstant ? 1 : 0) +
    (value.onlyVerified ? 1 : 0) +
    (value.minPrice > 0 || value.maxPrice < 50_000 ? 1 : 0)

  const reset = () => onChange({ ...DEFAULT_FILTERS })
  const activeGame = GAMES.find((g) => g.id === value.gameId)

  return (
    <div className="space-y-3">
      {/* Мобильный переключатель */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost w-full justify-between sm:hidden"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} /> Фильтры
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-500 px-1.5 text-[10px] font-bold">{activeCount}</span>
          )}
        </span>
        <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <div className={cn('space-y-3', !open && 'hidden sm:block')}>
        <div className="card space-y-5 p-4">
          {/* Игра */}
          <div>
            <p className="label">Игра</p>
            <div className="relative">
              <button
                onClick={() => setGamesOpen((v) => !v)}
                className="field flex items-center justify-between text-left"
              >
                <span className={cn('truncate', !value.gameId && 'text-white/30')}>
                  {activeGame ? `${activeGame.emoji} ${activeGame.title}` : 'Все игры'}
                </span>
                <ChevronDown size={15} className={cn('shrink-0 text-white/35 transition-transform', gamesOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {gamesOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setGamesOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="glass absolute left-0 right-0 top-full z-20 mt-1.5 max-h-72 overflow-y-auto rounded-xl p-1.5 shadow-glow-lg"
                    >
                      <FilterRow active={!value.gameId} onClick={() => { set({ gameId: '' }); setGamesOpen(false) }}>
                        Все игры
                      </FilterRow>
                      {GAMES.map((g) => (
                        <FilterRow
                          key={g.id}
                          active={value.gameId === g.id}
                          onClick={() => { set({ gameId: g.id }); setGamesOpen(false) }}
                        >
                          <span className="mr-2">{g.emoji}</span>
                          {g.title}
                          <span className="ml-auto text-[11px] text-white/30">{num(g.productsCount)}</span>
                        </FilterRow>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Категории */}
          <div>
            <p className="label">Категория</p>
            <div className="flex flex-wrap gap-1.5">
              <CatChip active={!value.category} onClick={() => set({ category: '' })}>
                Все
              </CatChip>
              {CATEGORIES.map((c) => (
                <CatChip
                  key={c.id}
                  active={value.category === c.id}
                  onClick={() => set({ category: value.category === c.id ? '' : c.id })}
                >
                  {c.emoji} {c.title}
                </CatChip>
              ))}
            </div>
          </div>

          {/* Цена */}
          <div>
            <p className="label">Цена, ₽</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={value.minPrice || ''}
                placeholder="от"
                onChange={(e) => set({ minPrice: Math.max(0, Number(e.target.value) || 0) })}
                className="field py-2.5 text-sm"
                aria-label="Цена от"
              />
              <span className="text-white/25">—</span>
              <input
                type="number"
                value={value.maxPrice >= 50_000 ? '' : value.maxPrice}
                placeholder="до"
                onChange={(e) => set({ maxPrice: Math.max(0, Number(e.target.value) || 0) })}
                className="field py-2.5 text-sm"
                aria-label="Цена до"
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {PRICE_STEPS.slice(0, -1).map((step) => {
                const next = PRICE_STEPS[PRICE_STEPS.indexOf(step) + 1]
                const active = value.minPrice === step && value.maxPrice === next
                return (
                  <button
                    key={step}
                    onClick={() => set({ minPrice: active ? 0 : step, maxPrice: active ? 50_000 : next })}
                    className={cn(
                      'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors',
                      active
                        ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                        : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/80',
                    )}
                  >
                    до {money(next, { compact: true })}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Переключатели */}
          <div className="space-y-2.5 border-t border-white/8 pt-4">
            <CheckToggle
              checked={value.onlyInstant}
              onChange={(v) => set({ onlyInstant: v })}
              label="Только мгновенная доставка"
            />
            <CheckToggle
              checked={value.onlyVerified}
              onChange={(v) => set({ onlyVerified: v })}
              label="Только проверенные продавцы"
            />
          </div>

          {activeCount > 0 && (
            <Button variant="subtle" size="sm" full icon={<RotateCcw size={14} />} onClick={reset}>
              Сбросить фильтры
            </Button>
          )}
        </div>

        <p className="px-1 text-xs text-white/35">
          Найдено {num(resultCount)} {plural(resultCount, ['товар', 'товара', 'товаров'])}
        </p>
      </div>
    </div>
  )
}

function FilterRow({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors',
        active ? 'bg-brand-500/15 font-semibold text-brand-300' : 'text-white/65 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      {children}
      {active && <Check size={14} className="ml-auto shrink-0" />}
    </button>
  )
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-300',
        active
          ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
          : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/85',
      )}
    >
      {children}
    </button>
  )
}

function CheckToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center gap-2.5 text-left">
      <span
        className={cn(
          'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-all duration-300',
          checked ? 'border-brand-500 bg-brand-500' : 'border-white/20',
        )}
        style={{ height: 18, width: 18 }}
      >
        {checked && <Check size={12} strokeWidth={3} className="text-white" />}
      </span>
      <span className={cn('text-xs transition-colors', checked ? 'text-white' : 'text-white/50')}>{label}</span>
    </button>
  )
}

/* ─────────────────────────────────────────────
   Сортировка (десктоп)
   ───────────────────────────────────────────── */
export function SortBar({
  value,
  onChange,
  resultCount,
}: {
  value: string
  onChange: (v: string) => void
  resultCount: number
}) {
  const [open, setOpen] = useState(false)
  const current = SORTS.find((s) => s.value === value)

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-white/40">
        <span className="font-semibold text-white">{num(resultCount)}</span> товаров
      </p>

      <div className="relative">
        <button onClick={() => setOpen((v) => !v)} className="btn-ghost btn-sm gap-2">
          {current?.label}
          <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                className="glass absolute right-0 top-full z-20 mt-1.5 w-52 overflow-hidden rounded-xl p-1.5 shadow-glow-lg"
              >
                {SORTS.map((s) => (
                  <FilterRow
                    key={s.value}
                    active={s.value === value}
                    onClick={() => {
                      onChange(s.value)
                      setOpen(false)
                    }}
                  >
                    {s.label}
                  </FilterRow>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Категории-иконки (для главной страницы маркетплейса)
   ───────────────────────────────────────────── */
export function CategoryTiles({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
      {CATEGORIES.map((c) => {
        const isActive = active === c.id
        return (
          <motion.button
            key={c.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(isActive ? '' : c.id)}
            className={cn(
              'group relative overflow-hidden rounded-xl border p-3.5 text-left transition-colors duration-300',
              isActive
                ? 'border-brand-500/50 bg-brand-500/12'
                : 'border-white/10 bg-ink-900/50 hover:border-brand-500/35 hover:bg-ink-850/70',
            )}
          >
            {isActive && <X size={12} className="absolute right-2 top-2 text-brand-300" />}
            <span className="block text-xl transition-transform duration-300 group-hover:scale-110">{c.emoji}</span>
            <p className="mt-2 text-xs font-bold text-white">{c.title}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-white/35">{c.hint}</p>
          </motion.button>
        )
      })}
    </div>
  )
}
