/* ─────────────────────────────────────────────
   Доменные типы Jarwis
   ───────────────────────────────────────────── */

import type { LucideIcon } from 'lucide-react'

/** Тип иконок lucide-react — чтобы компоненты принимали любую иконку. */
export type IconType = LucideIcon

export type Role = 'user' | 'seller' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: Role
  verified: boolean
  banned: boolean
  rating: number
  reviewsCount: number
  dealsCount: number
  /** Баланс пользователя в рублях */
  balance: number
  registeredAt: string
  lastSeen: string
  country: string
}

export type ProductCategory =
  | 'accounts'
  | 'skins'
  | 'currency'
  | 'boosts'
  | 'items'
  | 'keys'
  | 'services'

export interface Game {
  id: string
  slug: string
  title: string
  short: string
  emoji: string
  /** Градиентная подложка карточки игры */
  gradient: string
  players: string
  productsCount: number
}

export interface Product {
  id: string
  title: string
  gameId: string
  category: ProductCategory
  price: number
  /** Цена до скидки, если есть */
  oldPrice?: number
  sellerId: string
  rating: number
  reviewsCount: number
  /** Продано за последние 30 дней */
  sold: number
  /** Визуальный градиент превью */
  preview: string
  emoji: string
  description: string
  features: string[]
  deliveryMinutes: number
  /** Гарантия/возврат в днях */
  warrantyDays: number
  instantDelivery: boolean
  inStock: number
  tags: string[]
  createdAt: string
  status: 'active' | 'moderation' | 'banned' | 'sold_out'
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'in_progress'
  | 'delivered'
  | 'confirmed'
  | 'dispute'
  | 'refunded'

export interface Order {
  id: string
  productId: string
  productTitle: string
  gameId: string
  buyerId: string
  sellerId: string
  amount: number
  commission: number
  status: OrderStatus
  createdAt: string
  /** Данные, которые вводит покупатель для передачи (логин и т.д.) */
  deliveryData?: string
  escrowReleasedAt?: string
}

export interface Review {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  targetType: 'product' | 'seller'
  targetId: string
  rating: number
  text: string
  createdAt: string
  /** Ответ продавца */
  reply?: string
}

export interface ChatThread {
  id: string
  orderId?: string
  buyerId: string
  sellerId: string
  unread: number
  lastMessageAt: string
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  authorId: string
  text: string
  createdAt: string
  system?: boolean
}

export interface Tariff {
  id: string
  name: string
  tagline: string
  price: number
  oldPrice?: number
  period: string
  popular?: boolean
  features: { text: string; included: boolean }[]
  cta: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface LandingContent {
  heroTitle: string
  heroSubtitle: string
  announcement: string
  promoBanner: { title: string; text: string; cta: string }
  stats: { value: number; suffix: string; label: string }[]
}

export interface AdminStats {
  revenue: number[]
  signups: number[]
  orders: number[]
  labels: string[]
}
