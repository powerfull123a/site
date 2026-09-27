import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 12 490 ₽ */
export function money(value: number, opts: { compact?: boolean } = {}) {
  if (opts.compact && value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M ₽`
  if (opts.compact && value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}K ₽`
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(value))} ₽`
}

/** 12 490 */
export function num(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

/** Пороги в миллисекундах — сравниваются с Date.now() − timestamp. */
const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000
const RELATIVE: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * DAY],
  ['month', 30 * DAY],
  ['week', 7 * DAY],
  ['day', DAY],
  ['hour', HOUR],
  ['minute', MINUTE],
  ['second', 1_000],
]

/** «3 часа назад» */
export function timeAgo(iso: string) {
  const ts = new Date(iso).getTime()
  if (Number.isNaN(ts)) return '—'
  const diff = Date.now() - ts
  const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })
  for (const [unit, ms] of RELATIVE) {
    if (Math.abs(diff) >= ms) return rtf.format(-Math.floor(diff / ms), unit)
  }
  return 'только что'
}

/** «12 авг 2026» */
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function plural(n: number, forms: [string, string, string]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]
  return forms[2]
}
