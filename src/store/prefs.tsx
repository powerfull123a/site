import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, subscribeApi } from '@/api/client'

/* ─────────────────────────────────────────────
   Избранное
   ───────────────────────────────────────────── */
interface FavState {
  ids: string[]
  ready: boolean
  has: (id: string) => boolean
  toggle: (id: string) => void
}

const FavContext = createContext<FavState | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    api.favorites().then((v) => {
      if (alive) {
        setIds(v)
        setReady(true)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
      void api.setFavorites(next)
      return next
    })
  }, [])

  const has = useCallback((id: string) => ids.includes(id), [ids])

  const value = useMemo(() => ({ ids, ready, has, toggle }), [ids, ready, has, toggle])
  return <FavContext.Provider value={value}>{children}</FavContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavContext)
  if (!ctx) throw new Error('useFavorites должен использоваться внутри <FavoritesProvider>')
  return ctx
}

/* ─────────────────────────────────────────────
   Баланс кошелька
   ───────────────────────────────────────────── */
interface WalletState {
  balance: number
  pending: boolean
  topUp: (amount: number) => Promise<void>
  refresh: () => Promise<void>
}

const WalletContext = createContext<WalletState | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0)
  const [pending, setPending] = useState(false)

  const refresh = useCallback(async () => {
    setBalance(await api.balance())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Любая мутация на стороне api меняет кошелёк — перечитываем баланс
  useEffect(() => subscribeApi(() => void refresh()), [refresh])

  const topUp = useCallback(async (amount: number) => {
    setPending(true)
    setBalance(await api.topUp(amount))
    setPending(false)
  }, [])

  const value = useMemo(() => ({ balance, pending, topUp, refresh }), [balance, pending, topUp, refresh])
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet должен использоваться внутри <WalletProvider>')
  return ctx
}
