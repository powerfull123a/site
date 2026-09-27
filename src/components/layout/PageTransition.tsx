import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/* ─────────────────────────────────────────────
   Переход между страницами
   ───────────────────────────────────────────── */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  )
}

/** Верхняя полоса прогресса при смене маршрута. */
export function RouteProgress() {
  const { pathname } = useLocation()

  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ scaleX: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
        className="fixed left-0 top-0 z-[80] h-0.5 w-full origin-left bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 shadow-[0_0_12px_rgba(244,63,79,0.8)]"
      />
    </AnimatePresence>
  )
}
