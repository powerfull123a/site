import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Role, User } from '@/types'
import { USERS } from '@/data/mock'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (name: string, email: string, password: string) => Promise<User>
  signInWithGoogle: () => Promise<User>
  signOut: () => void
  updateProfile: (patch: Partial<User>) => Promise<void>
  /** Смена роли для демонстрации кабинетов */
  switchRole: (role: Role) => void
  hasRole: (...roles: Role[]) => boolean
}

const KEY = 'jarwis:v1:session'

const AuthContext = createContext<AuthState | null>(null)

/** Кто залогинен при старте — берём из localStorage, иначе гостевой режим. */
function bootstrap(): User | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const id = JSON.parse(raw) as string
    return USERS.find((u) => u.id === id) ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(bootstrap)
  const [loading, setLoading] = useState(false)

  const persist = useCallback((u: User | null) => {
    setUser(u)
    try {
      if (u) localStorage.setItem(KEY, JSON.stringify(u.id))
      else localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const signIn = useCallback(
    async (email: string, _password: string) => {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 700))
      // Мок-логика: ищем пользователя по email, иначе создаём гостя
      const found = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
      const account: User = found ?? {
        ...USERS[1],
        id: 'u_guest',
        name: email.split('@')[0] || 'Гость',
        email,
        role: 'user',
        balance: 0,
      }
      persist(account)
      setLoading(false)
      return account
    },
    [persist],
  )

  const signUp = useCallback(
    async (name: string, email: string, _password: string) => {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 800))
      const account: User = {
        ...USERS[1],
        id: 'u_' + Math.random().toString(36).slice(2, 8),
        name,
        email,
        role: 'user',
        verified: false,
        rating: 0,
        reviewsCount: 0,
        dealsCount: 0,
        balance: 0,
        registeredAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      }
      persist(account)
      setLoading(false)
      return account
    },
    [persist],
  )

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    const account = { ...USERS[2], lastSeen: new Date().toISOString() }
    persist(account)
    setLoading(false)
    return account
  }, [persist])

  const signOut = useCallback(() => persist(null), [persist])

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      setUser((u) => (u ? { ...u, ...patch } : u))
    },
    [],
  )

  const switchRole = useCallback(
    (role: Role) => {
      setUser((u) => (u ? { ...u, role } : u))
    },
    [],
  )

  const hasRole = useCallback((...roles: Role[]) => (user ? roles.includes(user.role) : false), [user])

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signInWithGoogle, signOut, updateProfile, switchRole, hasRole }),
    [user, loading, signIn, signUp, signInWithGoogle, signOut, updateProfile, switchRole, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри <AuthProvider>')
  return ctx
}

/* ────────────── Глобальный счётчик непрочитанных чатов ────────────── */
export function useUnreadCount() {
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setCount(0)
      return
    }
    const key = `jarwis:v1:threads`
    const compute = () => {
      try {
        const raw = localStorage.getItem(key)
        if (!raw) {
          setCount(3)
          return
        }
        const threads = JSON.parse(raw) as { buyerId: string; sellerId: string; unread: number }[]
        setCount(
          threads
            .filter((t) => t.buyerId === user.id || t.sellerId === user.id)
            .reduce((a, t) => a + t.unread, 0),
        )
      } catch {
        setCount(0)
      }
    }
    compute()
    window.addEventListener('jarwis:chat', compute)
    window.addEventListener('storage', compute)
    return () => {
      window.removeEventListener('jarwis:chat', compute)
      window.removeEventListener('storage', compute)
    }
  }, [user])

  return count
}
