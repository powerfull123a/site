import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeApi } from './client'

/**
 * Загрузка данных через слой api с авто-перечитыванием.
 *
 * Любая мутация (заказ, чат, избранное, кошелёк, админка) вызывает
 * notify() в api/client.ts — и все живые экраны перезапрашивают данные.
 * Именно это эмулирует поведение real-time бэкенда без ручного рефетча
 * в каждом обработчике.
 */
export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): { data: T | null; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let stale = false
    setLoading(true)
    void fetcher().then((value) => {
      if (stale || !alive.current) return
      setData(value)
      setLoading(false)
    })
    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  useEffect(() => subscribeApi(reload), [reload])

  return { data, loading, reload }
}
