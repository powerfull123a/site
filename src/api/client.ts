/* ─────────────────────────────────────────────
   Слой доступа к данным.

   Сейчас работает на мок-адаптере (данные из src/data/mock.ts,
   состояние — в localStorage), но контракт повторяет реальный REST API.
   Чтобы подключить бэкенд, достаточно задать VITE_API_URL в .env —
   клиент уйдёт по HTTP, а сигнатуры вызовов останутся теми же.
   ───────────────────────────────────────────── */

import {
  ADMIN_STATS,
  GAMES,
  ORDERS,
  PRODUCTS,
  REVIEWS,
  THREADS,
  USERS,
} from '@/data/mock'
import type {
  AdminStats,
  ChatMessage,
  ChatThread,
  Game,
  Order,
  Product,
  Review,
  User,
} from '@/types'
import { uid } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL as string | undefined
const USE_REMOTE = Boolean(API_URL)

/** Искусственная задержка — чтобы UI-состояния загрузки были видны. */
const delay = <T>(value: T, ms = 260 + Math.random() * 240): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

/* ────────────── Локальное хранилище (мок) ────────────── */
const NS = 'jarwis:v1:'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(NS + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value))
  } catch {
    /* приватный режим — просто игнорируем */
  }
}

const store = {
  products: () => read<Product[]>('products', PRODUCTS),
  setProducts: (v: Product[]) => write('products', v),
  orders: () => read<Order[]>('orders', ORDERS),
  setOrders: (v: Order[]) => write('orders', v),
  reviews: () => read<Review[]>('reviews', REVIEWS),
  setReviews: (v: Review[]) => write('reviews', v),
  threads: () => read<ChatThread[]>('threads', THREADS),
  setThreads: (v: ChatThread[]) => write('threads', v),
  users: () => read<User[]>('users', USERS),
  setUsers: (v: User[]) => write('users', v),
  favorites: () => read<string[]>('favorites', []),
  setFavorites: (v: string[]) => write('favorites', v),
  balance: () => read<number>('balance', 48_920),
  setBalance: (v: number) => write('balance', v),
}

/* ────────────── Канал переинвалидации ──────────────
   Любая мутация оповещает подписчиков, чтобы экраны,
   держащие собственные копии данных, перечитали их. */
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeApi(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function notify() {
  listeners.forEach((fn) => fn())
}

/* ────────────── Реальный транспорт (заглушка) ────────────── */
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

/* ─────────────────────────────────────────────
   Публичное API
   ───────────────────────────────────────────── */

export interface ProductQuery {
  gameId?: string
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  /** 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'new' */
  sort?: string
  onlyInstant?: boolean
  onlyVerified?: boolean
  page?: number
  perPage?: number
}

export const api = {
  mode: (USE_REMOTE ? 'remote' : 'mock') as 'remote' | 'mock',

  /* — Игры и справочники — */
  async games(): Promise<Game[]> {
    if (USE_REMOTE) return http<Game[]>('/games')
    return delay(GAMES)
  },

  /* — Товары — */
  async products(q: ProductQuery = {}): Promise<{ items: Product[]; total: number }> {
    if (USE_REMOTE) {
      const qs = new URLSearchParams(
        Object.entries(q).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
      ).toString()
      return http(`/products?${qs}`)
    }

    let items = store.products().filter((p) => p.status !== 'banned')

    if (q.gameId) items = items.filter((p) => p.gameId === q.gameId)
    if (q.category) items = items.filter((p) => p.category === q.category)
    if (q.onlyInstant) items = items.filter((p) => p.instantDelivery)
    if (q.onlyVerified) {
      const verified = new Set(store.users().filter((u) => u.verified).map((u) => u.id))
      items = items.filter((p) => verified.has(p.sellerId))
    }
    if (q.minPrice != null) items = items.filter((p) => p.price >= q.minPrice!)
    if (q.maxPrice != null) items = items.filter((p) => p.price <= q.maxPrice!)

    if (q.search) {
      const s = q.search.trim().toLowerCase()
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.tags.some((t) => t.includes(s)),
      )
    }

    const sorters: Record<string, (a: Product, b: Product) => number> = {
      popular: (a, b) => b.sold - a.sold,
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount,
      new: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    }
    items = [...items].sort(sorters[q.sort ?? 'popular'])

    const total = items.length
    const page = q.page ?? 1
    const perPage = q.perPage ?? 12
    return delay({ items: items.slice((page - 1) * perPage, page * perPage), total })
  },

  async product(id: string): Promise<Product | null> {
    if (USE_REMOTE) return http<Product>(`/products/${id}`)
    return delay(store.products().find((p) => p.id === id) ?? null)
  },

  /* Смена статуса лота продавцом или модератором */
  async updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
    if (USE_REMOTE) return http<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    const products = store.products()
    const idx = products.findIndex((p) => p.id === id)
    if (idx < 0) throw new Error('Товар не найден')
    products[idx] = { ...products[idx], ...patch }
    store.setProducts(products)
    notify()
    return delay(products[idx], 200)
  },

  /* Новый лот продавца — сразу уходит на модерацию */
  async createProduct(input: Omit<Product, 'id' | 'createdAt' | 'status' | 'sold'>): Promise<Product> {
    if (USE_REMOTE) return http<Product>('/products', { method: 'POST', body: JSON.stringify(input) })
    const product: Product = {
      ...input,
      id: `p_new_${uid('l')}`,
      sold: 0,
      status: 'moderation',
      createdAt: new Date().toISOString(),
    }
    store.setProducts([product, ...store.products()])
    notify()
    return delay(product, 500)
  },

  async similar(productId: string): Promise<Product[]> {
    if (USE_REMOTE) return http<Product[]>(`/products/${productId}/similar`)
    const src = store.products().find((p) => p.id === productId)
    if (!src) return delay([])
    return delay(
      store
        .products()
        .filter((p) => p.id !== productId && p.gameId === src.gameId)
        .slice(0, 4),
    )
  },

  /* — Отзывы — */
  async reviews(targetType: 'product' | 'seller', targetId: string): Promise<Review[]> {
    if (USE_REMOTE) return http<Review[]>(`/reviews?targetType=${targetType}&targetId=${targetId}`)
    return delay(store.reviews().filter((r) => r.targetType === targetType && r.targetId === targetId))
  },

  async addReview(input: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    if (USE_REMOTE) return http<Review>('/reviews', { method: 'POST', body: JSON.stringify(input) })
    const review: Review = { ...input, id: uid('rev'), createdAt: new Date().toISOString() }
    store.setReviews([review, ...store.reviews()])
    // Пересчитываем рейтинг товара по новому отзыву
    const products = store.products()
    const pi = products.findIndex((p) => p.id === review.targetId)
    if (pi >= 0) {
      const forProduct = store.reviews().filter((r) => r.targetType === 'product' && r.targetId === review.targetId)
      const sum = forProduct.reduce((a, r) => a + r.rating, 0)
      products[pi] = {
        ...products[pi],
        rating: Math.round((sum / forProduct.length) * 10) / 10,
        reviewsCount: forProduct.length,
      }
      store.setProducts(products)
    }
    notify()
    return delay(review, 420)
  },

  /* — Пользователи — */
  async users(): Promise<User[]> {
    if (USE_REMOTE) return http<User[]>('/users')
    return delay(store.users())
  },

  async updateUser(id: string, patch: Partial<User>): Promise<User> {
    if (USE_REMOTE) return http<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    const users = store.users()
    const idx = users.findIndex((u) => u.id === id)
    if (idx < 0) throw new Error('Пользователь не найден')
    users[idx] = { ...users[idx], ...patch }
    store.setUsers(users)
    notify()
    return delay(users[idx])
  },

  /* — Заказы / эскроу — */
  async orders(role: 'buyer' | 'seller', userId: string): Promise<Order[]> {
    if (USE_REMOTE) return http<Order[]>(`/orders?role=${role}&userId=${userId}`)
    const all = store.orders()
    return delay(role === 'buyer' ? all.filter((o) => o.buyerId === userId) : all.filter((o) => o.sellerId === userId))
  },

  /* Покупка: деньги покупателя уходят в эскроу, лот снимается с продажи. */
  async createOrder(input: { productId: string; buyerId: string }): Promise<Order> {
    if (USE_REMOTE) return http<Order>('/orders', { method: 'POST', body: JSON.stringify(input) })
    const products = store.products()
    const pi = products.findIndex((x) => x.id === input.productId)
    if (pi < 0) throw new Error('Товар не найден')
    const p = products[pi]
    if (p.status === 'sold_out') throw new Error('Товар уже продан')

    const balance = store.balance()
    if (balance < p.price) throw new Error('Недостаточно средств на балансе')

    const order: Order = {
      id: `JW-${Math.floor(10_000 + Math.random() * 89_999)}`,
      productId: p.id,
      productTitle: p.title,
      gameId: p.gameId,
      buyerId: input.buyerId,
      sellerId: p.sellerId,
      amount: p.price,
      commission: Math.round(p.price * 0.05),
      status: 'paid',
      createdAt: new Date().toISOString(),
    }

    // Лот уходит в sold_out, счётчик продаж растёт
    products[pi] = { ...p, status: 'sold_out', inStock: 0, sold: p.sold + 1 }
    store.setProducts(products)
    store.setOrders([order, ...store.orders()])
    store.setBalance(balance - p.price)
    notify()
    return delay(order, 700)
  },

  /* Финал сделки: эскроу уходит продавцу за вычетом комиссии,
     либо возвращается покупателю при отмене/споре. */
  async setOrderStatus(id: string, status: Order['status']): Promise<Order> {
    if (USE_REMOTE) return http<Order>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    const orders = store.orders()
    const idx = orders.findIndex((o) => o.id === id)
    if (idx < 0) throw new Error('Заказ не найден')
    const before = orders[idx]

    if (status !== before.status) {
      // Завершение сделки — один раз
      if (status === 'confirmed' && !before.escrowReleasedAt) {
        store.setBalance(store.balance() + (before.amount - before.commission))
      }
      // Возврат покупателю
      if ((status === 'refunded' || status === 'dispute') && !before.escrowReleasedAt) {
        store.setBalance(store.balance() + before.amount)
      }
      // Возврат лота в продажу
      if (status === 'refunded' || status === 'dispute') {
        const products = store.products()
        const pi = products.findIndex((p) => p.id === before.productId)
        if (pi >= 0) {
          products[pi] = {
            ...products[pi],
            status: 'active',
            inStock: Math.max(1, products[pi].inStock),
            sold: Math.max(0, products[pi].sold - 1),
          }
          store.setProducts(products)
        }
      }
    }

    orders[idx] = {
      ...before,
      status,
      escrowReleasedAt: status === 'confirmed' ? new Date().toISOString() : before.escrowReleasedAt,
    }
    store.setOrders(orders)
    notify()
    return delay(orders[idx])
  },

  /* — Чат — */
  async threads(userId: string): Promise<ChatThread[]> {
    if (USE_REMOTE) return http<ChatThread[]>(`/chat/threads?userId=${userId}`)
    return delay(
      store.threads().filter((t) => t.buyerId === userId || t.sellerId === userId),
    )
  },

  async sendMessage(threadId: string, authorId: string, text: string): Promise<ChatMessage> {
    if (USE_REMOTE)
      return http<ChatMessage>(`/chat/threads/${threadId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
    const threads = store.threads()
    const idx = threads.findIndex((t) => t.id === threadId)
    if (idx < 0) throw new Error('Диалог не найден')
    const msg: ChatMessage = { id: uid('m'), authorId, text, createdAt: new Date().toISOString() }
    threads[idx] = {
      ...threads[idx],
      lastMessageAt: msg.createdAt,
      messages: [...threads[idx].messages, msg],
    }
    store.setThreads(threads)
    notify()
    return delay(msg, 120)
  },

  /* — Избранное — */
  async favorites(): Promise<string[]> {
    if (USE_REMOTE) return http<string[]>('/favorites')
    return delay(store.favorites(), 80)
  },
  async setFavorites(ids: string[]): Promise<string[]> {
    if (USE_REMOTE) return http<string[]>('/favorites', { method: 'PUT', body: JSON.stringify({ ids }) })
    store.setFavorites(ids)
    notify()
    return delay(ids, 80)
  },

  /* — Баланс — */
  async balance(): Promise<number> {
    if (USE_REMOTE) return http<{ balance: number }>('/wallet').then((r) => r.balance)
    return delay(store.balance(), 120)
  },
  async topUp(amount: number): Promise<number> {
    if (USE_REMOTE) return http<{ balance: number }>('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }).then((r) => r.balance)
    const next = store.balance() + amount
    store.setBalance(next)
    notify()
    return delay(next, 900)
  },

  /* — Админка — */
  async adminStats(): Promise<AdminStats> {
    if (USE_REMOTE) return http<AdminStats>('/admin/stats')
    return delay(ADMIN_STATS, 420)
  },
}

export type Api = typeof api
