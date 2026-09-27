import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui'
import { GridBackdrop, Particles } from '@/components/fx'

export function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center overflow-hidden">
      <GridBackdrop />
      <Particles count={20} />

      <div className="shell relative text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-display text-[7rem] leading-none text-glow sm:text-[11rem]"
        >
          404
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="h-display -mt-3 text-2xl sm:text-3xl"
        >
          Страница потерялась
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50"
        >
          Похоже, такой страницы не существует. Возможно, ссылка устарела или в адресе опечатка.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto" icon={<Home size={17} />}>
              На главную
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto" icon={<Search size={17} />}>
              В маркетплейс
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
